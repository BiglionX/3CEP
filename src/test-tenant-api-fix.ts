/**
 * 租户 API 修复测试文件
 * 正确演示如何导入 @/lib/database.types 模块
 */

// 正确的模块导入方?import type { Database } from '@/lib/database.types';
import supabase from '@/lib/supabase';

// 类型使用示例
interface TenantApiTest {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

// 使用数据库类?type TenantRow = Database['public']['Tables']['tenants']['Row'];
type UserTenantRow = Database['public']['Tables']['user_tenants']['Row'];

// 测试函数
async function testTenantApi(): Promise<void> {
  try {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('开始测试租?API...')// 使用已创建的 Supabase 客户端实?    const client = supabase;

    // 查询租户数据示例
    const { data: tenants, error } = await client
      .from('tenants')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('查询租户数据失败:', error);
      return;
    }

    console.log('成功获取租户数据:', tenants);
    // 类型安全的数据处理
    const activeTenants: TenantRow[] = tenants || [];
    activeTenants.forEach((tenant: TenantRow) => {
      console.log(`租户：${tenant.name} (${tenant.code})`);
    });
  } catch (error) {
    console.error('测试过程中发生错?', error);
  }
}

// 用户租户关系测试
async function testUserTenantRelationship(): Promise<void> {
  try {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('测试用户租户关系...')const client = supabase;

    // 查询用户租户关系
    const { data: userTenants, error } = await client
      .from('user_tenants')
      .select(
        `
        *,
        tenants(name, code),
        user_profiles_ext(email, role)
      `
      )
      .eq('is_active', true);

    if (error) {
      console.error('查询用户租户关系失败:', error);
      return;
    }

    console.log('用户租户关系数据:', userTenants);
    // 类型安全的数据访问
    const relationships: UserTenantRow[] = userTenants || [];
    relationships.forEach((relation: UserTenantRow) => {
      console.log(
        `用户 ${relation.user_id} 在租户${relation.tenant_id} 中的角色：${relation.role}`
      );
    });
  } catch (error) {
    console.error('用户租户关系测试失败:', error);
  }
}

// 导出测试函数供其他模块使用
export {
  testTenantApi,
  testUserTenantRelationship,
  type TenantApiTest,
  type TenantRow,
  type UserTenantRow,
};

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  (async () => {
    await testTenantApi();
    await testUserTenantRelationship();
    console.log('所有测试完成！');
  })();
}
