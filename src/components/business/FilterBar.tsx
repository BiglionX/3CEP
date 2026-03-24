/**
 * 筛选栏组件
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key?: string;
  label?: string;
  type: 'select' | 'search' | 'date' | 'daterange';
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: FilterOption[];
}

export interface FilterBarProps {
  filters: FilterConfig[];
  onReset?: () => void;
  onApply?: () => void;
  showBadges?: boolean;
  className?: string;
}

export function FilterBar({
  filters,
  onReset,
  onApply,
  showBadges = true,
  className = '',
}: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<number>(
    filters.filter(f => f.value && f.value !== 'all').length
  );

  const renderFilter = (filter: FilterConfig, index: number) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select value={filter.value || 'all'} onValueChange={filter.onChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label || '选择...'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'search':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={filter.placeholder || '搜索...'}
              value={filter.value || ''}
              onChange={e => filter.onChange(e.target.value)}
              className="pl-9 w-[200px]"
            />
            {filter.value && (
              <button
                onClick={() => filter.onChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={filter.value || ''}
            onChange={e => filter.onChange(e.target.value)}
            className="w-[180px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        {/* 筛选器列表 */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {filters.map((filter, index) => (
            <div key={filter.key || index} className="flex items-center gap-2">
              {filter.label && (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {filter.label}:
                </span>
              )}
              {renderFilter(filter, index)}
            </div>
          ))}
        </div>

        {/* 操作按钮和徽章 */}
        <div className="flex items-center gap-2">
          {showBadges && activeFilters > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeFilters} 个筛选条件
            </Badge>
          )}

          {(onReset || onApply) && (
            <div className="flex gap-2">
              {onReset && (
                <Button variant="outline" size="sm" onClick={onReset}>
                  <Filter className="w-4 h-4 mr-1" />
                  重置
                </Button>
              )}
              {onApply && (
                <Button size="sm" onClick={onApply}>
                  应用
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
