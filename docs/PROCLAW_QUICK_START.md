# 🚀 Proclaw 快速启动指南

> 从零开始搭建 Proclaw 桌面端开发环境
> 预计耗时: 2-3 小时

---

## 📋 前置要求

### 必需软件

| 软件        | 版本         | 下载地址                       |
| ----------- | ------------ | ------------------------------ |
| **Node.js** | 18.x 或 20.x | https://nodejs.org/            |
| **Rust**    | 1.75+        | https://rustup.rs/             |
| **Git**     | 2.x+         | https://git-scm.com/           |
| **VS Code** | 最新版       | https://code.visualstudio.com/ |

### 推荐 VS Code 插件

- Rust Analyzer
- Tauri
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Material Icon Theme

---

## ⚡ 快速开始 (5分钟)

### Step 1: 安装 Rust

```powershell
# Windows PowerShell (管理员权限)
winget install Rustlang.Rust.MSVC

# 验证安装
rustc --version
cargo --version
```

如果 winget 不可用，下载安装程序:

```
https://win.rustup.rs/x86_64
```

### Step 2: 配置 Rust 国内镜像 (加速下载)

```powershell
# 创建 Cargo 配置
New-Item -Path $env:USERPROFILE\.cargo\config.toml -ItemType File -Force

# 编辑配置文件，添加以下内容
```

```toml
# ~/.cargo/config.toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"

[net]
git-fetch-with-cli = true
```

### Step 3: 安装 Tauri CLI

```powershell
cargo install tauri-cli
```

---

## 🏗️ 创建项目 (15分钟)

### Step 4: 初始化 Tauri 项目

```powershell
# 创建项目目录
cd d:\BigLionX\3cep
mkdir proclaw-desktop
cd proclaw-desktop

# 使用官方模板创建项目
npm create tauri-app@latest .

# 按提示选择:
# ✔ Project name · proclaw-desktop
# ✔ Choose which language to use for the backend · Rust
# ✔ Choose your package manager · npm
# ✔ Choose your UI template · react
# ✔ Choose your UI flavor · typescript
```

### Step 5: 安装依赖

```powershell
npm install
```

### Step 6: 运行开发模式

```powershell
npm run tauri dev
```

🎉 **恭喜!** 你应该看到一个空白窗口。

---

## 🎨 集成 UI 框架 (30分钟)

### Step 7: 安装 MUI 和 Tailwind

```powershell
# 安装 MUI
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# 安装 Tailwind CSS
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 8: 配置 Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

```css
/* src/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';  // 添加这行

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Step 9: 测试 MUI 组件

```tsx
// src/App.tsx
import { Button, Typography, Box } from '@mui/material';

function App() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        🦞 Proclaw Desktop
      </Typography>
      <Typography variant="body1" color="text.secondary">
        AI-Powered Business Operating System
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }}>
        Get Started
      </Button>
    </Box>
  );
}

export default App;
```

重新运行 `npm run tauri dev`，你应该看到按钮和文字。

---

## 🔐 集成 Supabase (30分钟)

### Step 10: 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息
4. 等待项目创建完成 (约 2 分钟)

### Step 11: 获取 API 凭证

在 Supabase Dashboard:

1. 进入 **Settings** → **API**
2. 复制 **Project URL** 和 **anon public key**

### Step 12: 配置环境变量

```bash
# 创建 .env.local 文件
echo "VITE_SUPABASE_URL=your-project-url" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local
```

替换为实际值:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 13: 安装 Supabase Client

```powershell
npm install @supabase/supabase-js
```

### Step 14: 创建 Supabase 客户端

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Step 15: 测试连接

```tsx
// src/components/TestSupabase.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Typography, Box } from '@mui/material';

export default function TestSupabase() {
  const [status, setStatus] = useState('未测试');

  const testConnection = async () => {
    try {
      setStatus('测试中...');

      // 尝试查询 (即使表不存在也不会报错)
      const { error } = await supabase.from('test').select('*').limit(1);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStatus('✅ 连接成功!');
    } catch (err) {
      setStatus(`❌ 连接失败: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="outlined" onClick={testConnection}>
        测试 Supabase 连接
      </Button>
      <Typography sx={{ mt: 1 }}>{status}</Typography>
    </Box>
  );
}
```

在 `App.tsx` 中使用:

```tsx
import TestSupabase from './components/TestSupabase';

function App() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">🦞 Proclaw</Typography>
      <TestSupabase />
    </Box>
  );
}
```

---

## 💾 集成 SQLite (30分钟)

### Step 16: 安装 Tauri SQL 插件

```powershell
# 在 src-tauri 目录执行
cd src-tauri
cargo add tauri-plugin-sql --features sqlite
cd ..
```

### Step 17: 配置 Tauri 插件

```json
// src-tauri/tauri.conf.json
{
  "plugins": {
    "sql": {
      "preload": ["sqlite:proclaw.db"]
    }
  }
}
```

### Step 18: 创建数据库工具类

```typescript
// src/db/index.ts
import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function getDB(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:proclaw.db');
  }
  return db;
}

export async function initDB() {
  const database = await getDB();

  // 创建产品表
  await database.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      brand_id TEXT,
      price INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  console.log('Database initialized');
}
```

### Step 19: 测试 SQLite

```tsx
// src/components/TestSQLite.tsx
import { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { getDB } from '../db';

export default function TestSQLite() {
  const [status, setStatus] = useState('未测试');

  const testDatabase = async () => {
    try {
      setStatus('测试中...');

      const db = await getDB();

      // 插入测试数据
      await db.execute(
        'INSERT OR IGNORE INTO products (id, sku_code, name, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['test-1', 'TEST-001', 'Test Product', 9999, Date.now(), Date.now()]
      );

      // 查询数据
      const result = await db.select('SELECT * FROM products LIMIT 5');

      setStatus(`✅ 数据库正常! 找到 ${result.length} 条记录`);
      console.log('Products:', result);
    } catch (err) {
      setStatus(`❌ 数据库错误: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="outlined" onClick={testDatabase}>
        测试 SQLite 数据库
      </Button>
      <Typography sx={{ mt: 1 }}>{status}</Typography>
    </Box>
  );
}
```

---

## 📦 集成 Drizzle ORM (可选, 30分钟)

如果你更喜欢类型安全的 ORM:

### Step 20: 安装 Drizzle

```powershell
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

### Step 21: 配置 Schema

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  skuCode: text('sku_code').notNull().unique(),
  name: text('name').notNull(),
  brandId: text('brand_id'),
  price: integer('price'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
```

### Step 22: 配置 Drizzle

```typescript
// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('proclaw.db');
export const db = drizzle(sqlite, { schema });
```

---

## 🧪 运行测试 (15分钟)

### Step 23: 安装测试框架

```powershell
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Step 24: 配置 Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Step 25: 编写第一个测试

```typescript
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('should render title', () => {
    render(<App />);
    expect(screen.getByText(/Proclaw/i)).toBeInTheDocument();
  });
});
```

### Step 26: 运行测试

```powershell
npm test
```

---

## 📝 代码规范 (15分钟)

### Step 27: 安装 ESLint 和 Prettier

```powershell
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
```

### Step 28: 配置 ESLint

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    ...reactPlugin.configs.flat.recommended,
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  }
);
```

### Step 29: 配置 Prettier

```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Step 30: 添加 Git Hooks

```powershell
npm install -D husky lint-staged
npx husky install
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged
```

---

## 🎯 下一步

完成以上步骤后，你已经拥有:

- ✅ Tauri + React + TypeScript 项目
- ✅ MUI + Tailwind CSS UI 框架
- ✅ Supabase 云端集成
- ✅ SQLite 本地数据库
- ✅ 测试框架
- ✅ 代码规范

现在可以开始 **Phase 0 Week 1** 的任务了!

### 推荐阅读

1. [Tauri 官方文档](https://tauri.app/v2/guides/)
2. [MUI 组件库](https://mui.com/material-ui/getting-started/)
3. [Supabase 文档](https://supabase.com/docs)
4. [Proclaw 技术方案](./PROCLAW_TECHNICAL_PLAN.md)
5. [Proclaw 开发计划](./PROCLAW_DEVELOPMENT_PLAN.md)

---

## 🆘 常见问题

### Q1: Rust 编译很慢怎么办?

**A**: 配置国内镜像源 (见 Step 2)，并使用增量编译:

```toml
# .cargo/config.toml
[build]
incremental = true
```

### Q2: Tauri 窗口打不开?

**A**: 检查是否安装了 WebView2 (Windows 10/11 通常已预装):

```powershell
# 手动安装 WebView2
winget install Microsoft.EdgeWebView2Runtime
```

### Q3: Supabase 连接失败?

**A**:

1. 检查 `.env.local` 是否正确加载
2. 确认 Vite 重启 (`npm run tauri dev` 会自动监听 .env 变化)
3. 检查 Supabase Dashboard 中的 RLS 策略

### Q4: SQLite 文件在哪里?

**A**: 开发模式下在 `src-tauri/proclaw.db`，生产模式下在用户数据目录。

### Q5: 如何调试 Rust 代码?

**A**: 在 VS Code 安装 Rust Analyzer 插件，然后:

1. 打开 `src-tauri/src/main.rs`
2. 设置断点
3. 按 F5 启动调试

---

## 📞 获取帮助

- **GitHub Issues**: 提交问题
- **Discord**: 加入社区
- **文档**: 查看完整技术方案

**祝你开发顺利! 🚀**
