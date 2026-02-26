#!/usr/bin/env node

/**
 * 改进页面验证脚本
 * 专门验证本次改进的4个核心页面功能
 */

const http = require('http');
const https = require('https');

// 配置信息
const CONFIG = {
  baseUrl: 'http://localhost:3004',
  timeout: 8000,
  userAgent: 'Improved-Pages-Verifier/1.0'
};

// 本次改进的核心页面
const IMPROVED_PAGES = [
  { name: '帮助中心', path: '/help', expectedElements: ['帮助中心', '视频教程', '下载资源'] },
  { name: '联系我们', path: '/contact', expectedElements: ['联系我们', '微信客服', '服务中心'] },
  { name: '关于我们', path: '/about', expectedElements: ['关于我们', '企业文化', '社会责任'] },
  { name: '用户中心', path: '/profile/dashboard', expectedElements: ['工作台', '个性化服务', '等级进度'] }
];

class ImprovedPagesVerifier {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  // 发送HTTP请求
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': CONFIG.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: CONFIG.timeout
      };

      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.end();
    });
  }

  // 验证页面内容
  async verifyPage(page) {
    const url = CONFIG.baseUrl + page.path;
    console.log(`🔍 测试: ${page.name}`);
    console.log(`   路径: ${page.path}`);
    
    try {
      const response = await this.makeRequest(url);
      
      if (response.statusCode === 200) {
        // 检查页面是否包含预期元素
        const hasExpectedElements = page.expectedElements.every(element => 
          response.body.includes(element)
        );
        
        if (hasExpectedElements) {
          console.log(`   ✅ 页面正常，包含所有预期元素`);
          this.results.passed++;
          this.results.details.push({
            page: page.name,
            path: page.path,
            status: 'PASS',
            message: '页面正常打开，包含预期内容'
          });
        } else {
          console.log(`   ⚠️  页面可访问但内容不完整`);
          console.log(`   缺少元素: ${page.expectedElements.filter(el => !response.body.includes(el)).join(', ')}`);
          this.results.failed++;
          this.results.details.push({
            page: page.name,
            path: page.path,
            status: 'CONTENT_MISSING',
            message: '页面可访问但缺少预期内容元素'
          });
        }
      } else {
        console.log(`   ❌ 页面访问失败 (状态码: ${response.statusCode})`);
        this.results.failed++;
        this.results.details.push({
          page: page.name,
          path: page.path,
          status: 'HTTP_ERROR',
          message: `HTTP ${response.statusCode} 错误`
        });
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        page: page.name,
        path: page.path,
        status: 'REQUEST_FAILED',
        message: error.message
      });
    }
    
    this.results.total++;
    console.log('');
  }

  // 生成报告
  generateReport() {
    console.log('==================================================');
    console.log('📊 改进页面功能验证结果');
    console.log('==================================================');
    console.log('');

    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    console.log(`📈 总体统计:`);
    console.log(`   测试页面: ${this.results.total}`);
    console.log(`   通过: ${this.results.passed}`);
    console.log(`   失败: ${this.results.failed}`);
    console.log(`   成功率: ${successRate}%`);
    console.log('');

    if (this.results.details.length > 0) {
      console.log('📋 详细结果:');
      this.results.details.forEach(detail => {
        const statusIcon = detail.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${statusIcon} ${detail.page} (${detail.path}): ${detail.message}`);
      });
      console.log('');
    }

    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: successRate
      },
      details: this.results.details
    };

    require('fs').writeFileSync(
      'improved-pages-verification-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('📄 详细报告已保存至: improved-pages-verification-report.json');
    console.log('');
    
    return successRate >= 80;
  }

  // 运行完整验证
  async runVerification() {
    console.log('🚀 改进页面功能验证启动');
    console.log(`🎯 目标地址: ${CONFIG.baseUrl}`);
    console.log(`📋 测试页面数: ${IMPROVED_PAGES.length}`);
    console.log('');

    // 逐个测试页面
    for (const page of IMPROVED_PAGES) {
      await this.verifyPage(page);
    }

    // 生成最终报告
    const isSuccess = this.generateReport();
    
    if (isSuccess) {
      console.log('🎉 验证通过！改进页面功能正常');
    } else {
      console.log('⚠️  部分页面存在问题，需要进一步检查');
    }
    
    return isSuccess;
  }
}

// 执行验证
async function main() {
  const verifier = new ImprovedPagesVerifier();
  try {
    const success = await verifier.runVerification();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('验证过程出错:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ImprovedPagesVerifier;