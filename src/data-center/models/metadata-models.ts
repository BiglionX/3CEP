// 数据资产元数据模型定?export interface DataAsset {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'table' | 'view' | 'api' | 'file' | 'stream';
  category: string;
  owner: string;
  department?: string;
  tags: string[];
  businessTags: string[];
  technicalTags: string[];

  // 技术元数据
  schema?: ColumnSchema[];
  dataSize?: number;
  rowCount?: number;
  lastModified?: string;
  createdDate?: string;

  // 业务元数?  businessOwner?: string;
  dataSteward?: string;
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod?: string;
  complianceTags?: string[];

  // 质量元数?  qualityScore?: number;
  lastQualityCheck?: string;
  qualityIssues?: QualityIssue[];

  // 血缘关?  lineage?: DataLineageInfo;

  // 访问控制
  accessControl?: AccessControlPolicy;

  // 其他元数?  customProperties?: Record<string, any>;
  version?: string;
}

export interface ColumnSchema {
  name: string;
  displayName: string;
  dataType: string;
  description?: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
  defaultValue?: any;
  sampleValues?: any[];
  businessMeaning?: string;
  tags?: string[];
}

export interface QualityIssue {
  id: string;
  type:
    | 'missing_value'
    | 'duplicate'
    | 'inconsistent_format'
    | 'outlier'
    | 'invalid_reference';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedColumns: string[];
  detectedAt: string;
  resolved: boolean;
  resolutionNotes?: string;
}

export interface DataLineageInfo {
  sources: LineageNode[];
  targets: LineageNode[];
  transformations: TransformationInfo[];
}

export interface LineageNode {
  assetId: string;
  assetName: string;
  type: string;
  system: string;
}

export interface TransformationInfo {
  id: string;
  name: string;
  type: 'filter' | 'join' | 'aggregate' | 'derive' | 'clean';
  description: string;
  appliedAt: string;
}

export interface AccessControlPolicy {
  readAccess: string[];
  writeAccess: string[];
  executeAccess: string[];
  rowLevelSecurity?: RowLevelPolicy[];
}

export interface RowLevelPolicy {
  id: string;
  condition: string;
  appliesTo: string[];
  description: string;
}

// 元数据搜索和过滤接口
export interface MetadataSearchOptions {
  query?: string;
  category?: string;
  type?: string;
  tags?: string[];
  owner?: string;
  sensitivityLevel?: string;
  minQualityScore?: number;
  sortBy?: 'name' | 'quality' | 'recent' | 'size';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 元数据统计信?export interface MetadataStatistics {
  totalAssets: number;
  assetsByType: Record<string, number>;
  assetsByCategory: Record<string, number>;
  averageQualityScore: number;
  assetsBySensitivity: Record<string, number>;
  recentUpdates: number;
  qualityIssuesCount: number;
}
