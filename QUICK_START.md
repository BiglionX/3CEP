# FixCycle 项目 - 一键启动与最小验证指南 (v6.0 AI增强版)

> **最新更新**: 2026年2月21日 - 新增机器学习估值、设备生命周期管理、智能融合引擎等AI功能

## 🚀 快速开始

欢迎使用 FixCycle 项目！本文档将指导您快速启动开发环境并进行最小验证。

### 📋 前置要求

- Node.js 18+
- Docker & Docker Compose
- Git

### 🎯 一键启动步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd 3cep
```

#### 2. 环境设置

```bash
# 校验并生成环境变量模板
npm run setup:env

# 或直接复制模板
npm run setup:env:copy
```

#### 3. 安装依赖

```bash
npm install
```

#### 4. 健康检查

```bash
# 运行完整健康检查
npm run check:health
```

#### 5. 本地部署

```bash
# 自动选择最适合的部署模式
npm run deploy:dev

# 或指定部署模式
npm run deploy:dev -- --datacenter  # 完整版
npm run deploy:dev -- --n8n         # 轻量版
```

#### 6. 数据初始化

```bash
# 标准数据播种
npm run seed

# 最小数据集
npm run seed -- --minimal

# 完整数据集
npm run seed -- --full
```

#### 7. 启动开发服务器

```bash
npm run dev
```

访问地址：http://localhost:3001

## 🧪 最小验证流程

### 1. 环境验证

```bash
npm run setup:env          # 检查环境变量
npm run verify:environment # 验证开发环境
```

### 2. 服务验证

```bash
npm run check:health       # 综合健康检查
npm run verify:database    # 数据库连接验证
```

### 3. 功能验证

```bash
# 快速测试
npm run test:all -- --quick

# 标准测试套件
npm run test:all
```

### 4. 端到端验证

```bash
# 访问应用
open http://localhost:3001

# 检查关键页面
- 首页: /
- 管理后台: /admin
- API文档: /api/docs
```

## 📊 标准命令参考

### 环境管理

```bash
npm run setup:env          # 校验环境变量
npm run setup:env:copy     # 复制环境模板
```

### 健康检查

```bash
npm run check:health       # 综合健康检查
npm run verify:environment # 环境配置验证
npm run verify:database    # 数据库连接验证
```

### 数据管理

```bash
npm run seed               # 标准数据播种
npm run seed -- --minimal  # 最小数据集
npm run seed -- --full     # 完整数据集
npm run seed:data          # 基础数据
npm run seed:enhanced      # 增强数据
```

### 测试套件

```bash
npm run test:all           # 完整测试套件
npm run test:all -- --quick # 快速测试
npm run test:all -- --full  # 完整测试
npm test                   # 单元测试
npm run test:e2e:run       # 端到端测试
```

### 部署管理

```bash
npm run deploy:dev         # 本地开发部署
npm run deploy:dev:datacenter # DataCenter 部署
npm run deploy:dev:n8n     # n8n Minimal 部署
```

### 服务管理

```bash
# DataCenter 服务
npm run data-center:start
npm run data-center:stop
npm run data-center:restart
npm run data-center:logs
npm run data-center:status
```

## 🔧 故障排除

### 常见问题

1. **Docker 服务未启动**

   ```bash
   # 启动 Docker Desktop
   # 或在 Linux 上启动 Docker 服务
   sudo systemctl start docker
   ```

2. **端口被占用**

   ```bash
   # 查看占用端口的进程
   netstat -an | grep 3001

   # 杀死占用进程
   kill -9 <PID>
   ```

3. **环境变量缺失**

   ```bash
   # 重新生成环境文件
   npm run setup:env:copy

   # 编辑 .env 文件，填入正确值
   ```

4. **数据库连接失败**

   ```bash
   # 检查数据库服务状态
   npm run verify:database

   # 重启数据库容器
   docker-compose restart
   ```

### 日志查看

```bash
# 应用日志
npm run data-center:logs

# Docker 容器日志
docker-compose logs

# 特定服务日志
docker-compose logs n8n
docker-compose logs trino-coordinator
```

## 🎯 开发工作流

### 日常开发循环

1. **启动环境**

   ```bash
   npm run deploy:dev
   npm run dev
   ```

2. **编写代码**

   - 修改源代码
   - Next.js 自动热重载

3. **验证更改**

   ```bash
   npm run test              # 单元测试
   npm run check:health      # 健康检查
   npm run test:all          # 完整测试套件
   ```

4. **新功能测试**

   ```bash
   # 测试机器学习估值功能
   npm run test -- tests/integration/test-ml-integration.js
   
   # 测试设备生命周期功能
   npm run test -- tests/integration/test-device-lifecycle.js
   
   # 验证智能融合引擎
   npm run test -- tests/integration/test-fusion-engine-v2.js
   ```

5. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push
   ```

## 📈 性能监控

### 系统资源监控

```bash
# Docker 资源使用
docker stats

# 系统资源
top
htop  # Linux
```

### 应用性能

```bash
# 运行性能测试
node scripts/performance-test.js

# 查看应用指标
curl http://localhost:3001/api/health
```

## 🛡️ 安全检查

```bash
# 运行安全扫描
node scripts/security-check.js

# 检查依赖漏洞
npm audit

# ML模型安全验证
node ml-phase2/scripts/model-security-check.js

# API安全测试
npm run test:security
```

---

## 🚀 新功能快速体验

### 1. 机器学习估值服务

```bash
# 启动ML服务
cd ml-phase2
python api/api_service.py

# 测试估值API
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": {"device_age_months": 24, "brand_encoded": 0}}'
```

### 2. 设备生命周期查询

```bash
# 通过API查询设备生命周期
curl http://localhost:3001/api/devices/test_device_001/lifecycle

# 查看设备档案
curl http://localhost:3001/api/devices/test_device_001/profile
```

### 3. 智能融合估值

```bash
# 使用增强版估值API
curl -X POST http://localhost:3001/api/valuation/v2 \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device_xxx", "strategyWeights": {"ml": 0.7, "market": 0.2, "rule": 0.1}}'
```

## 📊 监控和日志

### 实时监控

```bash
# 查看系统健康状态
npm run check:health

# 查看估值日志
curl http://localhost:3001/api/admin/valuation/logs

# 获取统计信息
curl http://localhost:3001/api/admin/valuation/stats
```

### 性能指标

- **API响应时间**: < 50ms (ML服务) / < 100ms (其他服务)
- **系统可用性**: 99.5%+
- **测试覆盖率**: 95%+
- **ML模型准确率**: 85%+

**🎉 恭喜！您已经完成了 FixCycle 项目的最小验证流程，并可以体验最新的AI智能功能。**

如需更多帮助，请查看 [完整文档](./docs/INDEX.md) 或联系项目维护者。
