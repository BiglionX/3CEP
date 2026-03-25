'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Grid3x3,
  LayoutList,
  RefreshCw,
  Search,
  Star,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  downloads: number;
  rating: number;
  workflows: number;
  createdAt: string;
  updatedAt: string;
  isOfficial?: boolean;
  isFavorite?: boolean;
}

export default function AgentsTemplatesPage() {
  const { user } = useUnifiedAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [templateUrl, setTemplateUrl] = useState('');

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // n8n 模板 API（如果支持）
      const response = await fetch(`${N8N_BASE_URL}/api/v1/templates`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setTemplates(data.data || []);
    } catch (err: any) {
      console.error('加载模板失败:', err);
      setTemplates(getMockTemplates());
    } finally {
      setLoading(false);
    }
  };

  const handleImportTemplate = async () => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/templates/import`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: templateUrl }),
      });

      if (!response.ok) throw new Error('导入失败');

      await loadTemplates();
      setImportDialogOpen(false);
      setTemplateUrl('');
    } catch (err: any) {
      console.error('导入模板失败:', err);
    }
  };

  const getMockTemplates = (): Template[] => [
    {
      id: '1',
      name: '电商订单自动化处理',
      description: '自动处理电商订单，包括库存检查、发货通知和客户邮件发送',
      category: '电商',
      tags: ['订单', '自动化', '电商'],
      author: 'n8n 官方',
      downloads: 15420,
      rating: 4.8,
      workflows: 3,
      createdAt: '2026-03-20T10:00:00Z',
      updatedAt: '2026-03-24T09:30:00Z',
      isOfficial: true,
      isFavorite: true,
    },
    {
      id: '2',
      name: '社交媒体自动发布',
      description:
        '定时发布内容到多个社交媒体平台，支持 Twitter、LinkedIn、Facebook',
      category: '营销',
      tags: ['社交媒体', '营销', '定时任务'],
      author: '社区贡献者',
      downloads: 8930,
      rating: 4.5,
      workflows: 5,
      createdAt: '2026-03-18T14:20:00Z',
      updatedAt: '2026-03-24T11:15:00Z',
      isOfficial: false,
      isFavorite: false,
    },
    {
      id: '3',
      name: '数据备份与同步',
      description: '定期备份数据库并同步到云存储，支持多种数据库和云服务',
      category: '运维',
      tags: ['备份', '数据库', '云存储'],
      author: 'n8n 官方',
      downloads: 12350,
      rating: 4.9,
      workflows: 2,
      createdAt: '2026-03-15T08:00:00Z',
      updatedAt: '2026-03-23T23:00:00Z',
      isOfficial: true,
      isFavorite: true,
    },
    {
      id: '4',
      name: '客户关系管理集成',
      description: '连接 CRM 系统，自动更新客户信息和跟进记录',
      category: 'CRM',
      tags: ['CRM', '客户管理', '销售'],
      author: '社区贡献者',
      downloads: 6780,
      rating: 4.6,
      workflows: 4,
      createdAt: '2026-03-10T16:45:00Z',
      updatedAt: '2026-03-22T09:45:00Z',
      isOfficial: false,
      isFavorite: false,
    },
    {
      id: '5',
      name: '财务报表自动生成',
      description: '从多个数据源收集财务数据，生成可视化报表并发送邮件',
      category: '财务',
      tags: ['财务', '报表', '数据分析'],
      author: 'n8n 官方',
      downloads: 9560,
      rating: 4.7,
      workflows: 3,
      createdAt: '2026-03-22T11:30:00Z',
      updatedAt: '2026-03-24T10:20:00Z',
      isOfficial: true,
      isFavorite: false,
    },
    {
      id: '6',
      name: '智能客服工单系统',
      description: '自动分配客服工单，跟踪处理进度并发送满意度调查',
      category: '客服',
      tags: ['客服', '工单', '自动化'],
      author: '社区贡献者',
      downloads: 5430,
      rating: 4.4,
      workflows: 6,
      createdAt: '2026-03-12T09:15:00Z',
      updatedAt: '2026-03-23T16:30:00Z',
      isOfficial: false,
      isFavorite: false,
    },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(template => {
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (templateId: string) => {
    setTemplates(
      templates.map(t =>
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            n8n 模板库
          </h1>
          <p className="text-gray-600">浏览、导入和管理预定义的工作流模板</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            导入模板
          </Button>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索模板名称、描述或标签..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总模板数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">可用模板</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">官方模板</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.isOfficial).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">n8n 官方提供</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">收藏模板</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.isFavorite).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">已收藏的模板</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length > 0
                ? (
                    templates.reduce((sum, t) => sum + t.rating, 0) /
                    templates.length
                  ).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">用户平均评分</p>
          </CardContent>
        </Card>
      </div>

      {/* 模板列表 */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>加载中...</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                  >
                    <Star
                      className={`w-4 h-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={template.isOfficial ? 'default' : 'secondary'}
                    >
                      {template.isOfficial ? '官方' : '社区'}
                    </Badge>
                    <span className="text-gray-500">{template.author}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {(template.downloads / 1000).toFixed(1)}k
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {template.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        {template.workflows} 个工作流
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      使用此模板
                    </Button>
                    <Button variant="outline" size="sm">
                      详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {template.name}
                        </h3>
                        {template.isOfficial && (
                          <Badge variant="default">官方</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(template.id)}
                        >
                          <Star
                            className={`w-4 h-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                          />
                        </Button>
                      </div>

                      <p className="text-gray-600 mb-2">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>作者：{template.author}</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {template.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {template.downloads.toLocaleString()} 次下载
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          更新：
                          {new Date(template.updatedAt).toLocaleDateString(
                            'zh-CN'
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">使用此模板</Button>
                      <Button variant="outline" size="sm">
                        详情
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            模板库使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>浏览官方和社区贡献的高质量工作流模板</li>
            <li>一键导入模板到您的 n8n 工作区</li>
            <li>通过分类和标签快速找到所需模板</li>
            <li>收藏常用模板以便下次快速访问</li>
            <li>支持从 URL 导入自定义模板</li>
          </ul>
        </CardContent>
      </Card>

      {/* 导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入模板</DialogTitle>
            <DialogDescription>从 URL 导入 n8n 工作流模板</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="url">模板 URL</Label>
            <Input
              id="url"
              placeholder="https://n8n.io/templates/..."
              value={templateUrl}
              onChange={e => setTemplateUrl(e.target.value)}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleImportTemplate}>导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
