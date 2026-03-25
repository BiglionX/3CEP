'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import type { Skill } from '@/types/skill';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SkillAuditPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [auditReason, setAuditReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [auditAction, setAuditAction] = useState<'approve' | 'reject' | null>(
    null
  );

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-audit')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载待审核的 Skills
  const loadPendingSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/admin/skill-store/list?reviewStatus=pending&page=1&pageSize=50'
      );
      const result = await response.json();

      if (result.success) {
        setSkills(result.data);
      } else {
        console.error('加载失败:', result.error);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadPendingSkills();
    }
  }, [isAuthenticated, is_admin]);

  // 处理批量审核
  const handleBatchApprove = async (action: 'approve' | 'reject') => {
    if (selectedSkills.length === 0) {
      alert('请至少选择一个 Skill');
      return;
    }

    if (action === 'reject' && !auditReason.trim()) {
      alert('请输入驳回原因');
      return;
    }

    try {
      const response = await fetch('/api/admin/skill-store/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillIds: selectedSkills,
          action,
          reason: auditReason.trim() || '批量操作',
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `成功${action === 'approve' ? '通过' : '驳回'} ${selectedSkills.length} 个 Skill`
        );
        setSelectedSkills([]);
        setAuditReason('');
        setShowReasonInput(false);
        loadPendingSkills();
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error: any) {
      console.error('批量审核失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 全选/取消全选
  const handleToggleAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills.map(s => s.id));
    }
  };

  // 单个选择
  const handleToggleOne = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Skill 审核</h1>
          <p className="mt-1 text-sm text-gray-500">
            审核新提交的 Skills，当前共 {skills.length} 个待审核
          </p>
        </div>
        <button
          onClick={loadPendingSkills}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          刷新
        </button>
      </div>

      {/* 批量操作栏 */}
      {selectedSkills.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                已选择 {selectedSkills.length} 个 Skill
              </span>
              {!showReasonInput && (
                <>
                  <button
                    onClick={() => {
                      setAuditAction('approve');
                      handleBatchApprove('approve');
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    批量通过
                  </button>
                  <button
                    onClick={() => setShowReasonInput(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    批量驳回
                  </button>
                </>
              )}
            </div>
            {showReasonInput && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={auditReason}
                  onChange={e => setAuditReason(e.target.value)}
                  placeholder="请输入驳回原因"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={() => handleBatchApprove('reject')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  确认驳回
                </button>
                <button
                  onClick={() => {
                    setShowReasonInput(false);
                    setAuditReason('');
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills 列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无待审核的 Skills</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSkills.length === skills.length}
                      onChange={handleToggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    版本
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提交时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skills.map(skill => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => handleToggleOne(skill.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {skill.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {skill.name_en}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {skill.version}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(skill.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSkills([skill.id]);
                          handleBatchApprove('approve');
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSkills([skill.id]);
                          setAuditAction('reject');
                          setShowReasonInput(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        驳回
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>勾选需要批量审核的 Skills</li>
          <li>点击「批量通过」或「批量驳回」按钮</li>
          <li>驳回时需要填写驳回原因</li>
          <li>审核通过后 Skill 将自动上架</li>
        </ul>
      </div>
    </div>
  );
}
