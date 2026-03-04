#!/usr/bin/env node

/**
 * 使用系统Chrome的设备爬虫测试
 * 避免Puppeteer自带浏览器的问题
 */

const puppeteer = require('puppeteer');

class SystemChromeCrawler {
  constructor() {
    this.userAgentList = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
  }

  async initializeBrowser() {
    try {
      // 尝试使用系统Chrome
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath:
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
      });
      console.log('✅ 系统Chrome浏览器初始化成功');
      return true;
    } catch (error) {
      console.log('⚠️ 系统Chrome启动失败，尝试默认配置...');
      try {
        // 回退到默认配置
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        });
        console.log('✅ 默认浏览器配置启动成功');
        return true;
      } catch (fallbackError) {
        console.error('❌ 浏览器初始化完全失败:', fallbackError.message);
        return false;
      }
    }
  }

  async crawlDeviceModels(brand, maxPages = 1) {
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
        await this.randomDelay(500, 1000);
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
      // 设置用户代理和视口
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // 访问百度搜索
      const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(`${brand}手机型号大全`)}`;
      console.log(`🔍 搜索: ${brand} 手机型号`);

      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });

      // 等待搜索结果
      await page
        .waitForSelector('#content_left', { timeout: 5000 })
        .catch(() => {
          console.log('⚠️ 搜索结果加载超时');
        });

      // 提取设备信息
      const extractedData = await page.evaluate(brandName => {
        const results = [];
        const items = document.querySelectorAll('.result');

        items.forEach(item => {
          const titleElement = item.querySelector('h3');
          const title = titleElement?.textContent?.trim() || '';

          // 匹配设备型号
          if (title.includes(brandName) && title.includes('手机')) {
            // 提取型号名称
            const modelPattern =
              /(?:iPhone|华为|小米|OPPO|vivo|三星)[\s\S]*?(?:Pro|Max|Plus|\d+[^\s]*)/gi;
            const matches = title.match(modelPattern);

            if (matches) {
              matches.forEach(match => {
                results.push({
                  brand: brandName,
                  model: match.trim(),
                  title: title,
                });
              });
            }
          }
        });

        return results.slice(0, 3); // 限制结果数量
      }, brand);

      // 转换为标准格式
      extractedData.forEach((item, index) => {
        devices.push({
          id: `${brand.toLowerCase()}_${item.model.replace(/\s+/g, '_')}_${Date.now()}_${index}`,
          brand: item.brand,
          model: item.model,
          category: '手机',
          release_year: new Date().getFullYear(),
          source: 'baidu_search',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error(`❌ 页面爬取失败:`, error.message);
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
  console.log('🚀 开始系统Chrome设备爬虫测试\n');

  const crawler = new SystemChromeCrawler();

  try {
    // 测试单个品牌
    console.log('=== 测试Apple设备爬取 ===');
    const appleDevices = await crawler.crawlDeviceModels('Apple', 1);

    console.log('\n📋 Apple设备型号结果:');
    if (appleDevices.length > 0) {
      appleDevices.forEach((device, index) => {
        console.log(`${index + 1}. ${device.brand} ${device.model}`);
      });
    } else {
      console.log('未找到Apple设备型号');
    }

    // 测试国产品牌
    console.log('\n=== 测试国产手机品牌 ===');
    const chineseBrands = ['华为', '小米'];
    const allDevices = [];

    for (const brand of chineseBrands) {
      console.log(`\n--- 测试 ${brand} ---`);
      const devices = await crawler.crawlDeviceModels(brand, 1);
      allDevices.push(...devices);
      console.log(`${brand}: ${devices.length} 个设备型号`);
    }

    console.log(`\n🎉 测试完成！`);
    console.log(`总计爬取到 ${allDevices.length} 个设备型号`);

    // 显示统计信息
    if (allDevices.length > 0) {
      console.log('\n📊 详细统计:');
      const brandCount = {};
      allDevices.forEach(device => {
        brandCount[device.brand] = (brandCount[device.brand] || 0) + 1;
      });

      Object.entries(brandCount).forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} 个设备`);
      });
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    await crawler.close();
  }
}

// 执行测试
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { SystemChromeCrawler };
