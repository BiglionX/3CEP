# FixCycle 角色测试账户系统

## 📋 系统概述

本系统提供了FixCycle项目完整的角色权限测试解决方案，包含12个不同角色的测试账户配置、权限映射和自动化验证工具。

## 🎯 覆盖的角色

| 角色 | 权限等级 | 描述 | 测试账户 |
|------|----------|------|----------|
| **admin** | 100 | 超级管理员 | admin@fixcycle.com |
| **manager** | 80 | 业务管理员 | manager@fixcycle.com |
| **content_manager** | 70 | 内容管理员 | content@fixcycle.com |
| **shop_manager** | 70 | 店铺管理员 | shop@fixcycle.com |
| **finance_manager** | 75 | 财务管理员 | finance@fixcycle.com |
| **procurement_specialist** | 60 | 采购专员 | procurement@fixcycle.com |
| **warehouse_operator** | 50 | 仓库操作员 | warehouse@fixcycle.com |
| **agent_operator** | 55 | 智能体操作员 | agent@fixcycle.com |
| **viewer** | 30 | 只读查看员 | viewer@fixcycle.com |
| **enterprise_admin** | 85 | 企业服务管理员 | enterprise-admin@fixcycle.com |
| **procurement_manager** | 75 | 采购经理 | procurement-manager@fixcycle.com |
| **enterprise_user** | 40 | 企业用户 | enterprise-user@fixcycle.com |

## 📁 文件结构

```
test-accounts/
├── complete-role-accounts.json      # 完整角色账户配置（核心文件）
├── role-permissions-map.json        # 权限映射和验证规则
├── generated-test-data.json         # 自动生成的测试数据
├── ROLE_TESTING_GUIDE.md           # 详细使用指南
├── generate-test-data.js           # 测试数据生成器
├── validate-role-permissions.js    # 权限验证脚本
├── run-role-tests.bat             # Windows一键执行脚本
├── admin-accounts.json            # 现有的管理员账户
└── README.md                      # 本文件
```

## 🚀 快速开始

### 方法一：一键执行（推荐）

```bash
# Windows环境下
cd test-accounts
run-role-tests.bat
```

### 方法二：手动执行

```bash
# 1. 生成测试数据
cd test-accounts
node generate-test-data.js

# 2. 执行权限验证
node validate-role-permissions.js
```

### 方法三：运行Playwright测试

```bash
# 运行所有角色测试
npx playwright test tests/e2e/roles/

# 运行特定角色测试
npx playwright test tests/e2e/roles/role-admin-e2e.spec.ts
```

## 🔧 配置说明

### 环境变量

```bash
# 测试环境配置
TEST_ENV=development          # development|test|production
TEST_BASE_URL=http://localhost:3001
HEADLESS=true                 # 是否无头模式运行
TEST_TIMEOUT=30000           # 超时时间(ms)
```

### 测试环境URL

- **开发环境**: http://localhost:3001
- **测试环境**: http://localhost:3003 (企业版)
- **生产环境**: https://fixcycle.com

## 🧪 测试内容

每个角色的测试包括：

1. **认证测试**
   - 登录功能验证
   - Token获取和验证
   - 会话管理测试

2. **权限测试**
   - API接口访问权限
   - Web界面功能权限
   - 菜单项目显示控制

3. **边界测试**
   - 未授权访问拒绝
   - 权限边界验证
   - 数据隔离测试

## 📊 测试报告

执行测试后会生成详细的JSON格式报告：

```json
{
  "generatedAt": "2026-02-26T10:00:00Z",
  "summary": {
    "totalRoles": 12,
    "totalTests": 156,
    "passedTests": 148,
    "failedTests": 8,
    "passRate": "94.87%"
  },
  "roleResults": {
    "admin": { /* 详细结果 */ },
    "manager": { /* 详细结果 */ }
    // ... 其他角色
  }
}
```

## 🔒 安全注意事项

⚠️ **重要提醒**

1. **仅限测试环境使用** - 这些账户仅供开发和测试使用
2. **定期轮换密码** - 建议每月更新测试密码
3. **不要提交生产数据** - 避免在生产环境使用测试账户
4. **及时清理测试数据** - 测试完成后删除产生的测试数据

## 🛠️ 故障排除

### 常见问题

**Q: 测试显示401/403错误**
A: 检查用户角色是否正确分配，RBAC配置是否同步

**Q: Playwright测试找不到元素**
A: 确认页面加载完成，检查data-testid属性是否正确

**Q: API测试超时**
A: 检查服务是否正常运行，网络连接是否稳定

**Q: 权限验证失败**
A: 对比expected_permissions和实际分配的权限

### 调试技巧

```bash
# 启用详细日志
DEBUG=playwright:* npm run test:e2e:roles

# 有头模式运行（可视化调试）
HEADLESS=false npm run test:e2e:roles

# 运行单个测试文件
npx playwright test tests/e2e/roles/role-admin-e2e.spec.ts --headed
```

## 📈 CI/CD集成

在持续集成流程中添加权限测试：

```yaml
# GitHub Actions 示例
- name: Run Role Permission Tests
  run: |
    cd test-accounts
    node validate-role-permissions.js
  env:
    TEST_ENV: test
    TEST_BASE_URL: ${{ secrets.TEST_BASE_URL }}
```

## 🆕 更新日志

### v1.0.0 (2026-02-26)
- ✅ 初始化完整角色测试账户系统
- ✅ 支持12个不同角色的权限测试
- ✅ 自动生成Playwright测试脚本
- ✅ 提供自动化验证工具
- ✅ 包含详细使用文档

## 📞 技术支持

如有问题或建议，请：
1. 查看ROLE_TESTING_GUIDE.md获取详细信息
2. 检查生成的测试报告定位具体问题
3. 联系项目维护团队

---
*最后更新: 2026-02-26*