const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/orders/tracking/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复: ) : trackingInfo  ( -> ) : trackingInfo ? (
content = content.replace(/\) : trackingInfo\s+\(/g, ') : trackingInfo ? (');

// 修复: ) :  ( -> ) : (
content = content.replace(/\) :\s+\(/g, ') : (');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 orders/tracking/page.tsx v3');
