/**
 * FCX系统配置文件
 */

// 环境配置类型
export type Environment = 'development' | 'production' | 'test';

// 数据库配置
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  poolSize: number;
}

// Redis配置
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

// 支付配置
export interface PaymentConfig {
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalClientId: string;
  paypalSecret: string;
  alipayAppId: string;
  alipayPrivateKey: string;
}

// 日志配置
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
  outputFile?: string;
}

// 安全配置
export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

// 系统配置主接口
export interface FcxSystemConfig {
  environment: Environment;
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  payment: PaymentConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  features: {
    enableFcxTrading: boolean;
    enableAllianceSystem: boolean;
    enableSupplyChain: boolean;
    enableAnalytics: boolean;
  };
}

// 默认配置
export const DEFAULT_CONFIG: FcxSystemConfig = {
  environment: 'development',
  port: 3001,
  database: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'fcx_system',
    ssl: false,
    poolSize: 10
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0
  },
  payment: {
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalSecret: '',
    alipayAppId: '',
    alipayPrivateKey: ''
  },
  logging: {
    level: 'info',
    format: 'simple'
  },
  security: {
    jwtSecret: 'fcx-system-secret-key-change-in-production',
    jwtExpiresIn: '24h',
    bcryptSaltRounds: 12,
    rateLimitWindowMs: 15 * 60 * 1000, // 15分钟
    rateLimitMaxRequests: 100
  },
  features: {
    enableFcxTrading: true,
    enableAllianceSystem: true,
    enableSupplyChain: true,
    enableAnalytics: true
  }
};

// 从环境变量加载配置
export function loadConfig(): FcxSystemConfig {
  const env = process.env.NODE_ENV as Environment || 'development';
  
  const config: FcxSystemConfig = {
    ...DEFAULT_CONFIG,
    environment: env,
    port: parseInt(process.env.PORT || '3001'),
    database: {
      host: process.env.DB_HOST || DEFAULT_CONFIG.database.host,
      port: parseInt(process.env.DB_PORT || DEFAULT_CONFIG.database.port.toString()),
      username: process.env.DB_USERNAME || DEFAULT_CONFIG.database.username,
      password: process.env.DB_PASSWORD || DEFAULT_CONFIG.database.password,
      database: process.env.DB_NAME || DEFAULT_CONFIG.database.database,
      ssl: process.env.DB_SSL === 'true',
      poolSize: parseInt(process.env.DB_POOL_SIZE || DEFAULT_CONFIG.database.poolSize.toString())
    },
    redis: {
      host: process.env.REDIS_HOST || DEFAULT_CONFIG.redis.host,
      port: parseInt(process.env.REDIS_PORT || DEFAULT_CONFIG.redis.port.toString()),
      password: process.env.REDIS_PASSWORD || DEFAULT_CONFIG.redis.password,
      db: parseInt(process.env.REDIS_DB || DEFAULT_CONFIG.redis.db.toString())
    },
    payment: {
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY || DEFAULT_CONFIG.payment.stripePublicKey,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || DEFAULT_CONFIG.payment.stripeSecretKey,
      paypalClientId: process.env.PAYPAL_CLIENT_ID || DEFAULT_CONFIG.payment.paypalClientId,
      paypalSecret: process.env.PAYPAL_SECRET || DEFAULT_CONFIG.payment.paypalSecret,
      alipayAppId: process.env.ALIPAY_APP_ID || DEFAULT_CONFIG.payment.alipayAppId,
      alipayPrivateKey: process.env.ALIPAY_PRIVATE_KEY || DEFAULT_CONFIG.payment.alipayPrivateKey
    },
    logging: {
      level: (process.env.LOG_LEVEL || DEFAULT_CONFIG.logging.level) as any,
      format: (process.env.LOG_FORMAT || DEFAULT_CONFIG.logging.format) as any,
      outputFile: process.env.LOG_FILE
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || DEFAULT_CONFIG.security.jwtSecret,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_CONFIG.security.jwtExpiresIn,
      bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || DEFAULT_CONFIG.security.bcryptSaltRounds.toString()),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || DEFAULT_CONFIG.security.rateLimitWindowMs.toString()),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || DEFAULT_CONFIG.security.rateLimitMaxRequests.toString())
    }
  };

  return config;
}

// 验证配置完整性
export function validateConfig(config: FcxSystemConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 验证必要字段
  if (!config.database.host) errors.push('数据库主机地址不能为空');
  if (!config.database.username) errors.push('数据库用户名不能为空');
  if (!config.database.password) errors.push('数据库密码不能为空');
  if (!config.security.jwtSecret) errors.push('JWT密钥不能为空');
  
  // 验证生产环境必要配置
  if (config.environment === 'production') {
    if (!config.payment.stripeSecretKey) errors.push('生产环境必须配置Stripe密钥');
    if (!config.redis.host) errors.push('生产环境必须配置Redis');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 配置导出
export const config = loadConfig();
export const { isValid, errors } = validateConfig(config);

if (!isValid) {
  console.error('❌ FCX系统配置验证失败:', errors);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}