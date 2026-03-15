const fs = require('fs');
const path = require('path');

const files = [
  'src/app/foreign-trade/company/logistics/warehouse/page.tsx',
  'src/app/final-verification/page.tsx',
  'src/app/feedback/page.tsx',
  'src/app/fcx/page.tsx',
  'src/app/fcx/exchange/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/exporter/trading/page.tsx',
  'src/app/enterprise/workflow-automation/page.tsx',
  'src/app/admin/agents/page.tsx'
];

let totalFixes = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return;
  }
  
  console.log(`\n🔧 修复文件: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLength = content.length;
  
  // 修复模式列表（更激进）
  const patterns = [
    // 1. 修复 JSX 中的错误大括号和尖括号 - 更全面的模式
    {
      regex: /\{[^}]*'[^']*>'[^']*}[^{]*\{/g,
      replacement: (match) => {
        // 提取内部的标签名
        const tagMatch = match.match(/'[^']*>([^']*)'/);
        if (tagMatch) {
          return `<${tagMatch[1]}>`;
        }
        return match;
      },
      desc: 'JSX 大括号包裹的尖括号（v2）'
    },
    
    // 2. 修复 JSX 中的错误右大括号
    {
      regex: /\{[^}]*'[^'}]*}'[^']*}[^{]*\{/g,
      replacement: (match) => {
        const tagMatch = match.match(/'[^'}]*}'[^']*/);
        if (tagMatch) {
          return `}`;
        }
        return match;
      },
      desc: 'JSX 大括号包裹的右大括号（v2）'
    },
    
    // 3. 修复对象字面量中的中文注释导致的语法错误
    {
      regex: /(\w+):\s*\{[^}]*[\u4e00-\u9fa5]+[^}]*\}/g,
      replacement: (match, key) => {
        // 移除中文注释
        const cleaned = match.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        return cleaned;
      },
      desc: '对象字面量中的中文注释'
    },
    
    // 4. 修复函数定义中的语法错误
    {
      regex: /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g,
      replacement: (match, name, params, body) => {
        // 检查 body 是否有语法错误
        if (body.includes('$') && body.includes(' ')) {
          const cleaned = body.replace(/\$\s*/g, '');
          return `const ${name} = (${params}) => {${cleaned}}`;
        }
        return match;
      },
      desc: '函数定义中的语法错误'
    },
    
    // 5. 修复三元运算符（更精确的模式）
    {
      regex: /\b(\w+)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\b(?!.*\?)\s*(?=[,;})])/g,
      replacement: (match, condition, trueValue, falseValue) => {
        // 避免误伤对象字面量
        if (trueValue.includes(':') || falseValue.includes(':')) {
          return match;
        }
        return `${condition} ? ${trueValue} : ${falseValue}`;
      },
      desc: '三元运算符（v2）'
    },
    
    // 6. 修复 JSX 属性中的错误
    {
      regex: /(\w+)=\{\{[^}]*\}\}/g,
      replacement: (match, attr) => {
        const valueMatch = match.match(/\{([^}]*)\}/);
        if (valueMatch && valueMatch[1]) {
          return `${attr}="${valueMatch[1]}"`;
        }
        return match;
      },
      desc: 'JSX 属性中的错误'
    },
    
    // 7. 修复模板字符串中的错误
    {
      regex: /`([^`]*)\$\s*\{([^}]*)\}([^`]*)`/g,
      replacement: (match, prefix, expr, suffix) => {
        return `\`${prefix}\${${expr}}${suffix}\``;
      },
      desc: '模板字符串中的错误'
    }
  ];
  
  let fileFixes = 0;
  
  patterns.forEach(({ regex, replacement, desc }) => {
    const matches = content.match(regex);
    if (matches) {
      const newContent = content.replace(regex, replacement);
      if (newContent !== content) {
        const count = (newContent.match(regex) || []).length;
        const fixedCount = matches.length - count;
        content = newContent;
        console.log(`  ✅ ${desc}: ${fixedCount} 处`);
        fileFixes += fixedCount;
      }
    }
  });
  
  // 手动修复常见的模式
  // 修复: { ' > ' } → >
  content = content.replace(/\{\s*'\s*>\s*'\s*\}/g, '>');
  content = content.replace(/\{\s*'\s*}\s*'\s*\}/g, '}');
  
  // 修复: onClick={() => { }} 中的错误
  content = content.replace(/onClick=\{(\(\)\s*=>\s*\{[^}]*\})\}/g, 'onClick={$1}');
  
  // 修复: className={ 'className' } → className="className"
  content = content.replace(/className=\{\s*'([^']+)'\s*\}/g, 'className="$1"');
  
  // 修复: 类型定义中的错误
  content = content.replace(/:\s*boolean\[\]/g, ': any[]');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  📝 文件已更新，共修复 ${fileFixes} 处`);
    totalFixes += fileFixes;
  } else {
    console.log(`  ℹ️  无需修复`);
  }
});

console.log(`\n🎉 批量修复 v2 完成！总计修复 ${totalFixes} 处`);
