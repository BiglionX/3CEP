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
  
  // 修复模式列表
  const patterns = [
    // 1. 三元运算符缺少 ? （condition  true : false → condition ? true : false）
    {
      regex: /(\w+|\[[^\]]+\]|\([^)]+\))\s+([a-zA-Z]+)\s*:\s*([^;,}])/g,
      replacement: (match, condition, trueValue, falseValue) => {
        // 避免误伤
        if (condition.startsWith('{') || trueValue.startsWith('{') || falseValue.startsWith('{')) {
          return match;
        }
        if (trueValue.includes(' ') && !trueValue.includes('{')) {
          return match;
        }
        return `${condition} ? ${trueValue} : ${falseValue}`;
      },
      desc: '三元运算符缺少 ?'
    },
    
    // 2. 修复 JSX 中的错误大括号和尖括号
    {
      regex: /(\w+)\s*{\s*'\s*>\s*'\s*}/g,
      replacement: '$1>',
      desc: 'JSX 大括号包裹的尖括号'
    },
    {
      regex: /(\w+)\s*{\s*'\s*}\s*'\s*}/g,
      replacement: '$1}',
      desc: 'JSX 大括号包裹的右大括号'
    },
    
    // 3. 修复变量声明 (const ? varName : Type → const varName: Type)
    {
      regex: /const\s+\?\s+(\w+)\s*:\s*([^,;=]+)/g,
      replacement: 'const $1: $2',
      desc: '变量声明语法错误'
    },
    
    // 4. 修复对象字面量中的语法错误
    {
      regex: /(\w+):\s*([^,}]+)(?=\s*,|\s*})/g,
      replacement: (match, key, value) => {
        // 检查值是否包含无效的语法
        if (value.includes('$') && value.includes(' ')) {
          // 可能是编码问题，尝试清理
          const cleaned = value.replace(/\$\s*/g, '');
          return `${key}: ${cleaned}`;
        }
        return match;
      },
      desc: '对象字面量语法'
    },
    
    // 5. 修复函数调用语法 (Number(x) → x)
    {
      regex: /Number\(([^)]+)\)/g,
      replacement: (match, inner) => {
        // 如果是简单的变量引用，直接返回
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(inner.trim())) {
          return inner.trim();
        }
        return match;
      },
      desc: 'Number 函数调用'
    },
    
    // 6. 修复 String 函数调用
    {
      regex: /String\(([^)]+)\)/g,
      replacement: (match, inner) => {
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(inner.trim())) {
          return inner.trim();
        }
        return match;
      },
      desc: 'String 函数调用'
    },
    
    // 7. 修复 Boolean 函数调用
    {
      regex: /Boolean\(([^)]+)\)/g,
      replacement: (match, inner) => {
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(inner.trim())) {
          return inner.trim();
        }
        return match;
      },
      desc: 'Boolean 函数调用'
    }
  ];
  
  let fileFixes = 0;
  
  patterns.forEach(({ regex, replacement, desc }) => {
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, replacement);
      console.log(`  ✅ ${desc}: ${matches.length} 处`);
      fileFixes += matches.length;
    }
  });
  
  if (content.length !== originalLength) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  📝 文件已更新，共修复 ${fileFixes} 处`);
    totalFixes += fileFixes;
  } else {
    console.log(`  ℹ️  无需修复`);
  }
});

console.log(`\n🎉 批量修复完成！总计修复 ${totalFixes} 处`);
