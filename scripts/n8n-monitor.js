/**
 * n8n 监控和告警系统
 * 实时监控工作流健康状态并发送告警通知
 */

const fs = require('fs');
const path = require('path');

class N8nMonitor {
  constructor(config = {}) {
    this.n8nBaseUrl = config.n8nBaseUrl || process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiToken = config.apiToken || process.env.N8N_API_TOKEN;
    this.checkInterval = config.checkInterval || 60000; // 1分钟
    this.alertThresholds = {
      failureRate: config.failureRateThreshold || 10, // 失败率阈值 %
      responseTime: config.responseTimeThreshold || 5000, // 响应时间阈值 ms
      uptime: config.uptimeThreshold || 99.9, // 可用性阈值 %
      consecutiveFailures: config.consecutiveFailuresThreshold || 3
    };
    
    this.notificationChannels = {
      slack: config.slackWebhook || process.env.SLACK_WEBHOOK,
      email: config.emailRecipients || [],
      webhook: config.customWebhook || process.env.MONITORING_WEBHOOK
    };
    
    this.state = {
      lastCheck: null,
      consecutiveFailures: 0,
      metricsHistory: [],
      alertsSent: []
    };
    
    this.isRunning = false;
  }

  /**
   * 启动监控
   */
  start() {
    if (this.isRunning) {
      console.log('监控已在运行中');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 启动 n8n 监控系统...');
    
    // 立即执行一次检查
    this.performCheck();
    
    // 设置定时检查
    this.monitorInterval = setInterval(() => {
      this.performCheck();
    }, this.checkInterval);
  }

  /**
   * 停止监控
   */
  stop() {
    if (this.isRunning) {
      clearInterval(this.monitorInterval);
      this.isRunning = false;
      console.log('🛑 监控系统已停止');
    }
  }

  /**
   * 执行健康检查
   */
  async performCheck() {
    try {
      console.log('🔍 执行健康检查...');
      
      const startTime = Date.now();
      
      // 并行执行多项检查
      const [
        serviceHealth,
        workflowStatus,
        executionMetrics,
        nodeHealth
      ] = await Promise.all([
        this.checkServiceHealth(),
        this.checkWorkflowStatus(),
        this.checkExecutionMetrics(),
        this.checkNodeHealth()
      ]);
      
      const checkDuration = Date.now() - startTime;
      
      // 汇总检查结果
      const overallHealth = this.calculateOverallHealth({
        service: serviceHealth,
        workflows: workflowStatus,
        executions: executionMetrics,
        nodes: nodeHealth
      });
      
      // 记录指标
      this.recordMetrics({
        timestamp: new Date().toISOString(),
        duration: checkDuration,
        health: overallHealth,
        details: {
          service: serviceHealth,
          workflows: workflowStatus,
          executions: executionMetrics,
          nodes: nodeHealth
        }
      });
      
      // 检查是否需要发送告警
      this.evaluateAlerts(overallHealth);
      
      // 更新连续失败计数
      if (overallHealth.status === 'healthy') {
        this.state.consecutiveFailures = 0;
      } else {
        this.state.consecutiveFailures++;
      }
      
      this.state.lastCheck = new Date().toISOString();
      
      console.log(`✅ 健康检查完成 - 状态: ${overallHealth.status}, 分数: ${overallHealth.score}/100`);
      
    } catch (error) {
      console.error('❌ 健康检查失败:', error.message);
      this.state.consecutiveFailures++;
      this.evaluateAlerts({ status: 'error', score: 0, message: error.message });
    }
  }

  /**
   * 检查服务健康状态
   */
  async checkServiceHealth() {
    try {
      const response = await fetch(`${this.n8nBaseUrl}/healthz`);
      const isHealthy = response.ok;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        responseTime: response.headers.get('x-response-time') || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查工作流状态
   */
  async checkWorkflowStatus() {
    try {
      const response = await fetch(`${this.n8nBaseUrl}/workflows`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const workflows = await response.json();
      const activeCount = workflows.filter(wf => wf.active).length;
      const totalCount = workflows.length;
      const activationRate = totalCount > 0 ? (activeCount / totalCount * 100) : 0;
      
      return {
        status: activationRate >= 90 ? 'healthy' : 'warning',
        total: totalCount,
        active: activeCount,
        activationRate: activationRate,
        inactiveWorkflows: workflows.filter(wf => !wf.active).map(wf => wf.name),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查执行指标
   */
  async checkExecutionMetrics() {
    try {
      // 获取最近的执行记录
      const response = await fetch(`${this.n8nBaseUrl}/executions?limit=50`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const executions = await response.json();
      const recentExecutions = executions.results || [];
      
      // 计算指标
      const totalExecutions = recentExecutions.length;
      const successfulExecutions = recentExecutions.filter(e => e.finished && !e.stoppedAt).length;
      const failedExecutions = recentExecutions.filter(e => e.stoppedAt && !e.finished).length;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100) : 100;
      
      // 计算平均执行时间
      const executionTimes = recentExecutions
        .filter(e => e.startedAt && e.stoppedAt)
        .map(e => new Date(e.stoppedAt) - new Date(e.startedAt));
      
      const avgExecutionTime = executionTimes.length > 0 ? 
        Math.round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length) : 0;
      
      return {
        status: successRate >= this.alertThresholds.failureRate ? 'healthy' : 'warning',
        total: totalExecutions,
        successful: successfulExecutions,
        failed: failedExecutions,
        successRate: successRate,
        avgExecutionTime: avgExecutionTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 检查节点健康状态
   */
  async checkNodeHealth() {
    try {
      const response = await fetch(`${this.n8nBaseUrl}/nodes`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 节点API可能不可用，这是正常的
      if (!response.ok) {
        return {
          status: 'unknown',
          message: 'Node API not available',
          timestamp: new Date().toISOString()
        };
      }
      
      const nodes = await response.json();
      const connectedNodes = nodes.filter(node => node.connected !== false).length;
      const totalNodes = nodes.length;
      const connectionRate = totalNodes > 0 ? (connectedNodes / totalNodes * 100) : 100;
      
      return {
        status: connectionRate >= 95 ? 'healthy' : 'warning',
        total: totalNodes,
        connected: connectedNodes,
        disconnected: totalNodes - connectedNodes,
        connectionRate: connectionRate,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unknown',
        message: 'Node health check not critical',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 计算整体健康分数
   */
  calculateOverallHealth(components) {
    const weights = {
      service: 0.3,
      workflows: 0.25,
      executions: 0.35,
      nodes: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    const componentScores = {};
    
    Object.keys(weights).forEach(key => {
      if (components[key] && components[key].status) {
        const score = this.getStatusScore(components[key].status);
        componentScores[key] = score;
        totalScore += score * weights[key];
        totalWeight += weights[key];
      }
    });
    
    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    let overallStatus = 'unknown';
    if (finalScore >= 90) overallStatus = 'healthy';
    else if (finalScore >= 70) overallStatus = 'warning';
    else overallStatus = 'critical';
    
    return {
      status: overallStatus,
      score: finalScore,
      componentScores: componentScores,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取状态分数
   */
  getStatusScore(status) {
    const scores = {
      'healthy': 100,
      'warning': 70,
      'critical': 30,
      'error': 0,
      'unhealthy': 20,
      'unknown': 50
    };
    return scores[status] || 50;
  }

  /**
   * 记录指标
   */
  recordMetrics(metrics) {
    this.state.metricsHistory.push(metrics);
    
    // 保留最近100条记录
    if (this.state.metricsHistory.length > 100) {
      this.state.metricsHistory.shift();
    }
    
    // 保存到文件
    this.saveMetricsToFile(metrics);
  }

  /**
   * 保存指标到文件
   */
  saveMetricsToFile(metrics) {
    const metricsDir = './monitoring/metrics';
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const metricsFile = path.join(metricsDir, `metrics-${today}.json`);
    
    try {
      let existingMetrics = [];
      if (fs.existsSync(metricsFile)) {
        existingMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      }
      
      existingMetrics.push(metrics);
      
      // 保留当天最近1440条记录（24小时）
      if (existingMetrics.length > 1440) {
        existingMetrics = existingMetrics.slice(-1440);
      }
      
      fs.writeFileSync(metricsFile, JSON.stringify(existingMetrics, null, 2));
    } catch (error) {
      console.error('保存指标失败:', error.message);
    }
  }

  /**
   * 评估是否需要发送告警
   */
  evaluateAlerts(health) {
    const shouldAlert = 
      health.status === 'critical' ||
      health.score < this.alertThresholds.uptime ||
      this.state.consecutiveFailures >= this.alertThresholds.consecutiveFailures;
    
    if (shouldAlert) {
      this.sendAlert(health);
    }
  }

  /**
   * 发送告警通知
   */
  async sendAlert(health) {
    const alertId = `alert-${Date.now()}`;
    const alertMessage = this.formatAlertMessage(health);
    
    console.log('🚨 发送告警:', alertMessage);
    
    // 记录告警
    this.state.alertsSent.push({
      id: alertId,
      timestamp: new Date().toISOString(),
      message: alertMessage,
      health: health
    });
    
    // 保留最近50条告警记录
    if (this.state.alertsSent.length > 50) {
      this.state.alertsSent.shift();
    }
    
    // 发送到各个渠道
    const promises = [];
    
    if (this.notificationChannels.slack) {
      promises.push(this.sendSlackAlert(alertMessage));
    }
    
    if (this.notificationChannels.webhook) {
      promises.push(this.sendWebhookAlert(alertMessage, health));
    }
    
    await Promise.all(promises);
  }

  /**
   * 格式化告警消息
   */
  formatAlertMessage(health) {
    const timestamp = new Date().toLocaleString('zh-CN');
    const statusEmoji = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '🔴',
      'error': '💥'
    }[health.status] || '❓';
    
    return `[${timestamp}] n8n系统告警 ${statusEmoji}\n` +
           `健康状态: ${health.status}\n` +
           `健康分数: ${health.score}/100\n` +
           `连续失败次数: ${this.state.consecutiveFailures}`;
  }

  /**
   * 发送Slack告警
   */
  async sendSlackAlert(message) {
    try {
      await fetch(this.notificationChannels.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          username: 'n8n-monitor',
          icon_emoji: ':robot_face:'
        })
      });
    } catch (error) {
      console.error('Slack告警发送失败:', error.message);
    }
  }

  /**
   * 发送Webhook告警
   */
  async sendWebhookAlert(message, health) {
    try {
      await fetch(this.notificationChannels.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'n8n_health_alert',
          severity: health.status,
          message: message,
          health_score: health.score,
          timestamp: new Date().toISOString(),
          source: 'n8n-monitor'
        })
      });
    } catch (error) {
      console.error('Webhook告警发送失败:', error.message);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.state.lastCheck,
      consecutiveFailures: this.state.consecutiveFailures,
      recentMetrics: this.state.metricsHistory.slice(-5),
      recentAlerts: this.state.alertsSent.slice(-5)
    };
  }

  /**
   * 获取历史指标趋势
   */
  getMetricsTrend(hours = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    const recentMetrics = this.state.metricsHistory.filter(
      metric => new Date(metric.timestamp) > cutoffTime
    );
    
    return {
      period: `${hours}小时`,
      dataPoints: recentMetrics.length,
      trend: this.analyzeTrend(recentMetrics)
    };
  }

  /**
   * 分析趋势
   */
  analyzeTrend(metrics) {
    if (metrics.length < 2) return 'insufficient_data';
    
    const scores = metrics.map(m => m.health.score);
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (lastScore > firstScore && lastScore > avgScore) return 'improving';
    if (lastScore < firstScore && lastScore < avgScore) return 'deteriorating';
    return 'stable';
  }
}

module.exports = N8nMonitor;

// 如果直接运行此文件，则启动监控
if (require.main === module) {
  const monitor = new N8nMonitor({
    n8nBaseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiToken: process.env.N8N_API_TOKEN,
    checkInterval: 30000, // 30秒检查一次
    failureRateThreshold: 15,
    responseTimeThreshold: 3000
  });
  
  monitor.start();
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n收到关闭信号...');
    monitor.stop();
    process.exit(0);
  });
}