'use client';

import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';
import { UnifiedFooter } from '@/components/layout/UnifiedFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, User, Database, Bell } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedNavbar />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">隐私政策</h1>
            <p className="text-lg text-gray-600">我们重视您的隐私，保护您的个人信息</p>
            <p className="text-sm text-gray-500 mt-2">生效日期：2024年1月1日</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                我们收集的信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>我们收集以下类型的信息：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>账户信息</strong>：用户名、电子邮件、电话号码等注册信息</li>
                <li><strong>设备信息</strong>：设备型号、故障描述、维修记录等</li>
                <li><strong>位置信息</strong>：您授权的地理位置，用于推荐附近维修点</li>
                <li><strong>交易信息</strong>：订单历史、支付记录、配件购买信息</li>
                <li><strong>使用数据</strong>：服务使用情况、访问日志、偏好设置</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                信息使用方式
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>我们使用收集的信息用于：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>提供、维护和改进我们的服务</li>
                <li>处理您的订单和请求</li>
                <li>向您发送服务通知和更新</li>
                <li>个性化您的用户体验</li>
                <li>进行数据分析和市场研究</li>
                <li>遵守法律义务和保护用户安全</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                信息保护
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>我们采用多种安全措施保护您的个人信息：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>使用 SSL/TLS 加密传输数据</li>
                <li>实施访问控制和身份验证</li>
                <li>定期安全审计和漏洞扫描</li>
                <li>限制员工访问个人信息</li>
                <li>使用行业标准的加密技术存储敏感信息</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                信息共享
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>我们可能在以下情况下共享您的信息：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>服务提供商</strong>：帮助我们提供服务的合作伙伴</li>
                <li><strong>法律要求</strong>：根据法律要求或政府请求</li>
                <li><strong>业务转让</strong>：合并、收购或资产出售时</li>
                <li><strong>经您同意</strong>：您明确授权的情况</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                我们不会出售您的个人信息给第三方广告商。
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                您的权利
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>根据适用法律，您享有以下权利：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>访问权</strong>：获取我们持有的关于您的个人信息</li>
                <li><strong>更正权</strong>：更正不准确或不完整的信息</li>
                <li><strong>删除权</strong>：请求删除您的个人信息</li>
                <li><strong>导出权</strong>：以机器可读格式导出您的数据</li>
                <li><strong>撤回同意</strong>：撤回您之前给予的同意</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-6 h-6 mr-2 text-blue-600" />
                Cookie 和跟踪技术
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                我们使用 Cookie 和类似跟踪技术来跟踪您对我们服务的使用并保留某些信息。
                您可以通过浏览器设置管理 Cookie，但禁用 Cookie 可能影响某些功能。
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>儿童隐私</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。
                如果您发现您的孩子向我们提供了个人信息，请联系我们删除。
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>政策更新</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                我们可能会不时更新本隐私政策。任何更改将在本页面上公布，
                并在政策顶部注明新的生效日期。继续使用我们的服务即表示您接受更新后的政策。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>联系我们</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>如果您对我们的隐私政策有任何疑问，请联系我们：</p>
              <ul className="list-none pl-0 space-y-2">
                <li>📞 电话：400-888-9999</li>
                <li>📧 邮箱：privacy@dushang.tech</li>
                <li>📍 地址：武汉市光谷科技中心</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <UnifiedFooter />
    </div>
  );
}
