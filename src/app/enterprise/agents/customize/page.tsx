"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, 
  Zap,
  Brain,
  Database,
  Globe,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Calculator,
  FileText
} from "lucide-react";

interface AgentRequirement {
  businessType: string;
  useCase: string;
  technicalRequirements: string[];
  integrationPoints: string[];
  expectedOutcomes: string;
  timeline: string;
  budget: string;
}

export default function AgentCustomizationPage() {
  const [step, setStep] = useState(1);
  const [requirements, setRequirements] = useState<AgentRequirement>({
    businessType: "",
    useCase: "",
    technicalRequirements: [],
    integrationPoints: [],
    expectedOutcomes: "",
    timeline: "",
    budget: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const technicalOptions = [
    { id: "nlp", label: "自然语言处理", icon: Brain },
    { id: "ml", label: "机器学习", icon: Database },
    { id: "api", label: "API集成", icon: Globe },
    { id: "automation", label: "流程自动化", icon: Zap },
    { id: "analytics", label: "数据分析", icon: TrendingUp },
    { id: "security", label: "安全防护", icon: Shield }
  ];

  const integrationOptions = [
    { id: "erp", label: "ERP系统", icon: Database },
    { id: "crm", label: "CRM系统", icon: Users },
    { id: "wechat", label: "企业微信", icon: Globe },
    { id: "email", label: "邮件系统", icon: FileText },
    { id: "database", label: "数据库", icon: Database },
    { id: "website", label: "网站/API", icon: Globe }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                需求提交成功！
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                我们的AI专家团队将在24小时内与您联系，为您提供详细的定制方案和报价。
              </p>
              <Button onClick={() => setSubmitted(false)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                返回企业服务
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI智能体定制服务
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            为企业量身定制专属AI智能体，实现业务流程自动化和智能化升级
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4 text-sm text-gray-600">
            {step === 1 && '基本信息'}
            {step === 2 && '技术需求'}
            {step === 3 && '预期目标'}
            {step === 4 && '提交确认'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：服务介绍 */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span>服务优势</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">快速部署</h3>
                    <p className="text-sm text-gray-600">2-4周完成定制开发和部署上线</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">灵活定制</h3>
                    <p className="text-sm text-gray-600">根据企业具体需求量身定制功能</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">持续优化</h3>
                    <p className="text-sm text-gray-600">提供长期维护和技术支持服务</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">安全保障</h3>
                    <p className="text-sm text-gray-600">企业级安全防护和数据隐私保护</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span>价格参考</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">基础版</span>
                    <span className="font-semibold">¥20,000起</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">标准版</span>
                    <span className="font-semibold">¥50,000起</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">企业版</span>
                    <span className="font-semibold">¥100,000+</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-2 border-t">
                    * 具体价格根据需求复杂度确定
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：定制表单 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>
                  {step === 1 && '企业基本信息'}
                  {step === 2 && '技术需求配置'}
                  {step === 3 && '预期目标设定'}
                  {step === 4 && '确认提交'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="businessType">企业类型 *</Label>
                          <Input
                            id="businessType"
                            value={requirements.businessType}
                            onChange={(e) => setRequirements({...requirements, businessType: e.target.value})}
                            placeholder="如：制造业、零售业、服务业等"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="useCase">应用场景 *</Label>
                          <Input
                            id="useCase"
                            value={requirements.useCase}
                            onChange={(e) => setRequirements({...requirements, useCase: e.target.value})}
                            placeholder="如：客服机器人、数据分析、流程自动化等"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timeline">项目时间要求</Label>
                        <select
                          id="timeline"
                          value={requirements.timeline}
                          onChange={(e) => setRequirements({...requirements, timeline: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择时间要求</option>
                          <option value="urgent">紧急（1-2周）</option>
                          <option value="normal">标准（1-2个月）</option>
                          <option value="flexible">灵活（2-3个月）</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="budget">预算范围</Label>
                        <select
                          id="budget"
                          value={requirements.budget}
                          onChange={(e) => setRequirements({...requirements, budget: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择预算范围</option>
                          <option value="low">¥10,000-30,000</option>
                          <option value="medium">¥30,000-80,000</option>
                          <option value="high">¥80,000+</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>技术需求 *</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {technicalOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = requirements.technicalRequirements.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  const newReqs = isSelected
                                    ? requirements.technicalRequirements.filter(id => id !== option.id)
                                    : [...requirements.technicalRequirements, option.id];
                                  setRequirements({...requirements, technicalRequirements: newReqs});
                                }}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {option.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>系统集成点</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {integrationOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = requirements.integrationPoints.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  const newPoints = isSelected
                                    ? requirements.integrationPoints.filter(id => id !== option.id)
                                    : [...requirements.integrationPoints, option.id];
                                  setRequirements({...requirements, integrationPoints: newPoints});
                                }}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                  isSelected 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                                  <span className={`font-medium ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                                    {option.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="expectedOutcomes">预期成果和收益 *</Label>
                        <Textarea
                          id="expectedOutcomes"
                          value={requirements.expectedOutcomes}
                          onChange={(e) => setRequirements({...requirements, expectedOutcomes: e.target.value})}
                          placeholder="请详细描述希望通过AI智能体实现的具体目标和预期收益"
                          rows={6}
                          required
                        />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 专家建议</h4>
                        <p className="text-blue-800 text-sm">
                          建议详细描述具体的业务痛点和量化的目标指标，
                          如"提升客服效率30%"、"降低人工成本20%"等，
                          这有助于我们为您制定更精准的解决方案。
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <Card className="border-2 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-blue-900">需求确认</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">企业类型：</span>
                              <span className="text-gray-900">{requirements.businessType}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">应用场景：</span>
                              <span className="text-gray-900">{requirements.useCase}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">技术需求：</span>
                              <span className="text-gray-900">{requirements.technicalRequirements.join(', ')}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">预算范围：</span>
                              <span className="text-gray-900">
                                {requirements.budget === 'low' && '¥10,000-30,000'}
                                {requirements.budget === 'medium' && '¥30,000-80,000'}
                                {requirements.budget === 'high' && '¥80,000+'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">预期成果：</span>
                            <p className="text-gray-900 mt-1">{requirements.expectedOutcomes}</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <p className="text-gray-600 text-center">
                        提交后我们的AI专家将在24小时内与您联系，提供详细的定制方案和报价
                      </p>
                    </div>
                  )}

                  {/* 导航按钮 */}
                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                    >
                      上一步
                    </Button>
                    
                    {step < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={
                          step === 1 && (!requirements.businessType || !requirements.useCase) ||
                          step === 2 && requirements.technicalRequirements.length === 0
                        }
                      >
                        下一步
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            提交中...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            提交需求
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}