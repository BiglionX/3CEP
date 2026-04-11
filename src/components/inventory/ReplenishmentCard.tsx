'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface ReplenishmentSuggestion {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  currentStock: number;
  suggestedQuantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  forecastData?: {
    summary?: {
      totalPredicted: number;
      averageDaily: number;
    };
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
}

interface ReplenishmentCardProps {
  suggestion: ReplenishmentSuggestion;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onCreateOrder?: (id: string) => Promise<void>;
}

export function ReplenishmentCard({
  suggestion,
  onApprove,
  onReject,
  onCreateOrder,
}: ReplenishmentCardProps) {
  const [loading, setLoading] = useState(false);

  // 优先级配置
  const priorityConfig = {
    urgent: {
      label: '紧急',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: AlertTriangle,
    },
    high: {
      label: '高',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: TrendingUp,
    },
    medium: {
      label: '中',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Package,
    },
    low: {
      label: '低',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Clock,
    },
  };

  const config = priorityConfig[suggestion.priority];
  const PriorityIcon = config.icon;

  // 处理批准
  const handleApprove = async () => {
    if (!onApprove) return;
    setLoading(true);
    try {
      await onApprove(suggestion.id);
    } finally {
      setLoading(false);
    }
  };

  // 处理拒绝
  const handleReject = async () => {
    if (!onReject) return;
    setLoading(true);
    try {
      await onReject(suggestion.id);
    } finally {
      setLoading(false);
    }
  };

  // 处理创建订单
  const handleCreateOrder = async () => {
    if (!onCreateOrder) return;
    setLoading(true);
    try {
      await onCreateOrder(suggestion.id);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 状态徽章
  const statusBadge = {
    pending: <Badge variant="outline">待审批</Badge>,
    approved: <Badge className="bg-green-100 text-green-800">已批准</Badge>,
    rejected: <Badge variant="secondary">已拒绝</Badge>,
    ordered: <Badge className="bg-blue-100 text-blue-800">已下单</Badge>,
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base">{suggestion.itemName}</CardTitle>
              {statusBadge[suggestion.status]}
            </div>
            <CardDescription className="text-xs">
              SKU: {suggestion.sku}
            </CardDescription>
          </div>
          <Badge className={config.color}>
            <PriorityIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 库存信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">当前库存</p>
            <p className="text-2xl font-bold">{suggestion.currentStock} 件</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">建议补货</p>
            <p className="text-2xl font-bold text-purple-600">
              {suggestion.suggestedQuantity} 件
            </p>
          </div>
        </div>

        {/* 预测数据 */}
        {suggestion.forecastData?.summary && (
          <div className="bg-purple-50 p-3 rounded-lg space-y-2">
            <p className="text-xs font-medium text-purple-900 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              AI预测分析
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">30天需求:</span>
                <span className="ml-1 font-medium">
                  {suggestion.forecastData.summary.totalPredicted} 件
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">日均销量:</span>
                <span className="ml-1 font-medium">
                  {suggestion.forecastData.summary.averageDaily} 件
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 推荐理由 */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs font-medium mb-1">推荐理由</p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {suggestion.reason}
          </p>
        </div>

        {/* 时间信息 */}
        <p className="text-xs text-muted-foreground">
          生成时间: {formatDate(suggestion.createdAt)}
        </p>
      </CardContent>

      {/* 操作按钮 */}
      {suggestion.status === 'pending' && (onApprove || onReject) && (
        <CardFooter className="pt-0 flex gap-2">
          {onApprove && (
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              批准
            </Button>
          )}
          {onReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={loading}
              className="flex-1"
            >
              拒绝
            </Button>
          )}
        </CardFooter>
      )}

      {suggestion.status === 'approved' && onCreateOrder && (
        <CardFooter className="pt-0">
          <Button
            size="sm"
            onClick={handleCreateOrder}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Package className="w-4 h-4 mr-1" />
            生成采购订单
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
