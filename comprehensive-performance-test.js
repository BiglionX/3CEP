const http = require('http');
const https = require('https');

class ComprehensivePerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(url, method = 'GET', postData = null) {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'Performance-Tester/1.0',
        'Accept': 'application/json,text/html,application/xhtml+xml'
      }
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
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
            timestamp: new Date().toISOString(),
            contentLength: data.length
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  async testEndpoint(name, url, method = 'GET', postData = null, iterations = 3) {
    console.log(`\n🧪 测试 ${name}`);
    console.log(`URL: ${url}`);
    console.log('='.repeat(60));
    
    const times = [];
    const sizes = [];
    const statusCodes = [];
    const errors = [];
    
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await this.makeRequest(url, method, postData);
        times.push(result.duration);
        sizes.push(result.contentLength);
        statusCodes.push(result.statusCode);
        
        console.log(`  第${i + 1}次: ${result.duration}ms | ${result.statusCode} | ${result.contentLength}字节`);
        
        // 性能警告
        if (result.duration > 2000) {
          console.log(`  ⚠️  警告: 响应时间过长 (${result.duration}ms)`);
        }
        if (result.statusCode >= 400) {
          console.log(`  ⚠️  警告: HTTP错误状态码 ${result.statusCode}`);
        }
        
      } catch (error) {
        errors.push(error.message);
        console.log(`  ❌ 第${i + 1}次: 错误 - ${error.message}`);
      }
      
      // 请求间隔
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const stats = this.calculateStats(times, sizes);
    const testResult = {
      name,
      url,
      method,
      iterations,
      successful: times.length,
      failed: errors.length,
      stats,
      statusCodes,
      errors
    };
    
    this.results.push(testResult);
    
    // 输出统计结果
    console.log(`\n📊 ${name} 性能统计:`);
    console.log(`  平均响应时间: ${stats.avgTime.toFixed(2)}ms`);
    console.log(`  最快响应: ${stats.minTime}ms`);
    console.log(`  最慢响应: ${stats.maxTime}ms`);
    console.log(`  平均响应大小: ${stats.avgSize.toFixed(0)} 字节`);
    console.log(`  成功率: ${((times.length / iterations) * 100).toFixed(1)}%`);
    console.log(`  状态码分布: ${this.getStatusDistribution(statusCodes)}`);
    
    // 性能评级
    this.performanceRating(stats.avgTime, name);
    
    return testResult;
  }

  calculateStats(times, sizes) {
    if (times.length === 0) return { avgTime: 0, minTime: 0, maxTime: 0, avgSize: 0 };
    
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);
    
    return {
      avgTime: totalTime / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgSize: totalSize / sizes.length
    };
  }

  getStatusDistribution(statusCodes) {
    const distribution = {};
    statusCodes.forEach(code => {
      distribution[code] = (distribution[code] || 0) + 1;
    });
    return Object.entries(distribution)
      .map(([code, count]) => `${code}:${count}`)
      .join(', ');
  }

  performanceRating(avgTime, testName) {
    let rating = '';
    let emoji = '';
    
    if (avgTime < 300) {
      rating = '优秀';
      emoji = '⭐';
    } else if (avgTime < 1000) {
      rating = '良好';
      emoji = '👍';
    } else if (avgTime < 3000) {
      rating = '一般';
      emoji = '⚠️';
    } else {
      rating = '较差';
      emoji = '❌';
    }
    
    console.log(`  ${emoji} 性能评级: ${rating} (${avgTime.toFixed(0)}ms)`);
  }

  async runComprehensiveTests() {
    console.log('🔧 FixCycle 综合性能测试');
    console.log('='.repeat(60));
    console.log(`🎯 测试目标: ${this.baseUrl}`);
    console.log(`🕐 开始时间: ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    // 1. 基础页面测试
    await this.testEndpoint('首页加载', this.baseUrl);
    
    // 2. API接口测试
    await this.testEndpoint('健康检查接口', `${this.baseUrl}/api/health`);
    await this.testEndpoint('比价接口(默认)', `${this.baseUrl}/api/parts/compare`);
    await this.testEndpoint('比价接口(刷新模式)', `${this.baseUrl}/api/parts/compare?refresh=true`);
    
    // 3. 批量API测试
    const batchPayload = JSON.stringify({ partIds: ['1', '2'], refresh: false });
    await this.testEndpoint('批量比价查询', `${this.baseUrl}/api/parts/compare`, 'POST', batchPayload);
    
    const batchRefreshPayload = JSON.stringify({ partIds: ['1', '2'], refresh: true });
    await this.testEndpoint('批量比价查询(刷新)', `${this.baseUrl}/api/parts/compare`, 'POST', batchRefreshPayload);
    
    // 4. 错误处理测试
    await this.testEndpoint('不存在的API', `${this.baseUrl}/api/nonexistent`);
    await this.testEndpoint('无效参数测试', `${this.baseUrl}/api/parts/compare?invalid=param`);
    
    this.generateFinalReport();
  }

  generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📈 综合性能测试报告');
    console.log('='.repeat(80));
    
    const totalTests = this.results.length;
    const failedTests = this.results.filter(r => r.failed > 0).length;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.stats.avgTime, 0) / totalTests;
    const totalDataTransferred = this.results.reduce((sum, r) => sum + (r.stats.avgSize * r.successful), 0);
    
    console.log(`\n📋 测试概览:`);
    console.log(`  总测试项: ${totalTests}`);
    console.log(`  失败测试: ${failedTests}`);
    console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  整体成功率: ${(((totalTests - failedTests) / totalTests) * 100).toFixed(1)}%`);
    console.log(`  总数据传输: ${(totalDataTransferred / 1024).toFixed(2)} KB`);
    
    console.log(`\n📊 详细性能数据:`);
    console.log('┌─────────────────────────────────┬──────────┬──────────┬──────────┬────────────┬──────────┐');
    console.log('│ 测试项目                        │ 平均(ms) │ 最快(ms) │ 最慢(ms) │ 成功率     │ 大小(KB) │');
    console.log('├─────────────────────────────────┼──────────┼──────────┼──────────┼────────────┼──────────┤');
    
    this.results.forEach(result => {
      const successRate = ((result.successful / result.iterations) * 100).toFixed(1);
      const avgSizeKB = (result.stats.avgSize / 1024).toFixed(2);
      console.log(`│ ${result.name.padEnd(31)} │ ${result.stats.avgTime.toFixed(0).padEnd(8)} │ ${result.stats.minTime.toString().padEnd(8)} │ ${result.stats.maxTime.toString().padEnd(8)} │ ${successRate.padEnd(10)}% │ ${avgSizeKB.padEnd(8)} │`);
    });
    
    console.log('└─────────────────────────────────┴──────────┴──────────┴──────────┴────────────┴──────────┘');
    
    // 性能分析
    console.log(`\n🔍 性能分析:`);
    
    const fastEndpoints = this.results.filter(r => r.stats.avgTime < 500);
    const slowEndpoints = this.results.filter(r => r.stats.avgTime > 1500);
    
    if (fastEndpoints.length > 0) {
      console.log(`  ⚡ 响应迅速的接口 (< 500ms):`);
      fastEndpoints.forEach(ep => {
        console.log(`    • ${ep.name}: ${ep.stats.avgTime.toFixed(0)}ms`);
      });
    }
    
    if (slowEndpoints.length > 0) {
      console.log(`  ⚠️  响应较慢的接口 (> 1500ms):`);
      slowEndpoints.forEach(ep => {
        console.log(`    • ${ep.name}: ${ep.stats.avgTime.toFixed(0)}ms`);
      });
    }
    
    // 刷新模式对比
    const refreshTests = this.results.filter(r => 
      r.name.includes('刷新') || r.url.includes('refresh=true')
    );
    if (refreshTests.length > 0) {
      console.log(`\n🔄 刷新模式性能对比:`);
      refreshTests.forEach(rt => {
        console.log(`  ${rt.name}: ${rt.stats.avgTime.toFixed(0)}ms`);
      });
    }
    
    // 优化建议
    console.log(`\n💡 优化建议:`);
    if (avgResponseTime > 1000) {
      console.log(`  • 考虑优化API响应时间，目标应低于1000ms`);
    }
    if (slowEndpoints.length > 0) {
      console.log(`  • 重点优化响应时间超过1500ms的接口`);
    }
    if (this.results.some(r => r.statusCodes.some(code => code >= 500))) {
      console.log(`  • 检查服务器错误(5xx状态码)并修复`);
    }
    
    console.log(`\n✅ 测试完成时间: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
  }
}

// 执行测试
async function runPerformanceSuite() {
  const tester = new ComprehensivePerformanceTester('http://localhost:3000');
  await tester.runComprehensiveTests();
}

if (require.main === module) {
  runPerformanceSuite().catch(console.error);
}

module.exports = ComprehensivePerformanceTester;