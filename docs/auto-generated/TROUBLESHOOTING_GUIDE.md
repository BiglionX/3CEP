# 故障排查手册

**生成时间**: 2026-03-23T04:52:51.562Z
**版本**: v1.0.0

---

## 快速索引

- [登录问题](#登录问题)
- [数据库问题](#数据库问题)
- [前端问题](#前端问题)
- [API 问题](#api-问题)
- [性能问题](#性能问题)
- [部署问题](#部署问题)

---

## 诊断工具

### 1. 日志查看

```bash
# 应用日志
tail -f logs/app.log

# Docker 日志
docker-compose logs -f app

# K8s 日志
kubectl logs -f deployment/app -n production
```

### 2. 数据库诊断

```sql
-- 检查活跃连接
SELECT count(*) FROM pg_stat_activity;

-- 检查慢查询
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- 检查锁等待
SELECT * FROM pg_locks WHERE NOT granted;
```

### 3. 性能分析

```bash
# Node.js 性能分析
node --inspect app.js

# Chrome DevTools
# 访问 chrome://inspect
```

---

## 登录问题

### 问题 1: 无法登录，提示"无效凭证"

**症状**: 用户输入正确的账号密码但登录失败

**可能原因**:
1. 数据库连接失败
2. JWT 密钥配置错误
3. 密码加密算法变更

**解决步骤**:
```bash
# 1. 检查数据库连接
psql $DATABASE_URL -c "SELECT 1"

# 2. 验证 JWT 配置
grep JWT_SECRET .env.local

# 3. 查看认证日志
grep "authentication" logs/app.log
```

**修复命令**:
```bash
# 重置管理员密码
node scripts/reset-admin-password.js newpassword123
```

---

### 问题 2: 登录后立即退出

**症状**: 登录成功后立即跳回登录页

**可能原因**:
1. Session/Cookie 配置错误
2. 跨域问题
3. Token 过期时间设置错误

**解决步骤**:
```bash
# 检查 Cookie 配置
grep SESSION_SECRET .env.local

# 检查跨域配置
cat src/config/cors.ts
```

---

## 数据库问题

### 问题 1: 查询超时

**症状**: 页面加载缓慢，数据库查询超时

**可能原因**:
1. 缺少索引
2. 慢查询
3. 连接池耗尽

**解决步骤**:
```sql
-- 1. 识别慢查询
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- 2. 添加索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 3. 检查连接池
SHOW max_connections;
```

---

### 问题 2: 死锁

**症状**: 事务长时间阻塞，操作失败

**解决步骤**:
```sql
-- 查看死锁
SELECT * FROM pg_locks bl
JOIN pg_stat_activity a ON bl.pid = a.pid
WHERE NOT granted;

-- 终止阻塞的查询
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' 
AND now() - query_start > interval '5 minutes';
```

---

## 前端问题

### 问题 1: 页面白屏

**症状**: 访问页面显示空白

**可能原因**:
1. JavaScript 执行错误
2. 资源加载失败
3. 路由配置错误

**诊断**:
```bash
# 查看浏览器控制台错误
# F12 -> Console

# 检查构建输出
ls -la .next/static/
```

**解决**:
```bash
# 重新构建
npm run build

# 清除缓存
rm -rf .next
```

---

### 问题 2: 样式错乱

**症状**: 页面布局异常，样式丢失

**可能原因**:
1. Tailwind CSS 未正确编译
2. CSS 文件加载顺序错误
3. 浏览器兼容性

**解决**:
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重建
npm run build
```

---

## API 问题

### 问题 1: API 返回 500 错误

**症状**: 接口调用失败，返回服务器内部错误

**诊断**:
```bash
# 查看错误日志
tail -f logs/error.log

# 检查 API 路由
cat src/app/api/*/route.ts
```

**常见错误**:
- 空指针异常
- 数据库约束违反
- 第三方服务调用失败

---

### 问题 2: CORS 错误

**症状**: 浏览器报 CORS policy 错误

**解决**:
```typescript
// src/config/cors.ts
export const corsConfig = {
  origin: ['https://your-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
```

---

## 性能问题

### 问题 1: 页面加载缓慢

**诊断**:
```bash
# Lighthouse 性能测试
# Chrome DevTools -> Lighthouse

# 分析包大小
npm run analyze

# 检查网络请求
# Network tab in DevTools
```

**优化措施**:
1. 启用 CDN
2. 图片懒加载
3. 代码分割
4. 服务端渲染

---

### 问题 2: 内存泄漏

**症状**: 应用运行一段时间后内存持续增长

**诊断**:
```bash
# 监控内存使用
watch -n 1 'ps aux | grep node'

# Heap Snapshot 分析
# Chrome DevTools -> Memory
```

**常见原因**:
- 全局变量未清理
- 定时器未清除
- 事件监听器未移除

---

## 部署问题

### 问题 1: Docker 容器启动失败

**症状**: 容器不断重启

**诊断**:
```bash
# 查看容器日志
docker logs <container-id>

# 进入容器调试
docker run -it --entrypoint /bin/sh <image-id>
```

---

### 问题 2: K8s Pod 无法调度

**症状**: Pod 一直处于 Pending 状态

**诊断**:
```bash
kubectl describe pod <pod-name> -n production

kubectl get events -n production
```

**常见原因**:
- 资源不足
- 节点选择器不匹配
- PVC 绑定失败

---

## 应急联系

- **技术支持**: tech-support@company.com
- **值班电话**: +86-XXX-XXXX-XXXX
- **Slack 频道**: #emergency-response
