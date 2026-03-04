"use client";

import {
  BarChart3,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  TrendingDown,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NegotiationSession {
  sessionId: string;
  procurementRequestId: string;
  supplierId: string;
  targetPrice: number;
  initialQuote: number;
  currentRound: number;
  maxRounds: number;
  status: "pending" | "negotiating" | "success" | "failed" | "cancelled";
  startTime: Date;
  endTime?: Date;
  finalDiscountRate?: number;
}

interface NegotiationRound {
  round: number;
  timestamp: Date;
  ourInitialOffer: number;
  supplierQuote: number;
  ourCounterOffer: number;
  strategyUsed: string;
  confidenceLevel: number;
  remarks?: string;
}

interface NegotiationAdvice {
  recommendedPrice: number;
  confidence: number;
  strategyToUse: string;
  riskLevel: "low" | "medium" | "high";
  expectedDiscount: number;
  timeEstimate: number;
}

interface SupplierRecommendation {
  supplierId: string;
  supplierName: string;
  score: number;
  transactionCount: number;
  averageDiscountRate: number;
  afterSalesRate: number;
  priceCompetitiveness: number;
  reasons: string[];
}

export default function NegotiationPage() {
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [currentSession, setCurrentSession] =
    useState<NegotiationSession | null>(null);
  const [history, setHistory] = useState<NegotiationRound[]>([]);
  const [recommendations, setRecommendations] = useState<
    SupplierRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supplierQuote, setSupplierQuote] = useState("");
  const [remarks, setRemarks] = useState("");

  // 初始化数?
  useEffect(() => {
    loadActiveSessions();
    loadRecommendations();
  }, []);

  // 加载进行中的议价会话
  const loadActiveSessions = async () => {
    try {
      setIsLoading(true);
      // 模拟API调用
      const mockSessions: NegotiationSession[] = [
        {
          sessionId: "NEG-12345",
          procurementRequestId: "PR-20240101-001",
          supplierId: "SUP-001",
          targetPrice: 10000,
          initialQuote: 12000,
          currentRound: 2,
          maxRounds: 5,
          status: "negotiating",
          startTime: new Date(Date.now() - 3600000), // 1小时?
        },
      ];
      setSessions(mockSessions);
      if (mockSessions.length > 0) {
        setCurrentSession(mockSessions[0]);
        loadSessionHistory(mockSessions[0].sessionId);
      }
    } catch (error) {
      console.error("加载议价会话失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载会话历史
  const loadSessionHistory = async (sessionId: string) => {
    try {
      // 模拟API调用
      const mockHistory: NegotiationRound[] = [
        {
          round: 1,
          timestamp: new Date(Date.now() - 7200000),
          ourInitialOffer: 12000,
          supplierQuote: 11500,
          ourCounterOffer: 11000,
          strategyUsed: "价格敏感型策?,
          confidenceLevel: 85,
          remarks: "首轮议价",
        },
        {
          round: 2,
          timestamp: new Date(Date.now() - 3600000),
          ourInitialOffer: 11000,
          supplierQuote: 11200,
          ourCounterOffer: 10800,
          strategyUsed: "价格敏感型策?,
          confidenceLevel: 78,
          remarks: "第二轮议?,
        },
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error("加载会话历史失败:", error);
    }
  };

  // 加载供应商推?
  const loadRecommendations = async () => {
    try {
      // 模拟API调用
      const mockRecommendations: SupplierRecommendation[] = [
        {
          supplierId: "SUP-001",
          supplierName: "优质供应商A",
          score: 92,
          transactionCount: 45,
          averageDiscountRate: 12.5,
          afterSalesRate: 4.6,
          priceCompetitiveness: 4.8,
          reasons: [
            "经验丰富?5笔交易）",
            "议价成功率高",
            "平均折扣率高?2.5%",
          ],
        },
        {
          supplierId: "SUP-002",
          supplierName: "可靠供应商B",
          score: 85,
          transactionCount: 32,
          averageDiscountRate: 10.2,
          afterSalesRate: 4.3,
          priceCompetitiveness: 4.5,
          reasons: ["售后服务评价优秀", "价格具有竞争?],
        },
      ];
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error("加载供应商推荐失?", error);
    }
  };

  // 启动新议?
  const startNewNegotiation = async () => {
    try {
      setIsLoading(true);
      // 模拟API调用
      const newSession: NegotiationSession = {
        sessionId: `NEG-${Date.now()}`,
        procurementRequestId: "PR-20240101-002",
        supplierId: "SUP-001",
        targetPrice: 8000,
        initialQuote: 9500,
        currentRound: 1,
        maxRounds: 5,
        status: "negotiating",
        startTime: new Date(),
      };

      setSessions((prev) => [...prev, newSession]);
      setCurrentSession(newSession);
      setHistory([]);
    } catch (error) {
      console.error("启动新议价失?", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 执行议价回合
  const executeRound = async () => {
    if (!currentSession || !supplierQuote) return;

    try {
      setIsLoading(true);
      const quoteValue = parseFloat(supplierQuote);

      // 模拟API调用
      const newRound: NegotiationRound = {
        round: history.length + 1,
        timestamp: new Date(),
        ourInitialOffer:
          history.length > 0
            ? history[history.length - 1].ourCounterOffer
            : currentSession.initialQuote,
        supplierQuote: quoteValue,
        ourCounterOffer: quoteValue * 0.95, // 简单的95折还?
        strategyUsed: "价格敏感型策?,
        confidenceLevel: 80,
        remarks,
      };

      setHistory((prev) => [...prev, newRound]);
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              currentRound: prev.currentRound + 1,
            }
          : null
      );

      setSupplierQuote("");
      setRemarks("");
    } catch (error) {
      console.error("执行议价回合失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 接受最终报?
  const acceptOffer = async () => {
    if (!currentSession || history.length === 0) return;

    try {
      setIsLoading(true);
      const finalPrice = history[history.length - 1].ourCounterOffer;

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              status: "success",
              endTime: new Date(),
              finalDiscountRate:
                ((prev.initialQuote - finalPrice) / prev.initialQuote) * 100,
            }
          : null
      );
    } catch (error) {
      console.error("接受报价失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染状态图?
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "negotiating":
        return <Play className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingDown className="h-8 w-8 mr-3 text-blue-600" />
            智能议价引擎
          </h1>
          <p className="text-gray-600 mt-2">
            基于历史数据和市场行情的智能议价系统
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：议价控制面?*/}
          <div className="lg:col-span-2 space-y-6">
            {/* 当前议价会话 */}
            {currentSession && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    当前议价会话
                  </h2>
                  <div className="flex items-center space-x-2">
                    {renderStatusIcon(currentSession.status)}
                    <span className="text-sm font-medium capitalize">
                      {currentSession.status}
                    </span>
                  </div>
                </div>

                {/* 会话信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">
                      目标价格
                    </div>
                    <div className="text-xl font-bold text-blue-900">
                      ¥{currentSession.targetPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">
                      初始报价
                    </div>
                    <div className="text-xl font-bold text-green-900">
                      ¥{currentSession.initialQuote.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">
                      当前轮次
                    </div>
                    <div className="text-xl font-bold text-purple-900">
                      {currentSession.currentRound}/{currentSession.maxRounds}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">
                      进行时间
                    </div>
                    <div className="text-xl font-bold text-orange-900">
                      {Math.floor(
                        (Date.now() - currentSession.startTime.getTime()) /
                          60000
                      )}
                      分钟
                    </div>
                  </div>
                </div>

                {/* 议价回合执行 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    执行议价回合
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        供应商报?(¥)
                      </label>
                      <input
                        type="number"
                        value={supplierQuote}
                        onChange={(e) => setSupplierQuote(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入供应商报价"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        回合备注
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="可选：添加本次议价的备注信?
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={executeRound}
                        disabled={isLoading || !supplierQuote}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            执行议价
                          </>
                        )}
                      </button>
                      <button
                        onClick={acceptOffer}
                        disabled={isLoading || history.length === 0}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        接受报价
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 议价历史记录 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                议价历史
              </h2>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">暂无议价历史记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((round, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">
                            �?{round.round} �?
                          </span>
                          <span className="ml-3 text-sm text-gray-500">
                            {round.timestamp.toLocaleString("zh-CN")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-blue-600 mr-2">
                            置信? {round.confidenceLevel}%
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {round.strategyUsed}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">我方初始报价:</span>
                          <span className="font-medium ml-2">
                            ¥{round.ourInitialOffer.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">供应商报?</span>
                          <span className="font-medium ml-2 text-orange-600">
                            ¥{round.supplierQuote.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">我方还价:</span>
                          <span className="font-medium ml-2 text-green-600">
                            ¥{round.ourCounterOffer.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {round.remarks && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            备注: {round.remarks}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：供应商推荐和统?*/}
          <div className="space-y-6">
            {/* 供应商推?*/}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  供应商推?
                </h2>
                <button
                  onClick={loadRecommendations}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {recommendations.map((supplier, index) => (
                  <div
                    key={supplier.supplierId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {supplier.supplierName}
                      </h3>
                      <span className="text-lg font-bold text-blue-600">
                        {supplier.score}�?
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <div>交易次数: {supplier.transactionCount}</div>
                      <div>平均折扣: {supplier.averageDiscountRate}%</div>
                      <div>售后评分: {supplier.afterSalesRate}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.reasons.map((reason, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                议价统计
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">总议价次?/span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">成功?/span>
                  <span className="font-medium text-green-600">62.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均折扣</span>
                  <span className="font-medium text-blue-600">7.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均时长</span>
                  <span className="font-medium">28分钟</span>
                </div>
              </div>
            </div>

            {/* 快速操?*/}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                快速操?
              </h2>
              <div className="space-y-3">
                <button
                  onClick={startNewNegotiation}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      启动新议?
                    </>
                  )}
                </button>

                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                  <Users className="h-5 w-5 mr-2" />
                  查看所有会?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

