# ProCyc Skill Template

[ProCyc](https://procyc.com) Skill 项目的官方模板仓库。

## 使用说明

### 方法一：使用 CLI 工具（推荐）

```bash
# 安装 CLI
npm install -g @procyc/cli

# 创建新 Skill
procyc-skill init procyc-my-skill
```

### 方法二：直接使用此模板

1. 点击 "Use this template" 按钮
2. 输入你的 Skill 名称（必须以 `procyc-` 开头）
3. 克隆到本地
4. 修改 `SKILL.md` 和源代码

## 项目结构

```
procyc-my-skill/
├── SKILL.md                 # 技能元数据（必需）
├── README.md                # 项目说明
├── LICENSE                  # 开源许可证
├── .gitignore
├── package.json
├── src/
│   ├── index.ts            # 主入口
│   ├── handler.ts          # 核心逻辑
│   └── types.ts            # 类型定义
├── tests/
│   ├── unit/               # 单元测试
│   └── integration/        # 集成测试
└── docs/
    ├── API.md              # API 文档
    └── EXAMPLES.md         # 使用示例
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 编辑 SKILL.md

修改以下字段：

```yaml
name: procyc-your-skill-name
description: 你的技能描述（50-200 字符）
version: 1.0.0
author:
  name: 你的名字
  email: your@email.com
tags:
  - category:DIAG # 从分类体系中选择
  - subcategory:DIAG.HW
  - typescript
  - tested
```

### 3. 实现技能逻辑

编辑 `src/handler.ts`:

```typescript
export async function handleRequest(input: any): Promise<any> {
  // TODO: 实现你的技能逻辑
  return {
    message: 'Skill executed successfully',
    data: input,
  };
}
```

### 4. 编写测试

在 `tests/unit/` 添加测试文件。

### 5. 验证配置

```bash
npm run validate
```

### 6. 发布

```bash
npm run build
npm publish
```

## 开发指南

详细开发指南请参考 [ProCyc Skill 规范](https://github.com/procyc-skills/docs/blob/main/standards/procyc-skill-spec.md)。

## 相关资源

- [ProCyc Skill 规范](https://github.com/procyc-skills/docs/blob/main/standards/procyc-skill-spec.md)
- [技能分类体系](https://github.com/procyc-skills/docs/blob/main/standards/procyc-skill-classification.md)
- [CLI 工具文档](https://github.com/procyc-skills/cli)
- [ProCyc 官方网站](https://procyc.com)

## 许可证

MIT License
