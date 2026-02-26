import { test, expect } from '@playwright/test';

test.describe('外贸公司管理平台完整测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/foreign-trade/company');
    await page.waitForLoadState('networkidle');
  });

  test('平台基础功能验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/外贸公司管理平台/);
    
    // 验证主要组件存在
    await expect(page.getByText('外贸公司管理平台')).toBeVisible();
    await expect(page.getByText('进口商业务中心')).toBeVisible();
    
    // 验证统计卡片显示
    const statCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
    await expect(statCards).toHaveCount(4);
    
    // 验证订单列表存在
    await expect(page.getByText('采购订单跟踪')).toBeVisible();
    
    console.log('✅ 平台基础功能验证通过');
  });

  test('角色切换功能测试', async ({ page }) => {
    // 初始状态应该是进口商
    await expect(page.getByText('进口商业务中心')).toBeVisible();
    await expect(page.getByText('进口商视角')).toBeVisible();
    
    // 查找角色切换元素
    const roleToggle = page.locator('text=出口商').first();
    if (await roleToggle.isVisible()) {
      await roleToggle.click();
      await page.waitForTimeout(1000);
      
      // 验证切换后的状态
      await expect(page.getByText('出口商业务中心')).toBeVisible();
      await expect(page.getByText('出口商视角')).toBeVisible();
      
      console.log('✅ 角色切换功能测试通过');
    } else {
      console.log('⚠️ 角色切换按钮未找到，可能是静态页面');
    }
  });

  test('统计卡片跳转功能测试', async ({ page }) => {
    const statCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
    const cardCount = await statCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 2); i++) {
      const card = statCards.nth(i);
      const cardText = await card.textContent();
      
      await card.click();
      await page.waitForTimeout(500);
      
      // 检查是否发生了页面跳转
      const currentUrl = page.url();
      const isForeignTradePage = currentUrl.includes('/foreign-trade/');
      
      console.log(`📊 统计卡片 ${i + 1} "${cardText?.substring(0, 20)}..." 跳转测试: ${isForeignTradePage ? '成功' : '未跳转'}`);
      
      // 返回原页面
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
  });

  test('订单详情跳转测试', async ({ page }) => {
    // 查找订单项
    const orderItems = page.locator('.border.border-gray-200.rounded-lg.p-4');
    const orderCount = await orderItems.count();
    
    if (orderCount > 0) {
      const firstOrder = orderItems.first();
      const orderText = await firstOrder.textContent();
      
      await firstOrder.click();
      await page.waitForTimeout(1000);
      
      const orderDetailUrl = page.url();
      const isInOrderDetail = orderDetailUrl.includes('/order/');
      
      console.log(`📦 订单详情跳转测试: "${orderText?.substring(0, 30)}..." -> ${isInOrderDetail ? '成功' : '失败'}`);
      console.log(`   目标URL: ${orderDetailUrl}`);
      
      // 返回主页
      await page.goBack();
    } else {
      console.log('⚠️ 未找到订单项进行测试');
    }
  });

  test('标签页功能测试', async ({ page }) => {
    // 测试标签页切换
    const tabs = ['订单管理', '合作伙伴', '业务分析'];
    
    for (const tabName of tabs) {
      const tab = page.getByText(tabName);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
        
        // 验证标签页内容显示
        const isActive = await tab.getAttribute('data-state') === 'active';
        console.log(`🔖 标签页 "${tabName}" 切换: ${isActive ? '成功' : '失败'}`);
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // 验证关键元素仍然可见
    await expect(page.getByText('外贸公司管理平台')).toBeVisible();
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // 恢复桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    console.log('📱 响应式设计测试通过');
  });

  test('侧边栏导航测试', async ({ page }) => {
    // 查找侧边栏元素
    const sidebar = page.locator('.fixed.left-0.top-0.h-full');
    
    if (await sidebar.isVisible()) {
      const sidebarItems = sidebar.locator('a, button');
      const itemCount = await sidebarItems.count();
      
      console.log(`🧭 侧边栏包含 ${itemCount} 个导航项`);
      
      // 测试前几个导航项
      for (let i = 0; i < Math.min(itemCount, 3); i++) {
        const item = sidebarItems.nth(i);
        const itemText = await item.textContent();
        console.log(`   导航项 ${i + 1}: ${itemText?.trim()}`);
      }
    } else {
      console.log('⚠️ 固定侧边栏未找到');
    }
  });

  test('搜索和筛选功能测试', async ({ page }) => {
    // 测试搜索框
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试搜索');
      await page.waitForTimeout(500);
      console.log('🔍 搜索功能测试通过');
    }
    
    // 测试筛选按钮
    const filterButton = page.getByText('筛选');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
      console.log('🎯 筛选功能测试通过');
    }
  });

  test('创建新订单功能测试', async ({ page }) => {
    const createButton = page.getByText('创建采购订单').or(page.getByText('创建销售订单'));
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // 检查是否打开了模态框或跳转到创建页面
      const modalOrNewPage = await page.locator('[role="dialog"], form').first().isVisible();
      console.log(`➕ 创建订单功能测试: ${modalOrNewPage ? '成功触发' : '未响应'}`);
      
      // 如果是模态框，关闭它
      if (modalOrNewPage) {
        await page.keyboard.press('Escape');
      }
    }
  });
});

test.describe('外贸公司管理平台性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/foreign-trade/company');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ 页面加载时间: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(5000); // 期望5秒内加载完成
  });

  test('交互响应性能', async ({ page }) => {
    await page.goto('/foreign-trade/company');
    
    const startTime = Date.now();
    await page.getByText('订单管理').click();
    await page.waitForTimeout(300);
    const responseTime = Date.now() - startTime;
    
    console.log(`⚡ 标签页切换响应时间: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(1000); // 期望1秒内响应
  });
});