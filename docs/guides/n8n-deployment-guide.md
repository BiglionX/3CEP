# n8n 部署配置说明

## 📋 配置概览

已根据您提供的环境变量完成了 n8n 的配置，包含以下关键设置：

### 🔐 安全配置
- **加密密钥**: 已生成安全的 32 字节随机密钥
- **数据库密码**: 已设置强密码 `N8n_Secure_Pass_2026!`

### 🌐 网络配置
- **域名**: `n8n.yourdomain.com`
- **协议**: HTTPS
- **端口**: 5678
- **时区**: Asia/Shanghai

### 🗄️ 数据库配置
- **类型**: PostgreSQL
- **主机**: postgres
- **端口**: 5432
- **用户**: n8n
- **数据库**: n8n

## 🚀 部署步骤

### 方法一：使用部署脚本（推荐）
```bash
deploy-n8n-configured.bat
```

### 方法二：手动部署
```bash
# 停止现有服务
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n down

# 启动服务
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n up -d

# 查看服务状态
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n ps
```

## 🔍 验证配置

运行验证脚本检查配置是否正确：
```bash
node scripts\verify-n8n-config.js
```

## 🌐 访问地址

- **外部访问**: https://n8n.yourdomain.com
- **本地访问**: http://localhost:5678

## 🖼️ iframe 嵌入支持

n8n 已配置支持 iframe 嵌入到其他域名的管理后台页面中：

### 配置详情
- **UI 访问**: 已启用
- **Cookie 策略**: SameSite=None (支持跨域)
- **安全设置**: Secure=true (HTTPS 必须)
- **CORS 来源**: 支持指定域名访问

### 测试嵌入功能
使用提供的测试页面验证嵌入功能：
```bash
# 打开测试页面
start test-n8n-iframe.html
```

### 在管理后台中嵌入
```html
<iframe 
    src="https://n8n.yourdomain.com" 
    width="100%" 
    height="800px"
    frameborder="0">
</iframe>
```

## ⚙️ 目录结构

```
n8n/
├── custom/          # 自定义节点目录
├── logs/            # 日志文件目录
├── nginx/           # Nginx 配置（可选）
│   ├── conf.d/
│   └── ssl/
└── ssl/             # SSL 证书目录
```

## 🔧 环境变量说明

| 变量名 | 说明 | 值 |
|--------|------|-----|
| N8N_ENCRYPTION_KEY | 加密密钥 | 自动生成的安全密钥 |
| DB_TYPE | 数据库类型 | postgresdb |
| DB_POSTGRESDB_HOST | 数据库主机 | postgres |
| DB_POSTGRESDB_PORT | 数据库端口 | 5432 |
| DB_POSTGRESDB_USER | 数据库用户 | n8n |
| DB_POSTGRESDB_PASSWORD | 数据库密码 | N8n_Secure_Pass_2026! |
| DB_POSTGRESDB_DATABASE | 数据库名称 | n8n |
| N8N_HOST | n8n 主机地址 | n8n.yourdomain.com |
| N8N_PORT | n8n 端口 | 5678 |
| N8N_PROTOCOL | 协议 | https |

## 🛠️ 管理命令

### 查看日志
```bash
docker-compose -f docker-compose.n8n.yml logs -f
```

### 重启服务
```bash
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n restart
```

### 停止服务
```bash
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n down
```

### 更新服务
```bash
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n pull
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n up -d
```

## ⚠️ 注意事项

1. **安全提醒**: 生产环境中请确保：
   - 使用有效的 SSL 证书
   - 配置防火墙规则
   - 定期备份数据
   - 监控系统性能

2. **域名配置**: 需要在 DNS 中将 `n8n.yourdomain.com` 指向服务器 IP

3. **SSL 证书**: 如需 HTTPS，需要配置有效的 SSL 证书

## 🆘 故障排除

### 服务无法启动
```bash
# 查看详细错误信息
docker-compose -f docker-compose.n8n.yml --env-file .env.n8n logs

# 检查端口占用
netstat -an | findstr :5678
```

### 数据库连接失败
- 检查数据库容器是否正常运行
- 验证数据库凭据是否正确
- 确认网络配置是否正确

### 访问被拒绝
- 检查防火墙设置
- 确认域名解析是否正确
- 验证 SSL 证书配置