const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/foreign-trade/company/logistics/shipping/page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 修复1: const ? mockShipments : Shipment[] = [ -> const mockShipments: Shipment[] = [
content = content.replace(/const\s+\?\s+mockShipments\s+:\s+Shipment\[\]\s*=/, 'const mockShipments: Shipment[] =');

// 修复2: 日期时间中的 ? 和 : (例如 '2026-02-25 ? 08 :00' -> '2026-02-25 08:00')
content = content.replace(/'(\d{4}-\d{2}-\d{2})\s+\?\s+(\d{2})\s+:(\d{2})'/g, "'$1 $2:$3'");
content = content.replace(/'(\d{4}-\d{2}-\d{2})\s+\?\s+(\d{2})\s+:(\d{2}):(\d{2})'/g, "'$1 $2:$3:$4'");

// 修复3: const ? colorMap : Record<string, string> = { -> const colorMap: Record<string, string> = {
content = content.replace(/const\s+\?\s+(\w+)\s+:\s+Record<[^>]+>\s*=/g, 'const $1: Record<string, any> =');

// 修复4: const ? textMap : Record<string, React.ReactNode> = { -> const textMap: Record<string, React.ReactNode> = {
content = content.replace(/const\s+\?\s+(\w+)\s+:\s+Record<string, React\.ReactNode>\s*=/g, 'const $1: Record<string, React.ReactNode> =');

// 修复5: flex flex-row ? sm :flex-row -> flex flex-col sm:flex-row
content = content.replace(/flex\s+flex-(row|col)\s+\?\s+sm\s+:(flex-(row|col))/g, 'flex flex-$1 sm:$2');

// 修复6: grid-cols-1 ? md :grid-cols-2 -> grid-cols-1 md:grid-cols-2
content = content.replace(/grid-cols-(\d+)\s+\?\s+(\w+)\s+:grid-cols-(\d+)/g, 'grid-cols-$1 $2:grid-cols-$3');

// 修复7: 三元运算符缺少 ? 和 :
content = content.replace(/filteredShipments\.length === 0\s+\(/, 'filteredShipments.length === 0 ? (');
content = content.replace(/statusFilter !== 'all'\s+\|\|\s+transportFilter !== 'all'\s+\|\|\s+carrierFilter !== 'all'\s+('没有找到匹配的发货记录')\s+:\s+('开始创建第一条发货记录吧')/g, "statusFilter !== 'all' ||\n                        transportFilter !== 'all' ||\n                        carrierFilter !== 'all'\n                        ? $1\n                        : $2");

// 修复8: 修复三元运算符的缩进问题
content = content.replace(/\s+\?\s+'没有找到匹配的发货记录'\s+:\s+'开始创建第一条发货记录吧'/g, "\n                        ? '没有找到匹配的发货记录'\n                        : '开始创建第一条发货记录吧'");

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 已修复 shipping/page.tsx');
console.log('修复内容:');
console.log('  1. const ? mockShipments -> const mockShipments');
console.log('  2. 日期时间中的 ? 和 :');
console.log('  3. const ? colorMap -> const colorMap');
console.log('  4. const ? textMap -> const textMap');
console.log('  5. flex flex-row ? sm :flex-row -> flex flex-row sm:flex-row');
console.log('  6. grid-cols-1 ? md :grid-cols-2 -> grid-cols-1 md:grid-cols-2');
console.log('  7. filteredShipments.length === 0 ( -> filteredShipments.length === 0 ? (');
console.log('  8. 三元运算符的缩进问题');
