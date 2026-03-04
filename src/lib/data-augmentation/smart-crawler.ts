import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer';
import { Device } from '@/types/common';

/**
 * 智能设备型号爬虫系统
 * 基于Puppeteer实现自动化设备数据采? */
export class SmartDeviceCrawler {
  private browser: Browser | null = null;
  private userAgentList: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  constructor() {
    this.initializeUserAgents();
  }

  /**
   * 初始化浏览器实例
   */
  private async initializeBrowser(): Promise<void> {
    if (this.browser) return;

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
        timeout: 30000,
      });

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('浏览器实例初始化成功')} catch (error) {
      logger.error('浏览器初始化失败:', error);
      throw new Error(`浏览器初始化失败: ${error}`);
    }
  }

  /**
   * 初始化用户代理列?   */
  private initializeUserAgents(): void {
    // 可以从外部配置文件加载更多User-Agent
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`初始化了 ${this.userAgentList.length} 个用户代理`)}

  /**
   * 获取随机用户代理
   */
  private getRandomUserAgent(): string {
    return this.userAgentList[
      Math.floor(Math.random() * this.userAgentList.length)
    ];
  }

  /**
   * 创建新的页面实例
   */
  private async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initializeBrowser();
    }

    const page = await this.browser!.newPage();

    // 设置随机用户代理
    await page.setUserAgent(this.getRandomUserAgent());

    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });

    // 设置请求拦截
    await page.setRequestInterception(true);

    page.on('request', (req: HTTPRequest) => {
      // 只允许必要的资源加载
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  /**
   * 爬取设备型号数据
   * @param brand 品牌名称
   * @param maxPages 最大爬取页?   */
  async crawlDeviceModels(
    brand: string,
    maxPages: number = 5
  ): Promise<Device[]> {
    const devices: Device[] = [];
    let currentPage = 1;

    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`开始爬取品?${brand} 的设备型号数据`)while (currentPage <= maxPages) {
        const pageDevices = await this.crawlBrandPage(brand, currentPage);

        if (pageDevices.length === 0) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?${currentPage} 页无数据，停止爬取`)break;
        }

        devices.push(...pageDevices);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `�?${currentPage} 页爬取到 ${pageDevices.length} 个设备型号`
        )currentPage++;

        // 添加随机延迟避免被封
        await this.randomDelay(1000, 3000);
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `品牌 ${brand} 爬取完成，共获得 ${devices.length} 个设备型号`
      )return devices;
    } catch (error) {
      logger.error(`爬取品牌 ${brand} 失败:`, error);
      throw error;
    }
  }

  /**
   * 爬取单个品牌的页面数?   */
  private async crawlBrandPage(brand: string, page: number): Promise<Device[]> {
    const pageInstance = await this.createPage();
    const devices: Device[] = [];

    try {
      // 构造搜索URL（这里以百度百科为例，实际可根据需求调整）
      const searchUrl = `https://baike.baidu.com/search?word=${encodeURIComponent(brand)}手机型号`;

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.debug(`访问URL: ${searchUrl}`)await pageInstance.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // 等待页面加载完成
      await pageInstance
        .waitForSelector('.search-list', { timeout: 10000 })
        .catch(() => {
          console.warn('未找到搜索结果列?);
        });

      // 提取设备型号信息
      const extractedDevices = await pageInstance.evaluate(
        (brandName: string) => {
          const devices: any[] = [];
          const resultList = document.querySelectorAll('.search-list dd a');

          resultList.forEach((element: any) => {
            const title = element?.trim() || '';
            const href = element.href;

            // 简单的型号提取逻辑（可根据实际页面结构调整?            if (
              title.includes(brandName) &&
              (title.includes('手机') || title.includes('型号'))
            ) {
              const modelMatch = title.match(
                /[\w\s\-]+(?:Pro|Max|Plus|SE|\d+)/i
              );
              if (modelMatch) {
                devices.push({
                  name: title,
                  model: modelMatch[0].trim(),
                  brand: brandName,
                  url: href,
                  source: 'baidu_baike',
                });
              }
            }
          });

          return devices;
        },
        brand
      );

      // 转换为标准Device格式
      extractedDevices.forEach((item: any) => {
        devices.push({
          id: this.generateDeviceId(item.brand, item.model),
          brand: item.brand,
          model: item.model,
          category: '手机',
          release_year: this.extractReleaseYear(item.name),
          specifications: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error(`爬取页面失败 (品牌: ${brand}, 页码: ${page}):`, error);
    } finally {
      await pageInstance.close();
    }

    return devices;
  }

  /**
   * 生成设备唯一ID
   */
  private generateDeviceId(brand: string, model: string): string {
    return `${brand.toLowerCase()}_${model.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  /**
   * 从名称中提取发布年份
   */
  private extractReleaseYear(name: string): number {
    const yearMatch = name.match(/20\d{2}/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      return year >= 2010 && year <= new Date().getFullYear()
        ? year
        : new Date().getFullYear();
    }
    return new Date().getFullYear();
  }

  /**
   * 随机延迟
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 批量爬取多个品牌
   */
  async crawlMultipleBrands(
    brands: string[],
    maxPagesPerBrand: number = 3
  ): Promise<Device[]> {
    const allDevices: Device[] = [];

    for (const brand of brands) {
      try {
        const brandDevices = await this.crawlDeviceModels(
          brand,
          maxPagesPerBrand
        );
        allDevices.push(...brandDevices);

        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `品牌 ${brand} 爬取完成，获?${brandDevices.length} 个设备`
        )} catch (error) {
        console.error(`爬取品牌 ${brand} 失败:`, error);
        // 继续处理下一个品?      }

      // 品牌间添加较长延?      await this.randomDelay(3000, 6000);
    }

    return allDevices;
  }

  /**
   * 关闭浏览?   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('浏览器已关闭')}
  }

  /**
   * 获取爬虫状?   */
  getStatus(): {
    isRunning: boolean;
    userAgentCount: number;
  } {
    return {
      isRunning: !!this.browser,
      userAgentCount: this.userAgentList.length,
    };
  }
}

// 导出单例实例
export const deviceCrawler = new SmartDeviceCrawler();

// 使用示例
/*
const crawler = new SmartDeviceCrawler();

// 爬取单个品牌
const appleDevices = await crawler.crawlDeviceModels('Apple', 3);

// 批量爬取多个品牌
const brands = ['华为', '小米', 'OPPO', 'vivo', '三星'];
const allDevices = await crawler.crawlMultipleBrands(brands, 2);

await crawler.close();
*/
