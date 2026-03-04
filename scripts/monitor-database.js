// 数据库监控脚本
const { Client } = require('pg');

class DatabaseMonitor {
  constructor(databaseUrl) {
    this.client = new Client({ connectionString: databaseUrl });
    this.monitoring = false;
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('✅ 数据库监控连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  async disconnect() {
    await this.client.end();
    console.log('👋 数据库监控连接已断开');
  }

  // 监控数据库大小
  async monitorDatabaseSize() {
    const result = await this.client.query(`
      SELECT 
        pg_database.datname AS database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) AS size
      FROM pg_database 
      WHERE datname = current_database()
    `);

    return result.rows[0];
  }

  // 监控表大小
  async monitorTableSizes() {
    const result = await this.client.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        (SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = tablename AND n.nspname = schemaname) AS row_count
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return result.rows;
  }

  // 监控连接数
  async monitorConnections() {
    const result = await this.client.query(`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);

    return result.rows[0];
  }

  // 监控慢查询
  async monitorSlowQueries() {
    const result = await this.client.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        stddev_time
      FROM pg_stat_statements 
      WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user)
      ORDER BY total_time DESC
      LIMIT 10
    `);

    return result.rows;
  }

  // 监控索引使用情况
  async monitorIndexUsage() {
    const result = await this.client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC NULLS LAST
    `);

    return result.rows;
  }

  // 综合健康检查
  async healthCheck() {
    const checks = {};

    try {
      checks.databaseSize = await this.monitorDatabaseSize();
      checks.tableSizes = await this.monitorTableSizes();
      checks.connections = await this.monitorConnections();
      checks.slowQueries = await this.monitorSlowQueries();
      checks.indexUsage = await this.monitorIndexUsage();

      // 检查RLS状态
      const rlsCheck = await this.client.query(`
        SELECT tablename, relrowsecurity as rls_enabled
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);
      checks.rlsStatus = rlsCheck.rows;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  // 开始持续监控
  async startMonitoring(interval = 30000) {
    // 默认30秒间隔
    this.monitoring = true;

    console.log(`🚀 开始数据库监控 (间隔: ${interval / 1000}秒)`);

    const monitorLoop = async () => {
      if (!this.monitoring) return;

      try {
        const health = await this.healthCheck();
        console.log('\n📊 数据库健康状态报告');
        console.log('========================');
        console.log(`时间: ${health.timestamp}`);
        console.log(`状态: ${health.status.toUpperCase()}`);

        if (health.status === 'healthy') {
          console.log(`数据库大小: ${health.checks.databaseSize.size}`);
          console.log(
            `总连接数: ${health.checks.connections.total_connections}`
          );
          console.log(
            `活跃连接: ${health.checks.connections.active_connections}`
          );

          // 显示最大的表
          const largestTables = health.checks.tableSizes.slice(0, 3);
          console.log('\n📈 最大的表:');
          largestTables.forEach(table => {
            console.log(
              `  ${table.tablename}: ${table.size} (${table.row_count} 行)`
            );
          });
        } else {
          console.error(`❌ 错误: ${health.error}`);
        }
      } catch (error) {
        console.error('❌ 监控过程中发生错误:', error.message);
      }

      // 安排下次监控
      setTimeout(monitorLoop, interval);
    };

    // 立即执行第一次监控
    monitorLoop();
  }

  // 停止监控
  stopMonitoring() {
    this.monitoring = false;
    console.log('🛑 数据库监控已停止');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ 请设置 DATABASE_URL 环境变量');
    process.exit(1);
  }

  const monitor = new DatabaseMonitor(databaseUrl);

  // 处理退出信号
  process.on('SIGINT', async () => {
    console.log('\n👋 收到退出信号，正在关闭监控...');
    monitor.stopMonitoring();
    await monitor.disconnect();
    process.exit(0);
  });

  // 启动监控
  monitor
    .connect()
    .then(() => {
      monitor.startMonitoring(30000); // 30秒间隔
    })
    .catch(error => {
      console.error('❌ 启动监控失败:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseMonitor;
