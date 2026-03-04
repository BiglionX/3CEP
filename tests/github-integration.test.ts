/**
 * GitHub 数据集成验证脚本
 *
 * 用于测试 GitHub API 服务层、缓存层和组件功能
 */

// 模拟浏览器环境
global.fetch = require('node-fetch') as any;

import { fetchRepoData, formatNumber, formatDate } from '@/lib/github/api';
import {
  getCachedRepoData,
  setCachedRepoData,
  getOrFetchRepoData,
  clearCache,
  getCacheStats,
} from '@/lib/github/cache';

// 测试结果存储
const testResults: Array<{
  name: string;
  passed: boolean;
  error?: string;
}> = [];

// 测试工具函数
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  try {
    console.log(`\n🧪 测试：${name}`);
    await testFn();
    console.log(`✅ 通过`);
    testResults.push({ name, passed: true });
  } catch (error) {
    console.log(`❌ 失败：${(error as Error).message}`);
    testResults.push({
      name,
      passed: false,
      error: (error as Error).message,
    });
  }
}

// ==================== 测试用例 ====================

async function main() {
  console.log('='.repeat(60));
  console.log('ProCyc Skill 商店 - GitHub 数据集成验证');
  console.log('='.repeat(60));

  // 测试 1: 格式化函数
  await runTest('数字格式化函数', async () => {
    assert(formatNumber(100) === '100', '小数字格式化失败');
    assert(formatNumber(1500) === '1.5k', '大数字格式化失败');
    assert(formatNumber(2345) === '2.3k', '大数字格式化失败');
    console.log('   ✓ 数字格式化正确');
  });

  // 测试 2: 日期格式化函数
  await runTest('日期格式化函数', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    assert(formatDate(now.toISOString()) === '今天', '今天格式化失败');
    assert(formatDate(yesterday.toISOString()) === '昨天', '昨天格式化失败');
    assert(formatDate(lastWeek.toISOString()).includes('周'), '周格式化失败');
    console.log('   ✓ 日期格式化正确');
  });

  // 测试 3: 缓存基础功能
  await runTest('缓存基础功能', async () => {
    const mockData = {
      name: 'test-repo',
      fullName: 'procyc-skills/test-repo',
      description: 'Test repository',
      stargazers_count: 100,
      forks_count: 20,
      subscribers_count: 10,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      homepage: null,
      language: 'TypeScript',
      topics: ['test'],
      default_branch: 'main',
      private: false,
    };

    setCachedRepoData('test-repo', mockData);
    const cached = getCachedRepoData('test-repo');

    assert(cached !== null, '缓存数据应为非空');
    assert(cached?.name === 'test-repo', '缓存数据名称错误');
    assert(cached?.stargazers_count === 100, '缓存数据星标数错误');
    console.log('   ✓ 缓存读写正确');
  });

  // 测试 4: 缓存过期机制
  await runTest('缓存过期机制', async () => {
    const mockData = {
      name: 'expiring-repo',
      fullName: 'procyc-skills/expiring-repo',
      description: 'Test',
      stargazers_count: 50,
      forks_count: 5,
      subscribers_count: 2,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      homepage: null,
      language: 'JavaScript',
      topics: [],
      default_branch: 'main',
      private: false,
    };

    setCachedRepoData('expiring-repo', mockData);

    // 立即读取应该存在
    const immediate = getCachedRepoData('expiring-repo', 100); // 100ms TTL
    assert(immediate !== null, '立即读取应该成功');

    // 等待 200ms 后读取应该过期
    await new Promise(resolve => setTimeout(resolve, 200));
    const expired = getCachedRepoData('expiring-repo', 100);
    assert(expired === null, '缓存应该在 100ms 后过期');
    console.log('   ✓ 缓存过期机制正确');
  });

  // 测试 5: 缓存统计
  await runTest('缓存统计功能', async () => {
    setCachedRepoData('repo-1', {
      name: 'repo-1',
      fullName: 'procyc-skills/repo-1',
      description: 'Test',
      stargazers_count: 10,
      forks_count: 1,
      subscribers_count: 1,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      homepage: null,
      language: 'TS',
      topics: [],
      default_branch: 'main',
      private: false,
    });

    setCachedRepoData('repo-2', {
      name: 'repo-2',
      fullName: 'procyc-skills/repo-2',
      description: 'Test',
      stargazers_count: 20,
      forks_count: 2,
      subscribers_count: 2,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      homepage: null,
      language: 'TS',
      topics: [],
      default_branch: 'main',
      private: false,
    });

    const stats = getCacheStats();
    assert(stats.size >= 2, '缓存统计数量错误');
    assert(stats.items.includes('repo-1'), '缓存项列表缺少 repo-1');
    assert(stats.items.includes('repo-2'), '缓存项列表缺少 repo-2');
    console.log('   ✓ 缓存统计功能正确');
  });

  // 测试 6: 清除缓存
  await runTest('清除缓存功能', async () => {
    setCachedRepoData('to-delete', {
      name: 'to-delete',
      fullName: 'procyc-skills/to-delete',
      description: 'Test',
      stargazers_count: 5,
      forks_count: 0,
      subscribers_count: 0,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      homepage: null,
      language: 'TS',
      topics: [],
      default_branch: 'main',
      private: false,
    });

    assert(getCachedRepoData('to-delete') !== null, '缓存设置失败');
    clearCache('to-delete');
    assert(getCachedRepoData('to-delete') === null, '清除缓存失败');
    console.log('   ✓ 清除缓存功能正确');
  });

  // 测试 7: GitHub API 调用（真实 API）
  await runTest('GitHub API 调用（真实数据）', async () => {
    try {
      const data = await fetchRepoData('procyc-find-shop');

      assert(data.name === 'procyc-find-shop', '仓库名称错误');
      assert(data.stargazers_count >= 0, '星标数应该非负');
      assert(data.forks_count >= 0, 'Fork 数应该非负');
      assert(typeof data.description === 'string', '描述应该是字符串');
      assert(Array.isArray(data.topics), '话题应该是数组');

      console.log(`   ✓ API 调用成功`);
      console.log(`     - 星标：${data.stargazers_count}`);
      console.log(`     - Fork: ${data.forks_count}`);
      console.log(`     - 语言：${data.language || '未指定'}`);
    } catch (error) {
      if ((error as Error).message.includes('403')) {
        console.log('   ⚠️  跳过（速率限制）');
        testResults.push({
          name: 'GitHub API 调用（真实数据）',
          passed: true,
          error: '速率限制，跳过',
        });
      } else {
        throw error;
      }
    }
  });

  // 测试 8: 带缓存的 API 调用
  await runTest('带缓存的 API 调用', async () => {
    try {
      // 第一次调用（可能从 API 获取）
      const first = await getOrFetchRepoData('procyc-fault-diagnosis');
      assert(first !== null, '第一次调用应该返回数据');

      // 第二次调用（应该从缓存读取）
      const second = await getOrFetchRepoData('procyc-fault-diagnosis');
      assert(second !== null, '第二次调用应该返回数据');
      assert(second.name === first.name, '两次调用数据应该一致');

      console.log('   ✓ 缓存 API 调用正确');
    } catch (error) {
      if ((error as Error).message.includes('403')) {
        console.log('   ⚠️  跳过（速率限制）');
        testResults.push({
          name: '带缓存的 API 调用',
          passed: true,
          error: '速率限制，跳过',
        });
      } else {
        throw error;
      }
    }
  });

  // 输出最终报告
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 测试报告总结');
  console.log('='.repeat(60));

  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  const skippedCount = testResults.filter(r =>
    r.error?.includes('跳过')
  ).length;

  testResults.forEach((result, index) => {
    const icon = result.passed
      ? result.error?.includes('跳过')
        ? '⚠️'
        : '✅'
      : '❌';
    console.log(
      `${icon} ${index + 1}. ${result.name}${result.error && !result.error.includes('跳过') ? ` - ${result.error}` : ''}`
    );
  });

  console.log(`\n${'-'.repeat(60)}`);
  console.log(`总计：${passedCount}/${totalCount} 通过`);
  console.log(`跳过：${skippedCount}`);
  console.log(
    `通过率：${((passedCount / (totalCount - skippedCount)) * 100).toFixed(1)}%`
  );
  console.log('='.repeat(60));

  if (passedCount === totalCount) {
    console.log('\n🎉 所有测试通过！GitHub 数据集成验证成功！');
    process.exit(0);
  } else {
    console.log('\n❌ 部分测试失败，请检查错误信息。');
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('💥 测试执行失败:', error);
  process.exit(1);
});
