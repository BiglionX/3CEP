// TypeScript 中 "找不到名称'div'" 错误的分析与修复

// 问题原因：
// 1. 在 .ts 文件中使用了 JSX 语法（如 <div>）但没有正确配置
// 2. 缺少必要的类型定义或配置
// 3. 文件扩展名应该是 .tsx 而不是 .ts

// 修复方案演示：

// ✅ 方案1：使用 DOM API 替代 JSX（适用于 .ts 文件）
function createElementsWithoutJSX() {
  // 使用原生 DOM API 创建元素
  const container = document.createElement('div');
  container.className = 'container';
  
  const heading = document.createElement('h1');
  heading.textContent = 'Hello World';
  
  const paragraph = document.createElement('p');
  paragraph.textContent = '这是使用纯 TypeScript 创建的元素';
  
  container.appendChild(heading);
  container.appendChild(paragraph);
  
  return container;
}

// ✅ 方案2：如果需要 JSX，应该使用 .tsx 文件并正确配置
// 注意：这只是一个概念演示，在实际 .tsx 文件中这样写才是正确的
/*
function ComponentWithJSX() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <p>这是使用 JSX 的组件</p>
    </div>
  );
}
*/

// ✅ 方案3：创建类似 JSX 的函数式 API
function createElement(tag: string, props: Record<string, any> = {}, ...children: any[]) {
  const element = document.createElement(tag);
  
  // 设置属性
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // 添加子元素
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// 使用函数式方式创建结构
function createStructuredElements() {
  return createElement('div', { className: 'container' },
    createElement('h1', {}, 'Hello World'),
    createElement('p', {}, '这是使用函数式 API 创建的元素')
  );
}

// 导出所有函数
export { 
  createElementsWithoutJSX, 
  createElement, 
  createStructuredElements 
};

// 测试执行
if (require.main === module) {
  console.log('=== TypeScript div 错误修复演示 ===');
  
  try {
    // 测试方案1
    const element1 = createElementsWithoutJSX();
    console.log('方案1 - DOM API:');
    console.log(element1.outerHTML);
    
    // 测试方案3
    const element3 = createStructuredElements();
    console.log('\n方案3 - 函数式 API:');
    console.log(element3.outerHTML);
    
    console.log('\n✅ 所有方案都成功避免了 "找不到名称div" 的错误！');
    
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}