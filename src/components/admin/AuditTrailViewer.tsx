'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { AuditService, type AuditLog } from '@/services/audit-service';
import { format } from 'date-fns';
import {
  Activity,
  Calendar,
  Database,
  Download,
  Filter,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AuditTrailViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    resource: '',
    action: '',
    date_from: '',
    date_to: '',
  });

  const pageSize = 20;

  // 加载审计日志
  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, filters]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const result = await AuditService.getAuditLogs(
        currentPage,
        pageSize,
        filters
      );
      setLogs(result.logs);
      setTotalLogs(result.total);
    } catch (error) {
      console.error('加载审计日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理筛选条件变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // 导出日志
  const exportLogs = async () => {
    setExporting(true);
    try {
      const csvContent = await AuditService.exportLogsAsCSV(filters);

      if (csvContent) {
        const blob = new Blob([`\uFEFF${csvContent}`], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('导出日志失败:', error);
    } finally {
      setExporting(false);
    }
  };

  // 获取操作类型显示样式
  const getActionBadge = (action: string) => {
    const actionStyles: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      create: { bg: 'bg-green-100', text: 'text-green-800', label: '创建' },
      update: { bg: 'bg-blue-100', text: 'text-blue-800', label: '更新' },
      delete: { bg: 'bg-red-100', text: 'text-red-800', label: '删除' },
      view: { bg: 'bg-gray-100', text: 'text-gray-800', label: '查看' },
      approve: { bg: 'bg-purple-100', text: 'text-purple-800', label: '审批' },
      reject: { bg: 'bg-orange-100', text: 'text-orange-800', label: '驳回' },
      publish: { bg: 'bg-teal-100', text: 'text-teal-800', label: '发布' },
    };

    const style = actionStyles[action] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: action,
    };

    return (
      <Badge className={cn(style.bg, style.text, 'px-2 py-1')}>
        {style.label}
      </Badge>
    );
  };

  // 获取资源类型显示名称
  const getResourceName = (resource: string) => {
    const resourceNames: Record<string, string> = {
      user: '用户管理',
      shop: '店铺管理',
      tutorial: '教程管理',
      article: '文章管理',
      config: '系统配置',
      valuation: '估值管理',
      device: '设备管理',
      part: '配件管理',
    };

    return resourceNames[resource] || resource;
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">操作审计日志</h1>
          <p className="text-muted-foreground">
            查看和管理系统中的所有操作记录          </p>
        </div>
        <Button onClick={exportLogs} variant="outline" disabled={exporting}>
          <Download className="w-4 h-4 mr-2" />
          {exporting ? '导出中...' : '导出日志'}
        </Button>
      </div>

      {/* 筛选卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            筛选条件          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 资源类型筛选 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Database className="w-4 h-4 mr-1" />
                资源类型
              </label>
              <Select
                value={filters.resource}
                onValueChange={(v: string) => handleFilterChange('resource', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择资源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部资源</SelectItem>
                  <SelectItem value="user">用户管理</SelectItem>
                  <SelectItem value="shop">店铺管理</SelectItem>
                  <SelectItem value="tutorial">教程管理</SelectItem>
                  <SelectItem value="article">文章管理</SelectItem>
                  <SelectItem value="config">系统配置</SelectItem>
                  <SelectItem value="valuation">估值管理</SelectItem>
                  <SelectItem value="device">设备管理</SelectItem>
                  <SelectItem value="part">配件管理</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 操作类型筛选 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                操作类型
              </label>
              <Select
                value={filters.action}
                onValueChange={(v: string) => handleFilterChange('action', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部操作</SelectItem>
                  <SelectItem value="create">创建</SelectItem>
                  <SelectItem value="update">更新</SelectItem>
                  <SelectItem value="delete">删除</SelectItem>
                  <SelectItem value="view">查看</SelectItem>
                  <SelectItem value="approve">审批</SelectItem>
                  <SelectItem value="reject">驳回</SelectItem>
                  <SelectItem value="publish">发布</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 开始日期 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                开始日期              </label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={e => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            {/* 结束日期 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                结束日期
              </label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={e => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志表格卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>审计日志详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">时间</TableHead>
                  <TableHead className="w-[200px]">用户</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                  <TableHead className="w-[120px]">资源</TableHead>
                  <TableHead>资源ID</TableHead>
                  <TableHead className="w-[120px]">IP地址</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      暂无审计日志记录
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map(log => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {format(
                          new Date(log.created_at),
                          'yyyy-MM-dd HH:mm:ss'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{log.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getResourceName(log.resource)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.resource_id ? (
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {log.resource_id}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控制 */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              共 {totalLogs} 条记录            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                上一页              </Button>

              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">第</span>
                <span className="text-sm font-medium">{currentPage}</span>
                <span className="text-sm text-muted-foreground">页，共</span>
                <span className="text-sm font-medium">{totalPages}</span>
                <span className="text-sm text-muted-foreground">页</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                下一页              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
