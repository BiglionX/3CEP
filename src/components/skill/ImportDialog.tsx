'use client';

import { useRef, useState } from 'react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

/**
 * Skill 导入对话框组件
 */
export function ImportDialog({
  isOpen,
  onClose,
  onSuccess,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 处理文件选择
  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);

    // 验证文件格式
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedTypes.includes(fileExt)) {
      setError('不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件');
      return;
    }

    // 验证文件大小 (< 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }

    // 读取并预览文件内容
    try {
      // 这里可以添加预览逻辑
      setPreview({
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        rowCount: '解析中...',
      });
    } catch (err) {
      setError('文件读取失败');
    }
  };

  // 处理拖拽
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // 处理上传
  const handleUpload = async () => {
    if (!file) {
      setError('请选择文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/skill-store/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 导入成功
        onSuccess?.(result.data.importedRows);
        handleClose();
      } else {
        // 导入失败
        if (result.data?.errors) {
          // 显示详细错误信息
          const errorCount = result.data.errors.length;
          const firstError = result.data.errors[0];
          setError(
            `发现 ${errorCount} 个错误：${firstError.message} (第 ${firstError.row} 行)`
          );
        } else {
          setError(result.error || '导入失败');
        }
      }
    } catch (err) {
      setError(`系统错误：${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 关闭对话框
  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    const template = [
      {
        name_en: 'example_skill',
        title: '示例技能',
        description: '这是一个示例技能的描述',
        category: 'AI',
        version: '1.0.0',
        tags: 'AI,机器学习，示例',
      },
    ];

    // 这里应该调用导出函数生成 Excel
    alert('模板下载功能开发中...');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">批量导入 Skills</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-4">
          {/* 文件上传区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={e =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
              className="hidden"
            />

            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer"
                >
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    点击上传
                  </span>
                  <span>或将文件拖拽到此处</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="sr-only"
                    onChange={e =>
                      e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <p className="text-xs text-gray-500">
                支持格式：.xlsx, .xls, .csv (最大 10MB)
              </p>
            </div>
          </div>

          {/* 文件预览 */}
          {preview && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">
                      {preview.fileName}
                    </p>
                    <p className="text-sm text-gray-500">{preview.fileSize}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">导入说明:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                第一行必须包含表头：name_en, title, description, category,
                version
              </li>
              <li>name_en (英文名称) 和 title (中文标题) 为必填项</li>
              <li>
                分类必须是：AI, 数据分析，营销，财务，人力资源，运营，开发，设计
              </li>
              <li>版本号格式：x.y.z (如 1.0.0)</li>
              <li>标签可以用逗号分隔的字符串</li>
              <li>重复的 name_en 会被跳过</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            下载模板
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '导入中...' : '开始导入'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
