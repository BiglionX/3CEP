/**
 * 数据脱敏和加密控制器
 * 实现敏感数据的脱敏处理和加密存储
 */

// TODO: 动态导入 crypto 实现
// 当前使用静态导入，需要改为动态导入以支持 SSR
// 完整实现需要：
// 1. 使用 dynamic import('crypto') 在运行时加载
// 2. 或在服务端组件中使用 API 路由处理加密逻辑
// 3. 或使用第三方库如 crypto-js（支持浏览器和 Node.js）
let cryptoModule: typeof import('crypto') | null = null;

const loadCryptoModule = async () => {
  if (!cryptoModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cryptoModule = require('crypto');
    } catch {
      console.warn('Node.js crypto 模块不可用');
    }
  }
  return cryptoModule;
};

export interface DataMaskingRule {
  field: string;
  type:
    | 'email'
    | 'phone'
    | 'id_card'
    | 'bank_card'
    | 'address'
    | 'name'
    | 'custom';
  maskChar?: string;
  preserveLength?: boolean;
  customPattern?: RegExp;
  customReplacement?: string;
}

export interface EncryptionConfig {
  algorithm: string;
  key: string;
  ivLength: number;
}

export interface SensitiveDataPolicy {
  dataClassification: 'public' | 'internal' | 'confidential' | 'secret';
  retentionPeriod: number; // 天数
  encryptionRequired: boolean;
  maskingRequired: boolean;
  auditRequired: boolean;
}

export class DataProtectionController {
  private static instance: DataProtectionController;
  private encryptionConfig: EncryptionConfig;
  private maskingRules: Map<string, DataMaskingRule> = new Map();
  private auditLogs: Array<{
    timestamp: Date;
    operation: string;
    dataType: string;
    userId?: string;
    success: boolean;
    details?: string;
  }> = [];

  private constructor() {
    // 初始化加密配置
    this.encryptionConfig = {
      algorithm: 'aes-256-gcm',
      key: this.generateOrLoadKey(),
      ivLength: 12,
    };

    // 初始化默认脱敏规则
    this.initializeDefaultMaskingRules();
  }

  static getInstance(): DataProtectionController {
    if (!DataProtectionController.instance) {
      DataProtectionController.instance = new DataProtectionController();
    }
    return DataProtectionController.instance;
  }

  /**
   * 生成或加载加密密钥
   */
  private generateOrLoadKey(): string {
    // 在生产环境中，应该从安全的密钥管理系统加载
    // 这里使用环境变量或生成固定密钥
    const envKey = process.env.DATA_ENCRYPTION_KEY;
    if (envKey && envKey.length >= 32) {
      return envKey.substring(0, 32);
    }

    // 开发环境使用固定密钥（生产环境不应这样做）
    return 'dev-key-32-characters-for-testing';
  }

  /**
   * 初始化默认脱敏规则
   */
  private initializeDefaultMaskingRules(): void {
    const defaultRules: DataMaskingRule[] = [
      {
        field: 'email',
        type: 'email',
        maskChar: '*',
        preserveLength: true,
      },
      {
        field: 'phone',
        type: 'phone',
        maskChar: '*',
        preserveLength: true,
      },
      {
        field: 'id_card',
        type: 'id_card',
        maskChar: '*',
        preserveLength: false,
      },
      {
        field: 'bank_card',
        type: 'bank_card',
        maskChar: '*',
        preserveLength: false,
      },
      {
        field: 'address',
        type: 'address',
        maskChar: '*',
        preserveLength: true,
      },
      {
        field: 'name',
        type: 'name',
        maskChar: '*',
        preserveLength: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.maskingRules.set(rule.field, rule);
    });
  }

  /**
   * 添加自定义脱敏规则
   */
  addMaskingRule(rule: DataMaskingRule): void {
    this.maskingRules.set(rule.field, rule);
    this.logAudit(
      'ADD_MASKING_RULE',
      rule.field,
      true,
      `Added masking rule for ${rule.field}`
    );
  }

  /**
   * 移除脱敏规则
   */
  removeMaskingRule(field: string): boolean {
    const result = this.maskingRules.delete(field);
    if (result) {
      this.logAudit(
        'REMOVE_MASKING_RULE',
        field,
        true,
        `Removed masking rule for ${field}`
      );
    }
    return result;
  }

  /**
   * 数据脱敏处理
   */
  maskData<T extends Record<string, any>>(data: T, fieldsToMask?: string[]): T {
    try {
      const maskedData: Record<string, any> = { ...data };
      const fields = fieldsToMask || Array.from(this.maskingRules.keys());

      fields.forEach(field => {
        if (maskedData[field] !== undefined) {
          const rule = this.maskingRules.get(field);
          if (rule) {
            maskedData[field] = this.applyMasking(maskedData[field], rule);
          }
        }
      });

      this.logAudit(
        'DATA_MASKING',
        'multiple_fields',
        true,
        `Masked ${fields.length} fields`
      );
      return maskedData as T;
    } catch (error) {
      this.logAudit(
        'DATA_MASKING',
        'multiple_fields',
        false,
        `Masking failed: ${error}`
      );
      throw error;
    }
  }

  /**
   * 应用具体的脱敏规则
   */
  private applyMasking(value: any, rule: DataMaskingRule): string {
    if (typeof value !== 'string') {
      return String(value);
    }

    const maskChar = rule.maskChar || '*';

    switch (rule.type) {
      case 'email':
        return this.maskEmail(value, maskChar);

      case 'phone':
        return this.maskPhone(value, maskChar);

      case 'id_card':
        return this.maskIdCard(value, maskChar);

      case 'bank_card':
        return this.maskBankCard(value, maskChar);

      case 'address':
        return this.maskAddress(value, maskChar);

      case 'name':
        return this.maskName(value, maskChar);

      case 'custom':
        return this.maskCustom(
          value,
          rule.customPattern,
          rule.customReplacement
        );

      default:
        return value;
    }
  }

  /**
   * 邮箱脱敏
   */
  private maskEmail(email: string, maskChar: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const maskedLocal =
      localPart.length <= 3
        ? localPart.charAt(0) +
          maskChar.repeat(Math.max(0, localPart.length - 1))
        : localPart.substring(0, 2) + maskChar.repeat(localPart.length - 2);

    return `${maskedLocal}@${domain}`;
  }

  /**
   * 手机号脱敏
   */
  private maskPhone(phone: string, maskChar: string): string {
    // 保留前3位和后4位
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 7) return phone;

    return (
      cleanPhone.substring(0, 3) +
      maskChar.repeat(cleanPhone.length - 7) +
      cleanPhone.substring(cleanPhone.length - 4)
    );
  }

  /**
   * 身份证脱敏
   */
  private maskIdCard(idCard: string, maskChar: string): string {
    if (idCard.length < 8) return maskChar.repeat(idCard.length);

    // 保留前6位和后4位
    return (
      idCard.substring(0, 6) +
      maskChar.repeat(idCard.length - 10) +
      idCard.substring(idCard.length - 4)
    );
  }

  /**
   * 银行卡脱敏
   */
  private maskBankCard(card: string, maskChar: string): string {
    const cleanCard = card.replace(/\s/g, '');
    if (cleanCard.length < 8) return maskChar.repeat(cleanCard.length);

    // 保留前6位和后4位
    return (
      cleanCard.substring(0, 6) +
      maskChar.repeat(cleanCard.length - 10) +
      cleanCard.substring(cleanCard.length - 4)
    );
  }

  /**
   * 地址脱敏
   */
  private maskAddress(address: string, maskChar: string): string {
    if (address.length <= 6) {
      return (
        address.charAt(0) + maskChar.repeat(Math.max(0, address.length - 1))
      );
    }

    // 保留前3个字
    return address.substring(0, 3) + maskChar.repeat(address.length - 3);
  }

  /**
   * 姓名脱敏
   */
  private maskName(name: string, maskChar: string): string {
    if (name.length <= 1) return name;
    if (name.length === 2) return name.charAt(0) + maskChar;

    // 保留姓氏，名字部分脱敏
    return name.charAt(0) + maskChar.repeat(name.length - 1);
  }

  /**
   * 自定义脱敏
   */
  private maskCustom(
    value: string,
    pattern?: RegExp,
    replacement?: string
  ): string {
    if (!pattern || !replacement) return value;
    return value.replace(pattern, replacement);
  }

  /**
   * 数据加密
   * TODO: 改为异步方法，使用动态加载的 crypto 模块
   */
  async encryptData(data: string): Promise<{
    encrypted: string;
    authTag: string;
    iv: string;
  }> {
    // 动态加载 crypto 模块
    const crypto = await loadCryptoModule();
    if (!crypto) {
      throw new Error('加密模块不可用，请确保在 Node.js 环境中运行');
    }

    try {
      const iv = crypto.randomBytes(this.encryptionConfig.ivLength);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cipher: any = crypto.createCipheriv(
        this.encryptionConfig.algorithm,
        this.encryptionConfig.key,
        iv
      );

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      this.logAudit(
        'DATA_ENCRYPTION',
        'generic',
        true,
        'Data encrypted successfully'
      );

      return {
        encrypted,
        authTag,
        iv: iv.toString('hex'),
      };
    } catch (error) {
      this.logAudit(
        'DATA_ENCRYPTION',
        'generic',
        false,
        `Encryption failed: ${error}`
      );
      throw error;
    }
  }

  /**
   * 数据解密
   * TODO: 改为异步方法，使用动态加载的 crypto 模块
   */
  async decryptData(encrypted: string, authTag: string, iv: string): Promise<string> {
    // 动态加载 crypto 模块
    const crypto = await loadCryptoModule();
    if (!crypto) {
      throw new Error('解密模块不可用，请确保在 Node.js 环境中运行');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decipher: any = crypto.createDecipheriv(
        this.encryptionConfig.algorithm,
        this.encryptionConfig.key,
        Buffer.from(iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      this.logAudit(
        'DATA_DECRYPTION',
        'generic',
        true,
        'Data decrypted successfully'
      );

      return decrypted;
    } catch (error) {
      this.logAudit(
        'DATA_DECRYPTION',
        'generic',
        false,
        `Decryption failed: ${error}`
      );
      throw error;
    }
  }

  /**
   * 批量数据脱敏
   */
  maskDataSet<T extends Record<string, any>[]>(
    dataSet: T,
    fieldsToMask?: string[]
  ): T {
    return dataSet.map(item => this.maskData(item, fieldsToMask)) as T;
  }

  /**
   * 验证数据是否符合脱敏要求
   */
  validateMaskingCompliance<T extends Record<string, any>>(
    originalData: T,
    maskedData: T,
    requiredFields: string[]
  ): { compliant: boolean; violations: string[] } {
    const violations: string[] = [];

    requiredFields.forEach(field => {
      if (
        originalData[field] !== undefined &&
        maskedData[field] === originalData[field]
      ) {
        violations.push(`Field ${field} was not properly masked`);
      }
    });

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * 获取脱敏规则列表
   */
  getMaskingRules(): DataMaskingRule[] {
    return Array.from(this.maskingRules.values());
  }

  /**
   * 记录审计日志
   */
  private logAudit(
    operation: string,
    dataType: string,
    success: boolean,
    details?: string,
    userId?: string
  ): void {
    const logEntry = {
      timestamp: new Date(),
      operation,
      dataType,
      userId,
      success,
      details,
    };

    this.auditLogs.push(logEntry);

    // 保持日志缓冲区大小
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift();
    }

    // 在开发环境中输出到控制台
    if (process.env.NODE_ENV === 'development') {
      // TODO: 移除调试日志
      console.info('Data Protection Audit:', logEntry)
    }
  }

  /**
   * 获取审计日志
   */
  getAuditLogs(limit: number = 100): typeof this.auditLogs {
    return this.auditLogs.slice(-limit);
  }

  /**
   * 清空审计日志
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  /**
   * 获取数据保护统计信息
   */
  getProtectionStats(): {
    totalMaskingRules: number;
    totalAuditLogs: number;
    encryptionAlgorithm: string;
    lastAuditTimestamp?: Date;
  } {
    return {
      totalMaskingRules: this.maskingRules.size,
      totalAuditLogs: this.auditLogs.length,
      encryptionAlgorithm: this.encryptionConfig.algorithm,
      lastAuditTimestamp:
        this.auditLogs.length > 0
          ? this.auditLogs[this.auditLogs.length - 1].timestamp
          : undefined,
    };
  }
}
