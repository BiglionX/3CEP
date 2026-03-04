import { SkillInput, FindShopInput, FindShopOutput, Shop } from './types';

/**
 * 计算两点之间的距离 (Haversine 公式)
 * @param lat1 - 第一个点的纬度
 * @param lon1 - 第一个点的经度
 * @param lat2 - 第二个点的纬度
 * @param lon2 - 第二个点的经度
 * @returns 距离 (公里)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球半径 (公里)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 模拟店铺数据 (实际应该从数据库或 API 获取)
 */
const MOCK_SHOPS: Shop[] = [
  {
    id: 'shop_001',
    name: '北京中关村苹果维修店',
    address: '北京市海淀区中关村大街 1 号',
    latitude: 39.9836,
    longitude: 116.3162,
    rating: 4.8,
    phone: '010-12345678',
    services: ['手机维修', '平板维修', '电脑维修'],
    openingHours: '09:00-21:00',
  },
  {
    id: 'shop_002',
    name: '上海浦东手机医院',
    address: '上海市浦东新区张杨路 500 号',
    latitude: 31.2304,
    longitude: 121.4737,
    rating: 4.6,
    phone: '021-87654321',
    services: ['屏幕更换', '电池更换', '数据恢复'],
    openingHours: '10:00-22:00',
  },
  {
    id: 'shop_003',
    name: '广州天河数码维修中心',
    address: '广州市天河区天河路 200 号',
    latitude: 23.1291,
    longitude: 113.2644,
    rating: 4.7,
    phone: '020-11223344',
    services: ['笔记本维修', '手机维修', '配件销售'],
    openingHours: '09:30-21:30',
  },
];

/**
 * 技能核心处理逻辑
 * @param input - 输入参数
 * @returns 处理结果
 */
export async function handleRequest(
  input: SkillInput
): Promise<FindShopOutput> {
  const {
    latitude,
    longitude,
    radius = 5,
    limit = 10,
  } = input as FindShopInput;

  // 验证输入参数
  if (latitude === undefined || longitude === undefined) {
    throw new Error('缺少必填参数：latitude 和 longitude');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('纬度必须在 -90 到 90 之间');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('经度必须在 -180 到 180 之间');
  }

  // 计算每个店铺的距离并过滤
  const shopsWithDistance = MOCK_SHOPS.map(shop => ({
    ...shop,
    distance: calculateDistance(
      latitude,
      longitude,
      shop.latitude,
      shop.longitude
    ),
  }))
    .filter(shop => shop.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  // 返回结果
  return {
    shops: shopsWithDistance,
    total: shopsWithDistance.length,
    searchRadius: radius,
    userLocation: {
      latitude,
      longitude,
    },
  };
}
