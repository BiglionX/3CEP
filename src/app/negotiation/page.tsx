'use client';

import {
  BarChart3,
  CheckCircle,
  Clock,
  Play,
  TrendingDown,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NegotiationSession {
  sessionId: string;
  procurementRequestId: string;
  supplierId: string;
  targetPrice: number;
  initialQuote: number;
  currentRound: number;
  maxRounds: number;
  status: 'pending' | 'negotiating' | 'success' | 'failed' | 'cancelled';
  startTime: Date;
  endTime: Date;
  finalDiscountRate: number;
}

interface NegotiationRound {
  round: number;
  timestamp: Date;
  ourInitialOffer: number;
  supplierQuote: number;
  ourCounterOffer: number;
  strategyUsed: string;
  confidenceLevel: number;
  remarks: string;
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
  const [supplierQuote, setSupplierQuote] = useState('');
  const [remarks, setRemarks] = useState('');

  // 初始化数据
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
          sessionId: 'NEG-12345',
          procurementRequestId: 'PR-20240101-001',
          supplierId: 'SUP-001',
          targetPrice: 10000,
          initialQuote: 12000,
          currentRound: 2,
          maxRounds: 5,
          status: 'negotiating',
          startTime: new Date(Date.now() - 3600000), // 1小时前
        },
      ];
      setSessions(mockSessions);
      if (mockSessions.length > 0) {
        setCurrentSession(mockSessions[0]);
        loadSessionHistory(mockSessions[0].sessionId);
      }
    } catch (error) {
      console.error('加载议价会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载会话历史
  const loadSessionHistory = async (_sessionId: string) => {
    try {
      // 模拟API调用
      const mockHistory: NegotiationRound[] = [
        {
          round: 1,
          timestamp: new Date(Date.now() - 7200000),
          ourInitialOffer: 12000,
          supplierQuote: 11500,
          ourCounterOffer: 11000,
          strategyUsed: '价格敏感型策略',
          confidenceLevel: 85,
          remarks: '首轮议价',
        },
        {
          round: 2,
          timestamp: new Date(Date.now() - 3600000),
          ourInitialOffer: 11000,
          supplierQuote: 11200,
          ourCounterOffer: 10800,
          strategyUsed: '价格敏感型策略',
          confidenceLevel: 78,
          remarks: '第二轮议价',
        },
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('加载会话历史失败:', error);
    }
  };

  // 加载供应商推荐
  const loadRecommendations = async () => {
    try {
      // 模拟API调用
      const mockRecommendations: SupplierRecommendation[] = [
        {
          supplierId: 'SUP-001',
          supplierName: '优质供应商A',
          score: 92,
          transactionCount: 45,
          averageDiscountRate: 12.5,
          afterSalesRate: 4.6,
          priceCompetitiveness: 4.8,
          reasons: [
            '经验丰富（45笔交易）',
            '议价成功率高',
            '平均折扣率高（12.5%）',
          ],
        },
        {
          supplierId: 'SUP-002',
          supplierName: '可靠供应商B',
          score: 85,
          transactionCount: 32,
          averageDiscountRate: 10.2,
          afterSalesRate: 4.3,
          priceCompetitiveness: 4.5,
          reasons: ['售后服务评价优秀', '价格具有竞争力'],
        },
      ];
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('加载供应商推荐失败:', error);
    }
  };

  // 启动新议价
  const startNewNegotiation = async () => {
    try {
      setIsLoading(true);
      // 模拟API调用
      const newSession: NegotiationSession = {
        sessionId: `NEG-${Date.now()}`,
        procurementRequestId: 'PR-20240101-002',
        supplierId: 'SUP-001',
        targetPrice: 8000,
        initialQuote: 9500,
        currentRound: 1,
        maxRounds: 5,
        status: 'negotiating',
        startTime: new Date(),
      };

      setSessions(prev => [...prev, newSession]);
      setCurrentSession(newSession);
      setHistory([]);
    } catch (error) {
      console.error('启动新议价失败:', error);
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
             history[history.length - 1].ourCounterOffer
            : currentSession.initialQuote,
        supplierQuote: quoteValue,
        ourCounterOffer: quoteValue * 0.95, // 简单的95折还价
        strategyUsed: '价格敏感型策略',
        confidenceLevel: 80,
        remarks,
      };

      setHistory(prev => [...prev, newRound]);
      setCurrentSession(prev =>
        prev
           {
              ...prev,
              currentRound: prev.currentRound + 1,
            }
          : null
      );

      setSupplierQuote('');
      setRemarks('');
    } catch (error) {
      console.error('执行议价回合失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 接受最终报价
  const acceptOffer = async () => {
    if (!currentSession || history.length === 0) return;

    try {
      setIsLoading(true);
      const finalPrice = history[history.length - 1].ourCounterOffer;

      setCurrentSession(prev =>
        prev
           {
              ...prev,
              status: 'success',
              endTime: new Date(),
              finalDiscountRate:
                ((prev.initialQuote - finalPrice) / prev.initialQuote) * 100,
            }
          : null
      );
    } catch (error) {
      console.error('接受报价失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染状态图标
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'negotiating':
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
          {/* 左侧 - 议价会话列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  议价会话
                </h2>
                <button
                  onClick={startNewNegotiation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  新建会话
                </button>
              </div>

              {sessions.length === 0  (
                <div className="text-center py-8 text-gray-500">
                  暂无议价会话
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div
                      key={session.sessionId}
                      onClick={() => {
                        setCurrentSession(session);
                        loadSessionHistory(session.sessionId);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        currentSession.sessionId === session.sessionId
                           'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {session.sessionId}
                        </span>
                        {renderStatusIcon(session.status)}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>目标价: ¥{session.targetPrice}</div>
                        <div>初始报价: ¥{session.initialQuote}</div>
                        <div>
                          轮次: {session.currentRound}/{session.maxRounds}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 供应商推荐 */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  供应商推荐
                </h2>
              </div>

              <div className="space-y-3">
                {recommendations.map(rec => (
                  <div
                    key={rec.supplierId}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {rec.supplierName}
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {rec.score}分
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>交易次数: {rec.transactionCount}</div>
                      <div>平均折扣: {rec.averageDiscountRate}%</div>
                      <div>售后评分: {rec.afterSalesRate}/5.0</div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {rec.reasons.map((reason, idx) => (
                        <div key={idx} className="text-xs text-green-600">
                          ✓ {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 中间 - 议价详情 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  议价详情
                </h2>
                {currentSession && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      会话ID: {currentSession.sessionId}
                    </span>
                    {renderStatusIcon(currentSession.status)}
                  </div>
                )}
              </div>

              {!currentSession  (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>请选择一个议价会话或创建新会话</p>
                </div>
              ) : (
                <>
                  {/* 会话信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">目标价格</div>
                      <div className="text-lg font-semibold text-blue-600">
                        ¥{currentSession.targetPrice}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">初始报价</div>
                      <div className="text-lg font-semibold text-gray-900">
                        ¥{currentSession.initialQuote}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">当前轮次</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {currentSession.currentRound}/{currentSession.maxRounds}
                      </div>
                    </div>
                    {currentSession.finalDiscountRate !== undefined && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">折扣率</div>
                        <div className="text-lg font-semibold text-green-600">
                          {currentSession.finalDiscountRate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 议价历史 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      议价历史
                    </h3>
                    {history.length === 0  (
                      <div className="text-center py-8 text-gray-500">
                        暂无议价记录
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((round, _idx) => (
                          <div
                            key={round.round}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                第{round.round}轮
                              </span>
                              <span className="text-xs text-gray-500">
                                {round.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">我方初始</div>
                                <div className="font-semibold">
                                  ¥{round.ourInitialOffer}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">供应商报价</div>
                                <div className="font-semibold text-blue-600">
                                  ¥{round.supplierQuote}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">我方还价</div>
                                <div className="font-semibold text-green-600">
                                  ¥{round.ourCounterOffer}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              <div>策略: {round.strategyUsed}</div>
                              <div>信心度: {round.confidenceLevel}%</div>
                              {round.remarks && (
                                <div>备注: {round.remarks}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 新回合 */}
                  {currentSession.status === 'negotiating' &&
                    currentSession.currentRound < currentSession.maxRounds && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          新回合
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              供应商报价
                            </label>
                            <input
                              type="number"
                              value={supplierQuote}
                              onChange={e => setSupplierQuote(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="请输入供应商报价"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              备注
                            </label>
                            <textarea
                              value={remarks}
                              onChange={e => setRemarks(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="请输入备注信息"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={executeRound}
                              disabled={!supplierQuote || isLoading}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                            >
                              执行议价
                            </button>
                            <button
                              onClick={acceptOffer}
                              disabled={history.length === 0 || isLoading}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300"
                            >
                              接受报价
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
