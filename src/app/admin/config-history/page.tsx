'use client';

import { useEffect, useState } from 'react';

interface ConfigVersion {
  id: string;
  agent_id: string;
  version_number: number;
  config_data: any;
  change_summary: string;
  created_by: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ComparisonData {
  version1: any;
  version2: any;
  comparison: any;
  textReport: string;
}

export default function ConfigHistoryPage() {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const res = await fetch('/api/admin/config-history?limit=50');
      const result = await res.json();

      if (result.success) {
        setVersions(result.data);
      }
    } catch (error) {
      console.error('获取配置历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;

    setComparing(true);
    try {
      const res = await fetch(
        `/api/admin/config-history/compare?versionId1=${selectedVersions[0]}&versionId2=${selectedVersions[1]}`
      );
      const result = await res.json();

      if (result.success) {
        setComparisonData(result.data);
        setShowCompareModal(true);
      }
    } catch (error) {
      console.error('对比失败:', error);
      alert('对比失败，请重试');
    } finally {
      setComparing(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('确定要回滚到此版本吗？此操作将覆盖当前配置。')) return;

    try {
      // TODO: 实现回滚逻辑
      alert('回滚功能开发中...');
    } catch (error) {
      console.error('回滚失败:', error);
      alert('回滚失败，请重试');
    }
  };

  const getVersionBadgeColor = (index: number) => {
    if (index === 0) return 'bg-green-100 text-green-800'; // 最新版本
    if (index === 1) return 'bg-blue-100 text-blue-800'; // 次新版本
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">配置历史管理</h1>
        <p className="text-gray-600">
          查看配置变更历史，对比版本差异，支持可视化回滚
        </p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">配置版本总数</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {versions.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">已选择版本</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {selectedVersions.length}/2
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">最早版本时间</h3>
          <p className="text-lg font-semibold mt-2">
            {versions.length > 0
              ? new Date(
                  versions[versions.length - 1].created_at
                ).toLocaleString('zh-CN')
              : '-'}
          </p>
        </div>
      </div>

      {/* 操作提示 */}
      {selectedVersions.length === 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-blue-800">
              ✅ 已选择 2 个版本，可以进行对比
            </p>
            <button
              onClick={handleCompare}
              disabled={comparing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md"
            >
              {comparing ? '对比中...' : '开始对比'}
            </button>
          </div>
        </div>
      )}

      {/* 版本列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">配置版本列表</h2>
          <p className="text-sm text-gray-600 mt-1">
            选择两个版本进行对比（点击行首复选框）
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无配置历史</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    选择
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    版本号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    变更摘要
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建人
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {versions.map((version, index) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => handleSelectVersion(version.id)}
                        disabled={
                          !selectedVersions.includes(version.id) &&
                          selectedVersions.length >= 2
                        }
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVersionBadgeColor(
                          index
                        )}`}
                      >
                        v{version.version_number}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {version.change_summary || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {version.profiles?.full_name || version.created_by}
                      </div>
                      <div className="text-xs text-gray-500">
                        {version.profiles?.email || ''}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(version.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRollback(version.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        回滚到此版本
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 对比结果模态框 */}
      {showCompareModal && comparisonData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 my-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">配置对比结果</h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 版本信息 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">版本 1</p>
                <p className="text-lg font-semibold">
                  v{comparisonData.version1.version_number}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comparisonData.version1.created_at).toLocaleString(
                    'zh-CN'
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">版本 2</p>
                <p className="text-lg font-semibold">
                  v{comparisonData.version2.version_number}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comparisonData.version2.created_at).toLocaleString(
                    'zh-CN'
                  )}
                </p>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">变更统计</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">新增字段</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{comparisonData.comparison.summary.added}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">删除字段</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{comparisonData.comparison.summary.removed}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">修改字段</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ~{comparisonData.comparison.summary.modified}
                  </p>
                </div>
              </div>
            </div>

            {/* 文本报告 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">详细变更报告</h3>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {comparisonData.textReport}
              </pre>
            </div>

            {/* 关闭按钮 */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
