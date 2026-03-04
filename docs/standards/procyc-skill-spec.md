# ProCyc Skill 规范 v1.0

## 1. 概述

本规范定义了 ProCyc Skill 的标准格式和元数据要求，确保技能在 ProCyc 生态系统中的一致性和互操作性。

## 2. Skill 元数据格式

每个 Skill 必须包含 `SKILL.md` 文件，定义以下元数据字段：

### 2.1 必填字段

```yaml
name: string # 技能的唯一标识符（使用 kebab-case 命名）
description: string # 技能的简短描述（不超过 200 字符）
version: string # 语义化版本号 (MAJOR.MINOR.PATCH)
input: object # 输入参数定义
output: object # 输出结果定义
pricing: object # 定价策略
author: object # 作者信息
tags: array # 标签列表
```

### 2.2 字段详细说明

#### name

- **类型**: string
- **格式**: kebab-case
- **示例**: `procyc-find-shop`, `procyc-fault-diagnosis`
- **约束**:
  - 必须以 `procyc-` 前缀开头
  - 只能包含小写字母、数字和连字符
  - 长度不超过 50 字符

#### description

- **类型**: string
- **长度**: 50-200 字符
- **要求**: 清晰描述技能的功能和使用场景

#### version

- **类型**: string
- **格式**: [语义化版本](https://semver.org/lang/zh-CN/)
- **示例**: `1.0.0`, `2.1.3`

#### input

```yaml
input:
  type: object
  required:
    - paramName1
    - paramName2
  properties:
    paramName1:
      type: string|number|boolean|object|array
      description: 参数描述
      default: 默认值 # 可选
      enum: # 可选，枚举值
        - value1
        - value2
      min: 0 # 数字类型的最小值
      max: 100 # 数字类型的最大值
      pattern: '^regex$' # 字符串类型的正则校验
    paramName2:
      type: string
      description: 设备型号
      example: 'iPhone 14 Pro'
```

#### output

```yaml
output:
  type: object
  properties:
    success:
      type: boolean
      description: 执行是否成功
    data:
      type: object|null
      description: 返回的数据结果
    error:
      type: object|null
      properties:
        code: string
        message: string
    metadata:
      type: object
      properties:
        executionTimeMs: number
        timestamp: string (ISO 8601)
        version: string
```

#### pricing

```yaml
pricing:
  model: free|pay-per-call|subscription # 定价模式
  currency: FCX|USD # 货币类型
  amount: number # 单次调用价格或订阅价格
  billingCycle: monthly|yearly # 订阅周期（仅 subscription 模式需要）
  freeQuota: number # 免费额度（每月）
  overage: # 超出额度的计费
    rate: number # 超出部分的单价
```

#### author

```yaml
author:
  name: string # 作者或组织名称
  email: string # 联系邮箱
  url: string # 个人网站或 GitHub 主页（可选）
  organization: string # 所属组织（可选）
```

#### tags

```yaml
tags:
  - category1
  - category2
  - feature1
```

### 2.3 可选字段

```yaml
env: # 环境变量配置
  variables:
    API_KEY:
      description: 第三方 API 密钥
      required: true
    TIMEOUT:
      description: 请求超时时间（毫秒）
      default: 5000

dependencies: # 依赖项
  npm:
    - package@version
  python:
    - package==version

examples: # 使用示例
  - name: 示例名称
    input:
      paramName: value
    output:
      success: true
      data: {}

changelog: # 变更日志（遵循 Keep a Changelog 规范）
  - version: 1.0.0
    date: '2026-03-02'
    changes:
      - '初始版本'
      - '实现核心功能'
```

## 3. 技能分类体系

### 3.1 一级分类（主类别）

| 分类代码      | 分类名称 | 描述                 |
| ------------- | -------- | -------------------- |
| DIAGNOSIS     | 诊断类   | 故障诊断、问题分析   |
| ESTIMATION    | 估价类   | 设备估价、维修报价   |
| LOCATION      | 定位类   | 店铺查询、位置服务   |
| PARTS         | 配件类   | 配件查询、兼容性检查 |
| DATA          | 数据类   | 数据分析、报表生成   |
| COMMUNICATION | 通信类   | 通知发送、消息推送   |
| AUTOMATION    | 自动化   | 流程自动化、任务编排 |

### 3.2 二级分类（子类别）

**DIAGNOSIS（诊断类）**:

- `DIAGNOSIS.HARDWARE` - 硬件诊断
- `DIAGNOSIS.SOFTWARE` - 软件诊断
- `DIAGNOSIS.NETWORK` - 网络诊断

**ESTIMATION（估价类）**:

- `ESTIMATION.DEVICE` - 设备估价
- `ESTIMATION.REPAIR` - 维修报价
- `ESTIMATION.PARTS` - 配件估价

**LOCATION（定位类）**:

- `LOCATION.SHOP` - 维修店查询
- `LOCATION.SERVICE` - 服务区域查询

**PARTS（配件类）**:

- `PARTS.COMPATIBILITY` - 配件兼容性
- `PARTS.AVAILABILITY` - 配件库存
- `PARTS.PRICE` - 配件价格

### 3.3 标签规范

**技术栈标签**:

- `javascript`, `typescript`, `python`, `nodejs`

**功能标签**:

- `ai-powered`, `real-time`, `batch-processing`, `cache-enabled`

**集成标签**:

- `supabase`, `stripe`, `github-api`, `maps-api`

**质量标签**:

- `tested`, `documented`, `certified`, `community`

## 4. 目录结构规范

### 4.1 标准 Skill 目录结构

```
procyc-{skill-name}/
├── SKILL.md                 # 技能元数据（必需）
├── README.md                # 使用说明（必需）
├── LICENSE                  # 开源许可证（必需）
├── .gitignore
├── package.json             # Node.js 项目（如适用）
├── requirements.txt         # Python 项目（如适用）
├── src/
│   ├── index.ts             # 主入口文件
│   ├── handler.ts           # 技能执行逻辑
│   ├── types.ts             # TypeScript 类型定义
│   └── utils/               # 工具函数
├── tests/
│   ├── unit/                # 单元测试
│   ├── integration/         # 集成测试
│   └── fixtures/            # 测试数据
├── docs/
│   ├── API.md               # API 文档
│   └── EXAMPLES.md          # 使用示例
└── dist/                    # 构建输出目录
```

### 4.2 多语言支持

对于同时支持 JavaScript 和 Python 的技能：

```
procyc-{skill-name}/
├── SKILL.md
├── README.md
├── javascript/
│   ├── package.json
│   ├── src/
│   └── tests/
├── python/
│   ├── requirements.txt
│   ├── setup.py
│   ├── src/
│   └── tests/
└── docs/
```

## 5. 技能调用协议

### 5.1 标准接口

所有 Skill 必须导出标准接口：

**TypeScript:**

```typescript
interface SkillHandler {
  execute(input: Record<string, any>): Promise<SkillOutput>;
}

interface SkillOutput {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
  };
}
```

**Python:**

```python
from typing import Dict, Any

class SkillHandler:
    async def execute(self, input: Dict[str, Any]) -> Dict[str, Any]:
        pass
```

### 5.2 错误码规范

| 错误码    | 说明             |
| --------- | ---------------- |
| SKILL_001 | 输入参数验证失败 |
| SKILL_002 | 技能执行超时     |
| SKILL_003 | 依赖服务不可用   |
| SKILL_004 | 权限不足         |
| SKILL_005 | 配额耗尽         |
| SKILL_006 | 内部错误         |

## 6. 测试要求

### 6.1 测试覆盖率

- 单元测试覆盖率 ≥ 80%
- 关键路径必须有集成测试
- 提供至少 3 个 E2E 测试用例

### 6.2 测试文件命名

- 单元测试：`*.test.ts` 或 `*_test.py`
- 集成测试：`*.integration.ts` 或 `*_integration_test.py`
- E2E 测试：`*.e2e.ts` 或 `*_e2e_test.py`

## 7. 文档要求

### 7.1 README.md 必须包含

- 技能简介
- 安装说明
- 快速开始示例
- API 参考
- 配置说明
- FAQ

### 7.2 代码注释

- 所有公共函数必须有 JSDoc/Docstring
- 复杂逻辑需要有实现说明
- 提供典型使用场景示例

## 8. 版本管理

### 8.1 语义化版本规则

- **MAJOR**: 破坏性变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

### 8.2 发布流程

1. 更新 `SKILL.md` 中的 version 字段
2. 更新 CHANGELOG
3. 创建 Git Tag: `v{version}`
4. 发布到 npm/pypi

## 9. 安全要求

### 9.1 敏感信息管理

- 禁止在代码中硬编码密钥
- 使用环境变量管理敏感配置
- 在 `.gitignore` 中排除 `.env` 文件

### 9.2 输入验证

- 所有输入参数必须验证
- 防止 SQL 注入、XSS 等攻击
- 限制输入大小和复杂度

## 10. 性能要求

### 10.1 响应时间

- P95 延迟 < 2 秒
- 冷启动时间 < 5 秒
- 支持并发调用

### 10.2 资源使用

- 内存占用 < 256MB
- CPU 使用率合理
- 支持水平扩展

## 11. 合规性检查清单

在提交 Skill 之前，请确保：

- [ ] SKILL.md 包含所有必填字段
- [ ] 通过所有单元测试
- [ ] 通过所有集成测试
- [ ] README.md 完整且准确
- [ ] 代码符合 ESLint/Black 规范
- [ ] 没有硬编码的敏感信息
- [ ] 有完整的错误处理
- [ ] 有性能监控埋点

---

**文档版本**: 1.0
**生效日期**: 2026-03-02
**维护者**: ProCyc Core Team
