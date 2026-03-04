/**
 * WMS效能分析看板数据库初始化脚本
 * 直接执行SQL语句创建必要的表和数据
 */

const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置，请检查环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  console.log('🚀 开始初始化WMS效能分析看板数据库...\n');

  try {
    // 创建仓库表
    console.log('📋 创建仓库表...');
    const warehouseTableSQL = `
      CREATE TABLE IF NOT EXISTS warehouses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('domestic', 'overseas', 'virtual', 'transit')),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
        location JSONB NOT NULL,
        contact_info JSONB NOT NULL,
        operational_info JSONB NOT NULL,
        logistics_info JSONB NOT NULL,
        integration_info JSONB NOT NULL,
        cost_structure JSONB NOT NULL,
        performance_metrics JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql: warehouseTableSQL,
    });
    if (tableError) {
      console.log('   ⚠️  表可能已存在或创建失败:', tableError.message);
    } else {
      console.log('   ✅ 仓库表创建成功');
    }

    // 创建运营操作表
    console.log('📦 创建运营操作表...');
    const operationTableSQL = `
      CREATE TABLE IF NOT EXISTS warehouse_operations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
        operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('inbound', 'outbound', 'transfer', 'adjustment')),
        operation_number VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        processing_time INTEGER,
        item_count INTEGER NOT NULL DEFAULT 0,
        total_value DECIMAL(15,2) DEFAULT 0,
        pick_time INTEGER,
        pack_time INTEGER,
        ship_time INTEGER,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'exception', 'cancelled')),
        accuracy BOOLEAN DEFAULT true,
        exception_reason TEXT,
        reference_number VARCHAR(100),
        operator_id UUID,
        cost DECIMAL(10,2) DEFAULT 0
      );
    `;

    const { error: operationError } = await supabase.rpc('execute_sql', {
      sql: operationTableSQL,
    });
    if (operationError) {
      console.log('   ⚠️  运营操作表可能已存在:', operationError.message);
    } else {
      console.log('   ✅ 运营操作表创建成功');
    }

    // 创建索引
    console.log('.CreateIndex 创建索引...');
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_warehouse_operations_warehouse ON warehouse_operations(warehouse_id);
      CREATE INDEX IF NOT EXISTS idx_warehouse_operations_type ON warehouse_operations(operation_type);
      CREATE INDEX IF NOT EXISTS idx_warehouse_operations_created ON warehouse_operations(created_at);
      CREATE INDEX IF NOT EXISTS idx_warehouse_operations_status ON warehouse_operations(status);
    `;

    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql: indexesSQL,
    });
    if (indexError) {
      console.log('   ⚠️  索引创建可能存在问题:', indexError.message);
    } else {
      console.log('   ✅ 索引创建成功');
    }

    // 插入示例仓库数据
    console.log('🏗️  插入示例仓库数据...');
    const sampleWarehouses = [
      {
        code: 'WH-US-LAX-001',
        name: '美国洛杉矶海外仓',
        type: 'overseas',
        status: 'active',
        location: {
          country: '美国',
          countryCode: 'US',
          city: '洛杉矶',
          province: '加利福尼亚州',
          address: '123 Main St',
          postalCode: '90001',
          coordinates: { lat: 34.0522, lng: -118.2437 },
        },
        contact_info: {
          manager: '张伟',
          phone: '+1-213-1234567',
          email: 'zhangwei@warehouse.com',
          emergencyContact: '+1-213-9876543',
        },
        operational_info: {
          timezone: 'America/Los_Angeles',
          workingHours: '08:00-18:00',
          holidays: [],
          capacity: 5000,
          currentOccupancy: 3200,
          temperatureControlled: true,
          humidityControlled: true,
        },
        logistics_info: {
          providers: ['FedEx', 'UPS', 'DHL'],
          shippingZones: ['北美', '南美'],
          deliveryTime: { domestic: 24, international: 72 },
        },
        integration_info: {
          wmsProvider: 'GoodCang',
          wmsApiEndpoint: 'https://api.goodcang.com/v1',
          apiKey: 'demo_key',
          lastSyncedAt: new Date().toISOString(),
          syncStatus: 'success',
          syncFrequency: 5,
        },
        cost_structure: {
          storageFee: 0.5,
          handlingFee: 2.0,
          insuranceRate: 0.3,
        },
        performance_metrics: {
          accuracyRate: 99.2,
          onTimeRate: 97.8,
          damageRate: 0.3,
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        code: 'WH-DE-FRA-001',
        name: '德国法兰克福海外仓',
        type: 'overseas',
        status: 'active',
        location: {
          country: '德国',
          countryCode: 'DE',
          city: '法兰克福',
          province: '黑森州',
          address: '456 Market St',
          postalCode: '60311',
          coordinates: { lat: 50.1109, lng: 8.6821 },
        },
        contact_info: {
          manager: '李娜',
          phone: '+49-69-12345678',
          email: 'lina@warehouse.de',
          emergencyContact: '+49-69-87654321',
        },
        operational_info: {
          timezone: 'Europe/Berlin',
          workingHours: '08:00-17:00',
          holidays: ['2026-01-01', '2026-12-25'],
          capacity: 3000,
          currentOccupancy: 2100,
          temperatureControlled: false,
          humidityControlled: false,
        },
        logistics_info: {
          providers: ['DHL', 'DPD', 'Hermes'],
          shippingZones: ['欧洲'],
          deliveryTime: { domestic: 24, international: 48 },
        },
        integration_info: {
          wmsProvider: 'Custom',
          wmsApiEndpoint: 'https://wms.germany-warehouse.com/api',
          apiKey: 'demo_key',
          lastSyncedAt: new Date().toISOString(),
          syncStatus: 'success',
          syncFrequency: 10,
        },
        cost_structure: {
          storageFee: 0.8,
          handlingFee: 2.5,
          insuranceRate: 0.5,
        },
        performance_metrics: {
          accuracyRate: 98.7,
          onTimeRate: 96.5,
          damageRate: 0.5,
          lastUpdated: new Date().toISOString(),
        },
      },
    ];

    for (const warehouse of sampleWarehouses) {
      const { error: insertError } = await supabase
        .from('warehouses')
        .insert([warehouse]);

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`   ⚠️  仓库 ${warehouse.code} 已存在`);
        } else {
          console.log(
            `   ❌ 插入仓库 ${warehouse.code} 失败:`,
            insertError.message
          );
        }
      } else {
        console.log(`   ✅ 仓库 ${warehouse.code} 插入成功`);
      }
    }

    // 插入示例运营数据
    console.log('📊 插入示例运营数据...');
    const { data: warehouses, error: warehouseQueryError } = await supabase
      .from('warehouses')
      .select('id');

    if (warehouseQueryError) {
      console.log('   ❌ 查询仓库失败:', warehouseQueryError.message);
    } else {
      for (const warehouse of warehouses) {
        // 为每个仓库插入一些示例操作数据
        for (let i = 0; i < 10; i++) {
          const operationType = Math.random() > 0.5 ? 'inbound' : 'outbound';
          const operationNumber = `${operationType === 'inbound' ? 'IN' : 'OUT'}-${warehouse.id.substring(0, 8)}-${Date.now()}-${i}`;

          const { error: operationInsertError } = await supabase
            .from('warehouse_operations')
            .insert([
              {
                warehouse_id: warehouse.id,
                operation_type: operationType,
                operation_number: operationNumber,
                created_at: new Date(
                  Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
                ),
                completed_at: new Date(
                  Date.now() - Math.random() * 29 * 24 * 60 * 60 * 1000
                ),
                processing_time: 15 + Math.floor(Math.random() * 45),
                item_count: 10 + Math.floor(Math.random() * 190),
                total_value: 1000 + Math.random() * 9000,
                pick_time:
                  operationType === 'outbound'
                    ? 5 + Math.floor(Math.random() * 20)
                    : null,
                pack_time:
                  operationType === 'outbound'
                    ? 3 + Math.floor(Math.random() * 12)
                    : null,
                ship_time:
                  operationType === 'outbound'
                    ? 10 + Math.floor(Math.random() * 30)
                    : null,
                status: Math.random() > 0.95 ? 'exception' : 'completed',
                accuracy: Math.random() > 0.02,
              },
            ]);

          if (operationInsertError) {
            if (operationInsertError.code !== '23505') {
              // 忽略重复键错误
              console.log(
                `   ❌ 插入操作数据失败:`,
                operationInsertError.message
              );
            }
          }
        }
      }
      console.log('   ✅ 示例运营数据插入完成');
    }

    console.log('\n🎉 数据库初始化完成！');
    console.log('✅ WMS效能分析看板所需的表和示例数据已准备就绪');
  } catch (error) {
    console.error('❌ 数据库初始化过程中发生错误:', error);
  }
}

// 运行初始化
initializeDatabase();
