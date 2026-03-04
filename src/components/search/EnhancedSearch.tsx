'use client';

import React, { useState } from 'react';
import { SimpleSearch } from './SimpleSearch';
import { useSimpleSearch } from '@/hooks/use-simple-search';
import { Search, X } from 'lucide-react';

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: any) => void;
}

export function EnhancedSearch({
  placeholder = '搜索工单、客户、设?..',
  className = '',
  onResultSelect,
}: EnhancedSearchProps) {
  const {
    query,
    results,
    isLoading,
    error,
    performSearch,
    clearSearch,
    hasResults,
    isEmpty,
    isError,
  } = useSimpleSearch();

  const [showResults, setShowResults] = useState(false);

  const handleSearch = (searchQuery: string) => {
    performSearch(searchQuery);
    setShowResults(true);
  };

  const handleResultClick = (result: any) => {
    onResultSelect?.(result);
    setShowResults(false);
    clearSearch();
  };

  const handleClear = () => {
    clearSearch();
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入?*/}
      <div className="relative">
        <SimpleSearch
          placeholder={placeholder}
          onSearch={handleSearch}
          autoFocus={false}
        />

        {/* 清空按钮（当有搜索内容时显示?*/}
        {!isEmpty && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2
                     p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="清空搜索"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* 搜索结果面板 */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* 加载状?*/}
            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse">搜索?..</div>
              </div>
            )}

            {/* 错误状?*/}
            {isError && error && (
              <div className="p-4 text-center text-red-500">
                <div className="font-medium">搜索出错</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            )}

            {/* 搜索结果 */}
            {hasResults && !isLoading && !isError && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  找到 {results.length} 个结?{' '}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {results.map(result => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Search className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </div>
                          {result.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {result.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1 capitalize">
                            {result.type.replace('-', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 无结果状?*/}
            {!hasResults && !isLoading && !isError && !isEmpty && (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <div className="font-medium">没有找到相关结果</div>
                <div className="text-sm mt-1">请尝试其他关键词</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedSearch;
