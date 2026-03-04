/**
 * 移动端响应式优化演示页面
 * 展示精细化断点设置和移动端专属组? */

'use client';

import { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Grid,
  List,
  Search,
  Bell,
  User,
  Home,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  MobileBottomNav,
  MobileDrawer,
  ResponsiveGrid,
  MobileCard,
  MobileListItem,
  MobileHeader,
  MobileSearchBar,
  useScreenInfo,
  ResponsiveHide,
  DeviceType,
} from '@/components/mobile-responsive';

// 设备类型图标映射
const deviceIcons = {
  'mobile-s': Smartphone,
  'mobile-m': Smartphone,
  'mobile-l': Smartphone,
  tablet: Tablet,
  laptop: Monitor,
  desktop: Monitor,
  wide: Monitor,
};

// 设备类型标签
const deviceLabels = {
  'mobile-s': '小型手机 (�?20px)',
  'mobile-m': '标准手机 (�?75px)',
  'mobile-l': '大屏手机 (�?25px)',
  tablet: '平板 (�?68px)',
  laptop: '笔记?(�?024px)',
  desktop: '桌面 (�?200px)',
  wide: '宽屏 (>1200px)',
};

// 演示数据
const demoItems = [
  { id: 1, title: '首页', icon: Home },
  { id: 2, title: '搜索', icon: Search },
  { id: 3, title: '通知', icon: Bell },
  { id: 4, title: '我的', icon: User },
];

const menuItems = [
  { id: 1, title: '个人资料', subtitle: '查看和编辑个人信?, icon: User },
  { id: 2, title: '设置', subtitle: '应用设置和偏?, icon: Settings },
  { id: 3, title: '帮助中心', subtitle: '获取使用帮助', icon: Search },
  { id: 4, title: '关于我们', subtitle: '了解应用信息', icon: Home },
];

// 屏幕信息展示组件
function ScreenInfoDisplay() {
  const screenInfo = useScreenInfo();
  const DeviceIcon = deviceIcons[screenInfo.deviceType];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DeviceIcon className="w-5 h-5" />
          当前设备信息
        </CardTitle>
        <CardDescription>实时检测屏幕尺寸和设备类型</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">屏幕宽度</div>
            <div className="text-xl font-bold text-blue-600">
              {screenInfo.width}px
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">屏幕高度</div>
            <div className="text-xl font-bold text-green-600">
              {screenInfo.height}px
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">设备类型</div>
          <div className="text-lg font-semibold text-purple-600 flex items-center gap-2">
            <DeviceIcon className="w-4 h-4" />
            {deviceLabels[screenInfo.deviceType]}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            className={`p-2 rounded ${screenInfo.isMobile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
          >
            <div className="text-xs">移动?/div>
            <div className="font-medium">
              {screenInfo.isMobile ? '�? : '�?}
            </div>
          </div>
          <div
            className={`p-2 rounded ${screenInfo.isTablet ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
          >
            <div className="text-xs">平板?/div>
            <div className="font-medium">
              {screenInfo.isTablet ? '�? : '�?}
            </div>
          </div>
          <div
            className={`p-2 rounded ${screenInfo.isDesktop ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'}`}
          >
            <div className="text-xs">桌面?/div>
            <div className="font-medium">
              {screenInfo.isDesktop ? '�? : '�?}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 响应式网格演?function ResponsiveGridDemo() {
  const [columns, setColumns] = useState({ mobile: 1, tablet: 2, desktop: 3 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="w-5 h-5" />
          响应式网格布局
        </CardTitle>
        <CardDescription>不同屏幕尺寸下的网格列数自适应</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={columns.mobile === 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setColumns({ ...columns, mobile: 1 })}
            >
              手机: 1�?            </Button>
            <Button
              variant={columns.mobile === 2 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setColumns({ ...columns, mobile: 2 })}
            >
              手机: 2�?            </Button>
          </div>
        </div>

        <ResponsiveGrid columns={columns} gap="md">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <MobileCard key={item} elevated>
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">{item}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">项目 {item}</h3>
                <p className="text-gray-500 text-sm">响应式网格项目描?/p>
              </div>
            </MobileCard>
          ))}
        </ResponsiveGrid>
      </CardContent>
    </Card>
  );
}

// 移动端组件演?function MobileComponentsDemo() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchValue, setSearchValue] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          移动端专属组?        </CardTitle>
        <CardDescription>专为触控操作优化的移动端UI组件</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 移动端头?*/}
        <div className="border rounded-lg overflow-hidden">
          <MobileHeader
            title="移动端头部示?
            onBack={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('返回')}
            actions={
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-5 h-5" />
              </Button>
            }
          />
        </div>

        {/* 移动端搜索栏 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">移动端搜索栏</h4>
          <MobileSearchBar
            value={searchValue}
            onChange={setSearchValue}
            placeholder="请输入搜索关键词..."
            onSearch={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('搜索:', searchValue)}
          />
        </div>

        {/* 移动端列表项 */}
        <div className="border rounded-lg overflow-hidden">
          <h4 className="font-medium p-4 pb-2">移动端列表项</h4>
          <div className="divide-y">
            {menuItems.map(item => (
              <MobileListItem
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={<item.icon className="w-5 h-5 text-blue-600" />}
                trailing={<X className="w-4 h-4 text-gray-400" />}
                onPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('点击:', item.title)}
              />
            ))}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDrawerOpen(true)}>
            <Menu className="w-4 h-4 mr-2" />
            打开抽屉
          </Button>
        </div>

        {/* 移动端抽?*/}
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="侧边菜单"
        >
          <div className="space-y-2">
            {menuItems.map(item => (
              <MobileListItem
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={<item.icon className="w-5 h-5 text-blue-600" />}
              />
            ))}
          </div>
        </MobileDrawer>
      </CardContent>
    </Card>
  );
}

// 响应式隐藏演?function ResponsiveHideDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>响应式显示控?/CardTitle>
        <CardDescription>根据设备类型控制元素的显?隐藏</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">设备特定显示</h4>
          <div className="space-y-2">
            <ResponsiveHide hideOn={['mobile-s', 'mobile-m', 'mobile-l']}>
              <div className="p-3 bg-blue-100 rounded text-blue-800">
                💻 仅在平板及以上设备显?              </div>
            </ResponsiveHide>

            <ResponsiveHide showOn={['mobile-s', 'mobile-m', 'mobile-l']}>
              <div className="p-3 bg-green-100 rounded text-green-800">
                📱 仅在手机设备显示
              </div>
            </ResponsiveHide>

            <ResponsiveHide
              showOn={['tablet']}
              hideOn={['mobile-s', 'mobile-m', 'mobile-l']}
            >
              <div className="p-3 bg-purple-100 rounded text-purple-800">
                📋 仅在平板设备显示
              </div>
            </ResponsiveHide>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 主演示组?function MobileOptimizationDemo() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端头?- 固定定位演示 */}
      <div className="md:hidden">
        <MobileHeader title="响应式优化演? showBorder={false} />
      </div>

      <ResponsiveContainer maxWidth="desktop" className="py-6 md:pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            移动端响应式优化
          </h1>
          <p className="text-gray-600">精细化断点设置和移动端专属组件演?/p>
        </div>

        <div className="space-y-8">
          <ScreenInfoDisplay />
          <ResponsiveGridDemo />
          <MobileComponentsDemo />
          <ResponsiveHideDemo />
        </div>
      </ResponsiveContainer>

      {/* 移动端底部导?- 固定定位演示 */}
      <div className="md:hidden">
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={demoItems.map(item => ({
            id: item.title.toLowerCase(),
            label: item.title,
            icon: <item.icon className="w-5 h-5" />,
          }))}
        />
      </div>
    </div>
  );
}

export default function MobileOptimizationDemoPage() {
  return <MobileOptimizationDemo />;
}

