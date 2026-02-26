'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PartDetailProps {
  partId: string;
  onClose: () => void;
}

const PartDetail = ({ partId, onClose }: PartDetailProps) => {
  const [partData, setPartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stockChange, setStockChange] = useState('');
  const [transactionType, setTransactionType] = useState('adjustment');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchPartDetail = async () => {
      try {
        const response = await fetch(`/api/admin/parts/${partId}?partId=${partId}`);
        const result = await response.json();
        
        if (result.success) {
          setPartData(result.data);
        }
      } catch (error) {
        console.error('获取配件详情失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPartDetail();
  }, [partId]);

  const handleStockUpdate = async () => {
    if (!stockChange) return;
    
    try {
      const response = await fetch(`/api/admin/parts/${partId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: partId,
          stock_change: parseInt(stockChange),
          transaction_type: transactionType,
          reason: reason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 刷新详情数据
        const refreshResponse = await fetch(`/api/admin/parts/${partId}?partId=${partId}`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setPartData(refreshResult.data);
        }
        
        // 清空表单
        setStockChange('');
        setReason('');
      }
    } catch (error) {
      console.error('更新库存失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!partData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">未找到配件信息</p>
      </div>
    );
  }

  const { part, images, inventoryHistory } = partData;

  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">配件名称</p>
            <p className="font-medium">{part.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">分类</p>
            <p className="font-medium">{part.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">品牌</p>
            <p className="font-medium">{part.brand || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">型号</p>
            <p className="font-medium">{part.model || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">型号编码</p>
            <p className="font-medium">{part.part_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">计量单位</p>
            <p className="font-medium">{part.unit || '个'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">当前库存</p>
            <p className={`font-medium ${part.stock_quantity !== null && part.min_stock !== null && part.stock_quantity <= part.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
              {part.stock_quantity !== null ? part.stock_quantity : 0}{part.unit || '个'}
              {part.min_stock && part.stock_quantity !== null && part.stock_quantity <= part.min_stock && (
                <span className="ml-1 text-xs text-red-500">(库存不足)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">状态</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              part.status === 'active' ? 'bg-green-100 text-green-800' :
              part.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {part.status === 'active' ? '正常' : 
               part.status === 'inactive' ? '停用' : '已删除'}
            </span>
          </div>
        </div>
        
        {part.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">描述</p>
            <p className="text-gray-700">{part.description}</p>
          </div>
        )}
      </div>

      {/* 适配设备 */}
      {part.compatible_devices && part.compatible_devices.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">适配设备</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {part.compatible_devices.map((device: any) => (
              <div key={device.id} className="flex items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  {device.brand} {device.model} {device.series && `(${device.series})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 相关故障 */}
      {part.related_faults && part.related_faults.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">相关故障</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {part.related_faults.map((fault: any) => (
              <div key={fault.id} className="flex items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  {fault.name} ({fault.category})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片展示 */}
      {images && images.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">配件图片</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image: any) => (
              <div key={image.id} className="relative">
                <img 
                  src={image.image_url} 
                  alt={image.alt_text || part.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {image.is_primary && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    主图
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 库存调整 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">库存调整</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              调整数量 *
            </label>
            <Input
              type="number"
              value={stockChange}
              onChange={(e) => setStockChange(e.target.value)}
              placeholder="正数为入库，负数为出库"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              调整类型
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="adjustment">库存调整</option>
              <option value="in">入库</option>
              <option value="out">出库</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              调整原因
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入调整原因"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button 
            onClick={handleStockUpdate}
            disabled={!stockChange}
          >
            更新库存
          </Button>
        </div>
      </div>

      {/* 库存变动历史 */}
      {inventoryHistory && inventoryHistory.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">库存变动历史</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动数量</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原因</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作人</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryHistory.map((record: any) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      record.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.quantity_change > 0 ? '+' : ''}{record.quantity_change}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.transaction_type === 'in' ? '入库' : 
                       record.transaction_type === 'out' ? '出库' : '调整'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.creator?.username || '系统'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartDetail;