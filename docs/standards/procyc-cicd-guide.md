# ProCyc Skill CI/CD 配置指南

**版本**: 1.0
**日期**: 2026-03-02
**状态**: 已发布

## 一、概述

本文档详细说明 ProCyc Skill 项目的持续集成和持续部署 (CI/CD) 配置方案。

## 二、CI/CD 架构

### 2.1 流水线设计

```mermaid
graph LR
    A[代码提交] --> B[触发 CI]
    B --> C[代码检查]
    C --> D[单元测试]
    D --> E[构建]
    E --> F[制品存储]
    F --> G{是否 Release?}
    G -->|是 | H[发布到 npm/pypi]
    G -->|否 | I[等待下次发布]
    H --> J[创建 GitHub Release]
```

### 2.2 触发条件

| 事件            | 触发的流水线 | 说明           |
| --------------- | ------------ | -------------- |
| Push to main    | Full CI + CD | 生产环境发布   |
| Push to develop | Full CI      | 预发布环境测试 |
| Pull Request    | PR Check CI  | 代码审查支持   |
| Tag Created     | Release CI   | 版本发布流程   |

## 三、GitHub Actions 配置

### 3.1 基础 CI 工作流

```yaml
# .github/workflows/ci.yml
name: ProCyc Skill CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. 验证阶段
  validate:
    name: Validate Configuration
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install ProCyc CLI
        run: npm install -g @procyc/cli

      - name: Validate SKILL.md
        run: procyc-skill validate --strict

      - name: ESLint check
        run: npm run lint --if-present

  # 2. 测试阶段
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: validate

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: false

  # 3. 构建阶段
  build:
    name: Build Artifacts
    runs-on: ubuntu-latest
    needs: [validate, test]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ github.sha }}
          path: dist/
          retention-days: 30
```

### 3.2 发布工作流

```yaml
# .github/workflows/release.yml
name: Release and Publish

on:
  push:
    tags:
      - 'v*' # 匹配 v1.0.0, v2.1.3 等标签

jobs:
  # 1. 质量门禁检查
  quality-gates:
    name: Quality Gates
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run all checks
        run: |
          npm run lint
          npm test
          npm run build

      - name: Check test coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Test coverage ($COVERAGE%) is below 80%"
            exit 1
          fi

  # 2. 发布到 npm
  publish-npm:
    name: Publish to npm
    runs-on: ubuntu-latest
    needs: quality-gates

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Verify publication
        run: |
          PACKAGE_NAME=$(node -p "require('./package.json').name")
          PACKAGE_VERSION=$(node -p "require('./package.json').version")
          npm view $PACKAGE_NAME@$PACKAGE_VERSION > /dev/null && echo "Published successfully"

  # 3. 创建 GitHub Release
  create-release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: publish-npm

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        uses: mikepenz/release-changelog-builder-action@v3
        with:
          configurationJson: |
            {
              "template": "#{{CHANGELOG}}\n\n## Changes\n#{{UNCATEGORIZED}}",
              "categories": [
                {
                  "title": "🚀 Features",
                  "labels": ["feature", "feat"]
                },
                {
                  "title": "🐛 Bug Fixes",
                  "labels": ["fix", "bug"]
                },
                {
                  "title": "📝 Documentation",
                  "labels": ["docs", "documentation"]
                },
                {
                  "title": "🧪 Tests",
                  "labels": ["test"]
                }
              ]
            }

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # 4. 通知（可选）
  notify:
    name: Send Notification
    runs-on: ubuntu-latest
    needs: create-release
    if: always()

    steps:
      - name: Send Discord notification
        uses: Ilshidur/action-discord@master
        if: ${{ needs.create-release.result == 'success' }}
        with:
          args: '✅ {{ event.repository.name }} v{{ event.release.tag_name }} 已发布！查看：{{ event.release.html_url }}'
        env:
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}

      - name: Send Telegram notification
        uses: appleboy/telegram-action@master
        if: ${{ needs.create-release.result == 'failure' }}
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            ❌ 发布失败！
            仓库：{{ GITHUB_REPOSITORY }}
            版本：{{ GITHUB_REF }}
            详情：{{ GITHUB_SERVER_URL }}/{{ GITHUB_REPOSITORY }}/actions/runs/{{ GITHUB_RUN_ID }}
```

### 3.3 自动化维护工作流

#### 自动标记过期 Issue

```yaml
# .github/workflows/stale.yml
name: Mark Stale Issues and PRs

on:
  schedule:
    - cron: '0 0 * * *' # 每天运行

jobs:
  stale:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/stale@v8
        with:
          # Issue 设置
          stale-issue-message: |
            此 Issue 已经 30 天没有活动。如果问题仍然存在，请回复以重新激活。
            否则将在 7 天后自动关闭。
          close-issue-message: '此 Issue 因长时间无活动已被自动关闭'
          days-before-issue-stale: 30
          days-before-issue-close: 7

          # PR 设置
          stale-pr-message: |
            此 PR 已经 14 天没有活动。如果需要继续合并，请解决待处理的问题或更新代码。
            否则将在 7 天后自动关闭。
          close-pr-message: '此 PR 因长时间无活动已被自动关闭'
          days-before-pr-stale: 14
          days-before-pr-close: 7

          # 豁免标签
          exempt-issue-labels: 'priority:high,bug,pinned'
          exempt-pr-labels: 'work-in-progress,pinned'

          # 操作限制
          operations-per-run: 50
          remove-stale-when-updated: true
```

#### 依赖自动更新

```yaml
# .github/dependabot.yml
version: 2
updates:
  # npm 依赖
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '09:00'
      timezone: 'Asia/Shanghai'
    open-pull-requests-limit: 10
    reviewers:
      - 'maintainers'
    labels:
      - 'dependencies'
      - 'automated'
    commit-message:
      prefix: 'chore(deps)'
    groups:
      production-dependencies:
        dependency-type: 'production'
      development-dependencies:
        dependency-type: 'development'

  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
    labels:
      - 'ci/cd'
      - 'automated'
    commit-message:
      prefix: 'chore(ci)'
```

#### 自动欢迎新贡献者

```yaml
# .github/workflows/welcome.yml
name: Welcome New Contributors

on:
  pull_request_target:
    types: [opened]
  issues:
    types: [opened]

jobs:
  welcome-message:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/first-interaction@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          pr-message: |
            👋 欢迎首次为 ProCyc Skill 做贡献！

            📋 **下一步操作**:
            1. 确认已填写 [PR 模板](.github/PULL_REQUEST_TEMPLATE.md)
            2. 确保所有 CI 检查通过
            3. 等待团队成员审核

            💡 **提示**:
            - 阅读 [贡献指南](CONTRIBUTING.md)
            - 加入我们的 [Discord 社区](链接)

            感谢你的贡献！🎉

          issue-message: |
            👋 感谢提交 Issue!

            📝 **处理流程**:
            1. 团队成员会尽快审查（通常 1-3 个工作日）
            2. 可能需要更多信息或复现步骤
            3. 确认后会标记并分配处理

            🔍 ** meanwhile**:
            - 搜索是否有类似 Issue
            - 补充详细信息和复现步骤

            感谢帮助改进 ProCyc Skill! 🙏
```

## 四、代码质量工具

### 4.1 ESLint 配置

```json
// .eslintrc.json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": "off",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ]
  }
}
```

### 4.2 Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

### 4.3 Husky + lint-staged

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{md,json,yml}": ["prettier --write"]
  }
}
```

## 五、测试策略

### 5.1 测试金字塔

```
        /\
       /  \
      / E2E \      (10%)
     /______\
    /        \
   /Integration\   (20%)
  /______________\
 /                \
/    Unit Tests    \ (70%)
\__________________/
```

### 5.2 Jest 配置

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['./tests/setup.ts'],
};
```

### 5.3 测试脚本

```javascript
// tests/setup.ts
import { configure } from '@testing-library/dom';

configure({
  testIdAttribute: 'data-testid',
});

// 全局 Mock
global.fetch = jest.fn();
global.console.error = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});
```

## 六、环境管理

### 6.1 环境变量

```bash
# .env.example
# 开发环境
NODE_ENV=development
PORT=3000

# API 密钥（示例）
API_KEY=your_api_key_here

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# 发布配置
NPM_TOKEN=npm_xxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

### 6.2 GitHub Secrets 配置

在 GitHub 仓库设置中配置以下 Secrets：

| Secret 名称          | 说明                 | 获取方式                               |
| -------------------- | -------------------- | -------------------------------------- |
| `NPM_TOKEN`          | npm 发布令牌         | `npm login` 后查看 ~/.npmrc            |
| `GITHUB_TOKEN`       | GitHub API 令牌      | 自动提供，无需手动配置                 |
| `DISCORD_WEBHOOK`    | Discord 通知 Webhook | Discord Server Settings > Integrations |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token   | @BotFather                             |
| `TELEGRAM_CHAT_ID`   | Telegram 聊天 ID     | 从 Bot 获取                            |

## 七、监控与告警

### 7.1 构建监控

```yaml
# .github/workflows/monitoring.yml
name: CI Monitoring

on:
  workflow_run:
    workflows: ['ProCyc Skill CI']
    types: [completed]

jobs:
  analyze-failure:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}

    steps:
      - name: Analyze failure
        run: |
          echo "Workflow failed: ${{ github.event.workflow_run.name }}"
          echo "Check the logs: ${{ github.event.workflow_run.html_url }}"

      - name: Create issue for failure
        uses: peter-evans/create-issue-from-file@v4
        with:
          title: '🚨 CI Failed: ${{ github.event.workflow_run.name }}'
          content-filepath: .github/ISSUE_TEMPLATE/ci-failure.md
          assignees: devops-team
```

### 7.2 性能基线

```javascript
// tests/performance/baseline.js
export const performanceBaseline = {
  // 单元测试执行时间
  unitTests: {
    maxDuration: 30000, // 30 秒
    minCoverage: 80, // 80%
  },

  // 构建时间
  build: {
    maxDuration: 60000, // 60 秒
  },

  // 关键函数性能
  criticalFunctions: {
    handleRequest: {
      p95: 500, // P95 < 500ms
      p99: 1000, // P99 < 1000ms
    },
  },
};
```

## 八、最佳实践

### 8.1 优化 CI 速度

1. **缓存依赖**

   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **并行执行**

   ```yaml
   strategy:
     matrix:
       node-version: [16.x, 18.x, 20.x]
   ```

3. **按需运行**
   ```yaml
   paths-ignore:
     - '**.md'
     - 'docs/**'
   ```

### 8.2 安全实践

1. **最小权限原则**

   ```yaml
   permissions:
     contents: read
     packages: write
   ```

2. **PIN Actions**

   ```yaml
   - uses: actions/checkout@f43a0e5ff2bd294095638e18286ca9a3d1956744 # v3.6.0
   ```

3. **Secret 扫描**
   启用 GitHub secret scanning 功能

### 8.3 成本控制

1. **限制并发作业数**

   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```

2. **优化 Runner 使用**
   - 选择合适的 runner 类型
   - 避免不必要的长时间运行

## 九、故障排查

### 9.1 常见问题

#### Q1: CI 执行缓慢

**排查步骤**:

1. 检查是否需要清理缓存
2. 查看哪个步骤耗时最长
3. 考虑增加并行度
4. 优化依赖安装策略

#### Q2: 测试随机失败

**解决方案**:

1. 检查是否有竞态条件
2. 确保测试隔离
3. 添加适当的重试机制
4. 增加超时时间

#### Q3: 发布失败

**排查清单**:

- ✅ NPM_TOKEN 是否正确
- ✅ 版本号是否已存在
- ✅ 构建产物是否完整
- ✅ 网络连接是否正常

### 9.2 调试技巧

1. **启用调试日志**

   ```yaml
   env:
     ACTIONS_STEP_DEBUG: true
   ```

2. **SSH 调试 Runner**
   ```yaml
   - name: Setup tmate session
     if: ${{ failure() }}
     uses: mxschmitt/action-tmate@v3
   ```

## 十、附录

### 10.1 完整配置示例

完整的 `.github/workflows/ci.yml` 请参考：
[skill-template/.github/workflows/ci.yml](../../templates/skill-template/.github/workflows/ci.yml)

### 10.2 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [ProCyc Skill 规范](./procyc-skill-spec.md)
- [测试最佳实践](https://testing-library.com/docs/react-testing-library/intro/)

---

**维护者**: ProCyc DevOps Team
**更新日期**: 2026-03-02
**下次审查**: 2026-06-02
