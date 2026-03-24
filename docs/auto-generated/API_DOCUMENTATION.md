# API 接口文档

**生成时间**: 2026-03-23T04:52:51.557Z
**总计接口数**: 305

---

## 目录

- [api](#api)
- [admin](#admin)
- [affiliate](#affiliate)
- [agents](#agents)
- [analytics](#analytics)
- [api-interceptor](#api-interceptor)
- [articles](#articles)
- [audit](#audit)
- [auth](#auth)
- [b2b-procurement](#b2b-procurement)
- [brands](#brands)
- [business](#business)
- [cdn-accelerator](#cdn-accelerator)
- [cron](#cron)
- [crowdfunding](#crowdfunding)
- [dashboard](#dashboard)
- [data-center](#data-center)
- [data-pipeline](#data-pipeline)
- [data-protection](#data-protection)
- [data-quality](#data-quality)
- [devices](#devices)
- [diagnosis](#diagnosis)
- [documents](#documents)
- [enterprise](#enterprise)
- [fcx](#fcx)
- [foreign-trade](#foreign-trade)
- [growth](#growth)
- [health](#health)
- [inventory](#inventory)
- [lifecycle](#lifecycle)
- [links](#links)
- [manuals](#manuals)
- [marketing](#marketing)
- [marketplace](#marketplace)
- [metrics](#metrics)
- [ml-prediction](#ml-prediction)
- [moderation](#moderation)
- [monitoring](#monitoring)
- [n8n](#n8n)
- [notifications](#notifications)
- [parts](#parts)
- [performance](#performance)
- [permissions](#permissions)
- [procurement-intelligence](#procurement-intelligence)
- [procurement](#procurement)
- [products](#products)
- [qrcode](#qrcode)
- [rbac](#rbac)
- [recommendation](#recommendation)
- [repair-shop](#repair-shop)
- [reviews](#reviews)
- [reward-qa](#reward-qa)
- [sales](#sales)
- [scan](#scan)
- [security-monitoring](#security-monitoring)
- [session](#session)
- [shops](#shops)
- [supply-chain](#supply-chain)
- [test-admin-check](#test-admin-check)
- [test-middleware](#test-middleware)
- [tickets](#tickets)
- [tokens](#tokens)
- [tools](#tools)
- [tracking](#tracking)
- [tutorials](#tutorials)
- [user](#user)
- [users](#users)
- [v1](#v1)
- [valuation](#valuation)
- [warehouse](#warehouse)
- [wms](#wms)
- [workflows](#workflows)

---

## api

### GET | POST | PUT | DELETE `/adminadmin/api/alert-rules`

* 监控告警规则 API 路由

**文件位置**: `src\app\admin\api\alert-rules\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## admin

### GET | POST | PUT | DELETE `/adminapi/admin/[...path]`

**文件位置**: `src\app\api\admin\[...path]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/articles/drafts`

**文件位置**: `src\app\api\admin\articles\drafts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/articles`

**文件位置**: `src\app\api\admin\articles\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/articles/stats`

**文件位置**: `src\app\api\admin\articles\stats\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/admin/content/[id]`

**文件位置**: `src\app\api\admin\content\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/content`

**文件位置**: `src\app\api\admin\content\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/dashboard/export`

**文件位置**: `src\app\api\admin\dashboard\export\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/dashboard/stats`

**文件位置**: `src\app\api\admin\dashboard\stats\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### PUT | DELETE `/adminapi/admin/devices/groups/[id]`

**文件位置**: `src\app\api\admin\devices\groups\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/devices/groups`

**文件位置**: `src\app\api\admin\devices\groups\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/devices/recycle`

* 绠＄悊鍚庡彴璁惧鍥炴敹API
 * 鎻愪緵璁惧鍥炴敹鍔熻兘鎺ュ彛

**文件位置**: `src\app\api\admin\devices\recycle\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/devices/search`

* 绠＄悊鍚庡彴璁惧鎼滅储API
 * 鎻愪緵璁惧鎼滅储鍔熻兘鎺ュ彛

**文件位置**: `src\app\api\admin\devices\search\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/devices/tags`

**文件位置**: `src\app\api\admin\devices\tags\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/diagnostics`

**文件位置**: `src\app\api\admin\diagnostics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/finance/categories`

**文件位置**: `src\app\api\admin\finance\categories\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/finance/monthly`

**文件位置**: `src\app\api\admin\finance\monthly\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/finance/summary`

**文件位置**: `src\app\api\admin\finance\summary\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/finance/transactions`

**文件位置**: `src\app\api\admin\finance\transactions\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/admin/inventory/items/[id]`

**文件位置**: `src\app\api\admin\inventory\items\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/inventory/items`

**文件位置**: `src\app\api\admin\inventory\items\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/inventory/locations`

**文件位置**: `src\app\api\admin\inventory\locations\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/inventory/movements`

**文件位置**: `src\app\api\admin\inventory\movements\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/links/pending`

**文件位置**: `src\app\api\admin\links\pending\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/manuals/review`

**文件位置**: `src\app\api\admin\manuals\review\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT `/adminapi/admin/parts/[id]`

**文件位置**: `src\app\api\admin\parts\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/parts/import`

**文件位置**: `src\app\api\admin\parts\import\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/parts/options`

**文件位置**: `src\app\api\admin\parts\options\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/admin/parts`

**文件位置**: `src\app\api\admin\parts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/admin/procurement/orders/[id]`

**文件位置**: `src\app\api\admin\procurement\orders\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/procurement/orders`

**文件位置**: `src\app\api\admin\procurement\orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/procurement/suppliers`

**文件位置**: `src\app\api\admin\procurement\suppliers\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/admin/shops/[id]`

**文件位置**: `src\app\api\admin\shops\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/shops/pending`

**文件位置**: `src\app\api\admin\shops\pending\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/shops`

**文件位置**: `src\app\api\admin\shops\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/system/monitoring/alerts`

**文件位置**: `src\app\api\admin\system\monitoring\alerts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/system/monitoring/metrics`

**文件位置**: `src\app\api\admin\system\monitoring\metrics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/admin/tenants`

* 绉熸埛绠＄悊 API 璺敱
 * 鎻愪緵绉熸埛鍒涘缓銆佺鐞嗐€佺敤鎴峰垎閰嶇瓑鍔熻兘

**文件位置**: `src\app\api\admin\tenants\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE | PATCH `/adminapi/admin/tutorials/[id]`

**文件位置**: `src\app\api\admin\tutorials\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/tutorials`

**文件位置**: `src\app\api\admin\tutorials\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | DELETE `/adminapi/admin/user-management`

* 多类型用户管理 API

**文件位置**: `src\app\api\admin\user-management\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/admin/users/batch`

**文件位置**: `src\app\api\admin\users\batch\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | DELETE `/adminapi/admin/users/behavior`

**文件位置**: `src\app\api\admin\users\behavior\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/users/export`

**文件位置**: `src\app\api\admin\users\export\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/admin/users/import`

**文件位置**: `src\app\api\admin\users\import\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/users`

* 管理后台用户列表 API - 使用权限中间件示例
 *
 * @file src/app/api/admin/users/route.ts

**文件位置**: `src\app\api\admin\users\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/users/stats`

**文件位置**: `src\app\api\admin\users\stats\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/admin/valuation/logs`

* GET /api/admin/valuation/logs
 * 获取估值日志列表

**文件位置**: `src\app\api\admin\valuation\logs\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/admin/valuation/stats`

* GET /api/admin/valuation/stats
 * 鑾峰彇板€肩粺璁′俊

**文件位置**: `src\app\api\admin\valuation\stats\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## affiliate

### GET | POST `/adminapi/affiliate/analytics/clicks`

**文件位置**: `src\app\api\affiliate\analytics\clicks\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/affiliate/links`

**文件位置**: `src\app\api\affiliate\links\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## agents

### POST | PATCH `/adminapi/agents/[id]/execute`

* 智能体执行和调试 API 端点
 * 提供智能体执行、调试和 Playground 功能

**文件位置**: `src\app\api\agents\[id]\execute\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/agents/[id]`

* 单个智能体操作 API 端点
 * 提供智能体详情、更新、删除和执行功能

**文件位置**: `src\app\api\agents\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | DELETE `/adminapi/agents/install`

* POST /api/agents/install
 * 安装/订阅智能体

**文件位置**: `src\app\api\agents\install\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/agents/invoke`

* 智能体调用API
 * 提供直接调用智能体执行特定任务的功能，带权限验证

**文件位置**: `src\app\api\agents\invoke\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/agents/registry`

* GET /api/agents/registry
 * 获取所有已注册的智能体

**文件位置**: `src\app\api\agents\registry\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/agents`

* 智能体API路由
 * 提供智能体列表、创建、更新、删除等功能

**文件位置**: `src\app\api\agents\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/agents/status`

* GET /api/agents/status
 * 获取所有智能体状态

**文件位置**: `src\app\api\agents\status\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## analytics

### GET | POST | PUT | DELETE `/adminapi/analytics/events`

* 鐢ㄦ埛琛屼负鏁版嵁鏀堕泦API绔偣
 * 澶勭悊鏉ヨ嚜鍓嶇鐨勮涓鸿拷韪暟

**文件位置**: `src\app\api\analytics\events\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/analytics/performance`

**文件位置**: `src\app\api\analytics\performance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## api-interceptor

### GET | POST `/adminapi/api-interceptor`

**文件位置**: `src\app\api\api-interceptor\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## articles

### GET | POST `/adminapi/articles/[id]/like`

**文件位置**: `src\app\api\articles\[id]\like\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/articles/[id]`

**文件位置**: `src\app\api\articles\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/articles`

**文件位置**: `src\app\api\articles\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## audit

### GET | POST `/adminapi/audit/logs`

* 瀹¤日志 API 绔偣
 * 鎻愪緵日志鏌ヨ銆佽过滤ゃ€佺粺璁″拰鍙鍖栨暟

**文件位置**: `src\app\api\audit\logs\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## auth

###  `/adminapi/auth/[...nextauth]`

* NextAuth.js API路由处理程序
 * 适用于 Next.js App Router

**文件位置**: `src\app\api\auth\[...nextauth]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/auth/callback/google`

**文件位置**: `src\app\api\auth\callback\google\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/auth/check-session`

**文件位置**: `src\app\api\auth\check-session\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/auth/login`

**文件位置**: `src\app\api\auth\login\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/auth/register`

* 根据用户类型获取默认的账户类型

**文件位置**: `src\app\api\auth\register\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## b2b-procurement

### POST `/adminapi/b2b-procurement/negotiation/[sessionId]/round`

**文件位置**: `src\app\api\b2b-procurement\negotiation\[sessionId]\round\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/negotiation/[sessionId]`

**文件位置**: `src\app\api\b2b-procurement\negotiation\[sessionId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/b2b-procurement/negotiation/recommendations`

**文件位置**: `src\app\api\b2b-procurement\negotiation\recommendations\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/negotiation/start`

**文件位置**: `src\app\api\b2b-procurement\negotiation\start\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/b2b-procurement/negotiation/suppliers/[supplierId]/performance`

**文件位置**: `src\app\api\b2b-procurement\negotiation\suppliers\[supplierId]\performance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/parse-demand-enhanced`

* BERT澧炲己鐗圔2B閲囪喘闇€姹傝В鏋怉PI绔偣

**文件位置**: `src\app\api\b2b-procurement\parse-demand-enhanced\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/parse-demand-llm`

* 澶фā鍨婣PI闆嗘垚鐗圔2B閲囪喘闇€姹傝В鏋怉PI绔偣

**文件位置**: `src\app\api\b2b-procurement\parse-demand-llm\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/parse-demand`

* B2B閲囪喘闇€姹傝В鏋怉PI绔偣

**文件位置**: `src\app\api\b2b-procurement\parse-demand\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/parse-requirement`

* B2B閲囪喘闇€姹傜悊瑙ｅ紩鎿嶢PI绔偣
 * 鏀寔鏂囨湰銆佸浘鐗囥€侀摼鎺ョ瓑澶氱杈撳叆绫诲瀷鐨勬櫤鑳借В

**文件位置**: `src\app\api\b2b-procurement\parse-requirement\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/b2b-procurement/quotation/requests/[id]/send`

**文件位置**: `src\app\api\b2b-procurement\quotation\requests\[id]\send\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/quotation/requests`

**文件位置**: `src\app\api\b2b-procurement\quotation\requests\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/quotation/templates`

**文件位置**: `src\app\api\b2b-procurement\quotation\templates\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/reports`

**文件位置**: `src\app\api\b2b-procurement\reports\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/b2b-procurement/smart-agent`

**文件位置**: `src\app\api\b2b-procurement\smart-agent\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## brands

### GET `/adminapi/brands/[brandId]/dashboard/stats`

**文件位置**: `src\app\api\brands\[brandId]\dashboard\stats\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/brands/[brandId]/products`

**文件位置**: `src\app\api\brands\[brandId]\products\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/brands/login`

**文件位置**: `src\app\api\brands\login\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## business

### POST `/adminapi/business/register`

**文件位置**: `src\app\api\business\register\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## cdn-accelerator

### GET | POST `/adminapi/cdn-accelerator`

**文件位置**: `src\app\api\cdn-accelerator\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## cron

### GET `/adminapi/cron/daily-task`

**文件位置**: `src\app\api\cron\daily-task\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/cron/hourly-task`

**文件位置**: `src\app\api\cron\hourly-task\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## crowdfunding

### GET | POST | PUT | DELETE `/adminapi/crowdfunding/[id]`

**文件位置**: `src\app\api\crowdfunding\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/crowdfunding/payments/fcx`

* 楃FCX鏀粯API
 * 澶勭悊楃椤圭洰涓殑FCX鏀粯璇眰

**文件位置**: `src\app\api\crowdfunding\payments\fcx\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/crowdfunding/pledges`

**文件位置**: `src\app\api\crowdfunding\pledges\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/crowdfunding/projects`

**文件位置**: `src\app\api\crowdfunding\projects\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | PATCH `/adminapi/crowdfunding/recommend`

* GET /api/crowdfunding/recommenduserId=xxx
 * 鑾峰彇鐢ㄦ埛鏈哄瀷鍗囩骇鎺ㄨ崘
 *
 * 鏌ヨ鍙傛暟:
 * - userId: 鐢ㄦ埛ID (蹇呴渶)
 * - limit: 杩斿洖鎺ㄨ崘鏁伴噺锛岄粯
 * - useCache: 鏄惁浣跨敤缂撳鎺ㄨ崘锛岄粯璁rue
 *
 * 杩斿洖:
 * - success: boolean - 鏄惁鎴愬姛
 * - data: UpgradeRecommendation[] - 鎺ㄨ崘鍒楄〃
 * - message: string - 缁撴灉娑堟伅

**文件位置**: `src\app\api\crowdfunding\recommend\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## dashboard

### GET `/adminapi/dashboard/data`

* 瑙掕壊宸紓Dashboard API 绔偣
 * 鏍规嵁鐢ㄦ埛瑙掕壊杩斿洖涓嶅悓鐨勪华琛ㄦ澘鏁版嵁鍜屽姛鑳芥ā

**文件位置**: `src\app\api\dashboard\data\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## data-center

### GET | POST `/adminapi/data-center/analytics`

**文件位置**: `src\app\api\data-center\analytics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/gateway`

**文件位置**: `src\app\api\data-center\gateway\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/monitor`

**文件位置**: `src\app\api\data-center\monitor\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/monitoring/alert-engine`

* @swagger
 * /api/data-center/monitoring/alert-engine:
 *   get:
 *     summary: 鏅鸿兘鍛婅瑙勫垯閰嶇疆鍜屽垎绾х鐞嗗姛 *     description: 寮€鍙戞櫤鑳藉憡璀﹁鍒欓厤缃€佸垎绾х鐞嗗拰鑷姩鍖栧鐞嗗紩 *     tags: [鏁版嵁涓績-鐩戞帶鍛婅]
 *     parameters:
 *       - name: action
 *         in: query
 *         description: 鎿嶄綔绫诲瀷
 *         required: false
 *         schema:
 *           type: string
 *           enum: [list, create, update, delete, evaluate, history]
 *       - name: ruleId
 *         in: query
 *         description: 鍛婅瑙勫垯ID
 *         required: false
 *         schema:
 *           type: string
 *   post:
 *     summary: 鍒涘缓鎴栨洿鏂板憡璀﹁ *     description: 氳繃POST璇眰鍒涘缓鏂扮殑鍛婅瑙勫垯鎴栨洿鏂扮幇鏈夎 *     tags: [鏁版嵁涓績-鐩戞帶鍛婅]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 瑙勫垯鍚嶇О
 *               condition:
 *                 type: string
 *                 description: 鍛婅鏉′欢琛ㄨ揪 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               enabled:
 *                 type: boolean
 *               notificationChannels:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 鎿嶄綔鎴愬姛
 *       500:
 *         description: 鏈嶅姟鍣ㄩ敊

**文件位置**: `src\app\api\data-center\monitoring\alert-engine\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/data-center/monitoring/integrator`

* @swagger
 * /api/data-center/monitoring/integrator:
 *   get:
 *     summary: 缁熶竴鐜版湁鍚勬ā鍧楃殑鐩戞帶鍛婅鍔熻兘
 *     description: 鏁村悎璁惧绠＄悊銆佷緵搴旈摼銆佺淮淇湇鍔＄瓑鍚勬ā鍧楃殑鐩戞帶鍛婅绯荤粺
 *     tags: [鏁版嵁涓績-鐩戞帶鍛婅]
 *     parameters:
 *       - name: module
 *         in: query
 *         description: 鎸囧畾瑕佹暣鍚堢殑妯″潡鍚嶇О
 *         required: false
 *         schema:
 *           type: string
 *           enum: [devices, supply-chain, wms, fcx, data-quality, analytics]
 *       - name: action
 *         in: query
 *         description: 鎿嶄綔绫诲瀷
 *         required: false
 *         schema:
 *           type: string
 *           enum: [status, integrate, sync, validate]
 *     responses:
 *       200:
 *         description: 鐩戞帶鏁村悎鎴愬姛
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "鐩戞帶绯荤粺鏁村悎瀹屾垚"
 *                 data:
 *                   type: object
 *                   properties:
 *                     integratedModules:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalAlerts:
 *                       type: integer
 *                     activeMonitors:
 *                       type: integer
 *       500:
 *         description: 鏈嶅姟鍣ㄩ敊

**文件位置**: `src\app\api\data-center\monitoring\integrator\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/monitoring/performance`

* @swagger
 * /api/data-center/monitoring/performance:
 *   get:
 *     summary: 绯荤粺鎬ц兘鐡堕鑷姩璇嗗埆鍜屽垎鏋愬姛 *     description: 瀹炵幇绯荤粺鎬ц兘鐡堕鐨勮嚜鍔ㄨ瘑鍒€佸垎鏋愬拰樺寲寤鸿
 *     tags: [鏁版嵁涓績-鐩戞帶鍛婅]
 *     parameters:
 *       - name: action
 *         in: query
 *         description: 鎿嶄綔绫诲瀷
 *         required: false
 *         schema:
 *           type: string
 *           enum: [analyze, bottlenecks, recommendations, optimize, report]
 *       - name: timeframe
 *         in: query
 *         description: 鍒嗘瀽堕棿鑼冨洿
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d]
 *           default: 24h
 *   post:
 *     summary: 鎵ц鎬ц兘樺寲鎿嶄綔
 *     description: 瑙﹀彂鎬ц兘樺寲寤鸿鐨勬墽琛屾垨搴旂敤
 *     tags: [鏁版嵁涓績-鐩戞帶鍛婅]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [apply, ignore, schedule]
 *               recommendationId:
 *                 type: string
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 鎿嶄綔鎴愬姛
 *       500:
 *         description: 鏈嶅姟鍣ㄩ敊

**文件位置**: `src\app\api\data-center\monitoring\performance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/monitoring`

**文件位置**: `src\app\api\data-center\monitoring\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/multidim`

* @file route.ts
 * @description 澶氱淮鍒嗘瀽API璺敱澶勭悊 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28

**文件位置**: `src\app\api\data-center\multidim\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/optimizer`

**文件位置**: `src\app\api\data-center\optimizer\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/data-center/permissions`

* 缁熶竴鏉冮檺绠＄悊API
 * 鎻愪緵鏉冮檺妫€鏌ャ€佽鑹茬鐞嗗拰鏁版嵁璁块棶鎺у埗鐨凴ESTful鎺ュ彛

**文件位置**: `src\app\api\data-center\permissions\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/recommendations`

**文件位置**: `src\app\api\data-center\recommendations\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center`

**文件位置**: `src\app\api\data-center\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/data-center/scheduler`

* @swagger
 * /api/data-center/scheduler:
 *   get:
 *     summary: 鑾峰彇璋冨害诲姟鍜岃闃呬俊 *     description: 鑾峰彇鎶ヨ〃璋冨害诲姟鍒楄〃銆佽闃呬俊鎭拰璋冨害鍣ㄧ姸 *     tags: [鏁版嵁涓績-璋冨害鍣╙
 *     parameters:
 *       - name: action
 *         in: query
 *         description: 鎿嶄綔绫诲瀷
 *         required: false
 *         schema:
 *           type: string
 *           enum: [list, status, subscriptions, templates]
 *       - name: scheduleId
 *         in: query
 *         description: 璋冨害诲姟ID锛堢敤浜庤幏鍙栫壒瀹氫换鍔＄殑璁㈤槄 *         required: false
 *         schema:
 *           type: string
 *   post:
 *     summary: 鍒涘缓鏂扮殑璋冨害诲姟
 *     description: 鍒涘缓鏂扮殑鎶ヨ〃瀹氭椂璋冨害诲姟
 *     tags: [鏁版嵁涓績-璋冨害鍣╙
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - name
 *               - schedule
 *               - recipients
 *               - format
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: 鎶ヨ〃妯℃澘ID
 *               name:
 *                 type: string
 *                 description: 璋冨害诲姟鍚嶇О
 *               description:
 *                 type: string
 *                 description: 诲姟鎻忚堪
 *               schedule:
 *                 type: object
 *                 description: 璋冨害閰嶇疆
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [minute, hour, day, week, month]
 *                   interval:
 *                     type: integer
 *                     minimum: 1
 *                   startTime:
 *                     type: string
 *                     format: time
 *                   endTime:
 *                     type: string
 *                     format: time
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                   daysOfMonth:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 31
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 鎺ユ敹鑰呴偖绠卞垪 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv, html]
 *                 description: 鎶ヨ〃鏍煎紡
 *               enabled:
 *                 type: boolean
 *                 description: 鏄惁鍚敤
 *   put:
 *     summary: 鏇存柊璋冨害诲姟
 *     description: 鏇存柊鐜版湁鐨勮皟搴︿换鍔￠厤 *     tags: [鏁版嵁涓績-璋冨害鍣╙
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 璋冨害诲姟ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               schedule:
 *                 type: object
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv, html]
 *               enabled:
 *                 type: boolean
 *   delete:
 *     summary: 鍒犻櫎璋冨害诲姟
 *     description: 鍒犻櫎鎸囧畾鐨勮皟搴︿换 *     tags: [鏁版嵁涓績-璋冨害鍣╙
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 璋冨害诲姟ID

**文件位置**: `src\app\api\data-center\scheduler\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/security`

**文件位置**: `src\app\api\data-center\security\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/streaming`

**文件位置**: `src\app\api\data-center\streaming\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-center/views`

**文件位置**: `src\app\api\data-center\views\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## data-pipeline

### GET | POST `/adminapi/data-pipeline`

**文件位置**: `src\app\api\data-pipeline\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## data-protection

### GET | POST `/adminapi/data-protection`

**文件位置**: `src\app\api\data-protection\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## data-quality

### GET | POST `/adminapi/data-quality/auto-fix`

**文件位置**: `src\app\api\data-quality\auto-fix\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-quality/dashboard`

**文件位置**: `src\app\api\data-quality\dashboard\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-quality`

**文件位置**: `src\app\api\data-quality\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-quality/rules`

**文件位置**: `src\app\api\data-quality\rules\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/data-quality/trends`

**文件位置**: `src\app\api\data-quality\trends\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## devices

### GET | POST `/adminapi/devices/[qrcodeId]/lifecycle`

**文件位置**: `src\app\api\devices\[qrcodeId]\lifecycle\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PATCH `/adminapi/devices/[qrcodeId]/profile`

**文件位置**: `src\app\api\devices\[qrcodeId]\profile\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/devices`

* 璁惧绠＄悊 API 绔偣锛堝甫绉熸埛楠岃瘉 * 婕旂ず濡備綍浣跨敤 requireTenant 涓棿

**文件位置**: `src\app\api\devices\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## diagnosis

### GET | POST | DELETE `/adminapi/diagnosis/analyze`

* AI璇婃柇鍒嗘瀽API绔偣
 * POST /api/diagnosis/analyze
 * 鎺ユ敹鏁呴殰鎻忚堪锛岃繑鍥炵粨鏋勫寲璇婃柇缁撴灉

**文件位置**: `src\app\api\diagnosis\analyze\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | DELETE `/adminapi/diagnosis`

**文件位置**: `src\app\api\diagnosis\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## documents

### GET `/adminapi/documents`

**文件位置**: `src\app\api\documents\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## enterprise

### GET | POST `/adminapi/enterprise/agents`

**文件位置**: `src\app\api\enterprise\agents\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT `/adminapi/enterprise/analytics`

**文件位置**: `src\app\api\enterprise\analytics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/enterprise/blockchain/codes`

**文件位置**: `src\app\api\enterprise\blockchain\codes\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT `/adminapi/enterprise/blockchain/products`

**文件位置**: `src\app\api\enterprise\blockchain\products\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/enterprise/blockchain/register`

* POST /api/enterprise/blockchain/register
 * 注册产品到区块链

**文件位置**: `src\app\api\enterprise\blockchain\register\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/enterprise/blockchain/status`

* GET /api/enterprise/blockchain/status
 * 获取区块链连接状态

**文件位置**: `src\app\api\enterprise\blockchain\status\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/blockchain/sync`

* POST /api/enterprise/blockchain/sync
 * 同步批次到区块链

**文件位置**: `src\app\api\enterprise\blockchain\sync\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/blockchain/traceability`

* POST /api/enterprise/blockchain/traceability
 * 添加溯源记录

**文件位置**: `src\app\api\enterprise\blockchain\traceability\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/enterprise/blockchain/verify`

* GET /api/enterprise/blockchain/verify?productId=xxx
 * 验证产品真伪

**文件位置**: `src\app\api\enterprise\blockchain\verify\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/enterprise/documents/[documentId]`

**文件位置**: `src\app\api\enterprise\documents\[documentId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/documents`

**文件位置**: `src\app\api\enterprise\documents\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/enterprise/login`

**文件位置**: `src\app\api\enterprise\login\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/manuals`

**文件位置**: `src\app\api\enterprise\manuals\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/parts`

* 佷笟閰嶄欢绠＄悊 API 璺敱
 * 鎻愪緵閰嶄欢鐨勫鍒犳敼鏌ュ姛

**文件位置**: `src\app\api\enterprise\parts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/procurement/orders`

**文件位置**: `src\app\api\enterprise\procurement\orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/enterprise/register`

**文件位置**: `src\app\api\enterprise\register\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/repair-tips`

**文件位置**: `src\app\api\enterprise\repair-tips\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/software-updates`

**文件位置**: `src\app\api\enterprise\software-updates\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | DELETE | PATCH `/adminapi/enterprise/traceability/batches/[batchId]`

* 获取批次详情
 * GET /api/enterprise/traceability/batches/:batchId

**文件位置**: `src\app\api\enterprise\traceability\batches\[batchId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/traceability/batches`

* 获取企业的所有溯源码批次
 * GET /api/enterprise/traceability/batches?enterprise_id=xxx

**文件位置**: `src\app\api\enterprise\traceability\batches\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST | PUT `/adminapi/enterprise/traceability/bind`

**文件位置**: `src\app\api\enterprise\traceability\bind\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/enterprise/traceability/export`

**文件位置**: `src\app\api\enterprise\traceability\export\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/enterprise/traceability/purchase`

**文件位置**: `src\app\api\enterprise\traceability\purchase\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/enterprise/traceability/statistics/[batchId]`

* 获取批次扫描统计数据
 * GET /api/enterprise/traceability/statistics/:batchId

**文件位置**: `src\app\api\enterprise\traceability\statistics\[batchId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## fcx

### GET `/adminapi/fcx/accounts/[accountId]/balance`

* FCX账户余额查询API

**文件位置**: `src\app\api\fcx\accounts\[accountId]\balance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/fcx/accounts/[accountId]/details`

* FCX账户详情查询API
 * 包含余额、交易历史等详细信息

**文件位置**: `src\app\api\fcx\accounts\[accountId]\details\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/accounts`

* FCX璐︽埛API璺敱
 * 澶勭悊璐︽埛鍒涘缓銆佹煡璇㈢瓑鎿嶄綔

**文件位置**: `src\app\api\fcx\accounts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/fcx/alliance/join`

* 缁翠慨搴楀姞鐩烝PI
 * 澶勭悊搴楅摵鍔犲叆FCX鑱旂洘鐨勮川鎶兼祦

**文件位置**: `src\app\api\fcx\alliance\join\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/fcx/alliance/leave`

* 缁翠慨搴楅€€鍑鸿仈鐩烝PI
 * 澶勭悊搴楅摵€鍑篎CX鑱旂洘鍜岃В闄よ川

**文件位置**: `src\app\api\fcx\alliance\leave\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/fcx/alliance/members`

* 鑱旂洘鎴愬憳鏌ヨAPI
 * 鑾峰彇鑱旂洘鎴愬憳鍒楄〃鍜屾帓琛屾

**文件位置**: `src\app\api\fcx\alliance\members\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/equipment/exchange`

* FCX鍏戞崲閰嶄欢API璺敱

**文件位置**: `src\app\api\fcx\equipment\exchange\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/equity`

* FCX鏉冪泭鍏戞崲API鎺ュ彛
 * 鎻愪緵鏉冪泭鏌ヨ銆佸厬鎹€佽褰曟煡璇㈢瓑鍔熻兘

**文件位置**: `src\app\api\fcx\equity\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/exchange`

* FCX閰嶄欢鍏戞崲API璺敱
 * 鎻愪緵閰嶄欢鍏戞崲鐨勬牳蹇冨姛鑳芥帴

**文件位置**: `src\app\api\fcx\exchange\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/orders/[orderId]/parts`

* 工单配件更换API
 * 处理工单中的配件更换操作并记录生命周期事件

**文件位置**: `src\app\api\fcx\orders\[orderId]\parts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT `/adminapi/fcx/orders/[orderId]`

* 工单详情和操作API

**文件位置**: `src\app\api\fcx\orders\[orderId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/orders`

* 宸ュ崟绠＄悊API - 鍒涘缓鍜屾煡璇㈠伐

**文件位置**: `src\app\api\fcx\orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/purchase/enhanced`

* 澧炲己鐗團CX璐拱API
 * 鏀寔澶氱鏀粯鏂瑰紡鍜屽畬鍠勭殑璐︽埛绠＄悊

**文件位置**: `src\app\api\fcx\purchase\enhanced\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/fcx/purchase`

* FCX璐拱API

**文件位置**: `src\app\api\fcx\purchase\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/fcx/recommendations`

* FCX鏅鸿兘鎺ㄨ崘API鎺ュ彛
 * 鎻愪緵涓€у寲鎺ㄨ崘銆佽涓烘敹闆嗐€佸弽棣堣褰曠瓑鍔熻兘

**文件位置**: `src\app\api\fcx\recommendations\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/fcx/rewards`

* FCX2濂栧姳绠＄悊API

**文件位置**: `src\app\api\fcx\rewards\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/fcx/transactions/transfer`

* FCX杞处API

**文件位置**: `src\app\api\fcx\transactions\transfer\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## foreign-trade

### GET | PUT | DELETE `/adminapi/foreign-trade/orders/[id]`

**文件位置**: `src\app\api\foreign-trade\orders\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/foreign-trade/orders`

**文件位置**: `src\app\api\foreign-trade\orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE | PATCH `/adminapi/foreign-trade/partners/[id]`

**文件位置**: `src\app\api\foreign-trade\partners\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT `/adminapi/foreign-trade/partners`

**文件位置**: `src\app\api\foreign-trade\partners\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT `/adminapi/foreign-trade/shipments`

**文件位置**: `src\app\api\foreign-trade\shipments\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/foreign-trade/tracking/[tracking_number]`

**文件位置**: `src\app\api\foreign-trade\tracking\[tracking_number]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## growth

### GET | POST | PUT `/adminapi/growth`

**文件位置**: `src\app\api\growth\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## health

### GET | POST `/adminapi/health`

**文件位置**: `src\app\api\health\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## inventory

### GET | POST `/adminapi/inventory/reserve`

* 搴撳棰勭暀API璺敱
 * 澶勭悊搴撳棰勭暀鍜岄噴鏀捐

**文件位置**: `src\app\api\inventory\reserve\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## lifecycle

### GET | POST `/adminapi/lifecycle/events`

**文件位置**: `src\app\api\lifecycle\events\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/lifecycle/profile`

**文件位置**: `src\app\api\lifecycle\profile\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## links

### GET | POST | PUT `/adminapi/links/priority`

* @swagger
 * /api/links/priority:
 *   get:
 *     summary: 鑾峰彇炬帴樺厛绾у垪 *     description: 杩斿洖鎵€鏈夐摼鎺ョ殑樺厛绾т俊鎭紝鏀寔绛涢€夊拰鎺掑簭
 *     parameters:
 *       - name: status
 *         in: query
 *         description: 炬帴鐘舵€佺瓫 *         schema:
 *           type: string
 *           enum: [active, inactive, pending_review, rejected]
 *       - name: category
 *         in: query
 *         description: 鍒嗙被绛 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         description: 鎺掑簭瀛楁
 *         schema:
 *           type: string
 *           enum: [priority, created_at, views, likes]
 *           default: priority
 *       - name: sortOrder
 *         in: query
 *         description: 鎺掑簭鏂瑰悜
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: 鎴愬姛杩斿洖樺厛绾у垪 *       401:
 *         description: 鏈巿鏉冭

**文件位置**: `src\app\api\links\priority\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/links/query`

* @swagger
 * /api/links/query:
 *   post:
 *     summary: 鏌ヨ炬帴搴撲腑鐨勯摼 *     description: 鏍规嵁鍏抽敭璇嶆煡璇㈤摼鎺ュ簱锛岃繑鍥炴寜樺厛绾ф帓搴忕殑缁撴灉
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 鏌ヨ鍏抽敭 *                 example: "iPhone 12 鐢垫睜鏇存崲"
 *               limit:
 *                 type: integer
 *                 description: 杩斿洖缁撴灉鏁伴噺闄愬埗
 *                 default: 3
 *                 example: 5
 *               category:
 *                 type: string
 *                 description: 鎸囧畾鍒嗙被绛 *                 example: "缁翠慨鏁欑▼"
 *     responses:
 *       200:
 *         description: 鎴愬姛杩斿洖炬帴鍒楄〃
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         description: 炬帴鍦板潃
 *                       title:
 *                         type: string
 *                         description: 炬帴鏍囬
 *                       priority:
 *                         type: integer
 *                         description: 樺厛 *                       source:
 *                         type: string
 *                         description: 鏉ユ簮
 *       400:
 *         description: 璇眰鍙傛暟閿欒
 *       500:
 *         description: 鏈嶅姟鍣ㄥ唴閮ㄩ敊

**文件位置**: `src\app\api\links\query\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## manuals

### GET | POST `/adminapi/manuals/[manualId]/comments`

* 获取说明书评论
 * GET /api/manuals/[manualId]/comments

**文件位置**: `src\app\api\manuals\[manualId]\comments\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/manuals/[manualId]/review`

* 提交审核
 * POST /api/manuals/[manualId]/review/submit

**文件位置**: `src\app\api\manuals\[manualId]\review\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/manuals/[manualId]`

* 获取说明书详情
 * GET /api/manuals/[manualId]

**文件位置**: `src\app\api\manuals\[manualId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/manuals`

* 鑾峰彇璇存槑涔﹀垪 * GET /api/manualsproductId=xxx&status=published,draft&userId=xxx

**文件位置**: `src\app\api\manuals\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## marketing

### GET | POST `/adminapi/marketing/demo/agent-invoke`

**文件位置**: `src\app\api\marketing\demo\agent-invoke\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/marketing/demo/workflow-status`

**文件位置**: `src\app\api\marketing\demo\workflow-status\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/marketing/lead`

**文件位置**: `src\app\api\marketing\lead\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/marketing/track`

**文件位置**: `src\app\api\marketing\track\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## marketplace

### GET | POST | PUT | DELETE `/adminapi/marketplace/enterprise`

* 佷笟璁㈤槄绠＄悊API璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩

**文件位置**: `src\app\api\marketplace\enterprise\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/marketplace/orders`

* 璁㈠崟绠＄悊API璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩

**文件位置**: `src\app\api\marketplace\orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/marketplace`

* 鏅鸿兘浣撳競API 璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩

**文件位置**: `src\app\api\marketplace\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/marketplace/tokens`

* Token缁忔祹绯荤粺API璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩

**文件位置**: `src\app\api\marketplace\tokens\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## metrics

### GET | POST `/adminapi/metrics`

* 鐩戞帶鎸囨爣API绔偣
 * 鎻愪緵Prometheus鏍煎紡鐨勭洃鎺ф寚

**文件位置**: `src\app\api\metrics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## ml-prediction

### GET | POST `/adminapi/ml-prediction`

**文件位置**: `src\app\api\ml-prediction\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## moderation

### GET | POST | PUT | DELETE `/adminapi/moderation/auto`

* 鑷姩瀹℃牳API璺敱
 * FixCycle 6.0 鍐呭瀹℃牳鎺ュ彛

**文件位置**: `src\app\api\moderation\auto\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## monitoring

### GET | POST `/adminapi/monitoring/alerts`

**文件位置**: `src\app\api\monitoring\alerts\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/monitoring/enhanced`

**文件位置**: `src\app\api\monitoring\enhanced\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/monitoring/metrics`

* GET /api/monitoring/metrics
 * 杩斿洖Prometheus鏍煎紡鐨勭洃鎺ф寚

**文件位置**: `src\app\api\monitoring\metrics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/monitoring`

* 鐩戞帶API璺敱
 * FixCycle 6.0 鐩戞帶绯荤粺鎺ュ彛

**文件位置**: `src\app\api\monitoring\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## n8n

### GET | POST `/adminapi/n8n/replay`

* n8n 宸ヤ綔娴佸洖API
 * 鎻愪緵宸ヤ綔娴佸巻鍙叉墽琛屽洖鏀惧姛鑳斤紝甯︽潈闄愰獙璇佸拰瀹¤ュ織

**文件位置**: `src\app\api\n8n\replay\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/n8n/workflows`

* n8n 宸ヤ綔娴佹潈闄愭帶API
 * 鎻愪緵宸ヤ綔娴佽闂拰鎵ц鏉冮檺绠＄悊鎺ュ彛

**文件位置**: `src\app\api\n8n\workflows\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## notifications

### DELETE | PATCH `/adminapi/notifications/[id]`

**文件位置**: `src\app\api\notifications\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/notifications`

**文件位置**: `src\app\api\notifications\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## parts

### GET | POST `/adminapi/parts/compare`

**文件位置**: `src\app\api\parts\compare\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## performance

### GET | POST | PUT | DELETE `/adminapi/performance/metrics`

* 鍓嶇鎬ц兘鐩戞帶鏁版嵁鏀堕泦API
 * 澶勭悊鏉ヨ嚜瀹㈡埛绔殑鎬ц兘鎸囨爣鏁版嵁

**文件位置**: `src\app\api\performance\metrics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## permissions

### GET | POST `/adminapi/permissions/config`

* 权限配置管理 API 端点
 * 提供权限配置的查询、更新和验证功能

**文件位置**: `src\app\api\permissions\config\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/permissions/user/[userId]`

* 用户权限API端点
 * 提供用户权限查询和验证功能，支持前后端权限同步

**文件位置**: `src\app\api\permissions\user\[userId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## procurement-intelligence

### GET `/adminapi/procurement-intelligence/alert-rules-demo`

**文件位置**: `src\app\api\procurement-intelligence\alert-rules-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/alert-rules`

**文件位置**: `src\app\api\procurement-intelligence\alert-rules\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/async-processing-demo`

* 寮傛诲姟澶勭悊婕旂ずAPI
 * 灞曠ず鑰楁椂鎿嶄綔鐨勫紓姝ュ鐞嗚兘

**文件位置**: `src\app\api\procurement-intelligence\async-processing-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/cache-demo`

**文件位置**: `src\app\api\procurement-intelligence\cache-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/cache-strategy-demo`

* 鍒嗗眰缂撳绛栫暐婕旂ずAPI
 * 灞曠ず涓嶅悓缂撳绛栫暐鐨勪娇鐢ㄦ柟娉曞拰鏁堟灉

**文件位置**: `src\app\api\procurement-intelligence\cache-strategy-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/decision-engine`

**文件位置**: `src\app\api\procurement-intelligence\decision-engine\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/log-analysis-demo`

* ュ織鍒嗘瀽婕旂ずAPI
 * 灞曠ずュ織鍒嗘瀽澧炲己鍔熻兘

**文件位置**: `src\app\api\procurement-intelligence\log-analysis-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/market-intelligence`

**文件位置**: `src\app\api\procurement-intelligence\market-intelligence\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/memory-optimization-demo`

* 鍐呭樺寲婕旂ずAPI
 * 灞曠ず鍐呭鐩戞帶鍜屾硠婕忔娴嬪姛

**文件位置**: `src\app\api\procurement-intelligence\memory-optimization-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/metrics`

**文件位置**: `src\app\api\procurement-intelligence\metrics\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/optimized-demo`

* 鎬ц兘樺寲鐨勯噰璐櫤鑳戒綋API绀轰緥

**文件位置**: `src\app\api\procurement-intelligence\optimized-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/price-optimization`

**文件位置**: `src\app\api\procurement-intelligence\price-optimization\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/rate-limit-demo`

* 閲囪喘鏅鸿兘浣揂PI闄愭祦绀轰緥
 * 婕旂ず濡備綍鍦ㄥ疄闄匒PI涓娇鐢ㄩ檺娴佷腑闂翠欢

**文件位置**: `src\app\api\procurement-intelligence\rate-limit-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/risk-analysis`

**文件位置**: `src\app\api\procurement-intelligence\risk-analysis\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/supplier-profiling`

**文件位置**: `src\app\api\procurement-intelligence\supplier-profiling\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/procurement-intelligence/user-behavior-demo`

* 鐢ㄦ埛琛屼负鍒嗘瀽婕旂ずAPI
 * 灞曠ず鐢ㄦ埛琛屼负杩借釜鍜屽垎鏋愬姛

**文件位置**: `src\app\api\procurement-intelligence\user-behavior-demo\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## procurement

### GET | POST | PUT `/adminapi/procurement/match-suppliers`

* 渚涘簲鍟嗗尮閰岮PI璺敱澶勭悊 * 鎻愪緵 /api/procurement/match-suppliers 鎺ュ彛

**文件位置**: `src\app\api\procurement\match-suppliers\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## products

### GET | POST | PUT | DELETE `/adminapi/products/[productId]/manuals`

**文件位置**: `src\app\api\products\[productId]\manuals\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT `/adminapi/products/[productId]`

**文件位置**: `src\app\api\products\[productId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/products/qr`

**文件位置**: `src\app\api\products\qr\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## qrcode

### GET | POST `/adminapi/qrcode/batch`

**文件位置**: `src\app\api\qrcode\batch\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/qrcode/batch/upload`

**文件位置**: `src\app\api\qrcode\batch\upload\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/qrcode/generate`

**文件位置**: `src\app\api\qrcode\generate\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/qrcode/init-db`

**文件位置**: `src\app\api\qrcode\init-db\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## rbac

### GET `/adminapi/rbac/config`

* RBAC 閰嶇疆 API 绔偣
 * 鎻愪緵鍓嶇璁块棶 RBAC 閰嶇疆鐨勮兘

**文件位置**: `src\app\api\rbac\config\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/rbac`

**文件位置**: `src\app\api\rbac\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## recommendation

### GET | POST | PUT | PATCH `/adminapi/recommendation/quick-match`

**文件位置**: `src\app\api\recommendation\quick-match\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## repair-shop

### GET `/adminapi/repair-shop/dashboard`

**文件位置**: `src\app\api\repair-shop\dashboard\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/repair-shop/shops`

* 缁翠慨搴楅摵鏁版嵁API璺敱
 * 鎻愪緵缁翠慨搴楅摵淇℃伅鐨勭湡瀹炴暟鎹帴

**文件位置**: `src\app\api\repair-shop\shops\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT `/adminapi/repair-shop/work-orders/[orderId]`

* 单个维修工单API路由
 * 处理工单详情获取和状态更新

**文件位置**: `src\app\api\repair-shop\work-orders\[orderId]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/repair-shop/work-orders`

* 缁翠慨搴楀伐鍗曠鐞咥PI璺敱
 * 澶勭悊宸ュ崟鐨勫鍒犳敼鏌ユ搷

**文件位置**: `src\app\api\repair-shop\work-orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## reviews

### GET `/adminapi/reviews/pending`

**文件位置**: `src\app\api\reviews\pending\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## reward-qa

### GET | POST | PUT | DELETE `/adminapi/reward-qa/activities/[id]`

**文件位置**: `src\app\api\reward-qa\activities\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/reward-qa/activities`

**文件位置**: `src\app\api\reward-qa\activities\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/reward-qa/answers/claim`

**文件位置**: `src\app\api\reward-qa\answers\claim\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/reward-qa/answers`

**文件位置**: `src\app\api\reward-qa\answers\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/reward-qa/questions/[id]`

**文件位置**: `src\app\api\reward-qa\questions\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT `/adminapi/reward-qa/questions`

**文件位置**: `src\app\api\reward-qa\questions\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/reward-qa/stats`

**文件位置**: `src\app\api\reward-qa\stats\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## sales

### GET | PUT | DELETE `/adminapi/sales/customers/[id]`

* GET /api/sales/customers/[id]
 * 获取客户详情
 *
 * PUT /api/sales/customers/[id]
 * 更新客户信息
 *
 * DELETE /api/sales/customers/[id]
 * 删除客户

**文件位置**: `src\app\api\sales\customers\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/sales/customers`

* GET /api/sales/customers
 * 鑾峰彇瀹㈡埛鍒楄〃锛堟敮鎸佸垎椤靛拰绛涢€夛級
 *
 * POST /api/sales/customers
 * 鍒涘缓鏂板

**文件位置**: `src\app\api\sales\customers\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## scan

### GET `/adminapi/scan`

**文件位置**: `src\app\api\scan\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## security-monitoring

### GET | POST `/adminapi/security-monitoring`

* 绠€鍖栫殑瀹夊叏鐩戞帶API璺敱 - 鐢ㄤ簬娴嬭瘯

**文件位置**: `src\app\api\security-monitoring\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## session

### GET `/adminapi/session/me`

**文件位置**: `src\app\api\session\me\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## shops

### GET `/adminapi/shops/nearby`

**文件位置**: `src\app\api\shops\nearby\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## supply-chain

### GET `/adminapi/supply-chain/analytics/forecast-accuracy`

* 棰勬祴鍑嗙‘鐜囧垎鏋怉PI
 * 鐢ㄤ簬楠岃瘉堕棿搴忓垪棰勬祴妯″瀷鐨勫噯纭

**文件位置**: `src\app\api\supply-chain\analytics\forecast-accuracy\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/supply-chain/dashboard/replenishment`

* 琛ヨ揣寤鸿鐪嬫澘API
 * 鎻愪緵琛ヨ揣寤鸿鐨勬眹鎬昏鍥俱€佺粺璁″垎鏋愬拰瀹炴椂鐩戞帶

**文件位置**: `src\app\api\supply-chain\dashboard\replenishment\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/supply-chain/inventory`

* 渚涘簲惧簱瀛樻煡璇PI

**文件位置**: `src\app\api\supply-chain\inventory\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/supply-chain/logistics/track`

* 鐗╂祦杩借釜API璺敱
 * 鎻愪緵缁熶竴鐨勮繍鍗曡建杩规煡璇㈡帴 *
 * GET /api/supply-chain/logistics/tracktrackingNumber=xxx&carrier=xxx
 * POST /api/supply-chain/logistics/track - 鎵归噺鏌ヨ

**文件位置**: `src\app\api\supply-chain\logistics\track\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/supply-chain/purchase-orders/[id]`

* 采购订单详情API路由

**文件位置**: `src\app\api\supply-chain\purchase-orders\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/supply-chain/purchase-orders`

* 閲囪喘璁㈠崟API璺敱 - 鍒楄〃鍜屽垱

**文件位置**: `src\app\api\supply-chain\purchase-orders\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/recommendations/inventory`

* 搴撳樺寲寤鸿API

**文件位置**: `src\app\api\supply-chain\recommendations\inventory\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/recommendations/replenishment`

* 琛ヨ揣寤鸿API

**文件位置**: `src\app\api\supply-chain\recommendations\replenishment\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/recommendations/suppliers`

* 渚涘簲鍟嗗尮閰嶆帹鑽怉PI

**文件位置**: `src\app\api\supply-chain\recommendations\suppliers\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/recommendations/warehouses`

* 撳簱浣嶇疆鎺ㄨ崘API

**文件位置**: `src\app\api\supply-chain\recommendations\warehouses\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/supply-chain/suppliers/[id]`

* 供应商详情查询API

**文件位置**: `src\app\api\supply-chain\suppliers\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/suppliers/application`

* 渚涘簲鍟嗗叆椹荤敵璇稟PI

**文件位置**: `src\app\api\supply-chain\suppliers\application\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/supply-chain/suppliers/pending`

* 寰呭鏍镐緵搴斿晢鐢宠鏌ヨAPI

**文件位置**: `src\app\api\supply-chain\suppliers\pending\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/suppliers/review`

* 渚涘簲鍟嗗鏍窤PI
 * 澶勭悊渚涘簲鍟嗙敵璇风殑瀹℃牳娴佺▼

**文件位置**: `src\app\api\supply-chain\suppliers\review\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/supply-chain/warehouses/[id]/capacity`

* 仓库容量规划API

**文件位置**: `src\app\api\supply-chain\warehouses\[id]\capacity\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/supply-chain/warehouses/[id]/performance`

* 仓库绩效报告API

**文件位置**: `src\app\api\supply-chain\warehouses\[id]\performance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/warehouses/sync`

* 撳簱搴撳鍚屾API

**文件位置**: `src\app\api\supply-chain\warehouses\sync\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/supply-chain/warehouses/transfer`

* 璺ㄤ粨璋冩嫧API

**文件位置**: `src\app\api\supply-chain\warehouses\transfer\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## test-admin-check

### GET `/adminapi/test-admin-check`

**文件位置**: `src\app\api\test-admin-check\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## test-middleware

### GET `/adminapi/test-middleware`

**文件位置**: `src\app\api\test-middleware\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## tickets

### GET | POST `/adminapi/tickets`

* 任务管理API路由

**文件位置**: `src\app\api\tickets\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## tokens

### GET `/adminapi/tokens/balance`

**文件位置**: `src\app\api\tokens\balance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/tokens/packages`

**文件位置**: `src\app\api\tokens\packages\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## tools

### GET | POST `/adminapi/tools/execute`

* 绯荤粺宸ュ叿鎵ц API
 * 鎻愪緵鎵ц绯荤粺绠＄悊宸ュ叿鍜岃剼鏈殑鍔熻兘锛屽甫涓ユ牸鐨勬潈闄愰獙

**文件位置**: `src\app\api\tools\execute\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## tracking

### GET | POST `/adminapi/tracking/events`

**文件位置**: `src\app\api\tracking\events\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## tutorials

### GET | PUT | DELETE `/adminapi/tutorials/[id]`

**文件位置**: `src\app\api\tutorials\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/tutorials`

**文件位置**: `src\app\api\tutorials\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## user

### GET | POST `/adminapi/user/profile`

**文件位置**: `src\app\api\user\profile\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/user/tenants`

* 鐢ㄦ埛绉熸埛 API 绔偣
 * 鎻愪緵鐢ㄦ埛鍙闂殑绉熸埛鍒楄〃鍜岀鎴峰垏鎹㈠姛

**文件位置**: `src\app\api\user\tenants\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## users

### GET `/adminapi/users/fcx-balance`

* 鐢ㄦ埛FCX璐︽埛浣欓鏌ヨAPI
 * 涓轰紬绛规敮樻彁渚涘疄朵綑棰濅俊

**文件位置**: `src\app\api\users\fcx-balance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## v1

### GET `/adminapi/v1/articles/[id]`

**文件位置**: `src\app\api\v1\articles\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/v1/feed/hot`

**文件位置**: `src\app\api\v1\feed\hot\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/v1/interact/favorite`

**文件位置**: `src\app\api\v1\interact\favorite\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/v1/interact/like`

**文件位置**: `src\app\api\v1\interact\like\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/v1/parts/prices`

**文件位置**: `src\app\api\v1\parts\prices\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/v1/points`

**文件位置**: `src\app\api\v1\points\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/v1/recommend/personalized`

**文件位置**: `src\app\api\v1\recommend\personalized\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/v1/search`

**文件位置**: `src\app\api\v1\search\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### POST `/adminapi/v1/skills/[skillName]/execute`

* 技能执行 API - 用于沙箱测试
 * POST /api/v1/skills/[skillName]/execute

**文件位置**: `src\app\api\v1\skills\[skillName]\execute\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/v1/user/profile`

**文件位置**: `src\app\api\v1\user\profile\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## valuation

### GET | POST `/adminapi/valuation/estimate`

**文件位置**: `src\app\api\valuation\estimate\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/valuation/v2`

* 板€糀PI v2 - 鏅鸿兘铻嶅悎鐗堟湰
 * 鏍规嵁缃俊搴﹀姩鎬侀€夋嫨鏈€樹及鍊肩瓥

**文件位置**: `src\app\api\valuation\v2\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## warehouse

### GET | POST `/adminapi/warehouse/optimize`

* 鏅鸿兘鍒嗕粨寮曟搸API鎺ュ彛
 * 璺緞: /api/warehouse/optimize
 * 鏍规嵁鐢ㄦ埛鍦扮悊浣嶇疆銆佸悇撳簱搴撳銆佽繍璐瑰拰舵晥锛岃嚜鍔ㄩ€夋嫨鏈€樺彂璐т粨

**文件位置**: `src\app\api\warehouse\optimize\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## wms

### GET | POST `/adminapi/wms/callback/inbound`

* WMS鍏ュ簱棰勬姤鍥炶皟澶勭悊API
 * 鎺ユ敹鏉ヨ嚜WMS绯荤粺鐨勭姸鎬佸彉鏇撮€氱煡
 * WMS-203 鍏ュ簱棰勬姤绠＄悊鍔熻兘

**文件位置**: `src\app\api\wms\callback\inbound\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT | DELETE `/adminapi/wms/connections`

* WMS杩炴帴绠＄悊API璺敱
 * 澶勭悊WMS杩炴帴鐨勫鍒犳敼鏌ユ搷

**文件位置**: `src\app\api\wms\connections\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET `/adminapi/wms/dashboard/kpi-definitions`

* WMS鏁堣兘鍒嗘瀽鐪嬫澘 - KPI瀹氫箟API鎺ュ彛
 * 鎻愪緵棰勫畾涔夌殑KPI鎸囨爣閰嶇疆淇℃伅

**文件位置**: `src\app\api\wms\dashboard\kpi-definitions\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/wms/dashboard/performance`

* WMS鏁堣兘鍒嗘瀽鐪嬫澘API鎺ュ彛
 * 鎻愪緵撳簱杩愯惀KPI鏁版嵁銆佽秼鍔垮垎鏋愬拰鍛婅淇℃伅

**文件位置**: `src\app\api\wms\dashboard\performance\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/wms/inbound-forecast/[id]`

* 入库预报单详情和状态更新API路由
 * 处理单个预报单的查询和状态变更操作
 * WMS-203 入库预报管理功能

**文件位置**: `src\app\api\wms\inbound-forecast\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/wms/inbound-forecast`

* 鍏ュ簱棰勬姤绠＄悊API璺敱
 * 澶勭悊棰勬姤鍗曠殑鍒涘缓鍜屾煡璇㈡搷
 * WMS-203 鍏ュ簱棰勬姤绠＄悊鍔熻兘

**文件位置**: `src\app\api\wms\inbound-forecast\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST | PUT `/adminapi/wms/inventory`

* WMS搴撳鍚屾API璺敱
 * 澶勭悊搴撳鍚屾璇眰鍜岀姸鎬佹煡

**文件位置**: `src\app\api\wms\inventory\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

## workflows

### POST | PATCH `/adminapi/workflows/[id]/execute`

* 工作流执行 API 端点
 * 提供工作流执行和回放功能

**文件位置**: `src\app\api\workflows\[id]\execute\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | PUT | DELETE `/adminapi/workflows/[id]`

* 单个工作流操作 API 端点
 * 提供工作流详情、执行、更新等功能

**文件位置**: `src\app\api\workflows\[id]\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

### GET | POST `/adminapi/workflows`

* 宸ヤ綔娴佺API 绔偣
 * 鎻愪緵宸ヤ綔娴佸垪琛ㄣ€佽鎯呫€佹墽琛屽拰鍥炴斁鍔熻兘

**文件位置**: `src\app\api\workflows\route.ts`

**权限要求**: 需要认证 (参考 RBAC 配置)

---

