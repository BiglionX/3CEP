'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Blockchain,
  RefreshCw,
  CheckCircle,
  XCircle,
  Link,
  Loader2,
  Play,
  Square,
  Settings,
  BarChart3,
  Database,
  Zap,
  Shield,
  Activity,
  Server,
  Cog,
} from 'lucide-react';

interface BlockchainStatus {
  isConnected: boolean;
  chainId: number;
  blockNumber: number;
  networkName: string;
  contractAddress: string;
}

interface ModuleStatus {
  afterSalesModule: boolean;
  traceabilityModule: boolean;
  productAuthModule: boolean;
}

interface ModuleStats {
  totalProducts: number;
  verifiedProducts: number;
  totalTransactions: number;
  activeMerchants: number;
}

export default function BlockchainManagementPage() {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    afterSalesModule: false,
    traceabilityModule: false,
    productAuthModule: false,
  });
  const [stats, setStats] = useState<ModuleStats>({
    totalProducts: 0,
    verifiedProducts: 0,
    totalTransactions: 0,
    activeMerchants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [startingModule, setStartingModule] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  // 模拟加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取区块链状态
      const statusRes = await fetch('/api/enterprise/blockchain/status');
      const statusData = await statusRes.json();
      if (statusData.success) {
        setStatus(statusData.status);
      }

      // 模拟模块状态（实际应该从API获取）
      setModuleStatus({
        afterSalesModule: true,
        traceabilityModule: true,
        productAuthModule: true,
      });

      // 模拟统计数据
      setStats({
        totalProducts: 12580,
        verifiedProducts: 11250,
        totalTransactions: 45892,
        activeMerchants: 36,
      });
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 如果自动同步开启，每30秒刷新状态
    const interval = autoSync ? setInterval(fetchData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSync]);

  // 启动模块
  const handleStartModule = async (moduleName: string) => {
    setStartingModule(moduleName);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      setModuleStatus(prev => ({
        ...prev,
        [moduleName]: true,
      }));
    } catch (error) {
      console.error(`Failed to start ${moduleName}:`, error);
    } finally {
      setStartingModule(null);
    }
  };

  // 停止模块
  const handleStopModule = async (moduleName: string) => {
    setStartingModule(moduleName);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      setModuleStatus(prev => ({
        ...prev,
        [moduleName]: false,
      }));
    } catch (error) {
      console.error(`Failed to stop ${moduleName}:`, error);
    } finally {
      setStartingModule(null);
    }
  };

  const getStatusIcon = (isConnected: boolean, loading: boolean) => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (!isConnected) return <XCircle className="h-5 w-5 text-red-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto">
            {/* 页面标题 */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                区块链模块管理
              </h1>
              <p className="text-gray-500 mt-1">
                一键启动/停止售后区块链模块，监控区块链状态
              </p>
            </div>

            {loading && !status ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-500">正在加载区块链状态...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 区块链状态卡片 */}
                <Card className="border-2 border-purple-100 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Blockchain className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">区块链连接状态</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {status?.isConnected ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已连接
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            未连接
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Link className="h-4 w-4" />
                          <span className="text-sm">网络名称</span>
                        </div>
                        <p className="font-semibold text-lg">{status?.networkName || '-'}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">链 ID</span>
                        </div>
                        <p className="font-semibold text-lg">{status?.chainId || '-'}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Database className="h-4 w-4" />
                          <span className="text-sm">区块高度</span>
                        </div>
                        <p className="font-semibold text-lg">
                          {status?.blockNumber?.toLocaleString() || '-'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          {getStatusIcon(status?.isConnected || false, loading)}
                          <span className="text-sm">连接状态</span>
                        </div>
                        <p className="font-semibold text-lg">
                          {status?.isConnected ? '正常' : '异常'}
                        </p>
                      </div>
                    </div>

                    {/* 合约地址 */}
                    {status?.contractAddress && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-gray-500 text-sm">合约地址</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 font-mono">
                            {status.contractAddress}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(status.contractAddress || '')}
                          >
                            复制
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 自动刷新开关 */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="auto-sync"
                          checked={autoSync}
                          onCheckedChange={setAutoSync}
                        />
                        <Label htmlFor="auto-sync" className="text-sm cursor-pointer">
                          自动刷新状态 (30秒)
                        </Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        刷新状态
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 模块管理卡片 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>售后区块链模块</CardTitle>
                        <CardDescription>
                          一键启动/停止售后区块链相关功能模块
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-purple-50">
                        {moduleStatus.afterSalesModule &&
                         moduleStatus.traceabilityModule &&
                         moduleStatus.productAuthModule
                          ? '全部运行中'
                          : '部分停止'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 售后模块 */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          moduleStatus.afterSalesModule ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Activity className={`h-6 w-6 ${
                            moduleStatus.afterSalesModule ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">售后溯源模块</h3>
                          <p className="text-sm text-gray-500">
                            售后产品区块链溯源记录上链
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={moduleStatus.afterSalesModule ? 'default' : 'secondary'}>
                          {moduleStatus.afterSalesModule ? '运行中' : '已停止'}
                        </Badge>
                        {moduleStatus.afterSalesModule ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopModule('afterSalesModule')}
                            disabled={startingModule !== null}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            停止
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStartModule('afterSalesModule')}
                            disabled={startingModule !== null}
                          >
                            {startingModule === 'afterSalesModule' ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            启动
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 追溯模块 */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          moduleStatus.traceabilityModule ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Link className={`h-6 w-6 ${
                            moduleStatus.traceabilityModule ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">产品追溯模块</h3>
                          <p className="text-sm text-gray-500">
                            产品全生命周期区块链追溯
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={moduleStatus.traceabilityModule ? 'default' : 'secondary'}>
                          {moduleStatus.traceabilityModule ? '运行中' : '已停止'}
                        </Badge>
                        {moduleStatus.traceabilityModule ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopModule('traceabilityModule')}
                            disabled={startingModule !== null}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            停止
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStartModule('traceabilityModule')}
                            disabled={startingModule !== null}
                          >
                            {startingModule === 'traceabilityModule' ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            启动
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 产品认证模块 */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          moduleStatus.productAuthModule ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Shield className={`h-6 w-6 ${
                            moduleStatus.productAuthModule ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">产品防伪模块</h3>
                          <p className="text-sm text-gray-500">
                            产品防伪码注册与验证
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={moduleStatus.productAuthModule ? 'default' : 'secondary'}>
                          {moduleStatus.productAuthModule ? '运行中' : '已停止'}
                        </Badge>
                        {moduleStatus.productAuthModule ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopModule('productAuthModule')}
                            disabled={startingModule !== null}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            停止
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStartModule('productAuthModule')}
                            disabled={startingModule !== null}
                          >
                            {startingModule === 'productAuthModule' ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            启动
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 统计数据卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">注册产品总数</p>
                          <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Database className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">已验证产品</p>
                          <p className="text-2xl font-bold">{stats.verifiedProducts.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">交易总数</p>
                          <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">活跃商户</p>
                          <p className="text-2xl font-bold">{stats.activeMerchants}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 一键操作 */}
                <Card>
                  <CardHeader>
                    <CardTitle>批量操作</CardTitle>
                    <CardDescription>
                      批量启动或停止所有售后区块链模块
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleStartModule('afterSalesModule');
                        handleStartModule('traceabilityModule');
                        handleStartModule('productAuthModule');
                      }}
                      disabled={startingModule !== null ||
                        (moduleStatus.afterSalesModule &&
                         moduleStatus.traceabilityModule &&
                         moduleStatus.productAuthModule)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      一键启动全部模块
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleStopModule('afterSalesModule');
                        handleStopModule('traceabilityModule');
                        handleStopModule('productAuthModule');
                      }}
                      disabled={startingModule !== null ||
                        (!moduleStatus.afterSalesModule &&
                         !moduleStatus.traceabilityModule &&
                         !moduleStatus.productAuthModule)}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      一键停止全部模块
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
