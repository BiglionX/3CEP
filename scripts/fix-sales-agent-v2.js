/**
 * 批量修复销售代理服务的语法错误
 */

const fs = require('fs');

// 修复销售代理服务文件
function fixSalesAgentServices() {
  const files = [
    'src/modules/sales-agent/services/contract.service.ts',
    'src/modules/sales-agent/services/customer.service.ts',
    'src/modules/sales-agent/services/order.service.ts',
    'src/modules/sales-agent/services/quotation.service.ts',
  ];

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 通用修复规则
      const patterns = {
        '合？': '合同',
        '客？': '客户',
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
        '交？': '交付',
        '易？': '交易',
        '贸？': '贸易',
        '谈？': '谈判',
        '签？': '签订',
        '署？': '签署',
        '批？': '批准',
        '审？': '审核',
        '核？': '核对',
        '验？': '验证',
        '确？': '确认',
        '认？': '认证',
        '证？': '证明',
        '明？': '明确',
        '细？': '详细',
        '节？': '细节',
        '条？': '条款',
        '款？': '款项',
        '项？': '项目',
        '目？': '目标',
        '标？': '标准',
        '质？': '质量',
        '数？': '数量',
        '总？': '总计',
        '计？': '计算',
        '统？': '统计',
        '汇？': '汇总',
        '分？': '分析',
        '报？': '报告',
        '表？': '表格',
        '单？': '单位',
        '清？': '清单',
        '列？': '列表',
        '索？': '索引',
        '引？': '引用',
        '参？': '参数',
        '考？': '参考',
        '模？': '模型',
        '板？': '模板',
        '例？': '示例',
        '策？': '策略',
        '规？': '规则',
        '流？': '流程',
        '程？': '程序',
        '序？': '序列',
        '步？': '步骤',
        '骤？': '骤然',
        '阶？': '阶段',
        '段？': '段落',
        '期？': '期限',
        '限？': '限制',
        '制？': '制度',
        '度？': '度过',
        '过？': '过程',
        '程？': '程序',
        '请？': '请求',
        '求？': '要求',
        '要？': '需要',
        '需？': '需求',
        '供？': '供应',
        '应？': '应该',
        '产？': '产品',
        '户？': '账户',
        '账？': '账号',
        '号？': '号码',
        '码？': '编码',
        '编？': '编辑',
        '辑？': '逻辑',
        '逻？': '逻辑',
        '判？': '判断',
        '断？': '断开',
        '开？': '开始',
        '始？': '始终',
        '终？': '终止',
        '止？': '停止',
        '停？': '停用',
        '用？': '用户',
        '服？': '服务',
        '务？': '任务',
        '任？': '任务',
        '责？': '责任',
        '权？': '权限',
        '限？': '限制',
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
    } else {
      console.log(`⚠️  文件不存在：${filePath}`);
    }
  });
}

console.log('🔧 开始修复销售代理服务...\n');
fixSalesAgentServices();
console.log('\n✅ 销售代理服务修复完成！');
