import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Info,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  category: string;
  status?: 'active' | 'acknowledged' | 'resolved';
}

interface ExecutiveAlertPanelProps {
  alerts: Alert[];
}

export function ExecutiveAlertPanel({ alerts }: ExecutiveAlertPanelProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // 获取严重程度图标
  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-yellow-600" />;
    }
  };

  // 获取严重程度颜色
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-500 border-red-600';
      case 'medium':
        return 'bg-orange-500 border-orange-600';
      case 'low':
        return 'bg-yellow-500 border-yellow-600';
    }
  };

  // 获取状态标签
  const getStatusBadge = (status?: 'active' | 'acknowledged' | 'resolved') => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">活跃</Badge>;
      case 'acknowledged':
        return <Badge variant="default">已确认</Badge>;
      case 'resolved':
        return <Badge variant="secondary">已解决</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <Bell className="h-4 w-4 text-green-600" />;
      case 'business':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'operational':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  // 过滤告警
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity =
      filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus =
      filterStatus === 'all' || alert.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  // 统计信息
  const stats = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    active: alerts.filter(a => a.status === 'active' || !a.status).length,
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="relative"
      >
        <Bell className="h-4 w-4 mr-2" />
        告警中心
        {stats.active > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {stats.active}
          </Badge>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bell className="h-6 w-6" />
                预警监控中心
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDialog(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-600">总计</div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.high}
                  </div>
                  <div className="text-sm text-red-600">高危</div>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.medium}
                  </div>
                  <div className="text-sm text-orange-600">中等</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.low}
                  </div>
                  <div className="text-sm text-yellow-600">低危</div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </div>
                  <div className="text-sm text-green-600">活跃</div>
                </CardContent>
              </Card>
            </div>

            {/* 筛选控制 */}
            <Tabs defaultValue="list" className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <TabsList>
                  <TabsTrigger value="list">
                    <Bell className="h-4 w-4 mr-2" />
                    告警列表
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <Archive className="h-4 w-4 mr-2" />
                    历史记录
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1" />

                <Select
                  value={filterSeverity}
                  onValueChange={setFilterSeverity}
                >
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="严重程度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部级别</SelectItem>
                    <SelectItem value="high">高危</SelectItem>
                    <SelectItem value="medium">中等</SelectItem>
                    <SelectItem value="low">低危</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="acknowledged">已确认</SelectItem>
                    <SelectItem value="resolved">已解决</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索告警..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 w-[250px]"
                  />
                </div>
              </div>

              <TabsContent value="list">
                {/* 告警列表 */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-gray-600">暂无告警信息</p>
                    </div>
                  ) : (
                    filteredAlerts.map(alert => (
                      <Card
                        key={alert.id}
                        className={cn(
                          'hover:shadow-md transition-shadow cursor-pointer',
                          alert.severity === 'high' &&
                            'border-l-4 border-l-red-600',
                          alert.severity === 'medium' &&
                            'border-l-4 border-l-orange-600',
                          alert.severity === 'low' &&
                            'border-l-4 border-l-yellow-600'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getSeverityIcon(alert.severity)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-lg">
                                    {alert.title}
                                  </h4>
                                  {getStatusBadge(alert.status)}
                                  <Badge variant="outline" className="text-xs">
                                    {getCategoryIcon(alert.category)}
                                    <span className="ml-1">
                                      {alert.category === 'financial' && '财务'}
                                      {alert.category === 'user' && '用户'}
                                      {alert.category === 'business' && '业务'}
                                      {alert.category === 'operational' &&
                                        '运营'}
                                    </span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  {new Date(alert.timestamp).toLocaleString(
                                    'zh-CN'
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">
                                {alert.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  查看详情
                                </Button>
                                {alert.status !== 'resolved' && (
                                  <>
                                    <Button variant="outline" size="sm">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      确认告警
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Archive className="h-4 w-4 mr-2" />
                                      标记解决
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">历史告警记录</h3>
                    <p className="text-gray-600 mb-4">
                      查看已解决和已忽略的历史告警信息
                    </p>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      导出历史记录
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 导入需要的组件
import { Download } from 'lucide-react';
