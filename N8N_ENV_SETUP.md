# n8n API 配置指南

## ✅ 已完成的配置更新

### 1. 菜单栏配置 ✅

已在 `src/components/admin/RoleAwareSidebar.tsx` 中添加以下菜单项：

**智能体管理** 子菜单新增：

- 🔑 **凭证管理** - `/admin/agents/credentials`
- 📚 **模板库** - `/admin/agents/templates`
- ⏰ **调度管理** - `/admin/agents/schedules`
- 🔗 **Webhook 管理** - `/admin/agents/webhooks`
- 🔐 **环境变量** - `/admin/agents/environment`
- 👥 **团队协作** - `/admin/agents/team`
- 📊 **高级分析** - `/admin/agents/analytics`

**权限配置**：

- 所有新菜单项对 `admin` 和 `manager` 角色可见
- 部分功能（模板库、调度管理）对 `agent_operator` 角色开放
- 高级分析对 `analyst` 角色开放

### 2. 环境变量配置 ✅

已在 `.env` 文件中添加 n8n API 配置：

```bash
# n8n API 配置（工作流自动化系统）
NEXT_PUBLIC_N8N_URL=http://localhost:5678
N8N_API_TOKEN=your-n8n-api-token-here
```

## 🔧 配置步骤

### 步骤 1: 获取 N8N_API_TOKEN

1. **启动本地 n8n 服务**

   ```bash
   # 使用 docker-compose 启动
   docker-compose -f docker-compose.n8n.yml up -d
   ```

2. **访问 n8n 管理后台**
   - 浏览器访问：`http://localhost:5678`
   - 首次登录需要设置管理员账号

3. **获取 API Token**
   - 登录 n8n 后，点击右上角用户头像
   - 进入 **Settings** → **API**
   - 复制 **API Token** 字段

### 步骤 2: 更新 .env 文件

将获取到的 API Token 替换到 `.env` 文件：

```bash
N8N_API_TOKEN=你的实际 api-token
```

### 步骤 3: 重启开发服务器

```bash
# 停止当前运行的服务（如果正在运行）
# Ctrl + C

# 重新启动
npm run dev
```

## 🎯 验证配置

### 1. 检查菜单显示

访问 `http://localhost:3001/admin`，在左侧菜单中应该能看到：

```
智能体管理 ▼
  ├── 智能体模板
  ├── 智能体审核
  ├── 执行工作流
  ├── 监控面板
  ├── 工作流管理
  ├── 执行历史
  ├── 凭证管理          ← 新增
  ├── 模板库            ← 新增
  ├── 调度管理          ← 新增
  ├── Webhook 管理      ← 新增
  ├── 环境变量          ← 新增
  ├── 团队协作          ← 新增
  └── 高级分析          ← 新增
```

### 2. 测试页面访问

依次访问以下页面，确认都能正常加载：

- http://localhost:3001/admin/agents/credentials
- http://localhost:3001/admin/agents/templates
- http://localhost:3001/admin/agents/schedules
- http://localhost:3001/admin/agents/webhooks
- http://localhost:3001/admin/agents/environment
- http://localhost:3001/admin/agents/team
- http://localhost:3001/admin/agents/analytics

### 3. 检查 API 连接

打开浏览器开发者工具，查看控制台是否有以下信息：

- ✅ 成功连接到 n8n API
- ⚠️ 如果显示 "使用模拟数据"，说明 n8n 服务未启动或 API Token 不正确

## 🔍 故障排查

### 问题 1: 菜单不显示新增项

**解决方案**：

1. 清除浏览器缓存
2. 检查用户角色是否为 admin/manager
3. 查看浏览器控制台是否有错误

### 问题 2: 页面显示 "加载中..." 但不加载数据

**解决方案**：

1. 确认 n8n 服务已启动：`docker ps | grep n8n`
2. 检查 `.env` 中的 `NEXT_PUBLIC_N8N_URL` 是否正确
3. 验证 `N8N_API_TOKEN` 是否有效

### 问题 3: 404 错误

**解决方案**：

1. 确认页面文件已创建：检查 `src/app/admin/agents/*/page.tsx`
2. 重启 Next.js 开发服务器
3. 清除 `.next` 缓存：`rm -rf .next`

## 📝 环境变量说明

| 变量名                | 说明             | 示例值                    |
| --------------------- | ---------------- | ------------------------- |
| `NEXT_PUBLIC_N8N_URL` | n8n 服务地址     | `http://localhost:5678`   |
| `N8N_API_TOKEN`       | n8n API 认证令牌 | `ey...` (从 n8n 后台获取) |

## 🚀 下一步

配置完成后，您可以：

1. ✅ 访问新增的 7 个管理页面
2. ✅ 配置 n8n 凭证（API Key、OAuth 等）
3. ✅ 导入工作流模板
4. ✅ 创建定时任务调度
5. ✅ 管理 Webhook 集成
6. ✅ 配置全局环境变量
7. ✅ 邀请团队成员协作
8. ✅ 查看执行分析和性能报告

## 📞 获取更多帮助

- [完成报告](./N8N_ADMIN_PAGES_COMPLETION_REPORT.md) - 详细功能说明
- [快速启动指南](./N8N_ADMIN_QUICK_START.md) - 操作手册
- n8n 官方文档：https://docs.n8n.io/

---

**配置更新时间**: 2026-03-25
**状态**: ✅ 已完成
