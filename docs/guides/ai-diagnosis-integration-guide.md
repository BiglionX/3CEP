# AI 诊断集成功能使用指南

## 功能概述

AI 诊断集成功能基于 B2B 采购智能体的大模型能力，为售后场景提供专业的故障诊断服务。该功能能够分析用户描述的设备故障，提供结构化的诊断结果，包括可能的故障原因、解决方案、推荐配件等信息。

## 核心特性

- **智能故障分析**：基于大模型的深度语义理解能力
- **结构化输出**：标准化的诊断结果格式，便于前端展示
- **多轮对话支持**：支持上下文关联的连续诊断
- **会话管理**：完整的会话生命周期管理
- **错误处理**：完善的异常处理和降级机制
- **性能优化**：超时控制和重试机制

## API 接口文档

### 诊断分析接口

**Endpoint**: `POST /api/diagnosis/analyze`

#### 请求参数

```json
{
  "faultDescription": "string", // 必需：故障描述文本
  "deviceId": "string", // 可选：设备ID
  "deviceInfo": {
    // 可选：设备信息
    "brand": "string", // 品牌
    "model": "string", // 型号
    "category": "string", // 类别
    "purchaseTime": "string" // 购买时间
  },
  "sessionId": "string", // 可选：会话ID（自动生成）
  "language": "string" // 可选：语言（zh/en，默认zh）
}
```

#### 成功响应

```json
{
  "success": true,
  "data": {
    "diagnosisResult": {
      "faultCauses": [
        {
          "reason": "具体的故障原因描述",
          "confidence": 0.85,
          "probability": "高",
          "description": "详细的原因说明"
        }
      ],
      "solutions": [
        {
          "title": "解决方案标题",
          "steps": ["步骤1", "步骤2"],
          "estimatedTime": 30,
          "difficulty": 3,
          "toolsRequired": ["螺丝刀", "万用表"]
        }
      ],
      "recommendedParts": [
        {
          "partName": "配件名称",
          "partNumber": "配件编号",
          "estimatedCost": {
            "min": 100,
            "max": 200
          },
          "description": "配件用途说明"
        }
      ],
      "nextQuestions": ["需要进一步确认的问题"],
      "estimatedTotalTime": 45,
      "estimatedTotalCost": {
        "min": 150,
        "max": 300
      },
      "confidenceLevel": "中",
      "deviceCategory": "手机",
      "severityLevel": "一般"
    },
    "sessionId": "会话ID",
    "processingTimeMs": 1250
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "错误描述",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 会话管理接口

#### 获取会话信息

**Endpoint**: `GET /api/diagnosis/analyze?sessionId={sessionId}`

```json
{
  "success": true,
  "data": {
    "sessionId": "会话ID",
    "stats": {
      "messageCount": 4,
      "totalTime": 0
    },
    "isActive": true
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 清理会话

**Endpoint**: `DELETE /api/diagnosis/analyze?sessionId={sessionId}`

```json
{
  "success": true,
  "message": "会话已清除",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 前端集成示例

### React 组件集成

```tsx
import { useState } from "react";

interface DiagnosisResult {
  faultCauses: Array<{
    reason: string;
    confidence: number;
    probability: string;
  }>;
  solutions: Array<{
    title: string;
    steps: string[];
    estimatedTime: number;
    difficulty: number;
  }>;
  // ... 其他字段
}

export default function AIDiagnosisComponent() {
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeFault = async (faultDescription: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/diagnosis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faultDescription,
          deviceInfo: {
            brand: "Apple",
            model: "iPhone 15 Pro",
            category: "手机",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDiagnosisResult(result.data.diagnosisResult);
      }
    } catch (error) {
      console.error("诊断请求失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* 诊断结果展示 */}
      {diagnosisResult && (
        <div>
          <h3>可能的故障原因：</h3>
          {diagnosisResult.faultCauses.map((cause, index) => (
            <div key={index}>
              <p>
                {cause.reason} ({cause.probability})
              </p>
              <p>置信度: {(cause.confidence * 100).toFixed(0)}%</p>
            </div>
          ))}

          <h3>解决方案：</h3>
          {diagnosisResult.solutions.map((solution, index) => (
            <div key={index}>
              <h4>{solution.title}</h4>
              <p>难度: {solution.difficulty}/5</p>
              <p>预计时间: {solution.estimatedTime}分钟</p>
              <ol>
                {solution.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 测试验证

### 运行测试脚本

```bash
# 运行完整的功能测试
node scripts/test-ai-diagnosis-integration.js

# 测试特定功能
node -e "
const { testDiagnosisAPI } = require('./scripts/test-ai-diagnosis-integration.js');
testDiagnosisAPI();
"
```

### 验收测试用例

1. **充电故障测试**

   ```
   输入："手机充不进电，插上充电器没有任何反应"
   期望：返回充电相关故障原因和解决方案
   ```

2. **显示故障测试**

   ```
   输入："屏幕显示异常，有时候会出现花屏现象"
   期望：返回显示相关诊断建议
   ```

3. **发热问题测试**
   ```
   输入："设备使用一会儿就发热严重，甚至有点烫手"
   期望：提供散热和硬件检查建议
   ```

## 配置和部署

### 环境变量配置

```env
# 大模型API密钥（复用B2B配置）
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key

# 诊断服务配置
DIAGNOSIS_TIMEOUT_MS=30000
DIAGNOSIS_MAX_RETRIES=2
DIAGNOSIS_FALLBACK_ENABLED=true
```

### 部署检查清单

- [ ] 确认大模型 API 密钥已配置
- [ ] 验证 API 端点可正常访问
- [ ] 运行测试脚本验证功能
- [ ] 检查前端页面集成效果
- [ ] 配置监控和日志收集

## 性能指标

### 响应时间

- 平均响应时间：< 5 秒
- 95%响应时间：< 10 秒
- 超时阈值：30 秒

### 并发处理

- 支持并发请求数：≥ 10
- 内存使用：≤ 500MB
- CPU 使用率：≤ 70%

## 故障排除

### 常见问题

1. **API 返回超时错误**

   - 检查大模型 API 服务状态
   - 确认网络连接正常
   - 调整超时配置参数

2. **诊断结果格式错误**

   - 验证提示词模板配置
   - 检查大模型响应格式
   - 查看服务日志详情

3. **前端显示异常**
   - 确认 API 响应格式匹配
   - 检查前端组件 props 类型
   - 验证数据渲染逻辑

### 日志查看

```bash
# 查看诊断服务日志
tail -f logs/diagnosis-service.log

# 查看API访问日志
tail -f logs/api-access.log
```

## 版本更新记录

### v1.0.0 (2024-01-01)

- 初始版本发布
- 实现基础诊断分析功能
- 集成 B2B 大模型服务能力
- 完成前后端集成

## 技术支持

如有问题请联系技术支持团队或查看相关文档：

- API 文档：`/docs/technical-docs/api-documentation.md`
- 开发指南：`/docs/guides/development-guide.md`
- 部署手册：`/docs/deployment/deployment-guide.md`
