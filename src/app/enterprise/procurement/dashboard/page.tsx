/**
 * 采购仪表板页 * B2B采购服务的核心管理界 */

'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Calendar,
  Filter,
  Download,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { EnterpriseLayout } from '@/components/enterprise/EnterpriseLayout';

// 采购订单类型
interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  items: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// 统计数据类型
interface Stats {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  suppliers: number;
}

export default function ProcurementDashboardPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    suppliers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // 模拟数据
  useEffect(() => {
    const mockOrders: PurchaseOrder[] = [
      {
        id: '1',
        orderNumber: 'PO-2024-001',
        supplier: '深圳电子科技有限公司',
        amount: 125000,
        status: 'approved',
        createdAt: '2024-01-15',
        items: 15,
        priority: 'high',
      },
      {
        id: '2',
        orderNumber: 'PO-2024-002',
        supplier: '广州精密制造厂',
        amount: 89000,
        status: 'pending',
        createdAt: '2024-01-16',
        items: 8,
        priority: 'medium',
      },
      {
        id: '3',
        orderNumber: 'PO-2024-003',
        supplier: '上海半导体材料公,
        amount: 245000,
        status: 'processing',
        createdAt: '2024-01-14',
        items: 22,
        priority: 'urgent',
      },
      {
        id: '4',
        orderNumber: 'PO-2024-004',
        supplier: '北京智能设备,
        amount: 67500,
        status: 'completed',
        createdAt: '2024-01-13',
        items: 12,
        priority: 'low',
      },
    ];

    // 模拟统计计算
    const calculateStats = (orders: PurchaseOrder[]) => {
      return {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.amount, 0),
        pendingOrders: orders.filter(order => order.status === 'pending')
          .length,
        suppliers: new Set(orders.map(order => order.supplier)).size,
      };
    };

    // 模拟加载延迟
    setTimeout(() => {
      setOrders(mockOrders);
      setStats(calculateStats(mockOrders));
      setLoading(false);
    }, 1000);
  }, []);

  // 状态标签映  const statusBadges: Record<
    string,
    {
      text: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    pending: { text: '待审, variant: 'secondary' },
    approved: { text: '已批, variant: 'default' },
    processing: { text: '处理, variant: 'default' },
    completed: { text: '已完, variant: 'default' },
    cancelled: { text: '已取, variant: 'destructive' },
  };

  // 优先级标签映  const priorityBadges: Record<
    string,
    {
      text: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    low: { text: ', variant: 'outline' },
    medium: { text: ', variant: 'secondary' },
    high: { text: ', variant: 'default' },
    urgent: { text: '紧, variant: 'destructive' },
  };

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 格式化金  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  // 格式化日  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <EnterpriseLayout title="采购仪表>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </EnterpriseLayout>
    );
  }

  return (
    <EnterpriseLayout title="采购仪表>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总订单数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              本月新增 {stats.totalOrders} 笔订            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">采购总额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              平均每单 {formatCurrency(stats.totalAmount / stats.totalOrders)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理订/CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground">需要尽快审/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合作供应/CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suppliers}</div>
            <p className="text-xs text-muted-foreground">活跃供应商数/p>
          </CardContent>
        </Card>
      </div>

      {/* 控制面板 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>采购订单管理</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出数据
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建订单
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="搜索订单号或供应.."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="订单状 />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态/SelectItem>
                <SelectItem value="pending">待审/SelectItem>
                <SelectItem value="approved">已批/SelectItem>
                <SelectItem value="processing">处理/SelectItem>
                <SelectItem value="completed">已完/SelectItem>
                <SelectItem value="cancelled">已取/SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="优先 />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先/SelectItem>
                <SelectItem value="low">/SelectItem>
                <SelectItem value="medium">/SelectItem>
                <SelectItem value="high">/SelectItem>
                <SelectItem value="urgent">紧/SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 订单表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单/TableHead>
                  <TableHead>供应/TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>商品数量</TableHead>
                  <TableHead>状/TableHead>
                  <TableHead>优先/TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                    <TableCell>{order.items} /TableCell>
                    <TableCell>
                      <Badge variant={statusBadges[order.status].variant}>
                        {statusBadges[order.status].text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityBadges[order.priority].variant}>
                        {priorityBadges[order.priority].text}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>编辑订单</DropdownMenuItem>
                          <DropdownMenuItem>审批订单</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            取消订单
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              没有找到匹配的订            </div>
          )}
        </CardContent>
      </Card>
    </EnterpriseLayout>
  );
}

