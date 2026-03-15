'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Download,
  Upload,
  QrCode,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface BatchQRCodeRecord {
  id: string;
  batch_id: string;
  product_model: string;
  product_category: string;
  quantity: number;
  generated_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string;
  config: {
    format: string;
    size: number;
    error_correction: string;
  };
}

interface ProductTemplate {
  productModel: string;
  productCategory: string;
  brandId: string;
  productName: string;
  specifications: Record<string, any>;
}

export default function BatchQRCodeManagementPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchQRCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ [key: string]: number }>(
    {}
  );

  const [formData, setFormData] = useState({
    productModel: '',
    productCategory: '',
    brandId: '',
    productName: '',
    quantity: 10,
    format: 'png',
    size: 300,
    errorCorrection: 'M',
    startDate: '',
    endDate: '',
  });

  // 获取批次列表
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/qrcode/batch');
      const data = await response.json();

      if (data.success) {
        setBatches(data.data || []);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('获取批次列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建新批
  const createBatch = async () => {
    try {
      const response = await fetch('/api/qrcode/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productModel: formData.productModel,
          productCategory: formData.productCategory,
          brandId: formData.brandId,
          productName: formData.productName,
          quantity: parseInt(formData.quantity.toString()),
          config: {
            format: formData.format,
            size: parseInt(formData.size.toString()),
            errorCorrection: formData.errorCorrection,
          },
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('批次创建成功');
        setShowCreateModal(false);
        fetchBatches();
        resetForm();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (err) {
      alert('创建请求失败');
      console.error('创建批次失败:', err);
    }
  };

  // 上传CSV模板
  const uploadTemplate = async (file: File) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await fetch('/api/qrcode/batch/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const result = await response.json();

      if (result.success) {
        alert(`成功解析 ${result.parsedCount} 条记录`);
        setShowUploadModal(false);
        fetchBatches();
      } else {
        alert(`上传失败: ${result.error}`);
      }
    } catch (err) {
      alert('上传失败');
      console.error('上传模板失败:', err);
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    const templateData = [
      [
        '产品型号*',
        '产品类别*',
        '品牌ID*',
        '产品名称*',
        '数量*',
        '格式',
        '尺寸',
        '纠错等级',
      ],
      [
        'IPH15P-A2842',
        'smartphone',
        'brand_apple_001',
        'iPhone 15 Pro',
        '50',
        'png',
        '300',
        'M',
      ],
      [
        'SM-S9280',
        'smartphone',
        'brand_samsung_001',
        'Galaxy S24 Ultra',
        '30',
        'png',
        '300',
        'M',
      ],
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '批量二维码模csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      productModel: '',
      productCategory: '',
      brandId: '',
      productName: '',
      quantity: 10,
      format: 'png',
      size: 300,
      errorCorrection: 'M',
      startDate: '',
      endDate: '',
    });
  };

  // 获取状态标
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: '待处理', color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '处理中', color: 'bg-blue-100 text-blue-800' },
      completed: { text: '已完成', color: 'bg-green-100 text-green-800' },
      failed: { text: '失败', color: 'bg-red-100 text-red-800' },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  // 获取进度
  const getProgressBar = (batch: BatchQRCodeRecord) => {
    const progress = Math.round((batch.generated_count / batch.quantity) * 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  返回管理主页
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                批量二维码生成
              </h1>
              <p className="mt-2 text-gray-600">
                按产品型号批量生成专属二维码，每批锁定唯一产品型号
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadTemplate}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                下载模板
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                上传CSV
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <QrCode className="w-5 h-5 mr-2" />
                新建批次
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总批次</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">处理中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总二维码数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.reduce((sum, b) => sum + b.generated_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 批次列表 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {batches.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无批次记录
              </h3>
              <p className="text-gray-500 mb-6">
                开始创建您的第一个批量二维码生成任务
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  新建批次
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  上传CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      批次信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量/进度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map(batch => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{batch.batch_id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {batch.batch_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {batch.product_model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {batch.product_category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {batch.generated_count}/{batch.quantity}
                        </div>
                        <div className="mt-2">{getProgressBar(batch)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(
                            (batch.generated_count / batch.quantity) * 100
                          )}
                          %
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(batch.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                        {batch.completed_at && (
                          <div className="text-xs text-gray-400">
                            完成
                            {new Date(batch.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          查看详情
                        </button>
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          下载
                        </button>
                        {batch.status === 'pending' && (
                          <button className="text-yellow-600 hover:text-yellow-900">
                            开始处
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 新建批次模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    创建批量生成任务
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">
                        重要说明
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        每个批次将锁定唯一的产品型号，确保该批次内所有二维码都指向同一产品型号
                        系统会自动生成连续的序列号以区分每个二维码
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品型号 *
                    </label>
                    <input
                      type="text"
                      value={formData.productModel}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          productModel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=" IPH15P-A2842"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品类别 *
                    </label>
                    <input
                      type="text"
                      value={formData.productCategory}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          productCategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=" smartphone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      品牌ID *
                    </label>
                    <input
                      type="text"
                      value={formData.brandId}
                      onChange={e =>
                        setFormData({ ...formData, brandId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=" brand_apple_001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品名称 *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          productName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder=" iPhone 15 Pro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生成数量 *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.quantity}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      格式
                    </label>
                    <select
                      value={formData.format}
                      onChange={e =>
                        setFormData({ ...formData, format: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="png">PNG</option>
                      <option value="svg">SVG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      尺寸 (像素)
                    </label>
                    <select
                      value={formData.size}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          size: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="200">200px</option>
                      <option value="300">300px</option>
                      <option value="400">400px</option>
                      <option value="500">500px</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纠错等级
                    </label>
                    <select
                      value={formData.errorCorrection}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          errorCorrection: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="L">L (7%)</option>
                      <option value="M">M (15%)</option>
                      <option value="Q">Q (25%)</option>
                      <option value="H">H (30%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生产开始日
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={e =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生产结束日期
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={createBatch}
                  disabled={
                    !formData.productModel ||
                    !formData.productCategory ||
                    !formData.brandId ||
                    !formData.productName
                  }
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  创建批次
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 上传CSV模态框 */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    上传CSV模板
                  </h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    拖拽 CSV 文件到这里
                  </p>
                  <p className="text-gray-500 mb-4">或点击选择文件</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        uploadTemplate(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    选择文件
                  </label>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    CSV模板格式
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>必需字段:</strong> 产品型号, 产品类别, 品牌ID,
                      产品名称, 数量
                    </div>
                    <div>
                      <strong>可选字</strong> 格式, 尺寸, 纠错等级
                    </div>
                    <div>
                      <strong>示例:</strong> IPH15P-A2842, smartphone,
                      brand_apple_001, iPhone 15 Pro, 50
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
