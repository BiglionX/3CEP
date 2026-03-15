'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  partner: {
    name: string;
    type: 'supplier' | 'customer';
    country: string;
  };
  type: 'purchase' | 'sales' | 'service' | 'nda';
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  renewalDate: string;
  amount: number;
  currency: string;
  paymentTerms: string;
  responsiblePerson: string;
  lastModified: string;
  attachments: number;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState('all');

  // 模拟数据
  useEffect(() => {
    const loadContracts = () => {
      setLoading(true);

      setTimeout(() => {
        const mockContracts: Contract[] = [
          {
            id: '1',
            contractNumber: 'CNT-2026-001',
            title: 'Samsung 电子产品年度采购协议',
            partner: {
              name: 'Samsung Electronics Co., Ltd.',
              type: 'supplier',
              country: '韩国',
            },
            type: 'purchase',
            status: 'active',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            renewalDate: '2026-11-30',
            amount: 50000000,
            currency: 'USD',
            paymentTerms: '30天账期',
            responsiblePerson: '张经理',
            lastModified: '2026-02-25',
            attachments: 3,
          },
          {
            id: '2',
            contractNumber: 'CNT-2026-002',
            title: 'TechGlobal 智能手机销售合同',
            partner: {
              name: 'TechGlobal Ltd.',
              type: 'customer',
              country: '美国',
            },
            type: 'sales',
            status: 'active',
            startDate: '2026-02-01',
            endDate: '2026-07-31',
            renewalDate: '2026-06-30',
            amount: 35000000,
            currency: 'USD',
            paymentTerms: '预付款50%',
            responsiblePerson: '李总监',
            lastModified: '2026-02-24',
            attachments: 5,
          },
          {
            id: '3',
            contractNumber: 'CNT-2026-003',
            title: 'Sony 游戏机独家代理协议',
            partner: {
              name: 'Sony Corporation',
              type: 'supplier',
              country: '日本',
            },
            type: 'purchase',
            status: 'pending',
            startDate: '2026-03-01',
            endDate: '2027-02-28',
            renewalDate: '2027-01-31',
            amount: 25000000,
            currency: 'USD',
            paymentTerms: '60天账期',
            responsiblePerson: '王主管',
            lastModified: '2026-02-23',
            attachments: 2,
          },
          {
            id: '4',
            contractNumber: 'CNT-2026-004',
            title: 'Digital Solutions 服务器采购合同',
            partner: {
              name: 'Digital Solutions GmbH',
              type: 'customer',
              country: '德国',
            },
            type: 'sales',
            status: 'draft',
            startDate: '2026-04-01',
            endDate: '2026-09-30',
            renewalDate: '',
            amount: 18000000,
            currency: 'EUR',
            paymentTerms: '待确认',
            responsiblePerson: '陈经理',
            lastModified: '2026-02-22',
            attachments: 1,
          },
          {
            id: '5',
            contractNumber: 'CNT-2025-015',
            title: 'Panasonic 电池供应终止协议',
            partner: {
              name: 'Panasonic Corporation',
              type: 'supplier',
              country: '日本',
            },
            type: 'purchase',
            status: 'terminated',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            renewalDate: '',
            amount: 12000000,
            currency: 'USD',
            paymentTerms: '已结算',
            responsiblePerson: '刘专员',
            lastModified: '2026-01-15',
            attachments: 4,
          },
        ];

        setContracts(mockContracts);
        setLoading(false);
      }, 800);
    };

    loadContracts();
  }, []);

  // 筛选逻辑
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract.contractNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.partner.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    const matchesPartnerType =
      partnerTypeFilter === 'all' ||
      contract.partner.type === partnerTypeFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPartnerType;
  });

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      draft: '草稿',
      pending: '待审批',
      active: '生效中',
      expired: '已过期',
      terminated: '已终止',
    };
    return textMap[status] || status;
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      purchase: <Building className="h-4 w-4" />,
      sales: <DollarSign className="h-4 w-4" />,
      service: <User className="h-4 w-4" />,
      nda: <FileText className="h-4 w-4" />,
    };
    return iconMap[type] || <FileText className="h-4 w-4" />;
  };

  const getTypeText = (type: string) => {
    const textMap: Record<string, string> = {
      purchase: '采购合同',
      sales: '销售合同',
      service: '服务合同',
      nda: '保密协议',
    };
    return textMap[type] || type;
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewContract = (contractId: string) => {
    // TODO: 实现查看详情功能
    console.debug('查看合同详情:', contractId);
  };

  const handleCreateContract = () => {
    // TODO: 实现创建合同功能
    console.debug('创建新合同');
  };

  const handleExport = () => {
    // TODO: 实现导出功能
    console.debug('导出合同数据');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载合同数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">合同管理</h1>
          <p className="mt-2 text-gray-600">
            管理所有商务合同的签署、执行和归档
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Button onClick={handleCreateContract}>
            <Plus className="h-4 w-4 mr-2" />
            创建合同
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总合同数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground">所有合同档案</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生效中</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">当前有效合同</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                contracts.filter(c => ['draft', 'pending'].includes(c.status))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">需要审批的合同</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                contracts.filter(
                  c =>
                    c.status === 'active' &&
                    getDaysUntilExpiry(c.endDate) <= 30 &&
                    getDaysUntilExpiry(c.endDate) > 0
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">30天内到期合同</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总金额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                contracts.reduce((sum, c) => sum + c.amount, 0) / 1000000
              ).toFixed(1)}
              M
            </div>
            <p className="text-xs text-muted-foreground">合同总价值</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索合同编号、标题或合作伙伴..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="合同状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
                <SelectItem value="terminated">已终止</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="合同类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="purchase">采购合同</SelectItem>
                <SelectItem value="sales">销售合同</SelectItem>
                <SelectItem value="service">服务合同</SelectItem>
                <SelectItem value="nda">保密协议</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={partnerTypeFilter}
              onValueChange={setPartnerTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="合作方类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="supplier">供应商</SelectItem>
                <SelectItem value="customer">客户</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 合同表格 */}
      <Card>
        <CardHeader>
          <CardTitle>合同列表</CardTitle>
          <CardDescription>
            共找到 {filteredContracts.length} 个符合条件的合同
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同信息</TableHead>
                  <TableHead>合作伙伴</TableHead>
                  <TableHead>类型/状态</TableHead>
                  <TableHead>金额/条款</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        暂无合同数据
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ||
                        statusFilter !== 'all' ||
                        typeFilter !== 'all' ||
                        partnerTypeFilter !== 'all'
                           '没有找到匹配的合同'
                          : '开始创建第一个合同吧'}
                      </p>
                      {!searchTerm &&
                        statusFilter === 'all' &&
                        typeFilter === 'all' &&
                        partnerTypeFilter === 'all' && (
                          <div className="mt-6">
                            <Button onClick={handleCreateContract}>
                              <Plus className="h-4 w-4 mr-2" />
                              创建合同
                            </Button>
                          </div>
                        )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map(contract => {
                    const daysUntilExpiry = getDaysUntilExpiry(
                      contract.endDate
                    );
                    const isExpiringSoon =
                      contract.status === 'active' &&
                      daysUntilExpiry <= 30 &&
                      daysUntilExpiry > 0;

                    return (
                      <TableRow key={contract.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {contract.contractNumber}
                              </span>
                              {isExpiringSoon && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  即将到期
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {contract.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <FileText className="h-3 w-3" />
                              {contract.attachments} 个附件
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {contract.partner.name}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Building className="h-3 w-3" />
                              {contract.partner.country}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {getTypeIcon(contract.type)}
                              {getTypeText(contract.type)}
                            </Badge>
                            <Badge className={getStatusColor(contract.status)}>
                              {getStatusText(contract.status)}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {contract.currency === 'USD'  '$' : '€'}
                              {(contract.amount / 1000000).toFixed(1)}M
                            </div>
                            <div className="text-sm text-gray-500">
                              {contract.paymentTerms}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="text-sm">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {contract.startDate} 至{contract.endDate}
                            </div>
                            {contract.renewalDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                续签: {contract.renewalDate}
                              </div>
                            )}
                            {isExpiringSoon && (
                              <div className="text-xs text-orange-600 mt-1">
                                {daysUntilExpiry} 天后到期
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {contract.responsiblePerson}
                            </div>
                            <div className="text-xs text-gray-500">
                              更新: {contract.lastModified}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewContract(contract.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
