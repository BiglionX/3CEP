#!/usr/bin/env node

/**
 * 批量修复测试文件和类型文件中的 TypeScript 错误
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始批量修复剩余 TypeScript 错误...\n');

let totalFixes = 0;

// 需要修复的文件列表
const filesToProcess = [
  'src/__tests__/boundary-unit.test.tsx',
  'src/types/team-management.types.ts',
];

// 常见错误模式和修复方案
const fixPatterns = [
  // 测试文件中的损坏字符
  { pattern: /创？/g, replacement: '创建' },
  { pattern: /次点？/g, replacement: '次点击' },
  { pattern: /初？/g, replacement: '初始' },
  { pattern: /验？/g, replacement: '验证' },
  { pattern: /预？/g, replacement: '预期' },
  { pattern: /实？/g, replacement: '实际' },
  { pattern: /测？/g, replacement: '测试' },
  { pattern: /试？/g, replacement: '试验' },
  { pattern: /用？/g, replacement: '用户' },
  { pattern: /使？/g, replacement: '使用' },
  { pattern: /功？/g, replacement: '功能' },
  { pattern: /件？/g, replacement: '事件' },
  { pattern: /触？/g, replacement: '触发' },
  { pattern: /重？/g, replacement: '重复' },
  { pattern: /动？/g, replacement: '动作' },
  { pattern: /状？/g, replacement: '状态' },
  { pattern: /数？/g, replacement: '数据' },
  { pattern: /象？/g, replacement: '对象' },
  { pattern: /应？/g, replacement: '应该' },
  { pattern: /被？/g, replacement: '被' },
  { pattern: /调？/g, replacement: '调用' },
  { pattern: /返？/g, replacement: '返回' },
  { pattern: /回？/g, replacement: '回调' },
  { pattern: /更？/g, replacement: '更新' },
  { pattern: /删？/g, replacement: '删除' },
  { pattern: /添？/g, replacement: '添加' },
  { pattern: /查？/g, replacement: '查询' },
  { pattern: /增？/g, replacement: '增加' },
  { pattern: /设？/g, replacement: '设置' },
  { pattern: /获？/g, replacement: '获取' },
  { pattern: /处？/g, replacement: '处理' },
  { pattern: /发？/g, replacement: '发送' },
  { pattern: /接？/g, replacement: '接收' },
  { pattern: /请？/g, replacement: '请求' },
  { pattern: /响？/g, replacement: '响应' },
  { pattern: /成？/g, replacement: '成功' },
  { pattern: /失？/g, replacement: '失败' },
  { pattern: /错？/g, replacement: '错误' },
  { pattern: /常？/g, replacement: '异常' },
  { pattern: /告？/g, replacement: '警告' },
  { pattern: /提？/g, replacement: '提示' },
  { pattern: /示？/g, replacement: '显示' },
  { pattern: /隐？/g, replacement: '隐藏' },
  { pattern: /打？/g, replacement: '打开' },
  { pattern: /关？/g, replacement: '关闭' },
  { pattern: /切？/g, replacement: '切换' },
  { pattern: /选？/g, replacement: '选择' },
  { pattern: /确？/g, replacement: '确认' },
  { pattern: /取？/g, replacement: '取消' },
  { pattern: /提？/g, replacement: '提交' },
  { pattern: /保？/g, replacement: '保存' },
  { pattern: /编？/g, replacement: '编辑' },
  { pattern: /载？/g, replacement: '加载' },
  { pattern: /卸？/g, replacement: '卸载' },
  { pattern: /挂？/g, replacement: '挂载' },
  { pattern: /更？/g, replacement: '更新' },
  { pattern: /渲？/g, replacement: '渲染' },
  { pattern: /属？/g, replacement: '属性' },
  { pattern: /方？/g, replacement: '方法' },
  { pattern: /参？/g, replacement: '参数' },
  { pattern: /值？/g, replacement: '值' },
  { pattern: /类？/g, replacement: '类型' },
  { pattern: /型？/g, replacement: '模型' },
  { pattern: /式？/g, replacement: '模式' },
  { pattern: /格？/g, replacement: '格式' },
  { pattern: /风？/g, replacement: '风格' },
  { pattern: /样？/g, replacement: '样式' },
  { pattern: /布？/g, replacement: '布局' },
  { pattern: /组？/g, replacement: '组件' },
  { pattern: /页？/g, replacement: '页面' },
  { pattern: /路？/g, replacement: '路由' },
  { pattern: /链？/g, replacement: '链接' },
  { pattern: /跳？/g, replacement: '跳转' },
  { pattern: /导？/g, replacement: '导航' },
  { pattern: /菜？/g, replacement: '菜单' },
  { pattern: /按？/g, replacement: '按钮' },
  { pattern: /表？/g, replacement: '表单' },
  { pattern: /输？/g, replacement: '输入' },
  { pattern: /输？/g, replacement: '输出' },
  { pattern: /显？/g, replacement: '显示' },
  { pattern: /列？/g, replacement: '列表' },
  { pattern: /卡？/g, replacement: '卡片' },
  { pattern: /表？/g, replacement: '表格' },
  { pattern: /图？/g, replacement: '图表' },
  { pattern: /形？/g, replacement: '形状' },
  { pattern: /色？/g, replacement: '颜色' },
  { pattern: /字？/g, replacement: '字体' },
  { pattern: /文？/g, replacement: '文本' },
  { pattern: /图？/g, replacement: '图标' },
  { pattern: /像？/g, replacement: '图像' },
  { pattern: /视？/g, replacement: '视频' },
  { pattern: /音？/g, replacement: '音频' },
  { pattern: /媒？/g, replacement: '媒体' },
  { pattern: /资？/g, replacement: '资源' },
  { pattern: /文？/g, replacement: '文件' },
  { pattern: /夹？/g, replacement: '文件夹' },
  { pattern: /目？/g, replacement: '目录' },
  { pattern: /录？/g, replacement: '记录' },
  { pattern: /历？/g, replacement: '历史' },
  { pattern: /收？/g, replacement: '收藏' },
  { pattern: /喜？/g, replacement: '喜欢' },
  { pattern: /评？/g, replacement: '评论' },
  { pattern: /论？/g, replacement: '讨论' },
  { pattern: /消？/g, replacement: '消息' },
  { pattern: /通？/g, replacement: '通知' },
  { pattern: /系？/g, replacement: '系统' },
  { pattern: /置？/g, replacement: '设置' },
  { pattern: /配？/g, replacement: '配置' },
  { pattern: /选？/g, replacement: '选项' },
  { pattern: /项？/g, replacement: '项目' },
  { pattern: /任？/g, replacement: '任务' },
  { pattern: /计？/g, replacement: '计划' },
  { pattern: /略？/g, replacement: '策略' },
  { pattern: /案？/g, replacement: '方案' },
  { pattern: /例？/g, replacement: '案例' },
  { pattern: /模？/g, replacement: '模板' },
  { pattern: /版？/g, replacement: '版本' },
  { pattern: /本？/g, replacement: '本地' },
  { pattern: /地？/g, replacement: '地址' },
  { pattern: /源？/g, replacement: '来源' },
  { pattern: /目？/g, replacement: '目标' },
  { pattern: 'test-?', replacement: 'test-' },
];

// 处理单个文件
function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在：${filePath}`);
    return 0;
  }
  
  console.log(`📄 处理文件：${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;
  
  // 应用所有修复模式
  fixPatterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      content = content.replace(pattern, replacement);
      fileFixes += count;
      if (count > 0 && count < 10) {
        console.log(`   ✅ 修复模式 "${pattern}": ${count} 处`);
      }
    }
  });
  
  // 如果内容有变化，保存文件
  if (content !== originalContent) {
    // 创建备份
    const backupPath = fullPath + '.bak';
    fs.writeFileSync(backupPath, originalContent);
    
    // 保存修复后的内容
    fs.writeFileSync(fullPath, content);
    console.log(`   💾 已保存修复（备份：${path.basename(backupPath)}）\n`);
    totalFixes += fileFixes;
  } else {
    console.log(`   ✓ 无需修复\n`);
  }
  
  return fileFixes;
}

// 主函数
function main() {
  console.log('📋 待处理文件列表:');
  filesToProcess.forEach(file => console.log(`   - ${file}`));
  console.log('\n');
  
  // 处理每个文件
  filesToProcess.forEach(processFile);
  
  console.log('='.repeat(60));
  console.log(`📊 修复完成统计:`);
  console.log(`✅ 共修复：${totalFixes} 处`);
  console.log(`📁 处理文件：${filesToProcess.length} 个`);
  console.log('='.repeat(60));
  
  console.log('\n🧪 建议验证命令:');
  console.log('   npx tsc --noEmit  # 验证 TypeScript 编译');
  console.log('   npm run test     # 运行测试用例\n');
}

// 运行主函数
main();
