/**
 * V-ML-05: Node.js ML模型客户端服? * 封装调用Python微服务的HTTP客户? */

// 使用fetch替代axios以避免依赖问?class MLModelClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: any = {}) {
    this.baseUrl =
      config.baseUrl || process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = config.timeout || 10000; // 10秒超?    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // 1秒重试间?  }

  /**
   * 统一错误处理
   */
  private handleError(error: any) {
    if (error.name === 'AbortError') {
      return new Error('ML服务请求超时');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('无法连接到ML服务，请检查服务是否运?);
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response?.detail || error.response.statusText;

      switch (status) {
        case 400:
          return new Error(`请求参数错误: ${message}`);
        case 404:
          return new Error(`ML服务端点不存? ${message}`);
        case 503:
          return new Error(`ML服务不可? ${message}`);
        case 500:
          return new Error(`ML服务内部错误: ${message}`);
        default:
          return new Error(`ML服务错误 ${status}: ${message}`);
      }
    }

    return error;
  }

  /**
   * 带重试机制的请求
   */
  private async requestWithRetry(
    method: string,
    url: string,
    data: any = null,
    attempt: number = 1
  ): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      };

      if (data) {
        requestOptions.body = JSON.stringify(data);
      }

      const fullUrl = `${this.baseUrl}${url}`;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔍 ML Client Request: ${method} ${fullUrl}`)const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?ML Client Response: ${response.status} ${url}`)if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      // 如果是最后一次尝试或非网络错误，则直接抛?      const isNetworkError =
        error.name === 'AbortError' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        (error.response && [502, 503, 504].includes(error.response.status));

      if (attempt >= this.retryAttempts || !isNetworkError) {
        throw this.handleError(error);
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?�?{attempt}次请求失败，${this.retryDelay}ms后重?..`)await new Promise(resolve => setTimeout(resolve, this.retryDelay));

      return this.requestWithRetry(method, url, data, attempt + 1);
    }
  }

  /**
   * 健康检?   */
  async healthCheck() {
    try {
      const response = await this.requestWithRetry('GET', '/health');
      return {
        status: 'healthy',
        service: 'ml-model-service',
        data: response,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'ml-model-service',
        error: (error as Error).message,
      };
    }
  }

  /**
   * 单次价格预测
   */
  async predictPrice(deviceData: any) {
    try {
      // 数据验证
      this.validateDeviceData(deviceData);

      // 标准化数据格?      const requestData = this.normalizeDeviceData(deviceData);

      const response = await this.requestWithRetry(
        'POST',
        '/predict',
        requestData
      );

      return {
        success: true,
        data: {
          predictedPrice: response.predicted_price,
          confidence: response.confidence,
          predictionTime: response.prediction_time,
          modelVersion: response.model_version,
        },
      };
    } catch (error) {
      console.error('ML预测失败:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 批量价格预测
   */
  async batchPredict(devices: any[]) {
    try {
      if (!Array.isArray(devices) || devices.length === 0) {
        throw new Error('设备列表不能为空');
      }

      // 验证并标准化所有设备数?      const normalizedDevices = devices.map((device, index) => {
        try {
          this.validateDeviceData(device);
          return this.normalizeDeviceData(device);
        } catch (error) {
          throw new Error(
            `�?{index + 1}个设备数据无? ${(error as Error).message}`
          );
        }
      });

      const requestData = { devices: normalizedDevices };
      const response = await this.requestWithRetry(
        'POST',
        '/predict/batch',
        requestData
      );

      return {
        success: true,
        data: {
          predictions: response.predictions.map((pred: any) => ({
            predictedPrice: pred.predicted_price,
            confidence: pred.confidence,
            predictionTime: pred.prediction_time,
            modelVersion: pred.model_version,
          })),
          totalProcessingTime: response.total_processing_time,
          count: response.predictions.length,
        },
      };
    } catch (error) {
      console.error('批量ML预测失败:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 获取模型信息
   */
  async getModelInfo() {
    try {
      const response = await this.requestWithRetry('GET', '/model/info');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 触发模型重载
   */
  async reloadModel() {
    try {
      const response = await this.requestWithRetry('POST', '/model/reload');
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 验证设备数据
   */
  validateDeviceData(data: any) {
    const requiredFields = [
      'deviceAgeMonths',
      'brandEncoded',
      'storageGb',
      'ramGb',
      'screenConditionEncoded',
      'batteryHealthPercent',
      'appearanceGradeEncoded',
      'repairCount',
      'partReplacementCount',
      'transferCount',
    ];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`缺少必需字段: ${field}`);
      }
    }

    // 数值范围验?    if (data.deviceAgeMonths < 0 || data.deviceAgeMonths > 120) {
      throw new Error('设备年龄应在0-120个月范围?);
    }

    if (data.storageGb <= 0 || data.storageGb > 2048) {
      throw new Error('存储容量应在合理范围?);
    }

    if (data.ramGb <= 0 || data.ramGb > 64) {
      throw new Error('内存容量应在合理范围?);
    }

    if (data.batteryHealthPercent < 0 || data.batteryHealthPercent > 100) {
      throw new Error('电池健康度应?-100范围?);
    }
  }

  /**
   * 标准化设备数据格?   */
  normalizeDeviceData(data: any) {
    return {
      device_age_months: Number(data.deviceAgeMonths),
      brand_encoded: Number(data.brandEncoded),
      storage_gb: Number(data.storageGb),
      ram_gb: Number(data.ramGb),
      screen_condition_encoded: Number(data.screenConditionEncoded),
      battery_health_percent: Number(data.batteryHealthPercent),
      appearance_grade_encoded: Number(data.appearanceGradeEncoded),
      repair_count: Number(data.repairCount),
      part_replacement_count: Number(data.partReplacementCount),
      transfer_count: Number(data.transferCount),
      market_avg_price: data.marketAvgPrice
        ? Number(data.marketAvgPrice)
        : null,
      market_min_price: data.marketMinPrice
        ? Number(data.marketMinPrice)
        : null,
      market_max_price: data.marketMaxPrice
        ? Number(data.marketMaxPrice)
        : null,
      market_sample_count: data.marketSampleCount
        ? Number(data.marketSampleCount)
        : null,
    };
  }

  /**
   * 设置基础URL
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * 设置超时时间
   */
  setTimeout(timeout: number) {
    this.timeout = timeout;
  }
}

// 导出客户端实?const mlClient = new MLModelClient();

export { MLModelClient, mlClient };
export default mlClient;
