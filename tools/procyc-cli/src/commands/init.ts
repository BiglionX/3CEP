import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';

// 获取模板目录路径
const TEMPLATES_DIR = path.join(process.cwd(), 'templates');

interface InitOptions {
  template: 'typescript' | 'javascript' | 'python';
  category?: string;
  dryRun?: boolean;
}

export async function initSkill(
  skillName: string,
  options: InitOptions
): Promise<void> {
  // 验证技能名称
  const validation = validatePackageName(skillName);
  if (!validation.validForNewPackages) {
    const errors = [
      ...(validation.errors || []),
      ...(validation.warnings || []),
    ].join(', ');
    throw new Error(`无效的技能名称：${errors}`);
  }

  // 检查是否以 procyc- 开头
  if (!skillName.startsWith('procyc-')) {
    throw new Error('技能名称必须以 "procyc-" 开头');
  }

  const targetDir = path.join(process.cwd(), skillName);

  // 检查目录是否已存在
  if (await fs.pathExists(targetDir)) {
    throw new Error(`目录 ${targetDir} 已存在`);
  }

  if (options.dryRun) {
    console.log(chalk.blue('\n[预览模式] 将创建以下文件:\n'));
    await previewFiles(targetDir, options);
    return;
  }

  // 创建项目结构
  await createProjectStructure(targetDir, skillName, options);

  // 复制模板文件
  await copyTemplateFiles(targetDir, options.template);

  // 生成 SKILL.md 模板
  await generateSkillMd(targetDir, skillName, options);

  console.log(chalk.green(`\n✓ Skill 项目 "${skillName}" 创建成功!`));
}

async function previewFiles(
  targetDir: string,
  options: InitOptions
): Promise<void> {
  const files = getProjectStructure(targetDir, options);
  files.forEach(file => {
    console.log(`  ${file}`);
  });
}

function getProjectStructure(
  targetDir: string,
  options: InitOptions
): string[] {
  const baseFiles = [
    path.join(targetDir, 'SKILL.md'),
    path.join(targetDir, 'README.md'),
    path.join(targetDir, 'LICENSE'),
    path.join(targetDir, '.gitignore'),
    path.join(targetDir, 'docs', 'API.md'),
    path.join(targetDir, 'docs', 'EXAMPLES.md'),
    path.join(targetDir, 'tests', 'unit', '.gitkeep'),
    path.join(targetDir, 'tests', 'integration', '.gitkeep'),
  ];

  if (options.template === 'typescript' || options.template === 'javascript') {
    baseFiles.push(
      path.join(targetDir, 'package.json'),
      path.join(targetDir, 'tsconfig.json'),
      path.join(targetDir, 'src', 'index.ts'),
      path.join(targetDir, 'src', 'handler.ts'),
      path.join(targetDir, 'src', 'types.ts')
    );
  } else if (options.template === 'python') {
    baseFiles.push(
      path.join(targetDir, 'requirements.txt'),
      path.join(targetDir, 'setup.py'),
      path.join(targetDir, 'src', '__init__.py'),
      path.join(targetDir, 'src', 'handler.py')
    );
  }

  return baseFiles;
}

async function createProjectStructure(
  targetDir: string,
  skillName: string,
  options: InitOptions
): Promise<void> {
  const files = getProjectStructure(targetDir, options);

  for (const file of files) {
    await fs.ensureDir(path.dirname(file));
    if (file.endsWith('.gitkeep')) {
      await fs.createFile(file);
    }
  }
}

async function copyTemplateFiles(
  targetDir: string,
  template: string
): Promise<void> {
  // 使用 CLI 工具目录下的 templates 文件夹
  const cliDir = path.dirname(__dirname); // procyc-cli/dist
  const templateDir = path.join(cliDir, 'templates', template);

  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`模板 "${template}" 不存在`);
  }

  await fs.copy(templateDir, targetDir, { overwrite: true });
}

async function generateSkillMd(
  targetDir: string,
  skillName: string,
  options: InitOptions
): Promise<void> {
  const skillMdContent = `---
name: ${skillName}
description: TODO: 请补充技能描述（50-200 字符）
version: 1.0.0
input:
  type: object
  required: []
  properties: {}
output:
  type: object
  properties:
    success:
      type: boolean
      description: 执行是否成功
    data:
      type: object|null
      description: 返回的数据结果
    error:
      type: object|null
      properties:
        code: string
        message: string
    metadata:
      type: object
      properties:
        executionTimeMs: number
        timestamp: string
        version: string
pricing:
  model: free
  currency: FCX
  amount: 0
  freeQuota: 1000
author:
  name: TODO
  email: TODO
tags:
  - category:TODO  # 从分类体系中选择，如 DIAG, ESTM, LOCA 等
  - subcategory:TODO  # 二级分类，如 DIAG.HW
  - typescript  # 根据实际技术栈调整
  - tested
  - documented
env:
  variables: {}
dependencies:
  npm: []
  python: []
examples:
  - name: 基本示例
    input: {}
    output:
      success: true
      data: {}
changelog:
  - version: 1.0.0
    date: "${new Date().toISOString().split('T')[0]}"
    changes:
      - "初始版本"
---

# ${skillName}

## 功能说明

TODO: 详细描述技能的功能和使用场景

## 输入参数

TODO: 详细说明每个输入参数的含义和约束

## 输出结果

TODO: 详细说明输出结果的结构和含义

## 使用示例

\`\`\`typescript
// TODO: 添加代码示例
\`\`\`

## 错误处理

| 错误码 | 说明 |
|--------|------|
| SKILL_001 | 输入参数验证失败 |
| SKILL_006 | 内部错误 |

## 性能指标

- P95 延迟：< 2 秒
- 并发支持：是
- 缓存优化：否

## 依赖服务

TODO: 列出依赖的第三方服务和 API

## 安全说明

TODO: 说明安全相关的注意事项

## 变更日志

### 1.0.0

- 初始版本
`;

  await fs.writeFile(path.join(targetDir, 'SKILL.md'), skillMdContent);
}
