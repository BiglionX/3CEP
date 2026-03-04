/**
 * 简化版搜索组件 - Next.js兼容版本
 * 完全避免序列化问题，提供基础搜索功能
 */

'use client';

import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SimpleSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: any) => void;
}

export function SimpleSearch({
  placeholder = '搜索...',
  className = '',
  onSearch,
  onResultSelect,
}: SimpleSearchProps) {
  // 简化状态管?- 避免复杂对象
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 引用
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  // 处理搜索提交
  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // 直接调用回调函数
      onSearch?.(query.trim());
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    inputRef?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 w-4 h-4" />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12 w-full"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="清空搜索"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              搜索?..
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              搜索
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
