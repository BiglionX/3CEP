#!/usr/bin/env node

// 采购智能体压力测试工具
// 支持并发测试、性能基准和稳定性验证

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class ProcurementStressTester {
  constructor(options = {}) {
    this.targetUrl = options.targetUrl || 'http://localhost:3000';
    this.duration = options.duration || 60; // 测试持续时间（秒）
    this.concurrency = options.concurrency || 10; // 并发用户数
    this.rampUp = options.rampUp || 10; // 用户增加时间（秒）
    this.testScenarios = options.testScenarios || this.getDefaultScenarios();
    this.results = {
      startTime: null,
      endTime: null,
      requests: [],
      errors: [],
      metrics: {},
    };
  }

  getDefaultScenarios() {
    return [
      {
        name: '获取供应商档案',
        method: 'GET',
        path: '/api/procurement-intelligence/cache-demo/test',
        weight: 30, // 30%的请求比例
      },
      {
        name: '获取实时指标',
        method: 'GET',
        path: '/api/procurement-intelligence/metrics?type=realtime',
        weight: 25,
      },
      {
        name: '记录业务指标',
        method: 'POST',
        path: '/api/procurement-intelligence/metrics',
        weight: 20,
        body: {
          metricType: 'supplier_match_success_rate',
          value: 92.5,
          dimension: 'test',
        },
      },
      {
        name: '获取指标配置',
        method: 'GET',
        path: '/api/procurement-intelligence/metrics?type=config',
        weight: 15,
      },
      {
        name: '缓存测试',
        method: 'POST',
        path: '/api/procurement-intelligence/cache-demo/test',
        weight: 10,
        body: {
          test: 'stress_test',
          timestamp: Date.now(),
        },
      },
    ];
  }

  // 发送HTTP请求
  async sendRequest(scenario) {
    return new Promise(resolve => {
      const startTime = Date.now();
      const url = new URL(this.targetUrl + scenario.path);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: scenario.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Procurement-Stress-Tester/1.0',
        },
      };

      const req = client.request(options, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          const result = {
            scenario: scenario.name,
            method: scenario.method,
            path: scenario.path,
            statusCode: res.statusCode,
            responseTime,
            timestamp: new Date().toISOString(),
            success: res.statusCode >= 200 && res.statusCode < 400,
          };

          this.results.requests.push(result);

          if (!result.success) {
            this.results.errors.push({
              ...result,
              error: `HTTP ${res.statusCode}`,
              responseBody: data.substring(0, 200),
            });
          }

          resolve(result);
        });
      });

      req.on('error', error => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const errorResult = {
          scenario: scenario.name,
          method: scenario.method,
          path: scenario.path,
          statusCode: null,
          responseTime,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
        };

        this.results.requests.push(errorResult);
        this.results.errors.push(errorResult);
        resolve(errorResult);
      });

      // 发送请求体（如果是POST/PUT请求）
      if (
        scenario.body &&
        (scenario.method === 'POST' || scenario.method === 'PUT')
      ) {
        req.write(JSON.stringify(scenario.body));
      }

      req.end();
    });
  }

  // 选择测试场景（基于权重）
  selectScenario() {
    const totalWeight = this.testScenarios.reduce(
      (sum, scenario) => sum + scenario.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (const scenario of this.testScenarios) {
      random -= scenario.weight;
      if (random <= 0) {
        return scenario;
      }
    }

    return this.testScenarios[0]; // 默认返回第一个
  }

  // 运行单个虚拟用户
  async runVirtualUser(userId) {
    const startTime = Date.now();
    const endTime = startTime + this.duration * 1000;

    console.log(`👤 虚拟用户 ${userId} 启动测试`);

    while (Date.now() < endTime) {
      const scenario = this.selectScenario();
      await this.sendRequest(scenario);

      // 添加随机延迟模拟真实用户行为
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }

    console.log(`👤 虚拟用户 ${userId} 测试完成`);
  }

  // 渐进式增加并发用户
  async rampUpUsers() {
    const usersPerStep = Math.ceil(this.concurrency / (this.rampUp / 2));
    const stepDuration =
      (this.rampUp * 1000) / (this.concurrency / usersPerStep);

    console.log(
      `🚀 开始渐进式用户增加 (${this.rampUp}秒内达到${this.concurrency}并发)`
    );

    const promises = [];
    let currentUsers = 0;

    for (let i = 0; i < this.concurrency; i += usersPerStep) {
      const usersToAdd = Math.min(
        usersPerStep,
        this.concurrency - currentUsers
      );

      for (let j = 0; j < usersToAdd; j++) {
        currentUsers++;
        promises.push(this.runVirtualUser(currentUsers));
      }

      console.log(`📈 当前并发用户数: ${currentUsers}`);
      if (currentUsers < this.concurrency) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }

    return Promise.all(promises);
  }

  // 计算测试指标
  calculateMetrics() {
    const requests = this.results.requests;
    const successfulRequests = requests.filter(r => r.success);
    const failedRequests = requests.filter(r => !r.success);

    // 响应时间统计
    const responseTimes = requests.map(r => r.responseTime);
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);

    // 状态码统计
    const statusCodes = {};
    requests.forEach(r => {
      const code = r.statusCode || 'ERROR';
      statusCodes[code] = (statusCodes[code] || 0) + 1;
    });

    // 场景统计
    const scenarioStats = {};
    requests.forEach(r => {
      if (!scenarioStats[r.scenario]) {
        scenarioStats[r.scenario] = {
          total: 0,
          success: 0,
          avgResponseTime: 0,
          responseTimes: [],
        };
      }

      const stats = scenarioStats[r.scenario];
      stats.total++;
      if (r.success) stats.success++;
      stats.responseTimes.push(r.responseTime);
    });

    // 计算每个场景的平均响应时间
    Object.values(scenarioStats).forEach(stats => {
      stats.avgResponseTime =
        stats.responseTimes.reduce((a, b) => a + b, 0) /
        stats.responseTimes.length;
      stats.responseTimes.sort((a, b) => a - b);
    });

    this.results.metrics = {
      totalRequests: requests.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (
        (successfulRequests.length / requests.length) *
        100
      ).toFixed(2),
      totalTime: (this.results.endTime - this.results.startTime) / 1000,
      requestsPerSecond: (
        requests.length /
        ((this.results.endTime - this.results.startTime) / 1000)
      ).toFixed(2),
      avgResponseTime: (
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      ).toFixed(2),
      minResponseTime: sortedTimes[0],
      maxResponseTime: sortedTimes[sortedTimes.length - 1],
      p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
      p90: sortedTimes[Math.floor(sortedTimes.length * 0.9)],
      p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      statusCodes,
      scenarioStats,
      errors: this.results.errors.length,
    };
  }

  // 生成测试报告
  generateReport() {
    const report = {
      testInfo: {
        targetUrl: this.targetUrl,
        duration: this.duration,
        concurrency: this.concurrency,
        startTime: new Date(this.results.startTime).toISOString(),
        endTime: new Date(this.results.endTime).toISOString(),
      },
      metrics: this.results.metrics,
      errors: this.results.errors.slice(0, 10), // 只显示前10个错误
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  // 生成优化建议
  generateRecommendations() {
    const metrics = this.results.metrics;
    const recommendations = [];

    if (parseFloat(metrics.successRate) < 95) {
      recommendations.push('⚠️  成功率低于95%，建议检查系统稳定性');
    }

    if (parseFloat(metrics.p95) > 1000) {
      recommendations.push('⚠️  95%响应时间超过1秒，建议优化慢接口');
    }

    if (metrics.errors > 0) {
      recommendations.push('⚠️  存在请求错误，建议检查错误日志');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅  系统性能表现良好');
    }

    return recommendations;
  }

  // 运行完整测试
  async run() {
    console.log('🚀 开始采购智能体压力测试');
    console.log(`🎯 目标地址: ${this.targetUrl}`);
    console.log(`⏱️  测试时长: ${this.duration}秒`);
    console.log(`👥 并发用户: ${this.concurrency}`);
    console.log(`📈 渐进时间: ${this.rampUp}秒`);
    console.log('---');

    this.results.startTime = Date.now();

    try {
      await this.rampUpUsers();
    } catch (error) {
      console.error('测试执行异常:', error);
    } finally {
      this.results.endTime = Date.now();
    }

    // 计算指标
    this.calculateMetrics();

    // 生成报告
    const report = this.generateReport();

    // 输出结果
    this.printResults(report);

    // 保存报告
    await this.saveReport(report);

    return report;
  }

  // 打印测试结果
  printResults(report) {
    const metrics = report.metrics;

    console.log('\n📊 压力测试结果');
    console.log('================');
    console.log(`总请求数: ${metrics.totalRequests}`);
    console.log(`成功请求数: ${metrics.successfulRequests}`);
    console.log(`失败请求数: ${metrics.failedRequests}`);
    console.log(`成功率: ${metrics.successRate}%`);
    console.log(`总测试时间: ${metrics.totalTime}秒`);
    console.log(`QPS: ${metrics.requestsPerSecond}`);
    console.log('');
    console.log('⏱️  响应时间统计 (毫秒)');
    console.log(`平均响应时间: ${metrics.avgResponseTime}`);
    console.log(`最小响应时间: ${metrics.minResponseTime}`);
    console.log(`最大响应时间: ${metrics.maxResponseTime}`);
    console.log(`50%响应时间: ${metrics.p50}`);
    console.log(`90%响应时间: ${metrics.p90}`);
    console.log(`95%响应时间: ${metrics.p95}`);
    console.log(`99%响应时间: ${metrics.p99}`);
    console.log('');
    console.log('📋 状态码分布');
    Object.entries(metrics.statusCodes).forEach(([code, count]) => {
      console.log(`${code}: ${count} 次`);
    });
    console.log('');
    console.log('💡 优化建议');
    report.recommendations.forEach(rec => console.log(rec));
  }

  // 保存测试报告
  async saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `stress-test-report-${timestamp}.json`;
    const filepath = path.join(process.cwd(), 'reports', filename);

    // 确保reports目录存在
    const reportsDir = path.dirname(filepath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n💾 测试报告已保存: ${filepath}`);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        options.targetUrl = args[++i];
        break;
      case '--duration':
        options.duration = parseInt(args[++i]);
        break;
      case '--concurrency':
        options.concurrency = parseInt(args[++i]);
        break;
      case '--rampup':
        options.rampUp = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
采购智能体压力测试工具

用法: node stress-tester.js [选项]

选项:
  --url <URL>         目标测试地址 (默认: http://localhost:3000)
  --duration <秒>     测试持续时间 (默认: 60)
  --concurrency <数>  并发用户数 (默认: 10)
  --rampup <秒>       用户渐进增加时间 (默认: 10)
  --help             显示帮助信息

示例:
  node stress-tester.js --url http://localhost:3000 --duration 120 --concurrency 20
        `);
        process.exit(0);
    }
  }

  const tester = new ProcurementStressTester(options);
  await tester.run();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ProcurementStressTester };
