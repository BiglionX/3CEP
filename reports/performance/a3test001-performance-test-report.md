# 🔧 A3Test001 性能测试报告

## 📊 测试概要

- **测试时间**: 2026/3/1 17:52:10
- **测试环境**: development
- **综合评分**: **87** (良好)
- **测试状态**: ⚠️ 部分失败

## 🎯 测试结果汇总

| 测试类别   | 状态    | 通过率 |
| ---------- | ------- | ------ |
| 单元测试   | ❌ 失败 | 0%     |
| 集成测试   | ❌ 失败 | 0%     |
| 端到端测试 | ❌ 失败 | 0%     |

## 📈 详细测试结果

### 单元测试

| 测试项目     | 状态    | 测试用例数 |
| ------------ | ------- | ---------- |
| 组件渲染性能 | ❌ 失败 | 4          |
| 函数执行效率 | ✅ 通过 | 2          |
| 数据处理性能 | ✅ 通过 | 4          |

### 集成测试

| 测试项目       | 状态    | 测试用例数 |
| -------------- | ------- | ---------- |
| API调用性能    | ❌ 失败 | 4          |
| 数据库查询性能 | ✅ 通过 | 3          |
| 缓存性能       | ❌ 失败 | 3          |
| 数据流性能     | ❌ 失败 | 3          |

### 端到端测试

| 测试项目     | 状态    | 测试用例数 |
| ------------ | ------- | ---------- |
| 页面加载性能 | ✅ 通过 | 4          |
| 用户旅程性能 | ✅ 通过 | 2          |
| 并发用户性能 | ❌ 失败 | 3          |
| 资源加载性能 | ✅ 通过 | 3          |
| 交互响应性能 | ✅ 通过 | 4          |

## 💡 性能评估

### 优化建议

- 优化组件 DataTable 的渲染性能

## 📋 技术细节

```json
{
  "timestamp": "2026-03-01T09:52:10.884Z",
  "environment": "development",
  "overallScore": 87,
  "testResults": {
    "unit": {
      "componentRendering": {
        "testType": "component_rendering",
        "results": [
          {
            "componentName": "SimpleButton",
            "complexity": "low",
            "average": 15.832659999999999,
            "min": 14.769799999999996,
            "max": 16.126100000000008,
            "median": 15.994799999999998,
            "p95": 16.126100000000008,
            "p99": 16.126100000000008,
            "threshold": 5
          },
          {
            "componentName": "DataTable",
            "complexity": "medium",
            "average": 15.481780000000004,
            "min": 14.774699999999996,
            "max": 16.131400000000042,
            "median": 15.95210000000003,
            "p95": 16.131400000000042,
            "p99": 16.131400000000042,
            "threshold": 20
          },
          {
            "componentName": "DashboardChart",
            "complexity": "high",
            "average": 29.52240999999998,
            "min": 16.742999999999995,
            "max": 37.810299999999984,
            "median": 31.794799999999896,
            "p95": 37.810299999999984,
            "p99": 37.810299999999984,
            "threshold": 50
          },
          {
            "componentName": "SearchFilter",
            "complexity": "medium",
            "average": 17.425409999999978,
            "min": 14.119100000000003,
            "max": 27.091800000000035,
            "median": 16.03379999999993,
            "p95": 27.091800000000035,
            "p99": 27.091800000000035,
            "threshold": 20
          }
        ],
        "overallPass": false
      },
      "functionExecution": {
        "testType": "function_execution",
        "results": [
          {
            "functionName": "数据过滤函数",
            "complexity": "medium",
            "average": 0.06041199999998753,
            "min": 0.02549999999996544,
            "max": 1.3688999999999396,
            "median": 0.02580000000000382,
            "p95": 0.09319999999991069,
            "p99": 1.3688999999999396,
            "threshold": 5
          },
          {
            "functionName": "字符串处理函数",
            "complexity": "low",
            "average": 0.066599999999994,
            "min": 0.025999999999953616,
            "max": 1.268799999999942,
            "median": 0.03309999999999036,
            "p95": 0.09039999999993142,
            "p99": 1.268799999999942,
            "threshold": 1
          }
        ],
        "overallPass": true
      },
      "dataProcessing": {
        "testType": "data_processing",
        "results": [
          {
            "dataset": "小数据集",
            "operation": "排序操作",
            "dataSize": 100,
            "average": 0.042600000000004454,
            "min": 0.03230000000007749,
            "max": 0.07940000000007785,
            "median": 0.035099999999943066,
            "p95": 0.07940000000007785,
            "p99": 0.07940000000007785,
            "threshold": 0.2
          },
          {
            "dataset": "小数据集",
            "operation": "过滤操作",
            "dataSize": 100,
            "average": 0.012680000000000292,
            "min": 0.004699999999957072,
            "max": 0.07230000000004111,
            "median": 0.006099999999946704,
            "p95": 0.07230000000004111,
            "p99": 0.07230000000004111,
            "threshold": 0.1
          },
          {
            "dataset": "中等数据集",
            "operation": "排序操作",
            "dataSize": 1000,
            "average": 0.26193000000000666,
            "min": 0.1998999999999569,
            "max": 0.5353000000000065,
            "median": 0.2596999999999525,
            "p95": 0.5353000000000065,
            "p99": 0.5353000000000065,
            "threshold": 2
          },
          {
            "dataset": "中等数据集",
            "operation": "过滤操作",
            "dataSize": 1000,
            "average": 0.04735000000003993,
            "min": 0.037900000000036016,
            "max": 0.10040000000003602,
            "median": 0.04060000000004038,
            "p95": 0.10040000000003602,
            "p99": 0.10040000000003602,
            "threshold": 1
          }
        ],
        "overallPass": true
      },
      "overallPass": false
    },
    "integration": {
      "apiPerformance": {
        "testType": "api_performance",
        "results": [
          {
            "endpoint": "健康检查",
            "path": "/health",
            "method": "GET",
            "average": 69,
            "min": 32,
            "max": 110,
            "median": 62,
            "successRate": 100,
            "iterations": 5,
            "threshold": 100
          },
          {
            "endpoint": "工单列表",
            "path": "/work-orders?page=1&size=20",
            "method": "GET",
            "average": 165.25,
            "min": 94,
            "max": 207,
            "median": 204,
            "successRate": 80,
            "iterations": 5,
            "threshold": 500
          },
          {
            "endpoint": "搜索接口",
            "path": "/search?q=test",
            "method": "GET",
            "average": 194.75,
            "min": 170,
            "max": 217,
            "median": 205,
            "successRate": 80,
            "iterations": 5,
            "threshold": 500
          },
          {
            "endpoint": "仪表板统计",
            "path": "/dashboard/stats",
            "method": "GET",
            "average": 163.25,
            "min": 138,
            "max": 219,
            "median": 155,
            "successRate": 80,
            "iterations": 5,
            "threshold": 500
          }
        ],
        "overallPass": false
      },
      "databasePerformance": {
        "testType": "database_performance",
        "results": [
          {
            "queryType": "简单查询",
            "complexity": "low",
            "average": 15.493219999999999,
            "min": 12.85,
            "max": 17.6098,
            "median": 15.0772,
            "iterations": 5,
            "threshold": 50
          },
          {
            "queryType": "连接查询",
            "complexity": "medium",
            "average": 58.25004,
            "min": 48.8844,
            "max": 61.6128,
            "median": 60.9014,
            "iterations": 5,
            "threshold": 200
          },
          {
            "queryType": "聚合查询",
            "complexity": "high",
            "average": 124.45772,
            "min": 79.5438,
            "max": 146.1874,
            "median": 133.5291,
            "iterations": 5,
            "threshold": 500
          }
        ],
        "overallPass": true
      },
      "cachePerformance": {
        "testType": "cache_performance",
        "results": [
          {
            "cacheType": "内存缓存",
            "hitRate": 90,
            "average": 18.1,
            "min": 9,
            "max": 49,
            "median": 16,
            "iterations": 10,
            "threshold": 10
          },
          {
            "cacheType": "Redis缓存",
            "hitRate": 85,
            "average": 15.4,
            "min": 15,
            "max": 16,
            "median": 15,
            "iterations": 10,
            "threshold": 50
          },
          {
            "cacheType": "CDN缓存",
            "hitRate": 95,
            "average": 14.9,
            "min": 8,
            "max": 17,
            "median": 15,
            "iterations": 10,
            "threshold": 100
          }
        ],
        "overallPass": false
      },
      "dataFlowPerformance": {
        "testType": "data_flow_performance",
        "results": [
          {
            "flowType": "流式数据处理",
            "dataSize": "1MB",
            "average": 61.666666666666664,
            "min": 58,
            "max": 64,
            "median": 63,
            "throughput": 16.216216216216218,
            "iterations": 3,
            "threshold": 100
          },
          {
            "flowType": "批处理",
            "dataSize": "5MB",
            "average": 203,
            "min": 201,
            "max": 205,
            "median": 203,
            "throughput": 24.63054187192118,
            "iterations": 3,
            "threshold": 300
          },
          {
            "flowType": "实时数据同步",
            "dataSize": "100KB",
            "average": 10019.666666666666,
            "min": 10011,
            "max": 10029,
            "median": 10019,
            "throughput": 9.98037193519412,
            "iterations": 3,
            "threshold": 50
          }
        ],
        "overallPass": false
      },
      "overallPass": false
    },
    "e2e": {
      "pageLoadPerformance": {
        "testType": "page_load_performance",
        "results": [
          {
            "page": "首页",
            "path": "/",
            "average": 1103.6666666666667,
            "min": 1026,
            "max": 1209,
            "median": 1076,
            "p95": 1209,
            "iterations": 3,
            "threshold": 2000
          },
          {
            "page": "仪表板",
            "path": "/dashboard",
            "average": 1154,
            "min": 1113,
            "max": 1200,
            "median": 1149,
            "p95": 1200,
            "iterations": 3,
            "threshold": 3000
          },
          {
            "page": "工单管理",
            "path": "/work-orders",
            "average": 1126.3333333333333,
            "min": 895,
            "max": 1252,
            "median": 1232,
            "p95": 1252,
            "iterations": 3,
            "threshold": 3000
          },
          {
            "page": "客户管理",
            "path": "/customers",
            "average": 1140.6666666666667,
            "min": 1100,
            "max": 1180,
            "median": 1142,
            "p95": 1180,
            "iterations": 3,
            "threshold": 3000
          }
        ],
        "overallPass": true
      },
      "userJourneyPerformance": {
        "testType": "user_journey_performance",
        "results": [
          {
            "journey": "登录到仪表板",
            "results": [
              {
                "iteration": 1,
                "totalTime": 2888,
                "steps": [
                  {
                    "step": "navigate",
                    "duration": 1151,
                    "expectedMax": 1500
                  },
                  {
                    "step": "fill_form",
                    "element": "email",
                    "duration": 109,
                    "expectedMax": 150
                  },
                  {
                    "step": "fill_form",
                    "element": "password",
                    "duration": 96,
                    "expectedMax": 150
                  },
                  {
                    "step": "click",
                    "element": "login_button",
                    "duration": 238,
                    "expectedMax": 300
                  },
                  {
                    "step": "wait_for_page",
                    "duration": 1294,
                    "expectedMax": 2250
                  }
                ]
              },
              {
                "iteration": 2,
                "totalTime": 2731,
                "steps": [
                  {
                    "step": "navigate",
                    "duration": 1078,
                    "expectedMax": 1500
                  },
                  {
                    "step": "fill_form",
                    "element": "email",
                    "duration": 113,
                    "expectedMax": 150
                  },
                  {
                    "step": "fill_form",
                    "element": "password",
                    "duration": 96,
                    "expectedMax": 150
                  },
                  {
                    "step": "click",
                    "element": "login_button",
                    "duration": 206,
                    "expectedMax": 300
                  },
                  {
                    "step": "wait_for_page",
                    "duration": 1238,
                    "expectedMax": 2250
                  }
                ]
              }
            ],
            "averageTime": 2809.5,
            "threshold": 3000
          },
          {
            "journey": "创建工单流程",
            "results": [
              {
                "iteration": 1,
                "totalTime": 2893,
                "steps": [
                  {
                    "step": "navigate",
                    "duration": 826,
                    "expectedMax": 1200
                  },
                  {
                    "step": "click",
                    "element": "create_button",
                    "duration": 96,
                    "expectedMax": 150
                  },
                  {
                    "step": "fill_form",
                    "element": "customer_name",
                    "duration": 208,
                    "expectedMax": 300
                  },
                  {
                    "step": "fill_form",
                    "element": "device_model",
                    "duration": 158,
                    "expectedMax": 225
                  },
                  {
                    "step": "fill_form",
                    "element": "issue_description",
                    "duration": 284,
                    "expectedMax": 450
                  },
                  {
                    "step": "click",
                    "element": "submit_button",
                    "duration": 197,
                    "expectedMax": 300
                  },
                  {
                    "step": "wait_for_success",
                    "duration": 1124,
                    "expectedMax": 1500
                  }
                ]
              },
              {
                "iteration": 2,
                "totalTime": 3085,
                "steps": [
                  {
                    "step": "navigate",
                    "duration": 906,
                    "expectedMax": 1200
                  },
                  {
                    "step": "click",
                    "element": "create_button",
                    "duration": 112,
                    "expectedMax": 150
                  },
                  {
                    "step": "fill_form",
                    "element": "customer_name",
                    "duration": 224,
                    "expectedMax": 300
                  },
                  {
                    "step": "fill_form",
                    "element": "device_model",
                    "duration": 174,
                    "expectedMax": 225
                  },
                  {
                    "step": "fill_form",
                    "element": "issue_description",
                    "duration": 367,
                    "expectedMax": 450
                  },
                  {
                    "step": "click",
                    "element": "submit_button",
                    "duration": 176,
                    "expectedMax": 300
                  },
                  {
                    "step": "wait_for_success",
                    "duration": 1126,
                    "expectedMax": 1500
                  }
                ]
              }
            ],
            "averageTime": 2989,
            "threshold": 5000
          }
        ],
        "overallPass": true
      },
      "concurrentUsersPerformance": {
        "testType": "concurrent_users_performance",
        "results": [
          {
            "concurrentUsers": 1,
            "totalTime": 4443,
            "averagePerUser": 4443,
            "throughput": 0.22507314877335136,
            "threshold": 1
          },
          {
            "concurrentUsers": 5,
            "totalTime": 4108,
            "averagePerUser": 821.6,
            "throughput": 1.2171372930866602,
            "threshold": 3
          },
          {
            "concurrentUsers": 10,
            "totalTime": 4984,
            "averagePerUser": 498.4,
            "throughput": 2.0064205457463884,
            "threshold": 2
          }
        ],
        "overallPass": false
      },
      "resourceLoadingPerformance": {
        "testType": "resource_loading_performance",
        "results": [
          {
            "resourceType": "JavaScript资源",
            "resourceCount": 15,
            "totalSize": "2.5MB",
            "loadTime": 615,
            "threshold": 2000
          },
          {
            "resourceType": "CSS资源",
            "resourceCount": 8,
            "totalSize": "800KB",
            "loadTime": 393,
            "threshold": 1000
          },
          {
            "resourceType": "图片资源",
            "resourceCount": 25,
            "totalSize": "5.2MB",
            "loadTime": 1173,
            "threshold": 3000
          }
        ],
        "overallPass": true
      },
      "interactiveResponsePerformance": {
        "testType": "interactive_response_performance",
        "results": [
          {
            "interaction": "按钮点击",
            "average": 19.128809999999795,
            "min": 15.399299999990035,
            "max": 31.99330000000191,
            "median": 16.046799999996438,
            "p95": 31.99330000000191,
            "expectedTime": 50,
            "threshold": 100
          },
          {
            "interaction": "页面滚动",
            "average": 15.601860000001034,
            "min": 14.899799999999232,
            "max": 16.342399999994086,
            "median": 15.929699999993318,
            "p95": 16.342399999994086,
            "expectedTime": 16,
            "threshold": 32
          },
          {
            "interaction": "文本输入",
            "average": 30.514625000001978,
            "min": 15.863100000002305,
            "max": 51.86810000000696,
            "median": 31.25,
            "p95": 51.86810000000696,
            "expectedTime": 30,
            "threshold": 60
          },
          {
            "interaction": "鼠标悬停",
            "average": 18.079380000000675,
            "min": 14.898600000000442,
            "max": 32.09339999999793,
            "median": 15.998599999991711,
            "p95": 32.09339999999793,
            "expectedTime": 20,
            "threshold": 40
          }
        ],
        "overallPass": true
      },
      "overallPass": false
    }
  },
  "baselineAssessment": {
    "overallScore": 87,
    "level": "good",
    "evaluations": {
      "webVitals": {
        "firstContentfulPaint": {
          "level": "good",
          "score": 93,
          "value": 1200,
          "baseline": {
            "excellent": 1000,
            "good": 1800,
            "poor": null,
            "weight": 0.25,
            "description": "首次内容绘制时间"
          },
          "description": "首次内容绘制时间"
        },
        "largestContentfulPaint": {
          "level": "good",
          "score": 94,
          "value": 2800,
          "baseline": {
            "excellent": 2500,
            "good": 4000,
            "poor": null,
            "weight": 0.25,
            "description": "最大内容绘制时间"
          },
          "description": "最大内容绘制时间"
        }
      },
      "custom": {
        "api_health_check": {
          "level": "excellent",
          "score": 100,
          "value": 45,
          "baseline": {
            "excellent": 100,
            "good": 300,
            "poor": 1000,
            "weight": 0.4,
            "description": "API响应时间"
          },
          "description": "API响应时间",
          "type": "api"
        },
        "api_work_orders": {
          "level": "good",
          "score": 97,
          "value": 120,
          "baseline": {
            "excellent": 100,
            "good": 300,
            "poor": 1000,
            "weight": 0.4,
            "description": "API响应时间"
          },
          "description": "API响应时间",
          "type": "api"
        },
        "render_DashboardChart": {
          "level": "good",
          "score": 83,
          "value": 35,
          "baseline": {
            "excellent": 16,
            "good": 50,
            "poor": 100,
            "weight": 0.4,
            "description": "组件渲染时间"
          },
          "description": "组件渲染时间",
          "type": "component"
        },
        "render_DataTable": {
          "level": "poor",
          "score": 58,
          "value": 65,
          "baseline": {
            "excellent": 16,
            "good": 50,
            "poor": 100,
            "weight": 0.4,
            "description": "组件渲染时间"
          },
          "description": "组件渲染时间",
          "type": "component"
        }
      }
    },
    "timestamp": "2026-03-01T09:53:29.616Z",
    "recommendations": ["优化组件 DataTable 的渲染性能"]
  }
}
```

---

_报告生成时间: 2026/3/1 17:53:29_
_A3Test001 - 维修店用户中心性能测试_
