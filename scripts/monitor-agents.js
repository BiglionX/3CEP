#!/usr/bin/env node

/**
 * Agents 监控脚本
 * 监控智能体服务的成功率、P95延迟、错误码等关键指标
 * 输出 JSON 格式的监控报告到 reports/ 目录
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class AgentsMonitor {
  constructor(options = {}) {
    this.agentsHost = options.host || process.env.AGENTS_HOST || 'localhost';
    this.agentsPort = options.port || process.env.AGENTS_PORT || 3001;
    this.apiKey =
      options.apiKey || process.env.AGENTS_API_KEY || 'test-agents-api-key';
    this.sampleSize = options.sampleSize || 100; // 采样数量
    this.timeout = options.timeout || 10000; // 请求超时时间
    this.outputDir = options.outputDir || './reports';

    // 存储监控数据
    this.metrics = {
      timestamp: new Date().toISOString(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorCodes: {},
      responseTimes: [],
      agentPerformance: {},
    };
  }

  /**
   * 主监控函数
   */
  async monitor() {
    console.log('🔍 开始监控 Agents 服务...');
    console.log(`🎯 目标: ${this.agentsHost}:${this.agentsPort}`);
    console.log(`📊 采样数量: ${this.sampleSize}\n`);

    try {
      // 1. 检查服务健康状态
      const healthStatus = await this.checkServiceHealth();
      if (!healthStatus.healthy) {
        throw new Error(`服务不可用: ${healthStatus.message}`);
      }
      console.log('✅ 服务健康检查通过');

      // 2. 执行性能测试
      await this.runPerformanceTests();

      // 3. 计算指标
      const calculatedMetrics = this.calculateMetrics();

      // 4. 生成报告
      const report = this.generateReport(calculatedMetrics);

      // 5. 保存报告
      const reportPath = this.saveReport(report);

      console.log('\n🎉 监控完成!');
      console.log(`📄 报告已保存至: ${reportPath}`);

      return report;
    } catch (error) {
      console.error('❌ 监控过程中发生错误:', error.message);
      throw error;
    }
  }

  /**
   * 检查服务健康状态
   */
  async checkServiceHealth() {
    return new Promise(resolve => {
      const req = http.request(
        {
          hostname: this.agentsHost,
          port: this.agentsPort,
          path: '/api/health',
          method: 'GET',
          timeout: 5000,
        },
        res => {
          const healthy = res.statusCode === 200;
          resolve({
            healthy: healthy,
            statusCode: res.statusCode,
            message: healthy ? '服务运行正常' : `HTTP ${res.statusCode}`,
          });
        }
      );

      req.on('error', error => {
        resolve({
          healthy: false,
          message: `连接失败: ${error.message}`,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          healthy: false,
          message: '连接超时',
        });
      });

      req.end();
    });
  }

  /**
   * 运行性能测试
   */
  async runPerformanceTests() {
    const testCases = this.generateTestCases();

    console.log('🚀 开始执行性能测试...');

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(
        `[${i + 1}/${testCases.length}] 测试 ${testCase.agentName}...`
      );

      try {
        const result = await this.invokeAgent(testCase);
        this.recordResult(testCase.agentName, result);
      } catch (error) {
        this.recordError(testCase.agentName, error.message);
      }
    }
  }

  /**
   * 生成测试用例
   */
  generateTestCases() {
    const agents = [
      { name: 'AI故障诊断服务', domain: '设备识别' },
      { name: 'FCX智能推荐引擎', domain: '用户体验' },
      { name: '智能采购代理', domain: '供应链' },
      { name: '售后服务助手', domain: '售后服务' },
      { name: '数据分析引擎', domain: '数据分析' },
    ];

    const testCases = [];

    // 为每个agent生成多个测试用例
    agents.forEach(agent => {
      for (let i = 0; i < Math.ceil(this.sampleSize / agents.length); i++) {
        testCases.push({
          agentName: agent.name,
          domain: agent.domain,
          payload: this.generatePayload(agent.domain),
          timeout: agent.domain === '设备识别' ? 5000 : 30000,
        });
      }
    });

    return testCases.slice(0, this.sampleSize);
  }

  /**
   * 生成测试负载
   */
  generatePayload(domain) {
    const payloads = {
      设备识别: {
        device_id: `DEVICE_${Date.now()}`,
        image_url: 'https://example.com/device.jpg',
        scan_context: {
          location: '测试地点',
          timestamp: new Date().toISOString(),
        },
      },
      用户体验: {
        user_id: `USER_${Date.now()}`,
        session_id: `SESSION_${Date.now()}`,
        action: 'browse_manuals',
        context: {
          device_type: 'mobile',
          preferred_language: 'zh-CN',
        },
      },
      供应链: {
        procurement_request: {
          items: [
            {
              product_name: '测试产品',
              quantity: Math.floor(Math.random() * 100) + 1,
              specifications: '测试规格',
            },
          ],
          delivery_address: '测试地址',
        },
      },
      售后服务: {
        device_serial: `SN_${Date.now()}`,
        issue_description: '设备故障测试',
        customer_info: {
          name: '测试客户',
          phone: '13800138000',
        },
      },
      数据分析: {
        analysis_target: 'sales_trend',
        time_range: {
          start: '2026-01-01',
          end: new Date().toISOString().split('T')[0],
        },
        dimensions: ['region', 'product_category'],
      },
    };

    return payloads[domain] || { test_mode: true };
  }

  /**
   * 调用agent服务
   */
  async invokeAgent(testCase) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const postData = JSON.stringify({
        idempotency_key: `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trace_id: `trace_${Date.now()}`,
        timeout: testCase.timeout,
        agent_name: testCase.agentName,
        payload: testCase.payload,
      });

      const req = http.request(
        {
          hostname: this.agentsHost,
          port: this.agentsPort,
          path: '/agents/invoke',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: this.timeout,
        },
        res => {
          let responseData = '';

          res.on('data', chunk => {
            responseData += chunk;
          });

          res.on('end', () => {
            const duration = Date.now() - startTime;

            try {
              const result = JSON.parse(responseData);
              resolve({
                success: res.statusCode === 200 && result.code === 200,
                statusCode: res.statusCode,
                errorCode: result.code,
                duration: duration,
                response: result,
              });
            } catch (parseError) {
              resolve({
                success: false,
                statusCode: res.statusCode,
                errorCode: 'PARSE_ERROR',
                duration: duration,
                error: `响应解析失败: ${parseError.message}`,
              });
            }
          });
        }
      );

      req.on('error', error => {
        const duration = Date.now() - startTime;
        reject(new Error(`请求失败 (${duration}ms): ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`请求超时 (${this.timeout}ms)`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * 记录成功结果
   */
  recordResult(agentName, result) {
    this.metrics.totalRequests++;

    if (result.success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // 记录响应时间
    this.metrics.responseTimes.push(result.duration);

    // 记录错误码
    if (!result.success && result.errorCode) {
      if (!this.metrics.errorCodes[result.errorCode]) {
        this.metrics.errorCodes[result.errorCode] = 0;
      }
      this.metrics.errorCodes[result.errorCode]++;
    }

    // 按agent记录性能
    if (!this.metrics.agentPerformance[agentName]) {
      this.metrics.agentPerformance[agentName] = {
        total: 0,
        successful: 0,
        failed: 0,
        responseTimes: [],
      };
    }

    const agentMetrics = this.metrics.agentPerformance[agentName];
    agentMetrics.total++;
    if (result.success) {
      agentMetrics.successful++;
    } else {
      agentMetrics.failed++;
    }
    agentMetrics.responseTimes.push(result.duration);
  }

  /**
   * 记录错误
   */
  recordError(agentName, errorMessage) {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;

    // 记录网络错误
    const networkErrorCode = 'NETWORK_ERROR';
    if (!this.metrics.errorCodes[networkErrorCode]) {
      this.metrics.errorCodes[networkErrorCode] = 0;
    }
    this.metrics.errorCodes[networkErrorCode]++;

    // 按agent记录
    if (!this.metrics.agentPerformance[agentName]) {
      this.metrics.agentPerformance[agentName] = {
        total: 0,
        successful: 0,
        failed: 0,
        responseTimes: [],
      };
    }
    this.metrics.agentPerformance[agentName].total++;
    this.metrics.agentPerformance[agentName].failed++;
  }

  /**
   * 计算指标
   */
  calculateMetrics() {
    const total = this.metrics.totalRequests;
    const successful = this.metrics.successfulRequests;

    // 成功率
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // P95 延迟
    const sortedTimes = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95Latency = sortedTimes[p95Index] || 0;

    // 平均延迟
    const avgLatency =
      sortedTimes.length > 0
        ? sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length
        : 0;

    // 最大/最小延迟
    const maxLatency = Math.max(...sortedTimes) || 0;
    const minLatency = Math.min(...sortedTimes) || 0;

    // 按agent计算指标
    const agentMetrics = {};
    Object.keys(this.metrics.agentPerformance).forEach(agentName => {
      const perf = this.metrics.agentPerformance[agentName];
      const agentSuccessRate =
        perf.total > 0 ? (perf.successful / perf.total) * 100 : 0;
      const agentSortedTimes = [...perf.responseTimes].sort((a, b) => a - b);
      const agentP95Index = Math.floor(agentSortedTimes.length * 0.95);

      agentMetrics[agentName] = {
        totalRequests: perf.total,
        successRate: agentSuccessRate,
        p95Latency: agentSortedTimes[agentP95Index] || 0,
        avgLatency:
          agentSortedTimes.length > 0
            ? agentSortedTimes.reduce((sum, time) => sum + time, 0) /
              agentSortedTimes.length
            : 0,
        errorDistribution: this.calculateErrorDistribution(perf),
      };
    });

    return {
      summary: {
        totalRequests: total,
        successfulRequests: successful,
        failedRequests: this.metrics.failedRequests,
        successRate: parseFloat(successRate.toFixed(2)),
        errorRate: parseFloat(
          (((total - successful) / total) * 100).toFixed(2)
        ),
      },
      latency: {
        p95: p95Latency,
        average: parseFloat(avgLatency.toFixed(2)),
        min: minLatency,
        max: maxLatency,
      },
      errorCodes: this.metrics.errorCodes,
      agentPerformance: agentMetrics,
    };
  }

  /**
   * 计算错误分布
   */
  calculateErrorDistribution(performance) {
    // 这里可以根据具体需求实现更详细的错误分类
    return {
      totalErrors: performance.failed,
      errorRate:
        performance.total > 0
          ? (performance.failed / performance.total) * 100
          : 0,
    };
  }

  /**
   * 生成报告
   */
  generateReport(metrics) {
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0].replace(/-/g, ''); // YYYYMMDD

    return {
      reportId: `agents-metrics-${dateStr}-${Date.now()}`,
      generatedAt: timestamp,
      period: {
        start: this.metrics.timestamp,
        end: new Date().toISOString(),
      },
      environment: process.env.NODE_ENV || 'development',
      target: {
        host: this.agentsHost,
        port: this.agentsPort,
      },
      metrics: metrics,
      metadata: {
        sampleSize: this.sampleSize,
        timeout: this.timeout,
      },
    };
  }

  /**
   * 保存报告
   */
  saveReport(report) {
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const dateStr = report.generatedAt.split('T')[0].replace(/-/g, '');
    const fileName = `agents-metrics-${dateStr}.json`;
    const filePath = path.join(this.outputDir, fileName);

    try {
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      return filePath;
    } catch (error) {
      console.error('保存报告失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取监控状态
   */
  getStatus() {
    return {
      monitoredAt: this.metrics.timestamp,
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests,
      errorCodes: Object.keys(this.metrics.errorCodes),
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // 显示帮助信息
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('\nAgents 监控脚本使用说明');
    console.log('========================');
    console.log(
      '用法: node scripts/monitor-agents.js [host] [port] [sampleSize] [timeout]'
    );
    console.log('');
    console.log('参数:');
    console.log('  host       - Agents服务主机地址 (默认: localhost)');
    console.log('  port       - Agents服务端口 (默认: 3001)');
    console.log('  sampleSize - 采样请求数量 (默认: 100)');
    console.log('  timeout    - 单个请求超时时间(ms) (默认: 10000)');
    console.log('');
    console.log('环境变量:');
    console.log('  AGENTS_HOST     - Agents服务主机地址');
    console.log('  AGENTS_PORT     - Agents服务端口');
    console.log('  AGENTS_API_KEY  - API认证密钥');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/monitor-agents.js');
    console.log('  node scripts/monitor-agents.js 192.168.1.100 3001 50 5000');
    console.log('  AGENTS_HOST=prod-server node scripts/monitor-agents.js');
    process.exit(0);
  }

  const options = {
    host: process.argv[2] || process.env.AGENTS_HOST,
    port: process.argv[3] || process.env.AGENTS_PORT,
    sampleSize: parseInt(process.argv[4]) || 100,
    timeout: parseInt(process.argv[5]) || 10000,
  };

  const monitor = new AgentsMonitor(options);

  console.log('⚙️  配置信息:');
  console.log(`   主机: ${options.host || 'localhost'}`);
  console.log(`   端口: ${options.port || 3001}`);
  console.log(`   采样数: ${options.sampleSize}`);
  console.log(`   超时: ${options.timeout}ms\n`);

  monitor
    .monitor()
    .then(report => {
      console.log('\n📋 监控报告摘要:');
      console.log('==================');
      console.log(`📊 总请求数: ${report.metrics.summary.totalRequests}`);
      console.log(`✅ 成功率: ${report.metrics.summary.successRate}%`);
      console.log(`❌ 失败率: ${report.metrics.summary.errorRate}%`);
      console.log(`⚡ P95延迟: ${report.metrics.latency.p95}ms`);
      console.log(`⏱️  平均延迟: ${report.metrics.latency.average}ms`);

      if (Object.keys(report.metrics.errorCodes).length > 0) {
        console.log('\n🚨 错误码分布:');
        Object.entries(report.metrics.errorCodes).forEach(([code, count]) => {
          console.log(`   ${code}: ${count} 次`);
        });
      }

      console.log('\n🤖 各Agent性能:');
      Object.entries(report.metrics.agentPerformance).forEach(
        ([agentName, perf]) => {
          console.log(`   ${agentName}:`);
          console.log(`     成功率: ${perf.successRate}%`);
          console.log(`     P95延迟: ${perf.p95Latency}ms`);
          console.log(`     平均延迟: ${perf.avgLatency}ms`);
        }
      );

      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 监控失败:', error.message);
      process.exit(1);
    });
}

module.exports = AgentsMonitor;
