/**
 * FCX配件兑换全流程测试脚本
 * 验证从用户选择配件到仓库发货的完整流程
 */
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class FcxExchangeIntegrationTest {
  constructor() {
    this.testUserId = null;
    this.testRepairShopId = null;
    this.testWarehouseId = null;
    this.testParts = [];
    this.testResults = [];
  }

  async runFullProcessTest() {
    console.log('🚀 开始FCX配件兑换全流程测试...\n');

    try {
      // 1. 准备测试数据
      await this.setupTestData();
      
      // 2. 测试用户FCX余额查询
      await this.testUserBalanceQuery();
      
      // 3. 测试配件列表查询
      await this.testPartsListing();
      
      // 4. 测试FCX价格查询
      await this.testFcxPriceQuery();
      
      // 5. 测试库存预留
      await this.testInventoryReservation();
      
      // 6. 测试FCX兑换流程
      await this.testFcxExchangeProcess();
      
      // 7. 测试订单查询
      await this.testOrderQuery();
      
      // 8. 测试WMS发货通知
      await this.testWmsShipmentNotification();
      
      // 9. 输出测试报告
      await this.generateTestReport();

    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
      this.testResults.push({
        test: '整体流程',
        status: 'FAILED',
        error: error.message
      });
    }

    return this.testResults;
  }

  async setupTestData() {
    console.log('📋 准备测试数据...');
    
    try {
      // 创建测试用户
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .insert({
          username: 'test_user_fcx_exchange',
          email: 'test_fcx_exchange@example.com',
          fcx_balance: 5000,
          role: 'repair_shop_owner'
        })
        .select()
        .single();

      if (userError) throw new Error(`创建测试用户失败: ${userError.message}`);
      this.testUserId = userData.id;
      console.log('✅ 测试用户创建成功');

      // 创建测试维修店
      const { data: shopData, error: shopError } = await supabase
        .from('repair_shops')
        .insert({
          name: '测试维修店-FCX兑换',
          owner_id: this.testUserId,
          contact_phone: '13800138000',
          address: '测试地址',
          status: 'approved'
        })
        .select()
        .single();

      if (shopError) throw new Error(`创建测试维修店失败: ${shopError.message}`);
      this.testRepairShopId = shopData.id;
      console.log('✅ 测试维修店创建成功');

      // 获取测试仓库
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouses')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (warehouseError) throw new Error(`获取测试仓库失败: ${warehouseError.message}`);
      this.testWarehouseId = warehouseData.id;
      console.log('✅ 测试仓库获取成功');

      // 获取测试配件（至少3个）
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id, name, category')
        .eq('status', 'active')
        .limit(3);

      if (partsError) throw new Error(`获取测试配件失败: ${partsError.message}`);
      this.testParts = partsData;
      console.log(`✅ 获取 ${this.testParts.length} 个测试配件`);

      // 为测试配件设置FCX价格
      for (const part of this.testParts) {
        const fcxPrice = Math.floor(Math.random() * 500) + 100; // 100-600 FCX
        
        const { error: priceError } = await supabase
          .from('part_fcx_prices')
          .insert({
            part_id: part.id,
            fcx_price: fcxPrice,
            effective_from: new Date()
          });

        if (priceError && priceError.code !== '23505') { // 忽略重复键错误
          console.warn(`设置配件 ${part.name} FCX价格失败:`, priceError.message);
        } else {
          part.fcx_price = fcxPrice;
          console.log(`   📝 ${part.name} FCX价格: ${fcxPrice}`);
        }
      }

      // 确保测试配件有足够的库存
      for (const part of this.testParts) {
        const { data: inventoryData } = await supabase
          .from('inventory_records')
          .select('*')
          .eq('product_id', part.id)
          .eq('warehouse_id', this.testWarehouseId)
          .single();

        if (!inventoryData) {
          // 创建库存记录
          await supabase
            .from('inventory_records')
            .insert({
              product_id: part.id,
              warehouse_id: this.testWarehouseId,
              quantity: 100,
              available_quantity: 100,
              reserved_quantity: 0,
              safety_stock: 10,
              reorder_point: 20,
              status: 'in_stock'
            });
          console.log(`   📦 为 ${part.name} 创建库存记录`);
        } else if (inventoryData.available_quantity < 50) {
          // 补充库存
          await supabase
            .from('inventory_records')
            .update({
              quantity: inventoryData.quantity + 50,
              available_quantity: inventoryData.available_quantity + 50
            })
            .eq('id', inventoryData.id);
          console.log(`   📈 为 ${part.name} 补充库存`);
        }
      }

      this.testResults.push({
        test: '测试数据准备',
        status: 'PASSED',
        details: {
          userId: this.testUserId,
          repairShopId: this.testRepairShopId,
          warehouseId: this.testWarehouseId,
          partsCount: this.testParts.length
        }
      });

    } catch (error) {
      console.error('❌ 测试数据准备失败:', error);
      this.testResults.push({
        test: '测试数据准备',
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  async testUserBalanceQuery() {
    console.log('\n💰 测试用户FCX余额查询...');
    
    try {
      const response = await fetch(`http://localhost:3001/api/fcx/accounts/${this.testUserId}/balance`);
      const result = await response.json();

      if (result.success && result.data.availableBalance >= 0) {
        console.log(`✅ 用户FCX余额: ${result.data.availableBalance}`);
        this.testResults.push({
          test: '用户FCX余额查询',
          status: 'PASSED',
          details: { balance: result.data.availableBalance }
        });
      } else {
        throw new Error('余额查询返回无效数据');
      }

    } catch (error) {
      console.error('❌ 用户FCX余额查询失败:', error);
      this.testResults.push({
        test: '用户FCX余额查询',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testPartsListing() {
    console.log('\n📱 测试配件列表查询...');
    
    try {
      const response = await fetch('http://localhost:3001/api/parts/available?includeFcxPrice=true&limit=10');
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ 获取到 ${result.data.length} 个可兑换配件`);
        this.testResults.push({
          test: '配件列表查询',
          status: 'PASSED',
          details: { partsCount: result.data.length }
        });
      } else {
        throw new Error('配件列表查询返回无效数据');
      }

    } catch (error) {
      console.error('❌ 配件列表查询失败:', error);
      this.testResults.push({
        test: '配件列表查询',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testFcxPriceQuery() {
    console.log('\n🏷️ 测试FCX价格查询...');
    
    try {
      const partIds = this.testParts.map(p => p.id);
      const queryParams = new URLSearchParams({ partIds: partIds.join(',') });
      
      const response = await fetch(`http://localhost:3001/api/fcx/prices?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        console.log('✅ FCX价格查询成功');
        Object.entries(result.data).forEach(([partId, price]) => {
          const part = this.testParts.find(p => p.id === partId);
          if (part) {
            console.log(`   ${part.name}: ${price} FCX`);
          }
        });
        this.testResults.push({
          test: 'FCX价格查询',
          status: 'PASSED'
        });
      } else {
        throw new Error('FCX价格查询失败');
      }

    } catch (error) {
      console.error('❌ FCX价格查询失败:', error);
      this.testResults.push({
        test: 'FCX价格查询',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testInventoryReservation() {
    console.log('\n🔒 测试库存预留...');
    
    try {
      const reservationItems = this.testParts.slice(0, 2).map(part => ({
        partId: part.id,
        warehouseId: this.testWarehouseId,
        quantity: 2
      }));

      const response = await fetch('http://localhost:3001/api/inventory/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reservationItems })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ 成功预留 ${result.reservationIds.length} 个库存项`);
        this.testResults.push({
          test: '库存预留',
          status: 'PASSED',
          details: { 
            reservationCount: result.reservationIds.length,
            reservationIds: result.reservationIds 
          }
        });
      } else {
        throw new Error(`库存预留失败: ${result.errorMessage}`);
      }

    } catch (error) {
      console.error('❌ 库存预留失败:', error);
      this.testResults.push({
        test: '库存预留',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testFcxExchangeProcess() {
    console.log('\n🔄 测试FCX兑换完整流程...');
    
    try {
      // 准备兑换商品
      const exchangeItems = this.testParts.map(part => ({
        productId: part.id,
        quantity: 1,
        fcxPrice: part.fcx_price || 300
      }));

      const requestBody = {
        repairShopId: this.testRepairShopId,
        userId: this.testUserId,
        items: exchangeItems,
        shippingAddress: {
          name: '测试收货人',
          phone: '13800138000',
          address: '测试街道123号',
          city: '测试市',
          province: '测试省',
          postalCode: '100000',
          country: '中国'
        }
      };

      const response = await fetch('http://localhost:3001/api/fcx/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ FCX兑换成功!');
        console.log(`   订单号: ${result.data.orderNumber}`);
        console.log(`   消耗FCX: ${result.data.totalFcxCost}`);
        console.log(`   仓库: ${result.data.warehouseId}`);
        console.log(`   预计送达: ${result.data.estimatedDeliveryTime}小时`);
        
        this.testResults.push({
          test: 'FCX兑换流程',
          status: 'PASSED',
          details: {
            orderNumber: result.data.orderNumber,
            totalFcxCost: result.data.totalFcxCost,
            warehouseId: result.data.warehouseId
          }
        });

        this.testOrderId = result.data.orderId;
        this.testOrderNumber = result.data.orderNumber;

      } else {
        throw new Error(`FCX兑换失败: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ FCX兑换流程失败:', error);
      this.testResults.push({
        test: 'FCX兑换流程',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testOrderQuery() {
    console.log('\n📋 测试订单查询...');
    
    try {
      // 查询用户订单
      const response = await fetch(`http://localhost:3001/api/fcx/exchange?userId=${this.testUserId}&limit=5`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ 查询到 ${result.data.length} 个订单`);
        
        const testOrder = result.data.find(order => order.order_number === this.testOrderNumber);
        if (testOrder) {
          console.log(`   测试订单状态: ${testOrder.status}`);
          console.log(`   商品数量: ${testOrder.total_items}`);
          console.log(`   消耗FCX: ${testOrder.total_fcx_cost}`);
        }
        
        this.testResults.push({
          test: '订单查询',
          status: 'PASSED',
          details: { 
            orderCount: result.data.length,
            testOrderStatus: testOrder?.status 
          }
        });
      } else {
        throw new Error('订单查询返回无效数据');
      }

    } catch (error) {
      console.error('❌ 订单查询失败:', error);
      this.testResults.push({
        test: '订单查询',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async testWmsShipmentNotification() {
    console.log('\n🚚 测试WMS发货通知...');
    
    try {
      // 模拟WMS回调通知
      const wmsCallbackData = {
        eventType: 'ORDER_SHIPPED',
        wmsOrderId: `WMS-${this.testOrderId}`,
        trackingNumber: `SF${Date.now()}`,
        carrier: '顺丰速运',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/api/wms/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wmsCallbackData)
      });

      if (response.ok) {
        console.log('✅ WMS发货通知处理成功');
        this.testResults.push({
          test: 'WMS发货通知',
          status: 'PASSED'
        });
      } else {
        const errorText = await response.text();
        throw new Error(`WMS通知处理失败: ${errorText}`);
      }

    } catch (error) {
      console.error('❌ WMS发货通知测试失败:', error);
      this.testResults.push({
        test: 'WMS发货通知',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async generateTestReport() {
    console.log('\n📊 测试报告生成...');
    
    const passedTests = this.testResults.filter(r => r.status === 'PASSED').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAILED').length;
    const totalTests = this.testResults.length;

    console.log('\n' + '='.repeat(50));
    console.log('FCX配件兑换全流程测试报告');
    console.log('='.repeat(50));
    console.log(`总测试项: ${totalTests}`);
    console.log(`✅ 通过: ${passedTests}`);
    console.log(`❌ 失败: ${failedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));

    if (failedTests > 0) {
      console.log('\n失败的测试项:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(result => {
          console.log(`  ❌ ${result.test}: ${result.error}`);
        });
    }

    console.log('\n测试数据清理:');
    await this.cleanupTestData();

    this.testResults.push({
      test: '整体测试报告',
      status: failedTests === 0 ? 'PASSED' : 'FAILED',
      details: {
        totalTests,
        passedTests,
        failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
      }
    });
  }

  async cleanupTestData() {
    console.log('🧹 清理测试数据...');
    
    try {
      // 删除测试订单
      if (this.testOrderId) {
        await supabase
          .from('fcx_exchange_orders')
          .delete()
          .eq('id', this.testOrderId);
        console.log('   🗑️  删除测试订单');
      }

      // 删除测试维修店
      if (this.testRepairShopId) {
        await supabase
          .from('repair_shops')
          .delete()
          .eq('id', this.testRepairShopId);
        console.log('   🗑️  删除测试维修店');
      }

      // 删除测试用户
      if (this.testUserId) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', this.testUserId);
        console.log('   🗑️  删除测试用户');
      }

      console.log('✅ 测试数据清理完成');

    } catch (error) {
      console.error('❌ 测试数据清理失败:', error);
    }
  }
}

// 执行测试
async function runTests() {
  const tester = new FcxExchangeIntegrationTest();
  const results = await tester.runFullProcessTest();
  
  // 输出最终结果
  const failedTests = results.filter(r => r.status === 'FAILED').length;
  process.exit(failedTests > 0 ? 1 : 0);
}

// 检查是否直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { FcxExchangeIntegrationTest };