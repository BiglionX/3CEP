"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Search,
  Star
} from "lucide-react";

interface ProcurementRequest {
  productName: string;
  quantity: string;
  specifications: string;
  budget: string;
  deliveryDate: string;
  specialRequirements: string;
}

export default function B2BProcurementPage() {
  const [request, setRequest] = useState<ProcurementRequest>({
    productName: "",
    quantity: "",
    specifications: "",
    budget: "",
    deliveryDate: "",
    specialRequirements: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');

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

  const featuredSuppliers = [
    {
      id: 1,
      name: "华强北电子科技有限公司",
      rating: 4.8,
      products: "电子元器件、芯片、传感器",
      location: "深圳",
      responseTime: "2小时"
    },
    {
      id: 2,
      name: "长三角精密制造集团",
      rating: 4.9,
      products: "机械零件、模具、加工服务",
      location: "上海",
      responseTime: "4小时"
    },
    {
      id: 3,
      name: "珠三角新材料有限公司",
      rating: 4.7,
      products: "新型材料、复合材料、涂料",
      location: "广州",
      responseTime: "6小时"
    }
  ];

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
                采购需求提交成功！
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                我们的AI采购智能体正在为您匹配最优供应商，预计5分钟内提供3-5个精选报价方案
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setSubmitted(false)}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  继续提交需求
                </Button>
                <Link href="/enterprise/procurement/dashboard">
                  <Button variant="outline">
                    查看采购进度
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            B2B智能采购平台
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            基于AI的智能供应商匹配和自动采购决策系统，让采购更智能、更高效
          </p>
        </div>

        {/* 标签导航 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            提交采购需求
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            优质供应商
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'features'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            核心功能
          </button>
        </div>

        {activeTab === 'submit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：服务介*/}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>智能采购优势</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">AI智能匹配</h3>
                      <p className="text-sm text-gray-600">基于需求自动匹配最优供应商，节省90%筛选时间</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">自动询价比价</h3>
                      <p className="text-sm text-gray-600">批量向多家供应商询价，智能分析报价差异</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">风险智能评估</h3>
                      <p className="text-sm text-gray-600">全方位评估供应商资质和交付风险</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">全程透明追踪</h3>
                      <p className="text-sm text-gray-600">实时跟踪采购进度和订单状态</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>服务数据</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均节省成本</span>
                    <span className="font-semibold text-green-600">15-25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">采购效率提升</span>
                    <span className="font-semibold text-blue-600">300%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">供应商库规模</span>
                    <span className="font-semibold">10,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI匹配准确率</span>
                    <span className="font-semibold text-purple-600">95%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：采购表*/}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">提交采购需求</CardTitle>
                  <p className="text-gray-600">
                    详细描述您的采购需求，AI智能体会为您匹配最优供应商
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="productName">产品名称 *</Label>
                        <Input
                          id="productName"
                          value={request.productName}
                          onChange={(e) => setRequest({...request, productName: e.target.value})}
                          placeholder="请输入需要采购的产品名称"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quantity">采购数量 *</Label>
                        <Input
                          id="quantity"
                          value={request.quantity}
                          onChange={(e) => setRequest({...request, quantity: e.target.value})}
                          placeholder="如：1000件或5000KG"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specifications">产品规格要求</Label>
                      <Textarea
                        id="specifications"
                        value={request.specifications}
                        onChange={(e) => setRequest({...request, specifications: e.target.value})}
                        placeholder="请详细描述产品的技术规格、质量标准等要求"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget">预算范围</Label>
                        <Input
                          id="budget"
                          value={request.budget}
                          onChange={(e) => setRequest({...request, budget: e.target.value})}
                          placeholder="如：¥50,000-80,000"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deliveryDate">期望交付时间</Label>
                        <Input
                          id="deliveryDate"
                          type="date"
                          value={request.deliveryDate}
                          onChange={(e) => setRequest({...request, deliveryDate: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequirements">特殊要求说明</Label>
                      <Textarea
                        id="specialRequirements"
                        value={request.specialRequirements}
                        onChange={(e) => setRequest({...request, specialRequirements: e.target.value})}
                        placeholder="包装要求、认证标准、售后服务等特殊需求"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          AI正在分析需求...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          智能匹配供应商
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">优质供应商推荐</h2>
              <p className="text-lg text-gray-600">经过AI智能筛选的高质量供应商合作伙伴</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{supplier.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">主营产品</span>
                        {supplier.products}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">所在地</span>
                        {supplier.location}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">响应时间</span>
                        {supplier.responseTime}
                      </p>
                    </div>
                    <Button className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      联系供应商
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg">
                <Search className="w-5 h-5 mr-2" />
                查看全部供应商
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能特色</h2>
              <p className="text-lg text-gray-600">全方位的智能采购解决方案</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Search,
                  title: '智能需求解析',
                  description: '自然语言处理技术，自动理解复杂的采购需求'
                },
                {
                  icon: Users,
                  title: '供应商智能匹配',
                  description: '基于多维度算法，精准匹配最优供应商'
                },
                {
                  icon: Package,
                  title: '自动询价比价',
                  description: '批量询价，智能分析价格差异和性价比'
                },
                {
                  icon: Shield,
                  title: '风险评估',
                  description: '全方位供应商资质和交付风险智能评估'
                },
                {
                  icon: BarChart3,
                  title: '数据分析',
                  description: '采购数据可视化，洞察采购趋势和优化空间'
                },
                {
                  icon: Globe,
                  title: '全球采购',
                  description: '支持国内外供应商，扩大采购选择范围'
                },
                {
                  icon: TrendingUp,
                  title: '成本优化',
                  description: '智能推荐最优采购策略，最大化成本效益'
                },
                {
                  icon: Zap,
                  title: '效率提升',
                  description: '自动化流程，大幅提升采购工作效率'
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
