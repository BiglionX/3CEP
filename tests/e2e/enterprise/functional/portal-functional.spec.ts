/**
 * 企业服务门户功能测试
 * 测试企业首页和服务介绍页面的基本功能
 */

import { test, expect } from '@playwright/test';
import { createEnterpriseTestUtils } from '../utils/test-utils';
import { ENTERPRISE_ROUTES } from '../enterprise.config';

test.describe('企业服务门户功能测试', () => {
  test('企业首页访问和基本内容验证', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    // 导航到企业首页
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 验证页面标题
    await expect(page).toHaveTitle(/企业服务|Enterprise Service/);

    // 验证主要内容区域存在
    await expect(page.getByRole('main')).toBeVisible();

    // 验证导航栏存在
    await expect(page.getByRole('navigation')).toBeVisible();

    // 验证页脚存在
    await expect(page.getByRole('contentinfo')).toBeVisible();

    // 验证关键内容元素
    await expect(page.getByText('企业服务')).toBeVisible();
    await expect(page.getByText(/智能体|AI助手|采购|供应链/)).toBeVisible();

    // 截图保存
    await enterpriseUtils.takeScreenshot('portal-homepage');
  });

  test('企业服务介绍页面功能验证', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    // 导航到服务页面
    await enterpriseUtils.navigateTo('/enterprise/services');

    // 验证服务页面标题
    await expect(page).toHaveTitle(/服务介绍|Services/);

    // 验证服务卡片展示
    const serviceCards = page.locator('[data-testid="service-card"]');
    await expect(serviceCards).toHaveCount(3); // 假设有3个核心服务

    // 验证每个服务卡片的内容
    for (let i = 0; i < 3; i++) {
      const card = serviceCards.nth(i);
      await expect(card.getByRole('heading')).toBeVisible();
      await expect(card.getByText(/描述|description/i)).toBeVisible();
    }

    // 验证CTA按钮存在
    await expect(
      page.getByRole('button', { name: /立即咨询|联系我们|获取报价/ })
    ).toBeVisible();
  });

  test('企业联系方式页面功能验证', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    // 导航到联系页面
    await enterpriseUtils.navigateTo('/enterprise/contact');

    // 验证联系表单存在
    const contactForm = page.locator('form[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // 验证表单字段
    await expect(
      contactForm.getByPlaceholder(/公司名称|企业名称/)
    ).toBeVisible();
    await expect(contactForm.getByPlaceholder(/联系人/)).toBeVisible();
    await expect(contactForm.getByPlaceholder(/电话|手机/)).toBeVisible();
    await expect(contactForm.getByPlaceholder(/邮箱/)).toBeVisible();

    // 验证联系方式展示
    await expect(page.getByText(/电话|Phone/)).toBeVisible();
    await expect(page.getByText(/邮箱|Email/)).toBeVisible();
    await expect(page.getByText(/地址|Address/)).toBeVisible();
  });

  test('企业门户响应式布局测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    // 测试桌面端布局
    await enterpriseUtils.setViewport('desktop');
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 验证桌面端特有元素
    await expect(page.getByTestId('desktop-navigation')).toBeVisible();

    // 测试移动端布局
    await enterpriseUtils.setViewport('mobile');
    await page.reload(); // 重新加载以适应视窗变化

    // 验证移动端特有元素
    await expect(page.getByTestId('mobile-menu-button')).toBeVisible();

    // 测试菜单切换
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    // 截图保存移动端视图
    await enterpriseUtils.takeScreenshot('portal-mobile-view');
  });

  test('企业门户导航功能测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 测试主导航链接
    const navLinks = [
      { selector: 'a[href="/enterprise"]', expectedPath: '/enterprise' },
      {
        selector: 'a[href="/enterprise/services"]',
        expectedPath: '/enterprise/services',
      },
      {
        selector: 'a[href="/enterprise/contact"]',
        expectedPath: '/enterprise/contact',
      },
    ];

    for (const link of navLinks) {
      await page.click(link.selector);
      await page.waitForURL(`**${link.expectedPath}`);
      expect(page.url()).toContain(link.expectedPath);

      // 返回首页继续测试
      if (link.expectedPath !== '/enterprise') {
        await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);
      }
    }
  });

  test('企业门户SEO和可访问性测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 验证meta标签
    const metaDescription = await page.getAttribute(
      'meta[name="description"]',
      'content'
    );
    expect(metaDescription).toBeTruthy();

    // 验证语义化标签
    await expect(page.getByRole('banner')).toBeVisible(); // header
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible(); // footer

    // 验证图片alt属性
    const images = page.locator('img');
    if ((await images.count()) > 0) {
      for (let i = 0; i < (await images.count()); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }

    // 验证键盘导航
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeDefined();
  });

  test('企业门户加载性能测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 测量页面性能指标
    const metrics = await enterpriseUtils.measurePerformance();

    // 验证性能指标符合要求
    await enterpriseUtils.validatePerformanceMetrics(metrics);

    console.log('页面性能指标:', {
      loadTime: `${metrics.loadTime}ms`,
      domContentLoaded: `${metrics.domContentLoaded}ms`,
      firstPaint: `${metrics.firstPaint}ms`,
    });
  });

  test('企业门户错误页面测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    // 测试404页面
    await enterpriseUtils.navigateTo('/enterprise/non-existent-page');

    // 验证404页面显示
    await expect(page.getByText(/404|页面未找到|not found/i)).toBeVisible();

    // 验证返回首页链接
    await expect(page.getByRole('link', { name: /首页|home/i })).toBeVisible();

    // 测试错误处理
    await page.getByRole('link', { name: /首页|home/i }).click();
    await expect(page).toHaveURL(/\/enterprise$/);
  });
});

// 移动端专项测试
test.describe('企业门户移动端功能测试', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('移动端菜单和交互测试', async ({ page }) => {
    const enterpriseUtils = createEnterpriseTestUtils(page, page.request);
    await enterpriseUtils.navigateTo(ENTERPRISE_ROUTES.home);

    // 验证移动端菜单按钮
    await expect(page.getByTestId('mobile-menu-button')).toBeVisible();

    // 测试菜单展开
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    // 测试菜单收起
    await page.getByTestId('mobile-menu-close').click();
    await expect(page.getByTestId('mobile-menu')).not.toBeVisible();

    // 测试滚动行为
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
  });
});
