# 模块共享策略

> 🔄 最大化代码复用：Web 端与移动端共享方案

本文档详细说明如何在 Next.js Web 端和 React Native 移动端之间共享代码，实现"一次编写，多端运行"。

---

## 🎯 共享原则

### 优先级矩阵

```
┌─────────────────────────────────────────────────────┐
│                  可共享性评估                        │
├─────────────────────────────────────────────────────┤
│  ✅ 完全共享 (100%)                                  │
│     - 业务服务层                                     │
│     - 业务 Hooks                                     │
│     - 类型定义                                      │
│     - 工具函数                                      │
│     - 常量配置                                      │
├─────────────────────────────────────────────────────┤
│  ⚠️ 部分共享 (90-95%)                               │
│     - 状态管理 (存储层适配)                          │
│     - API 调用 (HTTP 客户端适配)                      │
│     - 本地存储 (Storage 抽象)                         │
├─────────────────────────────────────────────────────┤
│  ❌ 不共享 (0%)                                      │
│     - UI组件                                       │
│     - 路由配置                                      │
│     - 导航组件                                      │
│     - 平台特定 API                                   │
└─────────────────────────────────────────────────────┘
```

---

## 📦 共享方式对比

### 方式一：直接导入 (Phase 1-2 推荐)

**适用场景**: 项目初期，快速验证

#### 实现方式

```typescript
// src/mobile/modules/auth/services/auth.service.ts
// 直接从 Web 端导入业务逻辑

import { AuthService as WebAuthService } from '../../../../modules/auth/services/auth.service';

// 直接使用，无需修改
export const AuthService = WebAuthService;

// 或者重新导出
export * from '../../../../modules/auth/services/auth.service';
```

**优点**:

- ✅ 零配置成本
- ✅ 实时同步更新
- ✅ 易于调试追踪
- ✅ 无需构建步骤

**缺点**:

- ❌ 耦合度较高
- ❌ 难以独立测试
- ❌ 不适合 Monorepo 拆分
- ❌ 路径层级过深

**最佳实践**:

```typescript
// ✅ 在 mobile/modules 下创建适配器层
// src/mobile/modules/auth/index.ts

// 导入 Web 端实现
export { AuthService } from '../../../modules/auth/services/auth.service';
export { useAuth } from '../../../modules/auth/hooks/useAuth';
export type { User, AuthState } from '../../../modules/auth/types/auth.types';

// 添加移动端专属扩展
export { MobileAuthService } from './services/mobile-auth.service';
```

---

### 方式二：Symbolic Link (不推荐 Windows)

**适用场景**: macOS/Linux 团队，快速原型

#### 实现方式

```bash
# 创建符号链接
cd src/mobile/modules/auth

# 链接 services 目录
ln -s ../../../../modules/auth/services services

# 链接 hooks 目录
ln -s ../../../../modules/auth/hooks hooks

# 链接 types 目录
ln -s ../../../../modules/auth/types types
```

**目录结构**:

```
src/mobile/modules/auth/
├── services -> ../../../../modules/auth/services
├── hooks -> ../../../../modules/auth/hooks
├── types -> ../../../../modules/auth/types
└── components/  # RN 专属组件
    └── LoginForm.tsx
```

**优点**:

- ✅ 物理隔离，逻辑统一
- ✅ 便于理解模块边界
- ✅ 减少导入路径层级

**缺点**:

- ❌ Windows Git 支持差
- ❌ 跨平台协作困难
- ❌ Git 追踪问题
- ❌ IDE 索引混乱

**Git 配置** (如果必须使用):

```gitignore
# .gitignore
# 忽略符号链接本身
src/mobile/modules/auth/services
src/mobile/modules/auth/hooks
src/mobile/modules/auth/types

# 但跟踪占位文件
!src/mobile/modules/auth/**/.gitkeep
```

---

### 方式三：共享包 Monorepo (Phase 3 推荐 ⭐)

**适用场景**: 成熟项目，长期维护

#### 架构设计

```
项目根目录/
├── apps/
│   ├── web/                    # Next.js Web 应用
│   │   └── package.json
│   ├── mobile/                 # React Native 应用
│   │   └── package.json
│   └── admin/                  # 管理后台
│       └── package.json
│
├── packages/                   # 共享代码包
│   ├── api/                    # API 调用层
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                  # 工具函数
│   │   ├── src/
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                   # 认证模块
│   │   ├── src/
│   │   │   ├── auth.service.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── stores/                 # 状态管理
│   │   └── ...
│   │
│   ├── ui-web/                 # Web 专属 UI
│   │   └── ...
│   │
│   └── ui-mobile/              # Mobile 专属 UI
│       └── ...
│
├── turbo.json                  # Turborepo 配置
├── package.json                # Root package.json
└── pnpm-workspace.yaml         # PNPM Workspace 配置
```

#### 实施步骤

##### Step 1: 初始化 Monorepo

```bash
# 安装 Turborepo
pnpm add -D turbo --save-exact

# 创建 turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
EOF
```

##### Step 2: 配置共享包

```json
// packages/auth/package.json
{
  "name": "@fixcycle/auth",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "zustand": "^5.0.0"
  }
}
```

##### Step 3: 迁移现有代码

```bash
# 将现有模块移动到 packages/
mkdir -p packages/auth/src

# 移动认证相关代码
mv src/modules/auth/services/auth.service.ts packages/auth/src/
mv src/modules/auth/hooks/useAuth.ts packages/auth/src/
mv src/modules/auth/types/auth.types.ts packages/auth/src/

# 创建统一导出文件
cat > packages/auth/src/index.ts << 'EOF'
// 导出服务
export { AuthService } from './auth.service';

// 导出 Hooks
export { useAuth } from './useAuth';

// 导出类型
export type { User, AuthState, LoginCredentials } from './auth.types';
EOF
```

##### Step 4: 更新导入路径

```typescript
// Before (Web 端)
import { AuthService } from '@/modules/auth/services/auth.service';

// After (Web 端)
import { AuthService } from '@fixcycle/auth';

// Before (Mobile 端)
import { AuthService } from '../../../../modules/auth/services/auth.service';

// After (Mobile 端)
import { AuthService } from '@fixcycle/auth';
```

##### Step 5: 配置路径别名

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@fixcycle/*": ["packages/*/src"],
      "@fixcycle/api": ["packages/api/src"],
      "@fixcycle/utils": ["packages/utils/src"],
      "@fixcycle/auth": ["packages/auth/src"],
      "@fixcycle/stores": ["packages/stores/src"],
      "@apps/web/*": ["apps/web/*"],
      "@apps/mobile/*": ["apps/mobile/*"]
    }
  }
}
```

**优点**:

- ✅ 清晰的模块边界
- ✅ 独立的版本管理
- ✅ 易于单元测试
- ✅ 支持多应用共享
- ✅ 便于 CI/CD 集成

**缺点**:

- ❌ 需要学习 Monorepo 工具
- ❌ 初始配置复杂
- ❌ 构建时间增加
- ❌ 需要团队协作约定

---

## 🔧 平台差异抽象

### 存储层抽象示例

**问题**: Web 使用 `localStorage`，RN 使用 `AsyncStorage`

**解决方案**: 创建统一的 Storage Provider 接口

#### Step 1: 定义接口

```typescript
// packages/storage/src/types.ts

export interface StorageProvider {
  /**
   * 获取存储的值
   */
  getItem(key: string): Promise<string | null>;

  /**
   * 设置存储的值
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * 删除存储项
   */
  removeItem(key: string): Promise<void>;

  /**
   * 清空所有存储
   */
  clear(): Promise<void>;

  /**
   * 获取所有 key
   */
  getAllKeys(): Promise<string[]>;
}
```

#### Step 2: 实现 Web Storage

```typescript
// packages/storage/src/web-storage.ts

import type { StorageProvider } from './types';

export class WebStorage implements StorageProvider {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
}
```

#### Step 3: 实现 Mobile Storage

```typescript
// packages/storage/src/mobile-storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageProvider } from './types';

export class MobileStorage implements StorageProvider {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return await AsyncStorage.getAllKeys();
  }
}
```

#### Step 4: 自动平台检测

```typescript
// packages/storage/src/index.ts

import type { StorageProvider } from './types';
import { WebStorage } from './web-storage';
import { MobileStorage } from './mobile-storage';

// 平台检测
const isWeb = typeof window !== 'undefined' && !navigator.product;
const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// 根据平台自动选择实现
export const storage: StorageProvider = isReactNative
  ? new MobileStorage()
  : new WebStorage();

// 导出类型和类
export type { StorageProvider };
export { WebStorage, MobileStorage };
```

#### Step 5: 使用示例

```typescript
// 任何地方都可以统一使用
import { storage } from '@fixcycle/storage';

// Web 和 Mobile 都能正常工作
await storage.setItem('user-token', 'abc123');
const token = await storage.getItem('user-token');
await storage.removeItem('user-token');
```

---

### HTTP 客户端抽象

**问题**: Web 使用 `fetch/axios`，RN 也支持但配置不同

**解决方案**: 创建统一的 API 客户端

```typescript
// packages/api/src/client.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        // 添加认证 token
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // 处理未授权
          console.error('Unauthorized:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// 单例模式
export const apiClient = new ApiClient();
```

---

## 📊 复用率目标

| 模块类别       | 具体模块           | 复用率 | 说明         |
| -------------- | ------------------ | ------ | ------------ |
| **业务服务**   | AuthService        | 100%   | 完全复用     |
|                | RepairService      | 100%   | 完全复用     |
|                | PartsService       | 100%   | 完全复用     |
|                | ProcurementService | 100%   | 完全复用     |
| **业务 Hooks** | useAuth            | 100%   | 完全复用     |
|                | usePermission      | 100%   | 完全复用     |
|                | useRole            | 100%   | 完全复用     |
| **类型定义**   | User types         | 100%   | 完全复用     |
|                | Auth types         | 100%   | 完全复用     |
|                | Business types     | 100%   | 完全复用     |
| **工具函数**   | format utils       | 95%    | 少量平台适配 |
|                | validation utils   | 95%    | 少量平台适配 |
|                | date utils         | 100%   | 完全复用     |
| **状态管理**   | Zustand stores     | 90%    | 存储层适配   |
| **API 调用**   | HTTP client        | 100%   | 完全复用     |
| **UI组件**     | Button             | 0%     | 完全重写     |
|                | Input              | 0%     | 完全重写     |
|                | Card               | 0%     | 完全重写     |

---

## ⚠️ 注意事项

### 1. 避免循环依赖

**错误示例**:

```typescript
// Web 端导入了 Mobile 代码
import { MobileComponent } from '@/mobile/components/MobileComponent'; // ❌
```

**正确做法**:

```typescript
// Mobile 端按需导入共享包
import { AuthService } from '@fixcycle/auth'; // ✅
```

### 2. 保持向后兼容

修改共享代码时需考虑:

- ✅ Web 端是否受影响？
- ✅ Mobile 端是否受影响？
- ✅ 是否需要两端同时测试？
- ✅ 是否需要版本号升级？

### 3. 测试覆盖要求

```typescript
// packages/auth/src/__tests__/auth.test.ts

describe('AuthService', () => {
  it('should login successfully', async () => {
    // 共享代码需要在两端都测试
    const authService = new AuthService();
    const user = await authService.login('test@example.com', 'password');

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### 4. 文档同步

每个共享包都需要:

- ✅ README.md 说明用途
- ✅ API 文档
- ✅ 使用示例
- ✅ 平台限制说明

---

## 🚀 实施路线图

### Phase 1 (当前): 直接导入

- 在 `src/mobile/modules/` 下创建适配器层
- 直接导入 Web 端代码
- 快速验证可行性

### Phase 2 (3-6 月): 准备 Monorepo

- 调研 Turborepo/Nx
- 设计包结构
- 试点 1-2 个模块

### Phase 3 (6-12 月): 全面 Monorepo

- 迁移所有共享代码到 packages/
- 建立发布流程
- 完善 CI/CD

---

## 📚 相关文档

- [项目结构说明](./project-structure.md)
- [Phase 1 实施指南](./phase1-pwa-optimization.md)
- [Phase 2 准备指南](./phase2-rn-preparation.md)

---

**最后更新**: 2026-03-04  
**维护者**: 移动开发团队
