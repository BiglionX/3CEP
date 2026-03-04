#!/usr/bin/env node

/**
 * 演示脚本入口文件
 * 集中管理所有演示功能
 */

const fs = require('fs');
const path = require('path');

class DemoRunner {
  constructor() {
    this.demos = this.discoverDemos();
  }

  discoverDemos() {
    const demos = {};
    const demoFiles = fs
      .readdirSync(__dirname)
      .filter(file => file.startsWith('demonstrate-') && file.endsWith('.js'))
      .map(file => path.basename(file, '.js'));

    demoFiles.forEach(demoName => {
      demos[demoName] = path.join(__dirname, `${demoName}.js`);
    });

    return demos;
  }

  listDemos() {
    console.log('Available Demos:');
    console.log('=================');

    Object.keys(this.demos).forEach((demoName, index) => {
      console.log(
        `${index + 1}. ${demoName.replace('demonstrate-', '').replace(/-/g, ' ')}`
      );
    });

    console.log('\nUsage: node scripts/demos/index.js <demo-name>');
    console.log(
      'Example: node scripts/demos/index.js demonstrate-realtime-processing'
    );
  }

  async runDemo(demoName) {
    if (!this.demos[demoName]) {
      console.error(`Demo '${demoName}' not found.`);
      this.listDemos();
      process.exit(1);
    }

    console.log(
      `🚀 Running demo: ${demoName.replace('demonstrate-', '').replace(/-/g, ' ')}\n`
    );

    try {
      const demoModule = require(this.demos[demoName]);

      // 查找演示函数
      const demoFunctions = Object.keys(demoModule).filter(
        key =>
          key.toLowerCase().includes('demonstrate') ||
          key.toLowerCase().includes('demo')
      );

      if (demoFunctions.length > 0) {
        const demoFunc = demoModule[demoFunctions[0]];
        if (typeof demoFunc === 'function') {
          await demoFunc();
        } else {
          console.error(`No executable demo function found in ${demoName}`);
        }
      } else {
        // 如果没有导出函数，尝试直接运行模块
        console.log('Running demo script directly...');
        require(this.demos[demoName]);
      }
    } catch (error) {
      console.error(`Error running demo: ${error.message}`);
      process.exit(1);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    new DemoRunner().listDemos();
    process.exit(0);
  }

  const demoName = args[0];
  const runner = new DemoRunner();

  await runner.runDemo(demoName);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DemoRunner };
