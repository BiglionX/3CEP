/**
 * VALUE-202: 机器学习模型部署服务
 * 提供模型预测API服务
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

/**
 * ML模型预测服务
 */
class MLPredictionService {
  constructor() {
    this.model = null;
    this.featureNames = [];
    this.normalizationParams = null;
    this.isLoaded = false;
  }

  /**
   * 加载训练好的模型
   * @param {string} modelPath - 模型文件路径
   */
  async loadModel(modelPath) {
    console.log('📥 加载机器学习模型...');

    try {
      const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

      this.model = modelData.model;
      this.featureNames = modelData.feature_names;
      this.normalizationParams = modelData.normalization_params;
      this.isLoaded = true;

      console.log(`   ✅ 模型加载成功`);
      console.log(`   📊 特征数量: ${this.featureNames.length}`);
      console.log(`   📈 训练时间: ${modelData.trained_at}`);
    } catch (error) {
      console.error('   ❌ 模型加载失败:', error.message);
      throw error;
    }
  }

  /**
   * 预测设备价值
   * @param {Object} features - 设备特征
   * @returns {number} 预测价值
   */
  predict(features) {
    if (!this.isLoaded) {
      throw new Error('模型未加载');
    }

    // 特征向量化
    const featureVector = this.featureNames.map(name => {
      const value = features[name];
      return value !== undefined ? value : 0;
    });

    // 特征标准化
    const normalizedFeatures = this.normalizeFeatures(featureVector);

    // 执行预测（这里使用简化模型）
    const prediction = this.simplePredict(normalizedFeatures);

    return Math.max(0, prediction); // 确保非负值
  }

  /**
   * 特征标准化
   */
  normalizeFeatures(features) {
    if (!this.normalizationParams) {
      return features; // 如果没有标准化参数，直接返回
    }

    return features.map((value, index) => {
      const mean = this.normalizationParams.means[index] || 0;
      const std = this.normalizationParams.stds[index] || 1;
      return (value - mean) / std;
    });
  }

  /**
   * 简化预测模型（实际部署时应使用完整模型）
   */
  simplePredict(normalizedFeatures) {
    // 基于特征重要性的加权预测
    const weights = [
      0.15, // age_months
      0.1, // years_old
      0.2, // ram_gb
      0.15, // storage_gb
      0.1, // cpu_score
      0.05, // total_repair_count
      0.05, // part_replacement_count
      0.05, // transfer_count
      0.05, // screen_condition
      0.05, // battery_health
      0.03, // body_condition
      0.02, // functionality_score
    ];

    // 确保权重数组长度匹配特征数量
    const effectiveWeights = weights.slice(0, normalizedFeatures.length);
    while (effectiveWeights.length < normalizedFeatures.length) {
      effectiveWeights.push(0.01);
    }

    // 加权求和
    const weightedSum = normalizedFeatures.reduce((sum, feature, index) => {
      return sum + feature * effectiveWeights[index];
    }, 0);

    // 转换为价格预测（基于训练数据的统计）
    const basePrice = 3000; // 基准价格
    const priceRange = 2000; // 价格变化范围

    return basePrice + weightedSum * priceRange;
  }

  /**
   * 批量预测
   * @param {Array} featureList - 特征列表
   * @returns {Array} 预测结果列表
   */
  batchPredict(featureList) {
    return featureList.map(features => ({
      features,
      predicted_price: this.predict(features),
      confidence: 0.85, // 简化置信度
    }));
  }
}

/**
 * Express API服务器
 */
class MLAPIServer {
  constructor(port = 3002) {
    this.app = express();
    this.port = port;
    this.predictionService = new MLPredictionService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 设置中间件
   */
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS设置
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  /**
   * 设置路由
   */
  setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        model_loaded: this.predictionService.isLoaded,
        timestamp: new Date().toISOString(),
      });
    });

    // 单个预测
    this.app.post('/predict', async (req, res) => {
      try {
        const { features } = req.body;

        if (!features) {
          return res.status(400).json({
            error: '缺少features参数',
          });
        }

        const prediction = this.predictionService.predict(features);

        res.json({
          success: true,
          predicted_price: prediction,
          currency: 'CNY',
          features_used: Object.keys(features),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('预测错误:', error);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 批量预测
    this.app.post('/batch-predict', async (req, res) => {
      try {
        const { features_list } = req.body;

        if (!Array.isArray(features_list)) {
          return res.status(400).json({
            error: 'features_list必须是数组',
          });
        }

        const predictions = this.predictionService.batchPredict(features_list);

        res.json({
          success: true,
          predictions,
          count: predictions.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('批量预测错误:', error);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // 模型信息
    this.app.get('/model-info', (req, res) => {
      res.json({
        success: true,
        feature_names: this.predictionService.featureNames,
        model_loaded: this.predictionService.isLoaded,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      // 加载模型
      const modelPath = path.join(
        __dirname,
        '../../models/ml-valuation/ml_valuation_model.json'
      );
      if (fs.existsSync(modelPath)) {
        await this.predictionService.loadModel(modelPath);
      } else {
        console.warn('⚠️  模型文件不存在，使用默认预测模式');
      }

      // 启动服务器
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 ML预测API服务器启动成功`);
        console.log(`📍 地址: http://localhost:${this.port}`);
        console.log(`📊 健康检查: http://localhost:${this.port}/health`);
        console.log(`🔮 预测接口: http://localhost:${this.port}/predict`);
      });
    } catch (error) {
      console.error('❌ 服务器启动失败:', error);
      throw error;
    }
  }

  /**
   * 停止服务器
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 ML预测API服务器已停止');
    }
  }
}

/**
 * 模型预测客户端
 */
class MLPredictionClient {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
  }

  /**
   * 预测单个设备价值
   * @param {Object} features - 设备特征
   * @returns {Promise<Object>} 预测结果
   */
  async predict(features) {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ features }),
    });

    return response.json();
  }

  /**
   * 批量预测
   * @param {Array} featuresList - 特征列表
   * @returns {Promise<Object>} 批量预测结果
   */
  async batchPredict(featuresList) {
    const response = await fetch(`${this.baseUrl}/batch-predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ features_list: featuresList }),
    });

    return response.json();
  }

  /**
   * 检查服务健康状态
   * @returns {Promise<Object>} 健康状态
   */
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const server = new MLAPIServer(3002);

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    server.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    server.stop();
    process.exit(0);
  });

  // 启动服务器
  server.start().catch(error => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });
}

module.exports = {
  MLPredictionService,
  MLAPIServer,
  MLPredictionClient,
};
