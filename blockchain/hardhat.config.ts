import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
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
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
      },
    },
    // Hardhat 内置节点（默认）
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
      },
    },
    // 生产私有链配置（需根据实际修改）
    privateChain: {
      url: process.env.PRIVATE_CHAIN_URL || "http://localhost:8545",
      chainId: parseInt(process.env.PRIVATE_CHAIN_ID || "1337"),
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

// TypeChain 配置（使用 any 类型绕过类型检查）
(config as any).typechain = {
  outDir: "./typechain-types",
  target: "ethers-v6",
};

export default config;
