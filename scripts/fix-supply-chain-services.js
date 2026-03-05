/**
 * 批量修复供应链服务模块的语法错误
 */

const fs = require('fs');
const path = require('path');

// 供应链服务文件列表
const supplyChainFiles = [
  'src/modules/supply-chain/services/demand-forecast.service.ts',
  'src/modules/supply-chain/services/fcx-smart-recommender.service.ts',
  'src/modules/supply-chain/services/inbound-forecast.service.ts',
  'src/modules/supply-chain/services/inventory.service.ts',
  'src/modules/supply-chain/services/logistics-tracking.service.ts',
  'src/modules/supply-chain/services/recommendation.service.ts',
  'src/modules/supply-chain/services/replenishment-advisor.service.ts',
  'src/modules/supply-chain/services/warehouse-dashboard.service.ts',
  'src/modules/supply-chain/services/warehouse-optimization.service.ts',
  'src/modules/supply-chain/services/warehouse.service.ts',
];

// 常见损坏模式
const damagePatterns = {
  // 单字损坏
  '信？': '信息',
  '数？': '数据',
  '结？': '结果',
  '处？': '处理',
  '状？': '状态',
  '配？': '配置',
  '服？': '服务',
  '问？': '问题',
  '现？': '现象',
  '原？': '原因',
  '建？': '建议',
  '检？': '检查',
  '验？': '验证',
  '测？': '测试',
  '诊？': '诊断',
  '维？': '维修',
  '故？': '故障',
  '设？': '设备',
  '产？': '产品',
  '用？': '用户',
  '系？': '系统',
  '模？': '模块',
  '接？': '接口',
  '请？': '请求',
  '响？': '响应',
  '错？': '错误',
  '异？': '异常',
  '日？': '日志',
  '时？': '时间',
  '名？': '名称',
  '类？': '类型',
  '内？': '内容',
  '格？': '格式',
  '版？': '版本',
  '描？': '描述',
  '详？': '详情',
  '联？': '联系',
  '售？': '售后',
  '确？': '确认',
  '分？': '分析',
  '评？': '评估',
  '优？': '优化',
  '设？': '设置',
  '调？': '调整',
  '更？': '更新',
  '升？': '升级',
  '加？': '加速',
  '提？': '提高',
  '降？': '降低',
  '增？': '增加',
  '减？': '减少',
  '最？': '最大/最小',
  '平？': '平均',
  '当？': '当前',
  '历？': '历史',
  '未？': '未来',
  '过？': '过去',
  '现？': '现在',
  '实？': '实时',
  '定？': '定时',
  '周？': '周期',
  '频？': '频率',
  '间？': '间隔',
  '持？': '持续',
  '暂？': '暂时',
  '永？': '永久',
  '临？': '临时',
  '长？': '长期',
  '短？': '短期',
  '中？': '中期',
  '在？': '在线',
  '离？': '离线',
  '本？': '本地',
  '远？': '远程',
  '云？': '云端',
  
  // 词语损坏
  '运行？': '运行',
  '启动？': '启动',
  '停止？': '停止',
  '暂停？': '暂停',
  '继续？': '继续',
  '取消？': '取消',
  '完成？': '完成',
  '失败？': '失败',
  '成功？': '成功',
  '无效？': '无效',
  '有效？': '有效',
  '可用？': '可用',
  '不可用？': '不可用',
  '存在？': '存在',
  '不存在？': '不存在',
  '正确？': '正确',
  '损坏？': '损坏',
  '丢失？': '丢失',
  '重复？': '重复',
  '唯一？': '唯一',
  '随机？': '随机',
  '默认？': '默认',
  '自定义？': '自定义',
  '自动？': '自动',
  '手动？': '手动',
  '批量？': '批量',
  '单个？': '单个',
  '全部？': '全部',
  '部分？': '部分',
  '剩余？': '剩余',
  '总计？': '总计',
  '合计？': '合计',
  '统计？': '统计',
  '汇总？': '汇总',
  '详细？': '详细',
  '简单？': '简单',
  '高级？': '高级',
  '基础？': '基础',
  '核心？': '核心',
  '扩展？': '扩展',
  '插件？': '插件',
  '依赖？': '依赖',
  '环境？': '环境',
  '安装？': '安装',
  '卸载？': '卸载',
  '清理？': '清理',
  '优化？': '优化',
};

function fixContent(content) {
  let fixed = content;
  let count = 0;

  // 替换损坏的中文
  Object.entries(damagePatterns).forEach(([damaged, correct]) => {
    const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
    const matches = content.match(regex);
    if (matches) {
      fixed = fixed.replace(regex, correct);
      count += matches.length;
    }
  });

  // 修复常见的字符串未终止问题
  const stringFixes = [
    [/请稍后再？;/g, "'请稍后再试';"],
    [/无法开？/g, '无法开机'],
    [/电池耗电？/g, '电池耗电快'],
    [/屏幕闪？/g, '屏幕闪烁'],
    [/物理损？/g, '物理损坏'],
    [/音量设？/g, '音量设置'],
    [/扬声？/g, '扬声器'],
    [/灰？/g, '灰尘'],
    [/恢复出厂设？/g, '恢复出厂设置'],
  ];

  stringFixes.forEach(([regex, replacement]) => {
    fixed = fixed.replace(regex, replacement);
  });

  return { fixed, count };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { fixed, count } = fixContent(content);

    if (count > 0) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ ${filePath}: 修复了 ${count} 处损坏`);
      return true;
    } else {
      console.log(`⚠️  ${filePath}: 无需修复`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${filePath}: 读取失败 - ${error.message}`);
    return false;
  }
}

console.log('🔧 开始修复供应链服务模块...\n');

let totalFixed = 0;
supplyChainFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (processFile(fullPath)) {
    totalFixed++;
  }
});

console.log(`\n✅ 完成！共修复 ${totalFixed} 个文件`);
console.log('\n📝 提示：请运行 npx tsc --noEmit 验证修复效果');
