# IDE 配置说明

## 推荐的开发环境设置

### VS Code 配置

本项目包含预配置的 VS Code 设置，位于 `.vscode/` 目录下：

#### settings.json

- 启用保存时自动格式化
- 配置 ESLint 自动修复
- 启用 TypeScript 自动导入
- 配置 Prettier 作为默认格式化工具

#### extensions.json

推荐安装的 VS Code 扩展：

- **TypeScript 支持**: `ms-vscode.vscode-typescript-next`
- **代码格式化**: `esbenp.prettier-vscode`
- **Tailwind CSS**: `bradlc.vscode-tailwindcss`
- **ESLint**: `ms-vscode.vscode-eslint`
- **HTML 标签自动重命名**: `formulahendry.auto-rename-tag`
- **路径智能提示**: `christian-kohler.path-intellisense`
- **JSON 支持**: `ms-vscode.vscode-json`

### 项目配置优化

#### Next.js 配置修复

已修复以下警告：

- `images.domains` 已更新为 `images.remotePatterns`
- `experimental.serverActions` 已更新为对象格式

#### TypeScript 配置

- 严格的类型检查已启用
- 支持路径映射 (`@/*` -> `./src/*`)
- 包含所有必要的类型定义

### 开发工作流建议

1. **安装推荐扩展**：VS Code 会提示安装 `.vscode/extensions.json` 中列出的扩展
2. **启用格式化**：保存文件时会自动格式化代码
3. **类型检查**：开发过程中会实时显示 TypeScript 错误
4. **ESLint 集成**：保存时自动修复可修复的代码质量问题

### 常见问题解决

#### 如果遇到 TypeScript 错误：

```bash
# 重新生成TypeScript类型
npx tsc --noEmit
```

#### 如果 ESLint 不工作：

```bash
# 重新安装依赖
npm install
```

#### 如果格式化不生效：

1. 确保已安装 Prettier 扩展
2. 检查 VS Code 设置中的格式化配置
3. 重启 VS Code

这些配置将帮助您获得更好的开发体验，提高代码质量和开发效率。
