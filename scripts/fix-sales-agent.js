/**
 * 修复销售代理模块的语法错误
 */

const fs = require('fs');
const path = require('path');

const salesAgentFiles = [
  'src/modules/sales-agent/index.ts',
  'src/modules/sales-agent/services/contract.service.ts',
  'src/modules/sales-agent/services/customer.service.ts',
  'src/modules/sales-agent/services/order.service.ts',
  'src/modules/sales-agent/services/quotation.service.ts',
];

// 通用修复规则
function fixContent(content) {
  let fixed = content;
  let count = 0;

  // 常见损坏模式
  const patterns = {
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
    '客？': '客户',
    '合？': '合同',
    '订？': '订单',
    '报？': '报价',
    '销？': '销售',
    '商？': '商品',
    '价？': '价格',
    '金？': '金额',
    '支？': '支付',
    '收？': '收入',
    '成？': '成本',
    '利？': '利润',
    '税？': '税务',
    '发？': '发票',
    '运？': '运输',
    '物？': '物流',
    '库？': '库存',
    '仓？': '仓库',
    '货？': '货物',
    '采？': '采购',
    '供？': '供应',
    '应？': '应该',
    '需？': '需求',
    '求？': '要求',
    '标？': '标准',
    '质？': '质量',
    '数？': '数量',
    '单？': '单位',
    '总？': '总计',
    '计？': '计算',
    '统？': '统计',
    '汇？': '汇总',
    '分？': '分析',
    '报？': '报告',
    '表？': '表格',
    '图？': '图表',
    '模？': '模型',
    '算？': '算法',
    '策？': '策略',
    '规？': '规则',
    '流？': '流程',
    '程？': '程序',
    '序？': '序列',
    '列？': '列表',
    '表？': '表示',
    '示？': '示例',
    '例？': '例如',
    '如？': '如果',
    '果？': '结果',
    '则？': '规则',
    '判？': '判断',
    '断？': '断开',
    '开？': '开始',
    '始？': '始终',
    '终？': '终止',
    '止？': '停止',
    '停？': '停用',
    '用？': '用户',
    '户？': '账户',
    '账？': '账号',
    '号？': '号码',
    '码？': '编码',
    '编？': '编辑',
    '辑？': '逻辑',
    '逻？': '逻辑',
    '请？': '请求',
    '求？': '要求',
    '要？': '需要',
    '需？': '需求',
  };

  Object.entries(patterns).forEach(([damaged, correct]) => {
    const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
    const matches = content.match(regex);
    if (matches) {
      fixed = fixed.replace(regex, correct);
      count += matches.length;
    }
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

console.log('🔧 开始修复销售代理模块...\n');

let totalFixed = 0;
salesAgentFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (processFile(fullPath)) {
    totalFixed++;
  }
});

console.log(`\n✅ 完成！共修复 ${totalFixed} 个文件`);
