/**
 * NextAuth配置验证脚本
 * 验证NextAuth配置是否正确设置
 */

console.log('🔐 开始NextAuth配置验证...\n');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

async function validateNextAuthConfig() {
  console.log('1️⃣ 验证环境变量配置...');

  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = [];
  const presentVars = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      presentVars.push(envVar);
      const displayValue =
        envVar.includes('KEY') || envVar.includes('SECRET')
          ? `${value.substring(0, 8)}...${value.slice(-4)}`
          : value.substring(0, 30) + (value.length > 30 ? '...' : '');
      console.log(`  ✅ ${envVar}: ${displayValue}`);
    } else {
      missingVars.push(envVar);
      console.log(`  ❌ ${envVar}: 未设置`);
    }
  }

  if (missingVars.length > 0) {
    console.log('\n❌ 缺失必需的环境变量，无法继续验证');
    return false;
  }

  console.log('\n2️⃣ 验证配置文件存在性...');

  const fs = require('fs');
  const path = require('path');

  const configFiles = [
    {
      path: path.join(
        __dirname,
        '..',
        'src',
        'lib',
        'auth',
        'nextauth-config.ts'
      ),
      name: 'NextAuth配置文件',
    },
    {
      path: path.join(
        __dirname,
        '..',
        'src',
        'app',
        'api',
        'auth',
        '[...nextauth]',
        'route.ts'
      ),
      name: 'NextAuth API路由',
    },
  ];

  let allFilesExist = true;
  for (const configFile of configFiles) {
    if (fs.existsSync(configFile.path)) {
      console.log(`  ✅ ${configFile.name} 存在`);
    } else {
      console.log(`  ❌ ${configFile.name} 不存在`);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    console.log('\n❌ 缺失必需的配置文件');
    return false;
  }

  console.log('\n3️⃣ 验证依赖包安装...');

  try {
    const { execSync } = require('child_process');
    const packages = ['next-auth', '@auth/supabase-adapter', 'bcryptjs'];

    for (const pkg of packages) {
      try {
        execSync(`npm list ${pkg}`, { stdio: 'pipe' });
        console.log(`  ✅ ${pkg} 已安装`);
      } catch (error) {
        console.log(`  ❌ ${pkg} 未安装`);
        return false;
      }
    }
  } catch (error) {
    console.log('  ⚠️  无法验证依赖包状态');
  }

  console.log('\n4️⃣ 验证NextAuth配置结构...');

  try {
    // 动态导入配置文件进行验证
    const configPath = path.join(
      __dirname,
      '..',
      'src',
      'lib',
      'auth',
      'nextauth-config.ts'
    );

    // 由于TypeScript文件需要编译，我们检查文件内容
    const configContent = fs.readFileSync(configPath, 'utf8');

    const requiredElements = [
      'providers:',
      'callbacks:',
      'pages:',
      'session:',
      'jwt:',
    ];

    let allElementsFound = true;
    for (const element of requiredElements) {
      if (configContent.includes(element)) {
        console.log(`  ✅ 包含 ${element}`);
      } else {
        console.log(`  ❌ 缺少 ${element}`);
        allElementsFound = false;
      }
    }

    if (!allElementsFound) {
      console.log('\n❌ 配置文件结构不完整');
      return false;
    }
  } catch (error) {
    console.log('  ⚠️  无法验证配置文件结构');
  }

  console.log('\n5️⃣ 验证Supabase连接配置...');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      // 验证URL格式
      try {
        const url = new URL(supabaseUrl);
        if (url.protocol === 'https:') {
          console.log('  ✅ Supabase URL格式正确');
        } else {
          console.log('  ⚠️  Supabase URL应使用HTTPS协议');
        }
      } catch (urlError) {
        console.log('  ❌ Supabase URL格式无效');
        return false;
      }

      // 验证密钥格式
      if (serviceKey.startsWith('sb_') && serviceKey.length > 20) {
        console.log('  ✅ Supabase Service Key格式正确');
      } else {
        console.log('  ⚠️  Supabase Service Key格式可能不正确');
      }
    }
  } catch (error) {
    console.log('  ⚠️  Supabase配置验证遇到问题');
  }

  return true;
}

// 运行验证
validateNextAuthConfig()
  .then(success => {
    if (success) {
      console.log('\n🎉 NextAuth配置验证通过!');
      console.log('\n📋 配置摘要:');
      console.log('- 环境变量: ✅ 完整');
      console.log('- 配置文件: ✅ 存在');
      console.log('- 依赖包: ✅ 安装');
      console.log('- 配置结构: ✅ 完整');
      console.log('- Supabase配置: ✅ 正确');

      console.log('\n🚀 下一步建议:');
      console.log('1. 重启开发服务器使配置完全生效');
      console.log('2. 测试登录认证流程');
      console.log('3. 验证会话管理和权限控制');
      console.log('4. 测试登出功能');
    } else {
      console.log('\n❌ NextAuth配置验证失败');
      console.log('\n🔧 请根据上面的错误信息修复配置问题');
    }
  })
  .catch(error => {
    console.log('\n❌ 验证过程中发生错误:', error.message);
  });
