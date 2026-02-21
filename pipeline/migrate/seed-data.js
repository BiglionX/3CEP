#!/usr/bin/env node

/**
 * 数据初始化脚本
 * 负责插入初始数据和测试数据
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seedData(environment = 'development') {
  console.log(`🌱 开始数据初始化 (${environment} 环境)\n`);
  
  try {
    // 1. 获取数据库连接配置
    console.log('🔗 获取数据库连接信息...');
    const envFile = `.env.${environment}`;
    const envPath = path.join(__dirname, `../../${envFile}`);
    
    if (!fs.existsSync(envPath)) {
      throw new Error(`环境配置文件不存在: ${envFile}`);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const databaseUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
    
    if (!databaseUrlMatch) {
      throw new Error('未找到DATABASE_URL配置');
    }
    
    const databaseUrl = databaseUrlMatch[1].trim();
    console.log('✅ 数据库连接信息获取完成');
    
    // 2. 连接数据库
    console.log('\n🔌 连接数据库...');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    console.log('✅ 数据库连接成功');
    
    // 3. 检查是否需要初始化
    console.log('\n🔍 检查数据初始化状态...');
    const tablesToCheck = ['users', 'parts', 'system_config'];
    let needsSeeding = false;
    
    for (const table of tablesToCheck) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        console.log(`📊 表 ${table}: ${count} 条记录`);
        
        if (count === 0) {
          needsSeeding = true;
        }
      } catch (error) {
        console.log(`⚠️  表 ${table} 不存在或无法访问`);
        needsSeeding = true;
      }
    }
    
    if (!needsSeeding && environment !== 'development') {
      console.log('✅ 数据已存在，跳过初始化');
      await client.end();
      return true;
    }
    
    // 4. 执行种子数据脚本
    console.log('\n📦 执行种子数据初始化...');
    const seedScripts = [];
    
    // 根据环境选择不同的种子数据
    if (environment === 'development') {
      seedScripts.push(
        'seed-initial-data.js',
        'seed-data-enhanced.js',
        'seed-global-shops.js'
      );
    } else if (environment === 'stage') {
      seedScripts.push(
        'seed-initial-data.js',
        'seed-global-shops-expanded.js'
      );
    } else {
      // 生产环境只初始化必要的系统配置
      seedScripts.push('seed-initial-data.js');
    }
    
    let seededRecords = 0;
    
    for (const scriptName of seedScripts) {
      const scriptPath = path.join(__dirname, `../../scripts/${scriptName}`);
      
      if (fs.existsSync(scriptPath)) {
        console.log(`\n⚡ 执行种子脚本: ${scriptName}`);
        
        try {
          // 动态导入并执行种子脚本
          const seedModule = require(scriptPath);
          
          if (typeof seedModule.seed === 'function') {
            const result = await seedModule.seed(client);
            if (result && typeof result === 'object') {
              seededRecords += result.inserted || 0;
            }
            console.log(`✅ 脚本 ${scriptName} 执行成功`);
          } else {
            console.log(`⚠️  脚本 ${scriptName} 没有导出seed函数`);
          }
          
        } catch (error) {
          console.error(`❌ 脚本 ${scriptName} 执行失败:`, error.message);
          // 不中断整个流程，继续执行其他脚本
        }
      } else {
        console.log(`⏭️  种子脚本不存在: ${scriptName}`);
      }
    }
    
    // 5. 插入基础系统配置
    console.log('\n⚙️ 插入基础系统配置...');
    try {
      const systemConfigs = [
        { key: 'app_version', value: '1.0.0', description: '应用版本号' },
        { key: 'maintenance_mode', value: 'false', description: '维护模式开关' },
        { key: 'max_upload_size', value: '10MB', description: '最大上传文件大小' },
        { key: 'session_timeout', value: '24h', description: '会话超时时间' }
      ];
      
      for (const config of systemConfigs) {
        await client.query(`
          INSERT INTO system_config (config_key, config_value, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (config_key) DO NOTHING
        `, [config.key, config.value, config.description]);
      }
      
      console.log('✅ 基础系统配置插入完成');
    } catch (error) {
      console.log('⚠️  系统配置插入失败:', error.message);
    }
    
    // 6. 验证初始化结果
    console.log('\n✅ 验证初始化结果...');
    for (const table of tablesToCheck) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`📊 表 ${table}: ${result.rows[0].count} 条记录`);
      } catch (error) {
        console.log(`⚠️  无法验证表 ${table}`);
      }
    }
    
    // 7. 输出初始化报告
    console.log(`\n📊 数据初始化报告:`);
    console.log(`   执行时间: ${new Date().toLocaleString()}`);
    console.log(`   环境: ${environment}`);
    console.log(`   插入记录数: ${seededRecords}`);
    console.log(`   执行脚本数: ${seedScripts.filter(script => 
      fs.existsSync(path.join(__dirname, `../../scripts/${script}`))).length}`);
    
    await client.end();
    
    console.log('\n🎉 数据初始化成功完成！');
    return true;
    
  } catch (error) {
    console.error('\n❌ 数据初始化失败:', error.message);
    process.exit(1);
  }
}

// 命令行参数处理
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  seedData(environment);
}

module.exports = { seedData };