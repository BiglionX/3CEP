/**
 * 密码策略验证和强化模? * 实施强密码策略和密码复杂度验? */

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minSpecialChars: number;
  maxConsecutiveChars: number;
  excludeCommonPasswords: boolean;
  excludeUserInfo: boolean;
  passwordHistory: number; // 记住最近几次密?  expirationDays: number; // 密码有效期（天）
}

interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100�?  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  errors: string[];
  suggestions: string[];
}

class PasswordPolicyValidator {
  private policy: PasswordPolicy;
  private commonPasswords: Set<string>;

  constructor(policy?: Partial<PasswordPolicy>) {
    // 默认密码策略
    this.policy = {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      minSpecialChars: 2,
      maxConsecutiveChars: 3,
      excludeCommonPasswords: true,
      excludeUserInfo: true,
      passwordHistory: 5,
      expirationDays: 90,
      ...policy,
    };

    // 常见弱密码列表（实际应用中应该更大）
    this.commonPasswords = new Set([
      '123456',
      'password',
      '123456789',
      '12345678',
      '12345',
      '1234567',
      '1234567890',
      'qwerty',
      'abc123',
      '111111',
      '123123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'password1',
      '123qwe',
      'qwerty123',
      'iloveyou',
      'admin123',
    ]);
  }

  /**
   * 验证密码是否符合策略要求
   */
  validatePassword(
    password: string,
    userInfo?: { username?: string; email?: string }
  ): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // 基本长度检?    if (password.length < this.policy.minLength) {
      errors.push(`密码长度至少需?{this.policy.minLength}个字符`);
    } else {
      score += 20;
    }

    if (password.length > this.policy.maxLength) {
      errors.push(`密码长度不能超过${this.policy.maxLength}个字符`);
    }

    // 复杂度检?    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/.test(
      password
    );

    if (this.policy.requireUppercase && !hasUppercase) {
      errors.push('密码必须包含大写字母');
    } else if (hasUppercase) {
      score += 15;
    }

    if (this.policy.requireLowercase && !hasLowercase) {
      errors.push('密码必须包含小写字母');
    } else if (hasLowercase) {
      score += 15;
    }

    if (this.policy.requireNumbers && !hasNumbers) {
      errors.push('密码必须包含数字');
    } else if (hasNumbers) {
      score += 15;
    }

    if (this.policy.requireSpecialChars && !hasSpecialChars) {
      errors.push('密码必须包含特殊字符');
    } else if (hasSpecialChars) {
      score += 20;
      const specialCharCount = (
        password.match(/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/g) || []
      ).length;
      if (specialCharCount >= this.policy.minSpecialChars) {
        score += 5;
      }
    }

    // 连续字符检?    if (this.policy.maxConsecutiveChars > 0) {
      const consecutivePattern = new RegExp(
        `(.)\\1{${this.policy.maxConsecutiveChars},}`
      );
      if (consecutivePattern.test(password)) {
        errors.push(
          `不能有超?{this.policy.maxConsecutiveChars}个连续相同字符`
        );
      } else {
        score += 5;
      }
    }

    // 常见密码检?    if (
      this.policy.excludeCommonPasswords &&
      this.commonPasswords.has(password.toLowerCase())
    ) {
      errors.push('密码不能是常见的弱密?);
    } else {
      score += 5;
    }

    // 用户信息检?    if (this.policy.excludeUserInfo && userInfo) {
      const userInfoString =
        `${userInfo.username || ''}${userInfo.email || ''}`.toLowerCase();
      if (userInfoString && password.toLowerCase().includes(userInfoString)) {
        errors.push('密码不能包含用户名或邮箱信息');
      } else {
        score += 5;
      }
    }

    // 生成建议
    if (!hasUppercase) suggestions.push('添加大写字母');
    if (!hasLowercase) suggestions.push('添加小写字母');
    if (!hasNumbers) suggestions.push('添加数字');
    if (!hasSpecialChars) suggestions.push('添加特殊字符');
    if (password.length < this.policy.minLength)
      suggestions.push(`增加到至?{this.policy.minLength}个字符`);

    // 计算强度等级
    let strength: PasswordValidationResult['strength'] = 'weak';
    if (score >= 80) strength = 'very_strong';
    else if (score >= 60) strength = 'strong';
    else if (score >= 40) strength = 'medium';

    return {
      isValid: errors.length === 0,
      score,
      strength,
      errors,
      suggestions,
    };
  }

  /**
   * 生成密码强度评分?-100�?   */
  getPasswordScore(password: string): number {
    const result = this.validatePassword(password);
    return result.score;
  }

  /**
   * 生成强密码建?   */
  generatePasswordSuggestions(length: number = 16): string[] {
    const suggestions: string[] = [];
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    for (let i = 0; i < 3; i++) {
      let password = '';
      // 确保包含各类字符
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += specialChars[Math.floor(Math.random() * specialChars.length)];

      // 填充剩余长度
      const allChars = uppercase + lowercase + numbers + specialChars;
      for (let j = 4; j < length; j++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }

      // 打乱字符顺序
      password = password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
      suggestions.push(password);
    }

    return suggestions;
  }

  /**
   * 检查密码是否在历史记录?   */
  isPasswordInHistory(password: string, passwordHistory: string[]): boolean {
    return passwordHistory.some(hashedPassword => {
      // 实际应用中应该使用bcrypt等哈希比?      return hashedPassword === this.hashPassword(password);
    });
  }

  /**
   * 简单的密码哈希（实际应用中应使用bcrypt�?   */
  private hashPassword(password: string): string {
    // 这里只是示例，实际应该使用bcrypt
    return require('crypto')
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }

  /**
   * 获取密码策略配置
   */
  getPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  /**
   * 更新密码策略
   */
  updatePolicy(newPolicy: Partial<PasswordPolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
  }
}

// 密码过期检查类
class PasswordExpirationChecker {
  private expirationDays: number;

  constructor(expirationDays: number = 90) {
    this.expirationDays = expirationDays;
  }

  /**
   * 检查密码是否过?   */
  isPasswordExpired(lastChanged: Date): boolean {
    const expiryDate = new Date(lastChanged);
    expiryDate.setDate(expiryDate.getDate() + this.expirationDays);
    return new Date() > expiryDate;
  }

  /**
   * 获取密码到期提醒
   */
  getPasswordExpiryWarning(lastChanged: Date): {
    daysUntilExpiry: number;
    warningLevel: 'normal' | 'warning' | 'urgent';
  } {
    const expiryDate = new Date(lastChanged);
    expiryDate.setDate(expiryDate.getDate() + this.expirationDays);

    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let warningLevel: 'normal' | 'warning' | 'urgent' = 'normal';
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      warningLevel = 'warning';
    } else if (daysUntilExpiry <= 0) {
      warningLevel = 'urgent';
    }

    return { daysUntilExpiry, warningLevel };
  }
}

// 导出工具函数
export function createPasswordValidator(
  policy?: Partial<PasswordPolicy>
): PasswordPolicyValidator {
  return new PasswordPolicyValidator(policy);
}

export function createExpirationChecker(
  expirationDays?: number
): PasswordExpirationChecker {
  return new PasswordExpirationChecker(expirationDays);
}

export { PasswordPolicyValidator, PasswordExpirationChecker };
export type { PasswordPolicy, PasswordValidationResult };
