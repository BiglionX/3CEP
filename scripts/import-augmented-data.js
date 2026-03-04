#!/usr/bin/env node

/**
 * 数据导入脚本
 * 将生成的增强数据导入到数据库中
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class DataImporter {
  constructor() {
    this.databaseUrl =
      process.env.DATABASE_URL ||
      'postgresql://postgres:Sup_105!^-^@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres';
    this.client = null;
  }

  async connect() {
    try {
      this.client = new Client({ connectionString: this.databaseUrl });
      await this.client.connect();
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  async loadDataFromFile(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`📥 从文件加载数据: ${filePath}`);
      return data;
    } catch (error) {
      console.error('❌ 数据文件加载失败:', error.message);
      return null;
    }
  }

  async importDevices(devices) {
    console.log(`📱 导入 ${devices.length} 个设备型号...`);
    let successCount = 0;

    for (const device of devices) {
      try {
        const query = `
          INSERT INTO devices (id, brand, model, category, release_year, specifications, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            brand = EXCLUDED.brand,
            model = EXCLUDED.model,
            category = EXCLUDED.category,
            release_year = EXCLUDED.release_year,
            specifications = EXCLUDED.specifications,
            updated_at = EXCLUDED.updated_at
        `;

        await this.client.query(query, [
          device.id,
          device.brand,
          device.model,
          device.category,
          device.release_year,
          JSON.stringify(device.specifications),
          device.created_at,
          device.updated_at,
        ]);

        successCount++;
      } catch (error) {
        console.error(`❌ 设备导入失败 (${device.model}):`, error.message);
      }
    }

    console.log(`✅ 成功导入 ${successCount}/${devices.length} 个设备型号`);
    return successCount;
  }

  async importFaultTypes(faultTypes) {
    console.log(`🔧 导入 ${faultTypes.length} 个故障类型...`);
    let successCount = 0;

    for (const fault of faultTypes) {
      try {
        const query = `
          INSERT INTO fault_types (id, name, category, description, difficulty_level, estimated_time, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            difficulty_level = EXCLUDED.difficulty_level,
            estimated_time = EXCLUDED.estimated_time,
            updated_at = EXCLUDED.updated_at
        `;

        await this.client.query(query, [
          fault.id,
          fault.name,
          fault.category,
          fault.description,
          fault.difficulty_level,
          fault.estimated_time,
          fault.created_at,
          fault.updated_at,
        ]);

        successCount++;
      } catch (error) {
        console.error(`❌ 故障类型导入失败 (${fault.name}):`, error.message);
      }
    }

    console.log(`✅ 成功导入 ${successCount}/${faultTypes.length} 个故障类型`);
    return successCount;
  }

  async importParts(parts) {
    console.log(`⚙️ 导入 ${parts.length} 个配件数据...`);
    let successCount = 0;

    for (const part of parts) {
      try {
        const query = `
          INSERT INTO parts (
            id, name, category, brand, model, part_number, unit, description,
            stock_quantity, min_stock, status, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            brand = EXCLUDED.brand,
            model = EXCLUDED.model,
            part_number = EXCLUDED.part_number,
            unit = EXCLUDED.unit,
            description = EXCLUDED.description,
            stock_quantity = EXCLUDED.stock_quantity,
            min_stock = EXCLUDED.min_stock,
            status = EXCLUDED.status,
            updated_at = EXCLUDED.updated_at
        `;

        await this.client.query(query, [
          part.id,
          part.name,
          part.category,
          part.brand,
          part.model,
          part.part_number,
          part.unit,
          part.description,
          part.stock_quantity,
          part.min_stock,
          part.status,
          part.created_at,
          part.updated_at,
        ]);

        successCount++;
      } catch (error) {
        console.error(`❌ 配件导入失败 (${part.name}):`, error.message);
      }
    }

    console.log(`✅ 成功导入 ${successCount}/${parts.length} 个配件`);
    return successCount;
  }

  async verifyImport() {
    console.log('\n🔍 验证导入结果...');

    try {
      const tables = [
        { name: 'devices', displayName: '设备型号' },
        { name: 'fault_types', displayName: '故障类型' },
        { name: 'parts', displayName: '配件数据' },
      ];

      for (const table of tables) {
        const result = await this.client.query(
          `SELECT COUNT(*) FROM ${table.name}`
        );
        const count = parseInt(result.rows[0].count);
        console.log(`📊 ${table.displayName}: ${count} 条记录`);
      }
    } catch (error) {
      console.error('❌ 验证过程中发生错误:', error.message);
    }
  }

  async close() {
    if (this.client) {
      await this.client.end();
      console.log('🔒 数据库连接已关闭');
    }
  }

  async runImport(dataFilePath) {
    console.log('🚀 开始数据导入流程\n');

    // 连接数据库
    const connected = await this.connect();
    if (!connected) {
      return false;
    }

    try {
      // 加载数据
      const data = await this.loadDataFromFile(dataFilePath);
      if (!data) {
        return false;
      }

      console.log(`📊 待导入数据统计:`);
      console.log(`   设备型号: ${data.devices?.length || 0} 条`);
      console.log(`   故障类型: ${data.fault_types?.length || 0} 条`);
      console.log(`   配件数据: ${data.parts?.length || 0} 条`);
      console.log('');

      // 执行导入
      let totalSuccess = 0;

      if (data.devices && data.devices.length > 0) {
        const deviceCount = await this.importDevices(data.devices);
        totalSuccess += deviceCount;
      }

      if (data.fault_types && data.fault_types.length > 0) {
        const faultCount = await this.importFaultTypes(data.fault_types);
        totalSuccess += faultCount;
      }

      if (data.parts && data.parts.length > 0) {
        const partCount = await this.importParts(data.parts);
        totalSuccess += partCount;
      }

      // 验证结果
      await this.verifyImport();

      console.log(`\n🎉 数据导入完成！`);
      console.log(`   成功导入: ${totalSuccess} 条记录`);

      return true;
    } catch (error) {
      console.error('❌ 数据导入过程中发生错误:', error.message);
      return false;
    } finally {
      await this.close();
    }
  }
}

// 主执行函数
async function main() {
  const importer = new DataImporter();
  const dataFilePath = path.join(
    __dirname,
    '../data/quick-generated-data.json'
  );

  try {
    const success = await importer.runImport(dataFilePath);
    if (success) {
      console.log('\n✅ 数据增强导入成功完成！');
    } else {
      console.log('\n❌ 数据导入失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 导入过程异常:', error.message);
    process.exit(1);
  }
}

// 执行导入
if (require.main === module) {
  main();
}

module.exports = { DataImporter };
