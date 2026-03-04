# 企业用户端E2E测试套件

## 概述

这是一个专门为FixCycle项目企业用户端设计的端到端测试套件，涵盖了功能测试、权限验证、API测试、性能基准测试和安全测试等多个维度。

## 目录结构

```
tests/e2e/enterprise/
├── config/                    # 测试配置文件
│   └── test-env-config.ts    # 环境和全局配置
├── data/                      # 测试数据管理
│   └── test-data-manager.ts  # 测试数据创建和清理工具
├── fixtures/                  # Playwright Fixture配置
│   └── enterprise-fixture.ts # 企业服务测试Fixture
├── utils/                     # 测试工具类
│   └── test-utils.ts         # 企业测试辅助工具
├── functional/                # 功能测试用例
├── permission/                # 权限测试用例
├── api/                       # API接口测试用例
├── performance/               # 性能测试用例
├── security/                  # 安全测试用例
├── enterprise.config.ts       # 企业测试核心配置
└── index.ts                   # 主入口文件
```

## 快速开始

### 1. 环境准备

确保以下服务正在运行：

- 应用服务：http://localhost:3003
- 数据库服务
- Redis服务（如需要）

### 2. 安装依赖

```bash
npm install
```

### 3. 运行测试

```bash
# 运行所有企业端到端测试
npm run test:e2e:enterprise

# 运行功能测试
npm run test:e2e:enterprise:functional

# 运行权限测试
npm run test:e2e:enterprise:permission

# 运行API测试
npm run test:e2e:enterprise:api

# 运行性能测试
npm run test:e2e:enterprise:performance

# 运行安全测试
npm run test:e2e:enterprise:security
```

### 4. 查看测试报告

```bash
# 打开HTML测试报告
npx playwright show-report test-results/html-report

# 查看JSON测试结果
cat test-results/enterprise-e2e-results.json
```

## 测试配置

### 环境变量

```bash
# 测试环境配置
TEST_ENV=test                    # 测试环境 (development|test|production)
TEST_BASE_URL=http://localhost:3003  # 应用基础URL
TEST_API_BASE_URL=http://localhost:3003/api  # API基础URL

# 测试执行配置
HEADLESS=false                   # 是否无头模式运行
MAX_CONCURRENT_TESTS=4           # 最大并发测试数

# 报告和日志配置
SCREENSHOT_ON_FAILURE=true       # 失败时截图
RECORD_VIDEO=false               # 录制测试视频
LOGGING_ENABLED=true             # 启用日志记录

# 性能和安全配置
COLLECT_PERFORMANCE_METRICS=true # 收集性能指标
VERIFY_SECURITY_HEADERS=false    # 验证安全头
```

### Playwright配置

测试项目已在`playwright.config.ts`中配置了以下测试项目：

- `enterprise-functional-tests`: 功能测试
- `enterprise-permission-tests`: 权限测试
- `enterprise-api-tests`: API测试
- `enterprise-mobile-tests`: 移动端测试

## 测试类型说明

### 1. 功能测试 (Functional Tests)

测试企业用户端的核心功能：

- 企业服务门户页面访问
- 用户注册和登录流程
- 企业管理后台功能
- 智能体服务操作
- 采购管理功能
- 配件管理系统

### 2. 权限测试 (Permission Tests)

验证RBAC权限控制系统：

- 角色权限分配验证
- 访问控制边界测试
- 越权访问防护
- 权限继承关系验证

### 3. API测试 (API Tests)

验证RESTful API接口：

- 认证相关接口
- 业务逻辑接口
- 数据管理接口
- 错误处理验证

### 4. 性能测试 (Performance Tests)

性能基准测试：

- 页面加载时间
- API响应时间
- 并发用户支持
- 资源使用监控

### 5. 安全测试 (Security Tests)

安全防护验证：

- 输入验证测试
- XSS攻击防护
- SQL注入防护
- CSRF防护验证

## 测试数据管理

### 测试账户

系统预定义了以下测试角色：

| 角色               | 邮箱                       | 密码          | 权限范围       |
| ------------------ | -------------------------- | ------------- | -------------- |
| admin              | admin@enterprise.com       | Admin123456   | 完全访问权限   |
| procurementManager | procurement@enterprise.com | Procure123456 | 采购相关权限   |
| agentOperator      | agent@enterprise.com       | Agent123456   | 智能体操作权限 |
| regularUser        | user@enterprise.com        | User123456    | 基础访问权限   |

### 测试数据清理

测试会自动清理创建的测试数据，也可手动清理：

```bash
# 清理测试数据
node scripts/cleanup-test-data.js
```

## CI/CD集成

### GitHub Actions配置示例

```yaml
name: Enterprise E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Start services
        run: |
          npm run dev &
          sleep 10
      - name: Run E2E tests
        run: npm run test:e2e:enterprise
      - name: Upload test results
        uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 质量门禁

测试套件包含以下质量门禁：

- **功能测试通过率**: ≥ 95%
- **安全漏洞**: 0个高危漏洞
- **性能指标**: 满足预设KPI要求
- **测试覆盖率**: ≥ 80%

## 故障排除

### 常见问题

1. **测试环境无法访问**

   ```bash
   # 检查服务状态
   curl http://localhost:3003/health

   # 重启开发服务器
   npm run dev
   ```

2. **测试数据冲突**

   ```bash
   # 清理测试数据
   npm run test:e2e:enterprise -- --clean
   ```

3. **权限验证失败**
   ```bash
   # 重新初始化测试账户
   node scripts/init-test-users.js
   ```

### 调试技巧

```bash
# 运行单个测试文件
npx playwright test tests/e2e/enterprise/functional/portal.spec.ts

# 以UI模式运行测试
npx playwright test --ui

# 详细日志输出
DEBUG=pw:api npm run test:e2e:enterprise
```

## 贡献指南

### 添加新的测试用例

1. 在相应目录下创建测试文件
2. 使用提供的Fixture和工具类
3. 遵循现有的测试模式
4. 确保测试数据的清理

### 测试命名规范

```
[模块]-[功能]-[测试类型].spec.ts
例如: portal-homepage-functional.spec.ts
```

## 版本历史

- **v1.0.0** (2026-02-26): 初始版本发布

## 许可证

MIT License
