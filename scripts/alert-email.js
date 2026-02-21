#!/usr/bin/env node

/**
 * FixCycle 邮件告警集成脚本
 * 支持SMTP、HTML模板、多收件人、附件等功能
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailAlert {
  constructor(config = {}) {
    this.config = {
      smtp: {
        host: process.env.SMTP_HOST || config.smtp?.host || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || config.smtp?.port || '587'),
        secure: process.env.SMTP_SECURE === 'true' || config.smtp?.secure || false,
        auth: {
          user: process.env.SMTP_USER || config.smtp?.auth?.user || '',
          pass: process.env.SMTP_PASS || config.smtp?.auth?.pass || ''
        }
      },
      defaults: {
        from: process.env.ALERT_FROM_EMAIL || config.defaults?.from || 'FixCycle监控系统 <noreply@fixcycle.com>',
        to: process.env.ALERT_TO_EMAILS?.split(',') || config.defaults?.to || ['admin@fixcycle.com']
      },
      templates: {
        alert: {
          subject: '[{{level}}] {{title}} - 系统告警通知',
          body: this.getDefaultAlertTemplate()
        },
        recovery: {
          subject: '[恢复] {{title}} - 系统恢复正常',
          body: this.getDefaultRecoveryTemplate()
        },
        report: {
          subject: '[报告] {{title}} - 系统运行报告',
          body: this.getDefaultReportTemplate()
        }
      },
      ...config
    };

    // 初始化邮件传输器
    this.transporter = this.createTransporter();
    
    // 验证配置
    this.validateConfig();
  }

  /**
   * 创建邮件传输器
   */
  createTransporter() {
    const transporterConfig = {
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure,
      auth: this.config.smtp.auth.user ? this.config.smtp.auth : undefined,
      tls: {
        rejectUnauthorized: false // 对于自签名证书
      }
    };

    // 如果使用OAuth2认证
    if (this.config.smtp.oauth2) {
      transporterConfig.auth = {
        type: 'OAuth2',
        user: this.config.smtp.oauth2.user,
        clientId: this.config.smtp.oauth2.clientId,
        clientSecret: this.config.smtp.oauth2.clientSecret,
        refreshToken: this.config.smtp.oauth2.refreshToken
      };
    }

    return nodemailer.createTransporter(transporterConfig);
  }

  /**
   * 验证配置
   */
  validateConfig() {
    if (!this.config.smtp.host) {
      throw new Error('SMTP主机地址未配置');
    }

    if (this.config.smtp.auth.user && !this.config.smtp.auth.pass) {
      console.warn('警告: 配置了SMTP用户名但未配置密码');
    }

    if (!this.config.defaults.from) {
      throw new Error('发件人邮箱未配置');
    }

    if (!Array.isArray(this.config.defaults.to) || this.config.defaults.to.length === 0) {
      throw new Error('收件人列表未配置');
    }
  }

  /**
   * 发送告警邮件
   */
  async sendAlert(alertData) {
    try {
      const {
        level = 'warning',
        title = '系统告警',
        message = '',
        timestamp = new Date(),
        source = 'unknown',
        metadata = {},
        recipients = null,
        template = 'alert'
      } = alertData;

      // 选择模板
      const templateConfig = this.config.templates[template] || this.config.templates.alert;
      
      // 格式化邮件内容
      const subject = this.formatTemplate(templateConfig.subject, {
        level: level.toUpperCase(),
        title,
        timestamp: timestamp.toLocaleString()
      });

      const htmlBody = this.formatTemplate(templateConfig.body, {
        level: level.toUpperCase(),
        title,
        message,
        timestamp: timestamp.toLocaleString(),
        source,
        metadata: JSON.stringify(metadata, null, 2)
      });

      // 准备邮件选项
      const mailOptions = {
        from: this.config.defaults.from,
        to: recipients || this.config.defaults.to,
        subject: subject,
        html: htmlBody,
        text: this.htmlToText(htmlBody),
        priority: this.getPriority(level)
      };

      // 添加附件（如果有）
      if (alertData.attachments) {
        mailOptions.attachments = await this.processAttachments(alertData.attachments);
      }

      // 发送邮件
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ 邮件告警发送成功: ${info.messageId}`);
      console.log(`   收件人: ${mailOptions.to.join(', ')}`);
      console.log(`   主题: ${mailOptions.subject}`);
      
      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ 邮件发送失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量发送告警邮件
   */
  async sendBulkAlerts(alerts) {
    const results = [];
    
    for (const alert of alerts) {
      try {
        const result = await this.sendAlert(alert);
        results.push({ ...result, alert, status: 'success' });
      } catch (error) {
        results.push({ 
          alert, 
          status: 'failed', 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * 发送系统报告邮件
   */
  async sendReport(reportData) {
    const {
      title = '系统运行报告',
      period = 'daily',
      metrics = {},
      charts = [],
      recipients = null
    } = reportData;

    const htmlReport = this.generateReportHtml({
      title,
      period,
      metrics,
      charts
    });

    const mailOptions = {
      from: this.config.defaults.from,
      to: recipients || this.config.defaults.to,
      subject: `[报告] ${title} - ${new Date().toLocaleDateString()}`,
      html: htmlReport,
      text: this.htmlToText(htmlReport)
    };

    if (charts.length > 0) {
      mailOptions.attachments = await this.processChartAttachments(charts);
    }

    const info = await this.transporter.sendMail(mailOptions);
    
    console.log(`✅ 报告邮件发送成功: ${info.messageId}`);
    return info;
  }

  /**
   * 测试邮件配置
   */
  async testConfiguration() {
    try {
      // 验证SMTP连接
      await this.transporter.verify();
      console.log('✅ SMTP服务器连接验证成功');
      
      // 发送测试邮件
      const testAlert = {
        level: 'info',
        title: '邮件告警系统测试',
        message: '这是一个测试告警，用于验证邮件配置是否正确。',
        source: 'EmailAlert.test',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };

      const result = await this.sendAlert(testAlert);
      console.log('✅ 测试邮件发送成功');
      return result;
      
    } catch (error) {
      console.error(`❌ 邮件配置测试失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 格式化模板字符串
   */
  formatTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * 获取邮件优先级
   */
  getPriority(level) {
    const priorities = {
      'emergency': 'high',
      'critical': 'high',
      'warning': 'normal',
      'info': 'low'
    };
    return priorities[level.toLowerCase()] || 'normal';
  }

  /**
   * HTML转纯文本
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')  // 移除HTML标签
      .replace(/\s+/g, ' ')     // 合并空白字符
      .trim();
  }

  /**
   * 处理附件
   */
  async processAttachments(attachments) {
    const processed = [];
    
    for (const attachment of attachments) {
      if (attachment.path) {
        // 文件路径附件
        processed.push({
          filename: attachment.filename || path.basename(attachment.path),
          path: attachment.path
        });
      } else if (attachment.content) {
        // 内容附件
        processed.push({
          filename: attachment.filename,
          content: attachment.content,
          encoding: attachment.encoding || 'utf-8'
        });
      }
    }
    
    return processed;
  }

  /**
   * 处理图表附件
   */
  async processChartAttachments(charts) {
    const attachments = [];
    
    for (const chart of charts) {
      if (chart.imageData) {
        attachments.push({
          filename: `${chart.name || 'chart'}.png`,
          content: chart.imageData,
          encoding: 'base64',
          cid: chart.cid || chart.name
        });
      }
    }
    
    return attachments;
  }

  /**
   * 生成报告HTML
   */
  generateReportHtml(reportData) {
    const { title, period, metrics, charts } = reportData;
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin-bottom: 10px; }
            .period { color: #666; font-size: 14px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .metric-label { color: #666; margin-top: 5px; }
            .charts { margin: 30px 0; }
            .chart-container { text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
                <div class="period">报告周期: ${period} | 生成时间: ${new Date().toLocaleString()}</div>
            </div>
    `;

    // 添加指标卡片
    if (Object.keys(metrics).length > 0) {
      html += '<div class="metrics-grid">';
      for (const [key, value] of Object.entries(metrics)) {
        html += `
        <div class="metric-card">
            <div class="metric-value">${value}</div>
            <div class="metric-label">${key}</div>
        </div>
        `;
      }
      html += '</div>';
    }

    // 添加图表
    if (charts.length > 0) {
      html += '<div class="charts"><h2>数据图表</h2>';
      for (const chart of charts) {
        if (chart.cid) {
          html += `<div class="chart-container"><img src="cid:${chart.cid}" alt="${chart.name}" style="max-width: 100%;"></div>`;
        }
      }
      html += '</div>';
    }

    html += `
            <div class="footer">
                <p>此邮件由FixCycle监控系统自动生成</p>
                <p>如有疑问，请联系系统管理员</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return html;
  }

  /**
   * 默认告警模板
   */
  getDefaultAlertTemplate() {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff4444, #cc0000); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 系统告警通知</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">{{title}}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>告警级别:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{{level}}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>时间:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{{timestamp}}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>来源:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{{source}}</td>
                </tr>
            </table>
            
            <div style="margin: 25px 0; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #856404;">告警详情</h3>
                <pre style="white-space: pre-wrap; font-family: Consolas, monospace; background: white; padding: 15px; border-radius: 4px; overflow-x: auto;">{{message}}</pre>
            </div>
            
            {{#if metadata}}
            <div style="margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #495057;">附加信息</h3>
                <pre style="white-space: pre-wrap; font-family: Consolas, monospace; font-size: 12px; background: white; padding: 15px; border-radius: 4px; overflow-x: auto;">{{metadata}}</pre>
            </div>
            {{/if}}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                <p><strong>注意:</strong> 请及时处理此告警。如需了解更多信息，请查看相关系统日志。</p>
                <p>此邮件由FixCycle监控系统自动发送，请勿直接回复。</p>
            </div>
        </div>
    </div>
    `;
  }

  /**
   * 默认恢复模板
   */
  getDefaultRecoveryTemplate() {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745, #218838); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ 系统恢复正常</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">{{title}}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="margin: 20px 0; padding: 20px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #155724;">系统已恢复正常运行</h3>
                <p>{{message}}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>恢复时间:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{{timestamp}}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa;"><strong>来源:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{{source}}</td>
                </tr>
            </table>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                <p>系统监控将持续进行，如有其他问题将及时通知。</p>
                <p>此邮件由FixCycle监控系统自动发送。</p>
            </div>
        </div>
    </div>
    `;
  }

  /**
   * 默认报告模板
   */
  getDefaultReportTemplate() {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📊 系统运行报告</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">{{title}}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 30px; padding: 20px; background: #e3f2fd; border-radius: 6px;">
                <h2 style="margin-top: 0; color: #1976d2;">报告概览</h2>
                <p><strong>报告周期:</strong> {{period}}</p>
                <p><strong>生成时间:</strong> {{timestamp}}</p>
            </div>
            
            <div style="margin: 25px 0;">
                <h3 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">主要指标</h3>
                <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 6px; font-family: Consolas, monospace;">{{message}}</pre>
            </div>
            
            {{#if metadata}}
            <div style="margin: 25px 0;">
                <h3 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">详细数据</h3>
                <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 6px; font-family: Consolas, monospace; font-size: 12px;">{{metadata}}</pre>
            </div>
            {{/if}}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                <p><strong>说明:</strong> 此报告由FixCycle监控系统自动生成，反映系统在指定周期内的运行状况。</p>
                <p>如有疑问或需要详细分析，请联系系统管理员。</p>
            </div>
        </div>
    </div>
    `;
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // 从环境变量或配置文件加载配置
  const config = {};
  
  const emailAlert = new EmailAlert(config);
  
  switch (args[0]) {
    case 'test':
      emailAlert.testConfiguration()
        .then(() => console.log('✅ 邮件配置测试完成'))
        .catch(err => {
          console.error('❌ 测试失败:', err.message);
          process.exit(1);
        });
      break;
      
    case 'send':
      const alertData = {
        level: args[1] || 'warning',
        title: args[2] || '测试告警',
        message: args[3] || '这是一条测试消息',
        source: 'command-line'
      };
      
      emailAlert.sendAlert(alertData)
        .then(result => console.log('✅ 告警邮件发送成功:', result.messageId))
        .catch(err => {
          console.error('❌ 发送失败:', err.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
FixCycle 邮件告警工具

使用方法:
  node scripts/alert-email.js test                    # 测试邮件配置
  node scripts/alert-email.js send [level] [title] [message]  # 发送测试告警

参数说明:
  level    - 告警级别: info|warning|critical|emergency
  title    - 告警标题
  message  - 告警内容

环境变量:
  SMTP_HOST          - SMTP服务器地址
  SMTP_PORT          - SMTP端口
  SMTP_SECURE        - 是否使用SSL/TLS
  SMTP_USER          - SMTP用户名
  SMTP_PASS          - SMTP密码
  ALERT_FROM_EMAIL   - 发件人邮箱
  ALERT_TO_EMAILS    - 收件人邮箱(逗号分隔)

配置文件:
  可以通过构造函数传入配置对象来自定义行为
      `);
  }
}

module.exports = EmailAlert;