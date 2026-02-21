import { ConfigService } from '../src/services/config-service';

async function testConfigService() {
  console.log('🧪 开始测试配置管理服务...');
  
  // 测试获取配置
  console.log('\n--- 测试获取配置 ---');
  const siteName = await ConfigService.getConfigValue('site_name', '默认站点');
  console.log('站点名称:', siteName);
  
  const maintenanceMode = await ConfigService.getConfigValue('maintenance_mode', false);
  console.log('维护模式:', maintenanceMode);
  
  // 测试获取所有配置
  console.log('\n--- 测试获取所有配置 ---');
  const allConfigs = await ConfigService.getAllConfigs();
  console.log('配置总数:', allConfigs.length);
  
  // 按分类获取配置
  console.log('\n--- 测试按分类获取配置 ---');
  const configsByCategory = await ConfigService.getConfigsByCategory();
  Object.entries(configsByCategory).forEach(([category, configs]) => {
    console.log(`${category}: ${configs.length} 个配置`);
  });
  
  // 测试更新配置
  console.log('\n--- 测试更新配置 ---');
  const updateResult = await ConfigService.updateConfig('site_name', '测试站点名称');
  console.log('更新站点名称结果:', updateResult);
  
  // 测试创建新配置
  console.log('\n--- 测试创建新配置 ---');
  const createResult = await ConfigService.createConfig({
    key: 'test_config_' + Date.now(),
    value: 'test_value',
    description: '测试配置项',
    category: 'test',
    type: 'string'
  });
  console.log('创建测试配置结果:', createResult);
  
  // 测试系统状态获取
  console.log('\n--- 测试系统状态获取 ---');
  const systemStatus = await ConfigService.getSystemStatus();
  console.log('系统状态:', systemStatus);
  
  console.log('\n✅ 配置管理服务测试完成');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testConfigService().catch(console.error);
}

export { testConfigService };
