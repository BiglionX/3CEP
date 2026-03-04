# ProCyc Skill 快速启动指南

**版本**: 1.0
**日期**: 2026-03-02
**适用对象**: 技能开发者

---

## 🚀 5 分钟快速开始

### 第一步：安装 CLI 工具（1 分钟）

```bash
# 全局安装 ProCyc CLI
npm install -g @procyc/cli

# 验证安装
procyc-skill --version
```

**预期输出**:

```
@procyc/cli v1.0.0
```

### 第二步：创建第一个 Skill（1 分钟）

```bash
# 使用 TypeScript 模板创建技能
procyc-skill init procyc-demo-skill

# 或使用 Python 模板
procyc-skill init procyc-demo-skill --template python
```

**CLI 会自动**:

- ✅ 验证项目名称（必须以 `procyc-` 开头）
- ✅ 创建完整的项目结构
- ✅ 生成 SKILL.md 配置文件
- ✅ 复制模板文件
- ✅ 初始化 Git 仓库

### 第三步：安装依赖（1 分钟）

```bash
# 进入项目目录
cd procyc-demo-skill

# 安装依赖
npm install
```

### 第四步：编辑配置（1 分钟）

打开 `SKILL.md` 文件，修改以下必填字段：

```yaml
name: procyc-demo-skill
description: 我的第一个 ProCyc Skill，用于演示和学习（50-200 字符）
version: 1.0.0
author:
  name: 你的名字
  email: your@email.com
tags:
  - category:DIAG # 从分类体系中选择
  - subcategory:DIAG.HW # 二级分类
  - typescript # 技术栈标签
  - tested # 质量标签
```

### 第五步：实现功能（1 分钟）

编辑 `src/handler.ts` 文件：

```typescript
export async function handleRequest(input: any): Promise<any> {
  // TODO: 实现你的技能逻辑

  // 示例：返回输入数据
  return {
    message: 'Hello from ProCyc Skill!',
    receivedInput: input,
    timestamp: new Date().toISOString(),
  };
}
```

### 第六步：运行测试（1 分钟）

```bash
# 运行单元测试
npm test

# 查看测试覆盖率
npm run test:coverage
```

**预期结果**:

```
✓ 所有测试通过
✓ 测试覆盖率：85%
```

### 第七步：验证配置（30 秒）

```bash
# 使用 CLI 验证配置
procyc-skill validate
```

**预期输出**:

```
✔ 验证通过
✓ SKILL.md 配置正确
✓ 技能名称：procyc-demo-skill
✓ 版本：1.0.0
✓ 分类：category:DIAG, subcategory:DIAG.HW
```

### 第八步：本地开发（持续）

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint
```

---

## 📁 项目结构说明

创建完成后，你会得到以下项目结构：

```
procyc-demo-skill/
├── SKILL.md                 # 技能元数据（必需）
├── README.md                # 项目说明
├── LICENSE                  # MIT 许可证
├── .gitignore              # Git 忽略规则
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── src/
│   ├── index.ts            # 主入口文件
│   ├── handler.ts          # 核心处理逻辑 ⭐
│   └── types.ts            # TypeScript 类型定义
├── tests/
│   ├── unit/               # 单元测试
│   └── integration/        # 集成测试
└── docs/
    ├── API.md              # API 文档
    └── EXAMPLES.md         # 使用示例
```

---

## 🎯 核心文件说明

### 1. SKILL.md（最重要）

这是技能的"身份证"，包含所有元数据信息。

**必填字段**:

```yaml
name: procyc-your-skill # 唯一标识符
description: 技能描述（50-200 字符）
version: 1.0.0 # 语义化版本号
input: # 输入参数定义
  type: object
  required:
    - paramName
  properties:
    paramName:
      type: string
      description: 参数说明
output: # 输出结果定义
  type: object
  properties:
    success:
      type: boolean
pricing: # 定价策略
  model: free # free | pay-per-call | subscription
  currency: FCX
  amount: 0
author: # 作者信息
  name: Your Name
  email: your@email.com
tags: # 标签列表
  - category:DIAG
  - subcategory:DIAG.HW
  - typescript
```

### 2. handler.ts（核心逻辑）

这里是实现技能具体业务逻辑的地方：

```typescript
// src/handler.ts
import { SkillInput } from './types';

/**
 * 技能核心处理函数
 * @param input - 输入参数
 * @returns 处理结果
 */
export async function handleRequest(input: SkillInput): Promise<any> {
  // 1. 验证输入
  if (!input.paramName) {
    throw new Error('Missing required parameter');
  }

  // 2. 实现业务逻辑
  const result = await doSomething(input.paramName);

  // 3. 返回结果
  return {
    success: true,
    data: result,
    metadata: {
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

async function doSomething(param: string): Promise<any> {
  // 具体的业务逻辑
  return { message: `Processed: ${param}` };
}
```

### 3. index.ts（入口文件）

通常不需要修改，除非需要自定义执行流程：

```typescript
// src/index.ts
import { SkillHandler, SkillInput, SkillOutput } from './types';
import { handleRequest } from './handler';

export class ProcycSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const startTime = Date.now();

    try {
      // 验证输入
      this.validateInput(input);

      // 执行技能逻辑
      const data = await handleRequest(input);

      return {
        success: true,
        data,
        error: null,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: error.code || 'SKILL_006',
          message: error.message || '技能执行失败',
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }
  }

  private validateInput(input: SkillInput): void {
    // 输入验证逻辑
  }
}

export default new ProcycSkill();
```

---

## 🧪 测试指南

### 编写单元测试

在 `tests/unit/handler.test.ts` 中添加测试：

```typescript
import { handleRequest } from '../../src/handler';

describe('Handler Tests', () => {
  it('应该成功执行基本技能', async () => {
    const result = await handleRequest({
      paramName: 'test-value',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.metadata.executionTimeMs).toBeGreaterThan(0);
  });

  it('应该处理缺失参数的情况', async () => {
    await expect(handleRequest({})).rejects.toThrow(
      'Missing required parameter'
    );
  });

  it('应该返回正确的元数据', async () => {
    const result = await handleRequest({
      paramName: 'valid-input',
    });

    expect(result.metadata).toEqual({
      executionTimeMs: expect.any(Number),
      timestamp: expect.any(String),
      version: '1.0.0',
    });
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- tests/unit/handler.test.ts

# 查看测试覆盖率
npm run test:coverage

# 生成 HTML 覆盖率报告
npm run test:coverage:html
```

---

## 📝 开发工作流

### 日常开发

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
npm install

# 3. 开发模式（监听文件变化）
npm run dev

# 4. 运行测试
npm test

# 5. 代码检查
npm run lint

# 6. 格式化代码
npm run format
```

### 提交代码

```bash
# 1. 添加更改
git add .

# 2. 提交（遵循 Conventional Commits 规范）
git commit -m "feat: implement core diagnosis logic"

# 3. 推送到远程
git push origin feature/your-feature-name
```

### 发布新版本

```bash
# 1. 更新版本号（语义化版本）
npm version patch  # 或 minor / major

# 2. 推送 Tag
git push origin --tags

# 3. 自动触发 CI/CD 发布流程
```

---

## 🔧 常用命令速查

### CLI 工具命令

```bash
# 初始化项目
procyc-skill init procyc-my-skill

# 使用特定模板
procyc-skill init procyc-skill --template python

# 指定分类
procyc-skill init procyc-skill --category LOCA

# 预览文件（不实际创建）
procyc-skill init procyc-test --dry-run

# 验证配置
procyc-skill validate

# 严格验证
procyc-skill validate --strict

# 查看可用模板
procyc-skill list

# 按分类过滤模板
procyc-skill list --category DIAGNOSIS
```

### npm 脚本命令

```bash
# 开发
npm run dev              # 开发模式
npm run build            # 构建项目
npm run start            # 运行构建后的代码

# 测试
npm test                 # 运行测试
npm run test:watch       # 监听模式
npm run test:coverage    # 查看覆盖率

# 代码质量
npm run lint             # ESLint 检查
npm run lint:fix         # 自动修复
npm run format           # Prettier 格式化

# 验证
npm run validate         # 使用 CLI 验证配置
```

---

## 📚 学习资源

### 官方文档

- [ProCyc Skill 规范](docs/standards/procyc-skill-spec.md)
- [技能分类体系](docs/standards/procyc-skill-classification.md)
- [CI/CD 配置指南](docs/standards/procyc-cicd-guide.md)
- [贡献指南](templates/skill-template/CONTRIBUTING.md)

### 示例代码

- [TypeScript 模板源码](tools/procyc-cli/templates/typescript/src/)
- [完整示例项目](templates/skill-template/)

### 视频教程

（待制作）

- CLI 工具使用教程
- Skill 开发入门
- 测试编写指南
- 发布流程演示

---

## ❓ 常见问题

### Q1: 为什么安装后找不到命令？

**A**: 确保已全局安装或将 node_modules/.bin 添加到 PATH：

```bash
npm install -g @procyc/cli
```

或在项目中使用 npx：

```bash
npx procyc-skill init my-skill
```

### Q2: 如何选择合适的模板？

**A**:

- **TypeScript**: 推荐用于大多数场景，类型安全
- **JavaScript**: 适合快速原型和简单技能
- **Python**: 适合 AI/ML 相关技能

### Q3: 技能命名有什么要求？

**A**:

- ✅ 必须以 `procyc-` 开头
- ✅ 只能包含小写字母、数字和连字符
- ✅ 长度不超过 50 字符
- ❌ 不能包含大写字母
- ❌ 不能使用特殊字符（除连字符外）

### Q4: 如何添加第三方依赖？

**A**:

对于 TypeScript/JavaScript:

```bash
npm install package-name --save
```

对于 Python:

```bash
pip install package-name
# 然后添加到 requirements.txt
```

### Q5: 如何处理敏感信息（如 API 密钥）？

**A**:

1. 创建 `.env.example` 文件：

```bash
API_KEY=your_api_key_here
```

2. 在代码中使用环境变量：

```typescript
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error('API_KEY is required');
}
```

3. 将 `.env` 添加到 `.gitignore`：

```bash
echo ".env" >> .gitignore
```

### Q6: 如何提高测试覆盖率？

**A**:

- 测试所有公共函数
- 测试正常和异常路径
- 测试边界条件
- 使用 `npm run test:coverage` 查看哪些代码未覆盖

### Q7: 多久能完成审核？

**A**:

- 通常 3-7 个工作日
- 紧急情况下可在 Issue 中标注
- 确保自查清单全部勾选可加快审核

---

## 🆘 获取帮助

### 遇到问题？

1. **查看文档**: [ProCyc Docs](https://procyc.com/docs)
2. **搜索 Issue**: [GitHub Issues](https://github.com/procyc-skills/discussions)
3. **提问**: 在 Discussions 中发起新讨论
4. **邮件**: support@procyc.com

### 发现 Bug？

1. 搜索是否已有相同 Issue
2. 如果没有，创建新 Issue 并详细描述问题
3. 提供复现步骤和环境信息

### 需要新功能？

1. 在 Ideas 分类下发起讨论
2. 说明使用场景和必要性
3. Core Team 会评估并排期

---

## 🎓 进阶指南

### 性能优化

```typescript
// 使用缓存优化重复调用
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

export async function handleRequest(input: any) {
  const cacheKey = `skill:${JSON.stringify(input)}`;

  // 尝试从缓存获取
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 执行计算
  const result = await expensiveOperation(input);

  // 存入缓存
  cache.set(cacheKey, result);

  return result;
}
```

### 错误处理最佳实践

```typescript
import { SkillError } from './types';

export async function handleRequest(input: any) {
  try {
    // 业务逻辑
    return await doWork(input);
  } catch (error) {
    // 转换为标准 SkillError
    throw new SkillError({
      code: 'SKILL_006',
      message: error.message,
      originalError: error,
    });
  }
}
```

### 日志记录

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export async function handleRequest(input: any) {
  logger.info('Skill execution started', { input });

  try {
    const result = await doWork(input);
    logger.info('Skill executed successfully', { result });
    return result;
  } catch (error) {
    logger.error('Skill execution failed', { error, input });
    throw error;
  }
}
```

---

## 📊 检查清单

在提交代码前，请确保：

- [ ] SKILL.md 包含所有必填字段
- [ ] 技能名称符合规范（以 `procyc-` 开头）
- [ ] 描述长度在 50-200 字符之间
- [ ] 版本号符合语义化版本规范
- [ ] 添加了分类标签
- [ ] README.md 完整且准确
- [ ] 有至少一个使用示例
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 所有测试通过
- [ ] 代码符合 ESLint 规范
- [ ] 没有硬编码的敏感信息
- [ ] .gitignore 已正确配置
- [ ] 变更日志已更新

---

**祝你开发愉快！** 🎉

如有任何问题，随时联系 ProCyc 团队。
