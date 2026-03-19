const fs = require('fs');

// 读取文件为Buffer
const buffer = fs.readFileSync('src/app/scan/[id]/page.tsx');
let content = buffer.toString('utf8');

// 直接替换这些模式
const lines = content.split('\n');

// 修复每行
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // 检测并修复: err instanceof Error  err.message
  if (line.includes('err instanceof Error  err.message')) {
    console.log(`Found on line ${i + 1}: ${line.substring(0, 50)}...`);
    lines[i] = line.replace('err instanceof Error  err.message', 'err instanceof Error ? err.message');
    console.log(`Fixed to: ${lines[i].substring(0, 50)}...`);
  }

  // 检测并修复: detectedDevice  (
  if (line.includes('detectedDevice  (') || line.includes('detectedDevice  ? (')) {
    console.log(`Found detectedDevice on line ${i + 1}`);
    lines[i] = line.replace('detectedDevice  (', 'detectedDevice ? (');
    lines[i] = lines[i].replace('detectedDevice  ? (', 'detectedDevice ? (');
  }

  // 检测并修复: profileLoading  (
  if (line.includes('profileLoading  (')) {
    console.log(`Found profileLoading on line ${i + 1}`);
    lines[i] = line.replace('profileLoading  (', 'profileLoading ? (');
  }

  // 检测并修复: error  (
  if (line.includes('} : error  (')) {
    console.log(`Found error on line ${i + 1}`);
    lines[i] = line.replace('error  (', 'error ? (');
  }

  // 检测并修复: deviceProfile  (
  if (line.includes('deviceProfile  (')) {
    console.log(`Found deviceProfile on line ${i + 1}`);
    lines[i] = line.replace('deviceProfile  (', 'deviceProfile ? (');
  }

  // 修复其他三元运算符
  if (line.includes("'Apple") && line.includes('  \'🍎\'')) {
    console.log(`Found Apple emoji on line ${i + 1}`);
    lines[i] = line.replace('  \'🍎\'', '  ? \'🍎\'');
  }
  if (line.includes('Samsung') && line.includes('  \'📱\'')) {
    lines[i] = line.replace('  \'📱\'', '  ? \'📱\'');
  }
  if (line.includes('computer') && line.includes('  \'💻\'')) {
    lines[i] = line.replace('  \'💻\'', '  ? \'💻\'');
  }
}

content = lines.join('\n');

// 其他修复
content = content.replace(/getCurrentLanguageManuals\(\)\\\.length/g, 'getCurrentLanguageManuals().length');
content = content.replace('profileqrcodeId=', 'profile?qrcodeId=');
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
console.log('Fixed all ternary operators and null checks');
