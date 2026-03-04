// 全面修复验证脚本
const http = require('http');

async function comprehensiveVerification() {
  console.log('🔍 全面管理员权限修复验证\n');

  try {
    // 1. 验证API端点
    console.log('1️⃣ 验证API端点...');
    const apiResult = await testApiEndpoint('/api/test-admin-check');
    console.log(
      `   结果: ${apiResult.success ? '✅' : '❌'} ${apiResult.message}`
    );

    // 2. 验证会话检查API
    console.log('\n2️⃣ 验证会话检查API...');
    const sessionResult = await testApiEndpoint('/api/auth/check-session');
    console.log(
      `   结果: ${sessionResult.success ? '✅' : '❌'} ${sessionResult.message}`
    );

    // 3. 检查文件修复状态
    console.log('\n3️⃣ 检查文件修复状态...');
    const fileCheck = await checkFileFixes();
    fileCheck.forEach(check => {
      console.log(`   ${check.status} ${check.file}: ${check.message}`);
    });

    // 4. 总结
    console.log('\n📋 修复验证总结:');
    const allPassed =
      apiResult.success &&
      sessionResult.success &&
      fileCheck.every(c => c.status === '✅');

    if (allPassed) {
      console.log('🎉 所有修复验证通过！');
      console.log('✅ API端点工作正常');
      console.log('✅ 会话检查功能正常');
      console.log('✅ 文件修复已完成');
      console.log('✅ 管理员权限系统恢复正常');

      console.log('\n🚀 下一步操作:');
      console.log('1. 清除浏览器缓存 (Ctrl + Shift + Delete)');
      console.log('2. 重新登录管理员账户');
      console.log(
        '3. 访问 http://localhost:3001/unified-auth-test 验证前端显示'
      );
      console.log('4. 测试管理后台功能是否正常');
    } else {
      console.log('❌ 部分验证失败，请检查:');
      if (!apiResult.success) console.log('   - API端点问题');
      if (!sessionResult.success) console.log('   - 会话检查问题');
      if (!fileCheck.every(c => c.status === '✅'))
        console.log('   - 文件修复问题');
    }
  } catch (error) {
    console.error('❌ 验证过程中出错:', error.message);
  }
}

function testApiEndpoint(endpoint) {
  return new Promise(resolve => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            success: res.statusCode === 200 && result.success !== false,
            message: `状态码: ${res.statusCode}, 响应: ${JSON.stringify(result).substring(0, 100)}...`,
          });
        } catch (error) {
          resolve({
            success: false,
            message: `响应解析失败: ${error.message}`,
          });
        }
      });
    });

    req.on('error', error => {
      resolve({
        success: false,
        message: `请求失败: ${error.message}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        message: '请求超时',
      });
    });

    req.end();
  });
}

async function checkFileFixes() {
  const fs = require('fs');
  const path = require('path');

  const checks = [
    {
      file: 'src/lib/auth-service.ts',
      check: content =>
        content.includes('await supabaseAdmin') &&
        content.includes('isAdminUser'),
    },
    {
      file: 'src/tech/utils/lib/auth-service.ts',
      check: content =>
        content.includes('await supabaseAdmin') &&
        content.includes('isAdminUser'),
    },
    {
      file: 'src/hooks/use-unified-auth.ts',
      check: content => content.includes('AuthService.isAdminUser'),
    },
  ];

  return checks.map(({ file, check }) => {
    try {
      const fullPath = path.join(__dirname, '..', file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const passed = check(content);
      return {
        status: passed ? '✅' : '❌',
        file,
        message: passed ? '修复正确' : '需要修复',
      };
    } catch (error) {
      return {
        status: '❌',
        file,
        message: `文件读取失败: ${error.message}`,
      };
    }
  });
}

comprehensiveVerification();
