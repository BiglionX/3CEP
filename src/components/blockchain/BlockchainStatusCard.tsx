'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Blockchain, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Link,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface BlockchainStatus {
  isConnected: boolean;
  chainId: number;
  blockNumber: number;
  networkName: string;
  contractAddress: string;
}

interface BlockchainStatusCardProps {
  onSyncBatch?: (batchId: string) => void;
  onVerifyProduct?: () => void;
}

/**
 * 区块链状态显示组件
 */
export function BlockchainStatusCard({ 
  onSyncBatch, 
  onVerifyProduct 
}: BlockchainStatusCardProps) {
  const [status, setStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取区块链状态
  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/enterprise/blockchain/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      } else {
        setError(data.error || 'Failed to connect to blockchain');
        setStatus({
          isConnected: false,
          chainId: 0,
          blockNumber: 0,
          networkName: 'Unknown',
          contractAddress: '',
        });
      }
    } catch (err) {
      setError('Network error');
      setStatus({
        isConnected: false,
        chainId: 0,
        blockNumber: 0,
        networkName: 'Unknown',
        contractAddress: '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // 每30秒刷新一次状态
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (!status?.isConnected) return <XCircle className="h-5 w-5 text-red-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusBadge = () => {
    if (loading) return <Badge variant="outline" className="bg-blue-50">检查中</Badge>;
    if (!status?.isConnected) return <Badge variant="destructive">未连接</Badge>;
    return <Badge className="bg-green-100 text-green-700">已连接</Badge>;
  };

  return (
    <Card className="border-2 border-purple-100 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blockchain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">区块链状态</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-500">正在连接区块链...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <>
            {/* 网络信息 */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">网络名称</span>
                <p className="font-medium">{status?.networkName || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">链 ID</span>
                <p className="font-medium">{status?.chainId || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">区块高度</span>
                <p className="font-medium">{status?.blockNumber?.toLocaleString() || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">连接状态</span>
                <div className="flex items-center gap-1 mt-1">
                  {getStatusIcon()}
                </div>
              </div>
            </div>

            {/* 合约地址 */}
            {status?.contractAddress && (
              <div className="pt-2 border-t">
                <span className="text-gray-500 text-sm">合约地址</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate flex-1">
                    {status.contractAddress}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => navigator.clipboard.writeText(status.contractAddress)}
                  >
                    <Link className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchStatus}
                disabled={loading}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              {onVerifyProduct && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onVerifyProduct}
                  className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  验证产品
                </Button>
              )}
            </div>

            {onSyncBatch && (
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="sm"
                onClick={() => onSyncBatch('current')}
                disabled={!status?.isConnected || syncing}
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    同步中...
                  </>
                ) : (
                  <>
                    <Blockchain className="h-4 w-4 mr-2" />
                    同步到区块链
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 区块链同步状态徽章
 */
export function BlockchainSyncBadge({ 
  synced, 
  txHash 
}: { 
  synced?: boolean; 
  txHash?: string 
}) {
  if (!synced) {
    return <Badge variant="outline" className="bg-gray-50">未上链</Badge>;
  }

  return (
    <Badge className="bg-purple-100 text-purple-700">
      <CheckCircle className="h-3 w-3 mr-1" />
      已上链
    </Badge>
  );
}

/**
 * 产品区块链验证结果
 */
export function BlockchainVerificationResult({ 
  result 
}: { 
  result: {
    isValid: boolean;
    database?: { found: boolean };
    blockchain?: { isValid: boolean };
    message: string;
  }
}) {
  const getIcon = () => {
    if (result.isValid) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
    return <XCircle className="h-8 w-8 text-red-500" />;
  };

  return (
    <Card className={result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1">
            <h3 className={`font-semibold ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
              {result.isValid ? '产品验证通过' : '产品验证失败'}
            </h3>
            <p className="text-sm mt-1">{result.message}</p>
            
            {/* 验证详情 */}
            <div className="mt-3 flex gap-4 text-xs">
              {result.database && (
                <span className={result.database.found ? 'text-green-600' : 'text-gray-500'}>
                  数据库: {result.database.found ? '✓ 存在' : '✗ 不存在'}
                </span>
              )}
              {result.blockchain && (
                <span className={result.blockchain.isValid ? 'text-green-600' : 'text-gray-500'}>
                  区块链: {result.blockchain.isValid ? '✓ 有效' : '✗ 无效'}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
