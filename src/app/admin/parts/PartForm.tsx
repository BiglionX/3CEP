'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';

interface PartFormProps {
  part: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PartForm = ({ part, onSuccess, onCancel }: PartFormProps) => {
  // @ts-ignore
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    part_number: '',
    unit: '个',
    description: '',
    image_url: '',
    stock_quantity: 0,
    min_stock: 0,
    max_stock: 1000,
    status: 'active',
  });

  const [compatibleDevices, setCompatibleDevices] = useState<string[]>([]);
  const [relatedFaults, setRelatedFaults] = useState<string[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<any[]>([]);
  const [faultOptions, setFaultOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载设备和故障选项
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // 获取设备选项
        const deviceResponse = await fetch(
          '/api/admin/parts/optionstype=devices'
        );
        const deviceResult = await deviceResponse.json();
        if (deviceResult.success) {
          setDeviceOptions(deviceResult.data);
        }

        // 获取故障选项
        const faultResponse = await fetch(
          '/api/admin/parts/optionstype=faults'
        );
        const faultResult = await faultResponse.json();
        if (faultResult.success) {
          setFaultOptions(faultResult.data);
        }
      } catch (error) {
        console.error('加载选项失败:', error);
      }
    };

    loadOptions();
  }, []);

  // 如果是编辑模式，初始化表单数据
  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        category: part.category || '',
        brand: part.brand || '',
        model: part.model || '',
        part_number: part.part_number || '',
        unit: part.unit || '个',
        description: part.description || '',
        image_url: part.image_url || '',
        stock_quantity: part.stock_quantity || 0,
        min_stock: part.min_stock || 0,
        max_stock: part.max_stock || 1000,
        status: part.status || 'active',
      });

      // 设置关联的设备和故障
      if (part.compatible_devices) {
        setCompatibleDevices(part.compatible_devices.map((d: any) => d.id));
      }
      if (part.related_faults) {
        setRelatedFaults(part.related_faults.map((f: any) => f.id));
      }
    }
  }, [part]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('stock') ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = part ? `/api/admin/parts/${part.id}` : '/api/admin/parts';
      const method = part ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          compatible_devices: compatibleDevices,
          related_faults: relatedFaults,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDevice = (deviceId: string) => {
    setCompatibleDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const toggleFault = (faultId: string) => {
    setRelatedFaults(prev =>
      prev.includes(faultId)
        ? prev.filter(id => id !== faultId)
        : [...prev, faultId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">基本信息</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              配件名称 *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入配件名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择分类</option>
              <option value="屏幕">屏幕</option>
              <option value="电池">电池</option>
              <option value="摄像头">摄像头</option>
              <option value="外壳">外壳</option>
              <option value="线材">线材</option>
              <option value="充电器">充电器</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              品牌
            </label>
            <Input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="请输入品牌"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              型号
            </label>
            <Input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="请输入型号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              型号编码
            </label>
            <Input
              name="part_number"
              value={formData.part_number}
              onChange={handleChange}
              placeholder="请输入型号编码"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              计量单位
            </label>
            <Input
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="请输入计量单位"
            />
          </div>
        </div>

        {/* 库存信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">库存信息</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              当前库存
            </label>
            <Input
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最小库存预警
            </label>
            <Input
              name="min_stock"
              type="number"
              value={formData.min_stock}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大库存
            </label>
            <Input
              name="max_stock"
              type="number"
              value={formData.max_stock}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">正常</option>
              <option value="inactive">停用</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图片URL
            </label>
            <Input
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="请输入图片URL"
            />
          </div>
        </div>
      </div>

      {/* 适配设备选择 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">适配设备</h3>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
          {deviceOptions.map(device => (
            <label
              key={device.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={compatibleDevices.includes(device.id)}
                onChange={() => toggleDevice(device.id)}
                className="mr-2"
              />
              <span className="text-sm">
                {device.brand} {device.model}{' '}
                {device.series && `(${device.series})`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 相关故障选择 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">相关故障</h3>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
          {faultOptions.map(fault => (
            <label
              key={fault.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={relatedFaults.includes(fault.id)}
                onChange={() => toggleFault(fault.id)}
                className="mr-2"
              />
              <span className="text-sm">
                {fault.name} ({fault.category})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入配件描述"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存..' : part ? '更新' : '创建'}
        </Button>
      </div>
    </form>
  );
};

export default PartForm;
