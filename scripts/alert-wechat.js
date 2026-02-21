#!/usr/bin/env node

/**
 * FixCycle 企业微信告警集成脚本
 * 支持群机器人推送、Markdown格式、图文消息等
 */

class WeChatAlert {
  constructor(config = {}) {
    this.config = {
      webhookUrl: process.env.WECHAT_WEBHOOK_URL || config.webhookUrl,
      defaultChatId: process.env.WECHAT_DEFAULT_CHAT || config.defaultChatId,
      messageTypes: {
        alert: 'markdown',
        recovery: 'text',
        report: 'news'
      },
      ...config
    };

    // 验证配置
    this.validateConfig();
  }

  /**
   * 验证配置
   */
  validateConfig() {
    if (!this.config.webhookUrl) {
      throw new Error('企业微信Webhook URL未配置');
    }

    // 验证URL格式
    try {
      new URL(this.config.webhookUrl);
    } catch {
      throw new Error('企业微信Webhook URL格式无效');
    }
  }

  /**
   * 发送告警消息
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
        chatId = null,
        messageType = 'markdown'
      } = alertData;

      // 构造消息内容
      const content = this.formatAlertMessage({
        level,
        title,
        message,
        timestamp,
        source,
        metadata
      });

      // 发送消息
      const result = await this.sendMessage({
        msgtype: messageType,
        content,
        chatId: chatId || this.config.defaultChatId
      });

      console.log(`✅ 企业微信告警发送成功: ${result.msgid || 'unknown'}`);
      return result;

    } catch (error) {
      console.error(`❌ 企业微信发送失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 发送恢复消息
   */
  async sendRecovery(recoveryData) {
    const {
      title = '系统恢复正常',
      message = '',
      timestamp = new Date(),
      source = 'unknown'
    } = recoveryData;

    const content = this.formatRecoveryMessage({
      title,
      message,
      timestamp,
      source
    });

    return await this.sendMessage({
      msgtype: 'text',
      content,
      safe: 0
    });
  }

  /**
   * 发送报告消息
   */
  async sendReport(reportData) {
    const {
      title = '系统运行报告',
      metrics = {},
      charts = [],
      timestamp = new Date()
    } = reportData;

    const articles = this.formatReportArticles({
      title,
      metrics,
      charts,
      timestamp
    });

    return await this.sendMessage({
      msgtype: 'news',
      articles
    });
  }

  /**
   * 发送自定义消息
   */
  async sendMessage(messageData) {
    const { msgtype, chatId, ...content } = messageData;
    
    const payload = {
      msgtype,
      [msgtype]: content
    };

    if (chatId) {
      payload.chatid = chatId;
    }

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.errcode !== 0) {
      throw new Error(`企业微信API错误: ${result.errmsg} (code: ${result.errcode})`);
    }

    return result;
  }

  /**
   * 格式化告警消息
   */
  formatAlertMessage(data) {
    const {
      level,
      title,
      message,
      timestamp,
      source,
      metadata
    } = data;

    // 获取告警级别对应的emoji和颜色
    const levelConfig = this.getLevelConfig(level);
    
    let content = `## ${levelConfig.emoji} ${title}\n`;
    content += `**告警级别:** ${levelConfig.text}\n`;
    content += `**时间:** ${timestamp.toLocaleString('zh-CN')}\n`;
    content += `**来源:** ${source}\n\n`;
    
    if (message) {
      content += `### 告警详情\n${message}\n\n`;
    }

    // 添加元数据（如果存在）
    if (Object.keys(metadata).length > 0) {
      content += `### 附加信息\n`;
      content += `\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\`\n`;
    }

    // 添加操作建议
    content += this.getActionSuggestions(level);

    return content;
  }

  /**
   * 格式化恢复消息
   */
  formatRecoveryMessage(data) {
    const { title, message, timestamp, source } = data;
    
    return {
      content: `✅ 系统恢复正常通知\n\n` +
               `标题: ${title}\n` +
               `时间: ${timestamp.toLocaleString('zh-CN')}\n` +
               `来源: ${source}\n` +
               `详情: ${message || '系统已恢复正常运行'}\n\n` +
               `此消息由FixCycle监控系统自动发送`
    };
  }

  /**
   * 格式化报告文章
   */
  formatReportArticles(data) {
    const { title, metrics, charts, timestamp } = data;
    
    const articles = [{
      title: `📊 ${title}`,
      description: `报告生成时间: ${timestamp.toLocaleString('zh-CN')}\n` +
                   `主要指标:\n` +
                   Object.entries(metrics)
                     .slice(0, 5)
                     .map(([key, value]) => `• ${key}: ${value}`)
                     .join('\n'),
      url: 'https://monitor.fixcycle.com', // 可配置的仪表板URL
      picurl: '' // 可选的图片URL
    }];

    // 添加图表文章
    charts.slice(0, 7).forEach((chart, index) => {
      articles.push({
        title: `📈 ${chart.title || `图表${index + 1}`}`,
        description: chart.description || '系统性能图表',
        url: chart.url || 'https://monitor.fixcycle.com',
        picurl: chart.imageUrl || ''
      });
    });

    return articles;
  }

  /**
   * 获取告警级别配置
   */
  getLevelConfig(level) {
    const configs = {
      'info': {
        emoji: 'ℹ️',
        text: '信息',
        color: 'info'
      },
      'warning': {
        emoji: '⚠️',
        text: '警告',
        color: 'warning'
      },
      'error': {
        emoji: '❌',
        text: '错误',
        color: 'error'
      },
      'critical': {
        emoji: '🚨',
        text: '严重',
        color: 'critical'
      },
      'emergency': {
        emoji: '🔥',
        text: '紧急',
        color: 'emergency'
      }
    };

    return configs[level.toLowerCase()] || configs.warning;
  }

  /**
   * 获取操作建议
   */
  getActionSuggestions(level) {
    const suggestions = {
      'info': '> 💡 建议: 请关注系统状态变化\n',
      'warning': '> ⚠️ 建议: 请及时检查相关服务状态\n',
      'error': '> ❌ 建议: 需要立即调查和处理此问题\n',
      'critical': '> 🚨 建议: 立即采取行动，可能影响业务运行\n',
      'emergency': '> 🚒 建议: 紧急响应，需要全员关注\n'
    };

    return suggestions[level.toLowerCase()] || suggestions.warning;
  }

  /**
   * 发送带按钮的交互式消息
   */
  async sendInteractiveMessage(interactiveData) {
    const {
      title,
      description,
      buttons = [],
      level = 'info'
    } = interactiveData;

    const levelConfig = this.getLevelConfig(level);
    
    // 构造Markdown内容
    let content = `## ${levelConfig.emoji} ${title}\n`;
    content += `${description}\n\n`;
    
    // 添加按钮（转换为链接形式）
    if (buttons.length > 0) {
      content += `### 操作选项\n`;
      buttons.forEach((button, index) => {
        content += `${index + 1}. [${button.text}](${button.url})\n`;
      });
    }

    return await this.sendMessage({
      msgtype: 'markdown',
      content
    });
  }

  /**
   * 发送文件消息
   */
  async sendFileMessage(fileData) {
    const {
      mediaId,
      fileName,
      fileType = 'file'
    } = fileData;

    const fileTypes = {
      'file': 1,
      'image': 2,
      'video': 3,
      'voice': 4
    };

    return await this.sendMessage({
      msgtype: 'file',
      file: {
        media_id: mediaId
      },
      safe: 0,
      filetype: fileTypes[fileType] || 1
    });
  }

  /**
   * 上传媒体文件
   */
  async uploadMedia(filePath, type = 'file') {
    // 注意: 企业微信上传媒体文件需要先获取access_token
    // 这里提供基本框架，实际使用需要根据企业微信API文档实现
    
    const formData = new FormData();
    formData.append('media', fs.createReadStream(filePath));
    
    const response = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=${type}`, {
      method: 'POST',
      body: formData
    });

    return await response.json();
  }

  /**
   * 测试配置
   */
  async testConfiguration() {
    try {
      console.log('🧪 测试企业微信配置...');
      
      const testAlert = {
        level: 'info',
        title: '企业微信告警测试',
        message: '这是一个测试消息，用于验证企业微信配置是否正确。',
        source: 'WeChatAlert.test',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };

      const result = await this.sendAlert(testAlert);
      console.log('✅ 企业微信配置测试成功');
      return result;
      
    } catch (error) {
      console.error(`❌ 企业微信配置测试失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量发送消息
   */
  async sendBatchMessages(messages) {
    const results = [];
    
    for (const message of messages) {
      try {
        let result;
        switch (message.type) {
          case 'alert':
            result = await this.sendAlert(message.data);
            break;
          case 'recovery':
            result = await this.sendRecovery(message.data);
            break;
          case 'report':
            result = await this.sendReport(message.data);
            break;
          default:
            result = await this.sendMessage(message.data);
        }
        results.push({ ...result, message, status: 'success' });
      } catch (error) {
        results.push({ 
          message, 
          status: 'failed', 
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * 创建告警模板
   */
  createAlertTemplate(templateName, templateData) {
    const templates = {
      'database_down': {
        title: '数据库连接异常',
        message: '无法连接到主数据库服务器，请检查数据库服务状态。',
        level: 'critical',
        metadata: {
          service: 'postgresql',
          host: templateData.host || 'localhost',
          port: templateData.port || 5432
        }
      },
      'high_cpu_usage': {
        title: 'CPU使用率过高',
        message: '服务器CPU使用率超过阈值，请检查系统负载和进程状态。',
        level: 'warning',
        metadata: {
          current_usage: templateData.usage || 'unknown',
          threshold: templateData.threshold || '80%',
          hostname: templateData.hostname || 'unknown'
        }
      },
      'disk_space_low': {
        title: '磁盘空间不足',
        message: '系统磁盘空间使用率过高，请清理不必要的文件。',
        level: 'warning',
        metadata: {
          partition: templateData.partition || '/',
          usage: templateData.usage || 'unknown',
          available: templateData.available || 'unknown'
        }
      },
      'n8n_workflow_failed': {
        title: 'n8n工作流执行失败',
        message: '关键业务工作流执行失败，请检查工作流配置和依赖服务。',
        level: 'error',
        metadata: {
          workflow_id: templateData.workflowId,
          error_message: templateData.errorMessage,
          execution_time: templateData.executionTime
        }
      }
    };

    return templates[templateName] || {
      title: '未知告警模板',
      message: '使用了未定义的告警模板',
      level: 'warning'
    };
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const config = {
    webhookUrl: process.env.WECHAT_WEBHOOK_URL
  };
  
  const wechatAlert = new WeChatAlert(config);
  
  switch (args[0]) {
    case 'test':
      wechatAlert.testConfiguration()
        .then(() => console.log('✅ 企业微信配置测试完成'))
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
      
      wechatAlert.sendAlert(alertData)
        .then(result => console.log('✅ 企业微信告警发送成功:', result.msgid))
        .catch(err => {
          console.error('❌ 发送失败:', err.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
FixCycle 企业微信告警工具

使用方法:
  node scripts/alert-wechat.js test                    # 测试企业微信配置
  node scripts/alert-wechat.js send [level] [title] [message]  # 发送测试告警

参数说明:
  level    - 告警级别: info|warning|error|critical|emergency
  title    - 告警标题
  message  - 告警内容

环境变量:
  WECHAT_WEBHOOK_URL     - 企业微信群机器人Webhook URL
  WECHAT_DEFAULT_CHAT    - 默认聊天室ID（可选）

配置示例:
  const wechatAlert = new WeChatAlert({
    webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY',
    defaultChatId: 'CHAT_ID'
  });
      `);
  }
}

module.exports = WeChatAlert;