const fs = require('fs');

let content = fs.readFileSync('src/app/scan/[id]/page.tsx', 'utf8');

// 修复不换行空格 (U+00A0) 导致的三元运算符错误
content = content.replace(/(\w+)\s*\u00a0\s*\(/g, '$1 ? (');
content = content.replace(/\)\s*\u00a0\s*\(/g, ') ? (');
content = content.replace(/([\w\s]+)\s*\u00a0\s*'/g, '$1 ? \'');
content = content.replace(/([\w\s]+)\s*\u00a0\s*"/g, '$1 ? "');
content = content.replace(/\u00a0\s*\u00a0/g, ' : ');
content = content.replace(/\s*\u00a0\s*'/g, ' : \'');
content = content.replace(/\s*\u00a0\s*"/g, ' : "');

// 修复反斜杠转义字符
content = content.replace(/getCurrentLanguageManuals\(\)\\\.length/g, 'getCurrentLanguageManuals().length');

// 修复 API URL
content = content.replace('profileqrcodeId=', 'profile?qrcodeId=');

// 修复 product 为 null 的情况
content = content.replace('if (!product.manuals)', 'if (!product || !product.manuals)');

// 修复 detectedDevice 可能为 null 的访问
content = content.replace(/detectedDevice\.brand/g, 'detectedDevice?.brand');
content = content.replace(/detectedDevice\.model/g, 'detectedDevice?.model');
content = content.replace(/detectedDevice\.deviceType/g, 'detectedDevice?.deviceType');
content = content.replace(/detectedDevice\.confidence/g, 'detectedDevice?.confidence');

// 修复 deviceProfile 可能为 null 的访问
content = content.replace(/deviceProfile\.productModel/g, 'deviceProfile?.productModel');
content = content.replace(/deviceProfile\.brandName/g, 'deviceProfile?.brandName');
content = content.replace(/deviceProfile\.serialNumber/g, 'deviceProfile?.serialNumber');
content = content.replace(/deviceProfile\.manufacturingDate/g, 'deviceProfile?.manufacturingDate');
content = content.replace(/deviceProfile\.currentStatus/g, 'deviceProfile?.currentStatus');
content = content.replace(/deviceProfile\.firstActivatedAt/g, 'deviceProfile?.firstActivatedAt');
content = content.replace(/deviceProfile\.lastEventAt/g, 'deviceProfile?.lastEventAt');
content = content.replace(/deviceProfile\.currentLocation/g, 'deviceProfile?.currentLocation');
content = content.replace(/deviceProfile\.totalRepairCount/g, 'deviceProfile?.totalRepairCount');
content = content.replace(/deviceProfile\.totalPartReplacementCount/g, 'deviceProfile?.totalPartReplacementCount');
content = content.replace(/deviceProfile\.totalTransferCount/g, 'deviceProfile?.totalTransferCount');

fs.writeFileSync('src/app/scan/[id]/page.tsx', content, 'utf8');
console.log('Fixed ternary operators and null checks in src/app/scan/[id]/page.tsx');
