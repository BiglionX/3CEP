'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Shop {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  business_license: string;
  qualification_cert: string;
  services: string;
  logo_url: string;
  cover_image_url: string;
  status: string;
  created_at: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function PendingShopsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // 获取待审核店铺列?  const fetchPendingShops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/shops/pending?${params}`);
      const result = await response.json();

      if (result.data) {
        setShops(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取待审核店铺失?', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingShops();
  }, [pagination.page, searchTerm]);

  // 处理全?  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(shops.map(shop => shop.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 处理单个选择
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // 批量通过审核
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch('/api/admin/shops/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          ids: selectedIds,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`成功通过 ${selectedIds.length} 家店铺的审核`);
        setSelectedIds([]);
        fetchPendingShops();
      } else {
        alert(`审核失败: ${result.error}`);
      }
    } catch (error) {
      console.error('批量审核失败:', error);
      alert('审核操作失败');
    }
  };

  // 显示驳回对话?  const handleBatchReject = () => {
    if (selectedIds.length === 0) return;
    setShowRejectDialog(true);
  };

  // 确认驳回
  const confirmReject = async () => {
    try {
      const response = await fetch('/api/admin/shops/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          ids: selectedIds,
          rejectionReason,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`成功驳回 ${selectedIds.length} 家店铺`);
        setSelectedIds([]);
        setRejectionReason('');
        setShowRejectDialog(false);
        fetchPendingShops();
      } else {
        alert(`驳回失败: ${result.error}`);
      }
    } catch (error) {
      console.error('批量驳回失败:', error);
      alert('驳回操作失败');
    }
  };

  // 切换行展开状?  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // 格式化日?  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN });
  };

  // 获取状态标签样?  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: '待审?, className: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '已通过', className: 'bg-green-100 text-green-800' },
      rejected: { text: '已驳?, className: 'bg-red-100 text-red-800' },
    };

    const config = statusMap[status] || {
      text: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和搜索栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店铺审核</h1>
          <p className="text-gray-600 mt-1">审核待入驻的维修店铺申请</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="搜索店铺名称、联系人或城?.."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-64"
          />

          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handleBatchApprove} variant="default">
                批量通过 ({selectedIds.length})
              </Button>
              <Button onClick={handleBatchReject} variant="destructive">
                批量驳回 ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 店铺列表表格 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载?..</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === shops.length && shops.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>店铺信息</TableHead>
                <TableHead>联系?/TableHead>
                <TableHead>地址</TableHead>
                <TableHead>申请时间</TableHead>
                <TableHead>状?/TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map(shop => (
                <TableRow key={shop.id} className="border-b">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(shop.id)}
                      onChange={e => handleSelectOne(shop.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={shop.name}
                          className="w-10 h-10 rounded-md object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-sm">LOGO</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {shop.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shop.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shop.contact_person}</div>
                      <div className="text-sm text-gray-500">
                        {shop.city}, {shop.province}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={shop.address}>
                      {shop.address}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(shop.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(shop.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRowExpansion(shop.id)}
                    >
                      {expandedRows.includes(shop.id) ? '收起' : '详情'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* 展开的详情行 */}
              {shops.map(
                shop =>
                  expandedRows.includes(shop.id) && (
                    <TableRow key={`${shop.id}-detail`} className="bg-gray-50">
                      <TableCell colSpan={7}>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                资质信息
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    营业执照?                                  </span>
                                  <span className="font-medium">
                                    {shop.business_license || '未提?}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    资格证书?                                  </span>
                                  <span className="font-medium">
                                    {shop.qualification_cert || '未提?}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                服务项目
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {shop.services ? (
                                  JSON.parse(shop.services).map(
                                    (service: string, index: number) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {service}
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    暂无服务信息
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {(shop.logo_url || shop.cover_image_url) && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                店铺图片
                              </h4>
                              <div className="flex gap-4">
                                {shop.logo_url && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                      Logo
                                    </p>
                                    <img
                                      src={shop.logo_url}
                                      alt="店铺Logo"
                                      className="w-24 h-24 rounded-md object-cover border"
                                    />
                                  </div>
                                )}
                                {shop.cover_image_url && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                      门头?                                    </p>
                                    <img
                                      src={shop.cover_image_url}
                                      alt="门头?
                                      className="w-32 h-24 rounded-md object-cover border"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => {
                                // 单个通过审核
                                fetch('/api/admin/shops/pending', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    action: 'approve',
                                    ids: [shop.id],
                                  }),
                                })
                                  .then(res => res.json())
                                  .then(result => {
                                    if (result.success) {
                                      alert('审核通过成功');
                                      fetchPendingShops();
                                    }
                                  });
                              }}
                              size="sm"
                            >
                              通过审核
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedIds([shop.id]);
                                setShowRejectDialog(true);
                              }}
                              variant="destructive"
                              size="sm"
                            >
                              驳回申请
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        )}

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700">
              显示?{(pagination.page - 1) * pagination.pageSize + 1} 到{' '}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{' '}
              条， �?{pagination.total} 条记?            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                上一?              </Button>
              <Button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page >= pagination.totalPages}
                variant="outline"
                size="sm"
              >
                下一?              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 驳回原因对话?*/}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>驳回申请</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              驳回原因
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入驳回的具体原因..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
              variant="destructive"
            >
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

