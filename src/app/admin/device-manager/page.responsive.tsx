/**
 * 设备管理响应式页面
 * 使用 AdminMobileLayout + DataTableMobile 重构
 */

'use client';

import {
  StatCardMobile,
  StatGridMobile,
} from '@/components/cards/StatCardMobile';
import { AdminMobileLayout } from '@/components/layouts/AdminMobileLayout';
import { Column, DataTableMobile } from '@/components/tables/DataTableMobile';
import { Badge } from '@/components/ui/badge';
import { useBatchOperation, useOperation } from '@/hooks/use-operation';
import {
  Battery,
  Edit,
  Eye,
  RotateCcw,
  Search,
  Smartphone,
  Trash2,
  Wifi,
  WifiOff,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Device {
  id: string;
  device_id: string;
  model: string;
  brand: string;
  category: '手机' | '平板' | '笔记本' | '其他';
  os_version: string;
  serial_number: string;
  imei: string | null;
  status: 'online' | 'offline' | 'maintenance' | 'retired';
  owner_id: string;
  owner_name: string;
  shop_id: string | null;
  shop_name: string | null;
  last_seen: string;
  battery_level: number | null;
  storage_used: number | null;
  storage_total: number | null;
  created_at: string;
  updated_at: string;
  warranty_end: string | null;
  purchase_date: string | null;
  repair_count: number;
  group_id: string;
  group_name: string;
  tags: string[];
}

export default function ResponsiveDeviceManager() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    retired: 0,
    lowBattery: 0,
  });

  // 加载数据操作
  const loadDevicesOp = useOperation({
    successMessage: undefined,
    errorMessage: '加载设备数据失败',
    showToast: false,
  });

  // 删除操作
  const deleteDeviceOp = useOperation({
    successMessage: '设备删除成功',
    errorMessage: '删除失败',
    onSuccess: () => loadDevices(),
  });

  // 批量操作
  const batchDeleteOp = useBatchOperation({
    successMessage: '批量删除完成',
    continueOnError: true,
    onSuccess: () => loadDevices(),
  });

  const loadDevices = async () => {
    await loadDevicesOp.execute(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/devices');
        const result = await response.json();
        if (result.success) {
          setDevices(result.data);
          calculateStats(result.data);
        }
      } catch (error) {
        console.error('加载设备失败:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const calculateStats = (data: Device[]) => {
    setStats({
      total: data.length,
      online: data.filter(d => d.status === 'online').length,
      offline: data.filter(d => d.status === 'offline').length,
      maintenance: data.filter(d => d.status === 'maintenance').length,
      retired: data.filter(d => d.status === 'retired').length,
      lowBattery: data.filter(
        d => d.battery_level !== null && d.battery_level < 20
      ).length,
    });
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // 状态徽章
  const getStatusBadge = (status: Device['status']) => {
    const badges = {
      online: (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Wifi className="w-3 h-3 mr-1" />
          在线
        </Badge>
      ),
      offline: (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <WifiOff className="w-3 h-3 mr-1" />
          离线
        </Badge>
      ),
      maintenance: (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Wrench className="w-3 h-3 mr-1" />
          维修中
        </Badge>
      ),
      retired: (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          已退役
        </Badge>
      ),
    };
    return badges[status];
  };

  // 电量徽章
  const getBatteryBadge = (level: number | null) => {
    if (level === null) return null;
    const color =
      level > 80
        ? 'text-green-600'
        : level > 20
          ? 'text-yellow-600'
          : 'text-red-600';
    return (
      <div className={`flex items-center ${color}`}>
        <Battery className="w-4 h-4 mr-1" />
        <span className="text-xs">{level}%</span>
      </div>
    );
  };

  // 表格列定义
  const columns: Column<Device>[] = [
    {
      key: 'device_id',
      label: '设备 ID',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'model',
      label: '型号',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'brand',
      label: '品牌',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'category',
      label: '类别',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'status',
      label: '状态',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (_, item) => getStatusBadge(item.status),
      },
    },
    {
      key: 'battery_level',
      label: '电量',
      sortable: true,
      mobile: {
        show: true,
        priority: 3,
        render: (_, item) => getBatteryBadge(item.battery_level),
      },
    },
    {
      key: 'owner_name',
      label: '所有者',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'shop_name',
      label: '店铺',
      sortable: false,
      mobile: { show: false },
    },
    {
      key: 'last_seen',
      label: '最后在线',
      sortable: true,
      mobile: { show: false },
    },
  ];

  // 行操作
  const rowActions = [
    {
      icon: Eye,
      label: '查看',
      onClick: (device: Device) =>
        router.push(`/admin/device-manager/${device.id}`),
      color: 'text-blue-600',
    },
    {
      icon: Edit,
      label: '编辑',
      onClick: (device: Device) =>
        router.push(`/admin/device-manager/${device.id}/edit`),
      color: 'text-green-600',
    },
    {
      icon: RotateCcw,
      label: '重启',
      onClick: (device: Device) => handleRestart(device),
      color: 'text-orange-600',
    },
    {
      icon: Trash2,
      label: '删除',
      onClick: (device: Device) =>
        deleteDeviceOp.execute(() => deleteDevice(device.id)),
      color: 'text-red-600',
    },
  ];

  const handleRestart = async (device: Device) => {
    if (!confirm(`确定要重启设备 ${device.device_id} 吗？`)) return;
    try {
      const response = await fetch(`/api/admin/devices/${device.id}/restart`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('重启命令已发送');
        loadDevices();
      }
    } catch (error) {
      console.error('重启失败:', error);
    }
  };

  const deleteDevice = async (id: string) => {
    const response = await fetch(`/api/admin/devices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除失败');
  };

  const handleBatchDelete = async () => {
    if (!confirm('确定要删除选中的设备吗？')) return;
    await batchDeleteOp.execute(
      devices.map(device => async () => deleteDevice(device.id))
    );
  };

  return (
    <AdminMobileLayout
      title="设备管理"
      description="管理和监控所有设备"
      onRefresh={loadDevices}
      onAdd={() => router.push('/admin/device-manager/new')}
    >
      {/* 统计卡片 */}
      <StatGridMobile>
        <StatCardMobile
          icon={Smartphone}
          iconColor="text-blue-600"
          title="总设备数"
          value={stats.total.toString()}
          trend={null}
        />
        <StatCardMobile
          icon={Wifi}
          iconColor="text-green-600"
          title="在线"
          value={stats.online.toString()}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCardMobile
          icon={WifiOff}
          iconColor="text-gray-600"
          title="离线"
          value={stats.offline.toString()}
          trend={{ value: 2.1, isPositive: false }}
        />
        <StatCardMobile
          icon={Wrench}
          iconColor="text-orange-600"
          title="维修中"
          value={stats.maintenance.toString()}
          trend={null}
        />
        <StatCardMobile
          icon={Battery}
          iconColor="text-red-600"
          title="低电量"
          value={stats.lowBattery.toString()}
          trend={{ value: 1.5, isPositive: false }}
        />
      </StatGridMobile>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索设备 ID、型号、序列号..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 数据表格 */}
      <DataTableMobile
        columns={columns}
        data={devices}
        loading={loading}
        rowActions={rowActions}
        enableBatchOperations={true}
        onBatchDelete={handleBatchDelete}
        emptyMessage="暂无设备数据"
        pageSize={10}
      />
    </AdminMobileLayout>
  );
}
