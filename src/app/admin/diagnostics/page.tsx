'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRbacPermission } from '@/hooks/use-rbac-permission';
import {
  AlertCircle,
  Download,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DiagnosticRecord {
  id: string;
  device_id: string;
  device_model: string;
  fault_type: string;
  diagnostic_result: string;
  confidence_score: number;
  technician_id: string;
  technician_name: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  cost_estimate: number;
  repair_time: number;
}

export default function DiagnosticsManagement() {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([]);
  const [filteredDiagnostics, setFilteredDiagnostics] = useState<
    DiagnosticRecord[]
  >([]);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosticRecord | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');

  // 权限检查
  // @ts-ignore - useRbacPermission returns an object with hasPermission method
  const { hasPermission } = useRbacPermission();
  const canView = hasPermission('diagnostics.view');
  const canManage = hasPermission('diagnostics.manage');
  const canDelete = hasPermission('diagnostics.delete');

  // 筛选条件
  const [filters, setFilters] = useState({
    status: '',
    faultType: '',
    dateRange: [] as any[],
  });

  // 获取诊断记录
  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      const mockData: DiagnosticRecord[] = [
        {
          id: 'diag_001',
          device_id: 'dev_12345',
          device_model: 'iPhone 14 Pro',
          fault_type: '屏幕损坏',
          diagnostic_result: '屏幕总成需要更换，预估费用 1200 元',
          confidence_score: 95,
          technician_id: 'tech_001',
          technician_name: '张师傅',
          status: 'completed',
          created_at: '2024-01-20T10:30:00Z',
          updated_at: '2024-01-20T11:45:00Z',
          cost_estimate: 1200,
          repair_time: 120,
        },
        {
          id: 'diag_002',
          device_id: 'dev_12346',
          device_model: 'Samsung Galaxy S23',
          fault_type: '电池老化',
          diagnostic_result: '电池健康度降至 75%，建议更换',
          confidence_score: 88,
          technician_id: 'tech_002',
          technician_name: '李师傅',
          status: 'pending',
          created_at: '2024-01-20T14:20:00Z',
          updated_at: '2024-01-20T14:20:00Z',
          cost_estimate: 280,
          repair_time: 90,
        },
        {
          id: 'diag_003',
          device_id: 'dev_12347',
          device_model: 'Huawei Mate 50',
          fault_type: '摄像头故障',
          diagnostic_result: '后置主摄无法对焦，需要专业维修',
          confidence_score: 92,
          technician_id: 'tech_003',
          technician_name: '王师傅',
          status: 'failed',
          created_at: '2024-01-20T16:15:00Z',
          updated_at: '2024-01-20T17:30:00Z',
          cost_estimate: 450,
          repair_time: 180,
        },
      ];

      setDiagnostics(mockData);
      setFilteredDiagnostics(mockData);
    } catch (error) {
      console.error('获取诊断记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  const applyFilters = () => {
    let filtered = [...diagnostics];

    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    if (filters.faultType) {
      filtered = filtered.filter(record =>
        record.fault_type
          .toLowerCase()
          .includes(filters.faultType.toLowerCase())
      );
    }

    setFilteredDiagnostics(filtered);
  };

  // 处理筛选变化
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 查看详情
  const handleView = (record: DiagnosticRecord) => {
    setSelectedRecord(record);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  // 编辑记录
  const handleEdit = (record: DiagnosticRecord) => {
    setSelectedRecord(record);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  // 删除记录
  const handleDelete = (record: DiagnosticRecord) => {
    if (confirm(`确定要删除诊断记录 ${record.id} 吗？`)) {
      // 模拟删除操作
      fetchDiagnostics(); // 重新加载数据
    }
  };

  // 导出数据
  const handleExport = () => {
    console.log('导出数据');
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchDiagnostics();
  };

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: '待处理' },
      completed: { variant: 'default' as const, text: '已完成' },
      failed: { variant: 'destructive' as const, text: '失败' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  // 表格列定义
  const columns = [
    { key: 'id', title: '诊断编号', width: '120px' },
    { key: 'device', title: '设备信息', width: '180px' },
    { key: 'fault_type', title: '故障类型', width: '120px' },
    { key: 'diagnostic_result', title: '诊断结果', width: '250px' },
    { key: 'confidence_score', title: '置信度', width: '100px' },
    { key: 'technician_name', title: '技师', width: '100px' },
    { key: 'status', title: '状态', width: '100px' },
    { key: 'created_at', title: '创建时间', width: '160px' },
    { key: 'actions', title: '操作', width: '150px' },
  ];

  // 初始化数据
  useEffect(() => {
    fetchDiagnostics();
  }, []);

  // 筛选变化时重新应用筛选
  useEffect(() => {
    applyFilters();
  }, [filters, diagnostics]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">您没有权限查看诊断服务管理</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">诊断服务管理</h1>
          <p className="text-gray-600 mt-1">管理设备诊断记录和服务质量监控</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          {canManage && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增诊断
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">筛选条目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索故障类型"
                className="pl-10"
                value={filters.faultType}
                onChange={e => handleFilterChange('faultType', e.target.value)}
              />
            </div>

            <Input
              type="date"
              placeholder="开始日期"
              value={filters.dateRange[0] || ''}
              onChange={e =>
                handleFilterChange('dateRange', [
                  e.target.value,
                  filters.dateRange[1],
                ])
              }
            />

            <Input
              type="date"
              placeholder="结束日期"
              value={filters.dateRange[1] || ''}
              onChange={e =>
                handleFilterChange('dateRange', [
                  filters.dateRange[0],
                  e.target.value,
                ])
              }
            />
          </div>
          <div className="mt-4">
            <Button onClick={applyFilters}>应用筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总诊断数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {diagnostics.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {diagnostics.filter(d => d.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              待处理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {diagnostics.filter(d => d.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              平均置信度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {Math.round(
                diagnostics.reduce((sum, d) => sum + d.confidence_score, 0) /
                  diagnostics.length || 0
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>诊断记录列表</CardTitle>
          <CardDescription>
            共 {filteredDiagnostics.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDiagnostics.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiagnostics.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.device_model}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {record.device_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.fault_type}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.diagnostic_result}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.confidence_score > 90
                              ? 'default'
                              : record.confidence_score > 70
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {record.confidence_score}%
                        </Badge>
                      </TableCell>
                      <TableCell>{record.technician_name}</TableCell>
                      <TableCell>{renderStatusTag(record.status)}</TableCell>
                      <TableCell>
                        {new Date(record.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(record)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 详情/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view' ? '诊断详情' : '编辑诊断'}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    诊断编号
                  </label>
                  <Input value={selectedRecord.id} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    设备型号
                  </label>
                  <Input
                    value={selectedRecord.device_model}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    故障类型
                  </label>
                  <Input
                    value={selectedRecord.fault_type}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    状态
                  </label>
                  <Select
                    value={selectedRecord.status}
                    onValueChange={() => {}}
                    disabled={dialogMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待处理</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="failed">失败</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    技师
                  </label>
                  <Input
                    value={selectedRecord.technician_name}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    置信度(%)
                  </label>
                  <Input
                    type="number"
                    value={selectedRecord.confidence_score}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                {selectedRecord.cost_estimate !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      预估费用 (元)
                    </label>
                    <Input
                      type="number"
                      value={selectedRecord.cost_estimate}
                      readOnly={dialogMode === 'view'}
                    />
                  </div>
                )}
                {selectedRecord.repair_time !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      预计维修时间 (分钟)
                    </label>
                    <Input
                      type="number"
                      value={selectedRecord.repair_time}
                      readOnly={dialogMode === 'view'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  诊断结果
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={selectedRecord.diagnostic_result}
                  readOnly={dialogMode === 'view'}
                />
              </div>

              {dialogMode === 'edit' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button>保存</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
