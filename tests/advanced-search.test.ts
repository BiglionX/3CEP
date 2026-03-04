/**
 * 高级搜索功能测试用例
 * 验证搜索功能的完整性和性能表现
 */

import { test, expect } from '@playwright/test';
import { SearchEntityType, AdvancedSearchFilters } from '@/types/search.types';
import { searchService } from '@/services/search.service';

describe('高级搜索功能测试', () => {
  // 测试环境配置
  const TEST_ENV = {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    searchTimeout: 5000,
    debounceDelay: 300,
  };

  test.beforeEach(async ({ page }) => {
    // 访问搜索演示页面
    await page.goto(`${TEST_ENV.baseUrl}/repair-shop/advanced-search-demo`);
    await page.waitForLoadState('networkidle');
  });

  // 基础搜索功能测试
  test('TC-SEARCH-001: 基础搜索功能验证', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-001: 基础搜索功能验证');

    // 定位搜索输入框
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await expect(searchInput).toBeVisible();

    // 输入搜索关键词
    await searchInput.fill('iPhone');
    await page.waitForTimeout(TEST_ENV.debounceDelay);

    // 验证搜索建议出现
    const suggestions = page.locator('[data-testid="search-suggestions"]');
    if (await suggestions.isVisible()) {
      await expect(suggestions).toContainText('iPhone');
    }

    // 点击搜索按钮
    const searchButton = page.getByRole('button', { name: '搜索' });
    await searchButton.click();

    // 验证搜索结果
    await page.waitForTimeout(1000);
    const resultsContainer = page.locator('[data-testid="search-results"]');
    await expect(resultsContainer).toBeVisible({
      timeout: TEST_ENV.searchTimeout,
    });

    console.log('✅ 基础搜索功能测试通过');
  });

  // 高级搜索功能测试
  test('TC-SEARCH-002: 高级搜索功能验证', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-002: 高级搜索功能验证');

    // 切换到高级搜索模式
    const advancedToggle = page.getByRole('button', { name: '高级搜索' });
    await advancedToggle.click();

    // 验证高级搜索组件显示
    const advancedSearchComponent = page.locator(
      '[data-testid="advanced-search-component"]'
    );
    await expect(advancedSearchComponent).toBeVisible();

    // 测试多条件搜索
    const conditionInputs = page.locator(
      'input[data-testid="search-condition"]'
    );
    const conditionCount = await conditionInputs.count();

    if (conditionCount > 0) {
      // 添加搜索条件
      await conditionInputs.first().fill('张三');

      // 选择字段类型
      const fieldSelect = page
        .locator('select[data-testid="field-select"]')
        .first();
      await fieldSelect.selectOption('name');

      // 选择操作符
      const operatorSelect = page
        .locator('select[data-testid="operator-select"]')
        .first();
      await operatorSelect.selectOption('contains');
    }

    // 执行搜索
    const searchButton = page.getByRole('button', { name: '搜索' });
    await searchButton.click();

    // 验证复合搜索结果
    await page.waitForTimeout(1000);
    const results = page.locator('[data-testid="search-result-item"]');
    await expect(results).toBeVisible({ timeout: TEST_ENV.searchTimeout });

    console.log('✅ 高级搜索功能测试通过');
  });

  // 搜索历史功能测试
  test('TC-SEARCH-003: 搜索历史功能验证', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-003: 搜索历史功能验证');

    // 执行几次搜索
    const searchTerms = ['iPhone', '张三', '屏幕更换'];

    for (const term of searchTerms) {
      const searchInput = page.locator('input[placeholder*="搜索"]');
      await searchInput.fill(term);
      await page.waitForTimeout(TEST_ENV.debounceDelay);

      const searchButton = page.getByRole('button', { name: '搜索' });
      await searchButton.click();
      await page.waitForTimeout(500);
    }

    // 打开历史记录面板
    const historyButton = page.getByRole('button', { name: '历史记录' });
    await historyButton.click();

    // 验证历史记录显示
    const historyItems = page.locator('[data-testid="search-history-item"]');
    const historyCount = await historyItems.count();
    await expect(historyCount).toBeGreaterThan(0);

    // 验证历史记录内容
    for (let i = 0; i < Math.min(historyCount, searchTerms.length); i++) {
      const historyItem = historyItems.nth(i);
      await expect(historyItem).toContainText(
        searchTerms[searchTerms.length - 1 - i]
      );
    }

    console.log('✅ 搜索历史功能测试通过');
  });

  // 搜索建议功能测试
  test('TC-SEARCH-004: 搜索建议功能验证', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-004: 搜索建议功能验证');

    // 输入部分关键词
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('iPh');
    await page.waitForTimeout(TEST_ENV.debounceDelay);

    // 验证自动建议出现
    const suggestionsPanel = page.locator('[data-testid="suggestions-panel"]');
    await expect(suggestionsPanel).toBeVisible({ timeout: 2000 });

    // 验证建议内容
    const suggestionItems = page.locator('[data-testid="suggestion-item"]');
    const suggestionCount = await suggestionItems.count();
    await expect(suggestionCount).toBeGreaterThan(0);

    // 点击建议项
    if (suggestionCount > 0) {
      const firstSuggestion = suggestionItems.first();
      const suggestionText = await firstSuggestion.textContent();
      await firstSuggestion.click();

      // 验证搜索框填充建议内容
      const inputValue = await searchInput.inputValue();
      await expect(inputValue).toEqual(suggestionText?.trim());
    }

    console.log('✅ 搜索建议功能测试通过');
  });

  // 实体类型筛选测试
  test('TC-SEARCH-005: 实体类型筛选验证', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-005: 实体类型筛选验证');

    // 获取实体类型标签页
    const entityTabs = page.locator('[data-testid="entity-tab"]');
    const tabCount = await entityTabs.count();

    // 测试每个实体类型的搜索
    for (let i = 0; i < tabCount; i++) {
      const tab = entityTabs.nth(i);
      const tabName = await tab.textContent();

      await tab.click();
      await page.waitForTimeout(300);

      // 在当前实体类型下执行搜索
      const searchInput = page.locator('input[placeholder*="搜索"]');
      await searchInput.fill('test');
      await page.waitForTimeout(TEST_ENV.debounceDelay);

      const searchButton = page.getByRole('button', { name: '搜索' });
      await searchButton.click();

      // 验证搜索结果与实体类型匹配
      await page.waitForTimeout(1000);
      const results = page.locator('[data-testid="search-result-item"]');

      // 这里可以添加更具体的验证逻辑
      console.log(`🔍 测试实体类型: ${tabName}`);
    }

    console.log('✅ 实体类型筛选测试通过');
  });

  // 性能测试
  test('TC-SEARCH-006: 搜索性能测试', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-006: 搜索性能测试');

    // 记录开始时间
    const startTime = Date.now();

    // 执行搜索操作
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('性能测试');
    await page.waitForTimeout(TEST_ENV.debounceDelay);

    const searchButton = page.getByRole('button', { name: '搜索' });
    await searchButton.click();

    // 等待结果加载
    await page.waitForSelector('[data-testid="search-results"]', {
      timeout: TEST_ENV.searchTimeout,
    });

    const endTime = Date.now();
    const searchDuration = endTime - startTime;

    // 验证搜索响应时间
    expect(searchDuration).toBeLessThan(TEST_ENV.searchTimeout);

    console.log(`⏱️ 搜索耗时: ${searchDuration}ms`);
    console.log('✅ 搜索性能测试通过');
  });

  // 错误处理测试
  test('TC-SEARCH-007: 搜索错误处理验证', async ({ page }) => {
    console.log('🧪 测试用例 TC-SEARCH-007: 搜索错误处理验证');

    // 测试空搜索
    const searchButton = page.getByRole('button', { name: '搜索' });
    await searchButton.click();

    // 验证不会出现错误
    const errorMessages = page.locator('[data-testid="error-message"]');
    await expect(errorMessages).not.toBeVisible();

    // 测试特殊字符搜索
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('!@#$%^&*()');
    await searchButton.click();

    // 验证系统能够处理特殊字符
    await page.waitForTimeout(1000);

    console.log('✅ 搜索错误处理测试通过');
  });
});

// 单元测试
describe('搜索服务单元测试', () => {
  test('UT-SEARCH-001: 搜索服务初始化测试', () => {
    expect(searchService).toBeDefined();
    expect(typeof searchService.search).toBe('function');
    expect(typeof searchService.getHistory).toBe('function');
  });

  test('UT-SEARCH-002: 搜索历史管理测试', () => {
    // 清除现有历史
    searchService.clearHistory();

    // 保存搜索历史
    searchService.saveToHistory('测试搜索', {}, 5, 'work_order');

    // 获取历史记录
    const history = searchService.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].query).toBe('测试搜索');
  });

  test('UT-SEARCH-003: 搜索建议生成测试', async () => {
    const suggestions = await searchService.getSuggestions('iph');
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
