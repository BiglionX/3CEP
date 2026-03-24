/**
 * SendGrid 邮件服务集成
 * 用于发送订阅提醒、通知等邮件
 */

import sgMail from '@sendgrid/mail';

// 初始化 SendGrid API Key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DEFAULT_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || 'noreply@fixcycle.com';

if (!SENDGRID_API_KEY) {
  console.warn('SendGrid API Key 未配置，邮件服务将不可用');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * 邮件发送配置
 */
export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  customArgs?: Record<string, any>;
}

/**
 * 邮件模板类型
 */
export type EmailTemplateType =
  | 'subscription_reminder'
  | 'subscription_expiring_soon'
  | 'subscription_expired'
  | 'password_reset'
  | 'welcome_email'
  | 'notification';

/**
 * 邮件模板数据接口
 */
export interface EmailTemplateData {
  userName?: string;
  agentName?: string;
  subscriptionPlan?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  resetLink?: string;
  [key: string]: any;
}

/**
 * SendGrid 邮件服务类
 */
export class SendGridService {
  /**
   * 发送邮件
   */
  static async sendEmail(config: EmailConfig): Promise<boolean> {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid 未配置，无法发送邮件');
      return false;
    }

    try {
      const mailOptions: any = {
        to: config.to,
        from: config.from || DEFAULT_FROM_EMAIL,
        subject: config.subject,
        html: config.html,
        text: config.text || config.html.replace(/<[^>]*>/g, ''),
        customArgs: config.customArgs,
      };

      if (config.cc) mailOptions.cc = config.cc;
      if (config.bcc) mailOptions.bcc = config.bcc;
      if (config.replyTo) mailOptions.replyTo = config.replyTo;

      await sgMail.send(mailOptions);
      console.log(`邮件已发送至：${config.to}`);
      return true;
    } catch (error) {
      console.error('SendGrid 邮件发送失败:', error);
      return false;
    }
  }

  /**
   * 使用模板发送邮件
   */
  static async sendTemplateEmail(
    templateType: EmailTemplateType,
    to: string,
    data: EmailTemplateData
  ): Promise<boolean> {
    const template = this.getEmailTemplate(templateType, data);

    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      customArgs: {
        templateType,
        ...data,
      },
    });
  }

  /**
   * 获取邮件模板
   */
  private static getEmailTemplate(
    type: EmailTemplateType,
    data: EmailTemplateData
  ): { subject: string; html: string; text: string } {
    switch (type) {
      case 'subscription_reminder':
        return {
          subject: `【FixCycle】您的 ${data.agentName} 智能体订阅即将到期`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">订阅到期提醒</h2>
              <p>尊敬的 ${data.userName || '用户'}，</p>
              <p>您订阅的 <strong>${data.agentName}</strong> 智能体将于 <strong>${data.expiryDate}</strong> 到期。</p>
              <p style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
                ⏰ 距离到期还有 <strong>${data.daysUntilExpiry}</strong> 天
              </p>
              <p>为了避免影响您的正常使用，请及时续费。</p>
              <a href="/subscription/renew" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
                立即续费
              </a>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 14px;">此邮件由系统自动发送，请勿回复。</p>
            </div>
          `,
          text: `
尊敬的 ${data.userName || '用户'}，

您订阅的 ${data.agentName} 智能体将于 ${data.expiryDate} 到期。
距离到期还有 ${data.daysUntilExpiry} 天。

为了避免影响您的正常使用，请及时续费。

访问 /subscription/renew 进行续费。

此邮件由系统自动发送，请勿回复。
          `.trim(),
        };

      case 'subscription_expiring_soon':
        return {
          subject: `【紧急】${data.agentName} 智能体订阅将在${data.daysUntilExpiry}天后到期`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">⚠️ 紧急提醒</h2>
              <p>尊敬的 ${data.userName || '用户'}，</p>
              <p>您的 <strong>${data.agentName}</strong> 智能体订阅将在 <strong>${data.daysUntilExpiry} 天</strong>后到期！</p>
              <p style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545;">
                到期时间：${data.expiryDate}
              </p>
              <p>请立即续费以避免服务中断。</p>
              <a href="/subscription/renew" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
                紧急续费
              </a>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 14px;">FixCycle 团队</p>
            </div>
          `,
          text: `
尊敬的 ${data.userName || '用户'}，

紧急提醒！您的 ${data.agentName} 智能体订阅将在 ${data.daysUntilExpiry} 天后到期。
到期时间：${data.expiryDate}

请立即续费以避免服务中断。

访问 /subscription/renew 进行续费。

FixCycle 团队
          `.trim(),
        };

      case 'subscription_expired':
        return {
          subject: `【已过期】${data.agentName} 智能体订阅已到期`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">❌ 订阅已到期</h2>
              <p>尊敬的 ${data.userName || '用户'}，</p>
              <p>很遗憾地通知您，您的 <strong>${data.agentName}</strong> 智能体订阅已于 <strong>${data.expiryDate}</strong> 到期。</p>
              <p style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545;">
                您的订阅现已暂停使用。
              </p>
              <p>请尽快续费以恢复服务。</p>
              <a href="/subscription/renew" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
                立即恢复服务
              </a>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 14px;">如有任何问题，请联系客服支持。</p>
            </div>
          `,
          text: `
尊敬的 ${data.userName || '用户'}，

很遗憾地通知您，您的 ${data.agentName} 智能体订阅已于 ${data.expiryDate} 到期。
您的订阅现已暂停使用。

请尽快续费以恢复服务。

访问 /subscription/renew 进行续费。

如有任何问题，请联系客服支持。
          `.trim(),
        };

      default:
        return {
          subject: 'FixCycle 通知',
          html: `<p>${data.message || '您有一条新通知'}</p>`,
          text: data.message || '您有一条新通知',
        };
    }
  }
}

export default SendGridService;
