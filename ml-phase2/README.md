# 第二阶段：内部历史数据机器学习模型

## 项目概述

基于平台积累的实际成交数据，构建机器学习价格预测模型，与现有规则引擎形成混合估价系统。

## 目录结构

```
ml-phase2/
├── config.py                 # 配置文件
├── requirements.txt          # Python依赖
├── train_pipeline.py         # 完整训练流水线
├── utils/
│   └── database.py          # 数据库管理工具
├── preprocessing/
│   └── data_processor.py    # 数据清洗与特征工程
├── models/
│   └── trainer.py           # 模型训练与调优
├── features/
│   └── market_enhancer.py   # 市场特征增强
├── api/
│   └── api_service.py       # 模型API服务
└── data/                    # 数据存储目录
└── models/                  # 模型存储目录

src/services/
├── ml-client.service.ts     # Node.js客户端
└── ml-confidence.service.ts # 置信度评估服务
```

## 核心功能实现

### V-ML-01: 内部成交数据采集

- 从LIFE档案和订单系统提取历史成交数据
- 支持众筹支持记录、维修订单、FCX兑换等多种数据源
- 自动关联设备档案和生命周期事件

### V-ML-02: 数据清洗与特征工程

- 数据质量检查和异常值处理
- 设备特征提取（年龄、品牌、存储、内存等）
- 分类特征编码和数值特征标准化
- 市场特征集成

### V-ML-03: 模型训练与调优

- LightGBM和XGBoost双模型训练
- 交叉验证和超参数调优
- 多种评估指标（RMSE、MAE、R²）
- 特征重要性分析

### V-ML-04: 模型部署（Python微服务）

- 基于FastAPI的REST API服务
- 单次和批量预测接口
- 健康检查和模型管理接口
- 自动重载机制

### V-ML-05: Node.js模型客户端

- HTTP客户端封装，支持重试和超时
- 请求拦截和统一错误处理
- 数据验证和格式标准化
- 与现有系统无缝集成

### V-ML-06: 市场特征增强

- 实时集成市场均价数据
- 市场衍生特征计算
- 动态特征更新机制
- 在线预测上下文增强

### V-ML-07: ML模型置信度评估

- 多维度置信度因子计算
- 综合置信度评分
- 置信级别分类
- 智能推荐建议

## 快速开始

### 1. 环境准备

```bash
# 安装Python依赖
cd ml-phase2
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置数据库连接等参数
```

### 2. 模型训练

```bash
# 基础训练（不使用市场特征）
python train_pipeline.py

# 使用市场特征训练
python train_pipeline.py --no-market

# 启用超参数调优
python train_pipeline.py --tune

# 调试模式
python train_pipeline.py --debug
```

### 3. 启动模型服务

```bash
# 启动FastAPI服务
cd ml-phase2/api
python api_service.py

# 服务将在 http://localhost:8000 启动
```

### 4. 运行集成测试

```bash
# Node.js端到端测试
cd ../..
node tests/integration/test-ml-integration.js
```

## API接口说明

### 健康检查

```
GET /health
```

### 单次预测

```
POST /predict
Content-Type: application/json

{
  "device_age_months": 24,
  "brand_encoded": 0,
  "storage_gb": 128,
  "ram_gb": 6,
  "screen_condition_encoded": 4,
  "battery_health_percent": 85,
  "appearance_grade_encoded": 4,
  "repair_count": 0,
  "part_replacement_count": 0,
  "transfer_count": 1,
  "market_avg_price": 4500,
  "market_min_price": 3800,
  "market_max_price": 5200,
  "market_sample_count": 25
}
```

### 批量预测

```
POST /predict/batch
Content-Type: application/json

{
  "devices": [
    { /* 设备1特征 */ },
    { /* 设备2特征 */ }
  ]
}
```

## Node.js集成示例

```typescript
import { mlClient } from '@/services/ml-client.service';

// 单次预测
const result = await mlClient.predictPrice({
  deviceAgeMonths: 24,
  brandEncoded: 0,
  storageGb: 128,
  // ... 其他特征
});

if (result.success) {
  console.log(`预测价格: ¥${result.data.predictedPrice}`);
  console.log(`置信度: ${(result.data.confidence * 100).toFixed(1)}%`);
}

// 批量预测
const batchResult = await mlClient.batchPredict([
  {
    /* 设备1 */
  },
  {
    /* 设备2 */
  },
]);
```

## 置信度评估

```typescript
import { mlConfidenceService } from '@/services/ml-confidence.service';

const confidenceResult = mlConfidenceService.calculateConfidence(
  predictedPrice,
  deviceFeatures
);

console.log(`置信度: ${(confidenceResult.confidence * 100).toFixed(1)}%`);
console.log(`置信级别: ${confidenceResult.confidenceLevel}`);
console.log(`建议: ${confidenceResult.recommendations.join(', ')}`);
```

## 部署配置

### 生产环境配置

```bash
# .env.production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
ML_SERVICE_URL=http://ml-service.internal:8000
ML_API_HOST=0.0.0.0
ML_API_PORT=8000
ML_API_DEBUG=False
LOG_LEVEL=INFO
```

### Docker部署

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY ml-phase2/requirements.txt .
RUN pip install -r requirements.txt

COPY ml-phase2/ .
EXPOSE 8000

CMD ["python", "api/api_service.py"]
```

## 监控与维护

### 关键指标监控

- API响应时间
- 预测准确率
- 模型置信度分布
- 服务可用性

### 定期维护任务

- 模型重新训练（建议每月一次）
- 数据质量检查
- 特征重要性分析
- 性能基准测试

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库URL配置
   - 验证网络连通性
   - 确认数据库权限

2. **模型加载失败**
   - 检查模型文件是否存在
   - 验证特征列匹配
   - 查看服务日志详情

3. **预测结果异常**
   - 检查输入数据格式
   - 验证特征值范围
   - 分析置信度因子

### 日志查看

```bash
# Python服务日志
tail -f logs/ml-service.log

# Node.js客户端日志
tail -f logs/application.log
```

## 性能优化建议

1. **数据层面**
   - 定期清理过期训练数据
   - 优化数据库查询索引
   - 缓存频繁访问的市场数据

2. **模型层面**
   - 使用模型压缩技术
   - 实施预测缓存机制
   - 考虑模型量化

3. **服务层面**
   - 启用API请求缓存
   - 实施负载均衡
   - 配置自动扩缩容

## 版本更新

### 模型版本控制

- 每次重新训练生成新版本号
- 保留历史模型版本
- 支持A/B测试不同版本

### 向后兼容性

- 保持API接口稳定
- 渐进式功能升级
- 完善的错误降级机制

---

**注意**: 本系统需要足够的历史成交数据才能产生有效的预测结果，建议在数据积累充足后再进行生产部署。
