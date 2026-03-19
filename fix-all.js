const fs = require('fs');

let content = fs.readFileSync('src/app/scan/[id]/page.tsx', 'utf8');

// 查找所有 U+00A0 和类似字符并替换
content = content.replace(/(\w+)\s+[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+\s*\(/g, '$1 ? (');
content = content.replace(/\)\s+[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+\s*\(/g, ') ? (');
content = content.replace(/['\w\s]+\s+[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+\s+'/g, (match) => {
  return match.replace(/[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+/, " ? '");
});
content = content.replace(/[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+\s*["']/g, (match) => {
  return match.replace(/[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+/, " : ");
});
content = content.replace(/Error\s+[\u00A0\u200B\u200C\u200D\u2060\uFEFF]+\s+err/g, 'Error ? err');

// 修复反斜杠
content = content.replace(/getCurrentLanguageManuals\(\)\\\.length/g, 'getCurrentLanguageManuals().length');

// 修复 API URL
content = content.replace('profileqrcodeId=', 'profile?qrcodeId=');

// 修复 product 为 null 的情况
content = content.replace('if (!product.manuals)', 'if (!product || !product.manuals)');

// 添加可选链
content = content.replace(/detectedDevice\.brand(?!\?)/g, 'detectedDevice?.brand');
content = content.replace(/detectedDevice\.model(?!\?)/g, 'detectedDevice?.model');
content = content.replace(/detectedDevice\.deviceType(?!\?)/g, 'detectedDevice?.deviceType');
content = content.replace(/detectedDevice\.confidence(?!\?)/g, 'detectedDevice?.confidence');

content = content.replace(/deviceProfile\.productModel(?!\?)/g, 'deviceProfile?.productModel');
content = content.replace(/deviceProfile\.brandName(?!\?)/g, 'deviceProfile?.brandName');
content = content.replace(/deviceProfile\.serialNumber(?!\?)/g, 'deviceProfile?.serialNumber');
content = content.replace(/deviceProfile\.manufacturingDate(?!\?)/g, 'deviceProfile?.manufacturingDate');
content = content.replace(/deviceProfile\.currentStatus(?!\?)/g, 'deviceProfile?.currentStatus');
content = content.replace(/deviceProfile\.firstActivatedAt(?!\?)/g, 'deviceProfile?.firstActivatedAt');
content = content.replace(/deviceProfile\.lastEventAt(?!\?)/g, 'deviceProfile?.lastEventAt');
content = content.replace(/deviceProfile\.currentLocation(?!\?)/g, 'deviceProfile?.currentLocation');
content = content.replace(/deviceProfile\.totalRepairCount(?!\?)/g, 'deviceProfile?.totalRepairCount');
content = content.replace(/deviceProfile\.totalPartReplacementCount(?!\?)/g, 'deviceProfile?.totalPartReplacementCount');
content = content.replace(/deviceProfile\.totalTransferCount(?!\?)/g, 'deviceProfile?.totalTransferCount');

fs.writeFileSync('src/app/scan/[id]/page.tsx', content, 'utf8');
console.log('Fixed all issues');
