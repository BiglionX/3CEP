/**
 * FixCycle Agent SDK 插件市场API
 * 提供插件发现、下载、评价等市场功能
 */

import { HttpClient, ApiResponse } from '../client/http-client';
import {
  PluginInfo,
  PluginMarketMetadata,
  SecurityScanResult,
} from './plugin-manager';

// 插件市场搜索参数
export interface PluginSearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  sortBy?: 'downloads' | 'rating' | 'updated' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 插件评价接口
export interface PluginReview {
  id: string;
  pluginId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5�?  comment: string;
  createdAt: Date;
  helpfulCount: number;
}

// 插件下载统计
export interface PluginDownloadStats {
  totalDownloads: number;
  downloadsLastWeek: number;
  downloadsLastMonth: number;
  activeUsers: number;
}

// 插件市场API客户端
export class PluginMarketAPI {
  private client: HttpClient;
  private baseUrl: string;

  constructor(apiUrl: string = 'https://market.fixcycle.com/api/v1') {
    this.baseUrl = apiUrl;
    this.client = new HttpClient({
      apiKey: '', // 将在实际使用时设置
      apiUrl: this.baseUrl,
    });
  }

  /**
   * 搜索插件
   */
  async searchPlugins(options: PluginSearchOptions): Promise<
    ApiResponse<{
      plugins: Array<PluginInfo & { market: PluginMarketMetadata }>;
      totalCount: number;
    }>
  > {
    const params = new URLSearchParams();

    if (options.query) params.append('query', options.query);
    if (options.category) params.append('category', options.category);
    if (options.tags) options.tags.forEach(tag => params.append('tags', tag));
    if (options.sortBy) params.append('sort', options.sortBy);
    if (options.sortOrder) params.append('order', options.sortOrder);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    return this.client.get('/plugins/search', Object.fromEntries(params));
  }

  /**
   * 获取插件详情
   */
  async getPluginDetail(pluginId: string): Promise<
    ApiResponse<{
      plugin: PluginInfo;
      market: PluginMarketMetadata;
      reviews: PluginReview[];
      stats: PluginDownloadStats;
    }>
  > {
    return this.client.get(`/plugins/${pluginId}`);
  }

  /**
   * 下载插件
   */
  async downloadPlugin(pluginId: string): Promise<
    ApiResponse<{
      downloadUrl: string;
      checksum: string;
      size: number;
    }>
  > {
    return this.client.post(`/plugins/${pluginId}/download`);
  }

  /**
   * 提交插件评价
   */
  async submitReview(
    pluginId: string,
    review: Omit<PluginReview, 'id' | 'createdAt'>
  ): Promise<ApiResponse<PluginReview>> {
    return this.client.post(`/plugins/${pluginId}/reviews`, review);
  }

  /**
   * 获取插件安全扫描报告
   */
  async getSecurityReport(
    pluginId: string
  ): Promise<ApiResponse<SecurityScanResult>> {
    return this.client.get(`/plugins/${pluginId}/security`);
  }

  /**
   * 获取热门插件
   */
  async getPopularPlugins(
    limit: number = 10
  ): Promise<
    ApiResponse<Array<PluginInfo & { market: PluginMarketMetadata }>>
  > {
    return this.client.get('/plugins/popular', { limit });
  }

  /**
   * 获取新发布插?   */
  async getNewPlugins(
    limit: number = 10
  ): Promise<
    ApiResponse<Array<PluginInfo & { market: PluginMarketMetadata }>>
  > {
    return this.client.get('/plugins/new', { limit });
  }

  /**
   * 获取插件分类
   */
  async getCategories(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        description: string;
        pluginCount: number;
      }>
    >
  > {
    return this.client.get('/categories');
  }

  /**
   * 上架插件（开发者功能）
   */
  async publishPlugin(pluginData: {
    name: string;
    description: string;
    version: string;
    category: string;
    tags: string[];
    sourceCode: string; // 压缩后的源码
    readme: string;
    license: string;
  }): Promise<
    ApiResponse<{
      pluginId: string;
      status: 'pending' | 'approved' | 'rejected';
    }>
  > {
    return this.client.post('/plugins/publish', pluginData);
  }

  /**
   * 更新插件（开发者功能）
   */
  async updatePlugin(
    pluginId: string,
    updateData: {
      version: string;
      changelog: string;
      sourceCode?: string;
    }
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.put(`/plugins/${pluginId}`, updateData);
  }

  /**
   * 删除插件（开发者功能）
   */
  async deletePlugin(
    pluginId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.client.delete(`/plugins/${pluginId}`);
  }

  /**
   * 获取我的插件（开发者功能）
   */
  async getMyPlugins(): Promise<
    ApiResponse<
      Array<
        PluginInfo & {
          market: PluginMarketMetadata;
          status: 'draft' | 'pending' | 'published' | 'rejected';
        }
      >
    >
  > {
    return this.client.get('/plugins/my');
  }

  /**
   * 设置API密钥
   */
  setApiKey(apiKey: string): void {
    this.client.updateConfig({ apiKey });
  }

  /**
   * 设置基础URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.client.updateConfig({ apiUrl: url });
  }
}

// 插件市场事件接口
export interface PluginMarketEvents {
  pluginDownloaded: (pluginId: string, downloadInfo: any) => void;
  pluginReviewed: (review: PluginReview) => void;
  pluginPublished: (pluginId: string) => void;
  pluginUpdated: (pluginId: string) => void;
  searchPerformed: (query: string, results: any[]) => void;
}

// 类型已在接口定义中导出
