import { NextRequest, NextResponse } from 'next/server';

// 模拟店铺数据
const mockShops = [
  {
    id: 'shop_001',
    name: '北京朝阳维修中心',
    contact_person: '张师傅',
    phone: '13800138001',
    address: '北京市朝阳区建国路88号',
    city: '北京市',
    province: '北京市',
    business_license: 'BJ20240001',
    services: JSON.stringify(['手机维修', '电脑维修', '平板维修']),
    logo_url: '',
    cover_image_url: '',
    status: 'approved',
    rating: 4.8,
    review_count: 128,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-02-20T14:22:00Z',
  },
  {
    id: 'shop_002',
    name: '上海浦东数码维修店',
    contact_person: '李技师',
    phone: '13900139002',
    address: '上海市浦东新区陆家嘴环路1000号',
    city: '上海市',
    province: '上海市',
    business_license: 'SH20240002',
    services: JSON.stringify(['手机维修', '数据恢复']),
    logo_url: '',
    cover_image_url: '',
    status: 'approved',
    rating: 4.5,
    review_count: 89,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-02-18T16:45:00Z',
  },
  {
    id: 'shop_003',
    name: '广州天河电子维修部',
    contact_person: '王经理',
    phone: '13700137003',
    address: '广州市天河区珠江新城花城大道888号',
    city: '广州市',
    province: '广东省',
    business_license: 'GD20240003',
    services: JSON.stringify(['手机维修', '电脑维修', '网络调试']),
    logo_url: '',
    cover_image_url: '',
    status: 'disabled',
    rating: 4.2,
    review_count: 67,
    created_at: '2024-02-01T11:20:00Z',
    updated_at: '2024-02-25T09:30:00Z',
  },
  {
    id: 'shop_004',
    name: '深圳南山智能维修站',
    contact_person: '陈主管',
    phone: '13600136004',
    address: '深圳市南山区科技园南区深南大道9999号',
    city: '深圳市',
    province: '广东省',
    business_license: 'SZ20240004',
    services: JSON.stringify(['手机维修', '智能家居维修', '无人机维修']),
    logo_url: '',
    cover_image_url: '',
    status: 'approved',
    rating: 4.9,
    review_count: 203,
    created_at: '2024-01-10T08:45:00Z',
    updated_at: '2024-02-22T13:15:00Z',
  },
  {
    id: 'shop_005',
    name: '杭州西湖数码快修',
    contact_person: '刘师傅',
    phone: '13500135005',
    address: '杭州市西湖区文三路555号',
    city: '杭州市',
    province: '浙江省',
    business_license: 'ZJ20240005',
    services: JSON.stringify(['手机维修', '平板维修']),
    logo_url: '',
    cover_image_url: '',
    status: 'rejected',
    rating: 3.8,
    review_count: 42,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-28T11:20:00Z',
  },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = params.id;
    const body = await request.json();

    // 查找店铺
    const shopIndex = mockShops.findIndex(shop => shop.id === shopId);

    if (shopIndex === -1) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    // 更新店铺信息
    const updatedShop = {
      ...mockShops[shopIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    mockShops[shopIndex] = updatedShop;

    return NextResponse.json({
      success: true,
      data: updatedShop,
      message: '店铺信息更新成功',
    });
  } catch (error) {
    console.error('更新店铺失败:', error);
    return NextResponse.json(
      { success: false, error: '更新店铺失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = params.id;

    // 查找店铺
    const shopIndex = mockShops.findIndex(shop => shop.id === shopId);

    if (shopIndex === -1) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    // 删除店铺
    mockShops.splice(shopIndex, 1);

    return NextResponse.json({
      success: true,
      message: '店铺删除成功',
    });
  } catch (error) {
    console.error('删除店铺失败:', error);
    return NextResponse.json(
      { success: false, error: '删除店铺失败' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopId = params.id;

    // 查找店铺
    const shop = mockShops.find(s => s.id === shopId);

    if (!shop) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    console.error('获取店铺详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取店铺详情失败' },
      { status: 500 }
    );
  }
}
