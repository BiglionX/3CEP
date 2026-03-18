'use client';

import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Truck,
} from 'lucide-react';

interface CustomsRecord {
  id: string;
  declarationNumber: string;
  shipmentNumber: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'released';
  declareDate: string;
  customsOffice: string;
  declaredValue: number;
  currency: string;
  goodsDescription: string;
  originCountry: string;
}

export default function CustomsPage() {
  const [records, setRecords] = useState<CustomsRecord[]>([
    {
      id: '1',
      declarationNumber: 'DEC20240315001',
      shipmentNumber: 'SHP20240301001',
      status: 'approved',
      declareDate: '2024-03-15',
      customsOffice: '上海海关',
      declaredValue: 15000,
      currency: 'USD',
      goodsDescription: '电子元器件',
      originCountry: '日本',
    },
    {
      id: '2',
      declarationNumber: 'DEC20240318002',
      shipmentNumber: 'SHP20240302002',
      status: 'processing',
      declareDate: '2024-03-18',
      customsOffice: '深圳海关',
      declaredValue: 8500,
      currency: 'USD',
      goodsDescription: '纺织品',
      originCountry: '越南',
    },
    {
      id: '3',
      declarationNumber: 'DEC20240320003',
      shipmentNumber: 'SHP20240303003',
      status: 'pending',
      declareDate: '2024-03-20',
      customsOffice: '广州海关',
      declaredValue: 22000,
      currency: 'USD',
      goodsDescription: '机械设备',
      originCountry: '德国',
    },
    {
      id: '4',
      declarationNumber: 'DEC20240310004',
      shipmentNumber: 'SHP20240228004',
      status: 'released',
      declareDate: '2024-03-10',
      customsOffice: '北京海关',
      declaredValue: 5600,
      currency: 'USD',
      goodsDescription: '办公用品',
      originCountry: '美国',
    },
    {
      id: '5',
      declarationNumber: 'DEC20240308005',
      shipmentNumber: 'SHP20240225005',
      status: 'rejected',
      declareDate: '2024-03-08',
      customsOffice: '上海海关',
      declaredValue: 12000,
      currency: 'USD',
      goodsDescription: '化妆品',
      originCountry: '韩国',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status: CustomsRecord['status']) => {
    const statusMap = {
      pending: { label: '待申报', className: 'bg-gray-100 text-gray-800' },
      processing: { label: '清关中', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: '已审核', className: 'bg-blue-100 text-blue-800' },
      rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
      released: { label: '已放行', className: 'bg-green-100 text-green-800' },
    };
    const { label, className } = statusMap[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.declarationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.goodsDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    processing: records.filter(r => r.status === 'processing').length,
    approved: records.filter(r => r.status === 'approved' || r.status === 'released').length,
    rejected: records.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报关清关</h1>
          <p className="text-sm text-gray-500">管理进出口报关和清关手续</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          新建报关
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总单据</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待申报</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">清关中</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
              <Truck className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已完成</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索报关单号、货号或商品描述..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待申报</SelectItem>
                <SelectItem value="processing">清关中</SelectItem>
                <SelectItem value="approved">已审核</SelectItem>
                <SelectItem value="rejected">已驳回</SelectItem>
                <SelectItem value="released">已放行</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 报关单列表 */}
      <Card>
        <CardHeader>
          <CardTitle>报关单据</CardTitle>
          <CardDescription>所有进出口报关单据记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报关单号</TableHead>
                <TableHead>货号</TableHead>
                <TableHead>商品描述</TableHead>
                <TableHead>申报日期</TableHead>
                <TableHead>申报价值</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.declarationNumber}
                  </TableCell>
                  <TableCell>{record.shipmentNumber}</TableCell>
                  <TableCell>{record.goodsDescription}</TableCell>
                  <TableCell>{record.declareDate}</TableCell>
                  <TableCell>
                    {record.currency} {record.declaredValue.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
