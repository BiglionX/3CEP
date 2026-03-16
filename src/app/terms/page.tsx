'use client';

import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';
import { UnifiedFooter } from '@/components/layout/UnifiedFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Scale, FileText, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedNavbar />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">服务条款</h1>
            <p className="text-lg text-gray-600">服务条款最终版本，发布日期：2024年1月1日</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-6 h-6 mr-2 text-blue-600" />
                概述
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                欢迎使用武汉渡商科技平台！本服务条款（以下简称"条款"）是您与武汉渡商科技有限公司之间关于使用我们服务的法律协议。
                在使用我们的服务之前，请仔细阅读本条款。
              </p>
              <p>
                通过访问或使用我们的服务，您同意受本条款的约束。如果您不同意本条款的任何部分，请勿使用我们的服务。
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                服务描述
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>ProdCycleAI 提供以下服务：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>3C设备维修服务预约与管理</li>
                <li>配件商城购物服务</li>
                <li>智能设备估价服务</li>
                <li>维修网点查询与导航</li>
                <li>企业级设备管理解决方案</li>
                <li>贸易服务对接</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                用户账户
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>您需要创建一个账户才能使用某些服务。在注册账户时，您同意：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>提供准确、完整和最新的信息</li>
                <li>妥善保管您的账户密码</li>
                <li>对账户下的所有活动负责</li>
                <li>立即通知我们任何未经授权的使用</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
                知识产权
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                ProdCycleAI 服务及其原始内容、功能和设计均受知识产权法保护。未经我们明确书面许可，您不得复制、修改、分发或创建衍生作品。
              </p>
              <p>
                本平台上所有商标、服务标记和商业外观均为各自所有者的财产。
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>责任限制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                在法律允许的最大范围内，ProdCycleAI 不对任何间接、附带、特殊或后果性损害负责，包括但不限于利润损失、数据丢失或业务中断。
              </p>
              <p>
                我们不保证服务将始终可用、无错误或不间断。
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>终止</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                您可以随时停止使用我们的服务。我们也可能根据本条款终止或暂停您对服务的访问。
              </p>
              <p>
                终止后，您使用服务的权利将立即停止。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>联系我们</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>如果您对这些条款有任何疑问，请联系我们：</p>
              <ul className="list-none pl-0 space-y-2">
                <li>📞 电话：400-888-9999</li>
                <li>📧 邮箱：support@dushang.tech</li>
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
