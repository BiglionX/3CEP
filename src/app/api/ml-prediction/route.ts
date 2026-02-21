import { NextRequest, NextResponse } from 'next/server';
import { mlPredictionService } from '@/services/ml-prediction.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'predict-demand':
        return await handleDemandPrediction(params);
      
      case 'predict-price':
        return await handlePricePrediction(params);
      
      case 'batch-predict':
        return await handleBatchPrediction(params);
      
      default:
        return NextResponse.json(
          { error: '未知的操作类型', supportedActions: ['predict-demand', 'predict-price', 'batch-predict'] },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('ML预测API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    
    switch (action) {
      case 'status':
        return await handleStatusCheck();
      
      case 'history':
        return await handlePredictionHistory(searchParams);
      
      case 'models':
        return await handleModelList();
      
      default:
        return NextResponse.json(
          { error: '未知的操作类型', supportedActions: ['status', 'history', 'models'] },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('ML预测API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 需求预测处理器
async function handleDemandPrediction(params: any) {
  const {
    productId,
    warehouseId,
    horizonDays = 30,
    options = {}
  } = params;

  // 参数验证
  if (!productId) {
    return NextResponse.json(
      { error: '缺少必需参数: productId' },
      { status: 400 }
    );
  }

  if (!warehouseId) {
    return NextResponse.json(
      { error: '缺少必需参数: warehouseId' },
      { status: 400 }
    );
  }

  // 执行预测
  const result = await mlPredictionService.predictDemand(
    productId,
    warehouseId,
    parseInt(horizonDays as string) || 30,
    options
  );

  return NextResponse.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    metadata: {
      productId,
      warehouseId,
      horizonDays: parseInt(horizonDays as string) || 30,
      predictionType: 'demand'
    }
  });
}

// 价格预测处理器
async function handlePricePrediction(params: any) {
  const {
    productId,
    platform,
    horizonDays = 30,
    options = {}
  } = params;

  // 参数验证
  if (!productId) {
    return NextResponse.json(
      { error: '缺少必需参数: productId' },
      { status: 400 }
    );
  }

  // 执行预测
  const result = await mlPredictionService.predictPrice(
    productId,
    platform,
    parseInt(horizonDays as string) || 30,
    options
  );

  return NextResponse.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    metadata: {
      productId,
      platform,
      horizonDays: parseInt(horizonDays as string) || 30,
      predictionType: 'price'
    }
  });
}

// 批量预测处理器
async function handleBatchPrediction(params: any) {
  const {
    predictions,
    parallel = false
  } = params;

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return NextResponse.json(
      { error: 'predictions必须是非空数组' },
      { status: 400 }
    );
  }

  try {
    let results: any[] = [];
    
    if (parallel) {
      // 并行处理
      results = await Promise.all(
        predictions.map(async (pred, index) => {
          try {
            let result;
            if (pred.action === 'predict-demand') {
              result = await mlPredictionService.predictDemand(
                pred.productId,
                pred.warehouseId,
                pred.horizonDays,
                pred.options
              );
            } else if (pred.action === 'predict-price') {
              result = await mlPredictionService.predictPrice(
                pred.productId,
                pred.platform,
                pred.horizonDays,
                pred.options
              );
            }
            return {
              index,
              success: true,
              data: result,
              metadata: { ...pred }
            };
          } catch (error: any) {
            return {
              index,
              success: false,
              error: error.message,
              metadata: { ...pred }
            };
          }
        })
      );
    } else {
      // 串行处理
      for (let i = 0; i < predictions.length; i++) {
        const pred = predictions[i];
        try {
          let result;
          if (pred.action === 'predict-demand') {
            result = await mlPredictionService.predictDemand(
              pred.productId,
              pred.warehouseId,
              pred.horizonDays,
              pred.options
            );
          } else if (pred.action === 'predict-price') {
            result = await mlPredictionService.predictPrice(
              pred.productId,
              pred.platform,
              pred.horizonDays,
              pred.options
            );
          }
          results.push({
            index: i,
            success: true,
            data: result,
            metadata: { ...pred }
          });
        } catch (error: any) {
          results.push({
            index: i,
            success: false,
            error: error.message,
            metadata: { ...pred }
          });
        }
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: predictions.length,
          successful,
          failed,
          successRate: (successful / predictions.length * 100).toFixed(2) + '%'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: `批量预测失败: ${error.message}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 状态检查处理器
async function handleStatusCheck() {
  try {
    // 检查大模型API连接状态
    const modelStatus = await checkModelConnection();
    
    // 检查数据库连接状态
    const dbStatus = await checkDatabaseConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        serviceStatus: 'running',
        modelConnection: modelStatus,
        databaseConnection: dbStatus,
        supportedModels: ['deepseek-chat', 'qwen-plus'],
        supportedPredictionTypes: ['demand', 'price'],
        version: '1.0.0'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `状态检查失败: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// 预测历史处理器
async function handlePredictionHistory(searchParams: URLSearchParams) {
  try {
    const productId = searchParams.get('productId') || undefined;
    const predictionType = (searchParams.get('type') as 'demand' | 'price' | undefined) || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 从数据库获取预测历史
    const history = await getPredictionHistory(productId, predictionType, limit, offset);

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        limit,
        offset,
        total: history.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `获取预测历史失败: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

// 模型列表处理器
async function handleModelList() {
  return NextResponse.json({
    success: true,
    data: {
      demandModels: [
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          type: 'demand',
          description: '适用于需求预测的大语言模型',
          capabilities: ['时间序列分析', '趋势预测', '季节性分析']
        },
        {
          id: 'local-arima',
          name: '本地ARIMA',
          type: 'demand',
          description: '传统统计学预测模型（降级方案）',
          capabilities: ['基础趋势预测', '简单季节性分析']
        }
      ],
      priceModels: [
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          type: 'price',
          description: '适用于价格预测的大语言模型',
          capabilities: ['价格趋势分析', '竞争分析', '市场洞察']
        },
        {
          id: 'local-prophet',
          name: '本地Prophet',
          type: 'price',
          description: 'Facebook开源的时间序列预测工具（降级方案）',
          capabilities: ['价格趋势预测', '节假日效应']
        }
      ]
    },
    timestamp: new Date().toISOString()
  });
}

// 辅助函数
async function checkModelConnection(): Promise<{ connected: boolean; model?: string; error?: string }> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.TONGYI_API_KEY;
    if (!apiKey) {
      return { connected: false, error: '未配置API密钥' };
    }
    
    // 简单的连接测试
    const testPrompt = "请回复'连接成功'";
    const response = await mlPredictionService['callLargeModel'](testPrompt, 'demand');
    
    return { 
      connected: true, 
      model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'qwen-plus' 
    };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}

async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // 简单的数据库查询测试
    const { data, error } = await (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ).from('ml_predictions').select('count').limit(1);
    
    return { connected: !error };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}

async function getPredictionHistory(
  productId?: string,
  predictionType?: 'demand' | 'price',
  limit: number = 50,
  offset: number = 0
) {
  try {
    const supabase = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('ml_predictions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (predictionType) {
      query = query.eq('prediction_type', predictionType);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.warn('获取预测历史失败:', error);
    return []; // 返回空数组而不是抛出错误
  }
}