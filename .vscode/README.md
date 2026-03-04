# VSCode IDE 配置指南

本文档说明如何配置 VSCode 以获得最佳的 FixCycle 项目开发体验。

## 📦 **必需扩展**

### 核心扩展（必须安装）
- **ESLint** (`dbaeumer.vscode-eslint`) - TypeScript/JavaScript 代码检查
- **Prettier** (`esbenp.prettier-vscode`) - 代码格式化
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Tailwind CSS 智能提示
- **Path Intellisense** (`christian-kohler.path-intellisense`) - 路径自动补全

### 推荐扩展
- **Error Lens** (`usernamehw.errorlens`) - 直接在行内显示错误信息
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`) - 自动重命名配对的 HTML/XML 标签
- **Auto Close Tag** (`formulahendry.auto-close-tag`) - 自动闭合 HTML/XML 标签
- **Simple React Snippets** (`vortizhe.simple-react-snippets`) - React 代码片段
- **REST Client** (`humao.rest-client`) - API 测试工具

## ⚙️ **配置文件说明**

### `.vscode/settings.json`
已优化的编辑器设置：
- ✅ Prettier 作为默认格式化工具
- ✅ 保存时自动格式化
- ✅ TypeScript 智能导入
- ✅ 禁用与 Prettier 冲突的文件末尾空白处理

### `.vscode/launch.json`
调试配置：
- 🔧 **Debug Next.js Server** - 调试后端服务
- 🔧 **Debug Frontend (Chrome)** - 调试前端页面
- 🔧 **Fullstack Debug** - 同时调试前后端
- 🔧 **Debug Jest Tests** - 调试单元测试
- 🔧 **Debug Playwright Tests** - 调试 E2E 测试

### `.vscode/tasks.json`
常用任务：
- 📦 `start-dev-server` - 启动开发服务器（端口 3001）
- 🔨 `build-production` - 构建生产版本
- ✔️ `lint-check` - 检查代码规范
- ✨ `format-code` - 格式化代码
- 🧪 `test-unit` - 运行单元测试
- 🧪 `test-e2e` - 运行 E2E 测试
- 🐳 `docker-dev-up` - 启动 Docker 开发环境
- 🐳 `docker-dev-down` - 停止 Docker 开发环境

## 🚀 **快速开始**

### 1. 安装推荐扩展
打开命令面板 (`Ctrl+Shift+P`) → 输入 "Show Recommended Extensions" → 点击安装所有推荐扩展

### 2. 使用快捷键

#### 开发相关
| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+B` | 运行构建任务 |
| `Ctrl+`` ` `` | 打开终端 |
| `F5` | 启动调试 |
| `Ctrl+Shift+D` | 打开调试视图 |

#### 编辑相关
| 快捷键 | 功能 |
|--------|------|
| `Shift+Alt+F` | 格式化代码 |
| `Ctrl+S` | 保存并自动格式化 |
| `F12` | 跳转到定义 |
| `Alt+F12` | 查看定义预览 |
| `Ctrl+T` | 查看所有符号 |

#### 任务相关
| 任务名称 | 说明 |
|----------|------|
| `npm: dev` | 启动开发服务器（端口 3001） |
| `npm: build` | 构建生产版本 |
| `npm: lint` | 检查代码规范 |
| `npm: format` | 格式化代码 |
| `npm: test:unit` | 运行单元测试 |
| `npm: test:e2e` | 运行 E2E 测试 |

## 🔍 **调试配置**

### 调试 Next.js 应用
1. 按 `F5` 或转到调试视图
2. 选择 "Debug Next.js Server"
3. 服务器会自动启动并在浏览器中打开
4. 在代码中设置断点进行调试

### 调试前端页面
1. 确保开发服务器已启动
2. 选择 "Debug Frontend (Chrome)"
3. Chrome 会自动打开并附加调试器
4. 可以在浏览器和 VSCode 中看到断点

### 全栈调试
1. 选择 "Fullstack Debug" 复合配置
2. 会同时启动后端服务器和前端调试器
3. 可以同时调试前后端代码

## ⚠️ **常见问题解决**

### Prettier 不工作
1. 确认已安装 Prettier 扩展
2. 检查 `.vscode/settings.json` 中的配置
3. 重启 VSCode

### ESLint 报错过多
- 部分规则已调整为 `warn` 或 `off`
- 可以临时禁用：`// eslint-disable-next-line`
- 或在 `.eslintrc.json` 中调整规则

### TypeScript 找不到模块
1. 运行 `npm install` 安装依赖
2. 重启 TypeScript 服务器：`Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. 检查 `tsconfig.json` 中的路径配置

### 调试器无法连接
1. 确认端口未被占用（默认 3001）
2. 检查 `.env` 文件配置
3. 重启 VSCode

## 📝 **最佳实践**

### 代码格式化
- ✅ 启用保存时自动格式化
- ✅ 使用 Prettier 统一团队代码风格
- ✅ 提交前运行 `npm run lint` 和 `npm run format`

### 调试技巧
- ✅ 使用 Error Lens 实时查看错误
- ✅ 使用 Console 面板查看日志
- ✅ 使用断点和监视表达式
- ✅ 使用条件断点提高调试效率

### 性能优化
- ✅ 排除不必要的文件搜索（node_modules, .next 等）
- ✅ 使用工作区信任功能
- ✅ 定期清理扩展缓存

## 🎯 **下一步**

1. ✅ 安装所有推荐扩展
2. ✅ 熟悉调试配置
3. ✅ 使用任务运行器执行常见命令
4. ✅ 遵循代码规范和最佳实践

---

**最后更新**: 2026-03-03  
**维护者**: FixCycle Team
