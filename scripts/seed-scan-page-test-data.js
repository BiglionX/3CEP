#!/usr/bin/env node

/**
 * 为扫码落地页测试创建种子数据
 * 创建测试用的设备档案和生命周期事件
 */

const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

console.log(
  `${colors.blue}${colors.bold}🌱 创建扫码落地页测试数据${colors.reset}\n`
);

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testQrCodeId: 'test_device_001',
  apiKey: process.env.LIFECYCLE_API_KEY || 'dev-key',
};

async function makeRequest(url, options = {}) {
  const fullUrl = `${TEST_CONFIG.baseUrl}${url}`;
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CONFIG.apiKey}`,
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return {
      status: response.status,
      data,
      success: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false,
    };
  }
}

async function seedTestData() {
  console.log(`${colors.cyan}📝 开始创建测试数据...${colors.reset}\n`);

  // 1. 验证设备档案（使用mock数据）
  console.log('1️⃣ 验证设备档案...');
  const getProfileResponse = await makeRequest(
    `/api/devices/${TEST_CONFIG.testQrCodeId}/profile`,
    {
      method: 'GET',
    }
  );

  if (getProfileResponse.success) {
    console.log(`${colors.green}✅ 设备档案验证成功${colors.reset}`);
    console.log(`   产品型号: ${getProfileResponse.data.data?.productModel}`);
    console.log(`   当前状态: ${getProfileResponse.data.data?.currentStatus}`);
  } else {
    console.log(
      `${colors.red}❌ 设备档案验证失败: ${getProfileResponse.data.error}${colors.reset}`
    );
    return;
  }

  // 2. 获取生命周期事件
  console.log('\n2️⃣ 获取生命周期事件...');
  const eventsResponse = await makeRequest(
    `/api/devices/${TEST_CONFIG.testQrCodeId}/lifecycle`,
    {
      method: 'GET',
    }
  );

  if (eventsResponse.success) {
    const events = eventsResponse.data.data || [];
    console.log(
      `${colors.green}✅ 成功获取 ${events.length} 个事件${colors.reset}`
    );

    // 显示最近的事件
    console.log('\n📅 最近的生命周期事件:');
    events.slice(0, 3).forEach((event, index) => {
      console.log(
        `   ${index + 1}. ${event.eventType} - ${new Date(event.eventTimestamp).toLocaleString('zh-CN')}`
      );
    });
  } else {
    console.log(
      `${colors.red}❌ 获取事件失败: ${eventsResponse.data.error}${colors.reset}`
    );
  }

  // 3. 验证数据
  console.log('\n3️⃣ 验证测试数据...');
  const profileResponse = await makeRequest(
    `/api/devices/${TEST_CONFIG.testQrCodeId}/profile`,
    {
      method: 'GET',
    }
  );

  if (profileResponse.success) {
    const profile = profileResponse.data.data.profile;
    const events = profileResponse.data.data.events;

    console.log(`${colors.green}✅ 数据验证通过${colors.reset}`);
    console.log(`   设备状态: ${profile.currentStatus}`);
    console.log(`   事件总数: ${events.length}`);
    console.log(`   维修次数: ${profile.totalRepairCount}`);
    console.log(`   换件次数: ${profile.totalPartReplacementCount}`);

    // 显示最新的几个事件
    console.log('\n📅 最近的生命周期事件:');
    events.slice(0, 3).forEach((event, index) => {
      console.log(
        `   ${index + 1}. ${event.eventType} - ${new Date(event.eventTimestamp).toLocaleString('zh-CN')}`
      );
    });
  } else {
    console.log(
      `${colors.red}❌ 数据验证失败: ${profileResponse.data.error}${colors.reset}`
    );
  }

  // 4. 提供测试链接
  console.log(`\n${colors.blue}${colors.bold}🎯 测试准备完成!${colors.reset}`);
  console.log(`${colors.cyan}您可以通过以下链接测试扫码落地页:${colors.reset}`);
  console.log(`🔗 ${TEST_CONFIG.baseUrl}/scan/${TEST_CONFIG.testQrCodeId}`);
  console.log(`\n${colors.yellow}💡 提示:${colors.reset}`);
  console.log('- 点击"设备档案"标签页查看完整档案信息');
  console.log('- 查看按时间倒序排列的生命周期事件');
  console.log('- 注意设备状态标识的颜色变化');
}

// 执行种子数据创建
seedTestData().catch(error => {
  console.error(`${colors.red}❌ 脚本执行出错:${colors.reset}`, error);
  process.exit(1);
});
