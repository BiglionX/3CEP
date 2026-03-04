#!/usr/bin/env node

/**
 * 故障案例智能生成器
 * 基于现有故障类型和设备数据生成高质量的故障案例
 */

const fs = require('fs');
const path = require('path');

class FaultCaseGenerator {
  constructor() {
    this.existingData = {
      devices: [],
      faultTypes: [],
      parts: [],
    };

    this.caseTemplates = {
      screen: [
        {
          scenario: '跌落导致屏幕损坏',
          symptoms: ['屏幕出现裂纹', '触摸无响应', '显示异常'],
          diagnosis: '通过外观检查确认屏幕物理损伤，触摸测试验证触控功能',
          solution: '更换原装屏幕总成，重新校准触控功能',
          difficulty: '中等',
          time_estimate: '2-3小时',
          cost_range: '800-1500元',
        },
        {
          scenario: '液体进入导致屏幕故障',
          symptoms: ['屏幕变色', '部分区域不显示', '触摸失灵'],
          diagnosis: '拆机检查主板和屏幕连接处是否有液体痕迹',
          solution: '清洁电路板，更换受潮的屏幕组件',
          difficulty: '困难',
          time_estimate: '3-4小时',
          cost_range: '1200-2000元',
        },
      ],
      battery: [
        {
          scenario: '电池老化导致续航问题',
          symptoms: ['续航时间明显缩短', '充电速度变慢', '发热严重'],
          diagnosis: '使用专业设备检测电池健康度和充放电曲线',
          solution: '更换全新原装电池，优化系统设置',
          difficulty: '简单',
          time_estimate: '1-2小时',
          cost_range: '300-600元',
        },
        {
          scenario: '充电接口损坏',
          symptoms: ['无法充电', '充电时断时续', '接口松动'],
          diagnosis: '检查充电接口物理损坏和内部线路连接',
          solution: '更换充电接口组件，重新焊接连接线路',
          difficulty: '中等',
          time_estimate: '1.5-2.5小时',
          cost_range: '200-400元',
        },
      ],
      camera: [
        {
          scenario: '摄像头模糊不清',
          symptoms: ['拍照模糊', '无法对焦', '画面有阴影'],
          diagnosis: '检查镜头清洁度和对焦马达工作状态',
          solution: '清洁镜头，校准对焦系统，必要时更换摄像头模组',
          difficulty: '中等',
          time_estimate: '1-2小时',
          cost_range: '500-1000元',
        },
      ],
      system: [
        {
          scenario: '系统运行卡顿',
          symptoms: ['应用启动慢', '切换界面卡顿', '后台应用频繁关闭'],
          diagnosis: '检查存储空间、内存使用情况和系统垃圾文件',
          solution: '清理存储空间，关闭不必要的后台应用，重置系统设置',
          difficulty: '简单',
          time_estimate: '0.5-1小时',
          cost_range: '免费-100元',
        },
      ],
    };
  }

  /**
   * 加载现有数据
   */
  async loadData() {
    console.log('📥 加载基础数据...');

    try {
      const dataPath = path.join(
        __dirname,
        '../data/quick-generated-data.json'
      );
      const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

      this.existingData = {
        devices: rawData.devices || [],
        faultTypes: rawData.fault_types || [],
        parts: rawData.parts || [],
      };

      console.log(`✅ 加载完成:`);
      console.log(`   - 设备型号: ${this.existingData.devices.length} 条`);
      console.log(`   - 故障类型: ${this.existingData.faultTypes.length} 条`);
      console.log(`   - 配件数据: ${this.existingData.parts.length} 条`);
    } catch (error) {
      console.error('❌ 数据加载失败:', error.message);
      // 使用默认样本数据
      this.useSampleData();
    }
  }

  /**
   * 使用样本数据
   */
  useSampleData() {
    console.log('⚠️ 使用样本数据...');

    this.existingData = {
      devices: [
        { brand: 'Apple', model: 'iPhone 15 Pro', category: '手机' },
        { brand: '华为', model: 'Mate 60 Pro', category: '手机' },
        { brand: '小米', model: '14 Pro', category: '手机' },
      ],
      faultTypes: [
        { name: '屏幕碎裂', category: '屏幕' },
        { name: '电池不充电', category: '电池' },
        { name: '摄像头模糊', category: '摄像头' },
        { name: '系统卡顿', category: '系统' },
      ],
      parts: [
        { name: '原装屏幕总成', category: '屏幕', brand: 'Apple' },
        { name: '高容量电池', category: '电池', brand: '华为' },
      ],
    };
  }

  /**
   * 生成故障案例
   */
  generateFaultCases(count = 50) {
    console.log(`\n📝 生成 ${count} 个故障案例...`);

    const cases = [];

    for (let i = 0; i < count; i++) {
      // 随机选择设备
      const device =
        this.existingData.devices[
          Math.floor(Math.random() * this.existingData.devices.length)
        ];

      // 随机选择故障类型
      const faultType =
        this.existingData.faultTypes[
          Math.floor(Math.random() * this.existingData.faultTypes.length)
        ];

      // 获取对应的案例模板
      const category = faultType.category.toLowerCase();
      const templates =
        this.caseTemplates[category] || this.getDefaultTemplates(category);

      if (templates.length > 0) {
        const template =
          templates[Math.floor(Math.random() * templates.length)];

        const faultCase = {
          id: `case_${Date.now()}_${i}`,
          device_brand: device.brand,
          device_model: device.model,
          fault_type: faultType.name,
          fault_category: faultType.category,
          scenario: template.scenario,
          symptoms: this.generateSymptoms(template.symptoms),
          diagnosis_steps: template.diagnosis,
          solution: template.solution,
          difficulty_level: this.convertDifficulty(template.difficulty),
          time_estimate: template.time_estimate,
          cost_estimate: template.cost_range,
          required_parts: this.getRequiredParts(
            faultType.category,
            device.brand
          ),
          tools_needed: this.getRequiredTools(template.difficulty),
          success_rate: this.calculateSuccessRate(template.difficulty),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        cases.push(faultCase);
      }
    }

    console.log(`✅ 生成了 ${cases.length} 个故障案例`);
    return cases;
  }

  /**
   * 生成症状描述
   */
  generateSymptoms(baseSymptoms) {
    const additionalSymptoms = [
      '设备无法正常开机',
      '出现异常声音',
      '按键反应迟钝',
      '连接不稳定',
      '功能部分失效',
    ];

    const symptomCount = 2 + Math.floor(Math.random() * 2); // 2-3个症状
    const symptoms = [...baseSymptoms];

    // 添加随机症状
    while (symptoms.length < symptomCount) {
      const randomSymptom =
        additionalSymptoms[
          Math.floor(Math.random() * additionalSymptoms.length)
        ];
      if (!symptoms.includes(randomSymptom)) {
        symptoms.push(randomSymptom);
      }
    }

    return symptoms;
  }

  /**
   * 获取默认模板
   */
  getDefaultTemplates(category) {
    return [
      {
        scenario: `${category}相关故障`,
        symptoms: [`设备${category}功能异常`, '使用体验下降'],
        diagnosis: `检查${category}相关硬件和软件状态`,
        solution: `根据诊断结果进行相应${category}维修`,
        difficulty: '中等',
        time_estimate: '1-2小时',
        cost_range: '200-800元',
      },
    ];
  }

  /**
   * 转换难度等级
   */
  convertDifficulty(difficulty) {
    const levels = { 简单: 1, 中等: 2, 困难: 3 };
    return levels[difficulty] || 2;
  }

  /**
   * 获取所需配件
   */
  getRequiredParts(category, brand) {
    const partMap = {
      屏幕: ['屏幕总成', '排线'],
      电池: ['电池', '充电接口'],
      摄像头: ['摄像头模组', '镜头'],
      系统: ['存储芯片', '主板'],
    };

    const baseParts = partMap[category] || ['相关配件'];
    return baseParts.map(part => `${brand}${part}`);
  }

  /**
   * 获取所需工具
   */
  getRequiredTools(difficulty) {
    const toolSets = {
      简单: ['螺丝刀套装', '撬棒', '清洁布'],
      中等: ['精密螺丝刀', '吸盘', '热风枪', '万用表'],
      困难: ['专业拆机工具', '显微镜', '焊接设备', '专业软件'],
    };

    return toolSets[difficulty] || toolSets['中等'];
  }

  /**
   * 计算成功率
   */
  calculateSuccessRate(difficulty) {
    const rates = { 简单: 95, 中等: 85, 困难: 70 };
    const baseRate = rates[difficulty] || 80;
    // 添加随机波动
    return Math.max(
      60,
      Math.min(98, baseRate + Math.floor(Math.random() * 10) - 5)
    );
  }

  /**
   * 导出故障案例数据
   */
  exportFaultCases(cases) {
    console.log('\n💾 导出故障案例数据...');

    const exportData = {
      fault_cases: cases,
      generated_at: new Date().toISOString(),
      statistics: {
        total_cases: cases.length,
        by_category: this.analyzeByCategory(cases),
        by_difficulty: this.analyzeByDifficulty(cases),
      },
    };

    const outputPath = path.join(
      __dirname,
      '../data/generated-fault-cases.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ 故障案例已导出到: ${outputPath}`);

    return exportData;
  }

  /**
   * 按分类分析
   */
  analyzeByCategory(cases) {
    const categoryStats = {};
    cases.forEach(caseItem => {
      const category = caseItem.fault_category;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    return categoryStats;
  }

  /**
   * 按难度分析
   */
  analyzeByDifficulty(cases) {
    const difficultyStats = { 简单: 0, 中等: 0, 困难: 0 };
    cases.forEach(caseItem => {
      const level =
        ['简单', '中等', '困难'][caseItem.difficulty_level - 1] || '中等';
      difficultyStats[level]++;
    });
    return difficultyStats;
  }

  /**
   * 显示生成结果
   */
  displayResults(cases) {
    console.log('\n📊 故障案例生成结果:');
    console.log(`   总计案例: ${cases.length} 个`);

    const categoryStats = this.analyzeByCategory(cases);
    console.log('\n   按故障分类:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`     ${category}: ${count} 个`);
    });

    const difficultyStats = this.analyzeByDifficulty(cases);
    console.log('\n   按难度等级:');
    Object.entries(difficultyStats).forEach(([level, count]) => {
      console.log(`     ${level}: ${count} 个`);
    });

    // 显示示例案例
    console.log('\n📋 示例案例:');
    cases.slice(0, 3).forEach((caseItem, index) => {
      console.log(
        `   ${index + 1}. ${caseItem.device_brand} ${caseItem.device_model} - ${caseItem.fault_type}`
      );
      console.log(
        `      难度: ${caseItem.difficulty_level}级 | 预估时间: ${caseItem.time_estimate}`
      );
      console.log(
        `      成功率: ${caseItem.success_rate}% | 费用: ${caseItem.cost_estimate}`
      );
    });
  }

  /**
   * 运行完整的故障案例生成流程
   */
  async runFullGeneration() {
    console.log('🚀 开始故障案例智能生成流程\n');

    await this.loadData();

    // 生成故障案例
    const faultCases = this.generateFaultCases(100);

    // 显示结果
    this.displayResults(faultCases);

    // 导出数据
    const exportedData = this.exportFaultCases(faultCases);

    console.log('\n🎉 故障案例智能生成完成！');
    return exportedData;
  }
}

// 执行故障案例生成
async function main() {
  const generator = new FaultCaseGenerator();
  try {
    await generator.runFullGeneration();
  } catch (error) {
    console.error('❌ 故障案例生成过程中发生错误:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { FaultCaseGenerator };
