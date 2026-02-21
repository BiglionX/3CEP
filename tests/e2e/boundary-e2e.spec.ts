import { test, expect } from '@playwright/test';

test.describe('边界情况端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('TC-001: 点赞3次触发草稿沉淀', async ({ page }) => {
    // 导航到内容页面
    await page.goto('/content/sample-content');
    
    // 获取初始点赞数
    const initialLikes = await page.locator('[data-testid="like-count"]').textContent();
    const initialCount = parseInt(initialLikes || '0');
    
    // 点赞直到第3次
    for (let i = 0; i < (3 - initialCount); i++) {
      await page.click('[data-testid="like-button"]');
      await page.waitForTimeout(500); // 等待动画完成
    }
    
    // 验证草稿创建提示
    await expect(page.locator('[data-testid="draft-success-toast"]')).toBeVisible({ timeout: 5000 });
    
    // 验证草稿指示器
    await expect(page.locator('[data-testid="draft-indicator"]')).toBeVisible();
    
    // 验证按钮状态变化
    await expect(page.locator('[data-testid="like-button"]')).toBeDisabled();
  });

  test('TC-002: 点赞超过3次不重复触发', async ({ page }) => {
    await page.goto('/content/sample-content');
    
    // 先点赞到3次
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="like-button"]');
      await page.waitForTimeout(300);
    }
    
    // 尝试第4次点赞
    const draftCountBefore = await page.locator('[data-testid="draft-count"]').count();
    await page.click('[data-testid="like-button"]');
    await page.waitForTimeout(500);
    
    // 验证草稿数量没有增加
    const draftCountAfter = await page.locator('[data-testid="draft-count"]').count();
    expect(draftCountAfter).toEqual(draftCountBefore);
  });

  test('TC-004: 重复URL上传拒绝', async ({ page }) => {
    await page.goto('/upload');
    
    // 输入已存在的URL
    await page.fill('[data-testid="url-input"]', 'https://example.com/existing-content');
    await page.click('[data-testid="submit-button"]');
    
    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('该URL已存在');
    
    // 验证toast提示
    await expect(page.locator('.toast-error')).toBeVisible();
  });

  test('TC-005: URL格式验证', async ({ page }) => {
    await page.goto('/upload');
    
    // 输入无效URL
    await page.fill('[data-testid="url-input"]', 'not-a-valid-url');
    await page.click('[data-testid="submit-button"]');
    
    // 验证格式错误提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('请输入有效的URL格式');
  });

  test('TC-007: 搜索无结果友好提示', async ({ page }) => {
    await page.goto('/search');
    
    // 搜索不存在的关键词
    await page.fill('[data-testid="search-input"]', 'nonexistent-keyword-xyz123');
    await page.click('[data-testid="search-button"]');
    
    // 验证无结果提示
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible({ timeout: 5000 });
    
    // 验证建议内容显示
    await expect(page.locator('[data-testid="suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggestions"] li')).toHaveCount(4);
    
    // 验证搜索结果统计
    await expect(page.locator('[data-testid="search-stats"]')).toContainText('0 个相关结果');
  });

  test('TC-010: 预约时间冲突处理', async ({ page }) => {
    await page.goto('/schedule');
    
    // 选择冲突时间段
    await page.click('[data-testid="slot-1000-1100"]');
    
    // 验证冲突警告
    await expect(page.locator('[data-testid="conflict-error"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="conflict-error"]'))
      .toContainText('时间冲突');
    
    // 验证确认按钮被禁用
    await expect(page.locator('[data-testid="confirm-appointment"]')).toBeDisabled();
  });

  test('TC-012: 连续时间段预约', async ({ page }) => {
    await page.goto('/schedule');
    
    // 选择可用时间段
    await page.click('[data-testid="slot-1100-1200"]');
    
    // 验证选择状态
    await expect(page.locator('[data-testid="slot-1100-1200"] [data-lucide="check-circle"]')).toBeVisible();
    
    // 确认预约
    await page.click('[data-testid="confirm-appointment"]');
    
    // 验证成功提示
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });
});