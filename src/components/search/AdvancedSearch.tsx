/**
 * 高级搜索组件
 * 提供多条件组合搜索、搜索历史和智能建议功能
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Clock,
  Star,
  X,
  ChevronDown,
  Save,
  History,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// 暂时移除Popover导入，使用自定义实现
import {
  SearchEntityType,
  SearchField,
  SearchOperator,
  SearchCondition,
  AdvancedSearchFilters,
  SearchHistory,
  SearchSuggestion,
} from '@/types/search.types';
import { useSearch } from '@/hooks/use-search';

interface AdvancedSearchProps {
  entityType?: SearchEntityType;
  placeholder?: string;
  className?: string;
  showEntityTabs?: boolean;
  showFilters?: boolean;
  onSearch?: (query: string, filters: AdvancedSearchFilters) => void;
  onResultSelect?: (result: any) => void;
}

export function AdvancedSearch({
  entityType = 'all',
  placeholder = '搜索...',
  className = '',
  showEntityTabs = true,
  showFilters = true,
  onSearch,
  onResultSelect,
}: AdvancedSearchProps) {
  // 使用搜索Hook
  const {
    results,
    isLoading,
    suggestions,
    searchHistory,
    currentQuery,
    currentFilters,
    search,
    fetchSuggestions,
    searchFromHistory,
    saveSearch,
    clearResults,
  } = useSearch(entityType);

  // 组件状?  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<SearchEntityType>(entityType);

  // 引用
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 实体类型选项
  const entityTypes: Array<{
    value: SearchEntityType;
    label: string;
    icon: React.ReactNode;
  }> = [
    { value: 'all', label: '全部', icon: <Search className="w-4 h-4" /> },
    {
      value: 'work_order',
      label: '工单',
      icon: <Filter className="w-4 h-4" />,
    },
    { value: 'customer', label: '客户', icon: <Star className="w-4 h-4" /> },
    {
      value: 'technician',
      label: '技?,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // 搜索字段选项
  const searchFields: Array<{ value: SearchField; label: string }> = [
    { value: 'any', label: '任意字段' },
    { value: 'id', label: 'ID' },
    { value: 'name', label: '名称' },
    { value: 'phone', label: '电话' },
    { value: 'model', label: '型号' },
    { value: 'description', label: '描述' },
  ];

  // 操作符选项
  const operators: Array<{ value: SearchOperator; label: string }> = [
    { value: 'contains', label: '包含' },
    { value: 'equals', label: '等于' },
    { value: 'starts_with', label: '开头是' },
    { value: 'ends_with', label: '结尾? },
  ];

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setLocalQuery(value);

    if (value.length >= 2) {
      fetchSuggestions?.(value);
      setShowSuggestions(true);
      setShowHistory(false);
    } else {
      setShowSuggestions(false);
      if (value.length === 0) {
        setShowHistory(true);
      }
    }
  };

  // 处理搜索提交
  const handleSearch = async () => {
    if (localQuery.trim()) {
      const filters: AdvancedSearchFilters = {
        ...currentFilters,
        searchTerm: localQuery.trim(),
      };

      await search(localQuery.trim(), filters, selectedTab);

      // 调用外部回调
      onSearch?.(localQuery.trim(), filters);

      setIsOpen(false);
    }
  };

  // 处理回车?  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef?.blur();
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch();
  };

  // 处理历史记录点击
  const handleHistoryClick = (historyItem: SearchHistory) => {
    setLocalQuery(historyItem.query);
    setShowHistory(false);
    searchFromHistory?.(historyItem);
    setIsOpen(false);
  };

  // 保存当前搜索
  const handleSaveSearch = () => {
    if (localQuery.trim()) {
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
    setLocalQuery('');
    clearResults();
    setShowSuggestions(false);
    setShowHistory(false);
    inputRef?.focus();
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 搜索输入?*/}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            if (localQuery.length === 0) {
              setShowHistory(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 w-full"
        />

        {/* 操作按钮 */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {localQuery && (
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

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="展开搜索选项"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* 实体类型标签?*/}
          {showEntityTabs && (
            <div className="flex border-b border-gray-200">
              {entityTypes.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.value
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* 搜索建议和历史记?*/}
          <div className="max-h-60 overflow-y-auto">
            {/* 搜索建议 */}
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  搜索建议
                </div>
                {suggestions.map(suggestion => (
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
                          : suggestion.type === 'saved'
                            ? '已保?
                            : '自动完成'}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* 搜索历史 */}
            {showHistory && searchHistory.length > 0 && !showSuggestions && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-3 h-3" />
                    搜索历史
                  </div>
                  <button
                    onClick={() => searchService.clearHistory()}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    清空
                  </button>
                </div>
                {searchHistory.slice(0, 5).map(historyItem => (
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

            {/* 高级筛选选项 */}
            {showFilters && (
              <div className="border-t border-gray-200 p-4">
                <div className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  高级筛?                </div>

                {/* 状态筛?*/}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    状?                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['待处?, '进行?, '已完?, '已取?].map(status => (
                      <Badge
                        key={status}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 text-xs"
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 日期范围 */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    日期范围
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      className="text-xs"
                      placeholder="开始日?
                    />
                    <Input
                      type="date"
                      className="text-xs"
                      placeholder="结束日期"
                    />
                  </div>
                </div>

                {/* 搜索按钮 */}
                <Button
                  onClick={handleSearch}
                  disabled={!localQuery.trim() || isLoading}
                  className="w-full"
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
            )}
          </div>
        </div>
      )}

      {/* 搜索结果展示区域 */}
      {results.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                找到 {results.length} 个结?              </span>
              <Badge variant="secondary">
                {selectedTab === 'all'
                  ? '全部类型'
                  : entityTypes.find(t => t.value === selectedTab)?.label}
              </Badge>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {results.map(result => (
              <div
                key={result.id}
                onClick={() => onResultSelect?.(result.data)}
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
                {result.highlight && result.highlight.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.highlight.map((highlight, index) => (
                      <div
                        key={index}
                        className="text-xs bg-yellow-50 p-1 rounded"
                        dangerouslySetInnerHTML={{ __html: highlight }}
                      />
                    ))}
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

// 导入搜索服务
import { searchService } from '@/services/search.service';
