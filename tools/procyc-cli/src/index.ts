#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { initSkill } from './commands/init.js';
import { validateSkill } from './commands/validate.js';
import { listTemplates } from './commands/list.js';
import pkg from '../package.json';

const program = new Command();

program
  .name('procyc-skill')
  .description('ProCyc Skill 脚手架工具')
  .version(pkg.version);

// init 命令
program
  .command('init <skill-name>')
  .description('初始化一个新的 Skill 项目')
  .option(
    '-t, --template <template>',
    '使用指定模板 (typescript|javascript|python)',
    'typescript'
  )
  .option('-c, --category <category>', '技能分类 (如 DIAG, ESTM, LOCA 等)')
  .option('--dry-run', '预览将创建的文件而不实际创建')
  .action(async (skillName, options) => {
    const spinner = ora(`正在初始化 Skill: ${skillName}`).start();

    try {
      await initSkill(skillName, options);
      spinner.succeed(chalk.green('Skill 项目创建成功!'));
      console.log(chalk.cyan(`\n下一步:`));
      console.log(`  cd ${skillName}`);
      console.log('  npm install');
      console.log('  npm run dev\n');
    } catch (error: any) {
      spinner.fail(chalk.red('创建失败'));
      console.error(chalk.red(error.message || '未知错误'));
      process.exit(1);
    }
  });

// validate 命令
program
  .command('validate')
  .description('验证当前 Skill 项目是否符合规范')
  .option('--strict', '严格模式，警告也会报错')
  .action(async options => {
    const spinner = ora('正在验证 Skill 配置').start();

    try {
      const result = await validateSkill(process.cwd(), options);
      if (result.valid) {
        spinner.succeed(chalk.green('验证通过'));
        console.log(chalk.green(`✓ ${result.messages.join('\n✓ ')}`));
      } else {
        spinner.fail(chalk.red('验证失败'));
        result.errors.forEach(err => console.error(chalk.red(`✗ ${err}`)));
        process.exit(1);
      }
    } catch (error: any) {
      spinner.fail(chalk.red('验证过程出错'));
      console.error(chalk.red(error.message || '未知错误'));
      process.exit(1);
    }
  });

// list 命令
program
  .command('list')
  .description('列出可用的技能模板')
  .option('--category <category>', '按分类过滤')
  .action(async options => {
    try {
      const templates = await listTemplates(options);
      console.log(chalk.blue('\n可用模板:\n'));

      if (templates.length === 0) {
        console.log(chalk.yellow('没有找到匹配的模板'));
        return;
      }

      templates.forEach(template => {
        console.log(chalk.cyan(`  ${template.name}`));
        console.log(chalk.gray(`    ${template.description}`));
        console.log(chalk.gray(`    分类：${template.category}`));
        console.log(chalk.gray(`    标签：${template.tags.join(', ')}\n`));
      });
    } catch (error: any) {
      console.error(chalk.red('获取模板列表失败'));
      console.error(chalk.red(error.message || '未知错误'));
      process.exit(1);
    }
  });

// 生成 SKILL.md 的命令
program
  .command('generate-skill-md')
  .description('根据交互式问答生成 SKILL.md 文件')
  .action(async () => {
    const spinner = ora('正在生成 SKILL.md').start();

    try {
      // 这里会调用交互式生成器
      console.log(chalk.cyan('\n请回答以下问题以生成 SKILL.md:\n'));
      // TODO: 实现交互式生成逻辑
      spinner.succeed(chalk.green('SKILL.md 生成成功'));
    } catch (error: any) {
      spinner.fail(chalk.red('生成失败'));
      console.error(chalk.red(error.message || '未知错误'));
      process.exit(1);
    }
  });

program.parse(process.argv);
