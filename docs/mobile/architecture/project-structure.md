# 移动端项目结构说明

> 📁 React Native 项目的文件夹组织方式

本文档详细说明移动端项目的文件夹结构、各目录职责和文件组织规范。

---

## 📂 完整目录结构

```
项目根目录/
├── src/
│   ├── mobile/                    # React Native 移动端应用
│   │   ├── __tests__/             # 测试文件
│   │   ├── app/                   # 应用入口和页面
│   │   ├── modules/               # 复用 Web 端业务模块
│   │   ├── components/            # RN 专属 UI组件
│   │   ├── navigation/            # 导航配置
│   │   ├── theme/                 # 主题系统
│   │   ├── utils/                 # 工具函数
│   │   ├── config/                # 配置文件
│   │   ├── assets/                # 静态资源
│   │   ├── hooks/                 # RN 专属 Hooks
│   │   └── stores/                # 状态管理
│   │
│   └── packages/                  # 共享代码包 (Monorepo)
│       ├── api/                   # API 调用层
│       ├── utils/                 # 工具函数
│       ├── auth/                  # 认证模块
│       └── stores/                # 状态管理
│
├── mobile-configs/                # 移动端配置文件
│   ├── metro.config.js
│   ├── babel.config.js
│   └── tsconfig.mobile.json
│
└── docs/mobile/                   # 移动端文档
```

---

## 📍 核心目录说明

### `src/mobile/` - React Native 应用主目录

**职责**: 包含所有 React Native 相关的代码和资源

#### `app/` - 应用入口和页面

```
mobile/app/
├── App.tsx                 # RN 应用主入口
├── _layout.tsx             # 根布局 (Expo Router)
├── index.tsx               # 首页
├── (auth)/                 # 认证页面组
│   ├── login.tsx           # 登录页
│   └── register.tsx        # 注册页
├── (tabs)/                 # Tab 导航页面组
│   ├── _layout.tsx         # Tab 导航布局
│   ├── home.tsx            # 首页
│   ├── search.tsx          # 搜索页
│   ├── orders.tsx          # 订单页
│   └── profile.tsx         # 个人主页
└── settings/               # 设置页面
    └── index.tsx
```

**命名规范**:

- 页面文件使用小写 + 短横线：`user-profile.tsx`
- 页面组使用括号：`(auth)`, `(tabs)`
- 布局文件：`_layout.tsx`

---

#### `modules/` - 复用 Web 端业务模块

**关键设计**: 通过导入或符号链接复用 Web 端代码

```
mobile/modules/
├── auth/                   # 认证模块 (复用自 src/modules/auth)
│   ├── services/
│   │   └── auth.service.ts     ← 从 ../../../modules/auth/services 导入
│   ├── hooks/
│   │   └── useAuth.ts          ← 从 ../../../modules/auth/hooks 导入
│   └── types/
│       └── auth.types.ts       ← 从 ../../../modules/auth/types 导入
│
├── repair-service/         # 维修服务模块
│   ├── services/
│   ├── hooks/
│   └── types/
│
└── [其他业务模块...]
```

**复用策略**:

- ✅ **100% 复用**: 业务服务、Hooks、类型定义
- ⚠️ **90% 复用**: 状态管理 (存储层适配)
- ❌ **0% 复用**: UI组件 (完全重写)

**导入示例**:

```typescript
// mobile/modules/auth/hooks/useAuth.ts
// 直接从 Web 端导入，实现代码复用
export { useAuth } from '../../../../modules/auth/hooks/useAuth';
export { AuthService } from '../../../../modules/auth/services/auth.service';
```

---

#### `components/` - RN 专属 UI组件

```
mobile/components/
├── ui/                     # 基础 UI组件 (RN 版本)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   └── index.ts
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   └── ...
│
├── business/               # 业务组件 (RN 适配版)
│   ├── RepairOrderCard.tsx
│   ├── PartsList.tsx
│   ├── OrderTimeline.tsx
│   └── ...
│
└── layouts/                # 布局组件
    ├── MainLayout.tsx
    ├── AuthLayout.tsx
    └── TabLayout.tsx
```

**与 Web 端的区别**:

```typescript
// Web 端 (React DOM)
import { useState } from 'react';

export function Button({ children }) {
  return <button className="btn">{children}</button>;
}

// Mobile 端 (React Native)
import { TouchableOpacity, Text } from 'react-native';

export function Button({ children }) {
  return (
    <TouchableOpacity style={styles.btn}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
```

---

#### `navigation/` - 导航配置

```
mobile/navigation/
├── AppNavigator.tsx        # 主导航 (Stack Navigator)
├── TabNavigator.tsx        # Tab 导航 (Bottom Tabs)
├── linking.ts              # Deep Linking 配置
└── types.ts                # 导航类型定义
```

**示例代码**:

```typescript
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

#### `theme/` - 主题系统

```
mobile/theme/
├── colors.ts               # 颜色变量
├── spacing.ts              # 间距变量
├── typography.ts           # 字体排印
└── dark-mode.ts            # 暗黑模式
```

**示例**:

```typescript
// theme/colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  error: '#FF3B30',
  background: '#FFFFFF',
  text: '#000000',
};

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

---

#### `utils/` - 工具函数

```
mobile/utils/
├── format.ts               # 从 @tech/utils 复用
├── validation.ts           # 从 @tech/utils 复用
└── device.ts               # RN 专属设备工具
```

**平台适配示例**:

```typescript
// utils/device.ts
import { Platform, Dimensions } from 'react-native';

export const deviceInfo = {
  platform: Platform.OS, // 'ios' | 'android'
  screenWidth: Dimensions.get('window').width,
  screenHeight: Dimensions.get('window').height,
};
```

---

#### `hooks/` - RN 专属 Hooks

```
mobile/hooks/
├── useAppState.ts          # 应用状态监听
├── useKeyboard.ts          # 键盘状态
├── useSafeArea.ts          # 安全区域
└── useNetworkStatus.ts     # 网络状态
```

**示例**:

```typescript
// hooks/useKeyboard.ts
import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

export function useKeyboard() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { isKeyboardVisible };
}
```

---

### `src/packages/` - 共享代码包 (Monorepo)

**职责**: 管理 Web 端和移动端共享的代码

#### `api/` - API 调用层

```
packages/api/
├── src/
│   ├── client.ts           # API 客户端
│   ├── endpoints.ts        # 端点定义
│   └── index.ts            # 统一导出
├── package.json
└── tsconfig.json
```

**使用方式**:

```typescript
// 任何地方都可以导入
import { httpClient } from '@fixcycle/api';
```

---

#### `utils/` - 工具函数

```
packages/utils/
├── src/
│   ├── format.ts           # 格式化函数
│   ├── validation.ts       # 验证函数
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

### `mobile-configs/` - 移动端配置文件

```
mobile-configs/
├── metro.config.js         # Metro 打包配置
├── babel.config.js         # Babel 配置
├── tsconfig.mobile.json    # TypeScript 配置 (RN)
└── aliases.config.js       # 路径别名配置
```

**示例**:

```javascript
// mobile-configs/metro.config.js
const { getDefaultConfig } = require('metro-config');

module.exports = getDefaultConfig({
  resolver: {
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
  },
});
```

---

## 🎯 文件命名规范

### 通用规则

| 类型      | 命名方式            | 示例               |
| --------- | ------------------- | ------------------ |
| 组件文件  | PascalCase          | `UserProfile.tsx`  |
| Hook 文件 | camelCase + use     | `useAuth.ts`       |
| 服务文件  | camelCase + service | `auth.service.ts`  |
| 类型文件  | camelCase + types   | `auth.types.ts`    |
| 样式文件  | camelCase + styles  | `button.styles.ts` |
| 配置文件  | kebab-case          | `metro.config.js`  |
| 页面文件  | kebab-case          | `user-profile.tsx` |

### 目录命名

| 类型     | 命名方式    | 示例               |
| -------- | ----------- | ------------------ |
| 功能目录 | kebab-case  | `repair-service`   |
| 页面组   | 括号包裹    | `(auth)`, `(tabs)` |
| 测试目录 | `__tests__` | `__tests__/`       |

---

## 📋 导入路径规范

### 绝对导入 (推荐)

```typescript
// ✅ 好的方式
import { AuthService } from '@fixcycle/auth';
import { httpClient } from '@fixcycle/api';
import { Button } from '@/mobile/components/ui/Button';
```

### 相对导入 (避免深层嵌套)

```typescript
// ❌ 避免超过 3 层
import { x } from '../../../../../modules/auth';

// ✅ 重构为绝对导入
import { x } from '@fixcycle/auth';
```

---

## 🔧 路径别名配置

### TypeScript 配置

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@fixcycle/api": ["packages/api/src"],
      "@fixcycle/utils": ["packages/utils/src"],
      "@fixcycle/auth": ["packages/auth/src"],
      "@/mobile/*": ["src/mobile/*"],
      "@/web/*": ["src/app/*"]
    }
  }
}
```

---

## 📊 目录职责总结

| 目录                 | 职责       | 复用性      | 平台 |
| -------------------- | ---------- | ----------- | ---- |
| `mobile/app/`        | 页面和入口 | ❌ 独占     | RN   |
| `mobile/modules/`    | 业务模块   | ✅ 复用 Web | 两端 |
| `mobile/components/` | UI组件     | ❌ 独占     | RN   |
| `mobile/navigation/` | 导航配置   | ❌ 独占     | RN   |
| `mobile/theme/`      | 主题系统   | ❌ 独占     | RN   |
| `mobile/utils/`      | 工具函数   | ✅ 部分复用 | 两端 |
| `mobile/hooks/`      | 专属 Hooks | ❌ 独占     | RN   |
| `packages/*`         | 共享代码   | ✅ 完全复用 | 两端 |

---

## 🚀 下一步

- [环境搭建指南](../development/getting-started.md)
- [开发第一个功能](../development/first-feature.md)
- [模块共享策略](./module-sharing-strategy.md)

---

**最后更新**: 2026-03-04  
**维护者**: 移动开发团队
