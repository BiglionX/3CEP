/**
 * 安全配置管理面板
 * 提供加密设置、脱敏规则配置和安全监控功能
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useSecurity,
  EncryptionAlgorithm,
  HashAlgorithm,
  MaskingRule,
} from './SecurityService';

interface SecurityManagementPanelProps {
  className?: string;
}

export function SecurityManagementPanel({
  className = '',
}: SecurityManagementPanelProps) {
  const {
    encryptData,
    decryptData,
    hashData,
    verifyHash,
    generateKey,
    isSecure,
    securityLevel,
  } = useSecurity();

  const [testData, setTestData] = useState('Hello World!');
  const [encryptionResult, setEncryptionResult] = useState<{
    success: boolean;
    data?: any;
    original?: string;
    decrypted?: string;
    match?: boolean;
    error?: string;
    decryptError?: string;
  } | null>(null);
  const [hashResult, setHashResult] = useState<{
    success: boolean;
    hash?: string;
    original?: string;
    algorithm?: string;
    verified?: boolean;
    error?: string;
    verifyError?: string;
  } | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<EncryptionAlgorithm>('AES-256-GCM');
  const [selectedHashAlgorithm, setSelectedHashAlgorithm] =
    useState<HashAlgorithm>('SHA-256');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState<Omit<MaskingRule, 'field'>>({
    pattern: /.*/,
    mask: '***',
    appliesToRoles: ['viewer'],
    description: '',
  });
  const [rules, setRules] = useState<Record<string, MaskingRule>>({});
  const [keyRotationStatus, setKeyRotationStatus] = useState<
    'idle' | 'rotating' | 'success' | 'error'
  >('idle');

  // 测试加密功能
  const testEncryption = async () => {
    try {
      const result = await encryptData(testData, selectedAlgorithm);
      setEncryptionResult({
        success: true,
        data: result,
        original: testData,
      });
    } catch (error) {
      setEncryptionResult({
        success: false,
        error: (error as Error).message,
      });
    }
  };

  // 测试解密功能
  const testDecryption = async () => {
    if (!encryptionResult?.data) return;

    try {
      const decrypted = await decryptData(encryptionResult.data);
      setEncryptionResult(prev =>
        prev
          ? {
              ...prev,
              decrypted,
              match: decrypted === testData,
            }
          : null
      );
    } catch (error) {
      setEncryptionResult(prev =>
        prev
          ? {
              ...prev,
              decryptError: (error as Error).message,
            }
          : null
      );
    }
  };

  // 测试哈希功能
  const testHashing = async () => {
    try {
      const hash = await hashData(testData, selectedHashAlgorithm);
      setHashResult({
        success: true,
        hash,
        original: testData,
        algorithm: selectedHashAlgorithm,
      });
    } catch (error) {
      setHashResult({
        success: false,
        error: (error as Error).message,
      });
    }
  };

  // 测试哈希验证
  const testHashVerification = async () => {
    if (!hashResult?.hash) return;

    try {
      const isValid = await verifyHash(
        testData,
        hashResult.hash,
        selectedHashAlgorithm
      );
      setHashResult(prev =>
        prev
          ? {
              ...prev,
              verified: isValid,
            }
          : null
      );
    } catch (error) {
      setHashResult(prev =>
        prev
          ? {
              ...prev,
              verifyError: (error as Error).message,
            }
          : null
      );
    }
  };

  // 生成新密钥
  const handleGenerateKey = async () => {
    try {
      const key = await generateKey(selectedAlgorithm);
      alert(`新密钥已生成: ${key.substring(0, 16)}...`);
    } catch (error) {
      alert(`密钥生成失败: ${(error as Error).message}`);
    }
  };

  // 执行密钥轮换
  const handleKeyRotation = async () => {
    setKeyRotationStatus('rotating');
    try {
      // 这里应该调用实际的密钥轮换服务
      await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟轮换过程
      setKeyRotationStatus('success');
      setTimeout(() => setKeyRotationStatus('idle'), 3000);
    } catch (error) {
      setKeyRotationStatus('error');
      setTimeout(() => setKeyRotationStatus('idle'), 3000);
    }
  };

  // 添加脱敏规则
  const handleAddRule = () => {
    setDialogOpen(true);
  };

  // 保存脱敏规则
  const handleSaveRule = () => {
    // 这里应该保存到后端或本地存储
    // TODO: 移除调试日志
    setDialogOpen(false);
    setNewRule({
      pattern: /.*/,
      mask: '***',
      appliesToRoles: ['viewer'],
      description: '',
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            安全管理中心
          </h2>
          <p className="text-gray-600 mt-1">管理数据加密、脱敏规则和安全配置</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleKeyRotation}
            disabled={keyRotationStatus === 'rotating'}
            variant={keyRotationStatus === 'success' ? 'default' : 'outline'}
          >
            {keyRotationStatus === 'rotating' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                轮换中...
              </>
            ) : keyRotationStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                轮换成功
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                密钥轮换
              </>
            )}
          </Button>

          <Button onClick={handleAddRule}>
            <Plus className="w-4 h-4 mr-2" />
            添加规则
          </Button>
        </div>
      </div>

      {/* 安全状态卡 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">安全状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isSecure ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span
                className={`font-medium ${isSecure ? 'text-green-600' : 'text-red-600'}`}
              >
                {isSecure ? '安全' : '不安全'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">安全等级</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                securityLevel === 'maximum'
                  ? 'destructive'
                  : securityLevel === 'high'
                    ? 'default'
                    : securityLevel === 'medium'
                      ? 'secondary'
                      : 'outline'
              }
            >
              {securityLevel.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">加密算法</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              AES-256-GCM
              <br />
              <span className="text-xs">RSA-OAEP备用</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 加密测试区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            加密解密测试
          </CardTitle>
          <CardDescription>测试数据加密和解密功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">测试数据</label>
              <Input
                value={testData}
                onChange={e => setTestData(e.target.value)}
                placeholder="输入要加密的文本"
              />
            </div>

            <div>
              <label className="text-sm font-medium">加密算法</label>
              <Select
                value={selectedAlgorithm}
                onValueChange={value =>
                  setSelectedAlgorithm(value as EncryptionAlgorithm)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AES-256-GCM">AES-256-GCM</SelectItem>
                  <SelectItem value="RSA-OAEP">RSA-OAEP</SelectItem>
                  <SelectItem value="ChaCha20-Poly1305">
                    ChaCha20-Poly1305
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testEncryption}>
              <Lock className="w-4 h-4 mr-2" />
              加密数据
            </Button>
            <Button
              onClick={testDecryption}
              variant="outline"
              disabled={!encryptionResult?.data}
            >
              <Unlock className="w-4 h-4 mr-2" />
              解密数据
            </Button>
            <Button onClick={handleGenerateKey} variant="secondary">
              <Key className="w-4 h-4 mr-2" />
              生成密钥
            </Button>
          </div>

          {encryptionResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              {encryptionResult.success ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">原始数据:</span>
                    <div className="font-mono text-sm p-2 bg-white rounded">
                      {encryptionResult.original}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">加密结果:</span>
                    <div className="font-mono text-sm p-2 bg-white rounded break-all">
                      {encryptionResult.data.encrypted}
                    </div>
                  </div>
                  {encryptionResult.decrypted && (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">解密结果:</span>
                        {encryptionResult.match ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="font-mono text-sm p-2 bg-white rounded">
                        {encryptionResult.decrypted}
                        {!encryptionResult.match && (
                          <span className="text-red-500 ml-2">(不匹配</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>加密失败: {encryptionResult.error}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 哈希测试区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            哈希测试
          </CardTitle>
          <CardDescription>测试数据哈希和验证功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">测试数据</label>
              <Input
                value={testData}
                onChange={e => setTestData(e.target.value)}
                placeholder="输入要哈希的文本"
              />
            </div>

            <div>
              <label className="text-sm font-medium">哈希算法</label>
              <Select
                value={selectedHashAlgorithm}
                onValueChange={value =>
                  setSelectedHashAlgorithm(value as HashAlgorithm)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA-256">SHA-256</SelectItem>
                  <SelectItem value="SHA-512">SHA-512</SelectItem>
                  <SelectItem value="bcrypt">bcrypt</SelectItem>
                  <SelectItem value="argon2">Argon2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testHashing}>
              <Key className="w-4 h-4 mr-2" />
              生成哈希
            </Button>
            <Button
              onClick={testHashVerification}
              variant="outline"
              disabled={!hashResult?.hash}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              验证哈希
            </Button>
          </div>

          {hashResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              {hashResult.success ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">原始数据:</span>
                    <div className="font-mono text-sm p-2 bg-white rounded">
                      {hashResult.original}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      哈希结果 ({hashResult.algorithm}):
                    </span>
                    <div className="font-mono text-sm p-2 bg-white rounded break-all">
                      {hashResult.hash}
                    </div>
                  </div>
                  {hashResult.verified !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">验证结果:</span>
                      {hashResult.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {hashResult.verified ? '验证通过' : '验证失败'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>哈希失败: {hashResult.error}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 脱敏规则管理 */}
      <Card>
        <CardHeader>
          <CardTitle>脱敏规则管理</CardTitle>
          <CardDescription>配置和管理数据脱敏规则</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>字段</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>适用角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(rules).map(([key, rule]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{rule.description || '无描述'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rule.appliesToRoles.map(role => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">启用</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 添加规则对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加脱敏规则</DialogTitle>
            <DialogDescription>配置新的数据脱敏规则</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">字段</label>
              <Input placeholder="例如: users.phone" />
            </div>

            <div>
              <label className="text-sm font-medium">正则表达</label>
              <Input
                value={newRule.pattern.toString()}
                onChange={e =>
                  setNewRule({
                    ...newRule,
                    pattern: new RegExp(e.target.value),
                  })
                }
                placeholder="匹配需要脱敏的数据"
              />
            </div>

            <div>
              <label className="text-sm font-medium">脱敏模式</label>
              <Input
                value={newRule.mask.toString()}
                onChange={e => setNewRule({ ...newRule, mask: e.target.value })}
                placeholder="脱敏后的显示格式"
              />
            </div>

            <div>
              <label className="text-sm font-medium">适用角色</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择适用角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">查看</SelectItem>
                  <SelectItem value="external_partner">外部合作伙伴</SelectItem>
                  <SelectItem value="shop_manager">店铺管理</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">规则描述</label>
              <Textarea
                value={newRule.description}
                onChange={e =>
                  setNewRule({ ...newRule, description: e.target.value })
                }
                placeholder="规则的用途说明"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRule}>
              <Save className="w-4 h-4 mr-2" />
              保存规则
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
