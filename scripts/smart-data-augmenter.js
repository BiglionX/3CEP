#!/usr/bin/env node

/**
 * 智能数据增强器 - 基于现有数据模式生成新数据
 * 不依赖浏览器爬虫，通过分析现有数据规律自动生成新数据
 */

const fs = require('fs');
const path = require('path');

class SmartDataAugmenter {
  constructor() {
    this.existingData = {
      devices: [],
      faultTypes: [],
      parts: [],
      repairShops: [],
    };

    this.patterns = {
      deviceModels: [],
      brandPatterns: [],
      faultCategories: [],
      partCategories: [],
    };
  }

  /**
   * 加载现有数据
   */
  async loadData() {
    console.log('📥 加载现有数据...');

    try {
      // 模拟加载现有数据（实际项目中从数据库加载）
      this.existingData = {
        devices: this.getSampleDevices(),
        faultTypes: this.getSampleFaultTypes(),
        parts: this.getSampleParts(),
        repairShops: this.getSampleRepairShops(),
      };

      console.log(`✅ 加载完成:`);
      console.log(`   - 设备型号: ${this.existingData.devices.length} 条`);
      console.log(`   - 故障类型: ${this.existingData.faultTypes.length} 条`);
      console.log(`   - 配件数据: ${this.existingData.parts.length} 条`);
      console.log(`   - 维修店铺: ${this.existingData.repairShops.length} 条`);

      this.analyzePatterns();
    } catch (error) {
      console.error('❌ 数据加载失败:', error.message);
    }
  }

  /**
   * 分析数据模式
   */
  analyzePatterns() {
    console.log('\n🔍 分析数据模式...');

    // 分析设备型号模式
    this.patterns.deviceModels = this.extractDeviceModelPatterns();
    this.patterns.brandPatterns = this.extractBrandPatterns();
    this.patterns.faultCategories = [
      ...new Set(this.existingData.faultTypes.map(f => f.category)),
    ];
    this.patterns.partCategories = [
      ...new Set(this.existingData.parts.map(p => p.category)),
    ];

    console.log(`✅ 模式分析完成:`);
    console.log(`   - 设备型号模式: ${this.patterns.deviceModels.length} 种`);
    console.log(`   - 品牌模式: ${this.patterns.brandPatterns.length} 种`);
    console.log(`   - 故障分类: ${this.patterns.faultCategories.length} 类`);
    console.log(`   - 配件分类: ${this.patterns.partCategories.length} 类`);
  }

  /**
   * 提取设备型号模式
   */
  extractDeviceModelPatterns() {
    const patterns = [];
    const modelRegex =
      /([A-Za-z]+)(\d+[A-Za-z]*)\s*(Pro|Max|Plus|SE|Ultra|Mini|Lite)?/i;

    this.existingData.devices.forEach(device => {
      const match = device.model.match(modelRegex);
      if (match) {
        const [, brandPrefix, numberSeries, suffix] = match;
        patterns.push({
          brand: device.brand,
          prefix: brandPrefix,
          numberPattern: numberSeries.replace(/\d/g, 'X'),
          suffix: suffix || '',
        });
      }
    });

    return [
      ...new Map(
        patterns.map(p => [`${p.prefix}-${p.numberPattern}-${p.suffix}`, p])
      ).values(),
    ];
  }

  /**
   * 提取品牌模式
   */
  extractBrandPatterns() {
    const brandStats = {};
    this.existingData.devices.forEach(device => {
      brandStats[device.brand] = (brandStats[device.brand] || 0) + 1;
    });

    return Object.entries(brandStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([brand, count]) => ({ brand, frequency: count }));
  }

  /**
   * 生成新的设备型号数据
   */
  generateDeviceModels(count = 100) {
    console.log(`\n📱 生成 ${count} 个新的设备型号...`);

    const newDevices = [];
    const usedModels = new Set(
      this.existingData.devices.map(d => `${d.brand}-${d.model}`)
    );

    while (newDevices.length < count) {
      const pattern =
        this.patterns.deviceModels[
          Math.floor(Math.random() * this.patterns.deviceModels.length)
        ];

      const brandPattern =
        this.patterns.brandPatterns[
          Math.floor(Math.random() * this.patterns.brandPatterns.length)
        ];

      // 生成新的型号
      const newNumber = this.generateNumberSeries(pattern.numberPattern);
      const newSuffix =
        Math.random() > 0.7 ? this.generateRandomSuffix() : pattern.suffix;
      const newModel = `${pattern.prefix}${newNumber}${newSuffix ? ` ${newSuffix}` : ''}`;

      const deviceKey = `${brandPattern.brand}-${newModel}`;

      if (!usedModels.has(deviceKey)) {
        newDevices.push({
          id: `dev_${Date.now()}_${newDevices.length}`,
          brand: brandPattern.brand,
          model: newModel,
          category: '手机',
          release_year: this.generateReleaseYear(),
          specifications: this.generateSpecifications(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        usedModels.add(deviceKey);
      }
    }

    console.log(`✅ 生成了 ${newDevices.length} 个新设备型号`);
    return newDevices;
  }

  /**
   * 生成数字系列
   */
  generateNumberSeries(pattern) {
    return pattern.replace(/X/g, () => Math.floor(Math.random() * 10));
  }

  /**
   * 生成随机后缀
   */
  generateRandomSuffix() {
    const suffixes = [
      'Pro',
      'Max',
      'Plus',
      'SE',
      'Ultra',
      'Mini',
      'Lite',
      'Plus+',
      'Pro Max',
    ];
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  /**
   * 生成发布年份
   */
  generateReleaseYear() {
    const currentYear = new Date().getFullYear();
    return currentYear - Math.floor(Math.random() * 5); // 近5年内的年份
  }

  /**
   * 生成规格参数
   */
  generateSpecifications() {
    return {
      screenSize: `${(6 + Math.random() * 2).toFixed(1)}英寸`,
      storage: `${[64, 128, 256, 512, 1024][Math.floor(Math.random() * 5)]}GB`,
      ram: `${[4, 6, 8, 12, 16][Math.floor(Math.random() * 5)]}GB`,
      camera: `${Math.floor(12 + Math.random() * 108)}MP`,
      battery: `${Math.floor(3000 + Math.random() * 2000)}mAh`,
    };
  }

  /**
   * 生成故障类型数据
   */
  generateFaultTypes(count = 50) {
    console.log(`\n🔧 生成 ${count} 个新的故障类型...`);

    const newFaults = [];
    const faultTemplates = [
      {
        prefix: '屏幕',
        categories: ['屏幕', '显示'],
        suffixes: ['碎裂', '花屏', '触摸失灵', '亮度异常'],
      },
      {
        prefix: '电池',
        categories: ['电池', '电源'],
        suffixes: ['不充电', '续航短', '发热', '鼓包'],
      },
      {
        prefix: '摄像头',
        categories: ['摄像头', '拍照'],
        suffixes: ['无法对焦', '模糊', '黑屏', '抖动'],
      },
      {
        prefix: '系统',
        categories: ['系统', '软件'],
        suffixes: ['卡顿', '死机', '重启', '应用闪退'],
      },
      {
        prefix: '网络',
        categories: ['网络', '连接'],
        suffixes: ['无信号', 'WiFi连接失败', '蓝牙异常', '数据慢'],
      },
    ];

    const usedFaults = new Set(this.existingData.faultTypes.map(f => f.name));

    while (newFaults.length < count) {
      const template =
        faultTemplates[Math.floor(Math.random() * faultTemplates.length)];
      const suffix =
        template.suffixes[Math.floor(Math.random() * template.suffixes.length)];
      const newName = `${template.prefix}${suffix}`;

      if (!usedFaults.has(newName)) {
        newFaults.push({
          id: `fault_${Date.now()}_${newFaults.length}`,
          name: newName,
          category:
            template.categories[
              Math.floor(Math.random() * template.categories.length)
            ],
          description: this.generateFaultDescription(newName),
          difficulty_level: Math.floor(Math.random() * 3) + 1, // 1-3级难度
          estimated_time: Math.floor(30 + Math.random() * 120), // 30-150分钟
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        usedFaults.add(newName);
      }
    }

    console.log(`✅ 生成了 ${newFaults.length} 个新故障类型`);
    return newFaults;
  }

  /**
   * 生成故障描述
   */
  generateFaultDescription(name) {
    const descriptions = {
      屏幕碎裂: '设备屏幕出现裂纹或破损',
      屏幕花屏: '屏幕显示异常，出现彩色条纹或斑点',
      触摸失灵: '屏幕触摸功能部分或完全失效',
      电池不充电: '设备无法正常充电或充电缓慢',
      续航短: '电池续航时间明显缩短',
      摄像头无法对焦: '相机无法正常对焦拍摄',
      系统卡顿: '设备运行缓慢，操作不流畅',
      WiFi连接失败: '无法连接到WiFi网络',
    };

    return descriptions[name] || `设备出现${name}问题`;
  }

  /**
   * 生成配件数据
   */
  generateParts(count = 100) {
    console.log(`\n⚙️ 生成 ${count} 个新的配件数据...`);

    const newParts = [];
    const partTypes = [
      {
        category: '屏幕',
        prefixes: ['原装', '高透', '防蓝光'],
        suffixes: ['总成', '外屏', '内屏'],
      },
      {
        category: '电池',
        prefixes: ['原装', '高容量', '快充'],
        suffixes: ['电池', '电芯'],
      },
      {
        category: '摄像头',
        prefixes: ['原装', '高清', '广角'],
        suffixes: ['模组', '镜头'],
      },
      {
        category: '外壳',
        prefixes: ['硅胶', '金属', '皮革'],
        suffixes: ['保护壳', '后盖'],
      },
    ];

    const usedParts = new Set(
      this.existingData.parts.map(p => `${p.category}-${p.name}`)
    );

    while (newParts.length < count) {
      const partType = partTypes[Math.floor(Math.random() * partTypes.length)];
      const prefix =
        partType.prefixes[Math.floor(Math.random() * partType.prefixes.length)];
      const suffix =
        partType.suffixes[Math.floor(Math.random() * partType.suffixes.length)];

      // 随机选择一个品牌
      const brand =
        this.patterns.brandPatterns[
          Math.floor(
            Math.random() * Math.min(5, this.patterns.brandPatterns.length)
          )
        ].brand;

      const newName = `${prefix}${brand}${suffix}`;
      const partKey = `${partType.category}-${newName}`;

      if (!usedParts.has(partKey)) {
        newParts.push({
          id: `part_${Date.now()}_${newParts.length}`,
          name: newName,
          category: partType.category,
          brand: brand,
          model: this.generateCompatibleModel(brand),
          part_number: this.generatePartNumber(brand, partType.category),
          unit: '个',
          description: `${newName}，适用于${brand}设备`,
          stock_quantity: Math.floor(50 + Math.random() * 200),
          min_stock: Math.floor(10 + Math.random() * 30),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        usedParts.add(partKey);
      }
    }

    console.log(`✅ 生成了 ${newParts.length} 个新配件`);
    return newParts;
  }

  /**
   * 生成兼容型号
   */
  generateCompatibleModel(brand) {
    const brandDevices = this.existingData.devices.filter(
      d => d.brand === brand
    );
    if (brandDevices.length > 0) {
      return brandDevices[Math.floor(Math.random() * brandDevices.length)]
        .model;
    }
    return '通用型号';
  }

  /**
   * 生成配件编号
   */
  generatePartNumber(brand, category) {
    const brandCode = brand.substring(0, 3).toUpperCase();
    const categoryCode = category.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${brandCode}-${categoryCode}-${randomNumber}`;
  }

  /**
   * 导出生成的数据
   */
  exportData(devices, faults, parts) {
    console.log('\n💾 导出生成的数据...');

    const exportData = {
      devices: devices,
      fault_types: faults,
      parts: parts,
      generated_at: new Date().toISOString(),
      statistics: {
        devices: devices.length,
        fault_types: faults.length,
        parts: parts.length,
      },
    };

    const outputPath = path.join(
      __dirname,
      '../data/generated-data-augmentation.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ 数据已导出到: ${outputPath}`);

    return exportData;
  }

  /**
   * 获取样本设备数据
   */
  getSampleDevices() {
    return [
      {
        id: '1',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        category: '手机',
        release_year: 2023,
      },
      {
        id: '2',
        brand: '华为',
        model: 'Mate 60 Pro',
        category: '手机',
        release_year: 2023,
      },
      {
        id: '3',
        brand: '小米',
        model: '14 Pro',
        category: '手机',
        release_year: 2023,
      },
      {
        id: '4',
        brand: 'OPPO',
        model: 'Find X7 Pro',
        category: '手机',
        release_year: 2024,
      },
      {
        id: '5',
        brand: 'vivo',
        model: 'X100 Pro',
        category: '手机',
        release_year: 2024,
      },
    ];
  }

  /**
   * 获取样本故障类型
   */
  getSampleFaultTypes() {
    return [
      { id: '1', name: '屏幕碎裂', category: '屏幕' },
      { id: '2', name: '电池不充电', category: '电池' },
      { id: '3', name: '摄像头无法对焦', category: '摄像头' },
      { id: '4', name: '系统卡顿', category: '系统' },
      { id: '5', name: 'WiFi连接失败', category: '网络' },
    ];
  }

  /**
   * 获取样本配件数据
   */
  getSampleParts() {
    return [
      { id: '1', name: '原装屏幕总成', category: '屏幕', brand: 'Apple' },
      { id: '2', name: '高容量电池', category: '电池', brand: '华为' },
      { id: '3', name: '高清摄像头模组', category: '摄像头', brand: '小米' },
      { id: '4', name: '硅胶保护壳', category: '外壳', brand: 'OPPO' },
    ];
  }

  /**
   * 获取样本维修店铺
   */
  getSampleRepairShops() {
    return [
      { id: '1', name: '官方售后服务中心', city: '北京' },
      { id: '2', name: '授权维修点', city: '上海' },
    ];
  }

  /**
   * 运行完整的数据增强流程
   */
  async runFullAugmentation() {
    console.log('🚀 开始智能数据增强流程\n');

    await this.loadData();

    // 生成各类数据
    const newDevices = this.generateDeviceModels(200);
    const newFaults = this.generateFaultTypes(80);
    const newParts = this.generateParts(150);

    // 导出数据
    const exportedData = this.exportData(newDevices, newFaults, newParts);

    console.log('\n📊 增强结果统计:');
    console.log(`   新增设备型号: ${exportedData.statistics.devices} 条`);
    console.log(`   新增故障类型: ${exportedData.statistics.fault_types} 条`);
    console.log(`   新增配件数据: ${exportedData.statistics.parts} 条`);
    console.log(
      `   总计新增数据: ${Object.values(exportedData.statistics).reduce((a, b) => a + b, 0)} 条`
    );

    console.log('\n🎉 智能数据增强完成！');
    return exportedData;
  }
}

// 执行数据增强
async function main() {
  const augmenter = new SmartDataAugmenter();
  try {
    await augmenter.runFullAugmentation();
  } catch (error) {
    console.error('❌ 数据增强过程中发生错误:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SmartDataAugmenter };
