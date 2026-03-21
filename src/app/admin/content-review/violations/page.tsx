'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  UserPenalty,
  ViolationRecord,
} from '@/lib/violation-management-service';
import {
  AlertTriangle,
  Award,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Hammer,
  History,
  RefreshCw,
  Scale,
  Search,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ViolationWithDetails extends ViolationRecord {
  userName: string;
  contentTitle: string;
}

const ViolationSeverityBadge: React.FC<{ severity: string }> = ({
  severity,
}) => {
  const getSeverityStyle = () => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'serious':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getSeverityStyle()} font-medium capitalize`}>
      {severity === 'severe'
        ? '严重'
        : severity === 'serious'
          ? '重度'
          : severity === 'moderate'
            ? '中度'
            : '轻微'}
    </Badge>
  );
};

const PenaltyStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'lifted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`${getStatusStyle()} capitalize`}>
      {status === 'active'
        ? '生效中'
        : status === 'expired'
          ? '已过期'
          : '已解除'}
    </Badge>
  );
};

const ViolationListItem: React.FC<{
  violation: ViolationWithDetails;
  onSelect: (violation: ViolationWithDetails) => void;
}> = ({ violation, onSelect }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Hammer className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'appealed':
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => onSelect(violation)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon(violation.status)}
            <ViolationSeverityBadge severity={violation.severity} />
            <Badge variant="outline" className="text-xs capitalize">
              {violation.status === 'pending'
                ? '待处理'
                : violation.status === 'processing'
                  ? '处理中'
                  : violation.status === 'resolved'
                    ? '已解决'
                    : violation.status === 'appealed'
                      ? '申诉中'
                      : '已驳回'}
            </Badge>
          </div>

          <h3 className="font-medium text-gray-900 mb-1">
            {violation.contentTitle || '违规内容'}
          </h3>

          <p className="text-sm text-gray-600 mb-2">{violation.description}</p>

          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {violation.userName ||
                violation.reporterId?.substring(0, 8) ||
                '匿名用户'}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(violation.detectedAt).toLocaleString()}
            </span>
            <span className="flex items-center">
              <FileText className="w-3 h-3 mr-1" />
              {violation.violationType}
            </span>
          </div>
        </div>

        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          查看详情
        </Button>
      </div>
    </div>
  );
};

const PenaltyManagementPanel: React.FC<{
  penalties: UserPenalty[];
  userId: string;
}> = ({ penalties }) => {
  if (penalties.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">无处罚记录</h3>
          <p className="text-gray-600">该用户暂无任何处罚记录</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ban className="w-5 h-5 mr-2" />
          处罚记录 ({penalties.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {penalties.map((penalty, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      penalty.penaltyType === 'warning'
                        ? 'secondary'
                        : penalty.penaltyType === 'temporary_suspension'
                          ? 'destructive'
                          : 'outline'
                    }
                  >
                    {penalty.penaltyType === 'warning'
                      ? '警告'
                      : penalty.penaltyType === 'temporary_suspension'
                        ? '临时封禁'
                        : '永久封禁'}
                  </Badge>
                  <PenaltyStatusBadge status={penalty.status} />
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(penalty.startDate).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-700 mb-2">{penalty.reason}</p>

              {penalty.endDate && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">结束时间:</span>{' '}
                  {new Date(penalty.endDate).toLocaleDateString()}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">
                  处理 {penalty.issuerId}
                </span>
                {penalty.status === 'active' && (
                  <Button size="sm" variant="outline">
                    解除处罚
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ViolationManagementPage() {
  const [violations, setViolations] = useState<ViolationWithDetails[]>([]);
  const [penalties, setPenalties] = useState<UserPenalty[]>([]);
  const [selectedViolation, setSelectedViolation] =
    useState<ViolationWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const _interval = setInterval(loadData, 30000); // 30 秒刷新一次
    return () => clearInterval(_interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 模拟获取违规记录
      const mockViolations: ViolationWithDetails[] = [
        {
          id: 'vio_1',
          contentId: 'content_123',
          violationType: 'spam',
          severity: 'moderate',
          description: '发布垃圾营销内容，包含大量无关链接',
          evidence: ['截图1.jpg', '链接列表.txt'],
          detectionMethod: 'auto',
          detectedAt: Date.now() - 86400000, // 1天前
          status: 'processing',
          resolution: {
            action: 'content_removed',
            reason: '违规内容已移除',
            resolvedAt: Date.now() - 43200000, // 12 小时前
            resolverId: 'moderator_001',
          },
          reporterId: 'user_spammer123',
          userName: '营销推广账号',
          contentTitle: '免费领取最新iPhone',
        },
        {
          id: 'vio_2',
          contentId: 'content_456',
          violationType: 'harassment',
          severity: 'serious',
          description: '对其他用户进行言语攻击和威胁',
          evidence: ['聊天记录截图.png'],
          detectionMethod: 'user_report',
          detectedAt: Date.now() - 172800000, // 2天前
          status: 'pending',
          reporterId: 'user_harasser456',
          userName: '恶意用户账号',
          contentTitle: '威胁性言论',
        },
        {
          id: 'vio_3',
          contentId: 'content_789',
          violationType: 'copyright',
          severity: 'severe',
          description: '未经授权使用受版权保护的内容',
          evidence: ['原作品对pdf', '侵权内容.docx'],
          detectionMethod: 'manual',
          detectedAt: Date.now() - 259200000, // 3天前
          status: 'resolved',
          resolution: {
            action: 'content_removed',
            reason: '确认侵犯版权，内容已删除',
            resolvedAt: Date.now() - 172800000, // 2天前
            resolverId: 'legal_team',
          },
          reporterId: 'user_copyright789',
          userName: '侵权内容发布者',
          contentTitle: '盗版软件分享',
        },
      ];

      // 模拟处罚记录
      const mockPenalties: UserPenalty[] = [
        {
          userId: 'user_spammer123',
          penaltyType: 'warning',
          reason: '首次发布垃圾内容',
          startDate: Date.now() - 86400000,
          status: 'active',
          violationIds: ['vio_1'],
          issuerId: 'system',
        },
        {
          userId: 'user_harasser456',
          penaltyType: 'temporary_suspension',
          reason: '严重骚扰行为',
          startDate: Date.now() - 172800000,
          endDate: Date.now() + 432000000, // 5天后结束
          status: 'active',
          violationIds: ['vio_2'],
          issuerId: 'moderator_001',
        },
      ];

      setViolations(mockViolations);
      setPenalties(mockPenalties);
    } catch (error) {
      console.error('加载违规数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViolationSelect = (violation: ViolationWithDetails) => {
    setSelectedViolation(violation);
  };

  const filteredViolations = violations.filter(violation => {
    const matchesSearch =
      violation.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === 'all' || violation.violationType === typeFilter;
    const matchesStatus =
      statusFilter === 'all' || violation.status === statusFilter;
    const matchesSeverity =
      severityFilter === 'all' || violation.severity === severityFilter;
    const showResolvedFilter = showResolved || violation.status !== 'resolved';

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesSeverity &&
      showResolvedFilter
    );
  });

  const getStatistics = () => {
    return {
      total: violations.length,
      pending: violations.filter(v => v.status === 'pending').length,
      processing: violations.filter(v => v.status === 'processing').length,
      resolved: violations.filter(v => v.status === 'resolved').length,
      appealed: violations.filter(v => v.status === 'appealed').length,
    };
  };

  const stats = getStatistics();

  if (loading && violations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部区域 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-red-600" />
              违规处理中心
            </h1>
            <p className="mt-2 text-gray-600">统一管理和处理平台违规行为</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-resolved"
                checked={showResolved}
                onCheckedChange={setShowResolved}
              />
              <Label htmlFor="show-resolved" className="text-sm text-gray-600">
                显示已解{' '}
              </Label>
            </div>

            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">总违规数</p>
                  <p className="text-xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2 mr-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">待处理</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Hammer className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">处理中</p>
                  <p className="text-xl font-bold text-blue-600">
                    {stats.processing}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">已解决</p>
                  <p className="text-xl font-bold text-green-600">
                    {stats.resolved}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-2 mr-3">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">申诉中</p>
                  <p className="text-xl font-bold text-purple-600">
                    {stats.appealed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 违规列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  违规记录列表
                </span>
                <span className="text-sm text-gray-500">
                  {filteredViolations.length} 条记录
                </span>
              </CardTitle>

              {/* 搜索和筛*/}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索违规内容、用户或描述..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="违规类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="spam">垃圾信息</SelectItem>
                    <SelectItem value="harassment">骚扰行为</SelectItem>
                    <SelectItem value="copyright">版权侵犯</SelectItem>
                    <SelectItem value="inappropriate">不当内容</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="处理状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="processing">处理中</SelectItem>
                    <SelectItem value="resolved">已解决</SelectItem>
                    <SelectItem value="appealed">申诉中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 mt-3">
                <Select
                  value={severityFilter}
                  onValueChange={setSeverityFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="严重程度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有程度</SelectItem>
                    <SelectItem value="minor">轻微</SelectItem>
                    <SelectItem value="moderate">中度</SelectItem>
                    <SelectItem value="serious">重度</SelectItem>
                    <SelectItem value="severe">严重</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredViolations.map(violation => (
                  <ViolationListItem
                    key={violation.id}
                    violation={violation}
                    onSelect={handleViolationSelect}
                  />
                ))}

                {filteredViolations.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      暂无违规记录
                    </h3>
                    <p className="text-gray-600">
                      根据当前筛选条件未找到相关记录
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 详细信息面板 */}
        <div className="lg:col-span-1">
          {selectedViolation ? (
            <div className="space-y-6">
              {/* 违规详情 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    违规详情
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">违规类型</Label>
                      <p className="text-gray-900">
                        {selectedViolation.violationType}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">严重程度</Label>
                      <ViolationSeverityBadge
                        severity={selectedViolation.severity}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">检测方式</Label>
                      <Badge variant="outline" className="capitalize">
                        {selectedViolation.detectionMethod === 'auto'
                          ? '自动检测'
                          : selectedViolation.detectionMethod === 'manual'
                            ? '人工审核'
                            : '用户举报'}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">违规描述</Label>
                      <p className="text-gray-700">
                        {selectedViolation.description}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">证据材料</Label>
                      <div className="mt-2 space-y-1">
                        {selectedViolation.evidence.map((evidence, index) => (
                          <div
                            key={index}
                            className="text-sm text-blue-600 hover:underline cursor-pointer"
                          >
                            📎 {evidence}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedViolation.resolution && (
                      <div className="border-t pt-4">
                        <Label className="text-sm font-medium">处理结果</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-20">
                              操作:
                            </span>
                            <Badge variant="secondary">
                              {selectedViolation.resolution.action ===
                              'content_removed'
                                ? '内容移除'
                                : selectedViolation.resolution.action ===
                                    'content_modified'
                                  ? '内容修改'
                                  : selectedViolation.resolution.action ===
                                      'account_warned'
                                    ? '账户警告'
                                    : selectedViolation.resolution.action ===
                                        'account_suspended'
                                      ? '账户暂停'
                                      : '账户封禁'}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-20">
                              处理
                            </span>
                            <span className="text-sm">
                              {selectedViolation.resolution.resolverId}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-20">
                              处理时间:
                            </span>
                            <span className="text-sm">
                              {new Date(
                                selectedViolation.resolution.resolvedAt
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">原因:</span>
                            <p className="text-sm text-gray-700 mt-1">
                              {selectedViolation.resolution.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 处罚管理 */}
              <PenaltyManagementPanel
                penalties={penalties.filter(
                  p => p.userId === selectedViolation.reporterId
                )}
                userId={selectedViolation.reporterId || ''}
              />

              {/* 操作按钮 */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    处理违规
                  </Button>

                  {selectedViolation.status === 'resolved' && (
                    <Button variant="outline" className="w-full">
                      <History className="w-4 h-4 mr-2" />
                      查看历史
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  选择违规记录
                </h3>
                <p className="text-gray-600">
                  从左侧列表中选择一条违规记录查看详{' '}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
