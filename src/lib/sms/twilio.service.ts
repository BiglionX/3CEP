/**
 * Twilio 短信服务集成
 * 用于发送订阅提醒、验证码等短信
 */

import twilio from 'twilio';

// 初始化 Twilio 客户端
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: ReturnType<typeof twilio> | null = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} else {
  console.warn('Twilio 凭证未配置，短信服务将不可用');
}

/**
 * 短信发送配置
 */
export interface SMSConfig {
  to: string;
  body: string;
  from?: string;
}

/**
 * 短信模板类型
 */
export type SMSTemplateType =
  | 'subscription_reminder'
  | 'subscription_expiring_soon'
  | 'subscription_expired'
  | 'verification_code'
  | 'password_reset'
  | 'appointment_reminder';

/**
 * 短信模板数据接口
 */
export interface SMSTemplateData {
  userName?: string;
  agentName?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  code?: string;
  [key: string]: any;
}

/**
 * Twilio 短信服务类
 */
export class TwilioService {
  /**
   * 发送短信
   */
  static async sendSMS(config: SMSConfig): Promise<boolean> {
    if (!twilioClient) {
      console.error('Twilio 未配置，无法发送短信');
      return false;
    }

    try {
      const message = await twilioClient.messages.create({
        body: config.body,
        from: config.from || TWILIO_PHONE_NUMBER,
        to: config.to,
      });

      console.log(`短信已发送至：${config.to}, SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Twilio 短信发送失败:', error);
      return false;
    }
  }

  /**
   * 使用模板发送短信
   */
  static async sendTemplateSMS(
    templateType: SMSTemplateType,
    to: string,
    data: SMSTemplateData
  ): Promise<boolean> {
    const message = this.getSMSTemplate(templateType, data);

    return this.sendSMS({
      to,
      body: message,
    });
  }

  /**
   * 获取短信模板
   */
  private static getSMSTemplate(
    type: SMSTemplateType,
    data: SMSTemplateData
  ): string {
    switch (type) {
      case 'subscription_reminder':
        return `【FixCycle】尊敬的${data.userName || '用户'}，您订阅的${data.agentName}智能体将于${data.expiryDate}到期，还有${data.daysUntilExpiry}天。请及时续费以避免服务中断。续费链接：fixcycle.com/subscription/renew`;

      case 'subscription_expiring_soon':
        return `【FixCycle】紧急提醒！您的${data.agentName}智能体将在${data.daysUntilExpiry}天后到期 (${data.expiryDate})。请立即续费：fixcycle.com/subscription/renew`;

      case 'subscription_expired':
        return `【FixCycle】很遗憾，您的${data.agentName}智能体订阅已于${data.expiryDate}到期。请尽快续费以恢复服务：fixcycle.com/subscription/renew`;

      case 'verification_code':
        return `【FixCycle】您的验证码是：${data.code}。有效期 5 分钟，请勿泄露给他人。`;

      case 'password_reset':
        return `【FixCycle】您正在重置密码，验证码：${data.code}。如非本人操作请忽略此短信。`;

      case 'appointment_reminder':
        return `【FixCycle】尊敬的${data.userName || '用户'}，您预约的服务将于${data.expiryDate}进行，请准时参加。如有疑问请联系客服。`;

      default:
        return `【FixCycle】您有一条新通知`;
    }
  }

  /**
   * 批量发送短信（用于群发提醒）
   */
  static async sendBulkSMS(
    templateType: SMSTemplateType,
    recipients: string[],
    data: SMSTemplateData
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ to: string; success: boolean }>;
  }> {
    const results = await Promise.all(
      recipients.map(async to => {
        try {
          const success = await this.sendTemplateSMS(templateType, to, data);
          return { to, success };
        } catch (error) {
          console.error(`批量发送失败 - ${to}:`, error);
          return { to, success: false };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * 验证手机号码格式
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // E.164 格式验证
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * 格式化手机号码为 E.164 格式
   */
  static formatPhoneNumber(
    phoneNumber: string,
    countryCode: string = 'CN'
  ): string {
    // 中国号码特殊处理
    if (countryCode === 'CN') {
      const cleaned = phoneNumber.replace(/\D/g, '');
      if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+86${cleaned}`;
      }
    }

    // 其他国家号码，假设已经是 E.164 格式或添加国家代码
    if (!phoneNumber.startsWith('+')) {
      const countryCodes: Record<string, string> = {
        CN: '+86',
        US: '+1',
        UK: '+44',
      };
      return `${countryCodes[countryCode] || '+86'}${phoneNumber.replace(/\D/g, '')}`;
    }

    return phoneNumber;
  }
}

export default TwilioService;
