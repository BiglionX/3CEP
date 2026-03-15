const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/logistics/tracking/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复: trackingInfo -> trackingInfo
content = content.replace(/trackingInfo(?=[^?\s])/g, 'trackingInfo');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 logistics/tracking/page.tsx - 移除多余的空格');
