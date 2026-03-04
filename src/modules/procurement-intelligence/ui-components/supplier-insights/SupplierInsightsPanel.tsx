'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Award,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Globe,
  Calendar,
  FileText,
  BarChart3,
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
// import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SupplierProfile {
  id: string;
  companyName: string;
  logo?: string;
  registrationCountry: string;
  businessScale: string;
  establishedYear: number;
  employeeCount: number;
  annualRevenue: number;
  industriesServed: string[];
  certifications: string[];
  complianceStatus: string;
  website?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  overallScore: number;
  capabilityScores: {
    quality: number;
    price: number;
    delivery: number;
    service: number;
    innovation: number;
  };
  riskProfile: {
    financialRisk: 'low' | 'medium' | 'high' | 'critical';
    operationalRisk: 'low' | 'medium' | 'high' | 'critical';
    complianceRisk: 'low' | 'medium' | 'high' | 'critical';
    supplyChainRisk: 'low' | 'medium' | 'high' | 'critical';
  };
  performanceMetrics: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    reliabilityScore: number;
  };
  marketIntelligence: {
    marketShare: number;
    growthRate: number;
    customerSatisfaction: number;
    industryRanking: number;
  };
  collaborationHistory: {
    totalOrders: number;
    successfulDeliveries: number;
    averageResponseTime: number;
    disputeRate: number;
  };
}

interface FinancialData {
  year: number;
  revenue: number;
  profitMargin: number;
  debtRatio: number;
  cashFlow: number;
}

interface PriceHistory {
  date: string;
  commodity: string;
  price: number;
  volume: number;
}

export default function SupplierInsightsPanel({
  supplierId,
}: {
  supplierId?: string;
}) {
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12m');

  useEffect(() => {
    // 模拟加载供应商数?    const loadSupplierData = async () => {
      setLoading(true);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSupplier: SupplierProfile = {
        id: 'SUP-2024-001',
        companyName: '华为技术有限公?,
        registrationCountry: '中国',
        businessScale: 'enterprise',
        establishedYear: 1987,
        employeeCount: 195000,
        annualRevenue: 70000000000,
        industriesServed: ['通信设备', '智能手机', '云计?, '人工智能'],
        certifications: ['ISO 9001', 'ISO 14001', 'TL 9000'],
        complianceStatus: 'compliant',
        website: 'https://www.huawei.com',
        contactInfo: {
          phone: '+86 755 28780808',
          email: 'contact@huawei.com',
        },
        overallScore: 92,
        capabilityScores: {
          quality: 95,
          price: 85,
          delivery: 90,
          service: 88,
          innovation: 94,
        },
        riskProfile: {
          financialRisk: 'low',
          operationalRisk: 'low',
          complianceRisk: 'low',
          supplyChainRisk: 'medium',
        },
        performanceMetrics: {
          qualityScore: 94,
          deliveryScore: 89,
          priceScore: 82,
          serviceScore: 91,
          reliabilityScore: 93,
        },
        marketIntelligence: {
          marketShare: 15.8,
          growthRate: 12.5,
          customerSatisfaction: 4.7,
          industryRanking: 2,
        },
        collaborationHistory: {
          totalOrders: 156,
          successfulDeliveries: 148,
          averageResponseTime: 2.3,
          disputeRate: 1.2,
        },
      };

      const mockFinancialData: FinancialData[] = [
        {
          year: 2023,
          revenue: 70000000000,
          profitMargin: 8.2,
          debtRatio: 0.45,
          cashFlow: 12500000000,
        },
        {
          year: 2022,
          revenue: 64000000000,
          profitMargin: 7.8,
          debtRatio: 0.42,
          cashFlow: 11200000000,
        },
        {
          year: 2021,
          revenue: 67000000000,
          profitMargin: 8.5,
          debtRatio: 0.38,
          cashFlow: 13800000000,
        },
      ];

      const mockPriceHistory: PriceHistory[] = [
        {
          date: '2024-01',
          commodity: '5G基站设备',
          price: 150000,
          volume: 1200,
        },
        {
          date: '2024-02',
          commodity: '5G基站设备',
          price: 148000,
          volume: 1350,
        },
        {
          date: '2024-03',
          commodity: '5G基站设备',
          price: 152000,
          volume: 1180,
        },
        { date: '2024-01', commodity: '服务器芯?, price: 8500, volume: 8500 },
        { date: '2024-02', commodity: '服务器芯?, price: 8300, volume: 9200 },
        { date: '2024-03', commodity: '服务器芯?, price: 8700, volume: 7900 },
      ];

      setSupplier(mockSupplier);
      setFinancialData(mockFinancialData);
      setPriceHistory(mockPriceHistory);
      setLoading(false);
    };

    loadSupplierData();
  }, [supplierId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">未找到供应商信息</h3>
        <p className="mt-2 text-muted-foreground">
          请检查供应商ID或选择其他供应?        </p>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '低风?;
      case 'medium':
        return '中等风险';
      case 'high':
        return '高风?;
      case 'critical':
        return '严重风险';
      default:
        return '未知';
    }
  };

  const CapabilityScoreBar = ({
    label,
    score,
  }: {
    label: string;
    score: number;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}/100</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 供应商基本信息头?*/}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-4">
              {supplier.logo ? (
                <img
                  src={supplier.logo}
                  alt={supplier.companyName}
                  className="w-16 h-16 rounded-lg object-contain border"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{supplier.companyName}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{supplier.registrationCountry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      成立{new Date().getFullYear() - supplier.establishedYear}
                      �?                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{supplier.employeeCount.toLocaleString()}员工</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold">
                {supplier.overallScore}
              </span>
              <span className="text-muted-foreground">综合评分</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {supplier.industriesServed.map((industry, index) => (
              <Badge key={index} variant="secondary">
                {industry}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {supplier.certifications.map((cert, index) => (
              <Badge key={index} variant="outline">
                <Award className="h-3 w-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="capabilities">能力评估</TabsTrigger>
          <TabsTrigger value="financial">财务状况</TabsTrigger>
          <TabsTrigger value="performance">绩效表现</TabsTrigger>
        </TabsList>

        {/* 概览标签?*/}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">质量能力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {supplier.capabilityScores.quality}/100
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">价格竞争?/CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {supplier.capabilityScores.price}/100
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">交付能力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {supplier.capabilityScores.delivery}/100
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">创新能力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {supplier.capabilityScores.innovation}/100
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 风险概况 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                风险评估
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">财务风险</span>
                    <span
                      className={`font-medium ${getRiskColor(supplier.riskProfile.financialRisk)}`}
                    >
                      {getRiskText(supplier.riskProfile.financialRisk)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">运营风险</span>
                    <span
                      className={`font-medium ${getRiskColor(supplier.riskProfile.operationalRisk)}`}
                    >
                      {getRiskText(supplier.riskProfile.operationalRisk)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">合规风险</span>
                    <span
                      className={`font-medium ${getRiskColor(supplier.riskProfile.complianceRisk)}`}
                    >
                      {getRiskText(supplier.riskProfile.complianceRisk)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">供应链风?/span>
                    <span
                      className={`font-medium ${getRiskColor(supplier.riskProfile.supplyChainRisk)}`}
                    >
                      {getRiskText(supplier.riskProfile.supplyChainRisk)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 能力评估标签?*/}
        <TabsContent value="capabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>详细能力评分</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CapabilityScoreBar
                label="产品质量"
                score={supplier.capabilityScores.quality}
              />
              <CapabilityScoreBar
                label="价格竞争?
                score={supplier.capabilityScores.price}
              />
              <CapabilityScoreBar
                label="交付准时?
                score={supplier.capabilityScores.delivery}
              />
              <CapabilityScoreBar
                label="服务水平"
                score={supplier.capabilityScores.service}
              />
              <CapabilityScoreBar
                label="技术创?
                score={supplier.capabilityScores.innovation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 财务状况标签?*/}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>近三年财务表?/CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3y">3�?/SelectItem>
                    <SelectItem value="5y">5�?/SelectItem>
                    <SelectItem value="10y">10�?/SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">年度</th>
                      <th className="text-right py-2">营收(亿元)</th>
                      <th className="text-right py-2">利润?%)</th>
                      <th className="text-right py-2">负债率(%)</th>
                      <th className="text-right py-2">现金?亿元)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.map(data => (
                      <tr
                        key={data.year}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 font-medium">{data.year}</td>
                        <td className="py-3 text-right">
                          {(data.revenue / 100000000).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          {data.profitMargin.toFixed(1)}
                        </td>
                        <td className="py-3 text-right">
                          {(data.debtRatio * 100).toFixed(1)}
                        </td>
                        <td className="py-3 text-right">
                          {(data.cashFlow / 100000000).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 绩效表现标签?*/}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>合作历史</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">总订单数</span>
                  <span className="font-medium">
                    {supplier.collaborationHistory.totalOrders}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">成功交付</span>
                  <span className="font-medium text-green-600">
                    {supplier.collaborationHistory.successfulDeliveries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">平均响应时间</span>
                  <span className="font-medium">
                    {supplier.collaborationHistory.averageResponseTime}小时
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">争议?/span>
                  <span className="font-medium text-red-600">
                    {supplier.collaborationHistory.disputeRate}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>市场地位</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">市场份额</span>
                  <span className="font-medium">
                    {supplier.marketIntelligence.marketShare}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">增长?/span>
                  <span className="font-medium text-green-600">
                    +{supplier.marketIntelligence.growthRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">客户满意?/span>
                  <span className="font-medium">
                    {supplier.marketIntelligence.customerSatisfaction}/5.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">行业排名</span>
                  <span className="font-medium">
                    第{supplier.marketIntelligence.industryRanking}�?                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 底部操作按钮 */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          联系供应?        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          下载报告
        </Button>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          深度分析
        </Button>
      </div>
    </div>
  );
}
