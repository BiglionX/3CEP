/**
 * 邮件服务 - 基于Nodemailer实现SMTP邮件发? * 支持模板渲染、批量发送、状态跟踪和重试机制
 */

import { createClient } from '@supabase/supabase-js';
import Handlebars from 'handlebars';
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';

// 邮件配置接口
export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  fromAddress: string;
  fromName?: string;
  secure?: boolean;
}

// 邮件发送选项
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// 邮件发送结?export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// 批量邮件发送选项
export interface BulkEmailOptions {
  recipients: Array<{
    email: string;
    variables: Record<string, any>;
  }>;
  subjectTemplate: string;
  htmlTemplate?: string;
  textTemplate?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class EmailService {
  private transporter: Transporter;
  private supabase: any;
  private defaultFrom: string;
  private defaultFromName: string;

  constructor(config: EmailConfig) {
    this.defaultFrom = config.fromAddress;
    this.defaultFromName = config.fromName || '采购系统';

    // 创建邮件传输?    this.transporter = nodemailer.createTransporter({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.secure ?? config.smtpPort === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false, // 生产环境中应该设为true
      },
    });

    // 初始化Supabase客户端（用于记录邮件日志?    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // 验证连接配置
    this.verifyConnection();
  }

  /**
   * 验证SMTP连接
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?SMTP服务器连接验证成?)} catch (error) {
      console.error('�?SMTP服务器连接验证失?', error);
      throw new Error(`邮件服务配置错误: ${(error as Error).message}`);
    }
  }

  /**
   * 发送单封邮?   */
  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      const mailOptions = {
        from: `"${this.defaultFromName}" <${this.defaultFrom}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const info: SentMessageInfo =
        await this.transporter.sendMail(mailOptions);

      // 记录发送日?      await this.logEmail({
        to: mailOptions.to,
        subject: options.subject,
        content: options.html || options.text || '',
        status: 'sent',
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = (error as Error).message;

      // 记录发送失败日?      await this.logEmail({
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        content: options.html || options.text || '',
        status: 'failed',
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 发送模板邮?   */
  async sendTemplateEmail(
    to: string,
    subject: string,
    template: string,
    variables: Record<string, any>
  ): Promise<EmailSendResult> {
    try {
      // 渲染模板
      const compiledTemplate = Handlebars.compile(template);
      const htmlContent = compiledTemplate(variables);

      return await this.sendEmail({
        to,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      return {
        success: false,
        error: `模板渲染失败: ${(error as Error).message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量发送邮?   */
  async sendBulkEmails(options: BulkEmailOptions): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    for (const recipient of options.recipients) {
      let attempt = 0;
      let result: EmailSendResult;

      do {
        try {
          // 渲染主题模板
          const subjectTemplate = Handlebars.compile(options.subjectTemplate);
          const subject = subjectTemplate(recipient.variables);

          // 渲染内容模板
          let htmlContent: string | undefined;
          let textContent: string | undefined;

          if (options.htmlTemplate) {
            const htmlTemplate = Handlebars.compile(options.htmlTemplate);
            htmlContent = htmlTemplate(recipient.variables);
          }

          if (options.textTemplate) {
            const textTemplate = Handlebars.compile(options.textTemplate);
            textContent = textTemplate(recipient.variables);
          }

          result = await this.sendEmail({
            to: recipient.email,
            subject,
            html: htmlContent,
            text: textContent,
          });

          if (result.success) {
            break; // 发送成功，跳出重试循环
          }
        } catch (error) {
          result = {
            success: false,
            error: (error as Error).message,
            timestamp: new Date(),
          };
        }

        attempt++;
        if (attempt < maxRetries && !result.success) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
            `📧 邮件发送失败，${
              retryDelay / 1000
            }秒后重试 (${attempt}/${maxRetries}):`,
            recipient.email
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } while (attempt < maxRetries && !result.success);

      results.push(result);

      // 记录发送进?      if (results.length % 10 === 0) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `📧 已发?${results.length}/${options.recipients.length} 封邮件`
        )}
    }

    return results;
  }

  /**
   * 记录邮件日志到数据库
   */
  private async logEmail(logData: {
    to: string;
    subject: string;
    content: string;
    status: 'sent' | 'failed';
    messageId?: string;
    error?: string;
  }): Promise<void> {
    try {
      // 这里应该插入到email_logs表中
      // 暂时只打印到控制?      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `📧 邮件日志 - 状? ${logData.status}, 收件? ${logData.to}`
      )if (logData.error) {
        console.error(`📧 邮件发送错? ${logData.error}`);
      }
    } catch (error) {
      console.error('📧 邮件日志记录失败:', error);
    }
  }

  /**
   * 测试邮件连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('📧 邮件服务连接测试失败:', error);
      return false;
    }
  }

  /**
   * 关闭邮件服务连接
   */
  async close(): Promise<void> {
    try {
      await this.transporter.close();
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📧 邮件服务连接已关?)} catch (error) {
      console.error('📧 关闭邮件服务连接时出?', error);
    }
  }
}

// 默认邮件配置（从环境变量读取?export function getDefaultEmailConfig(): EmailConfig {
  return {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    fromAddress: process.env.SMTP_FROM_ADDRESS || 'noreply@example.com',
    fromName: process.env.SMTP_FROM_NAME || '采购系统',
    secure: process.env.SMTP_SECURE === 'true',
  };
}

// 创建默认邮件服务实例
let defaultEmailService: EmailService | null = null;

export function getDefaultEmailService(): EmailService {
  if (!defaultEmailService) {
    const config = getDefaultEmailConfig();
    defaultEmailService = new EmailService(config);
  }
  return defaultEmailService;
}

// Handlebars助手函数注册
Handlebars.registerHelper('dateFormat', function (date: Date, format: string) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    default:
      return d.toLocaleDateString();
  }
});

Handlebars.registerHelper(
  'currencyFormat',
  function (amount: number, currency: string = 'CNY') {
    if (typeof amount !== 'number') return amount;
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
);

Handlebars.registerHelper('eq', function (a: any, b: any) {
  return a === b;
});
