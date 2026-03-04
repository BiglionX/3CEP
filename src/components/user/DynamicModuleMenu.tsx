'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  moduleRegistry,
  ModuleConfig,
  getModulesByPermissions,
} from '@/lib/module-registry';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

interface DynamicModuleMenuProps {
  /** 显示模式：完整菜?| 紧凑模式 | 图标模式 */
  mode?: 'full' | 'compact' | 'icons';

  /** 是否显示搜索?*/
  showSearch?: boolean;

  /** 是否显示筛选器 */
  showFilters?: boolean;

  /** 默认展开的分?*/
  defaultExpandedCategories?: string[];

  /** 自定义样式类?*/
  className?: string;

  /** 点击模块回调 */
  onModuleClick?: (module: ModuleConfig) => void;

  /** 是否只显示收藏模?*/
  favoritesOnly?: boolean;
}

export default function DynamicModuleMenu({
  mode = 'full',
  showSearch = true,
  showFilters = true,
  defaultExpandedCategories = [],
  className = '',
  onModuleClick,
  favoritesOnly = false,
}: DynamicModuleMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(defaultExpandedCategories)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'recent'>(
    'priority'
  );
  const pathname = usePathname();
  const { is_admin, roles } = useUnifiedAuth();

  // 获取用户权限列表
  const userPermissions = useMemo(() => {
    const permissions = ['dashboard.view']; // 基础权限
    if (is_admin) {
      permissions.push('admin.access');
    }
    return permissions;
  }, [is_admin]);

  // 获取可访问的模块
  const accessibleModules = useMemo(() => {
    return getModulesByPermissions(userPermissions);
  }, [userPermissions]);

  // 筛选和排序模块
  const filteredAndSortedModules = useMemo(() => {
    let modules = [...accessibleModules];

    // 应用搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      modules = modules.filter(
        module =>
          module.name.toLowerCase().includes(term) ||
          module?.toLowerCase().includes(term)
      );
    }

    // 应用分类过滤
    if (selectedCategory !== 'all') {
      modules = modules.filter(module => module.category === selectedCategory);
    }

    // 应用收藏过滤
    if (favoritesOnly) {
      // 这里应该从用户偏好中获取收藏模块
      const favoriteIds = ['repair_service', 'parts_market']; // 示例数据
      modules = modules.filter(module => favoriteIds.includes(module.id));
    }

    // 排序
    modules.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          // 按最近使用时间排序（需要用户行为数据）
          return b.priority - a.priority;
        case 'priority':
        default:
          return a.priority - b.priority;
      }
    });

    return modules;
  }, [accessibleModules, searchTerm, selectedCategory, sortBy, favoritesOnly]);

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    // 这里应该导入所有可能的图标组件
    // 为简化，返回一个通用的图标函?    return ({ className }: { className?: string }) => (
      <div className={`w-5 h-5 ${className || ''}`} />
    );
  };

  // 获取分类显示名称
  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      personal: '个人设置',
      business: '业务功能',
      management: '管理系统',
      system: '系统工具',
    };
    return names[category] || category;
  };

  // 判断模块是否激?  const isActiveModule = (path: string) => {
    return pathname === path;
  };

  // 切换分类展开状?  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 处理模块点击
  const handleModuleClick = (module: ModuleConfig) => {
    if (onModuleClick) {
      onModuleClick(module);
    }
  };

  // 渲染模块?  const renderModuleItem = (module: ModuleConfig) => {
    const Icon = getIconComponent(module.icon);
    const isActive = isActiveModule(module.path);

    const baseClasses =
      'flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 group';
    const activeClasses = isActive
      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

    return (
      <Link
        key={module.id}
        href={module.path}
        onClick={() => handleModuleClick(module)}
        className={`${baseClasses} ${activeClasses}`}
      >
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{module.name}</span>
            {module.badge && (
              <Badge variant="default" className="ml-2 text-xs">
                {module.badge}
              </Badge>
            )}
          </div>
          {mode === 'full' && module.description && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {module.description}
            </p>
          )}
        </div>
        {isActive && <div className="w-1 h-8 bg-blue-700 rounded-full ml-2" />}
      </Link>
    );
  };

  // 渲染分类?  const renderCategoryGroup = (
    categoryKey: string,
    categoryData: {
      name: string;
      modules: ModuleConfig[];
    }
  ) => {
    const isExpanded = expandedCategories.has(categoryKey);
    const hasModules = categoryData.modules.length > 0;

    if (!hasModules) return null;

    return (
      <div key={categoryKey} className="mb-2">
        {mode !== 'icons' && (
          <button
            onClick={() => toggleCategory(categoryKey)}
            className="flex items-center w-full p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
          >
            <span className="flex-1 text-left">{categoryData.name}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {(isExpanded || mode === 'icons') && (
          <div
            className={`space-y-1 ${mode === 'icons' ? 'grid grid-cols-3 gap-2' : ''}`}
          >
            {categoryData.modules.map(renderModuleItem)}
          </div>
        )}
      </div>
    );
  };

  // 按分类组织模?  const modulesByCategory = useMemo(() => {
    const categories: Record<
      string,
      {
        name: string;
        modules: ModuleConfig[];
      }
    > = {};

    filteredAndSortedModules.forEach(module => {
      const categoryName = getCategoryDisplayName(module.category);
      if (!categories[module.category]) {
        categories[module.category] = {
          name: categoryName,
          modules: [],
        };
      }
      categories[module.category].modules.push(module);
    });

    return categories;
  }, [filteredAndSortedModules]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索和筛选区?*/}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索功能模块..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[120px] text-sm">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value="personal">个人设置</SelectItem>
                  <SelectItem value="business">业务功能</SelectItem>
                  <SelectItem value="management">管理系统</SelectItem>
                  <SelectItem value="system">系统工具</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-[100px] text-sm">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">优先?/SelectItem>
                  <SelectItem value="name">名称</SelectItem>
                  <SelectItem value="recent">最近使?/SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={favoritesOnly ? 'default' : 'outline'}
                size="sm"
                className="text-sm"
                onClick={() => {
                  /* 切换收藏状?*/
                }}
              >
                <Star className="w-4 h-4 mr-1" />
                收藏
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 模块列表 */}
      <div className={`${mode === 'compact' ? 'space-y-2' : 'space-y-4'}`}>
        {Object.entries(modulesByCategory).length > 0 ? (
          Object.entries(modulesByCategory).map(([categoryKey, categoryData]) =>
            renderCategoryGroup(categoryKey, categoryData)
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">没有找到匹配的模?/p>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{filteredAndSortedModules.length} 个模?/span>
          <Button variant="ghost" size="sm" className="text-xs">
            管理模块
          </Button>
        </div>
      </div>
    </div>
  );
}
