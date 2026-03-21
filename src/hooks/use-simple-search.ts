'use client';

import { useState, useCallback } from 'react';

// 简化的搜索结果类型
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  url: string;
}

// 简化的搜索状态
interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 简化版搜索Hook - 专为Next.js Server/Client Components 兼容性设计
 */
export function useSimpleSearch() {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
  });

  // 执行搜索的函数
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], query: '', isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, query }));

    try {
      // 这里可以集成真实的API调用
      // 暂时使用模拟数据
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: `搜索结果: ${query}`,
          description: '这是模拟的搜索结果描述',
          type: 'work-order',
          url: '/work-orders/1',
        },
        {
          id: '2',
          title: `相关项目: ${query}`,
          description: '另一个相关的搜索结果',
          type: 'customer',
          url: '/customers/2',
        },
      ];

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      setState(prev => ({
        ...prev,
        results: mockResults,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '搜索失败';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        results: [],
      }));
    }
  }, []);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setState({
      query: '',
      results: [],
      isLoading: false,
      error: null,
    });
  }, []);

  // 更新查询
  const updateQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  return {
    // 状态
    query: state.query,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,

    // 操作方法
    performSearch,
    clearSearch,
    updateQuery,

    // 便利方法
    hasResults: state.results.length > 0,
    isEmpty: !state.query.trim(),
    isError: !!state.error,
  };
}

export default useSimpleSearch;
