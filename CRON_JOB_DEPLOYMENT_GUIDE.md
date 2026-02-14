# Vercel 定时任务部署与监控指南

## 📋 配置概览

### 已配置的定时任务

1. **每日任务** (`/api/cron/daily-task`)
   - 执行时间: 每天凌晨 3:00 (0 3 * * *)
   - 功能: 数据清理、价格更新、预警通知、统计报告、数据备份

2. **每小时任务** (`/api/cron/hourly-task`)
   - 执行时间: 每小时整点 (0 * * * *)
   - 功能: 健康检查、预约提醒、临时数据清理、缓存更新

## 🚀 部署步骤

### 1. 环境变量配置

确保在 Vercel 项目中设置以下环境变量:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. 部署到 Vercel

```bash
# 安装 Vercel CLI (如果未安装)
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

或者通过 GitHub 集成自动部署。

### 3. 验证部署

部署完成后，可以通过以下方式验证:

```bash
# 手动触发每日任务测试
curl https://your-app.vercel.app/api/cron/daily-task

# 手动触发每小时任务测试  
curl https://your-app.vercel.app/api/cron/hourly-task
```

## 📊 监控方法

### 1. 自动监控脚本

```bash
# 运行配置检查
node scripts/monitor-cron-jobs.js

# 检查执行状态
node scripts/check-cron-execution.js

# 生成状态报告
node scripts/check-cron-execution.js --report

# 手动测试执行
node scripts/check-cron-execution.js --test
```

### 2. Vercel 控制台监控

1. 登录 [Vercel 控制台](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 "Functions" 页面
4. 查看定时任务函数的日志和执行历史

### 3. 日志文件监控

日志文件位置: `logs/` 目录下
- `cron-execution-YYYY-MM-DD.log` - 执行日志
- `cron-monitor-report-YYYY-MM-DD.json` - 监控报告
- `status-report-YYYY-MM-DD.json` - 状态报告

## 🔍 首次执行监控

### 预期时间线

- **每日任务**: 第一次执行将在部署后的下一个凌晨 3:00
- **每小时任务**: 第一次执行将在部署后的下一个整点

### 监控要点

1. **检查函数日志**
   - 确认函数被正确触发
   - 查看执行过程中的任何错误信息

2. **验证数据库变更**
   ```bash
   # 检查系统配置中的执行记录
   node scripts/final-verification.js
   ```

3. **监控执行结果**
   ```bash
   # 生成最新的状态报告
   node scripts/check-cron-execution.js --report
   ```

## ⚠️ 常见问题排查

### 1. 任务未执行
- 检查 Vercel 项目的 Cron 配置是否正确
- 确认环境变量已正确设置
- 查看函数日志中的错误信息

### 2. 执行失败
- 检查 Supabase 连接配置
- 验证数据库表结构完整性
- 查看具体的错误堆栈信息

### 3. 权限问题
- 确认使用的是 Service Role Key
- 检查 RLS 策略配置
- 验证数据库用户权限

## 📈 性能优化建议

1. **执行时间优化**
   - 监控各子任务的执行耗时
   - 优化数据库查询性能
   - 考虑异步处理耗时操作

2. **错误处理**
   - 实现重试机制
   - 添加详细的错误日志
   - 设置执行超时保护

3. **资源管理**
   - 监控内存使用情况
   - 控制并发执行数量
   - 定期清理历史日志

## 🛠️ 维护操作

### 定期维护任务

```bash
# 每周检查执行状态
node scripts/check-cron-execution.js --report

# 每月审查日志文件大小
ls -la logs/

# 清理旧日志文件 (保留最近30天)
find logs/ -name "*.log" -mtime +30 -delete
```

### 紧急故障处理

1. 立即检查 Vercel 函数日志
2. 运行诊断脚本定位问题
3. 必要时手动执行关键任务
4. 联系技术支持

## 📞 支持信息

如遇到问题，请提供以下信息:
- 完整的错误日志
- 执行时间和环境
- 相关的配置信息
- 最近的变更历史

---
*文档版本: 1.0*
*最后更新: 2026-02-14*