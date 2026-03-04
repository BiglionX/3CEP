# ProCyc Skill GitHub 组织规划方案

**版本**: 1.0
**日期**: 2026-03-02
**状态**: 规划中

## 一、组织架构设计

### 1.1 组织名称

**建议名称**: `procyc-skills`

**备选名称**:

- `procyc-ecosystem`
- `procyc-community`
- `procyc-labs`

### 1.2 组织定位

专注于 ProCyc Skill 生态的开发者组织，包含：

- 官方技能仓库
- 社区贡献技能
- 工具和基础设施
- 文档和规范

## 二、仓库结构规划

### 2.1 核心仓库

#### 官方技能仓库

| 仓库名称                 | 说明             | 可见性 | 维护者    |
| ------------------------ | ---------------- | ------ | --------- |
| `skill-template`         | Skill 项目模板   | Public | Core Team |
| `procyc-find-shop`       | 附近店铺查询技能 | Public | Core Team |
| `procyc-fault-diagnosis` | 故障诊断技能     | Public | Core Team |
| `procyc-part-lookup`     | 配件查询技能     | Public | Core Team |
| `procyc-estimate-value`  | 设备估价技能     | Public | Core Team |

#### 工具链仓库

| 仓库名称  | 说明             | 可见性 | 维护者        |
| --------- | ---------------- | ------ | ------------- |
| `cli`     | ProCyc CLI 工具  | Public | Tooling Team  |
| `docs`    | 文档和规范       | Public | Docs Team     |
| `sdk`     | Skill 开发 SDK   | Public | Core Team     |
| `runtime` | Skill 运行时环境 | Public | Platform Team |

#### 基础设施仓库

| 仓库名称    | 说明           | 可见性  | 维护者        |
| ----------- | -------------- | ------- | ------------- |
| `.github`   | 组织级配置文件 | Public  | DevOps Team   |
| `registry`  | Skill 注册中心 | Private | Platform Team |
| `analytics` | 数据分析平台   | Private | Data Team     |
| `billing`   | 计费系统       | Private | Platform Team |

### 2.2 社区技能仓库

社区贡献的技能采用统一命名规范：

```
procyc-{skill-name}-{language}
```

示例：

- `procyc-battery-test-js` - 电池检测技能 (JavaScript)
- `procyc-screen-diagnosis-py` - 屏幕诊断技能 (Python)
- `procyc-price-tracker` - 价格追踪技能

### 2.3 实验性仓库

用于创新和概念验证：

| 仓库名称               | 说明           | 可见性 |
| ---------------------- | -------------- | ------ |
| `labs-ai-assistant`    | AI 助手实验    | Public |
| `labs-blockchain-cert` | 区块链认证探索 | Public |
| `labs-iot-integration` | IoT 设备集成   | Public |

## 三、团队结构

### 3.1 角色定义

#### Organization Owner (组织所有者)

- 权限：所有管理权限
- 职责：组织战略、最终决策
- 人数：2-3 人

#### Team Maintainer (团队维护者)

- 权限：仓库管理、成员邀请
- 职责：代码审核、发布审批
- 人数：每个团队 2-3 人

#### Core Contributor (核心贡献者)

- 权限：直接提交代码
- 职责：功能开发、Bug 修复
- 人数：不限（根据能力）

#### Community Member (社区成员)

- 权限：Fork、PR、Issue
- 职责：参与讨论、提交 PR
- 人数：无限制

### 3.2 团队划分

```
procyc-skills (Organization)
│
├── Core Team (核心团队)
│   ├── skill-template
│   ├── cli
│   └── sdk
│
├── Platform Team (平台团队)
│   ├── runtime
│   ├── registry
│   └── billing
│
├── Docs Team (文档团队)
│   └── docs
│
├── DevOps Team (运维团队)
│   ├── .github
│   └── monitoring
│
└── Community (社区)
    ├── official-skills
    └── community-skills
```

## 四、权限管理

### 4.1 仓库权限级别

| 权限级别 | 说明             | 适用场景         |
| -------- | ---------------- | ---------------- |
| Read     | 只读访问         | 普通用户、观察者 |
| Triage   | 管理 Issue 和 PR | 社区管理者       |
| Write    | 推送代码         | 活跃贡献者       |
| Maintain | 管理仓库设置     | 维护者           |
| Admin    | 完全控制         | 所有者           |

### 4.2 分支保护策略

#### main 分支保护规则

```yaml
# .github/branch-protection.yml
protection:
  required_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true

  required_status_checks:
    strict: true
    contexts:
      - 'validate'
      - 'test'
      - 'build'

  enforce_admins: true
  required_linear_history: true
  allow_force_pushes: false
  allow_deletions: false
```

#### develop 分支保护规则

```yaml
protection:
  required_pull_request_reviews:
    required_approving_review_count: 1

  required_status_checks:
    strict: true
    contexts:
      - 'validate'
      - 'test'
```

### 4.3 CODEOWNERS 文件

```
# .github/CODEOWNERS

# 默认审核人
* @procyc-skills/core-maintainers

# CLI 工具
/tools/procyc-cli/ @procyc-skills/tooling-team

# 文档
/docs/ @procyc-skills/docs-team

# 模板
/templates/ @procyc-skills/core-maintainers

# 测试
/tests/ @procyc-skills/qa-team
```

## 五、工作流程

### 5.1 技能发布流程

```mermaid
graph LR
    A[开发者创建 Skill] --> B[本地开发和测试]
    B --> C[提交 PR 到 skill-template]
    C --> D[CI/CD自动检查]
    D --> E[人工代码审核]
    E --> F[审核通过合并]
    F --> G[自动发布到 npm/pypi]
    G --> H[添加到技能商店]
```

### 5.2 Issue 管理流程

#### Issue 标签体系

| 标签               | 说明       | 颜色    |
| ------------------ | ---------- | ------- |
| `bug`              | Bug 报告   | #d73a4a |
| `feature`          | 新功能请求 | #a2eeef |
| `documentation`    | 文档改进   | #0075ca |
| `help wanted`      | 需要帮助   | #008672 |
| `good first issue` | 适合新手   | #7057ff |
| `question`         | 问题咨询   | #d876e3 |
| `discussion`       | 讨论议题   | #cfd3d7 |
| `priority:high`    | 高优先级   | #b60205 |
| `priority:medium`  | 中优先级   | #ff9f1c |
| `priority:low`     | 低优先级   | #cccccc |

#### Issue 模板

创建多种 Issue 模板：

- Bug Report
- Feature Request
- Documentation Improvement
- Question

### 5.3 Release 流程

#### 版本号规则

遵循语义化版本规范：

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: 破坏性变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

#### 发布步骤

1. 创建 Release Branch
2. 更新 CHANGELOG.md
3. 运行完整测试套件
4. 打 Tag: `v{version}`
5. 推送到 GitHub
6. 触发自动发布流程
7. 发布 Release Notes

## 六、自动化配置

### 6.1 GitHub Actions

#### 自动欢迎新贡献者

```yaml
# .github/workflows/welcome.yml
name: Welcome New Contributors

on:
  pull_request_target:
    types: [opened]

jobs:
  welcome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/first-interaction@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          pr-message: |
            欢迎首次贡献 ProCyc Skill! 🎉

            请确保：
            - ✅ 阅读了贡献指南
            - ✅ 填写了 PR 模板
            - ✅ 所有测试通过

            我们会尽快审核你的代码。感谢你的贡献！
```

#### 自动标记过期 Issue

```yaml
# .github/workflows/stale.yml
name: Mark Stale Issues

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v8
        with:
          stale-issue-message: '此 Issue 因长时间无活动被标记为过期'
          days-before-stale: 30
          days-before-close: 7
          exempt-issue-labels: 'priority:high,bug'
```

### 6.2 Dependabot 配置

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
```

## 七、品牌与视觉识别

### 7.1 Logo 设计

建议使用统一的 Skill Logo：

- 基于 ProCyc 主品牌
- 体现技能和连接的概念
- 简洁易识别

### 7.2 README 徽章

标准徽章组合：

```markdown
![Version](https://img.shields.io/npm/v/procyc-skill.svg)
![License](https://img.shields.io/npm/l/procyc-skill.svg)
![Downloads](https://img.shields.io/npm/dm/procyc-skill.svg)
![Build Status](https://github.com/procyc-skills/skill/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/procyc-skills/skill/branch/main/graph/badge.svg)
```

## 八、安全策略

### 8.1 安全政策文件

```markdown
# SECURITY.md

## 报告安全问题

如发现安全漏洞，请通过以下方式报告：

📧 Email: security@procyc.com
🔒 加密 PGP Key: [链接]

请勿在公开 Issue 中披露安全漏洞。

## 安全响应流程

1. 接收报告（24 小时内响应）
2. 评估和确认（3-5 个工作日）
3. 开发和测试修复
4. 发布安全公告
5. 致谢报告者
```

### 8.2 依赖扫描

启用 GitHub Advanced Security：

- Code scanning (CodeQL)
- Secret scanning
- Dependency review

## 九、治理模式

### 9.1 决策机制

#### 日常决策

- 由相应团队的 Maintainer 决定
- 通过 PR 评论和投票

#### 重大决策

- 需要 Core Team 讨论
- RFC (Request for Comments) 流程
- 社区公示期（至少 7 天）

### 9.2 RFC 流程

重大变更需经过 RFC 流程：

1. 提交 RFC 文档到 `procyc-skills/rfcs`
2. 社区讨论（最少 7 天）
3. Core Team 审核
4. 投票表决（2/3 多数通过）
5. 实施和发布

## 十、实施时间表

### 阶段一：基础建设（第 1-2 周）

- [ ] 创建 GitHub 组织
- [ ] 建立核心仓库
- [ ] 配置组织设置
- [ ] 邀请初始团队成员

### 阶段二：工具链完善（第 3-4 周）

- [ ] 部署 CLI 工具
- [ ] 配置 CI/CD流水线
- [ ] 设置自动化流程
- [ ] 创建示例技能

### 阶段三：社区启动（第 5-8 周）

- [ ] 发布官方文档
- [ ] 举办线上发布会
- [ ] 启动首批社区技能征集
- [ ] 建立激励机制

### 阶段四：生态发展（第 9-12 周）

- [ ] 审核第一批社区技能
- [ ] 收集反馈并优化流程
- [ ] 扩大贡献者群体
- [ ] 定期技术分享

## 十一、成功指标

### 11.1 短期指标（3 个月）

- 官方技能数量 ≥ 5 个
- 社区贡献技能 ≥ 10 个
- 月活跃贡献者 ≥ 20 人
- GitHub Star 总数 ≥ 500

### 11.2 中期指标（6 个月）

- 技能总下载量 ≥ 10,000 次
- 月度技能调用量 ≥ 100,000 次
- 核心贡献者 ≥ 10 人
- 文档完整性 ≥ 90%

### 11.3 长期指标（12 个月）

- 生态系统技能 ≥ 100 个
- 注册开发者 ≥ 1,000 人
- 企业用户 ≥ 50 家
- 月均技能交易额 ≥ $10,000

## 十二、风险管理

### 12.1 潜在风险

| 风险             | 影响 | 概率 | 缓解措施             |
| ---------------- | ---- | ---- | -------------------- |
| 贡献者不活跃     | 高   | 中   | 激励机制、培训       |
| 技能质量参差不齐 | 高   | 高   | 严格审核、认证体系   |
| 安全问题         | 高   | 低   | 安全审查、漏洞奖励   |
| 法律合规风险     | 中   | 低   | 法律顾问、许可证审查 |
| 技术债务累积     | 中   | 中   | 定期重构、代码审查   |

## 十三、预算估算

### 13.1 基础设施成本（月度）

| 项目       | 费用           | 说明         |
| ---------- | -------------- | ------------ |
| GitHub Pro | $4/user/mo     | 组织管理功能 |
| Vercel/VPS | $20-50/mo      | 网站托管     |
| npm Pro    | $7/mo          | 包管理       |
| 其他服务   | $20-30/mo      | 监控、分析等 |
| **总计**   | **$50-100/mo** | 初期规模     |

### 13.2 激励预算（年度）

| 项目           | 预算           | 说明       |
| -------------- | -------------- | ---------- |
| Hackathon 奖金 | $5,000/年      | 2 次活动   |
| 优秀贡献者奖励 | $3,000/年      | 季度评选   |
| 文档翻译资助   | $2,000/年      | 多语言支持 |
| **总计**       | **$10,000/年** | 社区建设   |

---

**审批**: 待审批
**下一步**: 创建 GitHub 组织并实施本方案
