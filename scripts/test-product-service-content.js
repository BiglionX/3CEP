/**
 * 产品服务官内容管理功能测试脚本
 */

async function testEnterprisePartsAPI() {
  console.log('🧪 开始测试企业配件管理API...\n');

  try {
    // 测试获取配件列表
    console.log('1. 测试获取配件列表...');
    const listResponse = await fetch('http://localhost:3001/api/enterprise/parts');
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('✅ 获取配件列表成功:', listData);
    } else {
      console.log('⚠️ 获取配件列表失败:', listResponse.status, await listResponse.text());
    }

    // 测试创建配件
    console.log('\n2. 测试创建配件...');
    const createResponse = await fetch('http://localhost:3001/api/enterprise/parts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '测试配件',
        category: '手机配件',
        brand: 'TestBrand',
        model: 'TestModel',
        description: '这是一个测试配件',
        price: 99.99,
        stock_quantity: 100
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ 创建配件成功:', createData);
    } else {
      console.log('⚠️ 创建配件失败:', createResponse.status, await createResponse.text());
    }

    console.log('\n✅ 企业配件管理API测试完成');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 执行测试
testEnterprisePartsAPI();