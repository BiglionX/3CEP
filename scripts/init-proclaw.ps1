# Proclaw Desktop 项目初始化脚本
# 适用于 Windows PowerShell
# 使用方法: .\scripts\init-proclaw.ps1

Write-Host "🦞 Proclaw Desktop 项目初始化" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "📦 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 Rust
Write-Host ""
Write-Host "🦀 检查 Rust..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "✅ Rust 已安装: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust 未安装" -ForegroundColor Red
    Write-Host "正在安装 Rust..." -ForegroundColor Yellow

    # 使用 winget 安装
    try {
        winget install Rustlang.Rust.MSVC --silent
        Write-Host "✅ Rust 安装完成" -ForegroundColor Green
    } catch {
        Write-Host "❌ 自动安装失败，请手动安装" -ForegroundColor Red
        Write-Host "下载地址: https://rustup.rs/" -ForegroundColor Yellow
        exit 1
    }
}

# 检查 Git
Write-Host ""
Write-Host "🔧 检查 Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git 未安装，请先安装 Git" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ 所有前置要求已满足!" -ForegroundColor Green
Write-Host ""

# 询问项目路径
$defaultPath = "d:\BigLionX\3cep\proclaw-desktop"
$projectPath = Read-Host "请输入项目路径 (默认: $defaultPath)"

if ([string]::IsNullOrWhiteSpace($projectPath)) {
    $projectPath = $defaultPath
}

# 创建项目目录
Write-Host ""
Write-Host "📁 创建项目目录: $projectPath" -ForegroundColor Yellow

if (Test-Path $projectPath) {
    $overwrite = Read-Host "目录已存在，是否覆盖? (y/n)"
    if ($overwrite -ne 'y') {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit 0
    }
    Remove-Item -Recurse -Force $projectPath
}

New-Item -ItemType Directory -Path $projectPath -Force | Out-Null
Set-Location $projectPath

Write-Host "✅ 项目目录创建成功" -ForegroundColor Green

# 初始化 Tauri 项目
Write-Host ""
Write-Host "🚀 初始化 Tauri 项目..." -ForegroundColor Yellow

# 创建 package.json
$packageJson = @{
    name = "proclaw-desktop"
    version = "0.1.0"
    description = "Proclaw - AI-Powered Business Operating System"
    private = $true
    type = "module"
    scripts = @{
        dev = "vite"
        build = "tsc && vite build"
        preview = "vite preview"
        tauri = "tauri"
    }
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 创建基础文件结构
New-Item -ItemType Directory -Path "src" -Force | Out-Null
New-Item -ItemType Directory -Path "src/components" -Force | Out-Null
New-Item -ItemType Directory -Path "src/pages" -Force | Out-Null
New-Item -ItemType Directory -Path "src/lib" -Force | Out-Null
New-Item -ItemType Directory -Path "src/db" -Force | Out-Null
New-Item -ItemType Directory -Path "public" -Force | Out-Null

Write-Host "✅ 项目结构创建成功" -ForegroundColor Green

# 安装核心依赖
Write-Host ""
Write-Host "📦 安装核心依赖..." -ForegroundColor Yellow

npm install react react-dom
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install tailwindcss postcss autoprefixer
npm install @supabase/supabase-js
npm install zustand @tanstack/react-query
npm install react-router-dom
npm install zod date-fns axios

npm install -D @types/react @types/react-dom @types/node
npm install -D typescript vite @vitejs/plugin-react
npm install -D @tauri-apps/cli

Write-Host "✅ 依赖安装完成" -ForegroundColor Green

# 初始化 Tailwind CSS
Write-Host ""
Write-Host "🎨 初始化 Tailwind CSS..." -ForegroundColor Yellow
npx tailwindcss init -p

# 创建配置文件
Write-Host ""
Write-Host "⚙️  创建配置文件..." -ForegroundColor Yellow

# tsconfig.json
$tsconfig = @{
    compilerOptions = @{
        target = "ES2020"
        useDefineForClassFields = $true
        lib = @("ES2020", "DOM", "DOM.Iterable")
        module = "ESNext"
        skipLibCheck = $true
        moduleResolution = "bundler"
        allowImportingTsExtensions = $true
        resolveJsonModule = $true
        isolatedModules = $true
        noEmit = $true
        jsx = "react-jsx"
        strict = $true
        noUnusedLocals = $true
        noUnusedParameters = $true
        noFallthroughCasesInSwitch = $true
    }
    include = @("src")
    references = @(@{ path = "./tsconfig.node.json" })
}

$tsconfig | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.json"

# tsconfig.node.json
$tsconfigNode = @{
    compilerOptions = @{
        composite = $true
        skipLibCheck = $true
        module = "ESNext"
        moduleResolution = "bundler"
        allowSyntheticDefaultImports = $true
    }
    include = @("vite.config.ts")
}

$tsconfigNode | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.node.json"

# vite.config.ts
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
"@

Set-Content "vite.config.ts" $viteConfig

# index.html
$indexHtml = @"
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Proclaw Desktop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@

Set-Content "index.html" $indexHtml

# src/main.tsx
$mainTsx = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@

Set-Content "src/main.tsx" $mainTsx

# src/App.tsx
$appTsx = @"
import { Button, Typography, Box } from '@mui/material'

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
  )
}

export default App
"@

Set-Content "src/App.tsx" $appTsx

# src/styles.css
$stylesCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@

Set-Content "src/styles.css" $stylesCss

# src/vite-env.d.ts
$viteEnv = @"
/// <reference types="vite/client" />
"@

Set-Content "src/vite-env.d.ts" $viteEnv

Write-Host "✅ 配置文件创建完成" -ForegroundColor Green

# 初始化 Tauri
Write-Host ""
Write-Host "🦀 初始化 Tauri..." -ForegroundColor Yellow

# 使用 cargo 生成 Tauri 项目
cargo generate --git https://github.com/tauri-apps/tauri --name proclaw-desktop --branch dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  cargo generate 失败，尝试手动创建..." -ForegroundColor Yellow

    # 手动创建 src-tauri 目录
    New-Item -ItemType Directory -Path "src-tauri" -Force | Out-Null
    New-Item -ItemType Directory -Path "src-tauri/src" -Force | Out-Null

    # 创建 Cargo.toml
    $cargoToml = @"
[package]
name = "proclaw-desktop"
version = "0.1.0"
description = "Proclaw Desktop Application"
authors = ["You"]
license = "MIT"
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "2.0.0", features = [] }

[dependencies]
tauri = { version = "2.0.0", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
"@

    Set-Content "src-tauri/Cargo.toml" $cargoToml

    # 创建 build.rs
    $buildRs = @"
fn main() {
    tauri_build::build()
}
"@

    Set-Content "src-tauri/build.rs" $buildRs

    # 创建 main.rs
    $mainRs = @"
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
"@

    Set-Content "src-tauri/src/main.rs" $mainRs

    # 创建 tauri.conf.json
    $tauriConf = @"
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:3000",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "com.proclaw.desktop",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  },
  "productName": "Proclaw",
  "version": "0.1.0"
}
"@

    Set-Content "src-tauri/tauri.conf.json" $tauriConf

    Write-Host "✅ Tauri 手动配置完成" -ForegroundColor Green
} else {
    Write-Host "✅ Tauri 初始化完成" -ForegroundColor Green
}

# 创建环境变量模板
Write-Host ""
Write-Host "🔐 创建环境变量模板..." -ForegroundColor Yellow

$envExample = @"
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
VITE_APP_NAME=Proclaw
VITE_APP_VERSION=0.1.0
"@

Set-Content ".env.example" $envExample

# 创建 .env.local
Copy-Item ".env.example" ".env.local"

Write-Host "✅ 环境变量模板创建完成" -ForegroundColor Green

# 创建 README
Write-Host ""
Write-Host "📝 创建 README..." -ForegroundColor Yellow

$readme = @"
# 🦞 Proclaw Desktop

AI-Powered Business Operating System

## 快速开始

### 开发模式

```\``bash
npm run tauri dev
```\``

### 构建生产版本

```\``bash
npm run tauri build
```\``

## 技术栈

- **Framework**: Tauri 2.0 + React 18 + TypeScript
- **UI**: MUI + Tailwind CSS
- **State**: Zustand + React Query
- **Database**: SQLite (local) + Supabase (cloud)
- **AI**: Dify + Pinecone

## 文档

- [技术方案](../docs/PROCLAW_TECHNICAL_PLAN.md)
- [开发计划](../docs/PROCLAW_DEVELOPMENT_PLAN.md)
- [快速启动](../docs/PROCLAW_QUICK_START.md)

## License

MIT
"@

Set-Content "README.md" $readme

Write-Host "✅ README 创建完成" -ForegroundColor Green

# 创建 .gitignore
Write-Host ""
Write-Host "📄 创建 .gitignore..." -ForegroundColor Yellow

$gitignore = @"
# Dependencies
node_modules/

# Build outputs
dist/
src-tauri/target/

# Environment files
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.db
*.db-shm
*.db-wal
"@

Set-Content ".gitignore" $gitignore

Write-Host "✅ .gitignore 创建完成" -ForegroundColor Green

# 初始化 Git
Write-Host ""
Write-Host "🔧 初始化 Git..." -ForegroundColor Yellow

git init
git add .
git commit -m "chore: initialize Proclaw Desktop project"

Write-Host "✅ Git 初始化完成" -ForegroundColor Green

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Proclaw Desktop 项目初始化完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 项目路径: $projectPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 下一步:" -ForegroundColor Yellow
Write-Host "1. 编辑 .env.local 配置 Supabase 凭证" -ForegroundColor White
Write-Host "2. 运行 'npm run tauri dev' 启动开发服务器" -ForegroundColor White
Write-Host "3. 阅读 docs/PROCLAW_QUICK_START.md 了解更多" -ForegroundColor White
Write-Host ""
Write-Host "祝开发顺利! 🚀" -ForegroundColor Green
Write-Host ""
