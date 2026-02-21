# n8n 离线部署包使用说明

## 📦 包含文件

- docker-compose.n8n-minimal.yml - 部署配置文件
- .env.n8n - 环境变量配置
- deploy-n8n-offline.bat - 离线部署脚本
- 部署验证脚本和文档

## 🚀 部署步骤

### 1. 准备阶段

确保已安装：

- Docker Desktop 20.10+
- Node.js 14+ (用于验证)

### 2. 获取镜像文件

选择以下任一方式获取 Docker 镜像：

**方式 A：从可联网环境导出**

```bash
# 在可联网机器上执行
docker pull postgres:15-alpine
docker pull n8nio/n8n:latest
docker save postgres:15-alpine n8nio/n8n:latest > n8n-images.tar
```

**方式 B：联系管理员获取镜像包**

### 3. 导入镜像

```cmd
docker load < n8n-images.tar
```

### 4. 执行部署

```cmd
deploy-n8n-offline.bat
```

### 5. 验证部署

```cmd
node scripts/test-n8n-deployment.js
```

## 🔧 管理命令

```cmd
# 启动服务
docker-compose -f docker-compose.n8n-minimal.yml up -d

# 停止服务
docker-compose -f docker-compose.n8n-minimal.yml down

# 查看日志
docker-compose -f docker-compose.n8n-minimal.yml logs -f n8n

# 查看状态
docker-compose -f docker-compose.n8n-minimal.yml ps
```

## 🌐 访问地址

部署成功后访问：http://localhost:5678

## 📞 技术支持

如遇问题请联系系统管理员
