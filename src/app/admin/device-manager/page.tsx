'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Search,
  Smartphone,
  HardDrive,
  Battery,
  Wifi,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { useRbacPermission } from '@/hooks/use-rbac-permission';

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
  group_id?: string;
  group_name?: string;
  tags?: string[];
}

export default function DeviceManager() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>(
    'view'
  );

  // 权限检?
  const { hasPermission } = useRbacPermission();
  const canView = hasPermission('devicemgr.view');
  const canManage = hasPermission('devicemgr.manage');
  const canDelete = hasPermission('devicemgr.delete');

  // 筛选条?
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    brand: '',
    group_id: '',
    tag: '',
    search: '',
  });

  // 分组和标签相关状?
  const [groups, setGroups] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });
  const [tagForm, setTagForm] = useState({ name: '', color: '#3b82f6' });

  // 获取分组数据
  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/admin/devices/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('获取分组数据失败:', error);
    }
  };

  // 获取标签数据
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/devices/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('获取标签数据失败:', error);
    }
  };

  // 获取设备数据
  const fetchDevices = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: Device[] = [
        {
          id: 'device_001',
          device_id: 'DEV202401001',
          model: 'iPhone 14 Pro',
          brand: 'Apple',
          category: '手机',
          os_version: 'iOS 17.2',
          serial_number: 'F2LJY0L9Q0GH',
          imei: '358240052034567',
          status: 'online',
          owner_id: 'user_001',
          owner_name: '张三',
          shop_id: 'shop_001',
          shop_name: '苹果官方维修店',
          last_seen: '2024-01-20T16:30:00Z',
          battery_level: 85,
          storage_used: 45,
          storage_total: 128,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-20T16:30:00Z',
          warranty_end: '2025-01-01T10:00:00Z',
          purchase_date: '2024-01-01T10:00:00Z',
          repair_count: 0,
        },
        {
          id: 'device_002',
          device_id: 'DEV202401002',
          model: 'Galaxy S23 Ultra',
          brand: 'Samsung',
          category: '手机',
          os_version: 'Android 14',
          serial_number: 'R5CR103MCNJ',
          imei: '358240052034568',
          status: 'maintenance',
          owner_id: 'user_002',
          owner_name: '李四',
          shop_id: 'shop_002',
          shop_name: '三星服务中心',
          last_seen: '2024-01-20T14:20:00Z',
          battery_level: 72,
          storage_used: 120,
          storage_total: 256,
          created_at: '2024-01-05T09:30:00Z',
          updated_at: '2024-01-20T14:20:00Z',
          warranty_end: '2024-12-31T09:30:00Z',
          purchase_date: '2024-01-05T09:30:00Z',
          repair_count: 1,
        },
      ];

      setDevices(mockData);
      setFilteredDevices(mockData);
    } catch (error) {
      console.error('获取设备数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 应用筛?
  const applyFilters = () => {
    let filtered = [...devices];

    if (filters.category) {
      filtered = filtered.filter(
        device => device.category === filters.category
      );
    }

    if (filters.status) {
      filtered = filtered.filter(device => device.status === filters.status);
    }

    if (filters.brand) {
      filtered = filtered.filter(device => device.brand === filters.brand);
    }

    if (filters.group_id) {
      filtered = filtered.filter(
        device => device.group_id === filters.group_id
      );
    }

    if (filters.tag) {
      filtered = filtered.filter(
        device => device.tags && device.tags.includes(filters.tag)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        device =>
          device.device_id.toLowerCase().includes(searchTerm) ||
          device.model.toLowerCase().includes(searchTerm) ||
          device.serial_number.toLowerCase().includes(searchTerm) ||
          device.owner_name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredDevices(filtered);
  };

  // 处理筛选变?
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 分组操作
  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setGroupForm({ name: '', description: '', color: '#3b82f6' });
    setIsGroupDialogOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description,
      color: group.color,
    });
    setIsGroupDialogOpen(true);
  };

  const handleSaveGroup = async () => {
    try {
      const url = selectedGroup
        ? `/api/admin/devices/groups/${selectedGroup.id}`
        : '/api/admin/devices/groups';

      const method = selectedGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm),
      });

      if (response.ok) {
        alert(selectedGroup ? '分组更新成功' : '分组创建成功');
        setIsGroupDialogOpen(false);
        fetchGroups();
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('保存分组失败:', error);
      alert('保存分组失败');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('确定要删除这个分组吗？')) return;

    try {
      const response = await fetch(`/api/admin/devices/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('分组删除成功');
        fetchGroups();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除分组失败:', error);
      alert('删除分组失败');
    }
  };

  // 标签操作
  const handleCreateTag = () => {
    setSelectedTag(null);
    setTagForm({ name: '', color: '#3b82f6' });
    setIsTagDialogOpen(true);
  };

  const handleEditTag = (tag: any) => {
    setSelectedTag(tag);
    setTagForm({ name: tag.name, color: tag.color });
    setIsTagDialogOpen(true);
  };

  const handleSaveTag = async () => {
    try {
      const url = selectedTag
        ? `/api/admin/devices/tags/${selectedTag.id}`
        : '/api/admin/devices/tags';

      const method = selectedTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagForm),
      });

      if (response.ok) {
        alert(selectedTag ? '标签更新成功' : '标签创建成功');
        setIsTagDialogOpen(false);
        fetchTags();
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('保存标签失败:', error);
      alert('保存标签失败');
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;

    try {
      const response = await fetch(`/api/admin/devices/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('标签删除成功');
        fetchTags();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除标签失败');
    }
  };

  // 查看详情
  const handleView = (device: Device) => {
    setSelectedDevice(device);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  // 编辑设备
  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  // 新增设备
  const handleCreate = () => {
    setSelectedDevice(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  // 删除设备
  const handleDelete = (device: Device) => {
    if (confirm(`确定要删除设?"${device.device_id}" 吗？此操作不可撤销！`)) {
      // 模拟删除操作
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('删除设备:', device.id)fetchDevices(); // 重新加载数据
    }
  };

  // 导出数据
  const handleExport = () => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('导出设备数据')};

  // 刷新数据
  const handleRefresh = () => {
    fetchDevices();
  };

  // 状态标签渲?
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      online: {
        variant: 'default' as const,
        text: '在线',
        color: 'bg-green-100 text-green-800',
      },
      offline: {
        variant: 'secondary' as const,
        text: '离线',
        color: 'bg-gray-100 text-gray-800',
      },
      maintenance: {
        variant: 'outline' as const,
        text: '维修?,
        color: 'bg-orange-100 text-orange-800',
      },
      retired: {
        variant: 'destructive' as const,
        text: '已退役',
        color: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 分类选项
  const getCategoryOptions = () => [
    { value: '手机', label: '手机' },
    { value: '平板', label: '平板' },
    { value: '笔记本', label: '笔记本' },
    { value: '其他', label: '其他' },
  ];

  // 渲染设备标签
  const renderDeviceTags = (deviceTags: string[] | undefined) => {
    if (!deviceTags || deviceTags.length === 0) return '-';

    return (
      <div className="flex flex-wrap gap-1">
        {deviceTags.slice(0, 3).map(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag ? (
            <Badge
              key={tag.id}
              className="text-xs"
              style={{ backgroundColor: tag.color, color: 'white' }}
            >
              {tag.name}
            </Badge>
          ) : null;
        })}
        {deviceTags.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{deviceTags.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  // 渲染设备分组
  const renderDeviceGroup = (groupId: string | undefined) => {
    if (!groupId) return '-';

    const group = groups.find(g => g.id === groupId);
    return group ? (
      <div className="flex items-center">
        <div
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: group.color }}
        ></div>
        <span className="text-sm">{group.name}</span>
      </div>
    ) : (
      '-'
    );
  };

  // 状态选项
  const getStatusOptions = () => [
    { value: 'online', label: '在线' },
    { value: 'offline', label: '离线' },
    { value: 'maintenance', label: '维修中' },
    { value: 'retired', label: '已退役' },
  ];

  // 品牌选项
  const getBrandOptions = () => {
    const brands = Array.from(new Set(devices.map(device => device.brand)));
    return brands.map(brand => ({ value: brand, label: brand }));
  };

  // 计算存储使用?
  const calculateStorageUsage = (used: number | null, total: number | null) => {
    if (!used || !total) return 0;
    return Math.round((used / total) * 100);
  };

  // 表格列定?
  const columns = [
    { key: 'device_id', title: '设备ID', width: '120px' },
    { key: 'model', title: '型号', width: '150px' },
    { key: 'brand', title: '品牌', width: '100px' },
    { key: 'category', title: '分类', width: '80px' },
    { key: 'group', title: '分组', width: '120px' },
    { key: 'tags', title: '标签', width: '150px' },
    { key: 'owner', title: '所有者', width: '100px' },
    { key: 'shop', title: '所属店铺', width: '120px' },
    { key: 'status', title: '状态', width: '100px' },
    { key: 'battery', title: '电量', width: '80px' },
    { key: 'storage', title: '存储', width: '100px' },
    { key: 'last_seen', title: '最后在线', width: '160px' },
    { key: 'actions', title: '操作', width: '150px' },
  ];

  // 初始化数?
  useEffect(() => {
    fetchDevices();
    fetchGroups();
    fetchTags();
  }, []);

  // 筛选变化时重新应用筛?
  useEffect(() => {
    applyFilters();
  }, [filters, devices]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">您没有权限查看设备管?/p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按?*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设备管理</h1>
          <p className="text-gray-600 mt-1">管理用户设备信息和状态监?/p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              新增设备
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选面?*/}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">筛选条?/CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索设备ID/型号/序列?
                className="pl-10"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>

            <Select
              value={filters.category}
              onValueChange={value => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                {getCategoryOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.group_id}
              onValueChange={value => handleFilterChange('group_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分组" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分组</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: group.color }}
                      ></div>
                      {group.name} ({group.device_count})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状? />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状?/SelectItem>
                {getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.tag}
              onValueChange={value => handleFilterChange('tag', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择标签" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部标签</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      {tag.name} ({tag.device_count})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.brand}
              onValueChange={value => handleFilterChange('brand', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部品牌</SelectItem>
                {getBrandOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={applyFilters}>应用筛?/Button>
          </div>

          {/* 分组和标签管理按?*/}
          <div className="flex space-x-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleCreateGroup}>
              管理分组
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateTag}>
              管理标签
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总设备数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {devices.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              在线设备
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              维修?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {devices.filter(d => d.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              平均电量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                devices.reduce((sum, d) => sum + (d.battery_level || 0), 0) /
                  devices.length || 0
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>设备列表</CardTitle>
          <CardDescription>�?{filteredDevices.length} 台设?/CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead key={column.key} style={{ width: column.width }}>
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载?..
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map(device => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        {device.device_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{device.model}</div>
                          <div className="text-sm text-gray-500">
                            {device.os_version}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{device.brand}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{device.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {renderDeviceGroup(device.group_id)}
                      </TableCell>
                      <TableCell>{renderDeviceTags(device.tags)}</TableCell>
                      <TableCell>{device.owner_name}</TableCell>
                      <TableCell>{device.shop_name || '-'}</TableCell>
                      <TableCell>{renderStatusTag(device.status)}</TableCell>
                      <TableCell>
                        {device.battery_level !== null ? (
                          <div className="flex items-center">
                            <Battery className="w-4 h-4 text-blue-500 mr-1" />
                            <span>{device.battery_level}%</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {device.storage_total ? (
                          <div className="text-sm">
                            <div>
                              {calculateStorageUsage(
                                device.storage_used,
                                device.storage_total
                              )}
                              %
                            </div>
                            <div className="text-gray-500">
                              {device.storage_used}GB/{device.storage_total}GB
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(device.last_seen).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(device)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(device)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(device)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 详情/编辑对话?*/}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view'
                ? '设备详情'
                : dialogMode === 'edit'
                  ? '编辑设备'
                  : '新增设备'}
            </DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    设备ID
                  </label>
                  <Input
                    value={selectedDevice.device_id}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    型号
                  </label>
                  <Input
                    value={selectedDevice.model}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    品牌
                  </label>
                  <Input
                    value={selectedDevice.brand}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    分类
                  </label>
                  <Select
                    value={selectedDevice.category}
                    onValueChange={() => {}}
                    disabled={dialogMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoryOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    操作系统
                  </label>
                  <Input
                    value={selectedDevice.os_version}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    序列?
                  </label>
                  <Input
                    value={selectedDevice.serial_number}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                {selectedDevice.imei && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      IMEI
                    </label>
                    <Input
                      value={selectedDevice.imei}
                      readOnly={dialogMode === 'view'}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    状?
                  </label>
                  <Select
                    value={selectedDevice.status}
                    onValueChange={() => {}}
                    disabled={dialogMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getStatusOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    所有?
                  </label>
                  <Input
                    value={selectedDevice.owner_name}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    所属店?
                  </label>
                  <Input
                    value={selectedDevice.shop_name || ''}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    购买日期
                  </label>
                  <Input
                    type="date"
                    value={
                      selectedDevice.purchase_date
                        ? selectedDevice.purchase_date.split('T')[0]
                        : ''
                    }
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    保修截止
                  </label>
                  <Input
                    type="date"
                    value={
                      selectedDevice.warranty_end
                        ? selectedDevice.warranty_end.split('T')[0]
                        : ''
                    }
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    维修次数
                  </label>
                  <Input
                    type="number"
                    value={selectedDevice.repair_count}
                    readOnly={dialogMode === 'view'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    最后在?
                  </label>
                  <Input
                    value={new Date(selectedDevice.last_seen).toLocaleString()}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">电池信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedDevice.battery_level !== null
                        ? `${selectedDevice.battery_level}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">存储信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-medium">
                      {selectedDevice.storage_total
                        ? `${selectedDevice.storage_used}GB / ${selectedDevice.storage_total}GB`
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      使用?{' '}
                      {calculateStorageUsage(
                        selectedDevice.storage_used,
                        selectedDevice.storage_total
                      )}
                      %
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">设备状?/CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderStatusTag(selectedDevice.status)}
                  </CardContent>
                </Card>
              </div>

              {dialogMode !== 'view' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button>{dialogMode === 'edit' ? '保存' : '创建'}</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 分组管理对话?*/}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGroup ? '编辑分组' : '创建分组'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                分组名称 *
              </label>
              <Input
                value={groupForm.name}
                onChange={e =>
                  setGroupForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="请输入分组名?
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">描述</label>
              <Input
                value={groupForm.description}
                onChange={e =>
                  setGroupForm(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="请输入分组描?
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">颜色</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={groupForm.color}
                  onChange={e =>
                    setGroupForm(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 p-1"
                />
                <span className="text-sm text-gray-600">{groupForm.color}</span>
              </div>
            </div>

            {selectedGroup && (
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">
                  设备数量: {selectedGroup.device_count}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  创建时间:{' '}
                  {new Date(selectedGroup.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGroupDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveGroup}>
              {selectedGroup ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 标签管理对话?*/}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTag ? '编辑标签' : '创建标签'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                标签名称 *
              </label>
              <Input
                value={tagForm.name}
                onChange={e =>
                  setTagForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="请输入标签名?
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">颜色</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={tagForm.color}
                  onChange={e =>
                    setTagForm(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 p-1"
                />
                <span className="text-sm text-gray-600">{tagForm.color}</span>
              </div>
            </div>

            {selectedTag && (
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">
                  设备数量: {selectedTag.device_count}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  创建时间: {new Date(selectedTag.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTag}>
              {selectedTag ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

