/**
 * 高级搜索React Hook
 * 提供搜索状态管理和业务逻辑
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SearchEntityType,
  AdvancedSearchFilters,
  SearchHistory,
  SearchSuggestion,
  SearchResult,
  SearchConfig,
  UseSearchReturn,
} from '@/types/search.types';
import { searchService } from '@/services/search.service';

// 默认搜索配置
const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  enableSuggestions: true,
  enableHistory: true,
  enableFacets: true,
  enableAutoComplete: true,
  showEntityTabs: true,
  showFilters: true,
  showSortOptions: true,
  debounceDelay: 300,
  minSearchLength: 2,
  maxHistoryItems: 20,
  maxSuggestions: 10,
  defaultEntityType: 'all',
  defaultSortBy: 'relevance',
  defaultPageSize: 20,
};

export function useSearch<T = any>(
  initialEntityType: SearchEntityType = 'all',
  initialConfig: Partial<SearchConfig> = {}
): UseSearchReturn<T> {
  // 合并配置
  const config = useMemo(
    () => ({
      ...DEFAULT_SEARCH_CONFIG,
      ...initialConfig,
    }),
    [initialConfig]
  );

  // 搜索状?
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // 分页状?
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 辅助数据
  const [facets, setFacets] = useState<Record<string, any> | undefined>(
    undefined
  );
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // 当前搜索上下?
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<AdvancedSearchFilters>(
    {}
  );
  const [currentEntityType, setCurrentEntityType] =
    useState<SearchEntityType>(initialEntityType);

  // 获取搜索历史（不在Hook返回值中直接暴露?
  const getSearchHistory = useCallback(
    () =>
      config.enableHistory
        ? searchService.getHistory(config.maxHistoryItems)
        : [],
    [config.enableHistory, config.maxHistoryItems]
  );

  // 执行搜索的主要函?
  const performSearch = useCallback(
    async (
      query: string,
      filters: AdvancedSearchFilters = {},
      entityType?: SearchEntityType
    ) => {
      if (!query.trim() && !Object.keys(filters).length) {
        // 清空结果
        setResults([]);
        setTotalCount(0);
        setTotalPages(0);
        setFacets(undefined);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(undefined);

      try {
        const searchEntityType = entityType || currentEntityType;
        const searchResponse = await searchService.search<T>(
          query,
          filters,
          searchEntityType
        );

        setResults(searchResponse.results);
        setTotalCount(searchResponse.totalCount);
        setTotalPages(searchResponse.totalPages);
        setFacets(searchResponse.facets);

        // 保存到历史记?
        if (config.enableHistory && query.trim()) {
          searchService.saveToHistory(
            query,
            filters,
            searchResponse.totalCount,
            searchEntityType
          );
        }

        // 更新当前状?
        setCurrentQuery(query);
        setCurrentFilters(filters);
        if (entityType) {
          setCurrentEntityType(entityType);
        }
      } catch (err) {
        setIsError(true);
        setError(err as Error);
        setResults([]);
        setTotalCount(0);
        setTotalPages(0);
        console.error('搜索执行失败:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentEntityType, config.enableHistory]
  );

  // 防抖搜索包装函数
  const debouncedSearchWrapper = useCallback(
    (
      query: string,
      filters?: AdvancedSearchFilters,
      entityType?: SearchEntityType
    ) => {
      return new Promise<void>(resolve => {
        const debouncedFn = searchService.debouncedSearch(() => {
          performSearch(query, filters, entityType).then(resolve);
        }, config.debounceDelay);
        debouncedFn();
      });
    },
    [performSearch, config.debounceDelay]
  );

  // 获取搜索建议
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!config.enableSuggestions || query.length < config.minSearchLength) {
        setSuggestions([]);
        return;
      }

      try {
        const suggestionResults = await searchService.getSuggestions(
          query,
          currentEntityType
        );
        setSuggestions(suggestionResults);
      } catch (err) {
        console.error('获取搜索建议失败:', err);
        setSuggestions([]);
      }
    },
    [config.enableSuggestions, config.minSearchLength, currentEntityType]
  );

  // 防抖建议获取
  const debouncedFetchSuggestions = useMemo(
    () => searchService.debouncedSearch(fetchSuggestions, 200),
    [fetchSuggestions]
  );

  // 公开的搜索方?
  const search = useCallback(
    async (
      query: string,
      filters?: AdvancedSearchFilters,
      entityType?: SearchEntityType
    ) => {
      // 取消防抖定时?
      searchService.cancelDebounce();

      // 执行搜索
      await performSearch(query, filters || {}, entityType);
    },
    [performSearch]
  );

  // 加载更多结果
  const loadMore = useCallback(() => {
    if (isLoading || currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    // 这里可以实现无限滚动或分页加载更?
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('加载更多结果，页?', nextPage)}, [isLoading, currentPage, totalPages]);

  // 清空结果
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalCount(0);
    setTotalPages(0);
    setFacets(undefined);
    setCurrentQuery('');
    setCurrentFilters({});
    setSuggestions([]);
  }, []);

  // 保存当前搜索
  const saveSearch = useCallback(
    (name: string) => {
      try {
        const id = searchService.saveSearch(name, currentFilters);
        return id;
      } catch (err) {
        console.error('保存搜索失败:', err);
        throw err;
      }
    },
    [currentFilters]
  );

  // 加载保存的搜?
  const loadSavedSearch = useCallback((id: string) => {
    try {
      const savedSearches = searchService.getSavedSearches();
      const savedSearch = savedSearches.find(search => search.id === id);

      if (savedSearch) {
        setCurrentFilters(savedSearch.filters);
        // 可以选择是否自动执行搜索
        // performSearch('', savedSearch.filters);
      }
    } catch (err) {
      console.error('加载保存的搜索失?', err);
    }
  }, []);

  // 从历史记录执行搜?
  const searchFromHistory = useCallback(
    (historyItem: SearchHistory) => {
      setCurrentQuery(historyItem.query);
      setCurrentFilters(historyItem.filters);
      if (historyItem.entityType) {
        setCurrentEntityType(historyItem.entityType);
      }
      performSearch(
        historyItem.query,
        historyItem.filters,
        historyItem.entityType
      );
    },
    [performSearch]
  );

  // Effect: 当实体类型改变时清空结果
  useEffect(() => {
    if (currentEntityType !== initialEntityType) {
      clearResults();
    }
  }, [currentEntityType, initialEntityType, clearResults]);

  return {
    // 状?
    results,
    isLoading,
    isError,
    error,

    // 数据
    totalCount,
    currentPage,
    totalPages,
    facets,
    suggestions,

    // 方法
    search: debouncedSearchWrapper,
    loadMore,
    clearResults,
    saveSearch,
    loadSavedSearch,
    searchFromHistory,
    fetchSuggestions: debouncedFetchSuggestions,

    // 当前上下?
    currentQuery,
    currentFilters,
    currentEntityType,
    getSearchHistory,
    searchConfig: config,
  };
}

// 专门用于工单搜索的Hook
export function useWorkOrderSearch() {
  return useSearch('work_order');
}

// 专门用于客户搜索的Hook
export function useCustomerSearch() {
  return useSearch('customer');
}

// 专门用于技师搜索的Hook
export function useTechnicianSearch() {
  return useSearch('technician');
}
