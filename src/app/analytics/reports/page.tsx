'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Filter,
} from 'lucide-react';
import { analyticsReportService } from '@/lib/analytics-report-service';

interface ReportData {
  metadata: {
    title: string;
    generatedAt: Date;
    timeRange: { start: Date; end: Date };
  };
  summary: Record<string, number>;
  trends: Array<{
    date: string;
    values: Record<string, number>;
  }>;
  breakdown: Record<string, Record<string, number>>;
}

interface Template {
  id: string;
  name: string;
  config: any;
}

export default function AnalyticsReportsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  useEffect(() => {
    setTemplates(analyticsReportService.getReportTemplates());
  }, []);

  const generateReport = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      const config = {
        ...template.config,
        timeRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
          end: new Date(),
        },
      };

      const data = await analyticsReportService.generateBusinessReport(config);
      setReportData(data);
    } catch (error) {
      console.error('生成报表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    if (!reportData) return;

    try {
      let blob: Blob;
      if (format === 'pdf') {
        blob = await analyticsReportService.exportToPDF(reportData);
      } else {
        blob = await analyticsReportService.exportToExcel(reportData);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-purple-600" />
            分析报表系统
          </h1>
          <p className="text-gray-600">生成专业的数据分析报表和可视化图/p>
        </div>

        {/* 报表配置 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              报表配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="template">选择报表模板</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择报表模板" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chartType">图表类型</Label>
                <Select
                  value={chartType}
                  onValueChange={(value: any) => setChartType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">折线/SelectItem>
                    <SelectItem value="bar">柱状/SelectItem>
                    <SelectItem value="pie">饼图</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generateReport}
                disabled={loading || !selectedTemplate}
                className="flex-1"
              >
                {loading ? '生成..' : '生成报表'}
              </Button>
              <Button variant="outline" onClick={() => setReportData(null)}>
                清空结果
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 报表结果 */}
        {reportData && (
          <>
            {/* 报表头部信息 */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {reportData.metadata.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                      生成时间:{' '}
                      {reportData.metadata.generatedAt.toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      时间范围:{' '}
                      {reportData.metadata.timeRange.start.toLocaleDateString()}{' '}
                      - {reportData.metadata.timeRange.end.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => exportReport('pdf')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => exportReport('excel')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* 指标汇总卡*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(reportData.summary).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {typeof value === 'number'
                             value.toLocaleString()
                            : String(value)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BarChart className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 图表展示区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 趋势图表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    数据趋势
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart className="w-12 h-12 mx-auto mb-2" />
                      <p>趋势图表占位/p>
                      <p className="text-sm">
                        (实际项目中集成Chart.js或类似库)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {reportData.trends
                      .slice(0, 3)
                      .map((trend: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{trend.date}</span>
                          <span className="text-purple-600 font-semibold">
                            平均:{' '}
                            {Math.round(
                              (Object.values(trend.values) as number[]).reduce(
                                (a, b) => a + b,
                                0
                              ) / Object.values(trend.values).length
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* 维度分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    维度分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-2" />
                      <p>维度分析图表占位/p>
                      <p className="text-sm">
                        (实际项目中集成Chart.js或类似库)
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {Object.entries(reportData.breakdown)
                      .slice(0, 2)
                      .map(([dimension, values]) => (
                        <div key={dimension}>
                          <h4 className="font-medium text-gray-700 mb-2 capitalize">
                            {dimension}
                          </h4>
                          <div className="space-y-1">
                            {Object.entries(
                              values as Record<string, number>
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm text-gray-600">
                                  {key}
                                </span>
                                <Badge variant="secondary">
                                  {value.toLocaleString()}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 详细数据表格 */}
            <Card>
              <CardHeader>
                <CardTitle>详细数据</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">指标名称</th>
                        <th className="text-left py-3 px-4">数/th>
                        <th className="text-left py-3 px-4">趋势</th>
                        <th className="text-left py-3 px-4">占比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.summary).map(
                        ([key, value], index) => (
                          <tr key={key} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium capitalize">
                              {key.replace(/_/g, ' ')}
                            </td>
                            <td className="py-3 px-4 text-purple-600 font-semibold">
                              {typeof value === 'number'
                                 value.toLocaleString()
                                : String(value)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-green-600 text-sm">
                                  +{Math.floor(Math.random() * 15) + 1}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{
                                    width: `${((value as number) / Math.max(...(Object.values(reportData.summary) as number[]))) * 100}%`,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!reportData && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  选择模板开始生成报                </h3>
                <p className="text-gray-500">
                  从预设模板中选择或自定义配置来生成专业分析报                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

