import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/types';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // 本地 Ganache 节点
    ganache: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        count: 10,
      },
    },
    // Hardhat 内置节点（默认）
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        count: 10,
      },
    },
    // 生产私有链配置（需根据实际修改）
    privateChain: {
      url: process.env.PRIVATE_CHAIN_URL || 'http://localhost:8545',
      chainId: parseInt(process.env.PRIVATE_CHAIN_ID || '1337'),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Besu 私有链生产环境
    besu: {
      url:
        process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
      chainId: parseInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || '2024'),
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [
            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          ], // 默认测试账户
      timeout: 30000,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

// TypeChain 配置（使用 any 类型绕过类型检查）
(config as any).typechain = {
  outDir: './typechain-types',
  target: 'ethers-v6',
};

export default config;
