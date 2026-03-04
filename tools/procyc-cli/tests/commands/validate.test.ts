import { validateSkill } from '../src/commands/validate';
import fs from 'fs-extra';
import path from 'path';

describe('Validate Command', () => {
  const testDir = path.join(process.cwd(), 'test-fixtures', 'valid-skill');

  beforeAll(async () => {
    // 创建测试目录
    await fs.ensureDir(testDir);

    // 创建有效的 SKILL.md
    const validSkillMd = `---
name: procyc-test-skill
description: This is a test skill for validation purposes only
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
pricing:
  model: free
  currency: FCX
  amount: 0
author:
  name: Test Author
  email: test@example.com
tags:
  - category:TEST
  - subcategory:TEST.GENERAL
  - typescript
---
`;
    await fs.writeFile(path.join(testDir, 'SKILL.md'), validSkillMd);
  });

  afterAll(async () => {
    // 清理测试文件
    await fs.remove(testDir);
  });

  it('应该验证有效的 Skill 配置', async () => {
    const result = await validateSkill(testDir, {});

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it('应该检测缺失的 SKILL.md 文件', async () => {
    const emptyDir = path.join(process.cwd(), 'test-fixtures', 'empty');
    await fs.ensureDir(emptyDir);

    const result = await validateSkill(emptyDir, {});

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('缺少 SKILL.md 文件');

    await fs.remove(emptyDir);
  });

  it('应该在严格模式下将警告视为错误', async () => {
    const result = await validateSkill(testDir, { strict: true });

    // 由于测试配置不完整，严格模式应该会失败
    if (result.warnings.length > 0) {
      expect(result.valid).toBe(false);
    }
  });
});
