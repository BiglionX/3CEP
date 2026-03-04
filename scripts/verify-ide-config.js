#!/usr/bin/env node

/**
 * IDE 配置验证脚本
 * 检查所有 VSCode 配置文件和扩展推荐
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function validateSettings() {
  log('\n📋 验证 VSCode Settings...', 'cyan');
  const settingsPath = '.vscode/settings.json';

  if (!checkFileExists(settingsPath)) {
    log(`  ❌ ${settingsPath} 不存在`, 'red');
    return false;
  }

  const result = validateJSON(settingsPath);
  if (result.valid) {
    log(`  ✅ ${settingsPath} 格式正确`, 'green');

    // 检查关键配置
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const checks = [
      { key: 'editor.defaultFormatter', expected: 'esbenp.prettier-vscode' },
      { key: 'editor.formatOnSave', expected: true },
      { key: 'prettier.enable', expected: true },
    ];

    checks.forEach(check => {
      if (settings[check.key] === check.expected) {
        log(`    ✅ ${check.key} 配置正确`, 'green');
      } else {
        log(`    ⚠️  ${check.key} 配置可能不正确`, 'yellow');
      }
    });

    return true;
  } else {
    log(`  ❌ ${settingsPath} 格式错误: ${result.error}`, 'red');
    return false;
  }
}

function validateLaunchConfig() {
  log('\n🔧 验证 Launch 配置...', 'cyan');
  const launchPath = '.vscode/launch.json';

  if (!checkFileExists(launchPath)) {
    log(`  ❌ ${launchPath} 不存在`, 'red');
    return false;
  }

  const result = validateJSON(launchPath);
  if (result.valid) {
    log(`  ✅ ${launchPath} 格式正确`, 'green');

    const launch = JSON.parse(fs.readFileSync(launchPath, 'utf8'));
    if (launch.configurations && launch.configurations.length > 0) {
      log(`  ✅ 找到 ${launch.configurations.length} 个调试配置`, 'green');
      launch.configurations.forEach(config => {
        log(`    • ${config.name || 'Unnamed config'}`, 'blue');
      });
    } else {
      log(`  ⚠️  未找到调试配置`, 'yellow');
    }

    return true;
  } else {
    log(`  ❌ ${launchPath} 格式错误: ${result.error}`, 'red');
    return false;
  }
}

function validateTasksConfig() {
  log('\n⚙️  验证 Tasks 配置...', 'cyan');
  const tasksPath = '.vscode/tasks.json';

  if (!checkFileExists(tasksPath)) {
    log(`  ❌ ${tasksPath} 不存在`, 'red');
    return false;
  }

  const result = validateJSON(tasksPath);
  if (result.valid) {
    log(`  ✅ ${tasksPath} 格式正确`, 'green');

    const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    if (tasks.tasks && tasks.tasks.length > 0) {
      log(`  ✅ 找到 ${tasks.tasks.length} 个任务`, 'green');
      tasks.tasks.forEach(task => {
        log(`    • ${task.label || 'Unnamed task'}`, 'blue');
      });
    } else {
      log(`  ⚠️  未找到任务配置`, 'yellow');
    }

    return true;
  } else {
    log(`  ❌ ${tasksPath} 格式错误: ${result.error}`, 'red');
    return false;
  }
}

function validateESLintConfig() {
  log('\n🔍 验证 ESLint 配置...', 'cyan');
  const eslintPath = '.eslintrc.json';

  if (!checkFileExists(eslintPath)) {
    log(`  ❌ ${eslintPath} 不存在`, 'red');
    return false;
  }

  const result = validateJSON(eslintPath);
  if (result.valid) {
    log(`  ✅ ${eslintPath} 格式正确`, 'green');

    const config = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));

    // 检查关键规则
    const rulesToCheck = [
      '@typescript-eslint/no-explicit-any',
      'no-console',
      '@typescript-eslint/ban-ts-comment',
    ];

    if (config.rules) {
      rulesToCheck.forEach(rule => {
        if (config.rules[rule]) {
          log(`    • ${rule}: ${JSON.stringify(config.rules[rule])}`, 'blue');
        }
      });
    }

    return true;
  } else {
    log(`  ❌ ${eslintPath} 格式错误: ${result.error}`, 'red');
    return false;
  }
}

function validateExtensionsRecommendations() {
  log('\n📦 验证扩展推荐...', 'cyan');
  const extensionsPath = '.vscode/extensions.json';

  if (!checkFileExists(extensionsPath)) {
    log(`  ❌ ${extensionsPath} 不存在`, 'red');
    return false;
  }

  const result = validateJSON(extensionsPath);
  if (result.valid) {
    log(`  ✅ ${extensionsPath} 格式正确`, 'green');

    const extensions = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'));
    if (extensions.recommendations && extensions.recommendations.length > 0) {
      log(`  ✅ 推荐 ${extensions.recommendations.length} 个扩展`, 'green');

      // 分类统计
      const categories = {
        typescript: extensions.recommendations.filter(e =>
          e.includes('typescript')
        ),
        eslint: extensions.recommendations.filter(e => e.includes('eslint')),
        prettier: extensions.recommendations.filter(e =>
          e.includes('prettier')
        ),
        react: extensions.recommendations.filter(e => e.includes('react')),
        tailwind: extensions.recommendations.filter(e =>
          e.includes('tailwind')
        ),
        debug: extensions.recommendations.filter(e => e.includes('debug')),
        docker: extensions.recommendations.filter(e => e.includes('docker')),
        database: extensions.recommendations.filter(
          e => e.includes('database') || e.includes('sql')
        ),
        git: extensions.recommendations.filter(e => e.includes('git')),
        other: [],
      };

      Object.entries(categories).forEach(([category, exts]) => {
        if (exts.length > 0) {
          log(`    📁 ${category}: ${exts.length} 个`, 'blue');
        }
      });
    }

    return true;
  } else {
    log(`  ❌ ${extensionsPath} 格式错误: ${result.error}`, 'red');
    return false;
  }
}

function checkDocumentation() {
  log('\n📚 检查文档...', 'cyan');
  const readmePath = '.vscode/README.md';

  if (checkFileExists(readmePath)) {
    log(`  ✅ ${readmePath} 存在`, 'green');
    const content = fs.readFileSync(readmePath, 'utf8');
    const lines = content.split('\n').length;
    log(`    共 ${lines} 行`, 'blue');
    return true;
  } else {
    log(`  ⚠️  ${readmePath} 不存在（可选）`, 'yellow');
    return false;
  }
}

function main() {
  log('\n========================================', 'cyan');
  log('  IDE 配置验证工具', 'cyan');
  log('========================================\n', 'cyan');

  const results = [];

  results.push(validateSettings());
  results.push(validateLaunchConfig());
  results.push(validateTasksConfig());
  results.push(validateESLintConfig());
  results.push(validateExtensionsRecommendations());
  results.push(checkDocumentation());

  log('\n========================================', 'cyan');

  const passed = results.filter(r => r).length;
  const total = results.length;

  if (passed === total) {
    log(`\n✅ 所有检查通过！(${passed}/${total})`, 'green');
    log('\n💡 提示：重启 VSCode 以应用所有更改\n', 'yellow');
    process.exit(0);
  } else {
    log(`\n⚠️  ${passed}/${total} 项检查通过`, 'yellow');
    log('\n❗ 请检查上述错误信息\n', 'red');
    process.exit(1);
  }
}

// 运行验证
main();
