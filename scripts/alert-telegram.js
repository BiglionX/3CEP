#!/usr/bin/env node

/**
 * FixCycle Telegram告警集成脚本
 * 支持Bot API、HTML格式、键盘按钮、文件发送等功能
 */

class TelegramAlert {
  constructor(config = {}) {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || config.botToken,
      chatId: process.env.TELEGRAM_CHAT_ID || config.chatId,
      parseMode: 'HTML', // HTML or Markdown
      disableNotification: false,
      disableWebPagePreview: true,
      ...config,
    };

    this.apiUrl = `https://api.telegram.org/bot${this.config.botToken}`;

    // 验证配置
    this.validateConfig();
  }

  /**
   * 验证配置
   */
  validateConfig() {
    if (!this.config.botToken) {
      throw new Error('Telegram Bot Token未配置');
    }

    if (!this.config.chatId) {
      throw new Error('Telegram Chat ID未配置');
    }

    // 验证token格式
    if (!this.config.botToken.match(/^\d+:[\w-]+$/)) {
      throw new Error('Telegram Bot Token格式无效');
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
        silent = false,
      } = alertData;

      // 格式化消息内容
      const formattedMessage = this.formatAlertMessage({
        level,
        title,
        message,
        timestamp,
        source,
        metadata,
      });

      // 发送消息
      const result = await this.sendMessage({
        chat_id: chatId || this.config.chatId,
        text: formattedMessage,
        parse_mode: this.config.parseMode,
        disable_notification: silent || this.config.disableNotification,
        disable_web_page_preview: this.config.disableWebPagePreview,
      });

      console.log(`✅ Telegram告警发送成功: ${result.message_id}`);
      return result;
    } catch (error) {
      console.error(`❌ Telegram发送失败: ${error.message}`);
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
      source = 'unknown',
      chatId = null,
    } = recoveryData;

    const formattedMessage = this.formatRecoveryMessage({
      title,
      message,
      timestamp,
      source,
    });

    return await this.sendMessage({
      chat_id: chatId || this.config.chatId,
      text: formattedMessage,
      parse_mode: this.config.parseMode,
    });
  }

  /**
   * 发送带按钮的消息
   */
  async sendInteractiveMessage(interactiveData) {
    const {
      title,
      message,
      buttons = [],
      level = 'info',
      chatId = null,
    } = interactiveData;

    const formattedMessage = this.formatInteractiveMessage({
      title,
      message,
      level,
    });

    const keyboard = this.createInlineKeyboard(buttons);

    return await this.sendMessage({
      chat_id: chatId || this.config.chatId,
      text: formattedMessage,
      parse_mode: this.config.parseMode,
      reply_markup: keyboard,
    });
  }

  /**
   * 发送文件消息
   */
  async sendDocument(documentData) {
    const {
      document,
      caption = '',
      chatId = null,
      silent = false,
    } = documentData;

    const formData = new FormData();
    formData.append('chat_id', chatId || this.config.chatId);
    formData.append('document', document);

    if (caption) {
      formData.append('caption', caption);
    }

    if (silent || this.config.disableNotification) {
      formData.append('disable_notification', 'true');
    }

    const response = await fetch(`${this.apiUrl}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    return await this.handleResponse(response);
  }

  /**
   * 发送照片消息
   */
  async sendPhoto(photoData) {
    const { photo, caption = '', chatId = null, silent = false } = photoData;

    const formData = new FormData();
    formData.append('chat_id', chatId || this.config.chatId);
    formData.append('photo', photo);

    if (caption) {
      formData.append('caption', caption);
      formData.append('parse_mode', this.config.parseMode);
    }

    if (silent || this.config.disableNotification) {
      formData.append('disable_notification', 'true');
    }

    const response = await fetch(`${this.apiUrl}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    return await this.handleResponse(response);
  }

  /**
   * 基础消息发送方法
   */
  async sendMessage(messageData) {
    const response = await fetch(`${this.apiUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    return await this.handleResponse(response);
  }

  /**
   * 处理API响应
   */
  async handleResponse(response) {
    const result = await response.json();

    if (!result.ok) {
      throw new Error(
        `Telegram API错误: ${result.description} (code: ${result.error_code})`
      );
    }

    return result.result;
  }

  /**
   * 格式化告警消息
   */
  formatAlertMessage(data) {
    const { level, title, message, timestamp, source, metadata } = data;

    const levelConfig = this.getLevelConfig(level);

    let formattedMessage = `<b>${levelConfig.emoji} ${this.escapeHtml(title)}</b>\n\n`;

    formattedMessage += `<b>告警级别:</b> ${levelConfig.text}\n`;
    formattedMessage += `<b>时间:</b> ${timestamp.toLocaleString('zh-CN')}\n`;
    formattedMessage += `<b>来源:</b> ${this.escapeHtml(source)}\n\n`;

    if (message) {
      formattedMessage += `<b>告警详情:</b>\n<pre>${this.escapeHtml(message)}</pre>\n\n`;
    }

    // 添加元数据
    if (Object.keys(metadata).length > 0) {
      formattedMessage += `<b>附加信息:</b>\n`;
      formattedMessage += `<pre>${this.escapeHtml(JSON.stringify(metadata, null, 2))}</pre>\n\n`;
    }

    // 添加操作建议
    formattedMessage += this.getActionSuggestions(level);

    // 添加系统标识
    formattedMessage += `\n<i>此消息由FixCycle监控系统自动发送</i>`;

    return formattedMessage;
  }

  /**
   * 格式化恢复消息
   */
  formatRecoveryMessage(data) {
    const { title, message, timestamp, source } = data;

    return (
      `<b>✅ ${this.escapeHtml(title)}</b>\n\n` +
      `<b>时间:</b> ${timestamp.toLocaleString('zh-CN')}\n` +
      `<b>来源:</b> ${this.escapeHtml(source)}\n\n` +
      `<b>详情:</b> ${this.escapeHtml(message || '系统已恢复正常运行')}\n\n` +
      `<i>此消息由FixCycle监控系统自动发送</i>`
    );
  }

  /**
   * 格式化交互式消息
   */
  formatInteractiveMessage(data) {
    const { title, message, level } = data;
    const levelConfig = this.getLevelConfig(level);

    return (
      `<b>${levelConfig.emoji} ${this.escapeHtml(title)}</b>\n\n` +
      `${this.escapeHtml(message)}\n\n` +
      `<i>请选择相应的操作:</i>`
    );
  }

  /**
   * 创建内联键盘
   */
  createInlineKeyboard(buttons) {
    if (buttons.length === 0) return undefined;

    const keyboardRows = [];
    let currentRow = [];

    buttons.forEach((button, index) => {
      currentRow.push({
        text: button.text,
        url: button.url,
        callback_data: button.callbackData,
      });

      // 每行最多3个按钮
      if (currentRow.length === 3 || index === buttons.length - 1) {
        keyboardRows.push(currentRow);
        currentRow = [];
      }
    });

    return {
      inline_keyboard: keyboardRows,
    };
  }

  /**
   * 获取告警级别配置
   */
  getLevelConfig(level) {
    const configs = {
      info: {
        emoji: 'ℹ️',
        text: '信息',
        color: 'blue',
      },
      warning: {
        emoji: '⚠️',
        text: '警告',
        color: 'orange',
      },
      error: {
        emoji: '❌',
        text: '错误',
        color: 'red',
      },
      critical: {
        emoji: '🚨',
        text: '严重',
        color: 'red',
      },
      emergency: {
        emoji: '🔥',
        text: '紧急',
        color: 'red',
      },
    };

    return configs[level.toLowerCase()] || configs.warning;
  }

  /**
   * 获取操作建议
   */
  getActionSuggestions(level) {
    const suggestions = {
      info: '<blockquote>💡 建议: 请关注系统状态变化</blockquote>',
      warning: '<blockquote>⚠️ 建议: 请及时检查相关服务状态</blockquote>',
      error: '<blockquote>❌ 建议: 需要立即调查和处理此问题</blockquote>',
      critical:
        '<blockquote>🚨 建议: 立即采取行动，可能影响业务运行</blockquote>',
      emergency: '<blockquote>🚒 建议: 紧急响应，需要全员关注</blockquote>',
    };

    return suggestions[level.toLowerCase()] || suggestions.warning;
  }

  /**
   * HTML转义
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return String(text);

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * 测试配置
   */
  async testConfiguration() {
    try {
      console.log('🧪 测试Telegram配置...');

      // 测试Bot信息
      const meResponse = await fetch(`${this.apiUrl}/getMe`);
      const meResult = await meResponse.json();

      if (!meResult.ok) {
        throw new Error(`Bot验证失败: ${meResult.description}`);
      }

      console.log(`✅ Bot信息验证成功: @${meResult.result.username}`);

      // 发送测试消息
      const testAlert = {
        level: 'info',
        title: 'Telegram告警测试',
        message: '这是一个测试消息，用于验证Telegram配置是否正确。',
        source: 'TelegramAlert.test',
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
          bot_username: meResult.result.username,
        },
      };

      const result = await this.sendAlert(testAlert);
      console.log('✅ Telegram配置测试成功');
      return result;
    } catch (error) {
      console.error(`❌ Telegram配置测试失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取聊天信息
   */
  async getChatInfo(chatId = null) {
    try {
      const response = await fetch(`${this.apiUrl}/getChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId || this.config.chatId,
        }),
      });

      const result = await this.handleResponse(response);
      return result;
    } catch (error) {
      console.error(`获取聊天信息失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建告警模板
   */
  createAlertTemplate(templateName, templateData) {
    const templates = {
      database_down: {
        title: '🗄️ 数据库连接异常',
        message: '无法连接到主数据库服务器，请检查数据库服务状态。',
        level: 'critical',
        metadata: {
          service: 'postgresql',
          host: templateData.host || 'localhost',
          port: templateData.port || 5432,
          error: templateData.error || 'Connection refused',
        },
      },
      high_memory_usage: {
        title: '💾 内存使用率过高',
        message: '服务器内存使用率超过阈值，请检查内存使用情况。',
        level: 'warning',
        metadata: {
          current_usage: templateData.usage || 'unknown',
          threshold: templateData.threshold || '85%',
          available: templateData.available || 'unknown',
          hostname: templateData.hostname || 'unknown',
        },
      },
      service_unavailable: {
        title: '🔌 服务不可用',
        message: '关键服务无响应，请检查服务运行状态。',
        level: 'error',
        metadata: {
          service: templateData.service || 'unknown',
          endpoint: templateData.endpoint || 'unknown',
          response_time: templateData.responseTime || 'timeout',
          last_check: templateData.lastCheck || new Date().toISOString(),
        },
      },
      backup_failed: {
        title: '💾 备份任务失败',
        message: '数据库备份任务执行失败，请检查备份配置和存储空间。',
        level: 'error',
        metadata: {
          backup_type: templateData.backupType || 'full',
          error_message: templateData.errorMessage || 'unknown error',
          backup_time: templateData.backupTime || new Date().toISOString(),
        },
      },
    };

    return (
      templates[templateName] || {
        title: '📝 未知告警模板',
        message: '使用了未定义的告警模板',
        level: 'warning',
      }
    );
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
          case 'interactive':
            result = await this.sendInteractiveMessage(message.data);
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
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);

  const config = {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  };

  const telegramAlert = new TelegramAlert(config);

  switch (args[0]) {
    case 'test':
      telegramAlert
        .testConfiguration()
        .then(() => console.log('✅ Telegram配置测试完成'))
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
        source: 'command-line',
      };

      telegramAlert
        .sendAlert(alertData)
        .then(result =>
          console.log('✅ Telegram告警发送成功:', result.message_id)
        )
        .catch(err => {
          console.error('❌ 发送失败:', err.message);
          process.exit(1);
        });
      break;

    case 'info':
      telegramAlert
        .getChatInfo()
        .then(info => {
          console.log('聊天信息:');
          console.log(`ID: ${info.id}`);
          console.log(`类型: ${info.type}`);
          console.log(`标题: ${info.title || 'Private Chat'}`);
          console.log(`用户名: ${info.username || 'N/A'}`);
        })
        .catch(err => {
          console.error('❌ 获取信息失败:', err.message);
          process.exit(1);
        });
      break;

    default:
      console.log(`
FixCycle Telegram告警工具

使用方法:
  node scripts/alert-telegram.js test                    # 测试Telegram配置
  node scripts/alert-telegram.js send [level] [title] [message]  # 发送测试告警
  node scripts/alert-telegram.js info                    # 获取聊天信息

参数说明:
  level    - 告警级别: info|warning|error|critical|emergency
  title    - 告警标题
  message  - 告警内容

环境变量:
  TELEGRAM_BOT_TOKEN     - Telegram Bot Token
  TELEGRAM_CHAT_ID       - 目标聊天ID（用户ID或群组ID）

配置示例:
  const telegramAlert = new TelegramAlert({
    botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
    chatId: '-123456789'
  });

获取Chat ID的方法:
  1. 将Bot添加到群组
  2. 发送消息 @myidbot /getid
  3. 或使用此脚本的 info 命令
      `);
  }
}

module.exports = TelegramAlert;
