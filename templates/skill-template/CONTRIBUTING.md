# ProCyc Skill 贡献指南

欢迎为 ProCyc Skill 生态做出贡献！本文档将指导你完成整个流程。

## 📖 目录

- [开始之前](#开始之前)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交指南](#提交指南)
- [审核流程](#审核流程)
- [常见问题](#常见问题)

## 开始之前

### 必要条件

- Node.js >= 16.0.0
- npm >= 7.0.0
- Git
- 阅读 [ProCyc Skill 规范](https://github.com/procyc-skills/docs/blob/main/standards/procyc-skill-spec.md)

### 了解分类体系

在开发前，请确定你的技能分类：

```bash
# 使用 CLI 查看分类
procyc-skill list --category DIAGNOSIS
```

详细分类请参考 [技能分类体系文档](../../docs/standards/procyc-skill-classification.md)。

## 开发流程

### 1. Fork 仓库

点击 GitHub 页面上的 "Fork" 按钮。

### 2. 克隆到本地

```bash
git clone https://github.com/YOUR_USERNAME/procyc-your-skill.git
cd procyc-your-skill
```

### 3. 安装依赖

```bash
npm install
```

### 4. 创建分支

```bash
git checkout -b feature/add-new-skill
```

分支命名规范：

- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `test/xxx` - 测试相关
- `refactor/xxx` - 代码重构

### 5. 开发技能

#### 5.1 编辑 SKILL.md

确保包含所有必填字段：

```yaml
name: procyc-your-skill
description: 清晰描述技能功能（50-200 字符）
version: 1.0.0
input:
  type: object
  required:
    - paramName
  properties:
    paramName:
      type: string
      description: 参数说明
output:
  type: object
  properties:
    success:
      type: boolean
pricing:
  model: free
  currency: FCX
  amount: 0
author:
  name: Your Name
  email: your@email.com
tags:
  - category:DIAG
  - subcategory:DIAG.HW
  - typescript
```

#### 5.2 实现核心逻辑

编辑 `src/handler.ts`:

```typescript
export async function handleRequest(input: any): Promise<any> {
  // 验证输入
  if (!input.paramName) {
    throw new Error('Missing required parameter: paramName');
  }

  // 实现业务逻辑
  const result = await doSomething(input.paramName);

  return {
    success: true,
    data: result,
  };
}
```

#### 5.3 编写测试

创建单元测试 `tests/unit/handler.test.ts`:

```typescript
import { handleRequest } from '../../src/handler';

describe('Handler Tests', () => {
  it('应该成功执行', async () => {
    const result = await handleRequest({
      paramName: 'test',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('应该处理缺失参数的情况', async () => {
    await expect(handleRequest({})).rejects.toThrow(
      'Missing required parameter'
    );
  });
});
```

### 6. 运行测试

```bash
npm test
```

确保：

- ✅ 所有测试通过
- ✅ 测试覆盖率 ≥ 80%

### 7. 代码检查

```bash
npm run lint
```

修复所有 ESLint 错误和警告。

### 8. 验证配置

```bash
procyc-skill validate --strict
```

确保验证通过。

### 9. 提交更改

```bash
git add .
git commit -m "feat: implement procyc-your-skill"
```

提交信息规范参考 [提交指南](#提交指南)。

### 10. 推送到远程

```bash
git push origin feature/add-new-skill
```

### 11. 创建 Pull Request

1. 访问你的 Fork 仓库
2. 点击 "Compare & pull request"
3. 填写 PR 模板
4. 提交 PR

## 代码规范

### TypeScript 规范

```typescript
// ✅ 好的做法
export interface SkillInput {
  paramName: string;
  optionalParam?: number;
}

export async function handleRequest(input: SkillInput): Promise<SkillOutput> {
  const startTime = Date.now();

  try {
    validateInput(input);
    const data = await processInput(input);

    return {
      success: true,
      data,
      metadata: {
        executionTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SKILL_006',
        message: error.message,
      },
    };
  }
}

// ❌ 避免的做法
async function func(data: any) {
  // 没有类型定义
  // 没有错误处理
  return data;
}
```

### 注释规范

```typescript
/**
 * 处理用户输入并返回结果
 * @param input - 用户输入数据
 * @returns 处理结果
 * @throws {SkillError} 当输入无效时抛出
 */
export async function handleRequest(input: SkillInput): Promise<SkillOutput> {
  // 验证输入格式
  validateInput(input);

  // TODO: 优化性能

  // FIXME: 处理边界情况

  return execute(input);
}
```

### 错误处理

```typescript
// ✅ 好的做法
try {
  const result = await api.call();
  return { success: true, data: result };
} catch (error) {
  if (error.code === 'TIMEOUT') {
    throw new SkillError('SKILL_002', '技能执行超时');
  }
  throw error;
}

// ❌ 避免的做法
try {
  return await api.call();
} catch (e) {
  console.log(e);
}
```

## 提交指南

### Commit Message 格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具配置

#### Subject

- 使用祈使句："add feature" 而不是 "added feature"
- 首字母小写
- 不以句号结尾
- 长度不超过 50 字符

#### 示例

```bash
feat(diagnosis): add fault diagnosis skill

Implement core diagnosis logic with AI model integration.

Closes #123
```

```bash
fix(validation): correct input parameter validation

Fix regex pattern for phone number validation.

Fixes #456
```

## 审核流程

### 自动检查

PR 提交后会自动运行：

1. ✅ CI/CD 流水线
2. ✅ 单元测试
3. ✅ 代码覆盖率检查
4. ✅ ESLint 检查
5. ✅ SKILL.md 验证

### 人工审核

ProCyc 团队成员会审核：

1. **代码质量**
   - 代码结构清晰
   - 遵循最佳实践
   - 无硬编码敏感信息

2. **功能完整性**
   - 实现声明的所有功能
   - 错误处理完善
   - 性能达标

3. **文档质量**
   - README 完整准确
   - API 文档清晰
   - 示例代码可用

4. **测试覆盖**
   - 单元测试覆盖率 ≥ 80%
   - 关键路径有集成测试
   - 边界条件有测试

5. **安全审查**
   - 输入验证完善
   - 无常见安全漏洞
   - 依赖版本安全

### 审核结果

- ✅ **通过**: 合并到 main 分支
- 🔧 **需要修改**: 根据评论修改后重新提交
- ❌ **拒绝**: 不符合要求，关闭 PR

## 常见问题

### Q1: 如何开发多语言版本的技能？

创建多语言目录结构：

```
procyc-my-skill/
├── javascript/
│   ├── package.json
│   └── src/
└── python/
    ├── requirements.txt
    └── src/
```

在 SKILL.md 中说明：

```yaml
tags:
  - javascript
  - python
  - multi-language
```

### Q2: 如何处理第三方 API 依赖？

使用环境变量：

```typescript
// .env.example
API_KEY = your_api_key_here;

// src/handler.ts
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error('API_KEY environment variable is required');
}
```

### Q3: 技能定价策略如何选择？

参考 [定价规范](../../docs/standards/procyc-skill-spec.md#pricing):

- **免费技能**: `model: free`
- **按次计费**: `model: pay-per-call`
- **订阅制**: `model: subscription`

### Q4: 如何提高测试覆盖率？

- 测试所有公共函数
- 测试正常和异常路径
- 测试边界条件
- 使用 `npm run test:coverage` 查看覆盖情况

### Q5: 多久能完成审核？

通常 3-7 个工作日。紧急情况下可在 Issue 中标注。

## 获得帮助

- 💬 [GitHub Discussions](https://github.com/procyc-skills/discussions)
- 📧 Email: support@procyc.com
- 📖 [官方文档](https://procyc.com/docs)

## 奖励机制

优秀贡献者可获得：

- 🏆 ProCyc 认证徽章
- 💰 FCX 积分奖励
- 🌟 官方推荐展示
- 📢 社区表彰

---

感谢你的贡献！🎉
