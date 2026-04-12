# 📦 产品库冷启动数据 - 60个3C品牌

**创建日期**: 2026-04-09
**状态**: ✅ **SQL脚本已准备，待执行**

---

## ✅ 数据概览

### 品牌分类统计

| 分类              | 数量     | 示例                                        |
| ----------------- | -------- | ------------------------------------------- |
| **国际知名品牌**  | 20个     | Apple, Samsung, Sony, Microsoft, Dell...    |
| **中国知名品牌**  | 15个     | Huawei, Xiaomi, OPPO, vivo, Honor...        |
| **电脑外设品牌**  | 10个     | Logitech, Razer, Corsair, Bose, JBL...      |
| **智能家居与IoT** | 10个     | DJI, Anker, TP-Link, Hikvision, Roborock... |
| **其他知名品牌**  | 5个      | Canon, Nikon, GoPro, Fitbit, Garmin         |
| **总计**          | **60个** | -                                           |

---

## 🚀 如何执行

### 方式1: Supabase Dashboard（推荐）

1. 打开 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 打开文件 `supabase/migrations/023_seed_3c_brands.sql`
5. 复制全部内容
6. 粘贴到 SQL Editor
7. 点击 **Run** 执行

### 方式2: Supabase CLI

```bash
npx supabase db push
```

---

## 📋 品牌列表详情

### 国际知名品牌（20个）

1. **Apple** - 美国 - 全球领先的科技公司
2. **Samsung** - 韩国 - 跨国企业集团
3. **Sony** - 日本 - 电子、游戏、娱乐
4. **Microsoft** - 美国 - 软件、硬件、云服务
5. **Dell** - 美国 - 计算机科技公司
6. **HP** - 美国 - 信息技术公司
7. **Lenovo** - 中国 - 个人电脑、智能手机
8. **ASUS** - 台湾 - 计算机和手机硬件
9. **Acer** - 台湾 - 硬件和电子公司
10. **LG** - 韩国 - 化学制品、电子产品
11. **Panasonic** - 日本 - 跨国电子公司
12. **Toshiba** - 日本 - 基础设施、电子设备
13. **Intel** - 美国 - 半导体芯片制造商
14. **AMD** - 美国 - 计算机处理器
15. **NVIDIA** - 美国 - GPU、系统芯片
16. **Qualcomm** - 美国 - 半导体和电信设备
17. **Huawei** - 中国 - 电信设备、消费电子
18. **Xiaomi** - 中国 - 智能手机、智能硬件
19. **OPPO** - 中国 - 智能手机、音频设备
20. **vivo** - 中国 - 智能手机、配件

### 中国知名品牌（15个）

21. **Honor** - 荣耀终端有限公司
22. **Realme** - 年轻人智能手机品牌
23. **OnePlus** - 旗舰级性能手机
24. **ZTE** - 中兴通讯
25. **Meizu** - 魅族科技
26. **Smartisan** - 锤子科技
27. **Nubia** - 努比亚技术
28. **iQOO** - vivo子品牌
29. **Redmi** - 小米子品牌
30. **POCO** - 小米独立品牌
31. **Nothing** - 英国简约设计
32. **Transsion** - 传音控股
33. **Coolpad** - 酷派
34. **Gionee** - 金立
35. **LeEco** - 乐视

### 电脑外设品牌（10个）

36. **Logitech** - 瑞士 - 周边设备
37. **Razer** - 新加坡 - 游戏硬件
38. **Corsair** - 美国 - PC游戏外设
39. **SteelSeries** - 丹麦 - 游戏外设
40. **HyperX** - 美国 - 游戏外设
41. **Bose** - 美国 - 音响设备
42. **JBL** - 美国 - 音响品牌
43. **Sennheiser** - 德国 - 音频设备
44. **Audio-Technica** - 日本 - 音频设备
45. **Beats** - 美国 - 音频产品

### 智能家居与IoT（10个）

46. **DJI** - 大疆创新 - 无人机
47. **Anker** - 安克创新 - 充电技术
48. **Baseus** - 倍思 - 数码配件
49. **UGREEN** - 绿联科技 - 数码配件
50. **TP-Link** - 普联技术 - 网络设备
51. **Tenda** - 腾达科技 - 网络设备
52. **Hikvision** - 海康威视 - 视频监控
53. **Dahua** - 大华股份 - 视频监控
54. **Roborock** - 石头科技 - 清洁机器人
55. **Ecovacs** - 科沃斯 - 服务机器人

### 其他知名品牌（5个）

56. **Canon** - 日本 - 光学影像
57. **Nikon** - 日本 - 光学仪器
58. **GoPro** - 美国 - 动作摄像机
59. **Fitbit** - 美国 - 可穿戴设备
60. **Garmin** - 瑞士 - GPS技术

---

## 🎯 数据字段

每个品牌包含以下信息：

```sql
name        VARCHAR(255)   -- 品牌名称
description TEXT           -- 品牌描述
website     VARCHAR(500)   -- 官方网站
country     VARCHAR(100)   -- 所属国家/地区
```

---

## 💡 使用场景

### 1. 产品开发阶段

- 快速填充测试数据
- 验证UI展示效果
- 测试搜索和筛选功能

### 2. 演示和展示

- 向客户展示系统功能
- 制作产品演示视频
- 编写用户手册

### 3. 数据分析

- 测试统计分析功能
- 验证报表生成
- 性能压力测试

---

## 🔍 验证数据

执行SQL后，可以通过以下方式验证：

### SQL查询

```sql
-- 查看品牌总数
SELECT COUNT(*) FROM product_library.brands;

-- 按国家分组统计
SELECT country, COUNT(*) as count
FROM product_library.brands
GROUP BY country
ORDER BY count DESC;

-- 查看所有品牌
SELECT name, country, website
FROM product_library.brands
ORDER BY name;
```

### 前端页面

访问 http://localhost:3001/product-library/brands 查看品牌列表

---

## 📊 预期结果

执行成功后，你应该看到：

```
✅ 成功插入 60 个3C品牌数据
   - 国际知名品牌: 20个
   - 中国知名品牌: 15个
   - 电脑外设品牌: 10个
   - 智能家居与IoT: 10个
   - 其他知名品牌: 5个
```

---

## 🎨 前端展示效果

品牌管理页面将显示：

- **Logo**: 首字母头像（蓝色背景）
- **名称**: 品牌英文名称
- **描述**: 中文品牌介绍
- **国家**: 标签形式展示
- **网站**: 可点击链接
- **操作**: 编辑/删除按钮

---

## 🔗 相关文件

- **SQL脚本**: `supabase/migrations/023_seed_3c_brands.sql`
- **品牌页面**: `src/app/(dashboard)/product-library/brands/page.tsx`
- **API客户端**: `src/lib/api/product-library.ts`

---

## ⚠️ 注意事项

1. **重复执行**: 脚本使用了 `INSERT INTO`，如果重复执行会导致重复数据
2. **外键约束**: 确保 `product_library` schema 已创建
3. **字符编码**: 确保数据库支持UTF-8编码（中文字符）

---

## 🎉 下一步

执行完品牌数据后，你可以：

1. ✅ 访问品牌管理页面查看60个品牌
2. 📝 开始添加产品数据（整机、配件、部件、零件）
3. 🔗 配置BOM关系
4. 📱 生成溯源码
5. 📊 测试搜索和筛选功能

---

**准备好执行SQL脚本了吗？执行后刷新品牌管理页面即可看到所有品牌！** 🚀
