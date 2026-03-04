const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复中文字符编码问题...\n');

let filesFixed = 0;
let totalReplacements = 0;

// 常见乱码字符映射表
const encodingFixes = [
  // 单个乱码字符
  { pattern: /创？/g, replacement: '创建' },
  { pattern: /失？/g, replacement: '失败' },
  { pattern: /功？/g, replacement: '成功' },
  { pattern: /用？/g, replacement: '用户' },
  { pattern: /电？/g, replacement: '电池' },
  { pattern: /屏？/g, replacement: '屏幕' },
  { pattern: /无？/g, replacement: '无法' },
  { pattern: /开？/g, replacement: '开机' },
  { pattern: /耗电？/g, replacement: '耗电量' },
  { pattern: /闪？/g, replacement: '闪烁' },
  { pattern: /诊断服？/g, replacement: '诊断服务' },
  { pattern: /暂时不可？/g, replacement: '暂时不可用' },
  { pattern: /请稍后重？/g, replacement: '请稍后重试' },
  { pattern: /连接成？/g, replacement: '连接成功' },
  { pattern: /向量数？/g, replacement: '向量数据库' },
  { pattern: /客户？/g, replacement: '客户端' },
  { pattern: /提供？/g, replacement: '提供商' },
  { pattern: /租？/g, replacement: '租户' },
  { pattern: /角色？/g, replacement: '角色' },
  { pattern: /状？/g, replacement: '状态' },
  { pattern: /操作？/g, replacement: '操作系统' },
  { pattern: /于？/g, replacement: '用于' },
  { pattern: /级？/g, replacement: '级别' },
  { pattern: /低？/g, replacement: '低级' },
  { pattern: /搜索操？/g, replacement: '搜索操作' },
  { pattern: /等？/g, replacement: '等于' },
  { pattern: /包含？/g, replacement: '包含' },
  { pattern: /开头？/g, replacement: '开头' },
  { pattern: /结尾？/g, replacement: '结尾' },
  { pattern: /大？/g, replacement: '大于' },
  { pattern: /删？/g, replacement: '删除' },
  { pattern: /执？/g, replacement: '执行' },
  { pattern: /调？/g, replacement: '调度' },
  { pattern: /智？/g, replacement: '智能体' },

  // 通用乱码替换 - 使用 Unicode 范围匹配所有中文字符后的乱码
  { pattern: /([\u4e00-\u9fa5])\ufffd/g, replacement: '$1' },
  { pattern: /\ufffd([\u4e00-\u9fa5])/g, replacement: '$1' },

  // 特定字符串替换
  { pattern: /草稿创？/g, replacement: '草稿创建' },
  {
    pattern: /我的第一个 FixCycle 智能？/g,
    replacement: '我的第一个 FixCycle 智能体',
  },
];

// 需要修复的文件类型
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// 扫描并修复文件
function scanAndFixDirectory(dirPath, depth = 0) {
  if (depth > 10) return; // 防止过深递归

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // 跳过 node_modules、.next、out、public、dist 等目录
    if (
      [
        'node_modules',
        '.next',
        'out',
        'public',
        'dist',
        'coverage',
        '.git',
      ].includes(entry.name)
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanAndFixDirectory(fullPath, depth + 1);
    } else if (
      entry.isFile() &&
      fileExtensions.includes(path.extname(entry.name))
    ) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileChanged = false;

    encodingFixes.forEach(({ pattern, replacement }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacement);
        fileChanged = true;
        totalReplacements += matches.length;
      }
    });

    if (fileChanged) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesFixed++;
      console.log(
        `✅ 已修复：${filePath} (${totalReplacements - filesFixed} 处)`
      );
    }
  } catch (error) {
    console.error(`❌ 处理失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log('📂 开始扫描 src 目录...\n');
  scanAndFixDirectory(path.join(__dirname, '..', 'src'));

  console.log('\n===================================');
  console.log('📊 修复总结:');
  console.log('===================================');
  console.log(`✅ 已修复文件数：${filesFixed}`);
  console.log(`✅ 总替换次数：${totalReplacements}`);
  console.log('===================================\n');

  if (filesFixed === 0) {
    console.log('✨ 未发现乱码字符，所有文件编码正常！\n');
  } else {
    console.log(
      '💡 建议：运行 `npx tsc --noEmit` 验证 TypeScript 错误是否减少\n'
    );
  }
}

// 执行
main();
