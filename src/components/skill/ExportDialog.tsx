'use client';

import { useState } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Skill 导出对话框组件
 */
export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    shelf_status: '',
    review_status: '',
  });

  if (!isOpen) return null;

  // 处理导出
  const handleExport = async () => {
    setLoading(true);

    try {
      // 构建查询参数
      const params = new URLSearchParams({
        format,
        ...(filters.category && { category: filters.category }),
        ...(filters.shelf_status && { shelf_status: filters.shelf_status }),
        ...(filters.review_status && { review_status: filters.review_status }),
      });

      // 调用 API
      const response = await fetch(`/api/admin/skill-store/export?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '导出失败');
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 从 Content-Disposition 头获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `skills_export.${format}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 关闭对话框
      handleClose();
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 关闭对话框
  const handleClose = () => {
    setFormat('xlsx');
    setFilters({
      category: '',
      shelf_status: '',
      review_status: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">导出 Skills 数据</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-4">
          {/* 导出格式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={format === 'xlsx'}
                  onChange={e => setFormat(e.target.value as 'xlsx' | 'csv')}
                  className="mr-2"
                />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={e => setFormat(e.target.value as 'xlsx' | 'csv')}
                  className="mr-2"
                />
                <span>CSV (.csv)</span>
              </label>
            </div>
          </div>

          {/* 筛选条件 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              筛选条件 (可选)
            </h3>

            <div className="space-y-3">
              {/* 分类筛选 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">分类</label>
                <select
                  value={filters.category}
                  onChange={e =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部分类</option>
                  <option value="AI">AI</option>
                  <option value="数据分析">数据分析</option>
                  <option value="营销">营销</option>
                  <option value="财务">财务</option>
                  <option value="人力资源">人力资源</option>
                  <option value="运营">运营</option>
                  <option value="开发">开发</option>
                  <option value="设计">设计</option>
                </select>
              </div>

              {/* 上下架状态筛选 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  上下架状态
                </label>
                <select
                  value={filters.shelf_status}
                  onChange={e =>
                    setFilters({ ...filters, shelf_status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="on_shelf">已上架</option>
                  <option value="off_shelf">已下架</option>
                </select>
              </div>

              {/* 审核状态筛选 */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  审核状态
                </label>
                <select
                  value={filters.review_status}
                  onChange={e =>
                    setFilters({ ...filters, review_status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">导出说明:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>导出文件包含所有匹配的 Skills 数据</li>
              <li>支持 Excel (.xlsx) 和 CSV 两种格式</li>
              <li>可以根据分类、上下架状态、审核状态筛选</li>
              <li>导出的字段包括：名称、描述、分类、版本、统计数据等</li>
              <li>大文件导出可能需要几秒钟时间</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '导出中...' : '开始导出'}
          </button>
        </div>
      </div>
    </div>
  );
}
