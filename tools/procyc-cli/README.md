# @procyc/cli - ProCyc Skill 脚手架工具

ProCyc Skill 命令行工具，用于快速创建、验证和管理 ProCyc Skill 项目。

## 安装

### 全局安装（推荐）

```bash
npm install -g @procyc/cli
```

### 本地安装

```bash
npm install --save-dev @procyc/cli
```

## 使用方法

### 1. 初始化新 Skill 项目

```bash
procyc-skill init procyc-my-skill
```

#### 选项

- `-t, --template <template>` - 选择模板 (typescript|javascript|python)，默认为 typescript
- `-c, --category <category>` - 技能分类 (如 DIAG, ESTM, LOCA 等)
- `--dry-run` - 预览将创建的文件而不实际创建

#### 示例

```bash
# 使用 TypeScript 模板
procyc-skill init procyc-fault-diagnosis

# 使用 Python 模板
procyc-skill init procyc-estimate-value --template python

# 指定分类
procyc-skill init procyc-find-shop --category LOCA

# 预览文件
procyc-skill init procyc-test-skill --dry-run
```

### 2. 验证 Skill 配置

```bash
cd your-skill-project
procyc-skill validate
```

#### 选项

- `--strict` - 严格模式，警告也会报错

#### 示例

```bash
# 基本验证
procyc-skill validate

# 严格模式
procyc-skill validate --strict
```

### 3. 列出可用模板

```bash
procyc-skill list
```

#### 选项

- `--category <category>` - 按分类过滤

#### 示例

```bash
# 列出所有模板
procyc-skill list

# 只看诊断类模板
procyc-skill list --category DIAGNOSIS
```

### 4. 生成 SKILL.md

```bash
procyc-skill generate-skill-md
```

交互式问答帮助生成符合规范的 SKILL.md 文件。

## 命令速查

| 命令                | 说明                | 示例                                |
| ------------------- | ------------------- | ----------------------------------- |
| `init <skill-name>` | 初始化新 Skill 项目 | `procyc-skill init procyc-demo`     |
| `validate`          | 验证 Skill 配置     | `procyc-skill validate --strict`    |
| `list`              | 列出可用模板        | `procyc-skill list --category DIAG` |
| `generate-skill-md` | 生成 SKILL.md       | `procyc-skill generate-skill-md`    |
| `--help`            | 显示帮助            | `procyc-skill --help`               |
| `--version`         | 显示版本号          | `procyc-skill --version`            |

## 项目结构

使用 CLI 创建的 Skill 项目包含以下结构：

```
procyc-my-skill/
├── SKILL.md                 # 技能元数据（必需）
├── README.md                # 使用说明
├── LICENSE                  # 开源许可证
├── .gitignore
├── package.json
├── tsconfig.json           # TypeScript 配置
├── src/
│   ├── index.ts            # 主入口
│   ├── handler.ts          # 处理逻辑
│   └── types.ts            # 类型定义
├── tests/
│   ├── unit/               # 单元测试
│   └── integration/        # 集成测试
└── docs/
    ├── API.md              # API 文档
    └── EXAMPLES.md         # 使用示例
```

## 开发工作流

### 1. 创建 Skill

```bash
procyc-skill init procyc-my-first-skill
cd procyc-my-first-skill
npm install
```

### 2. 开发功能

编辑 `src/handler.ts` 实现具体逻辑。

### 3. 编写测试

```bash
npm test
```

### 4. 验证配置

```bash
npm run validate
# 或
procyc-skill validate
```

### 5. 构建发布

```bash
npm run build
npm publish
```

## 模板系统

### 内置模板

- **typescript** - TypeScript 模板（推荐）
- **javascript** - JavaScript 模板
- **python** - Python 模板
- **diagnosis-typescript** - 诊断类专用 TypeScript 模板
- **estimation-python** - 估价类专用 Python 模板（适合 ML）

### 自定义模板

可以通过 Fork 本仓库并修改 `templates/` 目录来创建自定义模板。

## 配置说明

### SKILL.md 字段说明

CLI 会验证 `SKILL.md` 中的所有必填字段：

- ✅ `name` - 必须以 `procyc-` 开头
- ✅ `description` - 50-200 字符
- ✅ `version` - 语义化版本格式
- ✅ `input` - 输入参数定义
- ✅ `output` - 输出结果定义
- ✅ `pricing` - 定价策略
- ✅ `author` - 作者信息
- ✅ `tags` - 标签列表（必须包含分类标签）

详细规范请参考 [ProCyc Skill 规范](../../docs/standards/procyc-skill-spec.md)。

## 错误码

| 错误码  | 说明              | 解决方案                                            |
| ------- | ----------------- | --------------------------------------------------- |
| CLI_001 | 无效的技能名称    | 确保以 `procyc-` 开头，只包含小写字母、数字和连字符 |
| CLI_002 | 目录已存在        | 选择不存在的目录名或删除现有目录                    |
| CLI_003 | 模板不存在        | 检查模板名称是否正确                                |
| CLI_004 | SKILL.md 解析失败 | 检查 YAML 格式是否正确                              |
| CLI_005 | 缺少必填字段      | 补充缺失的字段                                      |
| CLI_006 | 分类标签缺失      | 添加 `category:XXX` 标签                            |

## 最佳实践

### 1. 使用正确的命名

```bash
# ✅ 好的命名
procyc-skill init procyc-fault-diagnosis
procyc-skill init procyc-part-lookup

# ❌ 避免的命名
procyc-skill init mySkill  # 没有 procyc-前缀
procyc-skill init Procyc_Demo  # 使用了大写字母
```

### 2. 选择合适的模板

```bash
# AI 诊断类技能 - 使用 Python 模板
procyc-skill init procyc-ai-diagnosis --template python

# API 集成类技能 - 使用 TypeScript 模板
procyc-skill init procyc-shop-locator --template typescript
```

### 3. 在开发前验证

每次提交前都运行验证：

```bash
npm run validate
```

### 4. 使用严格模式 CI/CD

```yaml
# GitHub Actions 示例
- name: Validate Skill
  run: npm run validate -- --strict
```

## 常见问题

### Q1: 为什么安装后找不到命令？

确保已全局安装或将 node_modules/.bin 添加到 PATH：

```bash
npm install -g @procyc/cli
```

或在项目中使用 npx：

```bash
npx procyc-skill init my-skill
```

### Q2: 如何更新 CLI？

```bash
npm update -g @procyc/cli
```

### Q3: 支持哪些 Node.js 版本？

需要 Node.js >= 16.0.0

### Q4: 如何贡献模板？

1. Fork 本仓库
2. 在 `templates/` 目录创建新模板
3. 提交 Pull Request

## 开发 CLI

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/procyc-skills/cli.git
cd cli

# 安装依赖
npm install

# 链接到全局
npm link

# 现在可以使用
procyc-skill --version
```

### 构建

```bash
npm run build
```

### 测试

```bash
npm test
```

### 发布

```bash
npm version patch  # 或 minor/major
npm publish
```

## 相关链接

- [ProCyc Skill 规范](../../docs/standards/procyc-skill-spec.md)
- [技能分类体系](../../docs/standards/procyc-skill-classification.md)
- [GitHub 组织](https://github.com/procyc-skills)
- [NPM 包页面](https://www.npmjs.com/package/@procyc/cli)

## 许可证

MIT License
