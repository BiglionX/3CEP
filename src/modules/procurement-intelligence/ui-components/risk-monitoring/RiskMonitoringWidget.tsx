'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Filter,
  RefreshCw,
  Eye,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RiskAlert {
  id: string;
  type: 'supplier' | 'market' | 'financial' | 'operational' | 'geopolitical';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detectedAt: string;
  status: 'active' | 'resolved' | 'acknowledged';
  affectedEntities: string[];
  mitigationActions: string[];
  confidence: number;
}

interface RiskMetric {
  category: string;
  currentScore: number;
  threshold: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  alerts: number;
}

interface SupplierRiskProfile {
  supplierId: string;
  supplierName: string;
  overallRisk: number;
  riskCategories: {
    financial: number;
    operational: number;
    compliance: number;
    supplyChain: number;
    geopolitical: number;
  };
  lastAssessment: string;
  nextReview: string;
  status: 'watch' | 'normal' | 'high_risk';
}

export default function RiskMonitoringWidget() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [metrics, setMetrics] = useState<RiskMetric[]>([]);
  const [supplierRisks, setSupplierRisks] = useState<SupplierRiskProfile[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAlerts: RiskAlert[] = [
        {
          id: 'ALERT-001',
          type: 'supplier',
          severity: 'high',
          title: '主要供应商财务风险上?,
          description: '华为技术有限公司近期财务指标恶化，信用评级下调至BBB+',
          detectedAt: '2024-03-15T10:30:00Z',
          status: 'active',
          affectedEntities: ['华为技术有限公?, '深圳分公?],
          mitigationActions: [
            '寻找备选供应商',
            '增加库存缓冲',
            '重新谈判付款条件',
          ],
          confidence: 0.85,
        },
        {
          id: 'ALERT-002',
          type: 'market',
          severity: 'medium',
          title: '半导体价格波动加?,
          description: '全球半导体市场价格波动幅度达?5%，超出正常范?,
          detectedAt: '2024-03-14T15:45:00Z',
          status: 'active',
          affectedEntities: ['半导体芯?, '存储?],
          mitigationActions: [
            '锁定长期价格协议',
            '分散采购来源',
            '调整采购时机',
          ],
          confidence: 0.78,
        },
        {
          id: 'ALERT-003',
          type: 'geopolitical',
          severity: 'critical',
          title: '中美贸易政策不确定性增?,
          description: '新一轮贸易限制措施可能影响关键技术产品进?,
          detectedAt: '2024-03-13T09:15:00Z',
          status: 'active',
          affectedEntities: ['高端芯片', '精密仪器'],
          mitigationActions: [
            '加速本土化替代',
            '多元化供应链布局',
            '加强合规审查',
          ],
          confidence: 0.92,
        },
        {
          id: 'ALERT-004',
          type: 'financial',
          severity: 'low',
          title: '汇率波动影响采购成本',
          description: '美元兑人民币汇率波动超过预期，影响进口采购预?,
          detectedAt: '2024-03-12T14:20:00Z',
          status: 'acknowledged',
          affectedEntities: ['美元计价商品'],
          mitigationActions: ['使用外汇对冲工具', '调整付款时间节点'],
          confidence: 0.65,
        },
      ];

      const mockMetrics: RiskMetric[] = [
        {
          category: '供应商风?,
          currentScore: 68,
          threshold: 80,
          trend: 'increasing',
          alerts: 3,
        },
        {
          category: '市场价格风险',
          currentScore: 45,
          threshold: 70,
          trend: 'stable',
          alerts: 1,
        },
        {
          category: '供应链中断风?,
          currentScore: 32,
          threshold: 60,
          trend: 'decreasing',
          alerts: 0,
        },
        {
          category: '合规风险',
          currentScore: 25,
          threshold: 50,
          trend: 'stable',
          alerts: 0,
        },
      ];

      const mockSupplierRisks: SupplierRiskProfile[] = [
        {
          supplierId: 'SUP-001',
          supplierName: '华为技术有限公?,
          overallRisk: 75,
          riskCategories: {
            financial: 82,
            operational: 65,
            compliance: 45,
            supplyChain: 70,
            geopolitical: 88,
          },
          lastAssessment: '2024-03-10',
          nextReview: '2024-04-10',
          status: 'high_risk',
        },
        {
          supplierId: 'SUP-002',
          supplierName: '三星电子株式会社',
          overallRisk: 42,
          riskCategories: {
            financial: 35,
            operational: 50,
            compliance: 30,
            supplyChain: 45,
            geopolitical: 60,
          },
          lastAssessment: '2024-03-08',
          nextReview: '2024-04-08',
          status: 'normal',
        },
        {
          supplierId: 'SUP-003',
          supplierName: '台积电股份有限公?,
          overallRisk: 28,
          riskCategories: {
            financial: 20,
            operational: 35,
            compliance: 25,
            supplyChain: 30,
            geopolitical: 45,
          },
          lastAssessment: '2024-03-12',
          nextReview: '2024-04-12',
          status: 'normal',
        },
      ];

      setAlerts(mockAlerts);
      setMetrics(mockMetrics);
      setSupplierRisks(mockSupplierRisks);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch =
      filterSeverity === 'all' || alert.severity === filterSeverity;
    const typeMatch = filterType === 'all' || alert.type === filterType;
    return severityMatch && typeMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Bell className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'bg-blue-100 text-blue-800';
      case 'market':
        return 'bg-purple-100 text-purple-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'operational':
        return 'bg-yellow-100 text-yellow-800';
      case 'geopolitical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-600';
      case 'resolved':
        return 'text-green-600';
      case 'acknowledged':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      )
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部控制?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">风险监控中心</h1>
          <p className="text-muted-foreground">实时监控和预警各类采购风?/p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="风险级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部级别</SelectItem>
              <SelectItem value="critical">严重</SelectItem>
              <SelectItem value="high">高风?/SelectItem>
              <SelectItem value="medium">中等</SelectItem>
              <SelectItem value="low">低风?/SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="风险类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="supplier">供应?/SelectItem>
              <SelectItem value="market">市场</SelectItem>
              <SelectItem value="financial">财务</SelectItem>
              <SelectItem value="operational">运营</SelectItem>
              <SelectItem value="geopolitical">地缘政治</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 风险概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">总风险评?/CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">52/100</div>
            <p className="text-xs text-muted-foreground">较上?+3.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">活跃警报</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">4</div>
            <p className="text-xs text-muted-foreground">3个高优先?/p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">风险供应?/CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">1</div>
            <p className="text-xs text-muted-foreground">需要重点关?/p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">缓解措施</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">12</div>
            <p className="text-xs text-muted-foreground">已完?�?/p>
          </CardContent>
        </Card>
      </div>

      {/* 风险指标仪表?*/}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            风险指标监控
          </CardTitle>
          <CardDescription>各类风险指标的实时监控状?/CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(metric => (
              <div key={metric.category} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{metric.category}</h3>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      metric.currentScore > metric.threshold
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {metric.currentScore}/{metric.threshold}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.currentScore > metric.threshold
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (metric.currentScore / metric.threshold) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {metric.alerts} 个警?                  </span>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'increasing' && (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    )}
                    {metric.trend === 'decreasing' && (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span
                      className={`${
                        metric.trend === 'increasing'
                          ? 'text-red-500'
                          : metric.trend === 'decreasing'
                            ? 'text-green-500'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {metric.trend === 'increasing'
                        ? '上升'
                        : metric.trend === 'decreasing'
                          ? '下降'
                          : '稳定'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 风险警报列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              风险警报
            </CardTitle>
            <CardDescription>当前需要关注的风险事项</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.status === 'active'
                      ? 'border-red-200 bg-red-50/30'
                      : alert.status === 'acknowledged'
                        ? 'border-yellow-200 bg-yellow-50/30'
                        : 'border-green-200 bg-green-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <h3 className="font-medium">{alert.title}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          确认警报
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResolve(alert.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          标记已解?                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getTypeColor(alert.type)}>
                      {alert.type === 'supplier'
                        ? '供应商风?
                        : alert.type === 'market'
                          ? '市场风险'
                          : alert.type === 'financial'
                            ? '财务风险'
                            : alert.type === 'operational'
                              ? '运营风险'
                              : '地缘政治风险'}
                    </Badge>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity === 'critical'
                        ? '严重'
                        : alert.severity === 'high'
                          ? '高风?
                          : alert.severity === 'medium'
                            ? '中等风险'
                            : '低风?}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getStatusColor(alert.status)}
                    >
                      {alert.status === 'active'
                        ? '活跃'
                        : alert.status === 'acknowledged'
                          ? '已确?
                          : '已解?}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    检测时? {new Date(alert.detectedAt).toLocaleString()}
                  </div>

                  <div className="text-xs">
                    <span className="text-muted-foreground">置信? </span>
                    <span className="font-medium">
                      {(alert.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>当前没有符合条件的风险警?/p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 供应商风险档?*/}
        <Card>
          <CardHeader>
            <CardTitle>供应商风险档?/CardTitle>
            <CardDescription>关键供应商的风险评估状?/CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplierRisks.map(supplier => (
                <div
                  key={supplier.supplierId}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{supplier.supplierName}</h3>
                    <Badge
                      variant={
                        supplier.status === 'high_risk'
                          ? 'destructive'
                          : supplier.status === 'watch'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {supplier.status === 'high_risk'
                        ? '高风?
                        : supplier.status === 'watch'
                          ? '观察'
                          : '正常'}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">总体风险</span>
                      <span className="font-medium">
                        {supplier.overallRisk}/100
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          supplier.overallRisk > 70
                            ? 'bg-red-500'
                            : supplier.overallRisk > 50
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${supplier.overallRisk}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">上次评估:</span>
                      <span className="ml-1">{supplier.lastAssessment}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">下次复评:</span>
                      <span className="ml-1">{supplier.nextReview}</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-3">
                    详细分析
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
