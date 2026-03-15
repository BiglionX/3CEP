const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/diagnosis/page.tsx');

console.log('修复 diagnosis/page.tsx...');

let content = fs.readFileSync(filePath, 'utf8');

// 1. 修复字符串截断问题
const fixes = [
  // 第42行
  ['keyword: "手机无法开 }', 'keyword: "手机无法开机"'],
  // 第57-58行
  ['const sendMessage = async (messageText: any: string) => {', 'const sendMessage = async (messageText?: string) => {'],
  // 第95行
  ['// 格式化诊断结果为易读的消', '// 格式化诊断结果为易读的消息'],
  // 第122行
  ['console.error("发送消息失", error);', 'console.error("发送消息失败", error);'],
  // 第127行
  ['content: "抱歉，诊断服务暂时不可用。请稍后再试或联系人工客服,', 'content: "抱歉，诊断服务暂时不可用。请稍后再试或联系人工客服",'],
  // 第148行
  ['window.confirm("确定要清空当前对话吗);', 'window.confirm("确定要清空当前对话吗？");'],
  // 第152和167行
  ['`/api/diagnosis/analyzesessionId=${sessionId}`', '`/api/diagnosis/analyze?sessionId=${sessionId}`'],
  // 第172行
  ['// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log("会话信息:", result.data)}', '// TODO: 移除调试日志 - console.log("会话信息:", result.data);'],
  // 第198行
  ['response += "🔧 **建议解决方案*\\n";', 'response += "🔧 **建议解决方案**\\n";'],
  // 第219行
  ['response += "📦 **可能需要的配件*\\n";', 'response += "📦 **可能需要的配件**\\n";'],
  // 第234-237行
  ['response += "📊 **总体预估*\\n";', 'response += "📊 **总体预估**\\n";'],
  ['`总费 ¥${diagnosisResult.estimatedTotalCost.min}-${diagnosisResult.estimatedTotalCost.max}\\n";', '`总费用: ¥${diagnosisResult.estimatedTotalCost.min}-${diagnosisResult.estimatedTotalCost.max}\\n";'],
  ['`诊断置信 ${diagnosisResult.confidenceLevel}\\n";', '`诊断置信度: ${diagnosisResult.confidenceLevel}\\n";'],
  // 第255行
  ['为您提供专业的设备故障诊断服', '为您提供专业的设备故障诊断服务'],
  // 第301行
  ['相关建议/h3>', '相关建议</h3>'],
  // 第334行
  ['message.role === "user"  "justify-end"', 'message.role === "user" ? "justify-end"'],
  // 第340行
  ['message.role === "user"\n                     "flex-row-reverse space-x-reverse"', 'message.role === "user"\n                    ? "flex-row-reverse space-x-reverse"'],
  // 第347行
  ['message.role === "user"\n                       "bg-blue-600 text-white"', 'message.role === "user"\n                    ? "bg-blue-600 text-white"'],
  // 第360行
  ['message.role === "user"\n                       "bg-blue-600 text-white"', 'message.role === "user"\n                    ? "bg-blue-600 text-white"'],
  // 第368行
  ['message.role === "user"\n                         "text-blue-200"', 'message.role === "user"\n                      ? "text-blue-200"'],
  // 第383行
  ['// 加载指示*/', '// 加载指示器 */'],
  // 第50行 - scrollIntoView
  ['messagesEndRef.scrollIntoView({ behavior: "smooth" });', 'messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });'],
];

let fixCount = 0;
fixes.forEach(([broken, fixed]) => {
  if (content.includes(broken)) {
    const count = (content.match(new RegExp(broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    content = content.replace(new RegExp(broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fixed);
    fixCount += count;
    console.log(`  ✓ 修复: ${broken.substring(0, 50)}...`);
  }
});

// 特殊处理：修复三元运算符的格式问题
const ternaryFixes = [
  // 修复所有的三元运算符格式
  [/(\w+)\s+([?:])\s*/g, '$1 $2'],
];

ternaryFixes.forEach(([regex, replacement]) => {
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, replacement);
    console.log(`  ✓ 修复三元运算符格式`);
  }
});

if (fixCount > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✓ 共修复 ${fixCount} 处错误`);
} else {
  console.log('\n- 未发现需要修复的错误');
}

console.log('\n修复完成!');
