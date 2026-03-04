# 智能议价引擎生产环境部署检查清单

## 📋 部署前准备

### 🔧 环境配置检查

- [ ] 确认生产环境服务器可用
- [ ] 检查 Node.js 版本 (推荐 v18.x LTS)
- [ ] 确认 npm/yarn 可用
- [ ] 验证 Git 访问权限
- [ ] 确认 PM2 或类似进程管理工具已安装

### 🔐 安全配置

- [ ] 获取生产环境 Supabase 密钥
- [ ] 配置 HTTPS 证书
- [ ] 设置防火墙规则
- [ ] 配置环境变量文件
- [ ] 确认数据库连接凭据

### 🗄️ 数据库准备

- [ ] 确认 Supabase 生产数据库可用
- [ ] 执行数据库迁移脚本
- [ ] 验证表结构创建成功
- [ ] 初始化基础数据
- [ ] 配置数据库连接池

## 🚀 部署步骤

### 1. 代码部署

```bash
# 克隆代码库
git clone https://github.com/your-org/3cep.git
cd 3cep

# 切换到生产分支
git checkout production

# 安装依赖
npm install --production
```

### 2. 环境配置

```bash
# 复制生产环境配置
cp .env.production .env.local

# 编辑配置文件，填入实际密钥
nano .env.local
```

### 3. 数据库迁移

```bash
# 执行数据库迁移
npx supabase db push --local

# 验证表结构
node scripts/validate-negotiation-engine.js
```

### 4. 应用构建

```bash
# 构建生产版本
npm run build

# 验证构建成功
ls .next/
```

### 5. 服务部署

```bash
# 使用PM2启动应用
pm2 start npm --name "3cep-negotiation" -- start

# 或使用系统服务
sudo systemctl start 3cep-negotiation
```

## 🔍 部署验证

### 基础功能验证

- [ ] 应用服务正常启动
- [ ] API 端点可访问
- [ ] 数据库连接正常
- [ ] 议价策略可加载
- [ ] 供应商数据可查询

### 核心功能测试

- [ ] 启动议价会话
- [ ] 执行多轮议价
- [ ] 策略匹配正确
- [ ] 价格建议合理
- [ ] 历史记录保存

### 性能测试

- [ ] 响应时间 < 2 秒
- [ ] 并发处理能力
- [ ] 内存使用正常
- [ ] CPU 占用合理

### 验收标准验证

- [ ] 议价成功率 ≥ 60%
- [ ] 平均折扣率 ≥ 5%
- [ ] 系统稳定性良好
- [ ] 错误率 < 1%

## 📊 监控配置

### 日志监控

```bash
# 查看应用日志
pm2 logs 3cep-negotiation

# 查看错误日志
pm2 logs 3cep-negotiation --err
```

### 性能监控

- [ ] 配置 APM 监控工具
- [ ] 设置关键指标告警
- [ ] 配置数据库性能监控
- [ ] 设置资源使用告警

### 健康检查

```bash
# 定期健康检查
curl -f http://localhost:3000/api/health

# 自动化检查脚本
node scripts/validate-negotiation-engine.js
```

## 🆘 故障处理

### 常见问题排查

1. **服务无法启动**
   - 检查端口占用
   - 验证环境变量
   - 查看错误日志

2. **数据库连接失败**
   - 验证连接字符串
   - 检查网络连通性
   - 确认数据库状态

3. **议价功能异常**
   - 检查策略数据
   - 验证供应商信息
   - 查看业务逻辑日志

### 回滚方案

```bash
# 停止当前服务
pm2 stop 3cep-negotiation

# 恢复备份版本
tar -xzf /var/backups/3cep/backup_*.tar.gz -C /var/www/

# 重启服务
pm2 start 3cep-negotiation
```

## 📈 上线后监控

### 关键指标监控

- 议价会话数量
- 成功率趋势
- 平均折扣率
- 系统响应时间
- 错误率统计

### 用户反馈收集

- 功能使用情况
- 性能体验反馈
- 建议和改进意见
- 问题报告处理

## ✅ 部署完成确认

- [ ] 所有检查项已完成
- [ ] 核心功能验证通过
- [ ] 性能指标达标
- [ ] 监控告警配置完成
- [ ] 运维文档更新
- [ ] 团队培训完成

---

**部署负责人**: **\*\*\*\***\_**\*\*\*\***
**部署日期**: **\*\*\*\***\_**\*\*\*\***
**部署版本**: **\*\*\*\***\_**\*\*\*\***
