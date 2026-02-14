const http = require('http');
const https = require('https');

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(url, options = {}) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            duration,
            timestamp: new Date().toISOString()
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async testEndpoint(endpoint, name, iterations = 5) {
    console.log(`\n🧪 测试 ${name}: ${endpoint}`);
    console.log('='.repeat(50));
    
    const times = [];
    const errors = [];
    
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await this.makeRequest(`${this.baseUrl}${endpoint}`);
        times.push(result.duration);
        
        console.log(`  请求 ${i + 1}: ${result.duration}ms (状态码: ${result.statusCode})`);
        
        if (result.duration > 2000) {
          console.log(`  ⚠️  警告: 响应时间较长 (${result.duration}ms)`);
        }
      } catch (error) {
        errors.push(error.message);
        console.log(`  ❌ 请求 ${i + 1}: 错误 - ${error.message}`);
      }
      
      // 请求间短暂间隔
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const stats = this.calculateStats(times);
    const testResult = {
      name,
      endpoint,
      iterations,
      successful: times.length,
      failed: errors.length,
      stats,
      errors
    };
    
    this.results.push(testResult);
    
    console.log(`\n📊 ${name} 性能统计:`);
    console.log(`  平均响应时间: ${stats.average.toFixed(2)}ms`);
    console.log(`  最快响应: ${stats.min}ms`);
    console.log(`  最慢响应: ${stats.max}ms`);
    console.log(`  成功率: ${((times.length / iterations) * 100).toFixed(1)}%`);
    
    if (stats.average > 1000) {
      console.log(`  ⚠️  平均响应时间超过1秒`);
    }
    
    return testResult;
  }

  calculateStats(times) {
    if (times.length === 0) return { average: 0, min: 0, max: 0 };
    
    const sum = times.reduce((a, b) => a + b, 0);
    return {
      average: sum / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }

  async runAllTests() {
    console.log('🚀 开始性能测试');
    console.log(`目标地址: ${this.baseUrl}`);
    console.log(new Date().toISOString());
    console.log('='.repeat(60));

    // 基础健康检查
    await this.testEndpoint('/api/health', '健康检查接口');
    
    // API性能测试
    await this.testEndpoint('/api/parts/compare', '比价接口(默认)');
    await this.testEndpoint('/api/parts/compare?refresh=true', '比价接口(刷新模式)');
    
    // 批量查询测试
    const batchPayload = JSON.stringify({ 
      partIds: ['1', '2'], 
      refresh: false 
    });
    await this.testBatchRequest('/api/parts/compare', batchPayload, '批量比价查询');
    
    const batchRefreshPayload = JSON.stringify({ 
      partIds: ['1', '2'], 
      refresh: true 
    });
    await this.testBatchRequest('/api/parts/compare', batchRefreshPayload, '批量比价查询(刷新模式)');

    // 页面加载测试
    await this.testEndpoint('/', '首页加载');
    
    this.generateReport();
  }

  async testBatchRequest(endpoint, payload, name) {
    console.log(`\n🧪 测试 ${name}: POST ${endpoint}`);
    console.log('='.repeat(50));
    
    const times = [];
    const errors = [];
    const iterations = 3; // 批量测试减少迭代次数
    
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = Date.now();
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        times.push(duration);
        
        console.log(`  请求 ${i + 1}: ${duration}ms (状态码: ${response.status})`);
        
        if (duration > 3000) {
          console.log(`  ⚠️  警告: 响应时间较长 (${duration}ms)`);
        }
      } catch (error) {
        errors.push(error.message);
        console.log(`  ❌ 请求 ${i + 1}: 错误 - ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const stats = this.calculateStats(times);
    const testResult = {
      name,
      endpoint: `POST ${endpoint}`,
      iterations,
      successful: times.length,
      failed: errors.length,
      stats,
      errors
    };
    
    this.results.push(testResult);
    
    console.log(`\n📊 ${name} 性能统计:`);
    console.log(`  平均响应时间: ${stats.average.toFixed(2)}ms`);
    console.log(`  最快响应: ${stats.min}ms`);
    console.log(`  最慢响应: ${stats.max}ms`);
    console.log(`  成功率: ${((times.length / iterations) * 100).toFixed(1)}%`);
    
    return testResult;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📈 性能测试综合报告');
    console.log('='.repeat(60));
    
    const totalTests = this.results.length;
    const failedTests = this.results.filter(r => r.failed > 0).length;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.stats.average, 0) / totalTests;
    
    console.log(`\n📋 测试概览:`);
    console.log(`  总测试项: ${totalTests}`);
    console.log(`  失败测试: ${failedTests}`);
    console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  整体成功率: ${(((totalTests - failedTests) / totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n📊 详细性能数据:`);
    console.log('┌─────────────────────────────────┬──────────┬──────────┬──────────┬────────────┐');
    console.log('│ 测试项目                        │ 平均(ms) │ 最快(ms) │ 最慢(ms) │ 成功率     │');
    console.log('├─────────────────────────────────┼──────────┼──────────┼──────────┼────────────┤');
    
    this.results.forEach(result => {
      const successRate = ((result.successful / result.iterations) * 100).toFixed(1);
      console.log(`│ ${result.name.padEnd(31)} │ ${result.stats.average.toFixed(0).padEnd(8)} │ ${result.stats.min.toString().padEnd(8)} │ ${result.stats.max.toString().padEnd(8)} │ ${successRate.padEnd(10)}% │`);
    });
    
    console.log('└─────────────────────────────────┴──────────┴──────────┴──────────┴────────────┘');
    
    // 性能评级
    console.log(`\n🏆 性能评级:`);
    if (avgResponseTime < 500) {
      console.log(`  ⭐ 优秀 - 平均响应时间小于500ms`);
    } else if (avgResponseTime < 1000) {
      console.log(`  👍 良好 - 平均响应时间在500-1000ms之间`);
    } else if (avgResponseTime < 2000) {
      console.log(`  ⚠️  一般 - 平均响应时间在1-2秒之间`);
    } else {
      console.log(`  ❌ 较差 - 平均响应时间超过2秒`);
    }
    
    // 关键发现
    console.log(`\n🔍 关键发现:`);
    const slowEndpoints = this.results.filter(r => r.stats.average > 1000);
    if (slowEndpoints.length > 0) {
      console.log(`  ⚠️  以下接口响应较慢 (>1000ms):`);
      slowEndpoints.forEach(ep => {
        console.log(`    - ${ep.name}: ${ep.stats.average.toFixed(0)}ms`);
      });
    }
    
    const refreshTests = this.results.filter(r => r.name.includes('刷新') || r.endpoint.includes('refresh=true'));
    if (refreshTests.length > 0) {
      console.log(`  🔄 刷新模式性能:`);
      refreshTests.forEach(rt => {
        console.log(`    - ${rt.name}: ${rt.stats.average.toFixed(0)}ms`);
      });
    }
    
    console.log(`\n✅ 测试完成时间: ${new Date().toISOString()}`);
  }
}

// 执行测试
async function runPerformanceTests() {
  const tester = new PerformanceTester('http://localhost:3000');
  await tester.runAllTests();
}

if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = PerformanceTester;