#!/usr/bin/env node

/**
 * 详细页面内容分析工具
 * 深入分析特定页面的HTML结构和内容
 */

const http = require('http');
const https = require('https');

const TARGET_PAGES = [
  '/profile/dashboard',
  '/profile/settings', 
  '/profile/security',
  '/profile',
  '/help',
  '/feedback',
  '/contact',
  '/about'
];

class DetailedPageAnalyzer {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
  }

  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      const fullUrl = this.baseUrl + url;
      const urlObj = new URL(fullUrl);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'Detailed-Page-Analyzer/1.0'
        }
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

      req.on('error', reject);
      req.end();
    });
  }

  analyzePageContent(url, html) {
    console.log(`\n📄 分析页面: ${url}`);
    console.log('='.repeat(50));
    
    // 基本信息
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '无标题';
    console.log(`标题: ${title}`);
    
    // 统计信息
    const tagCounts = {
      div: (html.match(/<div/gi) || []).length,
      button: (html.match(/<button/gi) || []).length,
      a: (html.match(/<a\s+/gi) || []).length,
      form: (html.match(/<form/gi) || []).length,
      input: (html.match(/<input/gi) || []).length
    };
    
    console.log(`HTML标签统计:`);
    Object.entries(tagCounts).forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count}`);
    });
    
    // 检查关键组件
    const components = [
      { name: '导航栏', selector: ['navbar', 'navigation', '<nav'] },
      { name: '页脚', selector: ['footer', '</footer>'] },
      { name: '侧边栏', selector: ['sidebar', 'side-nav'] },
      { name: '卡片组件', selector: ['card', 'panel'] },
      { name: '表格', selector: ['table', '<table'] },
      { name: '表单', selector: ['form', 'input'] }
    ];
    
    console.log(`\n组件检测:`);
    components.forEach(component => {
      const found = component.selector.some(sel => 
        html.toLowerCase().includes(sel.toLowerCase())
      );
      console.log(`  ${component.name}: ${found ? '✅ 存在' : '❌ 不存在'}`);
    });
    
    // 提取文本内容片段
    const textContent = html.replace(/<[^>]+>/g, '').trim();
    const cleanText = textContent.replace(/\s+/g, ' ').substring(0, 200);
    console.log(`\n页面文本预览: "${cleanText}..."`);
    
    // 检查JavaScript
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log(`\nJavaScript脚本: ${scriptMatches.length} 个`);
    
    // 检查CSS
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const linkStyles = (html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).length;
    console.log(`样式资源: ${styleMatches.length} 内联样式, ${linkStyles} 外部样式表`);
  }

  async analyzeAllPages() {
    console.log('🔍 详细页面分析工具启动\n');
    
    for (const page of TARGET_PAGES) {
      try {
        const response = await this.fetchPage(page);
        if (response.statusCode === 200) {
          this.analyzePageContent(page, response.body);
        } else {
          console.log(`\n❌ 页面 ${page} 访问失败 (状态码: ${response.statusCode})`);
        }
      } catch (error) {
        console.log(`\n❌ 页面 ${page} 请求失败: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 分析完成!');
  }
}

// 执行分析
async function main() {
  try {
    const analyzer = new DetailedPageAnalyzer();
    await analyzer.analyzeAllPages();
  } catch (error) {
    console.error('❌ 分析过程出错:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}