#!/usr/bin/env node

/**
 * 数据库迁移脚本
 * 负责执行数据库模式变更和数据迁移
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations(environment = 'development') {
  console.log(`📋 开始执行数据库迁移 (${environment} 环境)\n`);
  
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
    
    // 3. 检查迁移历史表
    console.log('\n🔍 检查迁移历史...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          version VARCHAR(255) UNIQUE NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ 迁移历史表已存在或已创建');
    } catch (error) {
      console.log('⚠️  迁移历史表检查失败:', error.message);
    }
    
    // 4. 查找待执行的迁移文件
    console.log('\n📂 查找迁移文件...');
    const migrationsDir = path.join(__dirname, '../../supabase/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  迁移目录不存在，跳过迁移步骤');
      await client.end();
      return true;
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 发现 ${migrationFiles.length} 个迁移文件`);
    
    // 5. 获取已应用的迁移
    const appliedMigrationsResult = await client.query(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    const appliedMigrations = appliedMigrationsResult.rows.map(row => row.version);
    
    console.log(`✅ 已应用 ${appliedMigrations.length} 个迁移`);
    
    // 6. 执行待处理的迁移
    let executedCount = 0;
    for (const migrationFile of migrationFiles) {
      const version = path.parse(migrationFile).name;
      
      if (appliedMigrations.includes(version)) {
        console.log(`⏭️  跳过已应用迁移: ${migrationFile}`);
        continue;
      }
      
      console.log(`\n⚡ 执行迁移: ${migrationFile}`);
      
      try {
        const migrationSql = fs.readFileSync(
          path.join(migrationsDir, migrationFile),
          'utf8'
        );
        
        // 执行迁移
        await client.query(migrationSql);
        
        // 记录迁移历史
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        
        console.log(`✅ 迁移 ${migrationFile} 执行成功`);
        executedCount++;
        
      } catch (error) {
        console.error(`❌ 迁移 ${migrationFile} 执行失败:`, error.message);
        throw error;
      }
    }
    
    // 7. 验证迁移结果
    console.log('\n✅ 验证迁移结果...');
    const finalCheck = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`📊 当前数据库表数量: ${finalCheck.rows[0].table_count}`);
    
    // 8. 输出迁移报告
    console.log(`\n📊 迁移执行报告:`);
    console.log(`   执行时间: ${new Date().toLocaleString()}`);
    console.log(`   环境: ${environment}`);
    console.log(`   执行迁移数: ${executedCount}`);
    console.log(`   总迁移文件数: ${migrationFiles.length}`);
    console.log(`   已应用迁移数: ${appliedMigrations.length + executedCount}`);
    
    await client.end();
    
    if (executedCount > 0) {
      console.log('\n🎉 数据库迁移成功完成！');
    } else {
      console.log('\n✅ 数据库已是最新状态，无需迁移');
    }
    
    return true;
    
  } catch (error) {
    console.error('\n❌ 数据库迁移失败:', error.message);
    process.exit(1);
  }
}

// 命令行参数处理
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  runMigrations(environment);
}

module.exports = { runMigrations };