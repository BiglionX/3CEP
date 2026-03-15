'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Settings,
  Ban,
  UserCheck,
  MoreHorizontal,
} from 'lucide-react';

interface OperationRecord {
  id: string;
  operation:
    | 'batch_ban'
    | 'batch_unban'
    | 'batch_activate'
    | 'batch_deactivate'
    | 'user_update'
    | 'user_create';
  status: 'success' | 'failed' | 'pending';
  affectedUsers: number;
  reason?: string;
  operator: string;
  timestamp: string;
  details?: string;
}

interface OperationHistoryProps {
  className?: string;
}

export function OperationHistory({ className = '' }: OperationHistoryProps) {
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // 加载操作历史
  useEffect(() => {
    loadOperationHistory();
  }, []);

  const loadOperationHistory = async () => {
    try {
      setLoading(true);
      // 从localStorage加载操作历史（实际项目中应该从API获取）
      const savedOperations = localStorage.getItem('userOperationHistory');
      if (savedOperations) {
        setOperations(JSON.parse(savedOperations));
      } else {
        // 模拟一些历史数据
        const mockOperations: OperationRecord[] = [
          {
            id: '1',
            operation: 'batch_ban',
            status: 'success',
            affectedUsers: 3,
            reason: '违反社区规定',
            operator: 'admin@example.com',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
            details: '批量封禁违规用户',
          },
          {
            id: '2',
            operation: 'user_update',
            status: 'success',
            affectedUsers: 1,
            operator: 'admin@example.com',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5小时前
            details: '更新用户角色为内容审核员',
          },
          {
            id: '3',
            operation: 'batch_unban',
            status: 'success',
            affectedUsers: 2,
            reason: '申诉通过',
            operator: 'admin@example.com',
            timestamp: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(), // 1天前
            details: '批量解封申诉用户',
          },
          {
            id: '4',
            operation: 'batch_activate',
            status: 'failed',
            affectedUsers: 5,
            reason: '系统错误',
            operator: 'admin@example.com',
            timestamp: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(), // 2天前
            details: '批量激活用户失败',
          },
        ];
        setOperations(mockOperations);
        localStorage.setItem(
          'userOperationHistory',
          JSON.stringify(mockOperations)
        );
      }
    } catch (error) {
      console.error('加载操作历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加新的操作记录
  const _addOperationRecord = (
    record: Omit<OperationRecord, 'id' | 'timestamp'>
  ) => {
    const newRecord: OperationRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    const updatedOperations = [newRecord, ...operations].slice(0, 50); // 限制最多50条记录
    setOperations(updatedOperations);
    localStorage.setItem(
      'userOperationHistory',
      JSON.stringify(updatedOperations)
    );
  };

  // 获取操作显示名称
  const getOperationDisplayName = (operation: OperationRecord['operation']) => {
    const names: Record<string, string> = {
      batch_ban: '批量封禁',
      batch_unban: '批量解封',
      batch_activate: '批量激活',
      batch_deactivate: '批量停用',
      user_update: '用户更新',
      user_create: '用户创建',
    };
    return names[operation] || operation;
  };

  // 获取操作图标
  const getOperationIcon = (operation: OperationRecord['operation']) => {
    const icons: Record<string, React.ReactNode> = {
      batch_ban: <Ban className="w-4 h-4" />,
      batch_unban: <UserCheck className="w-4 h-4" />,
      batch_activate: <UserCheck className="w-4 h-4" />,
      batch_deactivate: <Ban className="w-4 h-4" />,
      user_update: <Settings className="w-4 h-4" />,
      user_create: <User className="w-4 h-4" />,
    };
    return icons[operation] || <MoreHorizontal className="w-4 h-4" />;
  };

  // 获取状态样式
  const getStatusStyle = (status: OperationRecord['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: OperationRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  // 格式化时间显示
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return '刚刚';
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayOperations = showAll ? operations : operations.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            操作历史记录
          </div>
          {operations.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? '收起' : `查看全部 (${operations.length})`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayOperations.length === 0 ? (
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              暂无操作记录
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              还没有执行过用户管理操作
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOperations.map(operation => (
              <div
                key={operation.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {getOperationIcon(operation.operation)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getOperationDisplayName(operation.operation)}
                      </span>
                      <Badge className={getStatusStyle(operation.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">
                            {operation.status === 'success'
                              ? '成功'
                              : operation.status === 'failed'
                                ? '失败'
                                : '处理中'}
                          </span>
                        </div>
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      <span>影响 {operation.affectedUsers} 个用户</span>
                      {operation.reason && (
                        <span className="ml-2">原因: {operation.reason}</span>
                      )}
                    </div>

                    {operation.details && (
                      <div className="mt-1 text-xs text-gray-500">
                        {operation.details}
                      </div>
                    )}

                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <span>{operation.operator}</span>
                      <span className="mx-2">·</span>
                      <span>{formatTime(operation.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 操作历史记录的Hook
export function useOperationHistory() {
  const addRecord = (record: Omit<OperationRecord, 'id' | 'timestamp'>) => {
    try {
      const savedOperations = localStorage.getItem('userOperationHistory');
      const operations = savedOperations ? JSON.parse(savedOperations) : [];

      const newRecord: OperationRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      const updatedOperations = [newRecord, ...operations].slice(0, 50);
      localStorage.setItem(
        'userOperationHistory',
        JSON.stringify(updatedOperations)
      );

      return newRecord;
    } catch (error) {
      console.error('添加操作记录失败:', error);
      return null;
    }
  };

  const getRecentOperations = (limit: number = 10) => {
    try {
      const savedOperations = localStorage.getItem('userOperationHistory');
      const operations = savedOperations ? JSON.parse(savedOperations) : [];
      return operations.slice(0, limit);
    } catch (error) {
      console.error('获取操作记录失败:', error);
      return [];
    }
  };

  return {
    addRecord,
    getRecentOperations,
  };
}
