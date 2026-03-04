/**
 * 简化版搜索组件
 * 提供基础搜索功能，易于集成到现有页面
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  SearchEntityType,
  AdvancedSearchFilters,
  SearchHistory,
  SearchSuggestion,
} from '@/types/search.types';
import { useSearch } from '@/hooks/use-search';
// 在客户端重新初始化搜索服?import { SearchService } from '@/services/search.service';
const searchService = SearchService.getInstance();

interface SimpleSearchProps {
  entityType?: SearchEntityType;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  onSearch?: (query: string, filters: AdvancedSearchFilters) => void;
  onResultSelect?: (result: any) => void;
}

export function SimpleSearch({
  entityType = 'all',
  placeholder = '搜索...',
  className = '',
  showHistory = true,
  showSuggestions = true,
  onSearch,
  onResultSelect,
}: SimpleSearchProps) {
  // 使用搜索Hook
  const {
    results,
    isLoading,
    suggestions,
    getSearchHistory,
    search,
    fetchSuggestions,
    searchFromHistory,
    saveSearch,
    clearResults,
  } = useSearch(entityType);

  // 组件状?  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // 引用
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (value.length >= 2) {
      if (showSuggestions) {
        fetchSuggestions?.(value);
      }
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // 处理搜索提交
  const handleSearch = async () => {
    if (query.trim()) {
      const filters: AdvancedSearchFilters = {
        searchTerm: query.trim(),
      };

      await search(query.trim(), filters, entityType);
      onSearch?.(query.trim(), filters);
      setShowDropdown(false);
    }
  };

  // 处理回车?  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef?.blur();
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowDropdown(false);
    handleSearch();
  };

  // 处理历史记录点击
  const handleHistoryClick = (historyItem: SearchHistory) => {
    setQuery(historyItem.query);
    setShowDropdown(false);
    searchFromHistory?.(historyItem);
  };

  // 保存当前搜索
  const handleSaveSearch = () => {
    if (query.trim()) {
      const name = prompt('请输入搜索名?');
      if (name) {
        try {
          saveSearch(name);
        } catch (error) {
          console.error('保存搜索失败:', error);
        }
      }
    }
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    clearResults();
    setShowDropdown(false);
    inputRef?.focus();
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* 搜索容器 */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 w-4 h-4" />

          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => {
              if (
                query.length >= 2 ||
                (showHistory && getSearchHistory().length > 0)
              ) {
                setShowDropdown(true);
              }
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-24 w-full"
          />

          {/* 操作按钮 */}
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

            <button
              onClick={handleSaveSearch}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="保存搜索"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 搜索按钮 */}
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

      {/* 下拉面板 */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {/* 搜索建议 */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  搜索建议
                </div>
                {suggestions.slice(0, 5).map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <span className="truncate">{suggestion.text}</span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.type === 'recent'
                        ? '最?
                        : suggestion.type === 'popular'
                          ? '热门'
                          : '自动完成'}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* 搜索历史 */}
            {showHistory &&
              getSearchHistory().length > 0 &&
              (!showSuggestions ||
                !suggestions ||
                suggestions.length === 0) && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-3 h-3" />
                      搜索历史
                    </div>
                    <button
                      onClick={() => {
                        const service = SearchService.getInstance();
                        service.clearHistory();
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      清空
                    </button>
                  </div>
                  {getSearchHistory()
                    .slice(0, 5)
                    .map(historyItem => (
                      <button
                        key={historyItem.id}
                        onClick={() => handleHistoryClick(historyItem)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{historyItem.query}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(historyItem.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                </div>
              )}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {results.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                找到 {results.length} 个结?              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {results.map(result => (
              <div
                key={result.id}
                onClick={() => {
                  onResultSelect?.(result.data);
                  setShowDropdown(false);
                }}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-900">{result.title}</div>
                {result.subtitle && (
                  <div className="text-sm text-gray-600 mt-1">
                    {result.subtitle}
                  </div>
                )}
                {result.description && (
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {result.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
