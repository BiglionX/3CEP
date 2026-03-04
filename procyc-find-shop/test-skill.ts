/**
 * procyc-find-shop 技能测试脚本
 */

import skill from './src/index';

async function testFindShop() {
  console.log('=== 测试 procyc-find-shop 技能 ===\n');

  // 测试 1: 基本查询 (北京地区)
  console.log('测试 1: 查询北京附近的店铺');
  const result1 = await skill.execute({
    latitude: 39.9042,
    longitude: 116.4074,
    radius: 10,
    limit: 5,
  });

  console.log('结果:', JSON.stringify(result1, null, 2));
  console.log('✓ 测试 1 完成\n');

  // 测试 2: 上海地区
  console.log('测试 2: 查询上海附近的店铺');
  const result2 = await skill.execute({
    latitude: 31.2304,
    longitude: 121.4737,
    radius: 5,
    limit: 3,
  });

  console.log('找到店铺数量:', result2.data?.shops.length);
  if (result2.data?.shops.length > 0) {
    console.log('最近的店铺:', result2.data.shops[0].name);
    console.log('距离:', result2.data.shops[0].distance.toFixed(2), '公里');
  }
  console.log('✓ 测试 2 完成\n');

  // 测试 3: 参数验证 - 缺少必填参数
  console.log('测试 3: 测试参数验证 (缺少经度)');
  const result3 = await skill.execute({
    latitude: 39.9042,
    // 缺少 longitude
  });

  console.log('错误信息:', result3.error?.message);
  console.log('✓ 测试 3 完成\n');

  // 测试 4: 参数验证 - 纬度超出范围
  console.log('测试 4: 测试参数验证 (纬度超出范围)');
  const result4 = await skill.execute({
    latitude: 100, // 超出 -90 到 90
    longitude: 116.4074,
  });

  console.log('错误信息:', result4.error?.message);
  console.log('✓ 测试 4 完成\n');

  // 测试 5: 性能测试
  console.log('测试 5: 性能测试');
  const startTime = Date.now();
  await skill.execute({
    latitude: 39.9042,
    longitude: 116.4074,
    radius: 50,
    limit: 100,
  });
  const endTime = Date.now();
  console.log(`执行时间：${endTime - startTime}ms`);
  console.log('✓ 测试 5 完成\n');

  console.log('=== 所有测试完成 ===');
}

// 运行测试
testFindShop().catch(console.error);
