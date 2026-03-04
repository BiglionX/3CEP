#!/usr/bin/env node

/**
 * 快速数据生成脚本
 * 生成冷启动所需的基础数据
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始快速数据生成...\n');

// 基础品牌列表
const brands = [
  'Apple',
  '华为',
  '小米',
  'OPPO',
  'vivo',
  '三星',
  '一加',
  '魅族',
  '努比亚',
  '中兴',
];

// 设备型号模板
const modelTemplates = [
  { prefix: 'iPhone', suffixes: ['Pro', 'Pro Max', 'Plus', 'SE', 'Mini'] },
  { prefix: 'Mate', suffixes: ['Pro', 'Pro+', 'RS', 'Ultra'] },
  { prefix: '', suffixes: ['Pro', 'Pro+', 'Ultra', 'Plus', 'SE'] },
];

// 故障类型分类
const faultCategories = [
  { name: '屏幕', suffixes: ['碎裂', '花屏', '触摸失灵', '亮度异常', '进水'] },
  { name: '电池', suffixes: ['不充电', '续航短', '发热', '鼓包', '无法开机'] },
  {
    name: '摄像头',
    suffixes: ['无法对焦', '模糊', '黑屏', '抖动', '无法启动'],
  },
  { name: '系统', suffixes: ['卡顿', '死机', '重启', '应用闪退', '更新失败'] },
  {
    name: '网络',
    suffixes: ['无信号', 'WiFi连接失败', '蓝牙异常', '数据慢', '无法拨号'],
  },
];

// 配件分类
const partCategories = [
  {
    name: '屏幕',
    prefixes: ['原装', '高透', '防蓝光'],
    suffixes: ['总成', '外屏', '内屏'],
  },
  {
    name: '电池',
    prefixes: ['原装', '高容量', '快充'],
    suffixes: ['电池', '电芯'],
  },
  {
    name: '摄像头',
    prefixes: ['原装', '高清', '广角'],
    suffixes: ['模组', '镜头'],
  },
  {
    name: '外壳',
    prefixes: ['硅胶', '金属', '皮革'],
    suffixes: ['保护壳', '后盖'],
  },
];

// 生成设备型号数据
function generateDevices(count) {
  console.log(`📱 生成 ${count} 个设备型号...`);
  const devices = [];

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const template =
      modelTemplates[Math.floor(Math.random() * modelTemplates.length)];

    // 生成型号数字
    const number = Math.floor(10 + Math.random() * 90);
    const suffix =
      Math.random() > 0.3
        ? ` ${template.suffixes[Math.floor(Math.random() * template.suffixes.length)]}`
        : '';

    const model = `${template.prefix}${number}${suffix}`;

    devices.push({
      id: `device_${Date.now()}_${i}`,
      brand: brand,
      model: model.trim(),
      category: '手机',
      release_year: 2020 + Math.floor(Math.random() * 4),
      specifications: {
        screenSize: `${(6 + Math.random() * 2).toFixed(1)}英寸`,
        storage: `${[64, 128, 256, 512][Math.floor(Math.random() * 4)]}GB`,
        ram: `${[4, 6, 8, 12][Math.floor(Math.random() * 4)]}GB`,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`✅ 生成了 ${devices.length} 个设备型号`);
  return devices;
}

// 生成故障类型数据
function generateFaultTypes(count) {
  console.log(`🔧 生成 ${count} 个故障类型...`);
  const faults = [];

  for (let i = 0; i < count; i++) {
    const category =
      faultCategories[Math.floor(Math.random() * faultCategories.length)];
    const suffix =
      category.suffixes[Math.floor(Math.random() * category.suffixes.length)];
    const name = `${category.name}${suffix}`;

    faults.push({
      id: `fault_${Date.now()}_${i}`,
      name: name,
      category: category.name,
      description: `${name}故障问题`,
      difficulty_level: Math.floor(Math.random() * 3) + 1,
      estimated_time: Math.floor(30 + Math.random() * 120),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`✅ 生成了 ${faults.length} 个故障类型`);
  return faults;
}

// 生成配件数据
function generateParts(count) {
  console.log(`⚙️ 生成 ${count} 个配件数据...`);
  const parts = [];

  for (let i = 0; i < count; i++) {
    const category =
      partCategories[Math.floor(Math.random() * partCategories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const prefix =
      category.prefixes[Math.floor(Math.random() * category.prefixes.length)];
    const suffix =
      category.suffixes[Math.floor(Math.random() * category.suffixes.length)];

    const name = `${prefix}${brand}${suffix}`;

    parts.push({
      id: `part_${Date.now()}_${i}`,
      name: name,
      category: category.name,
      brand: brand,
      model: '通用型号',
      part_number: `PART-${brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      unit: '个',
      description: `${name}，适用于${brand}设备`,
      stock_quantity: Math.floor(50 + Math.random() * 200),
      min_stock: Math.floor(10 + Math.random() * 30),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`✅ 生成了 ${parts.length} 个配件`);
  return parts;
}

// 主执行函数
function main() {
  try {
    // 生成各类数据
    const devices = generateDevices(300);
    const faults = generateFaultTypes(100);
    const parts = generateParts(200);

    // 组装导出数据
    const exportData = {
      devices: devices,
      fault_types: faults,
      parts: parts,
      generated_at: new Date().toISOString(),
      statistics: {
        devices: devices.length,
        fault_types: faults.length,
        parts: parts.length,
        total: devices.length + faults.length + parts.length,
      },
    };

    // 保存到文件
    const outputPath = path.join(
      __dirname,
      '../data/quick-generated-data.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log('\n📊 数据生成统计:');
    console.log(`   设备型号: ${exportData.statistics.devices} 条`);
    console.log(`   故障类型: ${exportData.statistics.fault_types} 条`);
    console.log(`   配件数据: ${exportData.statistics.parts} 条`);
    console.log(`   总计数据: ${exportData.statistics.total} 条`);
    console.log(`\n💾 数据已保存到: ${outputPath}`);
    console.log('\n🎉 快速数据生成完成！');

    return exportData;
  } catch (error) {
    console.error('❌ 数据生成失败:', error.message);
  }
}

// 执行
main();
