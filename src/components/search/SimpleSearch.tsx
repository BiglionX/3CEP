'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SimpleSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: any) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function SimpleSearch({
  placeholder = '搜索...',
  className = '',
  onSearch,
  onResultSelect,
  autoFocus = false,
  disabled = false,
}: SimpleSearchProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);

  // 监听输入变化
  useEffect(() => {
    setShowClear(query.length > 0);
  }, [query]);

  // 处理搜索提交
  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    setIsLoading(true);
    try {
      onSearch?.(trimmedQuery);
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, onSearch]);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  // 清空搜索
  const handleClear = useCallback(() => {
    setQuery('');
    setShowClear(false);
  }, []);

  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* 搜索图标 */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </div>

      {/* 输入?*/}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          w-full pl-10 pr-12 py-2.5
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:text-gray-500
          transition-all duration-200
          ${disabled ? 'cursor-not-allowed' : ''}
        `}
      />

      {/* 清空按钮 */}
      {showClear && !isLoading && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className={`
            absolute right-10 top-1/2 transform -translate-y-1/2
            p-1 rounded-full hover:bg-gray-200
            transition-colors duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          aria-label="清空搜索"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* 加载状?*/}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      )}

      {/* 搜索按钮 */}
      {!isLoading && (
        <button
          type="button"
          onClick={handleSearch}
          disabled={disabled || !query.trim()}
          className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            p-1 rounded-md hover:bg-gray-100
            transition-colors duration-200
            ${
              disabled || !query.trim()
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:bg-blue-50 text-blue-600'
            }
          `}
          aria-label="执行搜索"
        >
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default SimpleSearch;
