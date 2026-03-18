# 3CEP 区块链模块

本模块提供基于以太坊私有链的产品防伪溯源功能。

## 目录结构

```
blockchain/
├── contracts/          # 智能合约源码
│   └── ProductAuth.sol
├── scripts/           # 部署脚本
│   └── deploy.ts
├── artifacts/         # 编译产物
├── cache/            # 缓存
├── hardhat.config.ts # Hardhat 配置
├── tsconfig.json     # TypeScript 配置
└── package.json      # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
cd blockchain
npm install
```

### 2. 启动本地私有链（Ganache）

方式一：使用 Ganache CLI
```bash
npm run ganache
```

方式二：使用 Hardhat 内置节点
```bash
npm run node
```

默认配置：
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Network ID: 1337

### 3. 编译智能合约

```bash
npm run compile
```

### 4. 部署合约

```bash
# 部署到本地节点
npm run deploy:local

# 或指定网络部署
npm run deploy:ganache
```

部署成功后会生成 `deployment-info.json`，包含合约地址。

## 合约功能

### 产品注册
- `registerProduct()` - 注册单个产品
- `batchRegisterProducts()` - 批量注册产品

### 防伪验证
- `verifyProduct()` - 验证产品真伪
- `isProductRegistered()` - 检查产品是否已注册

### 溯源记录
- `addTraceabilityRecord()` - 添加溯源记录
- `batchAddTraceability()` - 批量添加溯源记录
- `getTraceabilityHistory()` - 查询溯源历史

### 查询接口
- `getProductInfo()` - 获取产品详情
- `getTraceabilityCount()` - 获取溯源记录数量
- `getBatchProductCount()` - 获取批次产品数量

## API 集成

部署合约后，在前端应用中配置合约地址：

```typescript
// 合约配置
export const blockchainConfig = {
  contractAddress: "YOUR_CONTRACT_ADDRESS", // 从 deployment-info.json 获取
  network: {
    chainId: 1337,
    name: "localhost"
  }
};
```

## 生产环境部署

1. 启动私有链节点（Geth/Besu）
2. 配置 `hardhat.config.ts` 中的 privateChain 网络
3. 设置环境变量：
   ```bash
   export PRIVATE_CHAIN_URL="http://your-node:8545"
   export PRIVATE_CHAIN_ID=1337
   export PRIVATE_KEY="your-private-key"
   ```
4. 部署到私有链：
   ```bash
   npx hardhat run scripts/deploy.ts --network privateChain
   ```

## 账户说明

默认测试账户（Ganache）：
- Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (部署者)
- Account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
- ... (共10个测试账户)

每个账户初始余额：10000 ETH
