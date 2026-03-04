'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Tag,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataAsset {
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
  dataSize?: number;
  rowCount?: number;
  lastModified?: string;
  createdDate?: string;
  businessOwner?: string;
  dataSteward?: string;
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  qualityScore?: number;
  lastQualityCheck?: string;
  qualityIssues?: any[];
}

interface MetadataStatistics {
  totalAssets: number;
  assetsByType: Record<string, number>;
  assetsByCategory: Record<string, number>;
  averageQualityScore: number;
  assetsBySensitivity: Record<string, number>;
  recentUpdates: number;
  qualityIssuesCount: number;
}

export default function MetadataManagementPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<DataAsset[]>([]);
  const [statistics, setStatistics] = useState<MetadataStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sensitivityFilter, setSensitivityFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟数据
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
          dataSize: 1024000,
          rowCount: 1247,
          lastModified: '2026-02-28T14:30:00Z',
          createdDate: '2026-01-15T09:00:00Z',
          businessOwner: '张经?,
          dataSteward: '李数据官',
          sensitivityLevel: 'internal',
          qualityScore: 95,
          lastQualityCheck: '2026-02-28T10:00:00Z',
          qualityIssues: [
            {
              id: 'qi_001',
              type: 'missing_value',
              severity: 'low',
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

      const mockStats: MetadataStatistics = {
        totalAssets: 3,
        assetsByType: { table: 1, view: 1, api: 1 },
        assetsByCategory: { 设备管理: 1, 价格分析: 1, 用户行为: 1 },
        averageQualityScore: 91.7,
        assetsBySensitivity: { internal: 2, confidential: 1 },
        recentUpdates: 3,
        qualityIssuesCount: 1,
      };

      setAssets(mockAssets);
      setStatistics(mockStats);
    } catch (error) {
      console.error('加载元数据失?', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table':
        return <Database className="h-4 w-4" />;
      case 'view':
        return <FileText className="h-4 w-4" />;
      case 'api':
        return <Share className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'internal':
        return 'bg-blue-100 text-blue-800';
      case 'confidential':
        return 'bg-yellow-100 text-yellow-800';
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesSensitivity =
      sensitivityFilter === 'all' ||
      asset.sensitivityLevel === sensitivityFilter;

    return (
      matchesSearch && matchesCategory && matchesType && matchesSensitivity
    );
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">元数据管?/h1>
          <p className="text-gray-600 mt-1">数据资产目录和元数据管理</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          注册新资?        </Button>
      </div>

      {/* 统计概览 */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总资产数</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAssets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均质量?/CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.averageQualityScore.toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">近期更新</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.recentUpdates}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">质量问题</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.qualityIssuesCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="assets">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">数据资产</TabsTrigger>
          <TabsTrigger value="analytics">分析洞察</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          {/* 搜索和过?*/}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索资产名称、描述或标签..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="按类别筛? />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    <SelectItem value="设备管理">设备管理</SelectItem>
                    <SelectItem value="价格分析">价格分析</SelectItem>
                    <SelectItem value="用户行为">用户行为</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="按类型筛? />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="table">数据?/SelectItem>
                    <SelectItem value="view">视图</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 资产列表 */}
          <div className="grid gap-4">
            {filteredAssets.map(asset => (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(asset.type)}
                      <div>
                        <CardTitle className="text-lg">
                          {asset.displayName}
                        </CardTitle>
                        <CardDescription>{asset.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          asset.qualityScore && asset.qualityScore >= 90
                            ? 'default'
                            : asset.qualityScore && asset.qualityScore >= 70
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        质量: {asset.qualityScore || 'N/A'}
                      </Badge>
                      <Badge
                        className={getSensitivityColor(asset.sensitivityLevel)}
                      >
                        {asset.sensitivityLevel === 'public'
                          ? '公开'
                          : asset.sensitivityLevel === 'internal'
                            ? '内部'
                            : asset.sensitivityLevel === 'confidential'
                              ? '机密'
                              : '受限'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">类型</p>
                      <p className="font-medium capitalize">{asset.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">类别</p>
                      <p className="font-medium">{asset.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">所有?/p>
                      <p className="font-medium">{asset.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">部门</p>
                      <p className="font-medium">{asset.department || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">数据大小</p>
                      <p className="font-medium">
                        {asset.dataSize
                          ? formatFileSize(asset.dataSize)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">记录?/p>
                      <p className="font-medium">
                        {asset?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">业务负责?/p>
                      <p className="font-medium">
                        {asset.businessOwner || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">数据管家</p>
                      <p className="font-medium">
                        {asset.dataSteward || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* 标签展示 */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">标签:</p>
                    <div className="flex flex-wrap gap-2">
                      {asset.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      最后更?{' '}
                      {asset.lastModified
                        ? new Date(asset.lastModified).toLocaleString('zh-CN')
                        : 'N/A'}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-4 w-4" />
                        查看详情
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-4 w-4" />
                        编辑
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAssets.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    未找到匹配的数据资产
                  </h3>
                  <p className="text-gray-500">
                    调整筛选条件或注册新的数据资产
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>元数据分?/CardTitle>
              <CardDescription>数据资产的统计分析和洞察</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">分析功能正在开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

