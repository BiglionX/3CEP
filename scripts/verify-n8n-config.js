const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('n8n 配置验证脚本');
console.log('==========================================\n');

// 检查环境变量文件
const envFilePath = '.env.n8n';
console.log(`🔍 检查环境变量文件: ${envFilePath}`);

if (!fs.existsSync(envFilePath)) {
    console.error('❌ 错误: .env.n8n 文件不存在');
    process.exit(1);
}

// 读取环境变量
const envContent = fs.readFileSync(envFilePath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value ? value.trim() : '';
    }
});

// 验证必需的环境变量
const requiredVars = [
    'N8N_ENCRYPTION_KEY',
    'DB_TYPE',
    'DB_POSTGRESDB_HOST',
    'DB_POSTGRESDB_PORT',
    'DB_POSTGRESDB_USER',
    'DB_POSTGRESDB_PASSWORD',
    'DB_POSTGRESDB_DATABASE',
    'N8N_HOST',
    'N8N_PORT',
    'N8N_PROTOCOL'
];

// iframe 嵌入相关变量
const iframeVars = [
    'N8N_DISABLE_UI_ACCESS',
    'N8N_SESSION_COOKIE_SAMESITE',
    'N8N_SESSION_COOKIE_SECURE',
    'N8N_CORS_ALLOWED_ORIGINS'
];

console.log('📋 验证必需的环境变量:');
let hasErrors = false;

requiredVars.forEach(varName => {
    if (envVars[varName]) {
        console.log(`✅ ${varName}: ${envVars[varName].substring(0, 20)}${envVars[varName].length > 20 ? '...' : ''}`);
    } else {
        console.error(`❌ 缺少环境变量: ${varName}`);
        hasErrors = true;
    }
});

console.log('\n🌐 iframe 嵌入配置检查:');
let iframeConfigValid = true;

iframeVars.forEach(varName => {
    if (envVars[varName]) {
        console.log(`✅ ${varName}: ${envVars[varName]}`);
    } else {
        console.warn(`⚠️  缺少 iframe 配置: ${varName}`);
        iframeConfigValid = false;
    }
});

if (iframeConfigValid) {
    console.log('✅ iframe 嵌入配置完整');
    
    // 验证关键配置值
    if (envVars.N8N_SESSION_COOKIE_SAMESITE !== 'none') {
        console.warn('⚠️  警告: N8N_SESSION_COOKIE_SAMESITE 应该设置为 none 以支持跨域');
    }
    
    if (envVars.N8N_PROTOCOL === 'https' && envVars.N8N_SESSION_COOKIE_SECURE !== 'true') {
        console.warn('⚠️  警告: 使用 HTTPS 时 N8N_SESSION_COOKIE_SECURE 应该设置为 true');
    }
} else {
    console.warn('⚠️  iframe 嵌入配置不完整');
}

console.log('\n🔐 安全检查:');
// 检查加密密钥强度
if (envVars.N8N_ENCRYPTION_KEY === 'your-secure-key') {
    console.warn('⚠️  警告: 使用默认加密密钥，请更换为强随机字符串');
} else if (envVars.N8N_ENCRYPTION_KEY.length < 32) {
    console.warn('⚠️  警告: 加密密钥长度不足32位');
} else {
    console.log('✅ 加密密钥配置合理');
}

// 检查密码安全性
if (envVars.DB_POSTGRESDB_PASSWORD === 'your-password') {
    console.warn('⚠️  警告: 使用默认数据库密码，请更换为安全密码');
} else {
    console.log('✅ 数据库密码已设置');
}

console.log('\n🌐 网络配置检查:');
console.log(`✅ 主机地址: ${envVars.N8N_HOST}`);
console.log(`✅ 端口: ${envVars.N8N_PORT}`);
console.log(`✅ 协议: ${envVars.N8N_PROTOCOL}`);

// 检查 Docker Compose 文件
const composeFilePath = 'docker-compose.n8n.yml';
console.log(`\n🐳 检查 Docker Compose 配置: ${composeFilePath}`);

if (!fs.existsSync(composeFilePath)) {
    console.error('❌ 错误: docker-compose.n8n.yml 文件不存在');
    hasErrors = true;
} else {
    console.log('✅ Docker Compose 文件存在');
}

// 检查必要目录
console.log('\n📁 检查必要目录结构:');
const requiredDirs = [
    'n8n',
    'n8n/custom',
    'n8n/logs'
];

requiredDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ 目录存在: ${dir}`);
    } else {
        console.warn(`⚠️  目录不存在: ${dir} (将自动创建)`);
    }
});

console.log('\n==========================================');
if (hasErrors) {
    console.error('❌ 配置验证失败，请修正错误后重试');
    process.exit(1);
} else {
    console.log('✅ 配置验证通过！');
    console.log('\n🚀 下一步:');
    console.log('1. 运行部署脚本: deploy-n8n-configured.bat');
    console.log('2. 或手动部署: docker-compose -f docker-compose.n8n.yml --env-file .env.n8n up -d');
    console.log('3. 访问 n8n: https://n8n.yourdomain.com');
    console.log('4. 测试 iframe 嵌入: 打开 test-n8n-iframe.html');
}
console.log('==========================================');