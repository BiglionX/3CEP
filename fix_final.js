const fs = require('fs');

let content = fs.readFileSync('src/app/scan/[id]/page.tsx', 'utf8');

// 修复所有三元运算符中的  模式（两个空格，可能有特殊字符）
content = content.replace(/'Apple'\s+'🍎'/g, "'Apple'\n  ? '🍎'");
content = content.replace(/'Samsung'\s+'📱'/g, "'Samsung'\n  ? '📱'");
content = content.replace(/'computer'\s+'💻'/g, "'computer'\n  ? '💻'");

// 修复反斜杠
content = content.replace(/getCurrentLanguageManuals\(\)\\\.length/g, 'getCurrentLanguageManuals().length');

// 修复 API URL
content = content.replace('profileqrcodeId=', 'profile?qrcodeId=');

// 修复 product 为 null 的情况
content = content.replace('if (!product.manuals)', 'if (!product || !product.manuals)');

// 添加可选链到detectedDevice
content = content.replace(/detectedDevice\.brand(?!\?)/g, 'detectedDevice?.brand');
content = content.replace(/detectedDevice\.model(?!\?)/g, 'detectedDevice?.model');
content = content.replace(/detectedDevice\.deviceType(?!\?)/g, 'detectedDevice?.deviceType');
content = content.replace(/detectedDevice\.confidence(?!\?)/g, 'detectedDevice?.confidence');

// 修复中文三元运算符
content = content.replace(/currentLanguage === 'zh'\s+'bg-blue-500 text-white'/g, "currentLanguage === 'zh'\n  ? 'bg-blue-500 text-white'");
content = content.replace(/currentLanguage === 'en'\s+'bg-blue-500 text-white'/g, "currentLanguage === 'en'\n  ? 'bg-blue-500 text-white'");

content = content.replace(/getCurrentLanguageManuals\(\)\\.length > 0\s+\(/g, 'getCurrentLanguageManuals().length > 0 ? (');

content = content.replace(/detectedDevice &&\s+getCurrentLanguageManuals\(\)\\.length > 0\s+'bg-blue-500 hover:bg-blue-600 text-white'/g, "detectedDevice &&\n  getCurrentLanguageManuals().length > 0\n    ? 'bg-blue-500 hover:bg-blue-600 text-white'");

content = content.replace(/detectedDevice\s+getCurrentLanguageManuals\(\)\\.length > 0\s+'查看说明书'/g, "detectedDevice &&\n  getCurrentLanguageManuals().length > 0\n    ? '查看说明书'");
content = content.replace(/: '暂无说明书'\s*: '请先识别设备'/g, "  : detectedDevice\n    ? '暂无说明书'\n    : '请先识别设备'");

content = content.replace(/detectedDevice\s+'bg-green-500 hover:bg-green-600 text-white'/g, "detectedDevice\n  ? 'bg-green-500 hover:bg-green-600 text-white'");

fs.writeFileSync('src/app/scan/[id]/page.tsx', content, 'utf8');
console.log('Fixed remaining ternary operators');
