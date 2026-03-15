const fs = require('fs');

const filePath = './src/app/foreign-trade/company/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');
console.log('开始精确修复 11 处三元运算符错误...\n');

const fixes = [];

// 1. 第 259-261 行：业务模式标题
const before1 = content.match(/=== 'importer'\s+'进口商业务模式'/g);
if (before1) {
  content = content.replace(
    /=== 'importer'\s+'进口商业务模式'/g,
    "=== 'importer' ? '进口商业务模式'"
  );
  fixes.push('第 259-261 行：业务模式标题');
}

// 2. 第 264-266 行：描述文本
const before2 = content.match(/=== 'importer'\s+'采购订单管理'/g);
if (before2) {
  content = content.replace(
    /=== 'importer'\s+'采购订单管理'/g,
    "=== 'importer' ? '采购订单管理'"
  );
  fixes.push('第 264-266 行：描述文本');
}

// 3. 第 270 行：Badge variant 属性
const before3 = content.match(/variant=\{activeRole === 'importer'\s+'default'\s+:\s+'secondary'\}/g);
if (before3) {
  content = content.replace(
    /variant=\{activeRole === 'importer'\s+'default'\s+:\s+'secondary'\}/g,
    "variant={activeRole === 'importer' ? 'default' : 'secondary'}"
  );
  fixes.push('第 270 行：Badge variant 属性');
}

// 4. 第 272 行：Badge 内容文本
const before4 = content.match(/activeRole === 'importer'\s+'采购订单'\s+:\s+'销售订单'/g);
if (before4) {
  content = content.replace(
    /activeRole === 'importer'\s+'采购订单'\s+:\s+'销售订单'/g,
    "activeRole === 'importer' ? '采购订单' : '销售订单'"
  );
  fixes.push('第 272 行：Badge 内容文本');
}

// 5. 第 306 行：统计卡片标题
const before5 = content.match(/activeRole === 'importer'\s+'采购订单'/g);
if (before5) {
  content = content.replace(
    /activeRole === 'importer'\s+'采购订单'/g,
    "activeRole === 'importer' ? '采购订单'"
  );
  fixes.push('第 306 行：统计卡片标题');
}

// 6. 第 309-311 行：统计卡片数值
const before6 = content.match(/activeRole === 'importer'\s+importOrders\s+:\s+exportOrders/g);
if (before6) {
  content = content.replace(
    /activeRole === 'importer'\s+importOrders\s+:\s+exportOrders/g,
    "activeRole === 'importer' ? importOrders : exportOrders"
  );
  fixes.push('第 309-311 行：统计卡片数值');
}

// 7. 第 378-380 行：订单管理标题
const before7 = content.match(/activeRole === 'importer'\s+'采购订单管理'/g);
if (before7) {
  content = content.replace(
    /activeRole === 'importer'\s+'采购订单管理'/g,
    "activeRole === 'importer' ? '采购订单管理'"
  );
  fixes.push('第 378-380 行：订单管理标题');
}

// 8. 第 387-389 行：按钮文本
const before8 = content.match(/activeRole === 'importer'\s+'创建采购订单'\s+:\s+'创建销售订单'/g);
if (before8) {
  content = content.replace(
    /activeRole === 'importer'\s+'创建采购订单'\s+:\s+'创建销售订单'/g,
    "activeRole === 'importer' ? '创建采购订单' : '创建销售订单'"
  );
  fixes.push('第 387-389 行：按钮文本');
}

// 9. 第 393-395 行：卡片描述
const before9 = content.match(/activeRole === 'importer'\s+'查看和管理所有采购订单'\s+:\s+'查看和管理所有销售订单'/g);
if (before9) {
  content = content.replace(
    /activeRole === 'importer'\s+'查看和管理所有采购订单'\s+:\s+'查看和管理所有销售订单'/g,
    "activeRole === 'importer' ? '查看和管理所有采购订单' : '查看和管理所有销售订单'"
  );
  fixes.push('第 393-395 行：卡片描述');
}

// 10. 第 521-524 行：合作伙伴 Badge variant 属性
const before10 = content.match(/partner\.status === 'active'\s+'default'\s+:\s+'secondary'/g);
if (before10) {
  content = content.replace(
    /partner\.status === 'active'\s+'default'\s+:\s+'secondary'/g,
    "partner.status === 'active' ? 'default' : 'secondary'"
  );
  fixes.push('第 521-524 行：合作伙伴 Badge variant 属性');
}

// 11. 第 526 行：合作伙伴 Badge 内容文本
const before11 = content.match(/partner\.status === 'active'\s+'活跃'\s+:\s+'非活跃'/g);
if (before11) {
  content = content.replace(
    /partner\.status === 'active'\s+'活跃'\s+:\s+'非活跃'/g,
    "partner.status === 'active' ? '活跃' : '非活跃'"
  );
  fixes.push('第 526 行：合作伙伴 Badge 内容文本');
}

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('修复完成！');
console.log(`\n成功修复 ${fixes.length} 处错误：\n`);
fixes.forEach((fix, i) => {
  console.log(`✓ ${i + 1}. ${fix}`);
});
console.log(`\n预期所有 42 个错误都已解决！`);
