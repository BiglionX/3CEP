/**
 * 数据表格组件
 * 通用的数据展示和操作表格
 */

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  filters?: {
    [key: string]: any;
    onChange: (filters: Record<string, any>) => void;
  };
  actions?: {
    label: string;
    onClick: (record: T) => void;
    condition?: (record: T) => boolean;
  }[];
  onRowClick?: (record: T) => void;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  exportable?: boolean;
  onExport?: () => void;
  refreshable?: boolean;
  onRefresh?: () => void;
  emptyText?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  filters,
  actions,
  onRowClick,
  searchable = false,
  onSearch,
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const getValue = (record: T, column: Column<T>): any => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      // 处理嵌套属?      return column.key
        .split('.')
        .reduce((obj: any, key: string) => obj?.[key], record);
    }
    return (record as any)[column.key];
  };

  const renderCell = (
    record: T,
    column: Column<T>,
    index: number
  ): React.ReactNode => {
    const value = getValue(record, column);

    if (column.render) {
      return column.render(value, record, index);
    }

    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? '�? : '�?;
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    return String(value);
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const startItem = (pagination.current - 1) * pagination.pageSize + 1;
    const endItem = Math.min(
      pagination.current * pagination.pageSize,
      pagination.total
    );

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          显示?{startItem} �?{endItem} 条，�?{pagination.total} 条记?        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pagination.onChange(pagination.current - 1, pagination.pageSize)
            }
            disabled={pagination.current <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            �?{pagination.current} 页，�?{totalPages} �?          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pagination.onChange(pagination.current + 1, pagination.pageSize)
            }
            disabled={pagination.current >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg">
      {/* 工具?*/}
      {(searchable || exportable || refreshable || filters) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="搜索..."
                  value={searchValue}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            )}

            {filters && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (key === 'onChange') return null;
                  return (
                    <Select
                      key={key}
                      value={value}
                      onValueChange={newValue =>
                        filters.onChange({ ...filters, [key]: newValue })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={key} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="active">启用</SelectItem>
                        <SelectItem value="inactive">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {refreshable && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {exportable && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 表格主体 */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead
                  key={String(column.key)}
                  style={{ width: column.width ? `${column.width}px` : 'auto' }}
                >
                  {column.title}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="text-right">操作</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    加载?..
                  </div>
                </TableCell>
              </TableRow>
            ) : (data as any)?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow
                  key={index}
                  className={
                    onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
                  }
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map(column => (
                    <TableCell key={String(column.key)}>
                      {renderCell(record, column, index)}
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions
                            .filter(
                              action =>
                                !action.condition || action.condition(record)
                            )
                            .map((action, idx) => (
                              <DropdownMenuItem
                                key={idx}
                                onClick={e => {
                                  e.stopPropagation();
                                  action.onClick(record);
                                }}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pagination && renderPagination()}
    </div>
  );
}
