'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 简化的Select组件实现
function Select({ value, onValueChange, children }: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: React.ReactNode; 
}) {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SelectValue({ placeholder }: { placeholder: string }) {
  return <option value="">{placeholder}</option>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface PredictionFormProps {
  onSubmit: (data: PredictionRequest) => void;
  loading: boolean;
}

interface PredictionRequest {
  action: 'predict-demand' | 'predict-price';
  productId: string;
  warehouseId?: string;
  platform?: string;
  horizonDays: number;
  options?: Record<string, any>;
}

interface PredictionResult {
  predictions: Array<{
    date: string;
    quantity?: number;
    price?: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
    volumeImpact?: string;
  }>;
  summary: {
    totalQuantity?: number;
    averageDaily?: number;
    priceTrend?: string;
    expectedChange?: number;
    trend?: string;
    confidence: number;
  };
  analysis?: {
    trendFactors: string[];
    riskFactors: string[];
    recommendations: string[];
  };
  marketInsights?: {
    pricingStrategy: string;
    timingOpportunities: string[];
    competitiveActions: string[];
  };
}

export function MLPredictionDashboard() {
  const [activeTab, setActiveTab] = useState<'demand' | 'price'>('demand');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (requestData: PredictionRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ml-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '预测请求失败');
      }

      if (!data.success) {
        throw new Error(data.error || '预测服务返回错误');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      console.error('预测失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">机器学习预测中心</h1>
          <p className="text-gray-600">基于大语言模型的智能预测服务</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 预测表单 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>预测配置</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsComponent 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
              />
              
              <PredictionForm 
                onSubmit={handleSubmit}
                loading={loading}
                predictionType={activeTab}
              />
            </CardContent>
          </Card>

          {/* 预测结果 */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span>正在生成预测...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                <SummaryCard result={result} />
                <TrendAnalysis result={result} />
                <DetailedPredictions result={result} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabsComponent({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: 'demand' | 'price'; 
  onTabChange: (tab: 'demand' | 'price') => void;
}) {
  return (
    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
      <button
        onClick={() => onTabChange('demand')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'demand'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <BarChart3 className="inline mr-2 h-4 w-4" />
        需求预测
      </button>
      <button
        onClick={() => onTabChange('price')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'price'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        💰 价格预测
      </button>
    </div>
  );
}

function PredictionForm({ 
  onSubmit, 
  loading,
  predictionType
}: PredictionFormProps & { predictionType: 'demand' | 'price' }) {
  const [formData, setFormData] = useState({
    productId: 'PROD-001',
    warehouseId: 'warehouse-001',
    platform: 'taobao',
    horizonDays: '30'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData: PredictionRequest = {
      action: predictionType === 'demand' ? 'predict-demand' : 'predict-price',
      productId: formData.productId,
      warehouseId: predictionType === 'demand' ? formData.warehouseId : undefined,
      platform: predictionType === 'price' ? formData.platform : undefined,
      horizonDays: parseInt(formData.horizonDays),
      options: {
        seasonalFactors: ['周末效应', '节假日影响'],
        externalEvents: ['促销活动']
      }
    };

    onSubmit(requestData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="productId">产品ID</Label>
        <Input
          id="productId"
          value={formData.productId}
          onChange={(e) => setFormData({...formData, productId: e.target.value})}
          placeholder="输入产品ID"
          required
        />
      </div>

      {predictionType === 'demand' && (
        <div>
          <Label htmlFor="warehouseId">仓库ID</Label>
          <Input
            id="warehouseId"
            value={formData.warehouseId}
            onChange={(e) => setFormData({...formData, warehouseId: e.target.value})}
            placeholder="输入仓库ID"
            required
          />
        </div>
      )}

      {predictionType === 'price' && (
        <div>
          <Label htmlFor="platform">电商平台</Label>
          <Select 
            value={formData.platform} 
            onValueChange={(value: string) => setFormData({...formData, platform: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="taobao">淘宝</SelectItem>
              <SelectItem value="jd">京东</SelectItem>
              <SelectItem value="tmall">天猫</SelectItem>
              <SelectItem value="pdd">拼多多</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="horizonDays">预测天数</Label>
        <Select 
          value={formData.horizonDays} 
          onValueChange={(value: string) => setFormData({...formData, horizonDays: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择预测周期" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7天</SelectItem>
            <SelectItem value="15">15天</SelectItem>
            <SelectItem value="30">30天</SelectItem>
            <SelectItem value="60">60天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            预测中...
          </>
        ) : (
          '开始预测'
        )}
      </Button>
    </form>
  );
}

function SummaryCard({ result }: { result: PredictionResult }) {
  const isDemand = result.summary.totalQuantity !== undefined;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>预测摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isDemand ? (
            <>
              <SummaryItem 
                label="总预测量" 
                value={`${result.summary.totalQuantity?.toLocaleString()} 件`} 
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <SummaryItem 
                label="日均预测" 
                value={`${result.summary.averageDaily?.toFixed(1)} 件`} 
                icon={<TrendingUp className="h-5 w-5" />}
              />
            </>
          ) : (
            <>
              <SummaryItem 
                label="价格趋势" 
                value={result.summary.priceTrend || '稳定'} 
                icon={
                  result.summary.priceTrend === '上涨' ? 
                    <TrendingUp className="h-5 w-5 text-green-500" /> :
                  result.summary.priceTrend === '下跌' ? 
                    <TrendingDown className="h-5 w-5 text-red-500" /> :
                    <Minus className="h-5 w-5 text-gray-500" />
                }
              />
              <SummaryItem 
                label="预期变化" 
                value={`${result.summary.expectedChange?.toFixed(1) || '0'}%`} 
                icon={<BarChart3 className="h-5 w-5" />}
              />
            </>
          )}
          
          <SummaryItem 
            label="整体置信度" 
            value={`${(result.summary.confidence * 100).toFixed(1)}%`} 
            icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
          />
          <SummaryItem 
            label="波动性" 
            value={result.summary.trend || '稳定'} 
            icon={<AlertCircle className="h-5 w-5 text-yellow-500" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value, icon }: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function TrendAnalysis({ result }: { result: PredictionResult }) {
  const analysis = result.analysis || result.marketInsights;
  
  if (!analysis) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>趋势分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {'trendFactors' in analysis && (
          <AnalysisSection 
            title="趋势因素" 
            items={analysis.trendFactors} 
            color="blue"
          />
        )}
        
        {'riskFactors' in analysis && (
          <AnalysisSection 
            title="风险因素" 
            items={analysis.riskFactors} 
            color="yellow"
          />
        )}
        
        {'recommendations' in analysis && (
          <AnalysisSection 
            title="业务建议" 
            items={analysis.recommendations} 
            color="green"
          />
        )}
        
        {'pricingStrategy' in analysis && analysis.pricingStrategy && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">定价策略</h4>
            <Badge variant="secondary">{analysis.pricingStrategy}</Badge>
          </div>
        )}
        
        {'timingOpportunities' in analysis && analysis.timingOpportunities.length > 0 && (
          <AnalysisSection 
            title="时机机会" 
            items={analysis.timingOpportunities} 
            color="purple"
          />
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisSection({ 
  title, 
  items, 
  color 
}: { 
  title: string; 
  items: string[]; 
  color: string;
}) {
  if (!items || items.length === 0) return null;

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className={colorClasses[color as keyof typeof colorClasses]}
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function DetailedPredictions({ result }: { result: PredictionResult }) {
  const isDemand = result.predictions[0]?.quantity !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>详细预测</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isDemand ? '预测销量' : '预测价格'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  置信度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  置信区间
                </th>
                {!isDemand && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    销量影响
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.predictions.map((prediction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(prediction.date).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isDemand 
                      ? `${prediction.quantity?.toLocaleString()} 件`
                      : `¥${prediction.price?.toFixed(2)}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ConfidenceBadge confidence={prediction.confidence} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isDemand
                      ? `${prediction.lowerBound.toLocaleString()} - ${prediction.upperBound.toLocaleString()} 件`
                      : `¥${prediction.lowerBound.toFixed(2)} - ¥${prediction.upperBound.toFixed(2)}`
                    }
                  </td>
                  {!isDemand && (
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {prediction.volumeImpact}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  let variant: 'default' | 'secondary' | 'destructive' = 'default';
  let text = '';

  if (confidence >= 0.9) {
    variant = 'default';
    text = '高';
  } else if (confidence >= 0.7) {
    variant = 'secondary';
    text = '中';
  } else {
    variant = 'destructive';
    text = '低';
  }

  return (
    <Badge variant={variant}>
      {text} ({(confidence * 100).toFixed(0)}%)
    </Badge>
  );
}