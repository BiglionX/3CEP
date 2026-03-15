"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QRCodeRecord {
  id: string;
  qr_code_id: string;
  product_id: string;
  qr_content: string;
  qr_image_base64: string;
  format: string;
  size: number;
  created_at: string;
  products?: {
    name: string;
    model: string;
    brands?: {
      name: string;
    };
  };
}

export default function QRCodeManagementPage() {
  const router = useRouter();
  const [qrcodes, setQrcodes] = useState<QRCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    brandId: "",
    productName: "",
    productModel: "",
    productCategory: "",
    batchNumber: "",
    manufacturingDate: "",
    warrantyPeriod: "",
    format: "png",
    size: 300,
  });

  // 获取二维码列?
  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/qrcode/generate");
      const data = await response.json();

      if (data.success) {
        setQrcodes(data.data || []);
      } else {
        setError(data.error || "获取数据失败");
      }
    } catch (err) {
      setError("网络请求失败");
      console.error("获取二维码列表失?", err);
    } finally {
      setLoading(false);
    }
  };

  // 生成二维?
  const generateQRCode = async () => {
    try {
      const response = await fetch("/api/qrcode/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          config: {
            format: formData.format,
            size: parseInt(formData.size.toString()),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("二维码生成成功！");
        setShowGenerateModal(false);
        fetchQRCodes(); // 刷新列表
        // 重置表单
        setFormData({
          productId: "",
          brandId: "",
          productName: "",
          productModel: "",
          productCategory: "",
          batchNumber: "",
          manufacturingDate: "",
          warrantyPeriod: "",
          format: "png",
          size: 300,
        });
      } else {
        alert(`生成失败: ${result.error}`);
      }
    } catch (err) {
      alert("生成请求失败");
      console.error("生成二维码失?", err);
    }
  };

  // 删除二维?
  const deleteQRCode = async (qrCodeId: string) => {
    if (!confirm("确定要删除这个二维码吗？")) return;

    try {
      // 这里需要实现删除API
      alert("删除功能待实?);
    } catch (err) {
      alert("删除失败");
      console.error("删除二维码失?", err);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载?..</p>
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
              <h1 className="text-3xl font-bold text-gray-900">二维码管?/h1>
              <p className="mt-2 text-gray-600">管理产品二维码生成和查看</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              生成二维?
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* 二维码列?*/}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {qrcodes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无二维?
              </h3>
              <p className="text-gray-500 mb-6">开始生成您的第一个产品二维码</p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                生成二维?
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      二维?
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      配置
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {qrcodes.map((qr) => (
                    <tr key={qr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={qr.qr_image_base64}
                          alt="二维?
                          className="w-20 h-20 object-contain border border-gray-200 rounded"
                        />
                        <div className="mt-2 text-xs text-gray-500 font-mono">
                          {qr.qr_code_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {qr?.name || "未知产品"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {qr?.model || "无型?}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {qr?.brands?.name || "未知品牌"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {qr.format} �?{qr.size}px
                        </div>
                        <div className="text-xs text-gray-500">
                          {qr.qr_content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(qr.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          查看
                        </button>
                        <button
                          onClick={() => deleteQRCode(qr.qr_code_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 生成二维码模态框 */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    生成二维?
                  </h2>
                  <button
                    onClick={() => setShowGenerateModal(false)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品ID *
                    </label>
                    <input
                      type="text"
                      value={formData.productId}
                      onChange={(e) =>
                        setFormData({ ...formData, productId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="�? prod_apple_iphone15_001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      品牌ID *
                    </label>
                    <input
                      type="text"
                      value={formData.brandId}
                      onChange={(e) =>
                        setFormData({ ...formData, brandId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="�? brand_apple_001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品名称 *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="�? iPhone 15 Pro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品型号
                    </label>
                    <input
                      type="text"
                      value={formData.productModel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productModel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="�? A2842"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品类别
                    </label>
                    <input
                      type="text"
                      value={formData.productCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productCategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="�? smartphone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      出厂批次
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          batchNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="�? IPH15P20260219001"
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
                      onChange={(e) =>
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
                    <input
                      type="number"
                      min="100"
                      max="1000"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          size: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={generateQRCode}
                  disabled={
                    !formData.productId ||
                    !formData.brandId ||
                    !formData.productName
                  }
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  生成二维?
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
