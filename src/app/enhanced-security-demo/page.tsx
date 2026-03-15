/**
 * 增强版数据安全演示页 * 展示数据加密、脱敏、哈希等安全功能
 */

'use client';

import { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  SecurityProvider,
  useSecurity,
  SecureData,
  MaskedData,
} from '@/components/enhanced-security/SecurityService';
import { SecurityManagementPanel } from '@/components/enhanced-security/SecurityManagementPanel';

// 模拟用户数据
const SAMPLE_USER_DATA = {
  id: 'user_001',
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  idCard: '110101199001011234',
  bankAccount: '6222021234567890123',
  salary: 15000,
};

// 演示组件
function SecurityDemo() {
  const { encryptData, decryptData, hashData, verifyHash, maskData } =
    useSecurity();

  const [currentUserRole, setCurrentUserRole] = useState('viewer');
  const [encryptionDemo, setEncryptionDemo] = useState<any>(null);
  const [hashDemo, setHashDemo] = useState<any>(null);

  // 测试加密解密
  const testEncryption = async () => {
    try {
      const encrypted = await encryptData(SAMPLE_USER_DATA.phone);
      const decrypted = await decryptData(encrypted);

      setEncryptionDemo({
        original: SAMPLE_USER_DATA.phone,
        encrypted: encrypted.encrypted,
        decrypted,
        success: decrypted === SAMPLE_USER_DATA.phone,
      });
    } catch (error) {
      console.error('加密测试失败:', error);
    }
  };

  // 测试哈希
  const testHashing = async () => {
    try {
      const hash = await hashData(SAMPLE_USER_DATA.idCard);
      const isValid = await verifyHash(SAMPLE_USER_DATA.idCard, hash);

      setHashDemo({
        original: SAMPLE_USER_DATA.idCard,
        hash,
        verified: isValid,
        success: isValid,
      });
    } catch (error) {
      console.error('哈希测试失败:', error);
    }
  };

  // 获取角色描述
  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      admin: '超级管理员- 可查看所有原始数,
      manager: '管理员- 可查看大部分敏感数据',
      viewer: '查看- 只能看到脱敏后的数据',
      external_partner: '外部合作伙伴 - 数据访问受限',
    };
    return descriptions[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            数据安全演示
          </h1>
          <p className="text-gray-600">
            展示数据加密、脱敏、哈希等企业级安全保护机          </p>
        </div>

        {/* 角色选择*/}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              用户角色模拟
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {['admin', 'manager', 'viewer', 'external_partner'].map(role => (
                <Button
                  key={role}
                  variant={currentUserRole === role  'default' : 'outline'}
                  onClick={() => setCurrentUserRole(role)}
                  className="capitalize"
                >
                  {role}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              当前角色:{' '}
              <span className="font-medium">
                {getRoleDescription(currentUserRole)}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* 主要演示区域 */}
        <Tabs defaultValue="data-protection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data-protection">数据保护</TabsTrigger>
            <TabsTrigger value="encryption">加密演示</TabsTrigger>
            <TabsTrigger value="management">安全管理</TabsTrigger>
          </TabsList>

          <TabsContent value="data-protection">
            <div className="space-y-6">
              {/* 用户信息展示 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    用户信息安全展示
                  </CardTitle>
                  <CardDescription>
                    根据不同用户角色展示不同程度的数据脱敏效                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 原始数据卡片 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          原始数据 (管理员视
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">姓名</div>
                          <div className="font-medium">
                            {SAMPLE_USER_DATA.name}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">邮箱</div>
                          <div className="font-medium">
                            {SAMPLE_USER_DATA.email}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">手机/div>
                          <div className="font-medium">
                            {SAMPLE_USER_DATA.phone}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">身份证号</div>
                          <div className="font-medium">
                            {SAMPLE_USER_DATA.idCard}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">银行卡号</div>
                          <div className="font-medium">
                            {SAMPLE_USER_DATA.bankAccount}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">薪资</div>
                          <div className="font-medium">
                            ¥{SAMPLE_USER_DATA.salary.toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 脱敏数据卡片 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <EyeOff className="w-5 h-5" />
                          脱敏数据 ({currentUserRole}视角)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">姓名</div>
                          <div className="font-medium">
                            {SAMPLE_USER_DATA.name}
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">邮箱</div>
                          <MaskedData
                            data={SAMPLE_USER_DATA.email}
                            table="users"
                            column="email"
                            userRole={currentUserRole}
                            showOriginal={
                              currentUserRole === 'admin' ||
                              currentUserRole === 'manager'
                            }
                          />
                        </div>

                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">手机/div>
                          <MaskedData
                            data={SAMPLE_USER_DATA.phone}
                            table="users"
                            column="phone"
                            userRole={currentUserRole}
                            showOriginal={
                              currentUserRole === 'admin' ||
                              currentUserRole === 'manager'
                            }
                          />
                        </div>

                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">身份证号</div>
                          <MaskedData
                            data={SAMPLE_USER_DATA.idCard}
                            table="users"
                            column="id_card"
                            userRole={currentUserRole}
                            showOriginal={currentUserRole === 'admin'}
                          />
                        </div>

                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">银行卡号</div>
                          <MaskedData
                            data={SAMPLE_USER_DATA.bankAccount}
                            table="users"
                            column="bank_account"
                            userRole={currentUserRole}
                            showOriginal={currentUserRole === 'admin'}
                          />
                        </div>

                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">薪资</div>
                          <MaskedData
                            data={SAMPLE_USER_DATA.salary}
                            table="financial"
                            column="amount"
                            userRole={currentUserRole}
                            showOriginal={
                              currentUserRole === 'admin' ||
                              currentUserRole === 'manager'
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* 安全特性说*/}
              <Card>
                <CardHeader>
                  <CardTitle>安全保护特/CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5 text-green-600" />
                        <h3 className="font-medium text-green-800">数据加密</h3>
                      </div>
                      <p className="text-sm text-green-600">
                        敏感数据在存储和传输过程中均采用AES-256-GCM加密
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-blue-800">角色脱敏</h3>
                      </div>
                      <p className="text-sm text-blue-600">
                        根据用户角色自动应用不同的数据脱敏规                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-5 h-5 text-purple-600" />
                        <h3 className="font-medium text-purple-800">
                          密码哈希
                        </h3>
                      </div>
                      <p className="text-sm text-purple-600">
                        用户密码采用bcrypt进行安全哈希存储
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="encryption">
            <div className="space-y-6">
              {/* 加密解密演示 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    加密解密演示
                  </CardTitle>
                  <CardDescription>实时展示数据加密和解密过/CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button onClick={testEncryption}>
                      <Lock className="w-4 h-4 mr-2" />
                      测试加密解密
                    </Button>
                    <Button onClick={testHashing} variant="secondary">
                      <Key className="w-4 h-4 mr-2" />
                      测试哈希验证
                    </Button>
                  </div>

                  {encryptionDemo && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">加密解密结果</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">
                            原始手机
                          </span>
                          <div className="font-mono text-sm p-2 bg-white rounded mt-1">
                            {encryptionDemo.original}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">加密数据:</span>
                          <div className="font-mono text-sm p-2 bg-white rounded mt-1 break-all">
                            {encryptionDemo.encrypted}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              解密结果:
                            </span>
                            {encryptionDemo.success  (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="font-mono text-sm p-2 bg-white rounded mt-1">
                            {encryptionDemo.decrypted}
                            {!encryptionDemo.success && (
                              <span className="text-red-500 ml-2">
                                (解密失败)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hashDemo && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">哈希验证结果</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">
                            原始身份证号:
                          </span>
                          <div className="font-mono text-sm p-2 bg-white rounded mt-1">
                            {hashDemo.original}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            SHA-256哈希:
                          </span>
                          <div className="font-mono text-sm p-2 bg-white rounded mt-1 break-all">
                            {hashDemo.hash}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">验证结果:</span>
                          {hashDemo.success  (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {hashDemo.verified  '验证通过' : '验证失败'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 安全等级说明 */}
              <Card>
                <CardHeader>
                  <CardTitle>安全等级说明</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">高安全等/h4>
                        <p className="text-sm text-red-600">
                          适用于生产环境，采用AES-256-GCM加密，完整的密钥管理和轮换机                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded">
                      <Shield className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          中等安全等级
                        </h4>
                        <p className="text-sm text-yellow-600">
                          适用于测试环境，基本的加密和脱敏功能
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">合规认证</h4>
                        <p className="text-sm text-green-600">
                          符合GDPR、网络安全法等法规要求，通过第三方安全审                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management">
            <SecurityManagementPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 页面导出
export default function EnhancedSecurityDemoPage() {
  return (
    <SecurityProvider>
      <SecurityDemo />
    </SecurityProvider>
  );
}

