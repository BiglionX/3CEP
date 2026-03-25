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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart3,
  Clock,
  Copy,
  History,
  LineChart,
  PieChart,
  Play,
  Save,
  Search,
  Table,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface QueryHistory {
  id: string;
  name: string;
  query: string;
  dataSource: string;
  executedAt: string;
  executionTime: number;
  rowCount: number;
  status: 'success' | 'error' | 'running';
}

interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  rowCount: number;
}

export default function QueryAnalysisPage() {
  const [activeTab, setActiveTab] = useState('editor');
  const [query, setQuery] = useState('');
  const [dataSource, setDataSource] = useState('default');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);
  const [queryName, setQueryName] = useState('');

  useEffect(() => {
    loadHistory();
    loadSavedQueries();
  }, []);

  const loadHistory = async () => {
    // 模拟加载历史记录
    const mockHistory: QueryHistory[] = [
      {
        id: '1',
        name: '设备统计查询',
        query:
          "SELECT COUNT(*) as total_devices FROM devices WHERE status = 'active'",
        dataSource: '设备管理系统',
        executedAt: '2026-02-28 14:30:00',
        executionTime: 125,
        rowCount: 1,
        status: 'success',
      },
      {
        id: '2',
        name: '维修记录分析',
        query:
          'SELECT repair_status, COUNT(*) as count FROM repair_orders GROUP BY repair_status',
        dataSource: '维修记录系统',
        executedAt: '2026-02-28 13:45:00',
        executionTime: 89,
        rowCount: 4,
        status: 'success',
      },
    ];
    setHistory(mockHistory);
  };

  const loadSavedQueries = async () => {
    // 模拟加载保存的查询
    const mockSaved = [
      {
        id: '1',
        name: '月度设备增长统计',
        query:
          "SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as new_devices FROM devices GROUP BY month ORDER BY month DESC LIMIT 12",
        dataSource: '设备管理系统',
        createdAt: '2026-02-20',
      },
    ];
    setSavedQueries(mockSaved);
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setExecuting(true);
    setResult(null);

    try {
      // 模拟查询执行
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟查询结果
      const mockResult: QueryResult = {
        columns: ['status', 'count'],
        rows: [
          { status: 'completed', count: 1247 },
          { status: 'in_progress', count: 89 },
          { status: 'pending', count: 34 },
          { status: 'cancelled', count: 12 },
        ],
        executionTime: 156,
        rowCount: 4,
      };

      setResult(mockResult);

      // 添加到历史记录
      const newHistoryItem: QueryHistory = {
        id: Date.now().toString(),
        name: queryName || '临时查询',
        query,
        dataSource: '设备管理系统',
        executedAt: new Date().toLocaleString('zh-CN'),
        executionTime: 156,
        rowCount: 4,
        status: 'success',
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // 保持最多 10 条记录
    } catch (error) {
      console.error('查询执行失败:', error);
    } finally {
      setExecuting(false);
    }
  };

  const saveQuery = () => {
    if (!query.trim() || !queryName.trim()) return;

    const savedQuery = {
      id: Date.now().toString(),
      name: queryName,
      query,
      dataSource,
      createdAt: new Date().toISOString(),
    };

    setSavedQueries(prev => [...prev, savedQuery]);
    setQueryName('');
  };

  const loadQuery = (savedQuery: any) => {
    setQuery(savedQuery.query);
    setQueryName(savedQuery.name);
    setDataSource(savedQuery.dataSource);
    setActiveTab('editor');
  };

  const formatQuery = () => {
    // 简单的 SQL 格式化
    const formatted = query
      .replace(/\s+/g, ' ')
      .replace(/([,(])/g, '$1\n ? ')
      .replace(/([)])/, '\n$1')
      .replace(/(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING)/gi, '\n$1')
      .trim();
    setQuery(formatted);
  };

  const renderResultTable = () => {
    if (!result) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {result.columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVisualization = (type: 'bar' | 'pie' | 'line') => {
    if (!result) return null;

    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">可视化图表区</p>
          <p className="text-sm text-gray-400">
            基于查询结果生成
            {type === 'bar' ? '柱状图' : type === 'pie' ? '饼图' : '折线图'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* 页面头部 - 移动端优*/}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          查询分析
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          编写和执行数据分析查询
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="editor" className="text-xs sm:text-sm py-2">
            <Search className="mr-1 h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden xs:inline">查询编辑器</span>
            <span className="xs:hidden">编辑</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm py-2">
            <Table className="mr-1 h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden xs:inline">查询结果</span>
            <span className="xs:hidden">结果</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs sm:text-sm py-2 hidden sm:block"
          >
            <History className="mr-2 h-4 w-4" />
            执行历史
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="text-xs sm:text-sm py-2 hidden sm:block"
          >
            <Save className="mr-2 h-4 w-4" />
            保存查询
          </TabsTrigger>
        </TabsList>
        {/* 移动端额外的历史和保存选项 */}
        <div className="sm:hidden flex space-x-2 mt-2">
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs py-2"
            onClick={() => setActiveTab('history')}
          >
            <History className="mr-1 h-3 w-3" />
            历史
          </Button>
          <Button
            variant={activeTab === 'saved' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-xs py-2"
            onClick={() => setActiveTab('saved')}
          >
            <Save className="mr-1 h-3 w-3" />
            保存
          </Button>
        </div>

        <TabsContent value="editor" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <CardTitle className="text-base sm:text-lg">
                  SQL 查询编辑{' '}
                </CardTitle>
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-2">
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger className="w-full xs:w-[140px] sm:w-[180px]">
                      <SelectValue placeholder="选择数据源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">默认数据源</SelectItem>
                      <SelectItem value="devices">设备管理系统</SelectItem>
                      <SelectItem value="repair">维修记录系统</SelectItem>
                      <SelectItem value="supply">供应链系统</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={executeQuery}
                    disabled={executing || !query.trim()}
                    className="flex items-center py-2 px-3 text-sm sm:py-2 sm:px-4"
                  >
                    {executing ? (
                      <>
                        <Clock className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 animate-spin" />
                        <span className="text-xs sm:text-sm">执行中...</span>
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">执行查询</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
                <Input
                  placeholder="查询名称（可选）"
                  value={queryName}
                  onChange={e => setQueryName(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={saveQuery}
                  variant="outline"
                  className="py-2 px-3 text-xs sm:text-sm"
                  disabled={!query.trim()}
                >
                  <Save className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  保存
                </Button>
                <Button
                  onClick={formatQuery}
                  variant="outline"
                  className="py-2 px-3 text-xs sm:text-sm"
                >
                  格式化
                </Button>
              </div>

              <Textarea
                placeholder="在此输入您的 SQL 查询语句..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                rows={8}
                className="font-mono text-xs sm:text-sm min-h-[200px] sm:min-h-[300px]"
              />

              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between text-xs sm:text-sm text-gray-500 gap-1 xs:gap-0">
                <div>
                  字符数：{query.length} | 行数：{query.split('\n').length}
                </div>
                <div className="flex items-center space-x-2 xs:space-x-4">
                  <span className="hidden sm:inline">语法高亮：已启用</span>
                  <span className="hidden sm:inline">自动补全：已启用</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">查询结果</CardTitle>
              <CardDescription>
                {result ? (
                  <div className="flex flex-wrap items-center gap-2 xs:gap-4 text-xs sm:text-sm">
                    <span>执行时间：{result.executionTime}ms</span>
                    <span>返回行数：{result.rowCount}</span>
                    <span>列数：{result.columns.length}</span>
                  </div>
                ) : (
                  <span>尚未执行查询</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <Tabs defaultValue="table">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="table"
                      className="text-xs sm:text-sm py-2"
                    >
                      <Table className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">表格视图</span>
                      <span className="xs:hidden">表格</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="chart"
                      className="text-xs sm:text-sm py-2"
                    >
                      <BarChart3 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">图表视图</span>
                      <span className="xs:hidden">图表</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="table">{renderResultTable()}</TabsContent>
                  <TabsContent value="chart">
                    <Tabs defaultValue="bar">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="bar" className="text-xs py-2">
                          <BarChart3 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">柱状图</span>
                        </TabsTrigger>
                        <TabsTrigger value="pie" className="text-xs py-2">
                          <PieChart className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">饼图</span>
                        </TabsTrigger>
                        <TabsTrigger value="line" className="text-xs py-2">
                          <LineChart className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">折线图</span>
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="bar">
                        {renderVisualization('bar')}
                      </TabsContent>
                      <TabsContent value="pie">
                        {renderVisualization('pie')}
                      </TabsContent>
                      <TabsContent value="line">
                        {renderVisualization('line')}
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无查询结果
                  </h3>
                  <p className="text-gray-500">
                    在查询编辑器中执行查询以查看结果
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                查询执行历史
              </CardTitle>
              <CardDescription>最近执行的查询记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm sm:text-base">
                            {item.name}
                          </h4>
                          <Badge
                            variant={
                              item.status === 'success'
                                ? 'default'
                                : 'destructive'
                            }
                            className="text-xs"
                          >
                            {item.status === 'success' ? '成功' : '失败'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-mono mb-2 line-clamp-2">
                          {item.query}
                        </p>
                        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2 xs:gap-4">
                          <span>数据源 {item.dataSource}</span>
                          <span>执行时间: {item.executedAt}</span>
                          <span>耗时: {item.executionTime}ms</span>
                          <span>行数: {item.rowCount}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="self-start sm:self-auto p-2"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">暂无执行历史</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">保存的查询</CardTitle>
              <CardDescription>您保存的常用查询模板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedQueries.map(item => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2 text-sm sm:text-base">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 font-mono mb-2 line-clamp-2">
                          {item.query}
                        </p>
                        <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2 xs:gap-4">
                          <span>数据源 {item.dataSource}</span>
                          <span>
                            创建时间:{' '}
                            {new Date(item.createdAt).toLocaleDateString(
                              'zh-CN'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => loadQuery(item)}
                          className="p-2"
                        >
                          <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-2">
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-2">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {savedQueries.length === 0 && (
                  <div className="text-center py-8">
                    <Save className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">暂无保存的查询</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
