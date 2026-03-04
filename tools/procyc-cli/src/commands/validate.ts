import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import yaml from 'js-yaml';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  messages: string[];
}

export async function validateSkill(
  projectDir: string,
  options: { strict?: boolean }
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    messages: [],
  };

  // 检查 SKILL.md 是否存在
  const skillMdPath = path.join(projectDir, 'SKILL.md');
  if (!(await fs.pathExists(skillMdPath))) {
    result.errors.push('缺少 SKILL.md 文件');
    result.valid = false;
    return result;
  }

  // 读取并解析 SKILL.md
  let skillData: any;
  try {
    const content = await fs.readFile(skillMdPath, 'utf-8');
    skillData = yaml.load(content);
  } catch (error: any) {
    result.errors.push(`SKILL.md 解析失败：${error.message || '未知错误'}`);
    result.valid = false;
    return result;
  }

  // 验证必填字段
  const requiredFields = [
    'name',
    'description',
    'version',
    'input',
    'output',
    'pricing',
    'author',
    'tags',
  ];
  for (const field of requiredFields) {
    if (!skillData[field]) {
      result.errors.push(`缺少必填字段：${field}`);
      result.valid = false;
    }
  }

  if (!result.valid) {
    return result;
  }

  // 验证 name 格式
  if (!skillData.name.startsWith('procyc-')) {
    result.errors.push('技能名称必须以 "procyc-" 开头');
    result.valid = false;
  }

  if (!/^[a-z0-9-]+$/.test(skillData.name)) {
    result.errors.push('技能名称只能包含小写字母、数字和连字符');
    result.valid = false;
  }

  // 验证 description 长度
  if (skillData.description.length < 50 || skillData.description.length > 200) {
    result.warnings.push('描述长度应在 50-200 字符之间');
  }

  // 验证 version 格式
  if (!/^\d+\.\d+\.\d+$/.test(skillData.version)) {
    result.errors.push('版本号格式不正确，应为 MAJOR.MINOR.PATCH');
    result.valid = false;
  }

  // 验证 pricing
  const validPricingModels = ['free', 'pay-per-call', 'subscription'];
  if (!validPricingModels.includes(skillData.pricing.model)) {
    result.errors.push(`无效的定价模式：${skillData.pricing.model}`);
    result.valid = false;
  }

  // 验证 tags
  if (!Array.isArray(skillData.tags)) {
    result.errors.push('tags 必须是数组');
    result.valid = false;
  } else {
    const hasCategory = skillData.tags.some((tag: string) =>
      tag.startsWith('category:')
    );
    const hasSubcategory = skillData.tags.some((tag: string) =>
      tag.startsWith('subcategory:')
    );

    if (!hasCategory) {
      result.errors.push('缺少一级分类标签（如 category:DIAG）');
      result.valid = false;
    }

    if (!hasSubcategory) {
      result.warnings.push('建议添加二级分类标签（如 subcategory:DIAG.HW）');
    }
  }

  // 检查必要文件
  const requiredFiles = ['README.md', 'LICENSE', '.gitignore'];
  for (const file of requiredFiles) {
    const filePath = path.join(projectDir, file);
    if (!(await fs.pathExists(filePath))) {
      result.warnings.push(`缺少推荐文件：${file}`);
    }
  }

  // 检查测试文件
  const testsDir = path.join(projectDir, 'tests');
  if (!(await fs.pathExists(testsDir))) {
    result.warnings.push('缺少测试目录');
  } else {
    const testFiles = await fs.readdir(testsDir);
    if (
      testFiles.length === 0 ||
      (testFiles.length === 1 && testFiles[0] === '.gitkeep')
    ) {
      result.warnings.push('测试目录为空，建议添加测试用例');
    }
  }

  // 检查文档
  const docsDir = path.join(projectDir, 'docs');
  if (!(await fs.pathExists(docsDir))) {
    result.warnings.push('缺少 docs 目录');
  } else {
    const apiDocPath = path.join(docsDir, 'API.md');
    if (!(await fs.pathExists(apiDocPath))) {
      result.warnings.push('缺少 API 文档 (docs/API.md)');
    }
  }

  // 生成成功消息
  if (result.valid) {
    result.messages.push('SKILL.md 配置正确');
    result.messages.push(`技能名称：${skillData.name}`);
    result.messages.push(`版本：${skillData.version}`);
    result.messages.push(
      `分类：${skillData.tags.filter((t: string) => t.startsWith('category:') || t.startsWith('subcategory:')).join(', ')}`
    );

    if (options.strict && result.warnings.length > 0) {
      result.valid = false;
      result.errors.push(...result.warnings.map(w => `[严格模式] ${w}`));
    }
  }

  return result;
}
