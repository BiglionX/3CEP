import {
  DataAsset,
  MetadataSearchOptions,
  MetadataStatistics,
} from '../models/metadata-models';

export class MetadataService {
  private cache: Map<string, DataAsset> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeMockData();
  }

  /**
   * 获取所有数据资?   */
  async getAllAssets(): Promise<DataAsset[]> {
    return Array.from(this.cache.values());
  }

  /**
   * 根据ID获取数据资产
   */
  async getAssetById(id: string): Promise<DataAsset | null> {
    return this.cache.get(id) || null;
  }

  /**
   * 搜索数据资产
   */
  async searchAssets(options: MetadataSearchOptions): Promise<DataAsset[]> {
    let results = Array.from(this.cache.values());

    // 应用过滤条件
    if (options.query) {
      results = results.filter(
        asset =>
          asset.name.toLowerCase().includes(options.query!.toLowerCase()) ||
          asset.displayName
            .toLowerCase()
            .includes(options.query!.toLowerCase()) ||
          asset?.toLowerCase().includes(options.query!.toLowerCase())
      );
    }

    if (options.category) {
      results = results.filter(asset => asset.category === options.category);
    }

    if (options.type) {
      results = results.filter(asset => asset.type === options.type);
    }

    if (options.owner) {
      results = results.filter(asset => asset.owner === options.owner);
    }

    if (options.sensitivityLevel) {
      results = results.filter(
        asset => asset.sensitivityLevel === options.sensitivityLevel
      );
    }

    if (options.minQualityScore !== undefined) {
      results = results.filter(
        asset =>
          asset.qualityScore !== undefined &&
          asset.qualityScore >= options.minQualityScore!
      );
    }

    // 应用排序
    if (options.sortBy) {
      results.sort((a, b) => {
        let comparison = 0;

        switch (options.sortBy) {
          case 'name':
            comparison = a.displayName.localeCompare(b.displayName);
            break;
          case 'quality':
            comparison = (b.qualityScore || 0) - (a.qualityScore || 0);
            break;
          case 'recent':
            comparison =
              new Date(b.lastModified || '').getTime() -
              new Date(a.lastModified || '').getTime();
            break;
          case 'size':
            comparison = (b.dataSize || 0) - (a.dataSize || 0);
            break;
        }

        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // 应用分页
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      results = results.slice(offset, offset + options.limit);
    }

    return results;
  }

  /**
   * 获取元数据统计信?   */
  async getStatistics(): Promise<MetadataStatistics> {
    const assets = Array.from(this.cache.values());

    const stats: MetadataStatistics = {
      totalAssets: assets.length,
      assetsByType: {},
      assetsByCategory: {},
      averageQualityScore: 0,
      assetsBySensitivity: {},
      recentUpdates: 0,
      qualityIssuesCount: 0,
    };

    let totalQualityScore = 0;
    let qualityScoresCount = 0;

    assets.forEach(asset => {
      // 按类型统?      stats.assetsByType[asset.type] =
        (stats.assetsByType[asset.type] || 0) + 1;

      // 按类别统?      stats.assetsByCategory[asset.category] =
        (stats.assetsByCategory[asset.category] || 0) + 1;

      // 按敏感度统计
      stats.assetsBySensitivity[asset.sensitivityLevel] =
        (stats.assetsBySensitivity[asset.sensitivityLevel] || 0) + 1;

      // 质量分数统计
      if (asset.qualityScore !== undefined) {
        totalQualityScore += asset.qualityScore;
        qualityScoresCount++;
      }

      // 质量问题统计
      if (asset.qualityIssues) {
        stats.qualityIssuesCount += asset.qualityIssues.length;
      }

      // 最近更新统计（过去7天）
      if (asset.lastModified) {
        const lastModified = new Date(asset.lastModified);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (lastModified > sevenDaysAgo) {
          stats.recentUpdates++;
        }
      }
    });

    stats.averageQualityScore =
      qualityScoresCount > 0 ? totalQualityScore / qualityScoresCount : 0;

    return stats;
  }

  /**
   * 更新数据资产元数?   */
  async updateAsset(
    id: string,
    updates: Partial<DataAsset>
  ): Promise<DataAsset | null> {
    const existingAsset = this.cache.get(id);
    if (!existingAsset) return null;

    const updatedAsset = { ...existingAsset, ...updates };
    this.cache.set(id, updatedAsset);
    this.updateSearchIndex(updatedAsset);

    return updatedAsset;
  }

  /**
   * 删除数据资产
   */
  async deleteAsset(id: string): Promise<boolean> {
    const deleted = this.cache.delete(id);
    if (deleted) {
      this.removeFromSearchIndex(id);
    }
    return deleted;
  }

  /**
   * 初始化模拟数?   */
  private initializeMockData() {
    const mockAssets: DataAsset[] = [
      {
        id: 'devices_table_001',
        name: 'devices',
        displayName: '设备信息?,
        description: '存储所有设备的基本信息和状?,
        type: 'table',
        category: '设备管理',
        owner: 'device_team',
        department: '技术部',
        tags: ['设备', '硬件', '状?],
        businessTags: ['设备管理', '资产跟踪'],
        technicalTags: ['postgresql', '主表'],
        schema: [
          {
            name: 'id',
            displayName: '设备ID',
            dataType: 'uuid',
            description: '设备唯一标识?,
            isPrimaryKey: true,
            isNullable: false,
          },
          {
            name: 'device_name',
            displayName: '设备名称',
            dataType: 'varchar',
            description: '设备显示名称',
            isPrimaryKey: false,
            isNullable: false,
            maxLength: 255,
          },
          {
            name: 'status',
            displayName: '设备状?,
            dataType: 'varchar',
            description: '设备当前状?,
            isPrimaryKey: false,
            isNullable: false,
            maxLength: 50,
          },
        ],
        dataSize: 1024000,
        rowCount: 1247,
        lastModified: '2026-02-28T14:30:00Z',
        createdDate: '2026-01-15T09:00:00Z',
        businessOwner: '张经?,
        dataSteward: '李数据官',
        sensitivityLevel: 'internal',
        retentionPeriod: '永久',
        complianceTags: ['GDPR', '数据保护?],
        qualityScore: 95,
        lastQualityCheck: '2026-02-28T10:00:00Z',
        qualityIssues: [
          {
            id: 'qi_001',
            type: 'missing_value',
            severity: 'low',
            description: '部分设备缺少品牌信息',
            affectedColumns: ['brand'],
            detectedAt: '2026-02-25T14:30:00Z',
            resolved: false,
          },
        ],
      },
      {
        id: 'parts_price_view_001',
        name: 'parts_price_analysis',
        displayName: '配件价格分析视图',
        description: '聚合各渠道配件价格信息的分析视图',
        type: 'view',
        category: '价格分析',
        owner: 'pricing_team',
        department: '商务?,
        tags: ['价格', '配件', '分析'],
        businessTags: ['价格监控', '市场竞争'],
        technicalTags: ['materialized_view', '实时'],
        schema: [
          {
            name: 'part_id',
            displayName: '配件ID',
            dataType: 'uuid',
            description: '配件唯一标识?,
            isPrimaryKey: false,
            isNullable: false,
          },
          {
            name: 'avg_price',
            displayName: '平均价格',
            dataType: 'decimal',
            description: '配件平均价格',
            isPrimaryKey: false,
            isNullable: false,
            precision: 10,
            scale: 2,
          },
        ],
        dataSize: 512000,
        rowCount: 843,
        lastModified: '2026-02-28T12:15:00Z',
        createdDate: '2026-02-01T10:30:00Z',
        businessOwner: '王总监',
        dataSteward: '赵分析师',
        sensitivityLevel: 'internal',
        qualityScore: 88,
        lastQualityCheck: '2026-02-27T16:45:00Z',
      },
      {
        id: 'user_behavior_api_001',
        name: 'user_behavior_events',
        displayName: '用户行为事件API',
        description: '实时获取用户行为事件数据的RESTful API',
        type: 'api',
        category: '用户行为',
        owner: 'analytics_team',
        department: '数据?,
        tags: ['用户', '行为', '实时'],
        businessTags: ['用户画像', '行为分析'],
        technicalTags: ['rest_api', 'websocket', '实时?],
        dataSize: 2048000,
        rowCount: 56789,
        lastModified: '2026-02-28T15:20:00Z',
        createdDate: '2026-01-20T11:00:00Z',
        businessOwner: '陈主?,
        dataSteward: '刘数据科学家',
        sensitivityLevel: 'confidential',
        qualityScore: 92,
        lastQualityCheck: '2026-02-28T09:30:00Z',
      },
    ];

    // 加载模拟数据到缓?    mockAssets.forEach(asset => {
      this.cache.set(asset.id, asset);
      this.updateSearchIndex(asset);
    });
  }

  /**
   * 更新搜索索引
   */
  private updateSearchIndex(asset: DataAsset) {
    // 简化的搜索索引实现
    const searchableFields = [
      asset.name,
      asset.displayName,
      asset.description || '',
      ...asset.tags,
      asset.owner,
      asset.department || '',
    ]
      .join(' ')
      .toLowerCase();

    // 为简单起见，这里只是存储资产ID
    // 实际实现应该建立倒排索引
    this.searchIndex.set(asset.id, new Set([searchableFields]));
  }

  /**
   * 从搜索索引中移除
   */
  private removeFromSearchIndex(assetId: string) {
    this.searchIndex.delete(assetId);
  }
}

// 导出单例实例
export const metadataService = new MetadataService();
