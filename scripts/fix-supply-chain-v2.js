/**
 * 批量修复供应链服务中的中文乱码和语法错误
 */

const fs = require('fs');

// 修复 recommendation.service.ts
function fixRecommendationService() {
  const filePath = 'src/modules/supply-chain/services/recommendation.service.ts';
  let content = fs.readFileSync(filePath, 'utf8');

  // 修复文件头部
  content = content.replace(
    /核心功？/g,
    '核心功能'
  );

  // 修复注释与代码混合的问题
  content = content.replace(
    /(\/\/ .*) 获取所有活跃仓？\s+(const warehouses)/g,
    '$1\n      $2'
  );
  
  content = content.replace(
    /(\/\/ .*) 计算距离和配送时？\s+(const recommendations)/g,
    '$1\n      $2'
  );
  
  content = content.replace(
    /(\/\/ .*) 获取产品库存和价格信？\s+(const productInfo)/g,
    '$1\n          $2'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 已修复：${filePath}`);
}

// 修复其他供应链服务
function fixOtherSupplyChainServices() {
  const files = [
    'src/modules/supply-chain/services/demand-forecast.service.ts',
    'src/modules/supply-chain/services/inventory.service.ts',
    'src/modules/supply-chain/services/logistics-tracking.service.ts',
    'src/modules/supply-chain/services/replenishment-advisor.service.ts',
    'src/modules/supply-chain/services/warehouse-optimization.service.ts',
    'src/modules/supply-chain/services/warehouse.service.ts',
  ];

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 通用修复规则
      const patterns = {
        '预？': '预测',
        '需？': '需求',
        '库？': '库存',
        '物？': '物流',
        '补？': '补货',
        '仓？': '仓库',
        '优？': '优化',
        '建？': '建议',
        '策？': '策略',
        '规？': '规则',
        '模？': '模型',
        '算？': '算法',
        '参？': '参数',
        '置？': '配置',
        '环？': '环境',
        '响？': '响应',
        '请？': '请求',
        '处？': '处理',
        '状？': '状态',
        '态？': '态度',
        '势？': '趋势',
        '存？': '存储',
        '货？': '货物',
        '单？': '单位',
        '订？': '订单',
        '供？': '供应',
        '应？': '应该',
        '配？': '配送',
        '达？': '到达',
        '时？': '时间',
        '距？': '距离',
        '评？': '评分',
        '分？': '分析',
        '计？': '计算',
        '统？': '统计',
        '汇？': '汇总',
        '报？': '报告',
        '表？': '表格',
        '示？': '示例',
        '例？': '例如',
        '如？': '如果',
        '果？': '结果',
      };

      Object.entries(patterns).forEach(([damaged, correct]) => {
        const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, correct);
        }
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复：${filePath}`);
    }
  });
}

console.log('🔧 开始修复供应链服务...\n');
fixRecommendationService();
fixOtherSupplyChainServices();
console.log('\n✅ 供应链服务修复完成！');
