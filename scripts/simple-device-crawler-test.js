#!/usr/bin/env node

/**
 * 设备型号爬虫测试脚本 (简化版)
 * 直接测试爬虫核心功能
 */

const puppeteer = require('puppeteer');

class SimpleDeviceCrawler {
  constructor() {
    this.userAgentList = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
  }

  async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      console.log('✅ 浏览器初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 浏览器初始化失败:', error.message);
      return false;
    }
  }

  async crawlDeviceModels(brand, maxPages = 2) {
    const devices = [];

    if (!this.browser) {
      const success = await this.initializeBrowser();
      if (!success) return devices;
    }

    try {
      console.log(`📱 开始爬取 ${brand} 设备型号...`);

      for (let page = 1; page <= maxPages; page++) {
        const pageDevices = await this.crawlBrandPage(brand, page);
        devices.push(...pageDevices);

        if (pageDevices.length === 0) {
          console.log(`第 ${page} 页无数据，停止爬取`);
          break;
        }

        console.log(`第 ${page} 页爬取到 ${pageDevices.length} 个设备`);
        await this.randomDelay(1000, 2000);
      }

      console.log(`✅ ${brand} 爬取完成，共获得 ${devices.length} 个设备型号`);
      return devices;
    } catch (error) {
      console.error(`❌ 爬取 ${brand} 失败:`, error.message);
      return devices;
    }
  }

  async crawlBrandPage(brand, pageNumber) {
    const devices = [];
    const page = await this.browser.newPage();

    try {
      // 设置用户代理
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // 访问搜索页面
      const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(`${brand}手机型号`)}`;
      console.log(`🔍 访问: ${searchUrl}`);

      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // 等待搜索结果加载
      await page
        .waitForSelector('#content_left', { timeout: 10000 })
        .catch(() => {
          console.log('⚠️ 未找到搜索结果');
        });

      // 提取设备型号（简化版）
      const extractedDevices = await page.evaluate(brandName => {
        const devices = [];
        const results = document.querySelectorAll('.result');

        results.forEach(element => {
          const title = element.querySelector('h3')?.textContent || '';
          const link = element.querySelector('a')?.href || '';

          // 简单的设备型号匹配
          if (
            title.includes(brandName) &&
            (title.includes('手机') || title.includes('型号'))
          ) {
            const modelMatch = title.match(/[\w\s\-]+(?:Pro|Max|Plus|SE|\d+)/i);
            if (modelMatch) {
              devices.push({
                name: title.trim(),
                model: modelMatch[0].trim(),
                brand: brandName,
                url: link,
              });
            }
          }
        });

        return devices.slice(0, 5); // 限制每页结果数量
      }, brand);

      // 转换为标准格式
      extractedDevices.forEach(item => {
        devices.push({
          id: `${brand.toLowerCase()}_${item.model.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          brand: item.brand,
          model: item.model,
          category: '手机',
          release_year: new Date().getFullYear(),
          specifications: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error(`❌ 爬取页面失败:`, error.message);
    } finally {
      await page.close();
    }

    return devices;
  }

  getRandomUserAgent() {
    return this.userAgentList[
      Math.floor(Math.random() * this.userAgentList.length)
    ];
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 浏览器已关闭');
    }
  }
}

// 测试函数
async function runTest() {
  console.log('🚀 开始设备型号爬虫测试\n');

  const crawler = new SimpleDeviceCrawler();

  try {
    // 测试单个品牌
    const appleDevices = await crawler.crawlDeviceModels('Apple', 1);

    console.log('\n📋 Apple设备型号结果:');
    appleDevices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.brand} ${device.model}`);
    });

    // 测试多个品牌
    console.log('\n🔄 批量测试多个品牌...');
    const brands = ['华为', '小米'];
    const allDevices = [];

    for (const brand of brands) {
      const devices = await crawler.crawlDeviceModels(brand, 1);
      allDevices.push(...devices);
      console.log(`${brand}: ${devices.length} 个设备`);
    }

    console.log(`\n🎉 测试完成！总共爬取到 ${allDevices.length} 个设备型号`);
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await crawler.close();
  }
}

// 执行测试
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { SimpleDeviceCrawler };
