'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import type { Skill } from '@/types/skill';
import {
  Archive,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Shield,
  Upload,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ShelfSkill extends Skill {
  developer_email?: string;
}

export default function SkillShelfManagementPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState<
    'pending' | 'on-shelf' | 'off-shelf'
  >('pending');
  const [skills, setSkills] = useState<ShelfSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [batchOperationLoading, setBatchOperationLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedSkillForReject, setSelectedSkillForReject] = useState<
    string | null
  >(null);

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-store/shelf-management')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadSkills();
    }
  }, [activeTab, isAuthenticated, is_admin]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      switch (activeTab) {
        case 'pending':
          endpoint = '/api/admin/skill-store/shelf/pending';
          break;
        case 'on-shelf':
          endpoint = '/api/admin/skill-store/shelf/on-shelf';
          break;
        case 'off-shelf':
          endpoint = '/api/admin/skill-store/shelf/off-shelf';
          break;
      }

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        setSkills(result.data || []);
      } else {
        console.error('加载失败:', result.error);
        setSkills([]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  // 批量操作
  const handleBatchApprove = async () => {
    if (selectedSkills.length === 0) return;

    setBatchOperationLoading(true);
    try {
      const response = await fetch(
        '/api/admin/skill-store/batch-shelf-approve',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillIds: selectedSkills,
            action: 'approve',
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert(`成功上架 ${selectedSkills.length} 个 Skill`);
        setSelectedSkills([]);
        loadSkills();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('批量上架失败:', error);
      alert('操作失败，请重试');
    } finally {
      setBatchOperationLoading(false);
    }
  };

  const handleBatchRemove = async () => {
    if (selectedSkills.length === 0) return;

    if (!confirm(`确定要下架选中的 ${selectedSkills.length} 个 Skill 吗？`)) {
      return;
    }

    setBatchOperationLoading(true);
    try {
      const response = await fetch(
        '/api/admin/skill-store/batch-shelf-remove',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillIds: selectedSkills,
            reason: '批量下架',
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert(`成功下架 ${selectedSkills.length} 个 Skill`);
        setSelectedSkills([]);
        loadSkills();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('批量下架失败:', error);
      alert('操作失败，请重试');
    } finally {
      setBatchOperationLoading(false);
    }
  };

  // 单个操作
  const handleApprove = async (skillId: string) => {
    try {
      const response = await fetch('/api/admin/skill-store/shelf-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId }),
      });

      const result = await response.json();
      if (result.success) {
        alert('上架成功');
        loadSkills();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('上架失败:', error);
      alert('操作失败，请重试');
    }
  };

  const handleRemove = async (skillId: string) => {
    setSelectedSkillForReject(skillId);
    setShowRejectModal(true);
  };

  const confirmRemove = async () => {
    if (!selectedSkillForReject) return;

    try {
      const response = await fetch('/api/admin/skill-store/shelf-remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: selectedSkillForReject,
          reason: rejectReason || '管理员下架',
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('下架成功');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedSkillForReject(null);
        loadSkills();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('下架失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills.map(s => s.id));
    }
  };

  // 单选
  const toggleSelect = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  // 状态标签配置
  const statusConfig = {
    review_status: {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '待审核' },
      approved: { color: 'bg-green-100 text-green-800', label: '已通过' },
      rejected: { color: 'bg-red-100 text-red-800', label: '已驳回' },
    },
    shelf_status: {
      on_shelf: { color: 'bg-green-100 text-green-800', label: '已上架' },
      off_shelf: { color: 'bg-gray-100 text-gray-800', label: '已下架' },
      suspended: { color: 'bg-red-100 text-red-800', label: '已暂停' },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !is_admin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">上下架管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理 Skill 的上架和下架状态
          </p>
        </div>
        <Link
          href="/admin/skill-store"
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
        >
          返回列表
        </Link>
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="inline w-4 h-4 mr-2" />
            待上架审核 (
            {skills.filter(s => s.shelf_status === 'off_shelf').length})
          </button>
          <button
            onClick={() => setActiveTab('on-shelf')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'on-shelf'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="inline w-4 h-4 mr-2" />
            已上架 ({skills.filter(s => s.shelf_status === 'on_shelf').length})
          </button>
          <button
            onClick={() => setActiveTab('off-shelf')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'off-shelf'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Archive className="inline w-4 h-4 mr-2" />
            已下架 ({skills.filter(s => s.shelf_status !== 'on_shelf').length})
          </button>
        </nav>
      </div>

      {/* 批量操作栏 */}
      {selectedSkills.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-800">
            已选择 {selectedSkills.length} 个 Skill
          </span>
          <div className="flex items-center space-x-3">
            {activeTab === 'pending' && (
              <button
                onClick={handleBatchApprove}
                disabled={batchOperationLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                批量上架
              </button>
            )}
            {(activeTab === 'on-shelf' || activeTab === 'pending') && (
              <button
                onClick={handleBatchRemove}
                disabled={batchOperationLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                批量下架
              </button>
            )}
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedSkills.length === skills.length &&
                      skills.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Skill 信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  版本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  开发者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : skills.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无数据
                  </td>
                </tr>
              ) : (
                skills.map(skill => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => toggleSelect(skill.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {skill.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {skill.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      v{skill.version || '1.0.0'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig.review_status[skill.review_status]
                              ?.color
                          }`}
                        >
                          {
                            statusConfig.review_status[skill.review_status]
                              ?.label
                          }
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig.shelf_status[skill.shelf_status]?.color
                          }`}
                        >
                          {statusConfig.shelf_status[skill.shelf_status]?.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {skill.developer_email || '未知'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(skill.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/skill-store/${skill.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(skill.id)}
                              className="text-green-600 hover:text-green-800"
                              title="上架"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(skill.id)}
                              className="text-red-600 hover:text-red-800"
                              title="下架"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {activeTab === 'on-shelf' && (
                          <button
                            onClick={() => handleRemove(skill.id)}
                            className="text-red-600 hover:text-red-800"
                            title="下架"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        {activeTab === 'off-shelf' &&
                          skill.shelf_rejection_reason && (
                            <div
                              className="text-xs text-gray-500 max-w-[150px] truncate"
                              title={skill.shelf_rejection_reason}
                            >
                              {skill.shelf_rejection_reason}
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 下架原因模态框 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              下架原因
            </h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="请输入下架原因（必填）"
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedSkillForReject(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmRemove}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认下架
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
