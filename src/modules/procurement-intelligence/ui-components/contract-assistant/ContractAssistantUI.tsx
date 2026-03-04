'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckSquare,
  AlertTriangle,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Award,
  Edit,
  Save,
  Download,
  Send,
  MessageSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContractTemplate {
  id: string;
  name: string;
  type: 'standard' | 'framework' | 'nda' | 'custom';
  clauses: ContractClause[];
  lastModified: string;
}

interface ContractClause {
  id: string;
  category: string;
  title: string;
  content: string;
  importance: 'critical' | 'important' | 'standard';
  suggested: boolean;
  explanation?: string;
}

interface ContractAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: Recommendation[];
  complianceIssues: ComplianceIssue[];
}

interface Recommendation {
  id: string;
  type: 'add' | 'modify' | 'remove';
  clause: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

interface ComplianceIssue {
  id: string;
  clause: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  regulation: string;
}

export default function ContractAssistantUI() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [contractContent, setContractContent] = useState('');
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      // 模拟模板数据
      const mockTemplates: ContractTemplate[] = [
        {
          id: 'temp-001',
          name: '标准采购合同模板',
          type: 'standard',
          clauses: [
            {
              id: 'clause-001',
              category: '价格条款',
              title: '价格与支付条?,
              content: '买方应在收到货物并验收合格后30天内支付货款...',
              importance: 'critical',
              suggested: true,
              explanation: '明确付款时间和条件，降低收款风险',
            },
            {
              id: 'clause-002',
              category: '质量保证',
              title: '质量标准与检?,
              content: '卖方保证所提供的货物符合国家标准GB/T...',
              importance: 'important',
              suggested: true,
              explanation: '确保产品质量符合要求',
            },
            {
              id: 'clause-003',
              category: '违约责任',
              title: '违约赔偿',
              content: '如一方违约，应向守约方支付合同总价10%的违约金...',
              importance: 'critical',
              suggested: true,
              explanation: '保护双方合法权益',
            },
          ],
          lastModified: '2024-03-10',
        },
        {
          id: 'temp-002',
          name: '框架协议模板',
          type: 'framework',
          clauses: [
            {
              id: 'clause-004',
              category: '合作期限',
              title: '协议有效?,
              content: '本协议自签署之日起生效，有效期为一?..',
              importance: 'standard',
              suggested: true,
            },
          ],
          lastModified: '2024-02-15',
        },
      ];

      setTemplates(mockTemplates);
      if (mockTemplates.length > 0) {
        setSelectedTemplate(mockTemplates[0].id);
      }
    };

    loadTemplates();
  }, []);

  const handleAnalyzeContract = async () => {
    setLoading(true);

    // 模拟AI分析
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis: ContractAnalysis = {
      riskScore: 72,
      riskLevel: 'medium',
      recommendations: [
        {
          id: 'rec-001',
          type: 'add',
          clause: '知识产权归属',
          suggestion: '建议增加知识产权归属条款，明确技术成果的所有权',
          priority: 'high',
          impact: '避免未来知识产权纠纷',
        },
        {
          id: 'rec-002',
          type: 'modify',
          clause: '保密义务',
          suggestion: '延长保密义务期限至合同终止后3�?,
          priority: 'medium',
          impact: '更好地保护商业秘?,
        },
        {
          id: 'rec-003',
          type: 'add',
          clause: '不可抗力',
          suggestion: '补充不可抗力条款的具体情形和处理方式',
          priority: 'low',
          impact: '完善风险分担机制',
        },
      ],
      complianceIssues: [
        {
          id: 'comp-001',
          clause: '争议解决',
          issue: '未明确约定仲裁机?,
          severity: 'high',
          regulation: '《仲裁法》相关规?,
        },
        {
          id: 'comp-002',
          clause: '适用法律',
          issue: '未指定适用法律条款',
          severity: 'medium',
          regulation: '国际贸易惯例',
        },
      ],
    };

    setAnalysis(mockAnalysis);
    setLoading(false);
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">智能合同助手</h1>
        <p className="text-muted-foreground">AI驱动的合同条款分析与优化建议</p>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">合同编辑</TabsTrigger>
          <TabsTrigger value="analysis">智能分析</TabsTrigger>
          <TabsTrigger value="templates">模板?/TabsTrigger>
        </TabsList>

        {/* 合同编辑标签?*/}
        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧模板选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  合同模板
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <Badge
                          variant={
                            template.type === 'standard'
                              ? 'default'
                              : template.type === 'framework'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {template.type === 'standard'
                            ? '标准'
                            : template.type === 'framework'
                              ? '框架'
                              : '自定?}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        更新: {template.lastModified}
                      </p>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  创建新模?                </Button>
              </CardContent>
            </Card>

            {/* 中间编辑区域 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {selectedTemplateData
                      ? selectedTemplateData.name
                      : '合同编辑?}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      保存
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      导出
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="在此处编辑合同内?.."
                  value={contractContent}
                  onChange={e => setContractContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    格式?                  </Button>
                  <Button onClick={handleAnalyzeContract} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        分析?..
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        智能分析
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 智能分析标签?*/}
        <TabsContent value="analysis" className="space-y-6">
          {!analysis ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无分析结果</h3>
                <p className="text-muted-foreground mb-4">
                  请先在合同编辑器中输入合同内容，然后点击"智能分析"
                </p>
                <Button
                  onClick={() =>
                    document.getElementById('tabs-trigger-editor')?.click()
                  }
                >
                  前往编辑?                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 风险评估 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    合同风险评估
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div
                      className={`text-4xl font-bold mb-2 ${getRiskColor(
                        analysis.riskLevel
                      )}`}
                    >
                      {analysis.riskScore}/100
                    </div>
                    <Badge
                      variant={
                        analysis.riskLevel === 'low'
                          ? 'default'
                          : analysis.riskLevel === 'medium'
                            ? 'secondary'
                            : analysis.riskLevel === 'high'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {analysis.riskLevel === 'low'
                        ? '低风?
                        : analysis.riskLevel === 'medium'
                          ? '中等风险'
                          : analysis.riskLevel === 'high'
                            ? '高风?
                            : '严重风险'}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">风险构成</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          法律合规风险
                        </span>
                        <span className="font-medium">25/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          商务条款风险
                        </span>
                        <span className="font-medium">32/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">履行风险</span>
                        <span className="font-medium">18/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          争议解决风险
                        </span>
                        <span className="font-medium">27/100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 优化建议 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    优化建议
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map(rec => (
                      <div key={rec.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{rec.clause}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority === 'high'
                              ? '高优先级'
                              : rec.priority === 'medium'
                                ? '中优先级'
                                : '低优先级'}
                          </Badge>
                        </div>

                        <div className="mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {rec.type === 'add'
                              ? '新增建议:'
                              : rec.type === 'modify'
                                ? '修改建议:'
                                : '删除建议:'}
                          </span>
                          <p className="text-sm mt-1">{rec.suggestion}</p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          影响: {rec.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 合规问题 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    合规问题提醒
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.complianceIssues.map(issue => (
                      <div
                        key={issue.id}
                        className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">{issue.clause}</h4>
                          <p className="text-sm text-orange-800 mt-1">
                            {issue.issue}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className="text-orange-700"
                            >
                              {issue.regulation}
                            </Badge>
                            <Badge
                              variant={
                                issue.severity === 'high'
                                  ? 'destructive'
                                  : issue.severity === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {issue.severity === 'high'
                                ? '严重'
                                : issue.severity === 'medium'
                                  ? '中等'
                                  : '轻微'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 模板库标签页 */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>推荐合同条款</CardTitle>
              <CardDescription>基于行业最佳实践的智能条款推荐</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplateData?.clauses.map(clause => (
                  <div key={clause.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{clause.title}</h3>
                      <Badge className={getImportanceColor(clause.importance)}>
                        {clause.importance === 'critical'
                          ? '关键'
                          : clause.importance === 'important'
                            ? '重要'
                            : '标准'}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {clause.content.substring(0, 100)}...
                    </p>

                    {clause.explanation && (
                      <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                        💡 {clause.explanation}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        使用此条?                      </Button>
                      <Button size="sm" variant="ghost">
                        详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底部操作?*/}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline">
          <Send className="h-4 w-4 mr-2" />
          发送给法务审核
        </Button>
        <Button>
          <CheckSquare className="h-4 w-4 mr-2" />
          确认并签?        </Button>
      </div>
    </div>
  );
}
