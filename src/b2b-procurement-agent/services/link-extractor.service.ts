/**
 * 链接内容抓取服务
 * 实现网页内容智能抓取和采购信息提取
 * 注意：此版本使用Node.js内置功能，避免依赖jsdom
 */

import { RawProcurementRequest } from "../models/procurement.model";

// 网页内容分析结果接口
interface WebContentAnalysis {
  title: string;
  mainContent: string;
  extractedText: string;
  metadata: Record<string, any>;
  procurementRelevantContent: string;
  keyPhrases: string[];
  language: string;
  processingSteps: string[];
}

// 商品信息提取结果
interface ProductInfo {
  name: string;
  price?: string;
  specifications?: string[];
  availability?: string;
  seller?: string;
}

export class LinkExtractorService {
  private userAgent: string;
  private timeout: number;

  constructor() {
    this.userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    this.timeout = 10000; // 10秒超时
  }

  /**
   * 处理链接输入，提取采购相关信息
   */
  async processLinkRequest(rawRequest: RawProcurementRequest): Promise<{
    extractedContent: string;
    productInfos: ProductInfo[];
    pageTitle: string;
    keyPhrases: string[];
    processingSteps: string[];
  }> {
    if (!rawRequest.sourceUrl) {
      throw new Error("链接URL不能为空");
    }

    const processingSteps: string[] = ["开始链接内容抓取"];
    let extractedContent = "";
    let productInfos: ProductInfo[] = [];
    let pageTitle = "";
    let keyPhrases: string[] = [];

    try {
      // 1. 验证链接有效性
      processingSteps.push("验证链接有效性");
      const isValid = await this.validateUrl(rawRequest.sourceUrl);
      if (!isValid) {
        throw new Error("无效的链接地址");
      }

      // 2. 抓取网页内容
      processingSteps.push("抓取网页内容");
      const htmlContent = await this.fetchWebContent(rawRequest.sourceUrl);
      processingSteps.push("网页内容抓取完成");

      // 3. 分析网页内容
      processingSteps.push("分析网页内容");
      const analysis = await this.analyzeWebContent(
        htmlContent,
        rawRequest.sourceUrl
      );
      extractedContent = analysis.procurementRelevantContent;
      pageTitle = analysis.title;
      keyPhrases = analysis.keyPhrases;
      processingSteps.push("网页内容分析完成");

      // 4. 提取商品信息（如果是电商网站）
      processingSteps.push("提取商品信息");
      productInfos = await this.extractProductInfo(
        htmlContent,
        rawRequest.sourceUrl
      );
      processingSteps.push(
        `商品信息提取完成，找到${productInfos.length}个商品`
      );

      // 5. 内容优化和清理
      processingSteps.push("内容优化和清理");
      extractedContent = this.optimizeExtractedContent(extractedContent);

      return {
        extractedContent,
        productInfos,
        pageTitle,
        keyPhrases,
        processingSteps,
      };
    } catch (error) {
      console.error("链接处理失败:", error);
      processingSteps.push(
        "处理失败: " + (error instanceof Error ? error.message : "未知错误")
      );
      throw error;
    }
  }

  /**
   * 验证URL有效性
   */
  private async validateUrl(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * 抓取网页内容
   */
  private async fetchWebContent(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": this.userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        throw new Error("URL不是HTML页面");
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("请求超时");
      }
      throw error;
    }
  }

  /**
   * 分析网页内容（简化版本，不使用JSDOM）
   */
  private async analyzeWebContent(
    html: string,
    url: string
  ): Promise<WebContentAnalysis> {
    // 移除HTML标签，提取纯文本
    const cleanText = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 提取标题
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "未知页面";

    // 提取采购相关内容
    const procurementContent =
      this.extractProcurementRelevantContent(cleanText);

    // 提取关键词汇
    const keyPhrases = this.extractKeyPhrases(cleanText);

    // 提取简单的元数据
    const metadata: Record<string, any> = {};

    // 提取description
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
    );
    if (descMatch) metadata.description = descMatch[1];

    // 提取keywords
    const keywordsMatch = html.match(
      /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i
    );
    if (keywordsMatch) metadata.keywords = keywordsMatch[1];

    return {
      title,
      mainContent: cleanText.substring(0, 1000),
      extractedText: cleanText,
      metadata,
      procurementRelevantContent: procurementContent,
      keyPhrases,
      language: this.detectLanguage(cleanText),
      processingSteps: ["HTML解析", "内容提取", "采购信息筛选"],
    };
  }

  /**
   * 提取主要内容
   */
  private extractMainContent(document: Document): string {
    // 尝试找到主要内容区域
    const contentSelectors = [
      "main",
      '[role="main"]',
      "#content",
      ".content",
      "article",
      ".post-content",
      ".entry-content",
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || "";
      }
    }

    // 如果找不到特定内容区域，返回body文本
    return document.body.textContent?.trim() || "";
  }

  /**
   * 提取采购相关内容
   */
  private extractProcurementRelevantContent(text: string): string {
    // 采购相关关键词
    const procurementKeywords = [
      "采购",
      "购买",
      "订购",
      "需求",
      "清单",
      "规格",
      "配置",
      "价格",
      "预算",
      "报价",
      "型号",
      "品牌",
      "数量",
      "delivery",
      "shipping",
      "product",
      "specification",
    ];

    // 按行分割文本
    const lines = text.split("\n");
    const relevantLines = lines.filter((line) => {
      const lowerLine = line.toLowerCase();
      return procurementKeywords.some((keyword) =>
        lowerLine.includes(keyword.toLowerCase())
      );
    });

    return relevantLines.join("\n").trim();
  }

  /**
   * 提取关键词汇
   */
  private extractKeyPhrases(text: string): string[] {
    // 简单的关键词提取（实际应用中可以使用更复杂的NLP技术）
    const stopWords = new Set([
      "的",
      "了",
      "在",
      "是",
      "我",
      "有",
      "和",
      "就",
      "不",
      "人",
      "都",
      "一",
      "一个",
    ]);

    const words = text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word))
      .map((word) => word.toLowerCase());

    // 统计词频
    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // 返回高频词汇
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * 提取元数据
   */
  private extractMetadata(document: Document): Record<string, any> {
    const metadata: Record<string, any> = {};

    // 提取meta标签
    const metaTags = document.querySelectorAll("meta");
    metaTags.forEach((tag) => {
      const name = tag.getAttribute("name") || tag.getAttribute("property");
      const content = tag.getAttribute("content");
      if (name && content) {
        metadata[name] = content;
      }
    });

    return metadata;
  }

  /**
   * 检测语言
   */
  private detectLanguage(text: string): string {
    // 简单的语言检测
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;

    return chineseChars > englishChars ? "zh" : "en";
  }

  /**
   * 提取商品信息（简化版本）
   */
  private async extractProductInfo(
    html: string,
    url: string
  ): Promise<ProductInfo[]> {
    const products: ProductInfo[] = [];

    // 简单的商品信息提取
    const productPatterns = [
      /([^：:]+?)[:：]\s*([^：:\n]+)/g,
      /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*(?:元|USD|EUR|CNY)/g,
    ];

    const cleanText = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    productPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        if (match[1] && match[1].length > 2) {
          products.push({
            name: match[1].trim(),
            ...(match[2] ? { price: match[2] } : {}),
          });
        }
      }
    });

    return products.slice(0, 10); // 限制返回数量
  }

  /**
   * 判断是否为电商网站
   */
  private isEcommerceSite(url: string, document: Document): boolean {
    const ecommerceIndicators = [
      "taobao.com",
      "tmall.com",
      "jd.com",
      "amazon.com",
      "shop",
      "store",
      "product",
      "item",
    ];

    const urlLower = url.toLowerCase();
    const title =
      document.querySelector("title")?.textContent?.toLowerCase() || "";

    return ecommerceIndicators.some(
      (indicator) => urlLower.includes(indicator) || title.includes(indicator)
    );
  }

  /**
   * 提取电商网站商品
   */
  private extractEcommerceProducts(document: Document): ProductInfo[] {
    const products: ProductInfo[] = [];

    // 查找商品容器
    const productSelectors = [
      ".product",
      ".item",
      ".goods",
      "[data-product-id]",
      ".product-item",
      ".grid-item",
    ];

    for (const selector of productSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const name = element
          .querySelector(".product-title, .item-title, h3, h4")
          ?.textContent?.trim();
        const price = element
          .querySelector(".price, .cost, .amount")
          ?.textContent?.trim();

        if (name) {
          products.push({
            name,
            price: price || undefined,
          });
        }
      });
    }

    return products;
  }

  /**
   * 提取普通网站产品信息
   */
  private extractGeneralProducts(document: Document): ProductInfo[] {
    const products: ProductInfo[] = [];

    // 查找可能的产品信息
    const productPatterns = [
      /([^：:]+?)[:：]\s*([^：:\n]+)/g,
      /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*(?:元|USD|EUR|CNY)/g,
    ];

    const text = document.body.textContent || "";

    productPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].length > 2) {
          products.push({
            name: match[1].trim(),
            ...(match[2] ? { price: match[2] } : {}),
          });
        }
      }
    });

    return products;
  }

  /**
   * 优化提取的内容
   */
  private optimizeExtractedContent(content: string): string {
    // 移除多余的空白行
    let optimized = content.replace(/\n\s*\n/g, "\n").trim();

    // 限制长度
    if (optimized.length > 2000) {
      optimized = optimized.substring(0, 2000) + "...";
    }

    return optimized;
  }
}
