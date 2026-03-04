# 发版前结构整理实施计划

> ⚡ **优先级**: 高 - 必须在 PWA 优化和 RN 迁移之前完成  
> **预计时间**: 3-5 天  
> **风险等级**: 中 (需要测试验证)

---

## 🎯 执行策略

### 为什么必须先做这一步？

1. **避免返工** - 现在整理比迁移到一半再整理成本低 10 倍
2. **打好基础** - RN 迁移需要清晰的模块结构来复用代码
3. **减少冲突** - 统一的目录结构避免导入冲突
4. **提升效率** - 便于快速定位代码

---

## 📝 原子化任务清单

### Task 1: 清理空目录和异常命名 (0.5 天)

**目标**: 删除无效目录，避免干扰

#### Step 1.1: 删除根目录空目录

```bash
# PowerShell 命令 (逐个执行，每步验证)
Remove-Item -Path ".\-p" -Recurse -Force -WhatIf  # 先预览
Remove-Item -Path ".\-p" -Recurse -Force          # 确认无误后执行

# 待删除目录清单
-p/                    # 空目录
compliance}/           # 命名异常
customers}/            # 命名异常
dashboard/             # 空目录
diagnostics}/          # 命名异常
lib/                   # 空目录 (src/lib/正常使用)
logistics/             # 空目录
pricing/               # 空目录
procurement/           # 空目录
settings}/             # 命名异常
shipping/              # 空目录
suppliers/             # 空目录
trading/               # 空目录
work-orders/           # 空目录
backups/migrations/    # 空备份目录
```

**验收标准**:
- [ ] 所有空目录已删除
- [ ] Git 状态正常
- [ ] 项目能正常启动

---

#### Step 1.2: 清理根目录临时文件

```bash
# 0KB 临时文件
Remove-Item -Path ".\direct-fix.js" -Force
Remove-Item -Path ".\final-verification.js" -Force
Remove-Item -Path ".\login-content.txt" -Force
Remove-Item -Path ".\login-dom.html" -Force
Remove-Item -Path ".\login-page.html" -Force
Remove-Item -Path ".\quick-fix-instructions.txt" -Force
Remove-Item -Path ".\s.status" -Force
Remove-Item -Path ".\{ ^" -Force

# 测试相关临时文件 (可选)
Remove-Item -Path ".\temp-auth-fix.js" -Force
Remove-Item -Path ".\test-import.ts" -Force
Remove-Item -Path ".\test-n8n-iframe.html" -Force
```

**验收标准**:
- [ ] 根目录无 0KB 文件
- [ ] Git diff 正常
- [ ] 不影响任何功能

---

### Task 2: 合并重复的技术目录 (1 天)

**目标**: 统一技术基建到 `src/tech/`

#### Step 2.1: 检查重复目录内容

```bash
# 检查 src/middleware/ vs src/tech/middleware/
Get-ChildItem -Path ".\src\middleware" -Recurse -File | Select-Object FullName
Get-ChildItem -Path ".\src\tech\middleware" -Recurse -File | Select-Object FullName

# 检查 src/utils/ vs src/tech/utils/
Get-ChildItem -Path ".\src\utils" -Recurse -File
Get-ChildItem -Path ".\src\tech\utils" -Recurse -File

# 检查 src/controllers/ vs src/tech/api/
Get-ChildItem -Path ".\src\controllers" -Recurse -File
Get-ChildItem -Path ".\src\tech\api" -Recurse -File

# 检查 src/models/ vs src/tech/database/
Get-ChildItem -Path ".\src\models" -Recurse -File
Get-ChildItem -Path ".\src\tech\database" -Recurse -File
```

**输出记录**: 将检查结果保存到 `reports/duplicate-directories-check.md`

---

#### Step 2.2: 合并 middleware

```bash
# 1. 备份 src/middleware/
Copy-Item -Path ".\src\middleware" -Destination ".\src\middleware.backup" -Recurse

# 2. 比较差异 (手动或使用工具)
# 推荐使用 Beyond Compare 或 VSCode 比较功能

# 3. 移动不同的文件到 src/tech/middleware/
Move-Item -Path ".\src\middleware\*.ts" -Destination ".\src\tech\middleware\" -Force

# 4. 更新导入路径 (使用 search_replace 工具)
# 全局搜索：@/middleware/
# 替换为：@/tech/middleware/

# 5. 删除空目录
Remove-Item -Path ".\src\middleware" -Recurse -Force
```

**导入路径更新示例**:
```typescript
// Before
import { authMiddleware } from '@/middleware/auth.middleware';

// After
import { authMiddleware } from '@/tech/middleware/auth.middleware';
```

**验收标准**:
- [ ] 所有文件已移动
- [ ] 导入路径已更新
- [ ] TypeScript 编译通过
- [ ] 功能测试正常

---

#### Step 2.3: 合并 utils

```bash
# 1. 备份
Copy-Item -Path ".\src\utils" -Destination ".\src\utils.backup" -Recurse

# 2. 检查内容差异
# 对比 src/utils/ 和 src/tech/utils/

# 3. 合并非冲突文件
Move-Item -Path ".\src\utils\*.ts" -Destination ".\src\tech\utils\" -Force

# 4. 更新导入路径
# 全局搜索：@/utils/
# 替换为：@/tech/utils/

# 5. 删除空目录
Remove-Item -Path ".\src\utils" -Recurse -Force
```

**验收标准**:
- [ ] utils 已合并到 tech/utils/
- [ ] 所有导入已更新
- [ ] 编译通过

---

#### Step 2.4: 合并 controllers 到 api

```bash
# 1. 备份
Copy-Item -Path ".\src\controllers" -Destination ".\src\controllers.backup" -Recurse

# 2. 移动到 tech/api/controllers/
New-Item -ItemType Directory -Path ".\src\tech\api\controllers" -Force
Move-Item -Path ".\src\controllers\*" -Destination ".\src\tech\api\controllers\" -Force

# 3. 更新导入路径
# 全局搜索：@/controllers/
# 替换为：@/tech/api/controllers/

# 4. 删除空目录
Remove-Item -Path ".\src\controllers" -Recurse -Force
```

**验收标准**:
- [ ] controllers 已移动到 tech/api/controllers/
- [ ] 导入路径已更新

---

#### Step 2.5: 合并 models 到 database

```bash
# 1. 备份
Copy-Item -Path ".\src\models" -Destination ".\src\models.backup" -Recurse

# 2. 移动到 tech/database/models/
New-Item -ItemType Directory -Path ".\src\tech\database\models" -Force
Move-Item -Path ".\src\models\*" -Destination ".\src\tech\database\models\" -Force

# 3. 更新导入路径
# 全局搜索：@/models/
# 替换为：@/tech/database/models/

# 4. 删除空目录
Remove-Item -Path ".\src\models" -Recurse -Force
```

**验收标准**:
- [ ] models 已移动到 tech/database/models/
- [ ] 导入路径已更新

---

### Task 3: 业务模块归类 (1 天)

**目标**: 确保所有业务模块在正确位置

#### Step 3.1: 移动 data-center 到 modules

```bash
# 检查是否已存在 src/modules/data-center/
if (Test-Path ".\src\modules\data-center") {
    Write-Host "data-center 已存在于 modules 中，需要合并"
} else {
    # 移动 src/data-center/ 到 src/modules/data-center/
    Move-Item -Path ".\src\data-center" -Destination ".\src\modules\data-center" -Force
}

# 更新导入路径
# 全局搜索：@/data-center/
# 替换为：@/modules/data-center/
```

**验收标准**:
- [ ] data-center 已在 modules/下
- [ ] 导入路径已更新
- [ ] 功能正常

---

#### Step 3.2: 重命名 fcx-system 为 fcx-alliance

```bash
# 1. 检查配置文件
# 读取 project-structure-config.json
$config = Get-Content ".\project-structure-config.json" -Raw | ConvertFrom-Json

# 2. 如果配置中是 fcx-alliance，则重命名目录
if ($config.moduleStructure.businessModules.name -contains "fcx-alliance") {
    # 重命名目录
    if (Test-Path ".\src\fcx-system") {
        Rename-Item -Path ".\src\fcx-system" -NewName "fcx-alliance" -Force
    }
    
    # 更新导入路径
    # 全局搜索：@/fcx-system/
    # 替换为：@/modules/fcx-alliance/
}
```

**验收标准**:
- [ ] 目录名与配置一致
- [ ] 导入路径已更新

---

#### Step 3.3: 处理 Agent 相关模块

```bash
# b2b-procurement-agent - 合并到 b2b-procurement 模块
if (Test-Path ".\src\b2b-procurement-agent") {
    New-Item -ItemType Directory -Path ".\src\modules\b2b-procurement\agent" -Force
    Move-Item -Path ".\src\b2b-procurement-agent\*" -Destination ".\src\modules\b2b-procurement\agent\" -Force
    Remove-Item -Path ".\src\b2b-procurement-agent" -Recurse -Force
}

# test-agent - 删除或归档
if (Test-Path ".\src\test-agent") {
    # 选项 A: 删除 (如果无用)
    # Remove-Item -Path ".\src\test-agent" -Recurse -Force
    
    # 选项 B: 移动到 tests/
    New-Item -ItemType Directory -Path ".\tests\agents" -Force
    Move-Item -Path ".\src\test-agent" -Destination ".\tests\agents\" -Force
}
```

**验收标准**:
- [ ] b2b-procurement-agent 已合并
- [ ] test-agent 已处理

---

### Task 4: 更新配置文件 (0.5 天)

**目标**: 确保配置文件与实际目录一致

#### Step 4.1: 更新 project-structure-config.json

```json
{
  "moduleStructure": {
    "businessModules": [
      {
        "name": "data-center",
        "path": "src/modules/data-center",  // ✅ 确认路径正确
        // ... 其他配置
      },
      {
        "name": "fcx-alliance",             // ✅ 名称统一
        "path": "src/modules/fcx-alliance",
        // ... 其他配置
      }
    ]
  }
}
```

**操作**:
1. 打开 `project-structure-config.json`
2. 核对每个模块的 path 是否与实际目录一致
3. 更新不一致的路径

---

#### Step 4.2: 更新 tsconfig.json 路径别名

```json
{
  "compilerOptions": {
    "paths": {
      "@/modules/*": ["./src/modules/*"],
      "@/tech/*": ["./src/tech/*"],
      "@/data-center/*": ["./src/modules/data-center/*"],  // ✅ 更新
      "@/fcx-alliance/*": ["./src/modules/fcx-alliance/*"] // ✅ 更新
    }
  }
}
```

---

### Task 5: 全面测试验证 (1-2 天)

**目标**: 确保所有功能正常

#### Step 5.1: TypeScript 编译检查

```bash
# 运行 TypeScript 编译
npm run build

# 或者单独检查类型
npx tsc --noEmit
```

**验收标准**:
- [ ] 无编译错误
- [ ] 无类型错误

---

#### Step 5.2: 运行测试套件

```bash
# 单元测试
npm test

# E2E 测试
npm run test:e2e

# 关键功能测试
npm run test:admin
npm run test:repair-shop
```

**验收标准**:
- [ ] 所有测试通过
- [ ] 覆盖率不下降

---

#### Step 5.3: 手动测试关键功能

**测试清单**:
- [ ] 登录注册功能
- [ ] 维修服务流程
- [ ] 配件商城浏览
- [ ] B2B采购流程
- [ ] 数据中心展示
- [ ] 管理后台功能

---

#### Step 5.4: 性能回归测试

```bash
# 运行性能测试
npm run test:perf

# 对比前后性能数据
# LCP, FID, CLS 等指标
```

**验收标准**:
- [ ] 性能指标无明显下降
- [ ] 加载时间无明显增加

---

## 📊 验收标准总结

### 必须满足的条件

- [ ] **所有空目录已删除**
- [ ] **重复目录已合并**
- [ ] **业务模块位置正确**
- [ ] **配置文件已更新**
- [ ] **TypeScript 编译通过**
- [ ] **所有测试通过**
- [ ] **关键功能手动测试通过**
- [ ] **性能无明显下降**

### 可选满足的条件

- [ ] 备份目录已清理
- [ ] 文档已同步更新
- [ ] 团队已培训

---

## ⚠️ 风险评估与应对

### 高风险项

1. **导入路径更新遗漏**
   - **影响**: 编译失败或运行时错误
   - **应对**: 使用全局搜索替换 + 编译检查

2. **循环依赖问题**
   - **影响**: 模块无法正常导入
   - **应对**: 仔细检查依赖关系图

3. **Git 冲突**
   - **影响**: 团队协作困难
   - **应对**: 选择低峰期执行，提前通知

### 中风险项

1. **功能回归不充分**
   - **影响**: 隐藏 bug
   - **应对**: 制定详细的测试清单

2. **性能下降**
   - **影响**: 用户体验变差
   - **应对**: 性能监控和对比

---

## 🚀 执行时间规划

| 阶段 | 任务 | 预计时间 | 负责人 |
|------|------|---------|--------|
| Day 1 上午 | Task 1: 清理空目录 | 0.5 天 | 前端团队 |
| Day 1 下午 | Task 2.1-2.2: 合并 middleware/utils | 0.5 天 | 前端团队 |
| Day 2 上午 | Task 2.3-2.5: 合并 controllers/models | 0.5 天 | 前端团队 |
| Day 2 下午 | Task 3: 业务模块归类 | 0.5 天 | 前端团队 |
| Day 3 上午 | Task 4: 更新配置文件 | 0.5 天 | 技术负责人 |
| Day 3 下午 - Day 5 | Task 5: 全面测试验证 | 1.5-2 天 | 测试团队 |

---

## 📝 回滚预案

如果执行过程中遇到严重问题:

### 回滚步骤

```bash
# 1. Git 回滚到执行前的提交
git checkout <commit-hash-before-refactor>

# 2. 恢复备份目录
Copy-Item -Path ".\src\middleware.backup" -Destination ".\src\middleware" -Recurse
Copy-Item -Path ".\src\utils.backup" -Destination ".\src\utils" -Recurse
Copy-Item -Path ".\src\controllers.backup" -Destination ".\src\controllers" -Recurse
Copy-Item -Path ".\src\models.backup" -Destination ".\src\models" -Recurse

# 3. 验证回滚成功
npm run build
npm test
```

### 回滚触发条件

- TypeScript 编译大量错误且无法快速修复
- 核心功能无法正常工作
- 测试通过率低于 90%
- 性能下降超过 20%

---

## 💡 成功要素

### 必须做到

1. ✅ **充分备份** - 每个步骤前都要备份
2. ✅ **小步快跑** - 每次只移动少量目录，立即验证
3. ✅ **全面测试** - 每个步骤完成后都要测试
4. ✅ **及时沟通** - 遇到问题立即同步

### 避免踩坑

1. ❌ **不要一次性全部移动** - 容易引入大量 bug
2. ❌ **不要跳过测试** - 会埋下隐患
3. ❌ **不要忽略备份** - 回滚成本很高
4. ❌ **不要在高峰期执行** - 影响团队协作

---

## 🎯 下一步

完成本计划后，立即开始:

1. **Phase 1: PWA 优化** - 已有清晰目录结构
2. **Phase 2: RN 预研** - 模块复用更容易
3. **Phase 3: Monorepo** - 共享包划分明确

---

**创建日期**: 2026-03-04  
**最后更新**: 2026-03-04  
**版本**: v1.0.0  
**审核人**: 待定
