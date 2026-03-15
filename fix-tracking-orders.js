const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/orders/tracking/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: const ? mockTrackingData : Record<string, TrackingInfo> = { -> const mockTrackingData: Record<string, TrackingInfo> = {
content = content.replace(/const\s+\?\s+(\w+)\s+:\s+Record<string, \w+>\s*=/g, 'const $1: Record<string, any> =');

// 修复2: 日期时间中的 ? 和 :
content = content.replace(/'(\d{4}-\d{2}-\d{2})\s+\?\s+(\d{2})\s+:(\d{2})'/g, "'$1 $2:$3'");
content = content.replace(/'(\d{4}-\d{2}-\d{2})\s+\?\s+(\d{2})\s+:(\d{2}):(\d{2})'/g, "'$1 $2:$3:$4'");

// 修复3: 修复第270行左右的三元运算符问题
content = content.replace(/\s+\(\s+{/, ' ? {');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 orders/tracking/page.tsx');
