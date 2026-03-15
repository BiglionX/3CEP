const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/orders/tracking/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: const ? statusMap -> const statusMap
content = content.replace(/const\s+\?\s+(\w+)\s*:/g, 'const $1:');

// 修复2: flex flex-col ? sm :flex-row -> flex flex-col sm:flex-row
content = content.replace(/flex\s+flex-(row|col)\s+\?\s+sm\s+:(flex-(row|col))/g, 'flex flex-$1 sm:$2');

// 修复3: {loading  ( -> {loading ? (
content = content.replace(/\{loading\s+\(/g, '{loading ? (');

// 修复4: {trackingInfo  ( -> {trackingInfo ? (
content = content.replace(/\{trackingInfo\s+\(/g, '{trackingInfo ? (');

// 修复5: statusFilter === 'completed'\n         event.isCompleted\n        : !event.isCompleted; -> statusFilter === 'completed'\n        ? event.isCompleted\n        : !event.isCompleted;
content = content.replace(
  /statusFilter === 'completed'\s+event\.isCompleted\s+: !event\.isCompleted;/g,
  "statusFilter === 'completed'\n        ? event.isCompleted\n        : !event.isCompleted;"
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 orders/tracking/page.tsx v2');
