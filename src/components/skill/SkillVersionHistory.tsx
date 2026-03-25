'use client';

import { useState } from 'react';

interface VersionHistory {
  id: string;
  new_version: string;
  old_version?: string;
  created_at: string;
  changed_by?: string;
  admin_users?: { email: string } | null;
  changes?: any;
  review_status?: string;
  shelf_status?: string;
}

interface SkillVersionHistoryProps {
  versions: VersionHistory[];
  onRollback?: (versionId: string) => void;
}

export function SkillVersionHistory({
  versions,
  onRollback,
}: SkillVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showChanges, setShowChanges] = useState<Record<string, boolean>>({});

  // 格式化状态
  const formatStatus = (reviewStatus?: string, shelfStatus?: string) => {
    if (!reviewStatus) return null;

    const statusMap: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回',
    };

    const shelfMap: Record<string, string> = {
      on_shelf: '已上架',
      off_shelf: '已下架',
      suspended: '已暂停',
    };

    return `${statusMap[reviewStatus] || reviewStatus} · ${shelfMap[shelfStatus] || shelfStatus}`;
  };

  // 解析变更内容
  const parseChanges = (changes: any) => {
    if (!changes) return [];

    try {
      if (typeof changes === 'string') {
        changes = JSON.parse(changes);
      }

      return Object.entries(changes).map(([field, change]: [string, any]) => ({
        field,
        from: change?.from || 'N/A',
        to: change?.to || 'N/A',
      }));
    } catch {
      return [];
    }
  };

  // 切换变更详情显示
  const toggleChanges = (versionId: string) => {
    setShowChanges(prev => ({
      ...prev,
      [versionId]: !prev[versionId],
    }));
  };

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">暂无版本历史记录</div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">版本历史</h3>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {versions.map((version, index) => (
            <li key={version.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600">
                      v{version.new_version}
                    </span>
                    {index === 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        当前版本
                      </span>
                    )}
                    {formatStatus(
                      version.review_status,
                      version.shelf_status
                    ) && (
                      <span className="text-xs text-gray-500">
                        {formatStatus(
                          version.review_status,
                          version.shelf_status
                        )}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    <span>
                      创建于{' '}
                      {new Date(version.created_at).toLocaleString('zh-CN')}
                    </span>
                    {version.admin_users?.email && (
                      <span> · 由 {version.admin_users.email} 修改</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 查看变更按钮 */}
                  {version.changes && (
                    <button
                      onClick={() => toggleChanges(version.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {showChanges[version.id] ? '隐藏变更' : '查看变更'}
                    </button>
                  )}

                  {/* 回滚按钮 (仅非当前版本) */}
                  {index > 0 && onRollback && (
                    <button
                      onClick={() => onRollback(version.id)}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      title="回滚到此版本"
                    >
                      回滚
                    </button>
                  )}
                </div>
              </div>

              {/* 变更详情 */}
              {showChanges[version.id] && version.changes && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">
                    变更内容:
                  </h4>
                  <div className="space-y-1">
                    {parseChanges(version.changes).map((change, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-medium text-gray-600">
                          {change.field}:
                        </span>
                        <div className="ml-4 mt-1 space-y-0.5">
                          <div className="text-red-600">
                            <span className="mr-2">→</span>
                            <span className="line-through">
                              {String(change.from)}
                            </span>
                          </div>
                          <div className="text-green-600">
                            <span className="mr-2">→</span>
                            <span>{String(change.to)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 版本统计信息 */}
      <div className="text-xs text-gray-500">
        共 {versions.length} 个版本 · 最早版本：
        {versions[versions.length - 1]?.new_version} · 最新修改：
        {new Date(versions[0]?.created_at).toLocaleString('zh-CN')}
      </div>
    </div>
  );
}
