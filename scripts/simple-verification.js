// 简单的前端验证脚本
const http = require('http');

function checkApiEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/test-admin-check',
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
          resolve(result);
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

async function main() {
  console.log('🚀 管理员权限修复验证\n');

  try {
    console.log('1️⃣ 测试API端点...');
    const apiResult = await checkApiEndpoint();

    console.log('✅ API测试结果:');
    console.log('   成功:', apiResult.success);
    console.log('   管理员权限:', apiResult.isAdmin ? '✅ 是' : '❌ 否');
    console.log('   用户ID:', apiResult.userId);
    console.log('   错误信息:', apiResult.error || '无');

    if (apiResult.success && apiResult.isAdmin) {
      console.log('\n🎉 修复验证成功！');
      console.log('✅ 管理员权限检查已恢复正常');
      console.log('✅ API端点工作正常');
      console.log('✅ 数据库查询无错误');

      console.log('\n📋 下一步建议:');
      console.log('1. 清除浏览器缓存并刷新页面');
      console.log('2. 重新登录管理员账户');
      console.log(
        '3. 访问 http://localhost:3001/unified-auth-test 验证前端显示'
      );
      console.log('4. 测试管理后台各项功能');
    } else {
      console.log('\n❌ API测试失败');
      console.log('请检查服务器状态和数据库连接');
    }
  } catch (error) {
    console.error('❌ 验证过程中出错:', error.message);
  }
}

main();
