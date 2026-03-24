/**
 * 日期范围选择器组件
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangePickerProps {
  /** 当前值 */
  value?: DateRange;
  /** 值变化回调 */
  onChange?: (range: DateRange) => void;
  /** 快捷选项 */
  presets?: Array<{
    label: string;
    range: DateRange;
  }>;
  /** 是否显示清除按钮 */
  showClear?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 禁用未来日期 */
  disableFuture?: boolean;
  /** 最小日期 */
  minDate?: string;
  /** 最大日期 */
  maxDate?: string;
}

export function DateRangePicker({
  value = { startDate: '', endDate: '' },
  onChange,
  presets,
  showClear = true,
  className = '',
  disableFuture = false,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const today = new Date().toISOString().split('T')[0];

  const handleStartDateChange = (date: string) => {
    if (value.endDate && date > value.endDate) {
      // 如果开始日期晚于结束日期，清空结束日期
      onChange?.({ startDate: date, endDate: '' });
    } else {
      onChange?.({ startDate: date, endDate: value.endDate });
    }
  };

  const handleEndDateChange = (date: string) => {
    onChange?.({ startDate: value.startDate, endDate: date });
  };

  const handlePresetClick = (preset: DateRange) => {
    onChange?.(preset);
  };

  const handleClear = () => {
    onChange?.({ startDate: '', endDate: '' });
  };

  const hasValue = value.startDate || value.endDate;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 快捷选项 */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {presets.map((preset, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handlePresetClick(preset.range)}
            >
              {preset.label}
            </Badge>
          ))}
        </div>
      )}

      {/* 日期输入 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="date"
            value={value.startDate || ''}
            onChange={e => handleStartDateChange(e.target.value)}
            min={minDate}
            max={disableFuture ? today : maxDate}
            className="pl-9"
            placeholder="开始日期"
          />
        </div>

        <span className="text-gray-400">至</span>

        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="date"
            value={value.endDate || ''}
            onChange={e => handleEndDateChange(e.target.value)}
            min={value.startDate || minDate}
            max={disableFuture ? today : maxDate}
            className="pl-9"
            placeholder="结束日期"
          />
        </div>

        {showClear && hasValue && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            清除
          </Button>
        )}
      </div>

      {/* 已选日期范围显示 */}
      {hasValue && (
        <div className="text-sm text-gray-600">
          已选：{value.startDate || '...'} → {value.endDate || '...'}
        </div>
      )}
    </div>
  );
}

// 预定义的日期范围选项
export const DateRangePresets = {
  today: {
    label: '今天',
    range: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
  yesterday: {
    label: '昨天',
    range: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];
      return { startDate: date, endDate: date };
    })(),
  },
  last7days: {
    label: '最近 7 天',
    range: (() => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  last30days: {
    label: '最近 30 天',
    range: (() => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  thisMonth: {
    label: '本月',
    range: (() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
  lastMonth: {
    label: '上月',
    range: (() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    })(),
  },
};

export default DateRangePicker;
