/**
 * 搜索服务? * 提供高级搜索功能的业务逻辑实现
 */

import {
  SearchEntityType,
  SearchField,
  SearchOperator,
  SearchCondition,
  AdvancedSearchFilters,
  SearchHistory,
  SearchSuggestion,
  SearchResult,
  SearchResponse,
  SearchConfig,
} from '@/types/search.types';
import { WorkOrderStatus, PriorityLevel } from '@/types/repair-shop.types';
import { repairShopApi } from './repair-shop-api.service';

class SearchService {
  private static instance: SearchService;
  private historyStorageKey = 'repair_shop_search_history';
  private savedSearchesKey = 'repair_shop_saved_searches';
  private maxHistoryItems = 20;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * 执行搜索
   */
  async search<T = any>(
    query: string,
    filters: AdvancedSearchFilters = {},
    entityType: SearchEntityType = 'all'
  ): Promise<SearchResponse<T>> {
    try {
      // 根据实体类型执行不同的搜索逻辑
      switch (entityType) {
        case 'work_order':
          return await this.searchWorkOrders(query, filters);
        case 'customer':
          return await this.searchCustomers(query, filters);
        case 'technician':
          return await this.searchTechnicians(query, filters);
        case 'device':
          return await this.searchDevices(query, filters);
        case 'all':
        default:
          return await this.searchAllEntities(query, filters);
      }
    } catch (error) {
      console.error('搜索执行失败:', error);
      throw error;
    }
  }

  /**
   * 搜索工单
   */
  private async searchWorkOrders<T>(
    query: string,
    filters: AdvancedSearchFilters
  ): Promise<SearchResponse<T>> {
    try {
      // 构建API参数
      const apiFilters = {
        searchTerm: query,
        status: filters.status?.[0] as WorkOrderStatus | undefined, // 类型转换
        priority: filters.priority?.[0] as PriorityLevel | undefined, // 类型转换
        ...(filters.dateRange && {
          dateRange: {
            from: new Date(filters.dateRange.startDate || ''),
            to: new Date(filters.dateRange.endDate || ''),
          },
        }),
      };

      const response = await repairShopApi.getWorkOrders(apiFilters);

      // 转换为搜索结果格?      const results: SearchResult<T>[] = response.data.map(
        (workOrder: any) => ({
          id: workOrder.id,
          type: 'work_order',
          title: `#${workOrder.orderNumber || workOrder.id}`,
          subtitle: `${workOrder.customerName} - ${workOrder?.brand} ${workOrder?.model}`,
          description: workOrder.faultDescription || workOrder.description,
          highlight: this.highlightMatches(workOrder, query),
          data: workOrder as T,
          matchedFields: this.findMatchedFields(workOrder, query),
          score: this.calculateRelevanceScore(workOrder, query),
        })
      );

      return {
        results,
        totalCount: response.count || results.length,
        currentPage: 1,
        pageSize: 20,
        totalPages: Math.ceil((response.count || results.length) / 20),
      };
    } catch (error) {
      console.error('工单搜索失败:', error);
      return {
        results: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        totalPages: 0,
      };
    }
  }

  /**
   * 搜索客户
   */
  private async searchCustomers<T>(
    query: string,
    filters: AdvancedSearchFilters
  ): Promise<SearchResponse<T>> {
    try {
      const response = await repairShopApi.searchCustomers(query);

      const results: SearchResult<T>[] = response.data.map((customer: any) => ({
        id: customer.id,
        type: 'customer',
        title: customer.name,
        subtitle: customer.phone,
        description: customer.email,
        highlight: this.highlightMatches(customer, query),
        data: customer as T,
        matchedFields: this.findMatchedFields(customer, query),
        score: this.calculateRelevanceScore(customer, query),
      }));

      return {
        results,
        totalCount: results.length,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      };
    } catch (error) {
      console.error('客户搜索失败:', error);
      return {
        results: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        totalPages: 0,
      };
    }
  }

  /**
   * 搜索技?   */
  private async searchTechnicians<T>(
    query: string,
    filters: AdvancedSearchFilters
  ): Promise<SearchResponse<T>> {
    // 实现技师搜索逻辑
    return {
      results: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }

  /**
   * 搜索设备
   */
  private async searchDevices<T>(
    query: string,
    filters: AdvancedSearchFilters
  ): Promise<SearchResponse<T>> {
    // 实现设备搜索逻辑
    return {
      results: [],
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }

  /**
   * 跨实体搜?   */
  private async searchAllEntities<T>(
    query: string,
    filters: AdvancedSearchFilters
  ): Promise<SearchResponse<T>> {
    // 并行搜索所有实体类?    const [workOrders, customers] = await Promise.all([
      this.searchWorkOrders(query, filters),
      this.searchCustomers(query, filters),
    ]);

    // 合并结果并按相关性排?    const allResults: SearchResult<T>[] = [
      ...workOrders.results,
      ...customers.results,
    ].sort((a, b) => (b.score || 0) - (a.score || 0)) as SearchResult<T>[];

    return {
      results: allResults,
      totalCount: workOrders.totalCount + customers.totalCount,
      currentPage: 1,
      pageSize: 20,
      totalPages: Math.ceil(allResults.length / 20),
    };
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(
    query: string,
    entityType: SearchEntityType = 'all'
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const suggestions: SearchSuggestion[] = [];

    // 添加最近搜索历?    const recentHistory = this.getRecentHistory(5);
    const matchingHistory = recentHistory
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .map(item => ({
        id: `recent-${item.id}`,
        text: item.query,
        type: 'recent' as const,
        entityType: item.entityType,
      }));

    suggestions.push(...matchingHistory);

    // 添加热门搜索（模拟数据）
    const popularSearches: Array<{
      text: string;
      entityType: SearchEntityType;
    }> = [
      { text: 'iPhone 14', entityType: 'device' },
      { text: '屏幕更换', entityType: 'work_order' },
      { text: '张三', entityType: 'customer' },
    ];

    const matchingPopular = popularSearches
      .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
      .map((item, index) => ({
        id: `popular-${index}`,
        text: item.text,
        type: 'popular' as const,
        entityType: item.entityType,
      }));

    suggestions.push(...matchingPopular);

    return suggestions.slice(0, 10);
  }

  /**
   * 获取搜索历史
   */
  getHistory(maxItems: number = this.maxHistoryItems): SearchHistory[] {
    try {
      const historyJson = localStorage.getItem(this.historyStorageKey);
      if (!historyJson) return [];

      const history: SearchHistory[] = JSON.parse(historyJson);
      return history
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, maxItems);
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      return [];
    }
  }

  /**
   * 获取最近搜索历?   */
  private getRecentHistory(count: number): SearchHistory[] {
    return this.getHistory(count);
  }

  /**
   * 保存搜索历史
   */
  saveToHistory(
    query: string,
    filters: AdvancedSearchFilters,
    resultCount: number,
    entityType?: SearchEntityType
  ): void {
    try {
      const history = this.getHistory();

      // 检查是否已存在相同的搜?      const existingIndex = history.findIndex(
        item =>
          item.query === query &&
          JSON.stringify(item.filters) === JSON.stringify(filters)
      );

      const newHistoryItem: SearchHistory = {
        id: Date.now().toString(),
        query,
        filters,
        timestamp: new Date().toISOString(),
        resultCount,
        entityType,
      };

      if (existingIndex >= 0) {
        // 更新已存在的记录
        history[existingIndex] = newHistoryItem;
      } else {
        // 添加新记?        history.unshift(newHistoryItem);
      }

      // 限制历史记录数量
      const trimmedHistory = history.slice(0, this.maxHistoryItems);

      localStorage.setItem(
        this.historyStorageKey,
        JSON.stringify(trimmedHistory)
      );
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  }

  /**
   * 清除搜索历史
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.historyStorageKey);
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  }

  /**
   * 保存搜索配置
   */
  saveSearch(name: string, filters: AdvancedSearchFilters): string {
    try {
      const savedSearches = this.getSavedSearches();
      const id = Date.now().toString();

      savedSearches.push({
        id,
        name,
        filters,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(
        this.savedSearchesKey,
        JSON.stringify(savedSearches)
      );
      return id;
    } catch (error) {
      console.error('保存搜索配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取保存的搜?   */
  getSavedSearches(): Array<{
    id: string;
    name: string;
    filters: AdvancedSearchFilters;
    createdAt: string;
  }> {
    try {
      const savedJson = localStorage.getItem(this.savedSearchesKey);
      return savedJson ? JSON.parse(savedJson) : [];
    } catch (error) {
      console.error('获取保存的搜索失?', error);
      return [];
    }
  }

  /**
   * 删除保存的搜?   */
  deleteSavedSearch(id: string): void {
    try {
      const savedSearches = this.getSavedSearches();
      const filtered = savedSearches.filter(search => search.id !== id);
      localStorage.setItem(this.savedSearchesKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('删除保存的搜索失?', error);
    }
  }

  /**
   * 高亮匹配文本
   */
  private highlightMatches(obj: any, query: string): string[] {
    const highlights: string[] = [];
    const lowerQuery = query.toLowerCase();

    // 遍历对象的所有字符串属?    Object.entries(obj).forEach(([key, value]) => {
      if (
        typeof value === 'string' &&
        value.toLowerCase().includes(lowerQuery)
      ) {
        const startIndex = value.toLowerCase().indexOf(lowerQuery);
        const endIndex = startIndex + query.length;
        const highlighted = `${value.substring(0, startIndex)}<mark>${value.substring(startIndex, endIndex)}</mark>${value.substring(endIndex)}`;
        highlights.push(highlighted);
      }
    });

    return highlights.slice(0, 3); // 最多返?个高亮结?  }

  /**
   * 查找匹配的字?   */
  private findMatchedFields(obj: any, query: string): string[] {
    const matchedFields: string[] = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(obj).forEach(([key, value]) => {
      if (
        typeof value === 'string' &&
        value.toLowerCase().includes(lowerQuery)
      ) {
        matchedFields.push(key);
      }
    });

    return matchedFields;
  }

  /**
   * 计算相关性分?   */
  private calculateRelevanceScore(obj: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    // 在标题字段中的匹配获得更高分?    if (obj.title && obj.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }

    // 在重要字段中的匹?    const importantFields = ['name', 'customerName', 'deviceModel'];
    importantFields.forEach(field => {
      if (obj[field] && obj[field].toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
    });

    // 在其他字段中的匹?    Object.values(obj).forEach(value => {
      if (
        typeof value === 'string' &&
        value.toLowerCase().includes(lowerQuery)
      ) {
        score += 1;
      }
    });

    return score;
  }

  /**
   * 防抖搜索
   */
  debouncedSearch(
    callback: (...args: any[]) => void,
    delay: number = 300
  ): (...args: any[]) => void {
    return (...args: any[]) => {
      const key = JSON.stringify(args);

      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key)!);
      }

      const timer = setTimeout(() => {
        callback(...args);
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    };
  }

  /**
   * 取消防抖
   */
  cancelDebounce(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// 导出单例实例
// 导出单例实例
export const searchService = SearchService.getInstance();

// 导出类和实例
export { SearchService };
