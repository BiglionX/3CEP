/**
 * 高级搜索功能类型定义
 */

// 搜索类型枚举
export type SearchEntityType =
  | 'work_order' // 工单
  | 'customer' // 客户
  | 'technician' // 技师
  | 'device' // 设备
  | 'part' // 配件
  | 'invoice' // 发票
  | 'all'; // 全部

// 搜索字段枚举
export type SearchField =
  | 'id' // ID
  | 'name' // 名称
  | 'phone' // 电话
  | 'email' // 邮箱
  | 'model' // 型号
  | 'brand' // 品牌
  | 'description' // 描述
  | 'status' // 状态
  | 'priority' // 优先级
  | 'date' // 日期
  | 'price' // 价格
  | 'any'; // 任意字段

// 搜索操作符
export type SearchOperator =
  | 'equals' // 等于
  | 'contains' // 包含
  | 'starts_with' // 以...开头
  | 'ends_with' // 以...结尾
  | 'greater_than' // 大于
  | 'less_than' // 小于
  | 'between' // 在...之间
  | 'in' // 在列表中
  | 'not_in'; // 不在列表中
// 搜索条件接口
export interface SearchCondition {
  field: SearchField;
  operator: SearchOperator;
  value: string | number | (string | number)[];
  entityType?: SearchEntityType;
}

// 高级搜索过滤
export interface AdvancedSearchFilters {
  // 基础搜索
  searchTerm?: string;

  // 多条件组
  conditions?: SearchCondition[];

  // 实体类型筛选
  entityTypes?: SearchEntityType[];

  // 日期范围
  dateRange?: {
    startDate?: string;
    endDate?: string;
    field?: 'created_at' | 'updated_at' | 'completed_at';
  };

  // 状态筛选
  status?: string[];

  // 优先级筛选
  priority?: string[];

  // 价格范围
  priceRange?: {
    min?: number;
    max?: number;
  };

  // 排序
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 搜索历史记录
export interface SearchHistory {
  id: string;
  query: string;
  filters: AdvancedSearchFilters;
  timestamp: string;
  resultCount: number;
  entityType?: SearchEntityType;
}

// 搜索建议
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'saved' | 'autocomplete';
  entityType?: SearchEntityType;
  metadata?: Record<string, any>;
}

// 搜索结果
export interface SearchResult<T = any> {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  highlight?: string[];
  data: T;
  score?: number;
  matchedFields?: string[];
}

// 搜索响应
export interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  facets?: Record<string, any>;
  suggestions?: SearchSuggestion[];
}

// 搜索配置
export interface SearchConfig {
  // 启用的功能
  enableSuggestions: boolean;
  enableHistory: boolean;
  enableFacets: boolean;
  enableAutoComplete: boolean;

  // 显示选项
  showEntityTabs: boolean;
  showFilters: boolean;
  showSortOptions: boolean;

  // 行为配置
  debounceDelay: number;
  minSearchLength: number;
  maxHistoryItems: number;
  maxSuggestions: number;

  // 默认值
  defaultEntityType: SearchEntityType;
  defaultSortBy: string;
  defaultPageSize: number;
}

// 搜索上下文
export interface SearchContext {
  currentQuery: string;
  currentFilters: AdvancedSearchFilters;
  searchConfig: SearchConfig;
  searchHistory: SearchHistory[];
  searchSuggestions: SearchSuggestion[];
  isLoading: boolean;
  error?: string;
}

// 搜索钩子返回
export interface UseSearchReturn<T = any> {
  // 状态
  results: SearchResult<T>[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;

  // 数据
  totalCount: number;
  currentPage: number;
  totalPages: number;
  facets?: Record<string, any>;
  suggestions?: SearchSuggestion[];

  // 方法
  search: (
    query: string,
    filters?: AdvancedSearchFilters,
    entityType?: SearchEntityType
  ) => Promise<void>;
  loadMore: () => void;
  clearResults: () => void;
  saveSearch: (name: string) => string;
  loadSavedSearch: (id: string) => void;
  searchFromHistory?: (historyItem: SearchHistory) => void;
  fetchSuggestions?: (query: string) => void;

  // 当前上下文
  currentQuery: string;
  currentFilters: AdvancedSearchFilters;
  currentEntityType: SearchEntityType;
  getSearchHistory: () => SearchHistory[];
  searchConfig: SearchConfig;
}
