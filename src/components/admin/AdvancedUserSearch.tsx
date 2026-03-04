'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Save,
  X,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  History,
} from 'lucide-react';

interface SearchFilter {
  id: string;
  name: string;
  filters: {
    searchTerm?: string;
    role?: string;
    status?: string;
    dateRange?: {
      start?: string;
      end?: string;
    };
    lastActive?: string;
    registrationSource?: string;
  };
}

interface AdvancedUserSearchProps {
  onSearch: (filters: any) => void;
  className?: string;
}

export function AdvancedUserSearch({
  onSearch,
  className = '',
}: AdvancedUserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [lastActive, setLastActive] = useState('');
  const [registrationSource, setRegistrationSource] = useState('');
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [filterName, setFilterName] = useState('');

  // 加载保存的筛选器
  useEffect(() => {
    const saved = localStorage.getItem('userSearchFilters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('加载保存的筛选器失败:', error);
      }
    }
  }, []);

  // 保存筛选器到localStorage
  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: {
        searchTerm: searchTerm || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
        dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
        lastActive: lastActive || undefined,
        registrationSource: registrationSource || undefined,
      },
    };

    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem('userSearchFilters', JSON.stringify(updatedFilters));
    setFilterName('');
  };

  // 应用保存的筛选器
  const applySavedFilter = (filter: SearchFilter) => {
    const { filters } = filter;
    setSearchTerm(filters.searchTerm || '');
    setSelectedRole(filters.role || '');
    setSelectedStatus(filters.status || '');
    setDateRange({
      start: filters?.start || '',
      end: filters?.end || '',
    });
    setLastActive(filters.lastActive || '');
    setRegistrationSource(filters.registrationSource || '');

    // 触发搜索
    handleSearch({
      searchTerm: filters.searchTerm,
      role: filters.role,
      status: filters.status,
      dateRange: filters.dateRange,
      lastActive: filters.lastActive,
      registrationSource: filters.registrationSource,
    });
  };

  // 删除保存的筛选器
  const deleteSavedFilter = (id: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updatedFilters);
    localStorage.setItem('userSearchFilters', JSON.stringify(updatedFilters));
  };

  // 执行搜索
  const handleSearch = (customFilters?: any) => {
    const filters = customFilters || {
      searchTerm,
      role: selectedRole,
      status: selectedStatus,
      dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
      lastActive,
      registrationSource,
    };

    onSearch(filters);
  };

  // 重置所有筛选条?  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    setDateRange({ start: '', end: '' });
    setLastActive('');
    setRegistrationSource('');
    setFilterName('');
  };

  // 检查是否有活动筛选条?  const hasActiveFilters = () => {
    return (
      searchTerm ||
      selectedRole ||
      selectedStatus ||
      dateRange.start ||
      dateRange.end ||
      lastActive ||
      registrationSource
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            高级搜索和筛?          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavedFilters(!showSavedFilters)}
            >
              <History className="w-4 h-4 mr-1" />
              保存的筛选器 ({savedFilters.length})
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 基础搜索 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-term">搜索关键?/Label>
              <Input
                id="search-term"
                placeholder="邮箱、用户名、用户ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role-select">用户角色</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有角?/SelectItem>
                  <SelectItem value="admin">超级管理?/SelectItem>
                  <SelectItem value="content_reviewer">内容审核?/SelectItem>
                  <SelectItem value="shop_reviewer">店铺审核?/SelectItem>
                  <SelectItem value="finance">财务人员</SelectItem>
                  <SelectItem value="viewer">查看?/SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 状态和来源 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status-select">用户状?/Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择状? />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有状?/SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="banned">已封?/SelectItem>
                  <SelectItem value="suspended">已暂?/SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source-select">注册来源</Label>
              <Select
                value={registrationSource}
                onValueChange={setRegistrationSource}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有来?/SelectItem>
                  <SelectItem value="email">邮箱注册</SelectItem>
                  <SelectItem value="google">Google登录</SelectItem>
                  <SelectItem value="github">GitHub登录</SelectItem>
                  <SelectItem value="wechat">微信登录</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 时间范围筛?*/}
          <div>
            <Label>注册时间范围</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    placeholder="开始日?
                    value={dateRange.start}
                    onChange={e =>
                      setDateRange(prev => ({ ...prev, start: e.target.value }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    placeholder="结束日期"
                    value={dateRange.end}
                    onChange={e =>
                      setDateRange(prev => ({ ...prev, end: e.target.value }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 最后活跃时?*/}
          <div>
            <Label htmlFor="last-active">最后活跃时?/Label>
            <Select value={lastActive} onValueChange={setLastActive}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="选择活跃时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">任何时?/SelectItem>
                <SelectItem value="24h">过去24小时</SelectItem>
                <SelectItem value="7d">过去7�?/SelectItem>
                <SelectItem value="30d">过去30�?/SelectItem>
                <SelectItem value="90d">过去90�?/SelectItem>
                <SelectItem value="inactive_30d">30天未活跃</SelectItem>
                <SelectItem value="inactive_90d">90天未活跃</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
            <Button onClick={() => handleSearch()}>
              <Search className="w-4 h-4 mr-2" />
              搜索用户
            </Button>

            <Button variant="outline" onClick={resetFilters}>
              <X className="w-4 h-4 mr-2" />
              重置筛?            </Button>

            {hasActiveFilters() && (
              <div className="flex-1 flex items-center justify-end">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="筛选器名称"
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                    className="w-40 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={saveCurrentFilter}
                    disabled={!filterName.trim()}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    保存筛?                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 保存的筛选器面板 */}
          {showSavedFilters && savedFilters.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                保存的筛选器
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{filter.name}</span>
                      <div className="flex flex-wrap gap-1">
                        {filter.filters.searchTerm && (
                          <Badge variant="secondary" className="text-xs">
                            搜索: {filter.filters.searchTerm}
                          </Badge>
                        )}
                        {filter.filters.role && (
                          <Badge variant="secondary" className="text-xs">
                            角色: {filter.filters.role}
                          </Badge>
                        )}
                        {filter.filters.status && (
                          <Badge variant="secondary" className="text-xs">
                            状? {filter.filters.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySavedFilter(filter)}
                      >
                        应用
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSavedFilter(filter.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 当前筛选状态显?*/}
          {hasActiveFilters() && (
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  当前筛选条?                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs"
                >
                  清除所?                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchTerm && (
                  <Badge variant="default">
                    <Search className="w-3 h-3 mr-1" />
                    {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedRole && (
                  <Badge variant="default">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {selectedRole}
                    <button
                      onClick={() => setSelectedRole('')}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedStatus && (
                  <Badge variant="default">
                    <UserX className="w-3 h-3 mr-1" />
                    {selectedStatus}
                    <button
                      onClick={() => setSelectedStatus('')}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(dateRange.start || dateRange.end) && (
                  <Badge variant="default">
                    <Calendar className="w-3 h-3 mr-1" />
                    {dateRange.start} ~ {dateRange.end}
                    <button
                      onClick={() => setDateRange({ start: '', end: '' })}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {lastActive && (
                  <Badge variant="default">
                    <Clock className="w-3 h-3 mr-1" />
                    活跃: {lastActive}
                    <button
                      onClick={() => setLastActive('')}
                      className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
