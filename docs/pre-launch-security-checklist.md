# 🔴 上线前安全检查清单

## ⚠️ RLS（行级安全策略）警告

**当前状态**：开发环境已禁用 RLS
**生产环境**：必须启用 RLS，否则会导致数据泄露！

---

## 📋 上线前必须完成的任务

### **1. RLS 安全策略启用** 🔴 高优先级

#### 涉及表

- [ ] `tenant_users` - 租户用户关联表
- [ ] `admin_users` - 管理员表
- [ ] `external_data_sources` - 外部数据源配置表
- [ ] `parts_staging` - 临时配件数据表

#### 修复步骤

1. **删除递归策略**

```sql
DROP POLICY IF EXISTS "租户隔离 - 查看租户成员" ON tenant_users;
```

2. **创建正确的 RLS 策略**

```sql
-- tenant_users 表
CREATE POLICY "allow_select_authenticated" ON tenant_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_all_admin" ON tenant_users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
        AND is_active = true
    )
);

-- admin_users 表
CREATE POLICY "allow_select_self" ON admin_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_all_admin" ON admin_users
FOR ALL TO authenticated
USING (true);
```

3. **重新启用 RLS**

```sql
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

4. **验证测试**

```sql
-- 测试查询是否正常
SELECT * FROM tenant_users LIMIT 10;
SELECT * FROM admin_users WHERE is_active = true LIMIT 10;

-- 测试不同角色的权限
-- 使用普通用户 token 查询
-- 使用管理员 token 查询
```

#### 参考文档

- `docs/fix-tenant-users-rls-recursion.md` - RLS 递归问题完整修复指南
- `supabase/migrations/050_fix_all_rls_recursion.sql` - 完整修复 SQL 脚本
- `supabase/migrations/051_emergency_disable_rls.sql` - 紧急禁用脚本

---

### **2. 认证与授权检查** 🟡 中优先级

- [ ] 所有 API 端点都有认证检查
- [ ] 管理员接口验证 `is_admin` 角色
- [ ] 租户接口验证租户隔离
- [ ] Cookie 正确设置（httpOnly, secure, sameSite）
- [ ] Token 过期处理正常

---

### **3. 数据安全** 🔴 高优先级

- [ ] 敏感数据加密存储（密码、token 等）
- [ ] API 响应过滤敏感字段
- [ ] CORS 配置正确（仅允许生产域名）
- [ ] SQL 注入防护（参数化查询）
- [ ] XSS 防护（输出编码）

---

### **4. 性能优化** 🟢 低优先级

- [ ] 数据库索引已创建
- [ ] 热点数据缓存策略
- [ ] 分页查询实现
- [ ] 慢查询日志分析

---

### **5. 监控与日志** 🟡 中优先级

- [ ] 错误日志记录完整
- [ ] 关键操作审计日志
- [ ] 性能监控指标
- [ ] 告警通知配置

---

## 🎯 上线前测试流程

### **阶段 1: 功能测试**

1. 所有 CRUD 操作正常
2. 权限控制生效
3. 租户数据隔离

### **阶段 2: 安全测试**

1. 未授权访问被拒绝
2. 跨租户访问被拒绝
3. SQL 注入测试失败（预期）
4. XSS 攻击测试失败（预期）

### **阶段 3: 压力测试**

1. 并发用户测试
2. 数据库负载测试
3. API 响应时间 < 200ms

---

## 📞 紧急联系人

- **技术负责人**: [填写]
- **DBA**: [填写]
- **安全负责人**: [填写]

---

## ✅ 最终检查

上线前 24 小时，确认：

- [ ] RLS 已启用并测试通过
- [ ] 所有高优先级问题已解决
- [ ] 回滚方案已准备
- [ ] 团队已收到上线通知

---

**最后更新**: 2026-03-25
**下次审查**: 每次上线前必须审查此清单
