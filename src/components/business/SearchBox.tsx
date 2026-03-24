/**
 * 搜索框组件
 */

'use client';

import { Input } from '@/components/ui/input';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SearchBoxProps {
  /** 占位符文本 */
  placeholder?: string;
  /** 当前值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 搜索回调（支持防抖） */
  onSearch?: (value: string) => void;
  /** 延迟时间（毫秒） */
  debounceMs?: number;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否显示清除按钮 */
  showClear?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 输入框宽度 */
  width?: string | number;
}

export function SearchBox({
  placeholder = '搜索...',
  value = '',
  onChange,
  onSearch,
  debounceMs = 300,
  loading = false,
  showClear = true,
  className = '',
  width,
}: SearchBoxProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && inputValue !== value) {
        onSearch(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onSearch, value]);

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`} style={{ width }}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={e => {
          const newValue = e.target.value;
          setInputValue(newValue);
          onChange?.(newValue);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && onSearch) {
            onSearch(inputValue);
          }
        }}
        className={`pl-9 pr-${showClear ? '8' : '3'} py-2`}
      />

      {/* 加载指示器 */}
      {loading && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}

      {/* 清除按钮 */}
      {showClear && inputValue && !loading && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          type="button"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">清除</span>
        </button>
      )}
    </div>
  );
}

export default SearchBox;
