/**
 * 安全监控仪表板
 * 实时展示安全威胁、异常行为和系统安全状态
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Globe,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Bell,
  Eye,
  Zap,
} from 'lucide-react';

interface ThreatMetrics {
  totalEvents: number;
  threatEvents: number;
  anomalyEvents: number;
  criticalAlerts: number;
  highRiskUsers: number;
  blockedAttacks: number;
  activeThreats: SecurityEvent[];
  topThreatSources: Array<{ source: string; count: number }>;
  threatTrend: Array<{ timestamp: string; threatCount: number }>;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  userId: string;
  ipAddress: string;
  timestamp: string;
  message: string;
}

interface SecurityDashboardData {
  threatMetrics: ThreatMetrics;
  userRiskProfiles: Array<{
    userId: string;
    riskScore: number;
    lastActivity: string;
    threatLevel: string;
    recentAnomalies: number;
  }>;
  systemSecurityScore: number;
  recentAlerts: SecurityEvent[];
  complianceStatus: {
    gdpr: boolean;
    hipaa: boolean;
    pci: boolean;
    soc2: boolean;
  };
  recommendations: string[];
}

export default function SecurityMonitoringDashboard() {
  const [dashboardData, setDashboardData] =
    useState<SecurityDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30秒刷新
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();

    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/security-monitoringaction=dashboard');
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || '加载数据失败');
      }
    } catch (err: any) {
      setError(err.message || '网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceColor = (status: boolean) => {
    return status  'text-green-600' : 'text-red-600';
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载安全监控数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无数据</h2>
          <p className="text-gray-600">安全监控系统正在初始化...</p>
        </div>
      </div>
    );
  }

  const {
    threatMetrics,
    userRiskProfiles,
    systemSecurityScore,
    recentAlerts,
    complianceStatus,
    recommendations,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部区域 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  安全监控中心
                </h1>
                <p className="text-gray-600">实时威胁检测与安全态势感知</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${autoRefresh  'bg-green-500' : 'bg-gray-400'}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {autoRefresh  '自动刷新' : '手动刷新'}
                </span>
              </div>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${autoRefresh  'bg-gray-100 hover:bg-gray-200' : 'bg-blue-100 hover:bg-blue-200'}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${autoRefresh  'text-gray-600' : 'text-blue-600'}`}
                />
              </button>

              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading  'animate-spin' : ''}`}
                />
                <span>刷新</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 系统安全评分卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                系统安全评分
              </h3>
              <Shield className="w-6 h-6 text-blue-600" />
            </div>

            <div className="text-center">
              <div
                className={`text-5xl font-bold ${getSecurityScoreColor(systemSecurityScore)} mb-2`}
              >
                {systemSecurityScore}
              </div>
              <div className="text-gray-600">
                安全等级:{' '}
                {systemSecurityScore >= 90
                   '优秀'
                  : systemSecurityScore >= 70
                     '良好'
                    : systemSecurityScore >= 50
                       '一般'
                      : '危险'}
              </div>

              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemSecurityScore >= 90
                         'bg-green-500'
                        : systemSecurityScore >= 70
                           'bg-yellow-500'
                          : systemSecurityScore >= 50
                             'bg-orange-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${systemSecurityScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* 合规状态卡片 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              合规状态
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                    complianceStatus.gdpr  'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {complianceStatus.gdpr  (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="font-medium text-gray-900">GDPR</div>
                <div
                  className={`text-sm ${getComplianceColor(complianceStatus.gdpr)}`}
                >
                  {complianceStatus.gdpr  '合规' : '不合规'}
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                    complianceStatus.pci  'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {complianceStatus.pci  (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="font-medium text-gray-900">PCI DSS</div>
                <div
                  className={`text-sm ${getComplianceColor(complianceStatus.pci)}`}
                >
                  {complianceStatus.pci  '合规' : '不合规'}
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                    complianceStatus.soc2  'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {complianceStatus.soc2  (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="font-medium text-gray-900">SOC 2</div>
                <div
                  className={`text-sm ${getComplianceColor(complianceStatus.soc2)}`}
                >
                  {complianceStatus.soc2  '合规' : '不合规'}
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                    complianceStatus.hipaa  'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {complianceStatus.hipaa  (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="font-medium text-gray-900">HIPAA</div>
                <div
                  className={`text-sm ${getComplianceColor(complianceStatus.hipaa)}`}
                >
                  {complianceStatus.hipaa  '合规' : '不合规'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 威胁指标概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总事件数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {threatMetrics.totalEvents}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">威胁事件</p>
                <p className="text-2xl font-bold text-orange-600">
                  {threatMetrics.threatEvents}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">异常行为</p>
                <p className="text-2xl font-bold text-purple-600">
                  {threatMetrics.anomalyEvents}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">高危用户</p>
                <p className="text-2xl font-bold text-red-600">
                  {threatMetrics.highRiskUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 近期告警 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    近期安全告警
                  </h3>
                  <Bell className="w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div className="p-6">
                {recentAlerts.length === 0  (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">暂无安全告警</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAlerts.slice(0, 5).map(alert => (
                      <div
                        key={alert.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${getThreatLevelColor(alert.threatLevel)}`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {alert.message || `${alert.eventType} 事件`}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThreatLevelColor(alert.threatLevel)}`}
                            >
                              {alert.threatLevel}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Globe className="w-4 h-4 mr-1" />
                            <span className="mr-3">{alert.ipAddress}</span>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {alert.userId && (
                            <div className="mt-1 text-sm text-gray-500">
                              用户: {alert.userId}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {alert.riskScore}
                          </div>
                          <div className="text-xs text-gray-500">风险评分</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 安全建议 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  安全建议
                </h3>
              </div>

              <div className="p-6">
                {recommendations.length === 0  (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">当前无需特别关注</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-700">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 威胁来源排行 */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  威胁来源排行
                </h3>
              </div>

              <div className="p-6">
                {threatMetrics.topThreatSources.length === 0  (
                  <div className="text-center py-8">
                    <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">暂无威胁数据</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {threatMetrics.topThreatSources
                      .slice(0, 5)
                      .map((source, index) => (
                        <div
                          key={source.source}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              #{index + 1}
                            </span>
                            <span className="text-sm text-gray-600 font-mono">
                              {source.source}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {source.count}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
