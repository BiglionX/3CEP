# 🚀 管理页面快速测试指南

## ⚡ 5 分钟快速开始

### 1️⃣ 启动开发服务器 (30 秒)

```bash
# 在项目根目录执行
npm run dev
```

**预期输出**:

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### 2️⃣ 访问新页面 (1 分钟)

#### 方式 A：直接访问 URL

打开浏览器访问以下地址：

1. **市场运营管理仪表盘**

   ```
   http://localhost:3000/admin/marketplace
   ```

2. **开发者管理页面**
   ```
   http://localhost:3000/admin/developers
   ```

#### 方式 B：通过侧边栏导航

1. 访问 http://localhost:3000/login
2. 使用管理员账号登录
3. 点击左侧菜单 "商店管理"
4. 选择子菜单查看对应页面

---

### 3️⃣ 功能测试清单 (3 分钟)

#### ✅ 市场运营页面检查项

**基础显示**

- [ ] 页面标题显示 "市场运营管理"
- [ ] 6 个统计卡片正常显示
- [ ] 收入趋势图表可见（如有数据）
- [ ] 开发者排行榜显示（如有数据）

**交互功能**

- [ ] 刷新按钮可点击
- [ ] 数据加载动画显示
- [ ] 无错误提示

**权限验证**

- [ ] 未登录时访问会重定向到登录页
- [ ] 非管理员账户无法访问

---

#### ✅ 开发者管理页面检查项

**基础显示**

- [ ] 页面标题显示 "开发者管理"
- [ ] 4 个统计卡片正常显示
- [ ] 筛选器区域显示完整
- [ ] 表格区域正常渲染

**筛选功能**

- [ ] 搜索框可以输入
- [ ] 状态下拉框可选择
- [ ] 排序下拉框可切换

**表格功能**

- [ ] 开发者头像显示（或首字母）
- [ ] 姓名和邮箱显示
- [ ] 产品数量显示
- [ ] 收入数字格式化
- [ ] 状态标签颜色正确
- [ ] 分页控件可用

**操作功能**

- [ ] "激活/停用"按钮可点击
- [ ] "详情"按钮可点击
- [ ] 状态切换后有提示

---

### 4️⃣ 常见问题排查

#### ❌ 问题 1：页面显示 404

**原因**: 页面文件未正确创建
**解决**:

```bash
# 检查文件是否存在
ls src/app/admin/marketplace/page.tsx
ls src/app/admin/developers/page.tsx
```

#### ❌ 问题 2：显示 "访问受限"

**原因**: 未登录或角色权限不足
**解决**:

1. 确保已登录
2. 使用管理员账户（admin@example.com）
3. 检查用户角色是否为 admin 或 marketplace_admin

#### ❌ 问题 3：统计数据为空或 0

**原因**: 数据库中没有相关数据
**解决**: 这是正常的，说明系统还没有订单和开发者数据

#### ❌ 问题 4：API 请求失败

**原因**: Supabase 连接配置问题
**解决**:

```bash
# 检查环境变量文件
cat .env.local | grep SUPABASE
```

确保包含：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

### 5️⃣ 测试脚本自动化

运行验证脚本快速检查：

```bash
node scripts/verify-admin-pages.js
```

**输出示例**:

```
📋 管理页面验证清单
================================================
1. 市场运营管理仪表盘
------------------------------------------------
   页面路径：/admin/marketplace
   API 端点：/api/admin/marketplace/statistics
   状态：待验证

...（更多页面信息）
```

---

## 🎯 深度测试（可选）

### API 端点测试

使用 curl 或 Postman 测试 API：

```bash
# 测试市场统计 API
curl http://localhost:3000/api/admin/marketplace/statistics \
  -H "Cookie: your-auth-cookie"

# 测试开发者列表 API
curl "http://localhost:3000/api/admin/developers/list?page=1&pageSize=10" \
  -H "Cookie: your-auth-cookie"

# 测试开发者统计 API
curl http://localhost:3000/api/admin/developers/statistics \
  -H "Cookie: your-auth-cookie"
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 0,
      "totalOrders": 0,
      "activeDevelopers": 0
    }
  }
}
```

---

## 📊 性能基准测试

### 加载时间要求

- **首次加载**: < 3 秒
- **数据获取**: < 1 秒
- **交互响应**: < 100ms

### 测试方法

1. 打开 Chrome DevTools (F12)
2. 切换到 Network 标签
3. 刷新页面
4. 查看各项资源加载时间

---

## 🐛 报告问题

如果发现问题，请记录以下信息：

### 问题报告模板

```markdown
**问题描述**:
[简要描述遇到的问题]

**复现步骤**:

1. 访问 /admin/marketplace
2. 点击刷新按钮
3. 出现错误提示

**期望行为**:
应该显示更新后的数据

**实际行为**:
显示 "网络错误"

**环境信息**:

- 浏览器：Chrome 120
- URL: /admin/marketplace
- 账户：admin@example.com

**截图**:
[如有必要，附上截图]
```

---

## ✅ 测试完成检查表

完成所有测试后，确认以下项目：

### 功能性

- [ ] 两个页面都能正常访问
- [ ] 侧边栏菜单正确显示
- [ ] 统计数据区域正常渲染
- [ ] 筛选和搜索功能可用
- [ ] 分页导航工作正常

### 权限控制

- [ ] 未登录用户被重定向
- [ ] 非管理员无法访问
- [ ] API 端点拒绝未授权请求

### UI/UX

- [ ] 页面布局美观
- [ ] 响应式适配良好
- [ ] 加载状态友好
- [ ] 错误提示清晰

### 代码质量

- [ ] 控制台无错误
- [ ] 无 TypeScript 类型错误
- [ ] ESLint 检查通过
- [ ] 代码格式规范

---

## 🎉 测试成功标志

当您看到以下内容时，说明测试成功：

✅ 页面正常渲染，无白屏
✅ 统计数据区域显示（即使为 0）
✅ 可以进行筛选和搜索操作
✅ 控制台无红色错误信息
✅ 移动端和桌面端都正常显示

---

## 📞 需要帮助？

如遇问题，请查阅以下文档：

- 📄 详细验证报告：`MANAGEMENT_PAGES_VERIFICATION_REPORT.md`
- 📄 完成报告：`MANAGEMENT_PAGES_COMPLETION_REPORT.md`
- 📄 开发指南：`NEXT_STEPS_GUIDE.md`

---

**最后更新**: 2026-03-23
**维护者**: AI Assistant
