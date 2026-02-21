# FixCycle 系统运维操作手册

## 目录

1. [服务启停管理](#服务启停管理)
2. [日志查看与分析](#日志查看与分析)
3. [备份与恢复操作](#备份与恢复操作)
4. [常见告警定位与处理](#常见告警定位与处理)
5. [性能监控与优化](#性能监控与优化)
6. [安全与权限管理](#安全与权限管理)

---

## 服务启停管理

### 应用服务管理

#### 启动应用服务

```bash
# 开发环境启动
npm run dev

# 生产环境启动
npm run start

# 使用PM2管理（推荐生产环境）
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 停止应用服务

```bash
# 正常停止
npm run stop

# PM2停止
pm2 stop fixcycle-app
pm2 delete fixcycle-app

# 强制停止（查找进程ID）
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F
```

#### 重启应用服务

```bash
# 简单重启
npm run restart

# PM2重启
pm2 restart fixcycle-app

# 热重载（开发环境）
npm run dev
```

### 数据库服务管理

#### PostgreSQL 数据库操作

```bash
# 启动PostgreSQL服务
sudo systemctl start postgresql
# 或Windows
net start postgresql-x64-13

# 停止PostgreSQL服务
sudo systemctl stop postgresql
# 或Windows
net stop postgresql-x64-13

# 重启PostgreSQL服务
sudo systemctl restart postgresql

# 查看PostgreSQL状态
sudo systemctl status postgresql
```

#### 数据库连接测试

```bash
# 使用psql客户端测试连接
psql -h localhost -p 5432 -U postgres -d fixcycle_db

# 或使用项目脚本
node scripts/verify-database.js
```

### n8n 工作流引擎管理

#### 启动 n8n 服务

```bash
# 基础启动
n8n

# 后台运行
nohup n8n &

# Docker方式启动
docker run -d --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=password \
  n8nio/n8n

# 使用项目脚本启动监控
scripts/start-n8n-monitor.bat  # Windows
scripts/start-n8n-monitor.sh   # Linux
```

#### 停止 n8n 服务

```bash
# 查找并停止进程
ps aux | grep n8n
kill -9 <PID>

# Docker方式停止
docker stop n8n
docker rm n8n
```

#### n8n 健康检查

```bash
# 使用内置健康检查
curl http://localhost:5678/healthz

# 使用项目健康检查脚本
node scripts/check-n8n-health.js
```

### 实时数据处理服务

#### 启动实时处理服务

```bash
# 启动数据处理中心
node scripts/start-data-center.js

# 启动实时监控
node scripts/monitor-realtime-system.js

# 启动供应商匹配服务
node scripts/start-supplier-matching.js
```

#### 停止实时服务

```bash
# 使用Ctrl+C优雅停止
# 或查找进程并强制停止
ps aux | grep "realtime\|data-center"
kill -9 <PID>
```

---

## 日志查看与分析

### 系统日志位置

#### 应用日志

```
项目根目录/logs/
├── app.log              # 应用主日志
├── error.log            # 错误日志
├── access.log           # 访问日志
├── n8n-monitor.log      # n8n监控日志
└── realtime-system.log  # 实时系统日志
```

#### 数据库日志

```
# PostgreSQL日志位置（根据安装配置）
/var/log/postgresql/     # Linux
%ProgramFiles%\PostgreSQL\13\data\log\  # Windows
```

#### 系统服务日志

```
# Linux系统日志
/var/log/syslog
/var/log/messages

# Windows事件日志
事件查看器 -> Windows日志 -> 应用程序
```

### 日志查看命令

#### 实时查看日志

```bash
# 应用日志实时查看
tail -f logs/app.log

# 错误日志实时查看
tail -f logs/error.log

# 显示最后100行并实时更新
tail -n 100 -f logs/app.log

# Windows PowerShell
Get-Content logs\app.log -Wait
```

#### 日志过滤查询

```bash
# 按关键字搜索
grep "ERROR" logs/app.log

# 按时间范围搜索
grep "2024-01-15" logs/app.log

# 组合条件搜索
grep -E "(ERROR|WARN)" logs/app.log | grep "database"

# 统计错误数量
grep "ERROR" logs/app.log | wc -l

# Windows CMD
findstr "ERROR" logs\app.log
```

#### 日志分析工具

```bash
# 使用awk分析日志模式
awk '/ERROR/ {print $1, $2}' logs/app.log | sort | uniq -c

# 分析访问频率
awk '{print $1}' logs/access.log | sort | uniq -c | sort -nr | head -10

# 查看日志大小
du -h logs/*.log
```

### 日志轮转和清理

#### 自动日志轮转配置

```bash
# 创建logrotate配置文件 /etc/logrotate.d/fixcycle
/path/to/project/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 app app
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### 手动清理旧日志

```bash
# 删除7天前的日志
find logs/ -name "*.log.*" -mtime +7 -delete

# 压缩旧日志
gzip logs/*.log.2024-*

# 清理大文件
find logs/ -size +100M -delete
```

---

## 备份与恢复操作

### 数据库备份

#### 执行数据库备份

```bash
# 使用项目备份脚本
node scripts/backup-database.js backup

# 手动执行pg_dump
pg_dump -h localhost -p 5432 -U postgres fixcycle_db > backup-$(date +%Y%m%d-%H%M%S).sql

# 压缩备份
pg_dump -h localhost -p 5432 -U postgres fixcycle_db | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# 备份特定表
pg_dump -h localhost -p 5432 -U postgres -t table_name fixcycle_db > table_backup.sql
```

#### 查看备份列表

```bash
# 使用项目脚本查看
node scripts/backup-database.js list

# 手动查看备份目录
ls -la backups/
```

#### 清理旧备份

```bash
# 使用项目脚本清理
node scripts/backup-database.js cleanup

# 手动清理7天前的备份
find backups/ -name "backup-*.sql*" -mtime +7 -delete
```

### 数据库恢复

#### 恢复完整数据库

```bash
# 使用项目恢复脚本
node scripts/backup-database.js restore backup-file.sql

# 手动恢复
psql -h localhost -p 5432 -U postgres -d fixcycle_db < backup-file.sql

# 解压并恢复
gunzip -c backup-file.sql.gz | psql -h localhost -p 5432 -U postgres -d fixcycle_db
```

#### 恢复特定表

```bash
# 从完整备份中提取特定表
pg_restore -h localhost -p 5432 -U postgres -d fixcycle_db -t table_name backup-file.dump

# 或使用SQL命令
psql -h localhost -p 5432 -U postgres -d fixcycle_db -c "\i table_backup.sql"
```

### n8n 配置备份

#### 备份 n8n 工作流

```bash
# 导出所有工作流
curl -X GET "http://localhost:5678/workflows" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" > n8n-workflows-backup.json

# 使用项目脚本备份
node scripts/backup-n8n.js

# 备份环境变量
curl -X GET "http://localhost:5678/variables" \
  -H "Authorization: Bearer YOUR_API_TOKEN" > n8n-variables-backup.json
```

#### 恢复 n8n 配置

```bash
# 导入工作流
curl -X POST "http://localhost:5678/workflows" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @n8n-workflows-backup.json

# 导入环境变量
curl -X POST "http://localhost:5678/variables" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @n8n-variables-backup.json
```

### 系统配置文件备份

#### 备份关键配置文件

```bash
# 创建配置备份目录
mkdir -p config-backups/$(date +%Y%m%d)

# 备份环境变量文件
cp .env config-backups/$(date +%Y%m%d)/

# 备份数据库配置
cp supabase/config.toml config-backups/$(date +%Y%m%d)/

# 备份n8n配置
cp .env.n8n config-backups/$(date +%Y%m%d)/

# 备份监控配置
cp -r config/monitoring config-backups/$(date +%Y%m%d)/
```

#### 灾难恢复演练

##### 完整系统恢复步骤

```bash
# 1. 恢复系统环境
# 安装Node.js、PostgreSQL、n8n等依赖

# 2. 恢复配置文件
cp config-backups/YYYYMMDD/.env .
cp config-backups/YYYYMMDD/config.toml supabase/

# 3. 恢复数据库
node scripts/backup-database.js restore backup-file.sql

# 4. 恢复n8n配置
# 导入工作流和环境变量

# 5. 启动服务
npm run start
n8n
```

##### 验证恢复结果

```bash
# 运行健康检查
node scripts/full-health-check.js

# 验证核心功能
node scripts/system-validation.js

# 检查数据完整性
node scripts/db-validate.js
```

---

## 常见告警定位与处理

### 健康检查失败处理

#### 系统健康检查

```bash
# 运行完整健康检查
node scripts/full-health-check.js

# 快速健康检查
node scripts/quick-health-check.js

# 系统验证
node scripts/system-validation.js
```

#### 常见健康检查失败原因

##### 数据库连接失败

```bash
# 检查数据库状态
systemctl status postgresql  # Linux
net start | findstr postgres  # Windows

# 检查连接参数
echo $DATABASE_URL  # Linux/Mac
echo %DATABASE_URL%  # Windows

# 测试连接
psql -h localhost -p 5432 -U postgres -c "SELECT 1;"
```

##### n8n 服务不可用

```bash
# 检查n8n进程
ps aux | grep n8n  # Linux
tasklist | findstr n8n  # Windows

# 检查端口占用
netstat -tlnp | grep 5678  # Linux
netstat -ano | findstr 5678  # Windows

# 重启n8n服务
n8n stop
n8n start
```

##### Redis 连接失败

```bash
# 检查Redis服务
systemctl status redis  # Linux
net start | findstr redis  # Windows

# 测试Redis连接
redis-cli ping

# 检查配置
echo $REDIS_URL
```

### 性能瓶颈排查

#### CPU 使用率过高

```bash
# 查看CPU使用情况
top  # Linux
taskmgr  # Windows

# 查看Node.js进程CPU使用
ps aux | grep node | head -10

# 分析CPU热点
node --prof app.js
node --prof-process isolate-*.log > processed.txt
```

#### 内存不足

```bash
# 查看内存使用
free -h  # Linux
wmic OS get TotalVisibleMemorySize /value  # Windows

# 查看Node.js内存使用
node -e "console.log(process.memoryUsage())"

# 检查内存泄漏
node --inspect app.js
# 然后在Chrome中打开 chrome://inspect
```

#### 数据库性能问题

```bash
# 查看慢查询日志
tail -f /var/log/postgresql/postgresql-*.log | grep duration

# 分析查询性能
EXPLAIN ANALYZE SELECT * FROM your_table WHERE condition;

# 查看数据库统计
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### 数据一致性问题诊断

#### 数据库完整性检查

```bash
# 运行数据验证脚本
node scripts/db-validate.js

# 检查外键约束
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';

# 检查重复数据
SELECT column_name, COUNT(*)
FROM table_name
GROUP BY column_name
HAVING COUNT(*) > 1;
```

#### 缓存一致性检查

```bash
# 清除Redis缓存
redis-cli FLUSHALL

# 检查缓存命中率
INFO stats

# 验证缓存数据
GET key_name
```

### 服务不可用应急响应

#### 紧急故障排除流程

```bash
# 1. 确认服务状态
systemctl status fixcycle-app
systemctl status postgresql
systemctl status n8n

# 2. 查看错误日志
tail -n 50 logs/error.log
journalctl -u fixcycle-app -n 50

# 3. 检查资源使用
df -h  # 磁盘空间
free -h  # 内存
uptime  # 系统负载

# 4. 重启关键服务
systemctl restart fixcycle-app
systemctl restart postgresql

# 5. 验证服务恢复
curl -I http://localhost:3000/health
```

#### 回滚操作

```bash
# 回滚到上一个稳定版本
git checkout HEAD~1
npm install
npm run build
pm2 restart fixcycle-app

# 数据库回滚
node scripts/db-rollback.js

# n8n工作流回滚
# 使用备份的工作流配置重新导入
```

---

## 性能监控与优化

### 监控指标收集

#### 应用性能监控

```bash
# 启动性能监控
node scripts/monitor-realtime-system.js

# 查看监控数据
curl http://localhost:3000/api/monitoring/metrics

# 实时监控面板
pm2 monit
```

#### 数据库性能监控

```bash
# 启用查询统计
ALTER SYSTEM SET pg_stat_statements.track = 'all';
SELECT pg_reload_conf();

# 查看查询统计
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### 性能优化建议

#### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 分析表统计信息
ANALYZE parts;
ANALYZE appointments;

-- 清理死元组
VACUUM FULL parts;
```

#### 应用层优化

```javascript
// 启用缓存
const redis = require("redis");
const client = redis.createClient();

// 实施请求限流
const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 100次请求
  })
);
```

---

## 安全与权限管理

### 访问控制

#### 用户权限管理

```bash
# 管理后台用户
node scripts/manage-users.js --list
node scripts/manage-users.js --add --username admin --role administrator

# 数据库用户权限
CREATE USER app_user WITH PASSWORD 'password';
GRANT CONNECT ON DATABASE fixcycle_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
```

#### API 密钥管理

```bash
# 生成新的API密钥
node scripts/generate-api-key.js

# 验证密钥有效性
node scripts/verify-api-keys.js

# 轮换密钥
node scripts/rotate-api-keys.js
```

### 安全审计

#### 日志审计

```bash
# 查看安全相关日志
grep -i "authentication\|authorization\|denied" logs/app.log

# 审计数据库访问
SELECT query, userid::regrole, calls
FROM pg_stat_statements
WHERE query ILIKE '%delete%' OR query ILIKE '%drop%'
ORDER BY calls DESC;
```

#### 定期安全检查

```bash
# 运行安全扫描
npm audit
npm audit fix

# 检查依赖漏洞
npx nlf --summary

# 验证SSL证书
openssl x509 -in certificate.crt -text -noout
```

---

## 附录

### 常用命令速查表

| 功能         | 命令                                     |
| ------------ | ---------------------------------------- |
| 查看服务状态 | `systemctl status fixcycle-app`          |
| 重启应用     | `pm2 restart fixcycle-app`               |
| 查看日志     | `tail -f logs/app.log`                   |
| 数据库备份   | `node scripts/backup-database.js backup` |
| 健康检查     | `node scripts/full-health-check.js`      |
| 查看进程     | `ps aux \| grep node`                    |
| 查看端口     | `netstat -tlnp \| grep 3000`             |

### 联系信息

- **技术支持**: support@fixcycle.com
- **紧急联系**: +86-XXX-XXXX-XXXX
- **文档更新**: 2024 年 1 月

### 版本历史

- v1.0.0 (2024-01-15): 初始版本发布
- v1.1.0 (2024-01-20): 增加性能监控章节
- v1.2.0 (2024-01-25): 完善安全管理和应急响应

---

_本文档最后更新时间: 2024 年 1 月 25 日_
