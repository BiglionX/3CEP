/**
 * 批量修复所有 React 组件的中文乱码
 */

const fs = require('fs');
const path = require('path');

// 扫描 src/components 下的所有 tsx 文件
const componentsDir = 'src/components';

// 常见损坏模式
const damagePatterns = {
  // 单字损坏
  '状？': '状态',
  '已登录状？': '已登录状态',
  '技术支？': '技术支持',
  '网站地？': '网站地图',
  '用户中？': '用户中心',
  '消息中？': '消息中心',
  '系统设？': '系统设置',
  '退出登？': '退出登录',
  '管理后？': '管理后台',
  '个？': '个人',
  '账？': '账户',
  '订？': '订单',
  '收？': '收藏',
  '足？': '足迹',
  '安？': '安全',
  '隐？': '隐私',
  '版？': '版本',
  '权？': '权限',
  '工？': '工作',
  '任？': '任务',
  '报？': '报告',
  '统？': '统计',
  '分？': '分析',
  '设？': '设置',
  '配？': '配置',
  '环？': '环境',
  '响？': '响应',
  '请？': '请求',
  '处？': '处理',
  '检？': '检查',
  '拦？': '拦截',
  '阻？': '阻止',
  '错？': '错误',
  '误？': '误会',
  '径？': '路径',
  '录？': '记录',
  '志？': '日志',
  '频？': '频率',
  '制？': '制度',
  '拒？': '拒绝',
  '置？': '配置',
  '态？': '态度',
  '势？': '趋势',
  '存？': '存储',
  '取？': '获取',
  '得？': '得到',
  '到？': '到达',
  '时？': '时间',
  '间？': '间隔',
  '限？': '限制',
  '工作？': '工作日',
  '科技园？': '科技园',
  '高新技术企？': '高新技术企业',
  '全球化服务网？': '全球化服务网络',
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // 替换所有损坏的中文
    Object.entries(damagePatterns).forEach(([damaged, correct]) => {
      const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
      content = content.replace(regex, correct);
    });
    
    // 如果内容有变化，保存文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复：${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

function scanDirectory(dir) {
  let fixedCount = 0;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

console.log('🔧 开始批量修复组件中文乱码...\n');
const totalFixed = scanDirectory(componentsDir);
console.log(`\n✅ 完成！共修复 ${totalFixed} 个文件`);
console.log('\n📝 提示：请重启开发服务器以应用修复');
