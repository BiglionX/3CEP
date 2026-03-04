# procyc-find-shop

## 简介

基于地理位置查询附近 3C 维修店的技能，支持距离计算、半径筛选和自动排序。使用 Haversine 公式精确计算地球表面两点间距离。

## 功能特性

- ✅ **地理位置查询**: 根据用户当前位置查找附近维修店
- ✅ **距离计算**: 使用 Haversine 公式精确计算距离 (公里)
- ✅ **半径筛选**: 支持自定义搜索半径 (1-50 公里)
- ✅ **自动排序**: 按距离从近到远自动排序
- ✅ **参数验证**: 完整的输入参数验证和错误处理
- ✅ **高性能**: 亚毫秒级响应时间

## 安装

```bash
npm install
```

## 快速开始

```typescript
import skill from './src/index';

const result = await skill.execute({
  latitude: 39.9042, // 必填：纬度 (-90 到 90)
  longitude: 116.4074, // 必填：经度 (-180 到 180)
  radius: 5, // 可选：搜索半径，单位公里，默认 5
  limit: 10, // 可选：返回结果数量，默认 10
});

console.log(result);
/*
输出示例:
{
  "success": true,
  "data": {
    "shops": [
      {
        "id": "shop_001",
        "name": "北京中关村苹果维修店",
        "address": "北京市海淀区中关村大街 1 号",
        "distance": 2.5,  // 距离 (公里)
        "rating": 4.8,
        "phone": "010-12345678"
      }
    ],
    "total": 1,
    "searchRadius": 5,
    "userLocation": {
      "latitude": 39.9042,
      "longitude": 116.4074
    }
  }
}
*/
```

## API 文档

详细 API 文档请参考 [docs/API.md](docs/API.md)

## 使用示例

更多示例请参考 [docs/EXAMPLES.md](docs/EXAMPLES.md)

## 测试

```bash
npm test
```

查看测试覆盖率：

```bash
npm run test:coverage
```

## 验证

使用 ProCyc CLI 验证技能配置：

```bash
npm run validate
```

## 部署

```bash
npm run build
npm publish
```

## 许可证

MIT License
