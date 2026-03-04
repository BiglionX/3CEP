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
          {
            error: '鏈煡鐨勬搷浣滅被?,
            supportedActions: [
              'predict-demand',
              'predict-price',
              'batch-predict',
            ],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('ML棰勬祴API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
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
          {
            error: '鏈煡鐨勬搷浣滅被?,
            supportedActions: ['status', 'history', 'models'],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('ML棰勬祴API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 闇€姹傞娴嬪鐞嗗櫒
async function handleDemandPrediction(params: any) {
  const { productId, warehouseId, horizonDays = 30, options = {} } = params;

  // 鍙傛暟楠岃瘉
  if (!productId) {
    return NextResponse.json(
      { error: '缂哄皯蹇呴渶鍙傛暟: productId' },
      { status: 400 }
    );
  }

  if (!warehouseId) {
    return NextResponse.json(
      { error: '缂哄皯蹇呴渶鍙傛暟: warehouseId' },
      { status: 400 }
    );
  }

  // 鎵ц棰勬祴
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
      predictionType: 'demand',
    },
  });
}

// 浠锋牸棰勬祴澶勭悊?async function handlePricePrediction(params: any) {
  const { productId, platform, horizonDays = 30, options = {} } = params;

  // 鍙傛暟楠岃瘉
  if (!productId) {
    return NextResponse.json(
      { error: '缂哄皯蹇呴渶鍙傛暟: productId' },
      { status: 400 }
    );
  }

  // 鎵ц棰勬祴
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
      predictionType: 'price',
    },
  });
}

// 鎵归噺棰勬祴澶勭悊?async function handleBatchPrediction(params: any) {
  const { predictions, parallel = false } = params;

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return NextResponse.json(
      { error: 'predictions蹇呴』鏄潪绌烘暟? },
      { status: 400 }
    );
  }

  try {
    let results: any[] = [];

    if (parallel) {
      // 骞惰澶勭悊
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
              metadata: { ...pred },
            };
          } catch (error: any) {
            return {
              index,
              success: false,
              error: error.message,
              metadata: { ...pred },
            };
          }
        })
      );
    } else {
      // 涓茶澶勭悊
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
            metadata: { ...pred },
          });
        } catch (error: any) {
          results.push({
            index: i,
            success: false,
            error: error.message,
            metadata: { ...pred },
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
          successRate:
            ((successful / predictions.length) * 100).toFixed(2) + '%',
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `鎵归噺棰勬祴澶辫触: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 鐘舵€佹鏌ュ鐞嗗櫒
async function handleStatusCheck() {
  try {
    // 妫€鏌ュぇ妯″瀷API杩炴帴鐘?    const modelStatus = await checkModelConnection();

    // 妫€鏌ユ暟鎹簱杩炴帴鐘?    const dbStatus = await checkDatabaseConnection();

    return NextResponse.json({
      success: true,
      data: {
        serviceStatus: 'running',
        modelConnection: modelStatus,
        databaseConnection: dbStatus,
        supportedModels: ['deepseek-chat', 'qwen-plus'],
        supportedPredictionTypes: ['demand', 'price'],
        version: '1.0.0',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `鐘舵€佹鏌ュけ? ${error.message}`,
      timestamp: new Date().toISOString(),
    });
  }
}

// 棰勬祴鍘嗗彶澶勭悊?async function handlePredictionHistory(searchParams: URLSearchParams) {
  try {
    const productId = searchParams.get('productId') || undefined;
    const predictionType =
      (searchParams.get('type') as 'demand' | 'price' | undefined) || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 浠庢暟鎹簱鑾峰彇棰勬祴鍘嗗彶
    const history = await getPredictionHistory(
      productId,
      predictionType,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: history,
      pagination: {
        limit,
        offset,
        total: history.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `鑾峰彇棰勬祴鍘嗗彶澶辫触: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
  }
}

// 妯″瀷鍒楄〃澶勭悊?async function handleModelList() {
  return NextResponse.json({
    success: true,
    data: {
      demandModels: [
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          type: 'demand',
          description: '閫傜敤浜庨渶姹傞娴嬬殑澶ц瑷€妯″瀷',
          capabilities: ['鏃堕棿搴忓垪鍒嗘瀽', '瓒嬪娍棰勬祴', '瀛ｈ妭鎬у垎?],
        },
        {
          id: 'local-arima',
          name: '鏈湴ARIMA',
          type: 'demand',
          description: '浼犵粺缁熻瀛﹂娴嬫ā鍨嬶紙闄嶇骇鏂规?,
          capabilities: ['鍩虹瓒嬪娍棰勬祴', '绠€鍗曞鑺傛€у垎?],
        },
      ],
      priceModels: [
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          type: 'price',
          description: '閫傜敤浜庝环鏍奸娴嬬殑澶ц瑷€妯″瀷',
          capabilities: ['浠锋牸瓒嬪娍鍒嗘瀽', '绔炰簤鍒嗘瀽', '甯傚満娲炲療'],
        },
        {
          id: 'local-prophet',
          name: '鏈湴Prophet',
          type: 'price',
          description: 'Facebook寮€婧愮殑鏃堕棿搴忓垪棰勬祴宸ュ叿锛堥檷绾ф柟妗堬級',
          capabilities: ['浠锋牸瓒嬪娍棰勬祴', '鑺傚亣鏃ユ晥?],
        },
      ],
    },
    timestamp: new Date().toISOString(),
  });
}

// 杈呭姪鍑芥暟
async function checkModelConnection(): Promise<{
  connected: boolean;
  model?: string;
  error?: string;
}> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.TONGYI_API_KEY;
    if (!apiKey) {
      return { connected: false, error: '鏈厤缃瓵PI瀵嗛挜' };
    }

    // 绠€鍗曠殑杩炴帴娴嬭瘯
    const testPrompt = "璇峰洖?杩炴帴鎴愬姛'";
    const response = await mlPredictionService['callLargeModel'](
      testPrompt,
      'demand'
    );

    return {
      connected: true,
      model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'qwen-plus',
    };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}

async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    // 绠€鍗曠殑鏁版嵁搴撴煡璇㈡祴?    const { data, error } = await (await import('@supabase/supabase-js'))
      .createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      .from('ml_predictions')
      .select('count')
      .limit(1);

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
    console.warn('鑾峰彇棰勬祴鍘嗗彶澶辫触:', error);
    return []; // 杩斿洖绌烘暟缁勮€屼笉鏄姏鍑洪敊?  }
}

