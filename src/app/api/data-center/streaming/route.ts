import { NextRequest, NextResponse } from 'next/server';
import { 
  realTimeDataService, 
  PriceUpdateProcessor,
  InventoryChangeProcessor,
  UserActionProcessor
} from '@/data-center/streaming/real-time-service';

// 初始化消费者组（在首次访问时创建）
let isInitialized = false;

async function initializeRealTimeService() {
  if (isInitialized) return;
  
  try {
    // 创建消费者组
    await realTimeDataService.createConsumerGroup({
      groupName: 'price_processors',
      consumerName: `price_consumer_${process.pid}`,
      streamKey: 'stream:price_update',
      batchSize: 10,
      blockTime: 2000
    });

    await realTimeDataService.createConsumerGroup({
      groupName: 'inventory_processors',
      consumerName: `inventory_consumer_${process.pid}`,
      streamKey: 'stream:inventory_change',
      batchSize: 5,
      blockTime: 3000
    });

    await realTimeDataService.createConsumerGroup({
      groupName: 'user_action_processors',
      consumerName: `user_consumer_${process.pid}`,
      streamKey: 'stream:user_action',
      batchSize: 20,
      blockTime: 1000
    });

    // 启动消费者
    await realTimeDataService.startConsumers();
    
    isInitialized = true;
    console.log('✅ 实时数据服务初始化完成');
    
  } catch (error) {
    console.error('❌ 实时数据服务初始化失败:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeRealTimeService();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        // 获取服务状态
        return NextResponse.json({
          status: 'running',
          initialized: isInitialized,
          consumers: Array.from(realTimeDataService.consumerGroups.keys()),
          timestamp: new Date().toISOString()
        });

      case 'streams':
        // 获取Stream信息
        const streamKeys = ['stream:price_update', 'stream:inventory_change', 'stream:user_action'];
        const streamInfo: Record<string, any> = {};
        
        for (const key of streamKeys) {
          try {
            const info = await realTimeDataService.getStreamInfo(key);
            streamInfo[key] = info;
          } catch (error) {
            streamInfo[key] = { error: 'Stream不存在或无法访问' };
          }
        }
        
        return NextResponse.json({
          streams: streamInfo,
          timestamp: new Date().toISOString()
        });

      case 'publish-test':
        // 发布测试事件
        const testEvent = {
          id: `test_${Date.now()}`,
          type: 'price_update' as const,
          payload: {
            partId: 'test_part_001',
            oldPrice: 99.99,
            newPrice: 89.99,
            changePercent: -10.0,
            platform: 'taobao'
          },
          timestamp: new Date().toISOString(),
          source: 'test_api',
          priority: 'medium' as const
        };

        const eventId = await realTimeDataService.publishEvent(testEvent);
        
        return NextResponse.json({
          message: '测试事件已发布',
          eventId,
          event: testEvent,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('实时数据API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeRealTimeService();
    
    const body = await request.json();
    const { action, event } = body;

    switch (action) {
      case 'publish':
        if (!event) {
          return NextResponse.json(
            { error: '缺少event参数' },
            { status: 400 }
          );
        }

        // 验证事件格式
        if (!event.type || !event.payload) {
          return NextResponse.json(
            { error: '事件格式不正确，需要type和payload字段' },
            { status: 400 }
          );
        }

        const eventId = await realTimeDataService.publishEvent({
          id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: event.type,
          payload: event.payload,
          timestamp: event.timestamp || new Date().toISOString(),
          source: event.source || 'api',
          priority: event.priority || 'medium'
        });

        return NextResponse.json({
          message: '事件发布成功',
          eventId,
          timestamp: new Date().toISOString()
        });

      case 'register-processor':
        // 动态注册处理器（简化版本）
        const { processorType } = body;
        
        let processor;
        switch (processorType) {
          case 'price':
            processor = new PriceUpdateProcessor();
            break;
          case 'inventory':
            processor = new InventoryChangeProcessor();
            break;
          case 'user':
            processor = new UserActionProcessor();
            break;
          default:
            return NextResponse.json(
              { error: '不支持的处理器类型' },
              { status: 400 }
            );
        }

        realTimeDataService.registerProcessor(processor);
        
        return NextResponse.json({
          message: `处理器 ${processorType} 已注册`,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('实时数据API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}