/**
 * 移动端数据表格组件
 * 在小屏幕上自动转换为卡片布局
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface Column<T> {
  /** 列唯一标识 */
  key: string;
  /** 列标题 */
  title: string;
  /** 渲染函数 */
  render?: (item: T, index: number) => React.ReactNode;
  /** 数据字段名 */
  dataIndex?: keyof T;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否隐藏 (移动端) */
  hideOnMobile?: boolean;
  /** 列宽 */
  width?: string;
  /** 文本对齐方式 */
  align?: 'left' | 'center' | 'right';
}

export interface DataTableMobileProps<T> {
  /** 表格数据 */
  data: T[];
  /** 列定义 */
  columns: Column<T>[];
  /** 行点击回调 */
  onRowClick?: (item: T, index: number) => void;
  /** 自定义行 Key */
  rowKey?: keyof T | ((item: T) => string);
  /** 空数据提示 */
  emptyText?: string;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索占位符 */
  searchPlaceholder?: string;
  /** 搜索回调 */
  onSearch?: (value: string) => void;
  /** 是否显示筛选器 */
  showFilter?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 加载状态 */
  loading?: boolean;
  /** 每页数量 */
  pageSize?: number;
  /** 分页变化回调 */
  onPageChange?: (page: number, pageSize: number) => void;
}

/**
 * 移动端数据表格组件
 *
 * 特性:
 * - 响应式布局 (桌面端表格，移动端卡片)
 * - 支持展开/收起详情
 * - 触控优化
 * - 搜索和筛选
 * - 分页支持
 */
export function DataTableMobile<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  rowKey,
  emptyText = '暂无数据',
  showSearch = false,
  searchPlaceholder = '搜索...',
  onSearch,
  showFilter = false,
  className,
  loading = false,
  pageSize = 10,
  onPageChange,
}: DataTableMobileProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // 获取行唯一标识
  const getRowKey = (item: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return String(rowKey(item));
    }
    if (rowKey) {
      return String(item[rowKey]);
    }
    return `row-${index}`;
  };

  // 过滤和搜索
  const filteredData = useMemo(() => {
    let result = [...data];

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 排序
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // 分页
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // 处理行展开
  const toggleRowExpand = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // 处理排序
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? null : { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
  };

  // 渲染单元格
  const renderCell = (item: T, column: Column<T>, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }
    if (column.dataIndex) {
      return String(item[column.dataIndex]);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 搜索和筛选栏 */}
      {(showSearch || showFilter) && (
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className="pl-10 min-h-[44px]"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          )}

          {showFilter && (
            <Select>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="筛选条件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* 数据列表 (移动端卡片布局) */}
      <div className="space-y-3 md:hidden">
        {paginatedData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{emptyText}</div>
        ) : (
          paginatedData.map((item, index) => {
            const key = getRowKey(item, index);
            const isExpanded = expandedRows.has(key);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
              >
                {/* 主要信息 */}
                <div
                  className={cn(
                    'flex items-center gap-2',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {/* 展开/收起按钮 */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleRowExpand(key);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* 第一列作为主标题 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {renderCell(item, columns[0], index)}
                    </div>
                    {columns[1] && !columns[1].hideOnMobile && (
                      <div className="text-sm text-gray-500 truncate">
                        {renderCell(item, columns[1], index)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 展开的详细信息 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pt-3 border-t space-y-2 overflow-hidden"
                    >
                      {columns.slice(2).map(column => (
                        <div key={column.key} className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            {column.title}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {renderCell(item, column, index)}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 桌面端表格布局 */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.hideOnMobile && 'hidden lg:table-cell',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-gray-700'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.title}</span>
                    {column.sortable &&
                      (sortConfig?.key === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-2 h-2" />
                          <ChevronDown className="w-2 h-2" />
                        </div>
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={getRowKey(item, index)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 whitespace-nowrap text-sm',
                        column.hideOnMobile && 'hidden lg:table-cell',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {renderCell(item, column, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border">
          <div className="text-sm text-gray-500">
            第 {currentPage} 页，共 {totalPages} 页 ({filteredData.length} 条)
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="min-h-[44px] min-w-[44px]"
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="min-h-[44px] min-w-[44px]"
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTableMobile;
