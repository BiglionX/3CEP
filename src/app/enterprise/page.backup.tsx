"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Shield,
  TrendingUp,
  Package,
  Headphones,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface EnterpriseInquiry {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  employeeCount: string;
  serviceType: string[];
  devicesPerYear: string;
  specialRequirements: string;
}

export default function EnterpriseServicePage() {
  const [inquiry, setInquiry] = useState<EnterpriseInquiry>({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    employeeCount: "",
    serviceType: [],
    devicesPerYear: "",
    specialRequirements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const serviceTypes = [
    { id: "bulk-repair", label: "批量设备维修", icon: Package },
    { id: "warranty", label: "企业保修服务", icon: Shield },
    { id: "maintenance", label: "定期维护保养", icon: Clock },
    { id: "consulting", label: "IT设备咨询", icon: TrendingUp },
    { id: "disposal", label: "设备回收处置", icon: Package },
    { id: "training", label: "员工技术培训", icon: Users }
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

  const toggleServiceType = (typeId: string) => {
    setInquiry(prev => ({
      ...prev,
      serviceType: prev.serviceType.includes(typeId)
        ? prev.serviceType.filter(id => id !== typeId)
        : [...prev.serviceType, typeId]
    }));
  };

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
                提交成功！
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                我们已收到您的企业服务咨询请求，商务团队将在24小时内与您联系。
              </p>
              <Button onClick={() => setSubmitted(false)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                返回首页
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
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            企业服务解决方案
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            为企业客户提供专业的批量设备维修、保修服务和技术支持，助力企业降本增效
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：服务介绍 */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>核心优势</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">批量优惠</h3>
                    <p className="text-sm text-gray-600">针对企业客户的专属折扣和套餐方案</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">快速响应</h3>
                    <p className="text-sm text-gray-600">24小时紧急技术支持，48小时内上门服务</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">专业团队</h3>
                    <p className="text-sm text-gray-600">资深工程师团队，提供一站式技术服务</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">数据安全</h3>
                    <p className="text-sm text-gray-600">严格的数据销毁流程，确保信息安全</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  <span>服务保障</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">7×24小时技术支持</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">质量保证承诺</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">原厂配件保障</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">定期服务报告</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：咨询表单 */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">企业服务咨询</CardTitle>
                <p className="text-gray-600">
                  请填写以下信息，我们将为您提供定制化的企业服务方案
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">公司名称 *</Label>
                      <Input
                        id="companyName"
                        value={inquiry.companyName}
                        onChange={(e) => setInquiry({...inquiry, companyName: e.target.value})}
                        placeholder="请输入公司全称"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">联系人 *</Label>
                      <Input
                        id="contactPerson"
                        value={inquiry.contactPerson}
                        onChange={(e) => setInquiry({...inquiry, contactPerson: e.target.value})}
                        placeholder="请输入联系人姓名"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">联系电话 *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={inquiry.phone}
                        onChange={(e) => setInquiry({...inquiry, phone: e.target.value})}
                        placeholder="请输入手机号码"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱地址 *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inquiry.email}
                        onChange={(e) => setInquiry({...inquiry, email: e.target.value})}
                        placeholder="请输入邮箱地址"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">员工规模</Label>
                      <Select
                        value={inquiry.employeeCount}
                        onValueChange={(value) => setInquiry({...inquiry, employeeCount: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择员工人数" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-50">1-50人</SelectItem>
                          <SelectItem value="51-200">51-200人</SelectItem>
                          <SelectItem value="201-500">201-500人</SelectItem>
                          <SelectItem value="501-1000">501-1000人</SelectItem>
                          <SelectItem value="1000+">1000人以上</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="devicesPerYear">年设备数量</Label>
                      <Input
                        id="devicesPerYear"
                        value={inquiry.devicesPerYear}
                        onChange={(e) => setInquiry({...inquiry, devicesPerYear: e.target.value})}
                        placeholder="预计每年维修设备数量"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>所需服务类型 *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {serviceTypes.map((service) => {
                        const Icon = service.icon;
                        const isSelected = inquiry.serviceType.includes(service.id);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleServiceType(service.id)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                              <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                {service.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequirements">特殊需求说明</Label>
                    <Textarea
                      id="specialRequirements"
                      value={inquiry.specialRequirements}
                      onChange={(e) => setInquiry({...inquiry, specialRequirements: e.target.value})}
                      placeholder="请详细说明您的特殊需求或期望的服务标准"
                      rows={4}
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
                        正在提交...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        提交咨询
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 服务流程 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            服务流程
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">1. 提交咨询</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  填写企业服务咨询表单，详细说明需求
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">2. 方案制定</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  商务团队评估需求，制定定制化服务方案
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">3. 合同签署</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  确认服务条款，签署正式合作协议
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">4. 持续服务</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  正式启动服务，定期提供质量报告
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            联系我们
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">电话咨询</h3>
              <p className="text-gray-600">400-888-9999</p>
              <p className="text-sm text-gray-500">工作日 9:00-18:00</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">邮箱联系</h3>
              <p className="text-gray-600">enterprise@fixcycle.com</p>
              <p className="text-sm text-gray-500">24小时在线响应</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">上门服务</h3>
              <p className="text-gray-600">全国主要城市</p>
              <p className="text-sm text-gray-500">48小时内到达</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 简单的Select组件实现
function Select({ value, onValueChange, children }: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function SelectValue({ placeholder }: { placeholder: string }) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="border rounded-md bg-white shadow-lg mt-1">{children}</div>;
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <div 
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => {
        // 这里应该触发onValueChange，但在简化实现中省略
      }}
    >
      {children}
    </div>
  );
}