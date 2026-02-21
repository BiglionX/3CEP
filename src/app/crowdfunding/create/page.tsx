"use client";

import { useCrowdfundingAuth } from "@/hooks/use-auth";
import { CrowdfundingProjectService } from "@/services/crowdfunding/project-service";
import { CrowdfundingRewardService } from "@/services/crowdfunding/reward-service";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateProjectPage() {
  const router = useRouter();
  const { user, isAuthenticated, canCreateProject } = useCrowdfundingAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    product_model: "",
    old_models: "",
    target_amount: "",
    min_pledge_amount: "100",
    max_pledge_amount: "",
    start_date: "",
    end_date: "",
    delivery_date: "",
    cover_image_url: "",
    category: "",
    tags: "",
    risk_info: "",
  });

  const [rewards, setRewards] = useState<
    Array<{
      title: string;
      description: string;
      minimum_amount: string;
      quantity_limit: string;
      delivery_estimate: string;
    }>
  >([
    {
      title: "",
      description: "",
      minimum_amount: "",
      quantity_limit: "",
      delivery_estimate: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: 基本信息, 2: 回报设置, 3: 预览发布

  // 检查用户权限
  const checkPermission = async () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return false;
    }

    const hasPermission = await canCreateProject();
    if (!hasPermission) {
      setError("您没有创建项目的权限");
      return false;
    }

    return true;
  };

  // 处理表单输入
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 处理回报设置
  const handleRewardChange = (index: number, field: string, value: string) => {
    const newRewards = [...rewards];
    newRewards[index] = {
      ...newRewards[index],
      [field]: value,
    };
    setRewards(newRewards);
  };

  // 添加新的回报设置
  const addReward = () => {
    setRewards((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        minimum_amount: "",
        quantity_limit: "",
        delivery_estimate: "",
      },
    ]);
  };

  // 删除回报设置
  const removeReward = (index: number) => {
    if (rewards.length > 1) {
      setRewards((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 提交项目创建
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await checkPermission())) return;

    // 验证必填字段
    if (
      !formData.title ||
      !formData.description ||
      !formData.product_model ||
      !formData.target_amount ||
      !formData.category ||
      !formData.start_date ||
      !formData.end_date
    ) {
      setError("请填写所有必填字段");
      return;
    }

    // 验证日期逻辑
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const deliveryDate = formData.delivery_date
      ? new Date(formData.delivery_date)
      : null;

    if (endDate <= startDate) {
      setError("结束时间必须晚于开始时间");
      return;
    }

    if (deliveryDate && deliveryDate <= endDate) {
      setError("交付时间必须晚于结束时间");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 创建项目
      const projectData = {
        title: formData.title,
        description: formData.description,
        product_model: formData.product_model,
        old_models: formData.old_models
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        target_amount: parseFloat(formData.target_amount),
        min_pledge_amount: parseFloat(formData.min_pledge_amount),
        max_pledge_amount: formData.max_pledge_amount
          ? parseFloat(formData.max_pledge_amount)
          : undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        delivery_date: formData.delivery_date || undefined,
        cover_image_url: formData.cover_image_url || undefined,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        risk_info: formData.risk_info || undefined,
      };

      const project = await CrowdfundingProjectService.createProject(
        projectData,
        user!.id
      );

      // 创建回报设置
      for (const reward of rewards) {
        if (reward.title && reward.minimum_amount) {
          await CrowdfundingRewardService.createReward(
            {
              project_id: project.id,
              title: reward.title,
              description: reward.description,
              minimum_amount: parseFloat(reward.minimum_amount),
              quantity_limit: reward.quantity_limit
                ? parseInt(reward.quantity_limit)
                : undefined,
              delivery_estimate: reward.delivery_estimate || undefined,
              is_digital: false,
            },
            user!.id
          );
        }
      }

      // 跳转到项目详情页
      router.push(`/crowdfunding/${project.id}`);
    } catch (err: any) {
      setError(err.message || "创建项目失败");
      console.error("创建项目失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 步骤导航
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= num
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {num}
          </div>
          {num < 3 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step > num ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">您需要登录后才能创建项目</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">发起众筹项目</h1>
          <p className="mt-2 text-gray-600">填写项目信息，吸引支持者</p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">操作失败</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 第一步：基本信息 */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  项目基本信息
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目标题 *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入项目标题"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目描述 *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="详细描述您的项目..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品型号 *
                    </label>
                    <input
                      type="text"
                      name="product_model"
                      value={formData.product_model}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="如：SmartPhone-Pro-X1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      兼容旧机型
                    </label>
                    <input
                      type="text"
                      name="old_models"
                      value={formData.old_models}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="多个型号用逗号分隔"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      如：iPhone 14,iPhone 15,Samsung Galaxy S23
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目标金额 (元) *
                    </label>
                    <input
                      type="number"
                      name="target_amount"
                      value={formData.target_amount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目分类 *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">请选择分类</option>
                      <option value="手机配件">手机配件</option>
                      <option value="电脑硬件">电脑硬件</option>
                      <option value="智能家居">智能家居</option>
                      <option value="数码产品">数码产品</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      开始时间 *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束时间 *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                      min={
                        formData.start_date ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      封面图片URL
                    </label>
                    <input
                      type="url"
                      name="cover_image_url"
                      value={formData.cover_image_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目标签
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="多个标签用逗号分隔"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 第二步：回报设置 */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  回报设置
                </h2>

                <div className="space-y-6">
                  {rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 relative"
                    >
                      {rewards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeReward(index)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            回报标题 *
                          </label>
                          <input
                            type="text"
                            value={reward.title}
                            onChange={(e) =>
                              handleRewardChange(index, "title", e.target.value)
                            }
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="如：早鸟优惠"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            回报描述
                          </label>
                          <textarea
                            value={reward.description}
                            onChange={(e) =>
                              handleRewardChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="描述此回报的具体内容..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            最低支持金额 (元) *
                          </label>
                          <input
                            type="number"
                            value={reward.minimum_amount}
                            onChange={(e) =>
                              handleRewardChange(
                                index,
                                "minimum_amount",
                                e.target.value
                              )
                            }
                            required
                            min="1"
                            step="10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="99"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            数量限制
                          </label>
                          <input
                            type="number"
                            value={reward.quantity_limit}
                            onChange={(e) =>
                              handleRewardChange(
                                index,
                                "quantity_limit",
                                e.target.value
                              )
                            }
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="不限制则留空"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            预计交付时间
                          </label>
                          <input
                            type="date"
                            value={reward.delivery_estimate}
                            onChange={(e) =>
                              handleRewardChange(
                                index,
                                "delivery_estimate",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addReward}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                  >
                    + 添加更多回报设置
                  </button>
                </div>
              </div>
            )}

            {/* 第三步：预览和发布 */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  项目预览
                </h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    项目概览
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">项目标题:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">产品型号:</span>
                      <span className="font-medium">
                        {formData.product_model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">目标金额:</span>
                      <span className="font-medium text-green-600">
                        ¥
                        {parseFloat(
                          formData.target_amount || "0"
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">众筹周期:</span>
                      <span className="font-medium">
                        {new Date(formData.start_date).toLocaleDateString()} -{" "}
                        {new Date(formData.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">项目分类:</span>
                      <span className="font-medium">{formData.category}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        重要提醒
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>项目创建后初始状态为"草稿"</li>
                          <li>您可以在草稿状态下继续编辑和完善项目</li>
                          <li>准备好后可以发布项目开始众筹</li>
                          <li>项目一旦发布就不能再修改基本信息</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 rounded-lg font-medium ${
                  step === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                上一步
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  下一步
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      创建中...
                    </>
                  ) : (
                    "创建项目"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
