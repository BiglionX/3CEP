/**
 * procyc-fault-diagnosis 技能手动测试脚本
 */

const skill = require('./src/index').default;

async function runTests() {
  console.log('=== procyc-fault-diagnosis 技能测试===\n');

  // 测试 1: 手机屏幕故障诊断
  console.log('测试 1: iPhone 屏幕出现绿色线条');
  const test1Input = {
    deviceType: 'mobile',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    symptoms: ['屏幕出现绿色线条', '触摸响应迟钝'],
  };

  try {
    const result1 = await skill.execute(test1Input);
    console.log('结果:', JSON.stringify(result1, null, 2));
    console.log('✅ 测试 1 通过\n');
  } catch (error: any) {
    console.log('❌ 测试 1 失败:', error.message);
  }

  // 测试 2: 电池故障诊断
  console.log('测试 2: 手机电池耗电快');
  const test2Input = {
    deviceType: 'mobile',
    brand: 'Samsung',
    model: 'Galaxy S21',
    symptoms: ['电池耗电快', '充电慢'],
  };

  try {
    const result2 = await skill.execute(test2Input);
    console.log('结果:', JSON.stringify(result2, null, 2));
    console.log('✅ 测试 2 通过\n');
  } catch (error: any) {
    console.log('❌ 测试 2 失败:', error.message);
  }

  // 测试 3: 笔记本无法开机
  console.log('测试 3: 笔记本无法开机');
  const test3Input = {
    deviceType: 'laptop',
    brand: 'Dell',
    model: 'XPS 15',
    symptoms: ['无法开机', '电源指示灯不亮'],
  };

  try {
    const result3 = await skill.execute(test3Input);
    console.log('结果:', JSON.stringify(result3, null, 2));
    console.log('✅ 测试 3 通过\n');
  } catch (error: any) {
    console.log('❌ 测试 3 失败:', error.message);
  }

  // 测试 4: 参数验证 - 缺少必填字段
  console.log('测试 4: 参数验证 - 缺少症状');
  const test4Input = {
    deviceType: 'mobile',
    brand: 'Apple',
    model: 'iPhone 12',
    symptoms: [],
  };

  try {
    const result4 = await skill.execute(test4Input);
    if (!result4.success && result4.error) {
      console.log('结果:', result4.error.message);
      console.log('✅ 测试 4 通过（正确捕获验证错误）\n');
    } else {
      console.log('❌ 测试 4 失败（应该返回错误）');
    }
  } catch (error: any) {
    console.log('✅ 测试 4 通过:', error.message);
  }

  // 测试 5: 平板屏幕碎裂
  console.log('测试 5: iPad 屏幕碎裂');
  const test5Input = {
    deviceType: 'tablet',
    brand: 'Apple',
    model: 'iPad Pro 12.9',
    symptoms: ['屏幕碎裂', '触摸失灵'],
  };

  try {
    const result5 = await skill.execute(test5Input);
    console.log('结果:', JSON.stringify(result5, null, 2));
    console.log('✅ 测试 5 通过\n');
  } catch (error: any) {
    console.log('❌ 测试 5 失败:', error.message);
  }

  // 测试 6: 台式机显示器无信号
  console.log('测试 6: 台式机显示器无信号');
  const test6Input = {
    deviceType: 'desktop',
    brand: 'Custom Build',
    model: 'Gaming PC',
    symptoms: ['显示器无信号', '黑屏'],
  };

  try {
    const result6 = await skill.execute(test6Input);
    console.log('结果:', JSON.stringify(result6, null, 2));
    console.log('✅ 测试 6 通过\n');
  } catch (error: any) {
    console.log('❌ 测试 6 失败:', error.message);
  }

  // 测试 7: 性能测试
  console.log('测试 7: 性能测试');
  const test7Input = {
    deviceType: 'mobile',
    brand: 'Xiaomi',
    model: 'Mi 11',
    symptoms: ['相机模糊', '对焦失败'],
  };

  const startTime = Date.now();
  try {
    const result7 = await skill.execute(test7Input);
    const executionTime = Date.now() - startTime;
    console.log(`执行时间：${executionTime}ms`);
    if (executionTime < 100) {
      console.log('✅ 性能测试通过（< 100ms）\n');
    } else {
      console.log('⚠️  性能警告（>= 100ms）\n');
    }
  } catch (error: any) {
    console.log('❌ 性能测试失败:', error.message);
  }

  console.log('=== 所有测试完成 ===');
}

// 运行测试
runTests().catch(console.error);
