import { NextRequest, NextResponse } from 'next/server';
import {
  realTimeDataService,
  PriceUpdateProcessor,
  InventoryChangeProcessor,
  UserActionProcessor,
} from '@/data-center/streaming/real-time-service';

// 鍒濆鍖栨秷璐硅€呯粍锛堝湪棣栨璁块棶鏃跺垱寤猴級
let isInitialized = false;

async function initializeRealTimeService() {
  if (isInitialized) return;

  try {
    // 鍒涘缓娑堣垂鑰呯粍
    await realTimeDataService.createConsumerGroup({
      groupName: 'price_processors',
      consumerName: `price_consumer_${process.pid}`,
      streamKey: 'stream:price_update',
      batchSize: 10,
      blockTime: 2000,
    });

    await realTimeDataService.createConsumerGroup({
      groupName: 'inventory_processors',
      consumerName: `inventory_consumer_${process.pid}`,
      streamKey: 'stream:inventory_change',
      batchSize: 5,
      blockTime: 3000,
    });

    await realTimeDataService.createConsumerGroup({
      groupName: 'user_action_processors',
      consumerName: `user_consumer_${process.pid}`,
      streamKey: 'stream:user_action',
      batchSize: 20,
      blockTime: 1000,
    });

    // 鍚姩娑堣垂?    await realTimeDataService.startConsumers();

    isInitialized = true;
    console.log('锟?瀹炴椂鏁版嵁鏈嶅姟鍒濆鍖栧畬?);
  } catch (error) {
    console.error('锟?瀹炴椂鏁版嵁鏈嶅姟鍒濆鍖栧け?', error);
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
        // 鑾峰彇鏈嶅姟鐘?        return NextResponse.json({
          status: 'running',
          initialized: isInitialized,
          consumers: Array.from(realTimeDataService.consumerGroups.keys()),
          timestamp: new Date().toISOString(),
        });

      case 'streams':
        // 鑾峰彇Stream淇℃伅
        const streamKeys = [
          'stream:price_update',
          'stream:inventory_change',
          'stream:user_action',
        ];
        const streamInfo: Record<string, any> = {};

        for (const key of streamKeys) {
          try {
            const info = await realTimeDataService.getStreamInfo(key);
            streamInfo[key] = info;
          } catch (error) {
            streamInfo[key] = { error: 'Stream涓嶅瓨鍦ㄦ垨鏃犳硶璁块棶' };
          }
        }

        return NextResponse.json({
          streams: streamInfo,
          timestamp: new Date().toISOString(),
        });

      case 'publish-test':
        // 鍙戝竷娴嬭瘯浜嬩欢
        const testEvent = {
          id: `test_${Date.now()}`,
          type: 'price_update' as const,
          payload: {
            partId: 'test_part_001',
            oldPrice: 99.99,
            newPrice: 89.99,
            changePercent: -10.0,
            platform: 'taobao',
          },
          timestamp: new Date().toISOString(),
          source: 'test_api',
          priority: 'medium' as const,
        };

        const eventId = await realTimeDataService.publishEvent(testEvent);

        return NextResponse.json({
          message: '娴嬭瘯浜嬩欢宸插彂?,
          eventId,
          event: testEvent,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瀹炴椂鏁版嵁API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
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
          return NextResponse.json({ error: '缂哄皯event鍙傛暟' }, { status: 400 });
        }

        // 楠岃瘉浜嬩欢鏍煎紡
        if (!event.type || !event.payload) {
          return NextResponse.json(
            { error: '浜嬩欢鏍煎紡涓嶆纭紝闇€瑕乼ype鍜宲ayload瀛楁' },
            { status: 400 }
          );
        }

        const eventId = await realTimeDataService.publishEvent({
          id:
            event.id ||
            `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: event.type,
          payload: event.payload,
          timestamp: event.timestamp || new Date().toISOString(),
          source: event.source || 'api',
          priority: event.priority || 'medium',
        });

        return NextResponse.json({
          message: '浜嬩欢鍙戝竷鎴愬姛',
          eventId,
          timestamp: new Date().toISOString(),
        });

      case 'register-processor':
        // 鍔ㄦ€佹敞鍐屽鐞嗗櫒锛堢畝鍖栫増鏈級
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
              { error: '涓嶆敮鎸佺殑澶勭悊鍣ㄧ被? },
              { status: 400 }
            );
        }

        realTimeDataService.registerProcessor(processor);

        return NextResponse.json({
          message: `澶勭悊?${processorType} 宸叉敞鍐宍,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瀹炴椂鏁版嵁API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

