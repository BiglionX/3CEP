'use client';

import { useCrowdfundingAuth } from '@/hooks/use-auth';
import { CrowdfundingFcxPaymentService } from '@/services/crowdfunding/fcx-payment.service';
import { CrowdfundingPledgeService } from '@/services/crowdfunding/pledge-service';
import { CrowdfundingProjectService } from '@/services/crowdfunding/project-service';
import { CrowdfundingRewardService } from '@/services/crowdfunding/reward-service';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  product_model: string;
  old_models: string[];
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  min_pledge_amount: number;
  max_pledge_amount: number | null;
  cover_image_url: string;
  images: string[];
  video_url: string | null;
  category: string;
  tags: string[];
  risk_info: string | null;
  faq: any;
  creator_id: string;
  start_date: string;
  end_date: string;
  delivery_date: string | null;
  created_at: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  minimum_amount: number;
  quantity_limit: number | null;
  available_count: number | null;
  is_available: boolean;
  delivery_estimate: string | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // FCX支付相关状态
  const [fcxBalance, setFcxBalance] = useState(0);
  const [useFcxPayment, setUseFcxPayment] = useState(false);
  const [fcxPaymentAmount, setFcxPaymentAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const { user, isAuthenticated } = useCrowdfundingAuth();

  // 获取用户FCX余额
  const fetchUserFcxBalance = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await fetch('/api/users/fcx-balance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('crowdfunding-token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFcxBalance(result.data.fcxBalance);
        }
      }
    } catch (error) {
      console.error('获取FCX余额失败:', error);
    }
  };

  // 获取项目详情
  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const projectData =
        await CrowdfundingProjectService.getProjectById(projectId);
      setProject(projectData);

      // 获取回报设置
      const rewardsData =
        await CrowdfundingRewardService.getProjectRewards(projectId);
      setRewards(rewardsData);

      // 设置默认金额
      if (rewardsData.length > 0) {
        setSelectedAmount(rewardsData[0].minimum_amount.toString());
        setSelectedReward(rewardsData[0]);
      } else {
        setSelectedAmount(projectData.min_pledge_amount.toString());
      }
    } catch (err: any) {
      setError(err.message || '获取项目详情失败');
      console.error('获取项目详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
      if (isAuthenticated && user) {
        fetchUserFcxBalance();
      }
    }
  }, [projectId, isAuthenticated, user]);

  // 处理FCX支付
  const handleFcxPayment = async () => {
    if (!user) return;

    setPaymentProcessing(true);
    try {
      const response = await fetch('/api/crowdfunding/payments/fcx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('crowdfunding-token')}`,
        },
        body: JSON.stringify({
          pledgeId: (window as any).currentPledgeId,
          fcxAmount: fcxPaymentAmount,
          useHybridPayment: true, // 使用混合支付
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 支付成功，更新UI
        setShowPaymentModal(false);
        router.push(
          `/crowdfunding/successpledgeId=${
            (window as any).currentPledgeId
          }&payment=fcx`
        );
      } else {
        alert(`支付失败: ${result.message}`);
      }
    } catch (error) {
      console.error('FCX支付错误:', error);
      alert('支付处理失败，请重试');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // 处理预定
  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (!selectedAmount || parseFloat(selectedAmount) <= 0) {
      alert('请输入有效的支持金额');
      return;
    }

    const amount = parseFloat(selectedAmount);

    // 验证金额范围
    if (amount < (project.min_pledge_amount || 0)) {
      alert(`支持金额不能低于 ${project.min_pledge_amount} 元`);
      return;
    }

    if (project.max_pledge_amount && amount > project.max_pledge_amount) {
      alert(`支持金额不能超过 ${project.max_pledge_amount} 元`);
      return;
    }

    // 验证回报选择
    if (selectedReward) {
      const validation = await CrowdfundingRewardService.validateReward(
        selectedReward.id,
        amount
      );

      if (!validation.valid) {
        alert(validation.message);
        return;
      }
    }

    setBookingLoading(true);
    try {
      const pledgeData = {
        project_id: projectId,
        amount: amount,
        pledge_type: 'reservation' as const,
        reward_level: selectedReward.title,
      };

      const result = await CrowdfundingPledgeService.createPledge(
        pledgeData,
        user.id
      );

      // 存储pledgeId用于后续支付
      (window as any).currentPledgeId = result.id;

      // 如果启用FCX支付且有余额，显示支付选项
      if (useFcxPayment && fcxBalance > 0) {
        const paymentAdvice =
          CrowdfundingFcxPaymentService.calculateFcxPaymentAdvice(
            parseFloat(selectedAmount),
            fcxBalance
          );
        setFcxPaymentAmount(
          Math.min(
            fcxPaymentAmount || paymentAdvice.suggestedFcx * 10,
            fcxBalance
          )
        );
        setShowPaymentModal(true);
      } else {
        // 直接跳转到成功页面
        router.push(`/crowdfunding/successpledgeId=${result.id}`);
      }
    } catch (err: any) {
      alert(err.message || '预定失败，请重试');
      console.error('预定失败:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  // 格式化货币显示
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 计算剩余天数
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0  diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">项目不存在</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error || '找不到该项目'}
          </p>
          <div className="mt-6">
            <Link
              href="/crowdfunding"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              返回项目列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 项目头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/crowdfunding"
            className="text-blue-600 hover:text-blue-500 flex items-center mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回项目列表
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 项目图片 */}
            <div className="lg:w-1/2">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {project.cover_image_url  (
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">暂无图片</span>
                  </div>
                )}
              </div>

              {project.images && project.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {project.images.slice(0, 5).map((image, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-gray-200 rounded overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`项目图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 项目信息和预定 */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {project.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">
                    {project.title}
                  </h1>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600">{project.description}</p>
                </div>

                {/* 筹集进度 */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>已筹金额</span>
                    <span>目标金额</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(project.current_amount)}
                    </span>
                    <span className="text-xl text-gray-500">
                      {formatCurrency(project.target_amount)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(project.progress_percentage, 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="font-medium">
                      {project.progress_percentage}% 达成
                    </span>
                    <span>剩余 {getDaysRemaining(project.end_date)} 天</span>
                  </div>
                </div>

                {/* 预定表单 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">支持此项目</h3>

                  {/* 金额输入 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      支持金额 (¥)
                    </label>
                    <input
                      type="number"
                      value={selectedAmount}
                      onChange={e => {
                        setSelectedAmount(e.target.value);
                        // 自动选择合适的回报
                        const amount = parseFloat(e.target.value);
                        if (!isNaN(amount)) {
                          const suitableReward = rewards
                            .filter(r => r.is_available)
                            .find(r => amount >= r.minimum_amount);
                          setSelectedReward(suitableReward || null);
                        }
                      }}
                      min={project.min_pledge_amount}
                      max={project.max_pledge_amount || undefined}
                      step="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`最低 ${project.min_pledge_amount} 元`}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      最低支持 {formatCurrency(project.min_pledge_amount)}
                      {project.max_pledge_amount &&
                        `，最高 ${formatCurrency(project.max_pledge_amount)}`}
                    </p>
                  </div>

                  {/* 回报选择 */}
                  {rewards.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择回报
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {rewards
                          .filter(r => r.is_available)
                          .map(reward => (
                            <div
                              key={reward.id}
                              onClick={() => {
                                setSelectedReward(reward);
                                setSelectedAmount(
                                  reward.minimum_amount.toString()
                                );
                              }}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedReward.id === reward.id
                                   'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {reward.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {reward.description}
                                  </p>
                                  {reward.delivery_estimate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      预计交付:{' '}
                                      {new Date(
                                        reward.delivery_estimate
                                      ).toLocaleDateString('zh-CN')}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-blue-600">
                                    ≥{formatCurrency(reward.minimum_amount)}
                                  </div>
                                  {reward.quantity_limit && (
                                    <div className="text-xs text-gray-500">
                                      剩余: {reward.available_count} 份
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* 无回报选项 */}
                        <div
                          onClick={() => setSelectedReward(null)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            !selectedReward
                               'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <span className="font-medium text-gray-900">
                              仅支持，不需要回报
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FCX支付选项 */}
                  {fcxBalance > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-blue-900">
                            FCX支付选项
                          </h4>
                          <p className="text-sm text-blue-700">
                            您有 {fcxBalance} FCX 可用 (
                            {(fcxBalance / 10).toFixed(2)} USD)
                          </p>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={useFcxPayment}
                            onChange={e => setUseFcxPayment(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            使用FCX支付
                          </span>
                        </label>
                      </div>

                      {useFcxPayment && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              使用FCX数量
                            </label>
                            <input
                              type="number"
                              value={fcxPaymentAmount}
                              onChange={e =>
                                setFcxPaymentAmount(
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                              max={fcxBalance}
                              step="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              约 {(fcxPaymentAmount / 10).toFixed(2)}{' '}
                              USD，剩余法币需支付{' '}
                              {(
                                parseFloat(selectedAmount) -
                                fcxPaymentAmount / 10
                              ).toFixed(2)}{' '}
                              USD
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setShowBookingModal(true)}
                    disabled={
                      !selectedAmount || parseFloat(selectedAmount) <= 0
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    立即预定
                  </button>

                  <p className="mt-3 text-center text-sm text-gray-500">
                    预定后将跳转到支付页面
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 项目详情内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 产品信息 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">产品信息</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">产品型号:</span>
                  <span className="ml-2 text-gray-900">
                    {project.product_model}
                  </span>
                </div>

                {project.old_models && project.old_models.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">兼容机型:</span>
                    <span className="ml-2 text-gray-900">
                      {project.old_models.join(', ')}
                    </span>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">开始时间:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(project.start_date).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                <div>
                  <span className="font-medium text-gray-700">结束时间:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(project.end_date).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                {project.delivery_date && (
                  <div>
                    <span className="font-medium text-gray-700">预计交付:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(project.delivery_date).toLocaleDateString(
                        'zh-CN'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 项目标签 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">项目标签</h2>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.risk_info && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">风险提示</h3>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                    {project.risk_info}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 预定确认模态框 */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">确认预定</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">项目名称:</span>
                <span className="font-medium">{project.title}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">支持金额:</span>
                <span className="font-medium text-lg text-blue-600">
                  {formatCurrency(parseFloat(selectedAmount))}
                </span>
              </div>

              {selectedReward && (
                <div className="flex justify-between">
                  <span className="text-gray-600">选择回报:</span>
                  <span className="font-medium">{selectedReward.title}</span>
                </div>
              )}

              {useFcxPayment && fcxPaymentAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">FCX支付:</span>
                  <span className="font-medium text-green-600">
                    {fcxPaymentAmount} FCX ({(fcxPaymentAmount / 10).toFixed(2)}{' '}
                    USD)
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>

              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {bookingLoading  (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    处理中...
                  </>
                ) : (
                  '确认预定'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FCX支付模态框 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">FCX支付确认</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">支付详情</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">总金额:</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(selectedAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">FCX支付:</span>
                    <span className="font-medium text-green-600">
                      {fcxPaymentAmount} FCX
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">FCX价值:</span>
                    <span className="font-medium">
                      {(fcxPaymentAmount / 10).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">需法币支付:</span>
                    <span className="font-medium">
                      {(
                        parseFloat(selectedAmount) -
                        fcxPaymentAmount / 10
                      ).toFixed(2)}{' '}
                      USD
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                确认使用 {fcxPaymentAmount} FCX
                支付部分金额，并通过法币支付剩余部分。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>

              <button
                onClick={handleFcxPayment}
                disabled={paymentProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {paymentProcessing  (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    支付中...
                  </>
                ) : (
                  '确认支付'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
