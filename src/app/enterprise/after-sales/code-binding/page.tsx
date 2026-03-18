'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  BarChart3, 
  Blockchain, 
  RefreshCw, 
  QrCode,
  Link,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  Hash,
  Package,
  Tag,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface BoundCode {
  id: string;
  serialCode: string;
  blockchainCode: string;
  productName: string;
  boundAt: string;
  status: 'bound' | 'synced' | 'failed';
  txHash?: string;
}

interface AvailableCode {
  code: string;
  status: 'available' | 'assigned';
}

interface Stats {
  totalBound: number;
  totalAvailable: number;
  syncedCount: number;
  pendingCount: number;
}

// 模拟可用区块链码数据
const mockAvailableCodes: AvailableCode[] = [
  { code: 'BC00001001', status: 'available' },
  { code: 'BC00001002', status: 'available' },
  { code: 'BC00001003', status: 'available' },
  { code: 'BC00001004', status: 'available' },
  { code: 'BC00001005', status: 'available' },
  { code: 'BC00001006', status: 'available' },
  { code: 'BC00001007', status: 'available' },
  { code: 'BC00001008', status: 'available' },
  { code: 'BC00001009', status: 'available' },
  { code: 'BC00001010', status: 'available' },
];

export default function CodeBindingPage() {
  const [boundCodes, setBoundCodes] = useState<BoundCode[]>([]);
  const [availableCodes, setAvailableCodes] = useState<AvailableCode[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBound: 0,
    totalAvailable: 0,
    syncedCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 绑定对话框
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false);
  const [serialCode, setSerialCode] = useState('');
  const [selectedBlockchainCode, setSelectedBlockchainCode] = useState('');
  const [bindingProductName, setBindingProductName] = useState('');
  const [binding, setBinding] = useState(false);

  // 批量绑定
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchSerialCodes, setBatchSerialCodes] = useState('');
  const [batchBinding, setBatchBinding] = useState(false);

  // 加载数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模拟已绑定数据
      setBoundCodes([
        {
          id: '1',
          serialCode: 'SN-2024-001',
          blockchainCode: 'BC00001001',
          productName: '智能产品A',
          boundAt: '2024-03-15 10:30:00',
          status: 'synced',
          txHash: '0x1234...abcd',
        },
        {
          id: '2',
          serialCode: 'SN-2024-002',
          blockchainCode: 'BC00001002',
          productName: '智能产品B',
          boundAt: '2024-03-16 14:20:00',
          status: 'bound',
        },
        {
          id: '3',
          serialCode: 'SN-2024-003',
          blockchainCode: 'BC00001003',
          productName: '智能产品C',
          boundAt: '2024-03-17 09:15:00',
          status: 'failed',
        },
      ]);

      setAvailableCodes(mockAvailableCodes);

      setStats({
        totalBound: 3,
        totalAvailable: mockAvailableCodes.length,
        syncedCount: 1,
        pendingCount: 2,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 绑定序列码
  const handleBind = async () => {
    if (!serialCode || !selectedBlockchainCode || !bindingProductName) return;

    setBinding(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBoundCode: BoundCode = {
        id: String(boundCodes.length + 1),
        serialCode,
        blockchainCode: selectedBlockchainCode,
        productName: bindingProductName,
        boundAt: new Date().toLocaleString('zh-CN'),
        status: 'bound',
      };

      setBoundCodes([newBoundCode, ...boundCodes]);
      setAvailableCodes(availableCodes.filter(c => c.code !== selectedBlockchainCode));
      
      setStats(prev => ({
        ...prev,
        totalBound: prev.totalBound + 1,
        totalAvailable: prev.totalAvailable - 1,
        pendingCount: prev.pendingCount + 1,
      }));

      setBindingDialogOpen(false);
      setSerialCode('');
      setSelectedBlockchainCode('');
      setBindingProductName('');
    } catch (error) {
      console.error('Failed to bind code:', error);
    } finally {
      setBinding(false);
    }
  };

  // 批量绑定
  const handleBatchBind = async () => {
    if (!batchSerialCodes) return;

    setBatchBinding(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      const serialList = batchSerialCodes.split('\n').filter(s => s.trim());
      const codesToBind = availableCodes.slice(0, serialList.length);

      const newBoundCodes: BoundCode[] = serialList.map((serial, index) => ({
        id: String(boundCodes.length + index + 1),
        serialCode: serial.trim(),
        blockchainCode: codesToBind[index]?.code || '',
        productName: bindingProductName || '批量绑定产品',
        boundAt: new Date().toLocaleString('zh-CN'),
        status: codesToBind[index] ? 'bound' : 'failed',
      }));

      setBoundCodes([...newBoundCodes, ...boundCodes]);
      setAvailableCodes(availableCodes.filter(c => !codesToBind.find(bc => bc.code === c.code)));
      
      setStats(prev => ({
        ...prev,
        totalBound: prev.totalBound + newBoundCodes.length,
        totalAvailable: prev.totalAvailable - codesToBind.length,
        pendingCount: prev.pendingCount + codesToBind.length,
      }));

      setBatchDialogOpen(false);
      setBatchSerialCodes('');
    } catch (error) {
      console.error('Failed to batch bind:', error);
    } finally {
      setBatchBinding(false);
    }
  });

  // 同步到区块链
  const handleSyncToChain = async (codeId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setBoundCodes(boundCodes.map(c => 
        c.id === codeId 
          ? { ...c, status: 'synced' as const, txHash: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6) }
          : c
      ));

      setStats(prev => ({
        ...prev,
        syncedCount: prev.syncedCount + 1,
        pendingCount: prev.pendingCount - 1,
      }));
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'bound':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">已绑定</Badge>;
      case 'synced':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />已上链</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />失败</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBoundCodes = boundCodes.filter(c => 
    c.serialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.blockchainCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  序列码绑定区块链码
                </h1>
                <p className="text-gray-500 mt-1">
                  将企业内部序列码绑定到区块链产品码
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      批量绑定
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>批量绑定序列码</DialogTitle>
                      <DialogDescription>
                        每行一个序列码，将按顺序绑定到可用的区块链码
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>产品名称</Label>
                        <Input
                          placeholder="输入产品名称"
                          value={bindingProductName}
                          onChange={(e) => setBindingProductName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>序列码列表（每行一个）</Label>
                        <textarea
                          className="w-full h-40 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                          placeholder="SN-2024-001&#10;SN-2024-002&#10;SN-2024-003"
                          value={batchSerialCodes}
                          onChange={(e) => setBatchSerialCodes(e.target.value)}
                        />
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        将从可用码中依次绑定 {batchSerialCodes.split('\n').filter(s => s.trim()).length} 个
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
                        取消
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleBatchBind}
                        disabled={batchBinding || !batchSerialCodes.trim()}
                      >
                        {batchBinding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            绑定中...
                          </>
                        ) : (
                          '确认绑定'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={bindingDialogOpen} onOpenChange={setBindingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      绑定序列码
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>绑定序列码到区块链码</DialogTitle>
                      <DialogDescription>
                        将企业内部序列码绑定到区块链产品码
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>企业序列码</Label>
                        <Input
                          placeholder="例如：SN-2024-001"
                          value={serialCode}
                          onChange={(e) => setSerialCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>产品名称</Label>
                        <Input
                          placeholder="输入产品名称"
                          value={bindingProductName}
                          onChange={(e) => setBindingProductName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>选择区块链码</Label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={selectedBlockchainCode}
                          onChange={(e) => setSelectedBlockchainCode(e.target.value)}
                        >
                          <option value="">请选择区块链码</option>
                          {availableCodes.filter(c => c.status === 'available').map((code) => (
                            <option key={code.code} value={code.code}>
                              {code.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBindingDialogOpen(false)}>
                        取消
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleBind}
                        disabled={binding || !serialCode || !selectedBlockchainCode}
                      >
                        {binding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            绑定中...
                          </>
                        ) : (
                          '确认绑定'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Link className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">已绑定总数</p>
                      <p className="text-xl font-bold">{stats.totalBound}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">已上链</p>
                      <p className="text-xl font-bold">{stats.syncedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">待同步</p>
                      <p className="text-xl font-bold">{stats.pendingCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">可用码</p>
                      <p className="text-xl font-bold">{stats.totalAvailable}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 搜索 */}
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索序列码、区块链码、产品名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 绑定列表 */}
            <Card>
              <CardHeader>
                <CardTitle>绑定记录</CardTitle>
                <CardDescription>
                  序列码与区块链码绑定列表
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBoundCodes.map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            code.status === 'synced' ? 'bg-green-100' : 
                            code.status === 'bound' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            {code.status === 'synced' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : code.status === 'bound' ? (
                              <Loader2 className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span className="font-mono font-medium">{code.serialCode}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Link className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-500">{code.blockchainCode}</span>
                              <span className="text-gray-300">|</span>
                              <Package className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-500">{code.productName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{code.boundAt}</p>
                            {code.txHash && (
                              <p className="text-xs text-purple-600 font-mono">{code.txHash}</p>
                            )}
                          </div>
                          {getStatusBadge(code.status)}
                          {code.status === 'bound' && (
                            <Button
                              size="sm"
                              onClick={() => handleSyncToChain(code.id)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              上链
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(code.blockchainCode)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredBoundCodes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无绑定记录
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
