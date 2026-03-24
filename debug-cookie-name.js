/**
 * 调试 Cookie 名称生成
 */

const supabaseUrl = 'https://hrjqzbhqueleszkvnsen.supabase.co';

// 从 URL 提取项目名称
function extractProjectName(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 2 && parts[1] === 'supabase') {
      return parts[0];
    }

    return hostname;
  } catch (error) {
    console.warn('URL 解析失败:', error);
    return 'procyc';
  }
}

// 生成 Cookie 名称
function getAuthCookieName(url) {
  const projectName = extractProjectName(url);
  return `sb-${projectName}-auth-token`;
}

console.log('=================================');
console.log('Cookie 名称调试信息');
console.log('=================================');
console.log('Supabase URL:', supabaseUrl);
console.log('项目名称:', extractProjectName(supabaseUrl));
console.log('Cookie 名称:', getAuthCookieName(supabaseUrl));
console.log('=================================');
console.log('\n请在浏览器控制台检查:');
console.log('1. document.cookie');
console.log(
  `2. localStorage.getItem("sb-${extractProjectName(supabaseUrl)}-auth-token")`
);
console.log('\n如果 Cookie 名称不匹配，请检查:');
console.log('- AuthProvider.tsx 中设置的 Cookie 名称');
console.log('- API route 中读取的 Cookie 名称');
console.log('- 确保两者使用相同的逻辑生成 Cookie 名称');
