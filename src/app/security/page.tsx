'use client';

import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';
import { UnifiedFooter } from '@/components/layout/UnifiedFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle, Phone, Mail, Clock } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedNavbar />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">安全中心</h1>
            <p className="text-lg text-gray-600">武汉渡商科技致力于保护您的数据安全和隐私</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold text-green-800">数据加密</h3>
                <p className="text-sm text-green-700 mt-2">所有数据传输均使用 SSL/TLS 加密</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <Server className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold text-green-800">安全认证</h3>
                <p className="text-sm text-green-700 mt-2">通过 ISO 27001 信息安全管理体系认证</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <Lock className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold text-green-800">隐私保护</h3>
                <p className="text-sm text-green-700 mt-2">严格遵守数据保护法规</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                安全措施
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>我们采用多层次的安全措施来保护您的数据：</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>网络安全</strong>
                  <ul className="list-circle pl-6 mt-1 text-gray-600">
                    <li>企业级防火墙和入侵检测系统</li>
                    <li>DDoS 防护和流量监控</li>
                    <li>定期安全漏洞扫描和渗透测试</li>
                  </ul>
                </li>
                <li>
                  <strong>数据安全</strong>
                  <ul className="list-circle pl-6 mt-1 text-gray-600">
                    <li>敏感数据 AES-256 加密存储</li>
                    <li>数据库访问权限严格控制</li>
                    <li>数据备份和灾难恢复机制</li>
                  </ul>
                </li>
                <li>
                  <strong>应用安全</strong>
                  <ul className="list-circle pl-6 mt-1 text-gray-600">
                    <li>Web 应用防火墙 (WAF)</li>
                    <li>SQL 注入和 XSS 攻击防护</li>
                    <li>定期代码审计和安全更新</li>
                  </ul>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                账户安全建议
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>为保护您的账户安全，建议您：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>使用强密码（至少8位，包含大小写字母、数字和特殊字符）</li>
                <li>定期更换密码，不要在多个网站使用相同密码</li>
                <li>启用双因素认证（2FA）</li>
                <li>警惕钓鱼邮件和欺诈链接</li>
                <li>不在公共设备上保存登录信息</li>
                <li>及时更新操作系统和浏览器</li>
                <li>发现异常及时联系我们和修改密码</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
                安全威胁防范
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>请注意以下常见安全威胁：</p>
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">钓鱼攻击</h4>
                  <p className="text-sm text-yellow-700">
                    不要点击来自可疑来源的链接，不要在不信任的网站输入账户信息。
                    我们的官方域名是 fixcycle.com。
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">欺诈电话</h4>
                  <p className="text-sm text-yellow-700">
                    我们不会通过电话要求您提供密码或验证码。如遇此类请求，请立即挂断。
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">恶意软件</h4>
                  <p className="text-sm text-yellow-700">
                    只从官方渠道下载应用程序，不要安装来源不明的软件。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>安全认证与合规</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>我们的安全实践符合以下标准和法规：</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">ISO 27001</h4>
                  <p className="text-sm text-blue-700">信息安全管理体系认证</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">GDPR 合规</h4>
                  <p className="text-sm text-blue-700">通用数据保护条例合规</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">网络安全等级保护</h4>
                  <p className="text-sm text-blue-700">等保三级认证</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">PCI DSS</h4>
                  <p className="text-sm text-blue-700">支付卡行业数据安全标准</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>漏洞报告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                如果您发现安全漏洞，请通过以下方式联系我们：
              </p>
              <ul className="list-none pl-0 space-y-2">
                <li>📧 邮箱：security@dushang.tech</li>
                <li>⏰ 响应时间：24小时内初步响应</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                我们感谢您帮助我们保护用户安全。对于有效报告的安全问题，我们将给予适当奖励。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-6 h-6 mr-2 text-blue-600" />
                安全服务热线
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold">服务时间</p>
                  <p className="text-sm">工作日 9:00-18:00</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold">客服热线</p>
                  <p className="text-sm">400-888-9999</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold">安全邮箱</p>
                  <p className="text-sm">security@dushang.tech</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <UnifiedFooter />
    </div>
  );
}
