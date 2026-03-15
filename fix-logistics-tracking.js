const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/logistics/tracking/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: const ? mockTrackingData : Record<string, TrackingInfo> = { -> const mockTrackingData: Record<string, TrackingInfo> = {
content = content.replace(/const\s+\?\s+(\w+)\s+:\s+Record<string, \w+>\s*=/g, 'const $1: Record<string, any> =');

// 修复2: 日期时间中的 ? 和 :
content = content.replace(/'(\d{4}-\d{2}-\d{2})\s+\?\s+(\d{2})\s+:(\d{2})'/g, "'$1 $2:$3'");
content = content.replace(/'(\d{4}-\d{2}-\d{2})\s+\?\s+(\d{2})\s+:(\d{2}):(\d{2})'/g, "'$1 $2:$3:$4'");

// 修复3: const ? statusMap -> const statusMap
content = content.replace(/const\s+\?\s+(\w+)\s*:/g, 'const $1:');

// 修复4: flex flex-col ? sm :flex-row -> flex flex-col sm:flex-row
content = content.replace(/flex\s+flex-(row|col)\s+\?\s+sm\s+:(flex-(row|col))/g, 'flex flex-$1 sm:$2');

// 修复5: {loading  ( -> {loading ? (
content = content.replace(/\{loading\s+\(/g, '{loading ? (');

// 修复6: {trackingInfo  ( -> {trackingInfo ? (
content = content.replace(/\{trackingInfo\s+\(/g, '{trackingInfo ? (');

// 修复7: trackingInfo.timeline -> trackingInfo?.timeline
content = content.replace(/trackingInfo\.timeline/g, 'trackingInfo?.timeline');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 logistics/tracking/page.tsx');
