/**
 * 区块链配置
 * 用于配置私有链节点和合约地址
 */

// 网络配置类型
interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  chainName: string;
  blockExplorerUrl: string;
}

// 区块链网络配置
export const blockchainConfig: {
  development: NetworkConfig;
  production: NetworkConfig;
  defaultNetwork: string;
  [key: string]: NetworkConfig | string;
} = {
  // 本地开发环境（Ganache/Hardhat Node）
  development: {
    rpcUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
    chainId: parseInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || '31337'),
    chainName: 'Localhost',
    blockExplorerUrl: '',
  },

  // 私有链生产环境（需根据实际配置修改）
  production: {
    rpcUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
    chainId: parseInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || '31337'),
    chainName: 'Private Chain',
    blockExplorerUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL || '',
  },

  // 默认使用开发环境
  defaultNetwork: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};

// 合约地址配置（部署后更新）
export const contractAddresses = {
  // ProductAuth 合约地址 - 部署后从 blockchain/deployment-info.json 获取并更新
  productAuth: process.env.NEXT_PUBLIC_PRODUCT_AUTH_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
};

// 获取当前网络配置
export function getNetworkConfig(): NetworkConfig {
  const network = blockchainConfig.defaultNetwork;
  return blockchainConfig[network] as NetworkConfig;
}

// 验证链 ID 是否匹配
export function validateChainId(actualChainId: number): boolean {
  const config = getNetworkConfig();
  return actualChainId === config.chainId;
}
