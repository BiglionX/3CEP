// 批量处理?- 负责事件的批量处理、压缩和上传

export interface BatchProcessorConfig {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  compressionEnabled: boolean;
  apiUrl: string;
  appId: string;
}

export interface ProcessingResult {
  success: boolean;
  processedEvents: number;
  failedEvents: number;
  processingTime: number;
  errorMessage?: string;
}

export class BatchProcessor {
  private config: BatchProcessorConfig;
  private eventBuffer: any[] = [];
  private isProcessing = false;
  private retryCount = 0;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<BatchProcessorConfig> = {}) {
    this.config = {
      batchSize: 20,
      flushInterval: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      compressionEnabled: true,
      apiUrl: '/api/tracking/events',
      appId: 'default-app',
      ...config,
    };

    this.startFlushTimer();
  }

  // 添加事件到处理队?  addEvent(event: any): void {
    this.eventBuffer.push(event);

    // 如果缓冲区达到批处理大小，立即处?    if (this.eventBuffer.length >= this.config.batchSize) {
      this.processBatch();
    }
  }

  // 手动触发批处?  async flush(): Promise<ProcessingResult> {
    return this.processBatch();
  }

  // 获取当前缓冲区状?  getBufferStatus(): {
    bufferSize: number;
    isProcessing: boolean;
    retryCount: number;
  } {
    return {
      bufferSize: this.eventBuffer.length,
      isProcessing: this.isProcessing,
      retryCount: this.retryCount,
    };
  }

  // 清空缓冲?  clearBuffer(): void {
    this.eventBuffer = [];
    this.retryCount = 0;
  }

  // 停止处理?  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // 启动定时刷新
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventBuffer.length > 0 && !this.isProcessing) {
        this.processBatch();
      }
    }, this.config.flushInterval);
  }

  // 处理事件批次
  private async processBatch(): Promise<ProcessingResult> {
    if (this.isProcessing || this.eventBuffer.length === 0) {
      return {
        success: true,
        processedEvents: 0,
        failedEvents: 0,
        processingTime: 0,
      };
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      // 获取要处理的事件批次
      const batch = this.eventBuffer.slice(0, this.config.batchSize);

      // 准备发送的数据
      const payload = this.preparePayload(batch);

      // 发送请?      const result = await this.sendBatch(payload);

      const processingTime = Date.now() - startTime;

      if (result.success) {
        // 成功处理，移除已处理的事?        this.eventBuffer.splice(0, batch.length);
        this.retryCount = 0;

        return {
          success: true,
          processedEvents: batch.length,
          failedEvents: 0,
          processingTime,
        };
      } else {
        // 处理失败，增加重试计?        return await this.handleRetry(
          batch,
          processingTime,
          result.errorMessage || 'Unknown error'
        );
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return await this.handleRetry(
        this.eventBuffer.slice(0, this.config.batchSize),
        processingTime,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      this.isProcessing = false;
    }
  }

  // 准备发送载?  private preparePayload(events: any[]): any {
    const payload = {
      appId: this.config.appId,
      timestamp: new Date().toISOString(),
      events: events,
      metadata: {
        batchSize: events.length,
        compression: this.config.compressionEnabled,
      },
    };

    // 如果启用压缩，进行数据压?    if (this.config.compressionEnabled) {
      return this.compressPayload(payload);
    }

    return payload;
  }

  // 压缩载荷数据
  private compressPayload(payload: any): any {
    try {
      // 简单的JSON压缩 - 移除不必要的空白字符
      const jsonString = JSON.stringify(payload);
      const compressedString = jsonString.replace(/\s+/g, ' ');

      return {
        ...payload,
        _compressed: true,
        _originalSize: jsonString.length,
        _compressedSize: compressedString.length,
      };
    } catch (error) {
      console.warn('Payload compression failed, sending uncompressed:', error);
      return payload;
    }
  }

  // 发送批次数?  private async sendBatch(
    payload: any
  ): Promise<{ success: boolean; errorMessage?: string }> {
    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.config.appId,
          'X-Batch-Size': payload.events.length.toString(),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10秒超?      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success === false) {
        throw new Error(result.message || 'Server rejected the batch');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // 处理重试逻辑
  private async handleRetry(
    batch: any[],
    processingTime: number,
    errorMessage: string
  ): Promise<ProcessingResult> {
    this.retryCount++;

    if (this.retryCount <= this.config.maxRetries) {
      console.warn(
        `Batch processing failed, retry ${this.retryCount}/${this.config.maxRetries}:`,
        errorMessage
      );

      // 等待后重?      await this.delay(this.config.retryDelay * this.retryCount);
      return this.processBatch();
    } else {
      console.error('Max retries exceeded, dropping batch:', errorMessage);

      // 达到最大重试次数，丢弃这批事件
      this.eventBuffer.splice(0, batch.length);
      this.retryCount = 0;

      return {
        success: false,
        processedEvents: 0,
        failedEvents: batch.length,
        processingTime,
        errorMessage: `Max retries exceeded: ${errorMessage}`,
      };
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 工具函数：数据压?export class DataCompressor {
  // 简单的数据压缩算法
  static compress(data: Record<string, any>): string {
    try {
      const jsonString = JSON.stringify(data);
      // 这里可以实现更复杂的压缩算法
      // 当前使用简单的base64编码作为示例
      return btoa(encodeURIComponent(jsonString));
    } catch (error) {
      console.warn('Compression failed:', error);
      return JSON.stringify(data);
    }
  }

  // 解压缩数?  static decompress(compressedData: string): Record<string, any> {
    try {
      const decoded = decodeURIComponent(atob(compressedData));
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('Decompression failed:', error);
      return {};
    }
  }

  // 计算压缩比率
  static getCompressionRatio(original: string, compressed: string): number {
    return ((original.length - compressed.length) / original.length) * 100;
  }
}
