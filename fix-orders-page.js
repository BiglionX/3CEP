const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/orders/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: filteredOrders.length === 0  ( -> filteredOrders.length === 0 ? (
content = content.replace(/filteredOrders\.length === 0\s+\(/g, 'filteredOrders.length === 0 ? (');

// 修复2: 三元运算符的缩进问题
content = content.replace(
  /priorityFilter !== 'all'\s+'没有找到匹配的订单'\s+: '开始创建第一个订单吧'/g,
  "priorityFilter !== 'all'\n                        ? '没有找到匹配的订单'\n                        : '开始创建第一个订单吧'"
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 orders/page.tsx');
