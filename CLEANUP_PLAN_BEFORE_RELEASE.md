# 发版前文件夹结构清理方案

## 🎯 清理目标

- 删除空目录和无效目录
- 清理临时文件和备份文件
- 规范化目录命名
- 优化文档组织结构

---

## 📁 第一类：需删除的空目录

### 根目录空目录

```bash
-p/
compliance}/
components/          # 注意：src/components/ 正常使用
customers}/
dashboard/
diagnostics}/
lib/                 # 注意：src/lib/ 正常使用
logistics/
pricing/
procurement/
settings}/
shipping/
suppliers/
trading/
work-orders/
```

### 空的备份目录

```bash
backups/migrations/
```

---

## 🗑️ 第二类：需删除的临时文件 (根目录)

### 0KB 临时文件

```bash
direct-fix.js
final-verification.js
login-content.txt
login-dom.html
login-page.html
quick-fix-instructions.txt
s.status
{ ^
```

### 测试相关的临时文件

```bash
temp-auth-fix.js
test-import.ts
test-n8n-iframe.html
test-tenant-api-fix.ts
```

---

## 📦 第三类：备份目录处理

### 可归档的备份目录

```bash
backup/procyc-upgrade-1771819713196/
docs-backup-20260301-183652/
test-backup-20260301-183120/
```

**建议**:

- 如果这些备份不再需要，可以删除
- 如果需要保留，移动到 `archive/backups/` 目录统一管理

---

## 📚 第四类：文档优化

### 根目录报告文件归档

将以下类型的报告移动到 `docs/reports/archive/`:

#### 完成报告类

```bash
AGENT_MARKETPLACE_ATOMIC_TASKS_COMPLETION_REPORT.md
AGENT_MARKETPLACE_DOCUMENTATION_COMPLETION_REPORT.md
AGENT_MARKETPLACE_PHASE3_IMPLEMENTATION_REPORT.md
PHASE3_ATOMIC_TASKS_COMPLETION_REPORT.md
PHASE3_IMPLEMENTATION_REPORT.md
PHASE4_IMPLEMENTATION_COMPLETION_REPORT.md
PHASE5_FINAL_COMPLETION_REPORT.md
PHASE5_IMPLEMENTATION_COMPLETION_REPORT.md
PROCYSKILL_PHASE2_COMPLETE.md
MARKETING_IMPLEMENTATION_COMPLETE.md
```

#### 测试报告类

```bash
E2E_TESTING_IMPLEMENTATION_SUMMARY.md
E2E_TEST_EXECUTION_STATUS.md
FINAL_E2E_TEST_EXECUTION_REPORT.md
FINAL_FOREIGN_TRADE_PLATFORM_TEST_REPORT.md
FINAL_LOGIN_TEST_REPORT.md
functional-test-report.json (对应的 md 文件)
foreign-trade-platform-test-report.json (对应的 md 文件)
```

#### 修复报告类

```bash
COMPREHENSIVE_AUTH_FIX.md
EMERGENCY_AUTH_FIX.md
EMERGENCY_REPAIR_GUIDE.md
ACCESS_RESTRICTED_DIAGNOSIS.md
CONFLICT_RISK_ASSESSMENT.md
MODULE_API_CONFIG_GAP_ANALYSIS.md
REDIRECT_OPTIMIZATION_PLAN.md
SHOP_REVIEW_PROCESS_IMPROVEMENT_PLAN.md
```

#### 配置和部署文档

```bash
CONFIG_FIX_QUICK_REFERENCE.md
CONFIG_PLACEHOLDER_GUIDE.md
DEPLOYMENT_PACKAGE_README.md
DEVICE_PROFILE_EXTENSION_PROJECT_SUMMARY.md
GIT_BRANCH_STRATEGY.md
GIT_FILE_ORGANIZATION.md
GIT_QUICK_REFERENCE.md
UNIFIED_AUTH_MIGRATION_GUIDE.md
```

#### 项目总结类

```bash
CODING_COMPLETENESS_SUMMARY.md
DOCUMENTATION_UPGRADE_SUMMARY.md
DOCUMENTS_CONSOLIDATION_SUMMARY.md
FINAL_COMPLETION_REPORT.md
FINAL_PROJECT_SUMMARY_REPORT.md
GLOBAL_TECHNICAL_DOCS_UPDATE_COMPLETION_REPORT.md
IDE_FIX_SUMMARY.md
PROJECT_DOCUMENTS_ORGANIZATION_REPORT.md
PROJECT_PLAN_COMPLETION_STATUS.md
```

#### 其他文档

```bash
DELIVERABLES_AND_DOCUMENTATION_UPDATE_CHECKLIST.md
DOCS_REPAIR_SHOP_USER_CENTER_INDEX.md
E2E_EXECUTION_COMPLETED.md
MANAGEMENT_OPTIMIZATION_ATOMIC_TASKS.md
MARKETING_SYSTEM_READY.md
TASK_2_3_COMPLETION_REPORT.js
TASK_3_2_MONITORING_VALIDATION.js
```

### 保留在根目录的重要文档

```bash
README.md                    # 项目主文档
CODE_OF_CONDUCT.md          # 行为准则
CONTRIBUTING.md             # 贡献指南
LICENSE                     # 许可证
PRIVACY.md                  # 隐私政策
SECURITY.md                 # 安全说明
SUPPORT.md                  # 支持文档
TERMS.md                    # 条款
QUICK_START.md              # 快速开始指南
DEPLOYMENT_GUIDE.md         # 部署指南
DEPLOYMENT_CHECKLIST.md     # 部署清单
OPENAPI_SPEC.yaml           # API 规范
```

---

## 🔧 第五类：代码结构优化

### 1. 统一模块目录结构

确保所有业务模块都在 `src/modules/` 下:

```bash
src/modules/
├── auth/                   # ✓ 已存在
├── repair-service/        # ✓ 已存在
├── parts-market/          # ✓ 已存在
├── b2b-procurement/       # ✓ 已存在
├── data-center/           # ✓ 已存在 (在 src/data-center/)
├── fcx-alliance/          # ? 需要确认
├── admin-panel/           # ? 需要确认
└── common/                # ✓ 已存在
```

### 2. 清理根目录的业务相关空目录

这些目录应该删除，相关业务代码应在 `src/modules/` 中:

```bash
procurement/      → 应该在 src/modules/b2b-procurement/
logistics/        → 应该在 src/modules/b2b-procurement/logistics/
suppliers/        → 应该在 src/modules/b2b-procurement/suppliers/
customers/        → 应该在 src/modules/ 或 src/app/customers/
pricing/          → 应该在 src/modules/pricing/ 或 src/app/pricing/
shipping/         → 应该在 src/modules/shipping/
trading/          → 应该在 src/modules/trading/
work-orders/      → 应该在 src/modules/work-orders/
dashboard/        → 应该在 src/app/dashboard/
```

### 3. 技术模块对齐

```bash
src/tech/
├── database/      # ✓ 已存在
├── api/           # ✓ 已存在
├── middleware/    # ✓ 已存在 (src/middleware/)
├── utils/         # ✓ 已存在 (src/utils/)
└── types/         # ✓ 已存在 (src/types/)
```

---

## 📝 第六类：配置文件优化

### .gitignore 检查

确保 `.gitignore` 包含所有应忽略的文件类型:

- 临时文件 (_.tmp, _.temp)
- 备份文件 (_.bak, _.backup, \*.old)
- 空目录
- IDE 特定文件

### .gitmessage 规范化

当前的 Git 提交模板是合理的，可以考虑是否需要在团队中强制执行。

---

## 🚀 执行步骤

### Step 1: 删除空目录和临时文件

```bash
# PowerShell 命令示例
Remove-Item -Path ".\-p" -Recurse -Force
Remove-Item -Path ".\compliance}" -Recurse -Force
# ... 其他目录
```

### Step 2: 归档备份目录

```bash
# 创建归档目录
New-Item -ItemType Directory -Path ".\archive\backups"
# 移动备份
Move-Item -Path ".\backup\*" -Destination ".\archive\backups\"
Move-Item -Path ".\docs-backup-*" -Destination ".\archive\backups\"
Move-Item -Path ".\test-backup-*" -Destination ".\archive\backups\"
```

### Step 3: 归档文档报告

```bash
# 创建归档目录
New-Item -ItemType Directory -Path ".\docs\reports\archive"
# 移动报告文件
Move-Item -Path "*.report.md" -Destination ".\docs\reports\archive\"
# ... 其他报告
```

### Step 4: 验证代码结构

- 运行 `npm run lint:check` 检查代码规范
- 运行 `npm run build` 验证构建是否正常
- 运行关键测试确保功能不受影响

---

## ⚠️ 注意事项

1. **删除前备份**: 在执行任何删除操作前，确保有完整的代码备份
2. **Git 状态**: 确保所有更改已提交，避免丢失工作
3. **测试验证**: 清理后必须运行完整的测试套件
4. **团队协作**: 如果是团队项目，需要提前通知所有成员

---

## 📊 预期效果

清理后的目录结构将:

- ✅ 根目录更加清爽，只保留核心配置文件
- ✅ 所有业务代码集中在 `src/` 目录下
- ✅ 文档有序组织在 `docs/` 各子目录中
- ✅ 无空目录和无效命名
- ✅ 便于后续维护和扩展

---

## 🔍 验证清单

清理完成后需要验证:

- [ ] 项目能够正常启动 (`npm run dev`)
- [ ] 构建成功 (`npm run build`)
- [ ] 所有测试通过 (`npm test`)
- [ ] Git 状态正常
- [ ] 没有破坏任何导入路径
- [ ] Docker 配置仍然有效
