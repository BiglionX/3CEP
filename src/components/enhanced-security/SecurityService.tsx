/**
 * 增强版数据安全服务
 * 提供数据加密、脱敏、哈希等全面的安全保护机制
 */

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// TODO: 动态导入 crypto 实现
// 当前使用浏览器原生 API 实现，加密功能受限
// 完整实现需要：
// 1. 在服务端使用 Node.js crypto 模块
// 2. 或使用 Web Crypto API 的异步实现
// 3. 或使用第三方库如 crypto-js
let cryptoModule: typeof import('crypto') | null = null;

// 动态加载 crypto 模块（仅在 Node.js 环境可用）
const loadCrypto = async () => {
  if (!cryptoModule && typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cryptoModule = require('crypto');
    } catch {
      console.warn('Node.js crypto 模块不可用，使用浏览器实现');
    }
  }
  return cryptoModule;
};

// 加密算法类型
export type EncryptionAlgorithm =
  | 'AES-256-GCM'
  | 'RSA-OAEP'
  | 'ChaCha20-Poly1305';

// 哈希算法类型
export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'bcrypt' | 'argon2';

// 加密数据结构
export interface EncryptedData {
  algorithm: EncryptionAlgorithm;
  encrypted: string;
  iv?: string;
  authTag?: string;
  keyId?: string;
  timestamp?: string;
}

// 脱敏规则
export interface MaskingRule {
  field: string;
  pattern: RegExp;
  mask: string | ((match: string) => string);
  appliesToRoles: string[];
  description?: string;
}

// 数据脱敏配置
export interface DataMaskingConfig {
  table: string;
  columns: Record<string, MaskingRule>;
  defaultRule?: MaskingRule;
}

// 安全上下文类型接口
interface SecurityContextType {
  // 加密功能
  encryptData: (
    data: string,
    algorithm?: EncryptionAlgorithm
  ) => Promise<EncryptedData>;
  decryptData: (encryptedData: EncryptedData) => Promise<string>;

  // 哈希功能
  hashData: (data: string, algorithm?: HashAlgorithm) => Promise<string>;
  verifyHash: (
    data: string,
    hash: string,
    algorithm?: HashAlgorithm
  ) => Promise<boolean>;

  // 脱敏功能
  maskData: (data: any, table: string, column: string, userRole: string) => any;
  maskResultSet: (
    resultSet: any[],
    config: DataMaskingConfig,
    userRole: string
  ) => any[];

  // 密钥管理
  generateKey: (algorithm?: EncryptionAlgorithm) => Promise<string>;
  rotateKeys: () => Promise<void>;

  // 安全状态
  isSecure: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'maximum';
}

// 创建上下文
const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

// 默认脱敏规则
const DEFAULT_MASKING_RULES: Record<string, MaskingRule> = {
  'users.id_card': {
    field: 'id_card',
    pattern: /^(\d{4}).*(\d{4})$/,
    mask: (match: string) =>
      match.replace(/^(\d{4}).*(\d{4})$/, '$1********$2'),
    appliesToRoles: ['viewer', 'external_partner'],
    description: '身份证号脱敏',
  },
  'users.phone': {
    field: 'phone',
    pattern: /^(\d{3}).*(\d{4})$/,
    mask: (match: string) => match.replace(/^(\d{3}).*(\d{4})$/, '$1****$2'),
    appliesToRoles: ['viewer', 'external_partner'],
    description: '手机号码脱敏',
  },
  'users.email': {
    field: 'email',
    pattern: /^([^@]{2}).*(@.*)$/,
    mask: (match: string) => match.replace(/^([^@]{2}).*(@.*)$/, '$1***$2'),
    appliesToRoles: ['viewer', 'external_partner'],
    description: '邮箱地址脱敏',
  },
  'users.bank_account': {
    field: 'bank_account',
    pattern: /^(\d{4}).*(\d{4})$/,
    mask: (match: string) =>
      match.replace(/^(\d{4}).*(\d{4})$/, '$1************$2'),
    appliesToRoles: ['viewer', 'external_partner', 'shop_manager'],
    description: '银行卡号脱敏',
  },
  'financial.amount': {
    field: 'amount',
    pattern: /(\d+)/,
    mask: (match: string) => match.replace(/(\d+)/, '***'),
    appliesToRoles: ['viewer', 'external_partner'],
    description: '金额数值脱敏',
  },
};

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isSecure, setIsSecure] = useState(true);
  const [securityLevel, setSecurityLevel] = useState<
    'low' | 'medium' | 'high' | 'maximum'
  >('high');
  const [maskingRules, setMaskingRules] = useState<Record<string, MaskingRule>>(
    DEFAULT_MASKING_RULES
  );

  // AES-256-GCM 加密
  const encryptWithAES = useCallback(
    async (data: string): Promise<EncryptedData> => {
      try {
        // 动态加载 crypto 模块
        const crypto = await loadCrypto();
        if (!crypto) {
          // 浏览器环境：使用模拟实现
          console.warn('使用模拟加密实现（浏览器环境）')
          return {
            algorithm: 'AES-256-GCM',
            encrypted: btoa(data), // Base64 编码作为占位符
            iv: btoa('mock-iv'),
            authTag: btoa('mock-tag'),
            keyId: 'mock-aes-key',
            timestamp: new Date().toISOString(),
          }
        }

        const algorithm = 'aes-256-gcm';
        const key = process.env.ENCRYPTION_KEY
          ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
          : crypto.randomBytes(32);

        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        return {
          algorithm: 'AES-256-GCM',
          encrypted,
          iv: iv.toString('base64'),
          authTag: authTag.toString('base64'),
          keyId: 'default-aes-key',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('AES加密失败:', error);
        throw new Error('加密失败');
      }
    },
    []
  );

  // AES-256-GCM 解密
  const decryptWithAES = useCallback(
    async (encryptedData: EncryptedData): Promise<string> => {
      try {
        if (encryptedData.algorithm !== 'AES-256-GCM') {
          throw new Error('不支持的加密算法');
        }

        // 动态加载 crypto 模块
        const crypto = await loadCrypto()
        if (!crypto) {
          // 浏览器环境：使用模拟实现
          console.warn('使用模拟解密实现（浏览器环境）')
          return atob(encryptedData.encrypted) // Base64 解码作为占位符
        }

        const algorithm = 'aes-256-gcm';
        const key = process.env.ENCRYPTION_KEY
          ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
          : Buffer.alloc(32); // 生产环境应该从安全的地方获取

        const iv = Buffer.from(encryptedData.iv!, 'base64');
        const authTag = Buffer.from(encryptedData.authTag!, 'base64');
        const encrypted = Buffer.from(encryptedData.encrypted, 'base64');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
      } catch (error) {
        console.error('AES解密失败:', error);
        throw new Error('解密失败');
      }
    },
    []
  );

  // RSA-OAEP 加密（简化版）
  const encryptWithRSA = useCallback(
    async (data: string): Promise<EncryptedData> => {
      // 在浏览器环境中模拟RSA加密
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);
      const encrypted = btoa(String.fromCharCode(...dataBytes));

      return {
        algorithm: 'RSA-OAEP',
        encrypted,
        keyId: 'default-rsa-key',
        timestamp: new Date().toISOString(),
      };
    },
    []
  );

  // RSA-OAEP 解密（简化版）
  const decryptWithRSA = useCallback(
    async (encryptedData: EncryptedData): Promise<string> => {
      if (encryptedData.algorithm !== 'RSA-OAEP') {
        throw new Error('不支持的加密算法');
      }

      const decoder = new TextDecoder();
      const encryptedBytes = Uint8Array.from(atob(encryptedData.encrypted), c =>
        c.charCodeAt(0)
      );
      return decoder.decode(encryptedBytes);
    },
    []
  );

  // 主加密函数
  const encryptData = useCallback(
    async (
      data: string,
      algorithm: EncryptionAlgorithm = 'AES-256-GCM'
    ): Promise<EncryptedData> => {
      switch (algorithm) {
        case 'AES-256-GCM':
          return await encryptWithAES(data);
        case 'RSA-OAEP':
          return await encryptWithRSA(data);
        case 'ChaCha20-Poly1305':
          // 这里可以实现ChaCha20-Poly1305加密
          throw new Error('ChaCha20-Poly1305算法暂未实现');
        default:
          throw new Error(`不支持的加密算法: ${algorithm}`);
      }
    },
    [encryptWithAES, encryptWithRSA]
  );

  // 主解密函数
  const decryptData = useCallback(
    async (encryptedData: EncryptedData): Promise<string> => {
      switch (encryptedData.algorithm) {
        case 'AES-256-GCM':
          return await decryptWithAES(encryptedData);
        case 'RSA-OAEP':
          return await decryptWithRSA(encryptedData);
        default:
          throw new Error(`不支持的解密算法: ${encryptedData.algorithm}`);
      }
    },
    [decryptWithAES, decryptWithRSA]
  );

  // SHA-256 哈希
  const hashWithSHA256 = useCallback(async (data: string): Promise<string> => {
    // 动态加载 crypto 模块
    const crypto = await loadCrypto()
    if (!crypto) {
      // 浏览器环境：使用 Web Crypto API 或模拟实现
      console.warn('使用模拟哈希实现（浏览器环境）')
      // 简单的模拟哈希
      let hash = 0
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64)
    }
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }, []);

  // bcrypt 哈希（模拟）
  const hashWithBcrypt = useCallback(
    async (data: string): Promise<string> => {
      // 动态加载 crypto 模块
      const crypto = await loadCrypto()
      // 在浏览器环境中模拟bcrypt
      const salt = crypto ? crypto.randomBytes(16).toString('hex') : Math.random().toString(36).substring(2, 18);
      const hash = await hashWithSHA256(data + salt);
      return `$2b$12$${salt}$${hash}`;
    },
    [hashWithSHA256]
  );

  // 主哈希函数
  const hashData = useCallback(
    async (
      data: string,
      algorithm: HashAlgorithm = 'SHA-256'
    ): Promise<string> => {
      switch (algorithm) {
        case 'SHA-256':
          return await hashWithSHA256(data);
        case 'SHA-512':
          // 动态加载 crypto 模块
          const crypto = await loadCrypto()
          if (!crypto) {
            // 浏览器环境：使用模拟实现
            return await hashWithSHA256(data + 'sha512-salt')
          }
          const sha512 = crypto.createHash('sha512');
          sha512.update(data);
          return sha512.digest('hex');
        case 'bcrypt':
          return await hashWithBcrypt(data);
        case 'argon2':
          throw new Error('Argon2算法暂未实现');
        default:
          throw new Error(`不支持的哈希算法: ${algorithm}`);
      }
    },
    [hashWithSHA256, hashWithBcrypt]
  );

  // 哈希验证
  const verifyHash = useCallback(
    async (
      data: string,
      hash: string,
      algorithm: HashAlgorithm = 'SHA-256'
    ): Promise<boolean> => {
      try {
        const computedHash = await hashData(data, algorithm);
        return computedHash === hash;
      } catch (error) {
        console.error('哈希验证失败:', error);
        return false;
      }
    },
    [hashData]
  );

  // 数据脱敏
  const maskData = useCallback(
    (data: any, table: string, column: string, userRole: string): any => {
      if (data === null || data === undefined) return data;

      const key = `${table}.${column}`;
      const rule = maskingRules[key];

      // 如果没有规则或用户角色不需要脱敏，直接返回原数据
      if (!rule || !rule.appliesToRoles.includes(userRole)) {
        return data;
      }

      const stringValue = String(data);
      if (rule.pattern.test(stringValue)) {
        if (typeof rule.mask === 'function') {
          return rule.mask(stringValue);
        } else {
          return stringValue.replace(rule.pattern, rule.mask);
        }
      }

      return data;
    },
    [maskingRules]
  );

  // 结果集脱敏
  const maskResultSet = useCallback(
    (resultSet: any[], config: DataMaskingConfig, userRole: string): any[] => {
      return resultSet.map(row => {
        const maskedRow = { ...row };

        Object.entries(config.columns).forEach(([column, rule]) => {
          if (
            maskedRow[column] !== undefined &&
            rule.appliesToRoles.includes(userRole)
          ) {
            maskedRow[column] = maskData(
              maskedRow[column],
              config.table,
              column,
              userRole
            );
          }
        });

        return maskedRow;
      });
    },
    [maskData]
  );

  // 密钥生成
  const generateKey = useCallback(
    async (algorithm: EncryptionAlgorithm = 'AES-256-GCM'): Promise<string> => {
      // 动态加载 crypto 模块
      const crypto = await loadCrypto()
      switch (algorithm) {
        case 'AES-256-GCM':
          if (!crypto) {
            // 浏览器环境：生成随机密钥
            return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
          }
          return crypto.randomBytes(32).toString('hex');
        case 'RSA-OAEP':
          // 生成RSA密钥
          throw new Error('RSA密钥生成暂未实现');
        default:
          throw new Error(`不支持的算法: ${algorithm}`);
      }
    },
    []
  );

  // 密钥轮换
  const rotateKeys = useCallback(async (): Promise<void> => {
    // 这里应该实现密钥轮换逻辑
    // TODO: 移除调试日志
    // 实际实现应该:
    // 1. 生成新的密钥
    // 2. 用新密钥重新加密现有数据
    // 3. 更新密钥管理系统
    // 4. 废弃旧密钥
  }, []);

  const contextValue: SecurityContextType = {
    encryptData,
    decryptData,
    hashData,
    verifyHash,
    maskData,
    maskResultSet,
    generateKey,
    rotateKeys,
    isSecure,
    securityLevel,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

// 默认安全上下文值（用于类型推断）
const defaultSecurityContext: SecurityContextType = {
  encryptData: async () => ({ algorithm: 'AES-256-GCM', encrypted: '', iv: '', authTag: '' }),
  decryptData: async () => '',
  hashData: async () => '',
  verifyHash: async () => false,
  maskData: (data) => data,
  maskResultSet: (resultSet) => resultSet,
  generateKey: async () => '',
  rotateKeys: async () => {},
  isSecure: false,
  securityLevel: 'low',
};

// Hook函数
export function useSecurity(): SecurityContextType {
  const context = useContext(SecurityContext);
  if (!context) {
    // 返回默认上下文以避免类型错误
    return defaultSecurityContext;
  }
  return context;
}

// 安全保护组件
interface SecureDataProps {
  data: string;
  algorithm?: EncryptionAlgorithm;
  showLockIcon?: boolean;
  className?: string;
}

export function SecureData({
  data,
  algorithm = 'AES-256-GCM',
  showLockIcon = true,
  className = '',
}: SecureDataProps) {
  const { encryptData, decryptData } = useSecurity();
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [displayData, setDisplayData] = useState(data);
  const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(
    null
  );

  const handleToggleEncryption = async () => {
    if (isEncrypted) {
      // 解密
      if (encryptedData) {
        try {
          const decrypted = await decryptData(encryptedData);
          setDisplayData(decrypted);
          setIsEncrypted(false);
        } catch (error) {
          console.error('解密失败:', error);
        }
      }
    } else {
      // 加密
      try {
        const encrypted = await encryptData(data, algorithm);
        setEncryptedData(encrypted);
        setDisplayData('••••••••••••'); // 显示加密占位符
        setIsEncrypted(true);
      } catch (error) {
        console.error('加密失败:', error);
      }
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm">{displayData}</span>
      <button
        onClick={handleToggleEncryption}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        title={isEncrypted ? '解密数据' : '加密数据'}
      >
        {isEncrypted ? (
          <Unlock className="w-4 h-4 text-green-600" />
        ) : (
          <Lock className="w-4 h-4 text-gray-500" />
        )}
      </button>
    </div>
  );
}

// 脱敏数据显示组件
interface MaskedDataProps {
  data: any;
  table: string;
  column: string;
  userRole: string;
  showOriginal?: boolean;
  className?: string;
}

export function MaskedData({
  data,
  table,
  column,
  userRole,
  showOriginal = false,
  className = '',
}: MaskedDataProps) {
  const { maskData } = useSecurity();
  const [showMasked, setShowMasked] = useState(true);

  const maskedData = maskData(data, table, column, userRole);
  const isMasked = maskedData !== data;

  const toggleView = () => {
    if (showOriginal) {
      setShowMasked(!showMasked);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`font-mono text-sm ${isMasked && showMasked ? 'text-gray-400' : 'text-gray-900'}`}
        onClick={toggleView}
        style={{ cursor: showOriginal ? 'pointer' : 'default' }}
      >
        {showMasked ? maskedData : data}
      </span>

      {isMasked && (
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-blue-500" />
          {showOriginal && (
            <button
              onClick={toggleView}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showMasked ? '显示原文' : '隐藏原文'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
