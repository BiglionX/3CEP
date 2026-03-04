# 移动端专用组件使用指南

## 📱 移动端组件库概述

本组件库专为移动设备优化设计，提供了一系列高性能、易用的移动端UI组件，支持触控操作、响应式布局和移动端特有的交互模式。

## 🎯 核心组件列表

### 1. MobileNavbar - 移动端导航栏

适用于页面顶部导航，支持返回按钮、菜单按钮和自定义内容。

```tsx
import { MobileNavbar } from '@/components/mobile';

function MyPage() {
  return (
    <MobileNavbar
      title="维修店列表"
      showBackButton={true}
      onBackClick={() => router.back()}
    >
      <button className="p-2">
        <Bell className="w-5 h-5 text-gray-600" />
      </button>
    </MobileNavbar>
  );
}
```

**Props 说明**:

- `title`: 页面标题
- `onMenuClick`: 菜单按钮点击回调
- `onBackClick`: 返回按钮点击回调
- `showBackButton`: 是否显示返回按钮
- `showMenuButton`: 是否显示菜单按钮
- `className`: 自定义样式类名

### 2. MobileTabBar - 移动端底部导航栏

固定在页面底部的导航栏，支持5个标签页。

```tsx
import { MobileTabBar } from '@/components/mobile';
import { Home, Search, Bell, User, Settings } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: '首页', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: '搜索', icon: <Search className="w-5 h-5" /> },
    { id: 'notifications', label: '通知', icon: <Bell className="w-5 h-5" /> },
    { id: 'profile', label: '我的', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: '设置', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <MobileTabBar
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

### 3. MobileCard - 移动端卡片组件

优化的卡片布局，支持图片、标题、副标题和内容。

```tsx
import { MobileCard } from '@/components/mobile';

function ShopList() {
  return (
    <div className="space-y-4 p-4">
      <MobileCard
        title="苹果官方维修店"
        subtitle="北京市朝阳区三里屯"
        image="/shop-image.jpg"
        imageAlt="店铺图片"
        onClick={() => router.push('/shop/1')}
      >
        <div className="flex justify-between items-center">
          <span className="text-yellow-500">⭐ 4.8分</span>
          <span className="text-blue-600">距离1.2km</span>
        </div>
      </MobileCard>
    </div>
  );
}
```

### 4. MobileListItem - 移动端列表项

用于设置列表、菜单等场景的标准列表项组件。

```tsx
import { MobileListItem } from '@/components/mobile';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';

function SettingsPage() {
  return (
    <div className="bg-white">
      <MobileListItem
        title="个人资料"
        subtitle="编辑个人信息"
        icon={<User className="w-5 h-5 text-blue-500" />}
        rightContent={<ChevronRight className="w-5 h-5 text-gray-400" />}
        onClick={() => router.push('/profile')}
      />

      <MobileListItem
        title="系统设置"
        icon={<Settings className="w-5 h-5 text-green-500" />}
        onClick={() => router.push('/settings')}
      />
    </div>
  );
}
```

### 5. MobileModal - 移动端模态框

从底部滑出的模态框，符合移动端交互习惯。

```tsx
import { MobileModal } from '@/components/mobile';

function FilterModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>筛选</button>

      <MobileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="筛选条件"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">价格范围</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg">
              <option>不限</option>
              <option>0-100元</option>
              <option>100-500元</option>
            </select>
          </div>

          <button className="w-full py-3 bg-blue-600 text-white rounded-lg">
            应用筛选
          </button>
        </div>
      </MobileModal>
    </>
  );
}
```

### 6. MobileSearchBar - 移动端搜索栏

专为移动设备优化的搜索输入框。

```tsx
import { MobileSearchBar } from '@/components/mobile';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4">
      <MobileSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={() => console.log('搜索:', searchTerm)}
        placeholder="搜索维修店..."
      />
    </div>
  );
}
```

### 7. MobilePullToRefresh - 下拉刷新

移动端标准的下拉刷新组件。

```tsx
import { MobilePullToRefresh } from '@/components/mobile';

function RefreshableList() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(getFreshData());
    setRefreshing(false);
  };

  return (
    <MobilePullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4 p-4">
        {data.map(item => (
          <div key={item.id} className="p-4 bg-white rounded-lg">
            {item.content}
          </div>
        ))}
      </div>
    </MobilePullToRefresh>
  );
}
```

### 8. MobileEmptyState - 空状态组件

当没有数据时显示的友好提示界面。

```tsx
import { MobileEmptyState } from '@/components/mobile';
import { Search } from 'lucide-react';

function EmptyResults() {
  return (
    <MobileEmptyState
      icon={<Search className="w-16 h-16" />}
      title="暂无搜索结果"
      description="尝试使用其他关键词搜索"
      actionText="重新搜索"
      onAction={() => router.push('/search')}
    />
  );
}
```

### 9. MobileLoadMore - 加载更多

无限滚动场景下的"加载更多"按钮。

```tsx
import { MobileLoadMore } from '@/components/mobile';

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    const newItems = await fetchMoreData();
    setItems(prev => [...prev, ...newItems]);
    setHasMore(newItems.length > 0);
    setLoading(false);
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.content}</div>
      ))}
      <MobileLoadMore
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
      />
    </div>
  );
}
```

## 🎨 设计规范

### 触控目标大小

所有可点击元素最小尺寸为 **44px × 44px**，确保良好的触控体验。

### 安全区域适配

组件自动适配iOS的安全区域（刘海屏、Home Indicator），使用以下CSS变量：

- `safe-top`: 顶部安全区域
- `safe-bottom`: 底部安全区域
- `safe-left`: 左侧安全区域
- `safe-right`: 右侧安全区域

### 响应式设计

所有组件都经过响应式优化，能够在不同屏幕尺寸下良好显示。

## ⚡ 性能优化

### 1. 懒加载

```tsx
// 对于图片等大资源使用懒加载
<img src={imageSrc} loading="lazy" className="w-full h-full object-cover" />
```

### 2. 虚拟滚动

对于长列表使用虚拟滚动技术：

```tsx
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style }) => (
  <div style={style}>
    <MobileListItem title={data[index].title} />
  </div>
);

<List height={600} itemCount={data.length} itemSize={72} width="100%">
  {Row}
</List>;
```

### 3. 内存管理

```tsx
// 及时清理事件监听器
useEffect(() => {
  const handleScroll = () => {
    // 处理滚动逻辑
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
```

## 📱 移动端特殊功能

### 手势支持

```tsx
// 滑动手势检测
const handleSwipe = direction => {
  switch (direction) {
    case 'left':
      // 向左滑动
      break;
    case 'right':
      // 向右滑动
      break;
  }
};
```

### 设备方向检测

```tsx
import { useOrientation } from '@/hooks/useOrientation';

function ResponsiveComponent() {
  const orientation = useOrientation();

  return (
    <div
      className={
        orientation === 'landscape' ? 'landscape-layout' : 'portrait-layout'
      }
    >
      {/* 根据方向调整布局 */}
    </div>
  );
}
```

### 网络状态监测

```tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function NetworkAwareComponent() {
  const { isOnline, connectionType } = useNetworkStatus();

  if (!isOnline) {
    return <OfflineNotice />;
  }

  return <OnlineContent />;
}
```

## 🔧 自定义主题

### 颜色主题

```css
/* 自定义主题变量 */
:root {
  --mobile-primary: #007aff;
  --mobile-secondary: #34c759;
  --mobile-danger: #ff3b30;
  --mobile-warning: #ff9500;
  --mobile-info: #5ac8fa;
}
```

### 字体大小

```css
/* 移动端字体优化 */
body {
  font-size: 16px; /* 防止iOS缩放 */
  -webkit-text-size-adjust: 100%;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1.25rem;
  }
  p {
    font-size: 1rem;
  }
}
```

## 🧪 测试要点

### 1. 设备兼容性测试

- iPhone SE (375px)
- iPhone 14 Pro Max (430px)
- iPad (768px)
- Android各种屏幕尺寸

### 2. 交互测试

- 触控响应速度
- 手势识别准确性
- 滚动流畅度
- 键盘弹出行为

### 3. 性能测试

- 首屏加载时间 < 2秒
- 列表滚动FPS > 55
- 内存占用稳定
- 电池消耗合理

## 🚀 最佳实践

### 1. 组件使用原则

```tsx
// ✅ 推荐：组合使用基础组件
function ShopCard({ shop }) {
  return (
    <MobileCard
      title={shop.name}
      subtitle={shop.address}
      onClick={() => router.push(`/shop/${shop.id}`)}
    >
      <div className="flex justify-between mt-2">
        <Rating score={shop.rating} />
        <Distance distance={shop.distance} />
      </div>
    </MobileCard>
  );
}

// ❌ 避免：过度自定义样式
function CustomCard({ children }) {
  return <div className="mobile-card-custom-wrapper">{children}</div>;
}
```

### 2. 响应式布局

```tsx
// ✅ 使用响应式断点
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <ShopCard />
</div>

// ❌ 避免：硬编码尺寸
<div style={{ width: '300px' }}>
  <ShopCard />
</div>
```

### 3. 性能优化

```tsx
// ✅ 使用React.memo优化组件
const OptimizedCard = memo(({ shop }) => <MobileCard title={shop.name} />);

// ✅ 使用useCallback避免不必要的重渲染
const handleClick = useCallback(() => {
  router.push('/detail');
}, [router]);
```

## 📚 相关资源

- [Tailwind CSS 响应式设计](https://tailwindcss.com/docs/responsive-design)
- [React Native 手势处理](https://docs.swmansion.com/react-native-gesture-handler/)
- [移动端用户体验指南](https://developer.apple.com/design/human-interface-guidelines/)
- [Google Material Design](https://material.io/design)

---

**组件库版本**: v1.0
**最后更新**: 2026年3月1日
**适用范围**: 维修店用户中心移动端优化
