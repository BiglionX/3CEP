#!/usr/bin/env node

/**
 * TypeScript错误自动修复脚本
 * 修复常见的Supabase类型推断和导入路径问题
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const targetFiles = [
  'src/lib/auth-service.ts',
  'src/lib/admin-user-service.ts', 
  'src/tech/api/services/market-data.service.ts',
  'src/tech/api/services/manual-upload.service.ts'
];

// 常见错误模式和修复方案
const fixPatterns = [
  {
    // Supabase insert类型推断错误
    pattern: /\.insert\(\{[\s\S]*?\}\)/g,
    replacement: (match) => {
      if (!match.includes('as any') && !match.includes('as const')) {
        return match.replace(/\}(?=\)$)/, '} as any');
      }
      return match;
    }
  },
  {
    // 导入路径错误修复
    pattern: /from\s+'\.\/e2e-config'/g,
    replacement: "from '../tests/e2e-config'"
  },
  {
    // 类型不匹配修复
    pattern: /\|\s*undefined/g,
    replacement: (match, offset, string) => {
      // 只在特定上下文中替换
      if (string.substring(offset-20, offset).includes('null')) {
        return '| null | undefined';
      }
      return match;
    }
  }
];

function fixFile(filePath) {
  console.log(`🔧 正在修复文件: ${filePath}`);
  
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    let fixesApplied = 0;
    
    // 应用所有修复模式
    fixPatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixesApplied += matches.length;
      }
    });
    
    // 如果有修改，保存文件
    if (content !== originalContent) {
      // 创建备份
      const backupPath = fullPath + '.backup';
      fs.writeFileSync(backupPath, originalContent);
      console.log(`💾 已创建备份: ${backupPath}`);
      
      // 保存修复后的文件
      fs.writeFileSync(fullPath, content);
      console.log(`✅ 已应用 ${fixesApplied} 个修复`);
      return true;
    } else {
      console.log('ℹ️  文件无需修复');
      return false;
    }
    
  } catch (error) {
    console.error(`❌ 修复文件失败 ${filePath}:`, error.message);
    return false;
  }
}

function createTypeDeclarations() {
  console.log('🔧 创建TypeScript类型声明文件...');
  
  const typeDeclaration = `
// Supabase类型增强声明
declare module '*.svg' {
  const content: string;
  export default content;
}

// Supabase PostgREST类型修复
interface SupabaseInsertOptions {
  returning?: 'minimal' | 'representation';
  count?: 'exact' | 'planned' | 'estimated';
}

// 市场价格数据接口
interface MarketPrice {
  id?: string;
  device_model: string;
  avg_price?: number;
  min_price?: number;
  max_price?: number;
  median_price?: number;
  sample_count: number;
  source: 'xianyu' | '闲鱼' | 'aggregate';
  freshness_score: number;
  created_at?: string;
}

// 手册版本接口
interface ManualVersion {
  id?: string;
  manual_id: string;
  version: number;
  title: Record<string, string>;
  content: Record<string, string>;
  changes: string;
  created_at?: string;
}
`;

  const typesDir = path.join(process.cwd(), 'src/types');
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  const declarationPath = path.join(typesDir, 'supabase.d.ts');
  fs.writeFileSync(declarationPath, typeDeclaration);
  console.log(`✅ 类型声明文件已创建: ${declarationPath}`);
}

function main() {
  console.log('🚀 开始TypeScript错误自动修复...\n');
  
  // 创建类型声明文件
  createTypeDeclarations();
  
  // 修复目标文件
  let fixedCount = 0;
  targetFiles.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n📊 修复完成统计:`);
  console.log(`✅ 成功修复文件: ${fixedCount}/${targetFiles.length}`);
  console.log(`⚠️  建议手动检查备份文件`);
  
  console.log('\n🧪 建议后续验证命令:');
  console.log('npx tsc --noEmit  # 验证TypeScript编译');
  console.log('npm run lint     # 验证代码规范');
  console.log('npm run dev      # 验证应用运行');
}

// 执行修复
if (require.main === module) {
  main();
}

module.exports = { fixFile, createTypeDeclarations };