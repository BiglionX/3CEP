"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuotationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  contentType: string;
  language: string;
  isActive: boolean;
}

interface QuotationRequest {
  id: string;
  requestNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
  }>;
  supplierIds: string[];
  status: string;
  createdAt: string;
}

export default function QuotationManagementPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"templates" | "requests">(
    "templates"
  );
  const [loading, setLoading] = useState(false);

  // 获取模板列表
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/b2b-procurement/quotation/templates");
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data || []);
      }
    } catch (error) {
      console.error("获取模板失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取询价请求列表
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/b2b-procurement/quotation/requests");
      const result = await response.json();
      if (result.success) {
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error("获取询价请求失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 创建新模?
  const handleCreateTemplate = async () => {
    try {
      const newTemplate = {
        name: "新询价模?,
        subject: "【询价】关于{{productName}}的采购询?,
        content: `<p>尊敬的{{supplierName}}�?/p>
                  <p>我们是{{companyName}}，现就以下商品进行采购询价：</p>
                  <ul>
                    {{#each items}}
                    <li>{{this.name}} - {{this.quantity}}{{this.unit}}</li>
                    {{/each}}
                  </ul>
                  <p>请提供含税价格，报价有效期{{validityDays}}天?/p>
                  <p>回复截止时间：{{responseDeadline}}</p>`,
        contentType: "html",
        language: "zh",
        variables: {
          productName: "商品名称",
          supplierName: "供应商名?,
          companyName: "公司名称",
          validityDays: "有效期天?,
          responseDeadline: "回复截止时间",
        },
      };

      const response = await fetch("/api/b2b-procurement/quotation/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });

      const result = await response.json();
      if (result.success) {
        alert("模板创建成功?);
        fetchTemplates();
      } else {
        alert("模板创建失败? + result.error);
      }
    } catch (error) {
      console.error("创建模板错误:", error);
      alert("创建模板时发生错?);
    }
  };

  // 创建新询价请?
  const handleCreateRequest = async () => {
    try {
      const newRequest = {
        procurementRequestId: "test-procurement-" + Date.now(),
        supplierIds: ["supplier-001", "supplier-002", "supplier-003"],
        items: [
          {
            productName: "智能手机屏幕",
            category: "电子元件",
            quantity: 100,
            unit: "�?,
            specifications: "6.1英寸 OLED",
            estimatedUnitPrice: 150,
          },
          {
            productName: "手机电池",
            category: "电子元件",
            quantity: 200,
            unit: "�?,
            specifications: "4000mAh锂离?,
            estimatedUnitPrice: 80,
          },
        ],
        responseDeadline: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      const response = await fetch("/api/b2b-procurement/quotation/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });

      const result = await response.json();
      if (result.success) {
        alert("询价请求创建成功！单号：" + result.data.requestNumber);
        fetchRequests();
      } else {
        alert("询价请求创建失败? + result.error);
      }
    } catch (error) {
      console.error("创建询价请求错误:", error);
      alert("创建询价请求时发生错?);
    }
  };

  // 发送询?
  const handleSendQuotation = async (requestId: string) => {
    try {
      const sendInfo = {
        quotationRequestId: requestId,
        senderInfo: {
          companyName: "测试科技有限公司",
          contactPerson: "张经?,
          contactPhone: "13800138000",
          contactEmail: "zhang@test.com",
        },
      };

      const response = await fetch(
        `/api/b2b-procurement/quotation/requests/${requestId}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sendInfo),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert(`询价发送成功！已发送给${result.data.sentCount}家供应商`);
        fetchRequests();
      } else {
        alert("询价发送失败：" + result.error);
      }
    } catch (error) {
      console.error("发送询价错?", error);
      alert("发送询价时发生错误");
    }
  };

  // 生成比价报告
  const handleGenerateReport = async (requestId: string) => {
    try {
      const response = await fetch("/api/b2b-procurement/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationRequestId: requestId }),
      });

      const result = await response.json();
      if (result.success) {
        alert("比价报告生成成功?);
      } else {
        alert("比价报告生成失败? + result.error);
      }
    } catch (error) {
      console.error("生成报告错误:", error);
      alert("生成报告时发生错?);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">自动询价比价平台</h1>
          <p className="mt-2 text-gray-600">管理询价模板和发送供应商询价请求</p>
        </div>

        {/* 标签页导?*/}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("templates")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              询价模板
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              询价请求
            </button>
          </nav>
        </div>

        {/* 模板管理面板 */}
        {activeTab === "templates" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  询价模板管理
                </h2>
                <button
                  onClick={handleCreateTemplate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  新建模板
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">加载?..</p>
                </div>
              ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {template.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            template.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {template.isActive ? "激? : "未激?}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {template.subject}
                      </p>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>
                          {template.language === "zh" ? "中文" : "英文"}
                        </span>
                        <span>
                          {template.contentType === "html" ? "HTML" : "文本"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无模板
                  </h3>
                  <p className="text-gray-500 mb-6">
                    创建第一个询价模板开始使?
                  </p>
                  <button
                    onClick={handleCreateTemplate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    创建模板
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 询价请求面板 */}
        {activeTab === "requests" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  询价请求管理
                </h2>
                <button
                  onClick={handleCreateRequest}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  新建询价
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">加载?..</p>
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.requestNumber}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            创建时间:{" "}
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            request.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status === "draft"
                            ? "草稿"
                            : request.status === "sent"
                            ? "已发?
                            : request.status === "completed"
                            ? "已完?
                            : "未知"}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          询价商品:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {request.items.map((item, index) => (
                            <li key={index}>
                              {item.productName} × {item.quantity}
                              {item.unit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSendQuotation(request.id)}
                          disabled={request.status !== "draft"}
                          className={`px-3 py-1 text-sm rounded ${
                            request.status === "draft"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          发送询?
                        </button>

                        <button
                          onClick={() => handleGenerateReport(request.id)}
                          disabled={request.status !== "completed"}
                          className={`px-3 py-1 text-sm rounded ${
                            request.status === "completed"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          生成报告
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无询价请求
                  </h3>
                  <p className="text-gray-500 mb-6">
                    创建第一个询价请求开始使?
                  </p>
                  <button
                    onClick={handleCreateRequest}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    创建询价
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 功能说明卡片 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-blue-600 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">模板管理</h3>
            <p className="text-gray-600 text-sm">
              创建和管理标准化的询价邮件模板，支持多语言和自定义变量
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">批量询价</h3>
            <p className="text-gray-600 text-sm">
              向多个供应商同时发送询价请求，自动跟踪发送状态和回复情况
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-purple-600 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">智能分析</h3>
            <p className="text-gray-600 text-sm">
              自动生成比价报告，包含价格对比、交期分析和风险评估
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

