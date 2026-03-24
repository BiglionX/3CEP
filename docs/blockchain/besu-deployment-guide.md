# Besu 私有链生产环境部署指南

**文档版本**: v1.0
**更新日期**: 2026-03-23
**适用系统**: Linux / macOS / Windows (WSL)

---

## 📋 概述

本指南将帮助您部署 Hyperledger Besu 私有链，用于 FixCycle 6.0 的产品防伪溯源系统。

### 核心特性

- ✅ **IBFT2 共识机制** - PoA 联盟链，快速出块（5 秒）
- ✅ **3 个验证节点** - 高可用集群部署
- ✅ **Gas 免费** - 企业级应用，无需交易费用
- ✅ **权限控制** - 仅授权节点可参与共识
- ✅ **Docker 容器化** - 一键部署，易于维护

---

## 🛠️ 前置要求

### 系统要求

- **操作系统**: Ubuntu 20.04+ / macOS 11+ / Windows 10+ (WSL2)
- **CPU**: 4 核以上（推荐 8 核）
- **内存**: 8GB 以上（推荐 16GB）
- **磁盘**: 50GB 可用空间
- **网络**: 开放端口 30303, 8545-8550

### 软件依赖

```bash
# Docker 安装（Ubuntu）
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Docker Compose 安装
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

---

## 🚀 快速部署

### 步骤 1：准备配置文件

所有配置文件已在 `blockchain/` 目录下：

```
blockchain/
├── docker-compose.besu.yml    # Docker Compose 配置
├── besu-config.toml           # Besu 节点配置
├── genesis.json               # 创世块配置
├── deploy-besu.sh             # 部署脚本（Linux/macOS）
└── deploy-besu.bat            # 部署脚本（Windows）
```

### 步骤 2：执行部署脚本

#### Linux/macOS

```bash
cd blockchain
chmod +x deploy-besu.sh
./deploy-besu.sh
```

#### Windows (PowerShell)

```powershell
cd blockchain
.\deploy-besu.bat
```

### 步骤 3：验证部署

```bash
# 检查容器状态
docker-compose -f docker-compose.besu.yml ps

# 查看节点日志
docker-compose -f docker-compose.besu.yml logs besu-validator-1

# 测试 JSON-RPC 连接
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
  http://localhost:8545
```

预期响应：

```json
{ "jsonrpc": "2.0", "id": 1, "result": "2024" }
```

---

## ⚙️ 配置说明

### 网络参数

| 参数              | 值          | 说明                |
| ----------------- | ----------- | ------------------- |
| **Chain ID**      | 2024        | 私有链唯一标识      |
| **共识机制**      | IBFT2       | 拜占庭容错共识      |
| **出块时间**      | 5 秒        | 每 5 秒出一个新区块 |
| **Gas 价格**      | 0           | 免费交易            |
| **区块 Gas 限制** | 134,217,728 | 每区块最大 Gas      |

### 节点信息

| 节点            | RPC 端口 | WebSocket 端口 | P2P 端口 | 角色     |
| --------------- | -------- | -------------- | -------- | -------- |
| **Validator 1** | 8545     | 8546           | 30303    | 主节点   |
| **Validator 2** | 8547     | 8548           | 30304    | 备份节点 |
| **Validator 3** | 8549     | 8550           | 30305    | 备份节点 |

### 预分配账户

创世块中已预分配 3 个测试账户，每个账户 10,000 ETH：

```json
{
  "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73": {
    "balance": "10000000000000000000000"
  },
  "0xf17f52151ebef6c7334fad080c5704d77216b732": {
    "balance": "10000000000000000000000"
  },
  "0xc5fdf4076b8f3a5357c5e395ab970b5b54f98fef": {
    "balance": "10000000000000000000000"
  }
}
```

---

## 🔧 智能合约部署

### 1. 编译合约

```bash
cd blockchain
npm run compile
```

### 2. 部署到 Besu 私有链

```bash
npm run deploy:besu
```

部署成功后会显示合约地址：

```
Contract Address: 0x1234567890abcdef...
```

### 3. 更新配置

将合约地址更新到 `src/lib/blockchain/config.ts`:

```typescript
export const contractAddresses = {
  productAuth: '0x1234567890abcdef...', // 新部署的地址
};
```

---

## 📊 监控和维护

### 查看节点状态

```bash
# 查看区块高度
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# 查看节点信息
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' \
  http://localhost:8545
```

### 日志管理

```bash
# 实时查看所有节点日志
docker-compose -f docker-compose.besu.yml logs -f

# 查看特定节点日志
docker-compose -f docker-compose.besu.yml logs besu-validator-1

# 保存日志到文件
docker-compose -f docker-compose.besu.yml logs > besu-logs-$(date +%Y%m%d).txt
```

### 停止节点

```bash
# 优雅停止
docker-compose -f docker-compose.besu.yml down

# 停止并删除数据（谨慎使用）
docker-compose -f docker-compose.besu.yml down -v
```

---

## 🔄 备份和恢复

### 数据目录

```
blockchain/besu-data/
├── validator-1/
│   ├── key              # 私钥
│   └── db/              # 区块链数据
├── validator-2/
└── validator-3/
```

### 备份命令

```bash
# 备份整个数据目录
tar -czf besu-backup-$(date +%Y%m%d).tar.gz besu-data/

# 恢复
tar -xzf besu-backup-20260323.tar.gz
```

---

## ⚠️ 故障排查

### 问题 1：节点无法启动

**症状**: 容器启动后立即退出

**解决方案**:

```bash
# 查看详细错误
docker-compose -f docker-compose.besu.yml logs besu-validator-1

# 检查配置文件格式
cat besu-config.toml
cat genesis.json

# 清理数据重新启动
rm -rf besu-data/*/db
docker-compose -f docker-compose.besu.yml up -d
```

### 问题 2：无法连接 RPC

**症状**: curl 请求超时

**解决方案**:

```bash
# 检查端口是否监听
netstat -tlnp | grep 8545

# 检查防火墙
sudo ufw allow 8545/tcp

# 检查容器健康状态
docker inspect besu-validator-1 | grep Health
```

### 问题 3：共识失败

**症状**: 区块高度不增长

**解决方案**:

```bash
# 检查验证节点连接
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"ibft_getValidatorsByBlockNumber","params":["latest"],"id":1}' \
  http://localhost:8545

# 重启所有节点
docker-compose -f docker-compose.besu.yml restart
```

---

## 📝 下一步

1. ✅ **部署智能合约** - ProductAuth.sol
2. ✅ **集成到应用** - 更新前端配置
3. ✅ **测试功能** - 产品注册、验证、溯源
4. ✅ **性能调优** - 根据实际需求调整参数

---

## 🔗 相关资源

- [Hyperledger Besu 官方文档](https://besu.hyperledger.org/)
- [IBFT2 共识协议详解](https://besu.hyperledger.org/en/stable/Concepts/Consensus/IBFT/)
- [智能合约部署指南](../contracts/README.md)
- [区块链服务层文档](../../src/lib/blockchain/README.md)

---

**技术支持**: AI 技术团队
**反馈问题**: GitHub Issues
