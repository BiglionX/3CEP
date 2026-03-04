/**
 * ProCyc Skill 商店 - 端到端测试脚本
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
};

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<TestResult> {
  const startTime = Date.now();
  try {
    await testFn();
    return {
      name,
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : '未知错误',
      duration: Date.now() - startTime,
    };
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('🧪 ProCyc Skill 商店 - 端到端测试');
  console.log('='.repeat(80));
  console.log('');

  const results: TestResult[] = [];

  // 测试 1: 首页加载
  console.log('📋 测试组 1: 首页加载');
  console.log('-'.repeat(80));

  results.push(
    await runTest('首页应该正常加载', async () => {
      const response = await fetch(`${BASE_URL}/skill-store`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      if (!text.includes('ProCyc Skill')) {
        throw new Error('页面内容不包含 "ProCyc Skill"');
      }
      console.log('   ✅ 首页加载成功');
    })
  );

  // 测试 2: 技能列表页
  console.log('');
  console.log('📋 测试组 2: 技能列表页');
  console.log('-'.repeat(80));

  results.push(
    await runTest('技能列表页应该显示所有技能', async () => {
      const response = await fetch(`${BASE_URL}/skill-store/skills`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();

      const requiredSkills = [
        'procyc-find-shop',
        'procyc-fault-diagnosis',
        'procyc-part-lookup',
        'procyc-estimate-value',
      ];

      for (const skill of requiredSkills) {
        if (!text.includes(skill)) {
          throw new Error(`技能列表缺少：${skill}`);
        }
      }

      console.log('   ✅ 所有核心技能都在列表中');
    })
  );

  // 测试 3: 详情页
  console.log('');
  console.log('📋 测试组 3: 技能详情页');
  console.log('-'.repeat(80));

  const detailPages = [
    '/skill-store/find-shop',
    '/skill-store/fault-diagnosis',
    '/skill-store/part-lookup',
    '/skill-store/estimate-value',
  ];

  for (const page of detailPages) {
    results.push(
      await runTest(`详情页 ${page} 应该正常加载`, async () => {
        const response = await fetch(`${BASE_URL}${page}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log(`   ✅ ${page} 加载成功`);
      })
    );
  }

  // 测试 4: 沙箱功能
  console.log('');
  console.log('📋 测试组 4: 沙箱功能');
  console.log('-'.repeat(80));

  results.push(
    await runTest('沙箱页面应该正常加载', async () => {
      const response = await fetch(`${BASE_URL}/skill-store/sandbox`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();

      if (!text.includes('技能测试沙箱')) {
        throw new Error('沙箱页面标题不正确');
      }

      console.log('   ✅ 沙箱页面加载成功');
    })
  );

  results.push(
    await runTest('技能执行 API 应该正确响应（无认证）', async () => {
      const response = await fetch(
        `${BASE_URL}/api/v1/skills/procyc-find-shop/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: '1.0.0',
            parameters: {
              latitude: 39.9042,
              longitude: 116.4074,
              radius: 10,
              limit: 5,
            },
          }),
        }
      );

      if (response.status !== 401) {
        throw new Error(`期望状态码 401，实际：${response.status}`);
      }

      const data = await response.json();
      if (data.error?.code !== 'SKILL_002') {
        throw new Error('错误码应该是 SKILL_002');
      }

      console.log('   ✅ API 认证检查正确');
    })
  );

  // 测试 5: 文档完整性
  console.log('');
  console.log('📋 测试组 5: 文档完整性');
  console.log('-'.repeat(80));

  const fs = require('fs');
  const path = require('path');

  results.push(
    await runTest('运行时协议文档应该存在', async () => {
      const docPath = path.join(
        process.cwd(),
        'docs/standards/procyc-skill-runtime-protocol.md'
      );

      if (!fs.existsSync(docPath)) {
        throw new Error('运行时协议文档不存在');
      }

      const content = fs.readFileSync(docPath, 'utf-8');
      if (
        !content.includes('统一请求格式') ||
        !content.includes('统一响应格式')
      ) {
        throw new Error('文档内容不完整');
      }

      console.log('   ✅ 运行时协议文档完整');
    })
  );

  // 输出报告
  console.log('');
  console.log('='.repeat(80));
  console.log('📊 测试报告总结');
  console.log('='.repeat(80));
  console.log('');

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    const duration =
      result.duration < 1000
        ? `${result.duration}ms`
        : `${(result.duration / 1000).toFixed(2)}s`;

    console.log(
      `${icon} ${index + 1}. ${result.name} (${duration})${
        result.error ? ` - ❌ ${result.error}` : ''
      }`
    );
  });

  console.log('');
  console.log('-'.repeat(80));
  console.log(`总计：${passedCount}/${totalCount} 通过`);
  console.log(`通过率：${((passedCount / totalCount) * 100).toFixed(1)}%`);
  console.log(`总耗时：${totalDuration}ms`);
  console.log('='.repeat(80));
  console.log('');

  if (passedCount === totalCount) {
    console.log('🎉 所有测试通过！\n');
    process.exit(0);
  } else {
    const failedTests = results.filter(r => !r.passed);
    console.log('❌ 以下测试失败:\n');
    failedTests.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name}: ${result.error}`);
    });
    console.log('');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
