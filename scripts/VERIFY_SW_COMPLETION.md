# Service Worker 第四阶段完成 - 快速验证清单

**执行时间**: 2026-03-23
**验证状态**: ⏳ 待验证

---

## 🔍 验证步骤

### 1️⃣ Service Worker 注册验证 (SW-001)

#### 检查点

- [ ] 打开应用（http://localhost:3000）
- [ ] 打开 DevTools > Console
- [ ] 查看是否有 `[PWA] Service Worker registered` 日志
- [ ] 打开 DevTools > Application > Service Workers
- [ ] 确认 sw.js 已注册且状态为 "activated"

#### 预期结果

```
✅ Service Worker 成功注册
✅ 状态：Activated
✅ Scope: /
```

---

### 2️⃣ 缓存功能验证 (SW-002)

#### 测试步骤

1. 访问首页和几个其他页面
2. 打开 DevTools > Application > Cache Storage
3. 检查是否有 `app-cache-v1.0.0` 和 `assets-cache-v1.0.0`
4. 查看缓存的内容

#### API 缓存测试

```bash
# 在 Console 中运行
fetch('/api/test')
  .then(r => r.json())
  .then(d => console.log('API 响应:', d));

# 断网后再次运行，应该从缓存获取
```

#### 预期结果

```
✅ 静态资源已缓存（JS/CSS/图片）
✅ API 请求有缓存（带时间戳）
✅ 缓存条目包含 timestamp 字段
```

---

### 3️⃣ 更新检测验证 (SW-001.3)

#### 测试步骤

1. 修改 `/public/sw.js` 文件
   ```javascript
   // 修改版本号
   const CACHE_VERSION = 'v1.0.1'; // 从 v1.0.0 改为 v1.0.1
   ```
2. 刷新页面
3. 观察 Console 日志
4. 检查是否收到更新通知

#### 预期结果

```
✅ Console 显示：[Service Worker] New version found
✅ 收到 postMessage: { type: 'UPDATE_AVAILABLE' }
✅ 用户可见更新提示
```

---

### 4️⃣ 离线检测验证 (SW-003)

#### 测试步骤

1. 打开应用
2. 打开 DevTools > Network
3. 勾选 "Offline"
4. 观察页面顶部是否出现红色警告

#### 预期 UI

```
┌─────────────────────────────────────────┐
│ ⚠️  您已离线                            │
│ 当前无法连接到服务器，正在使用缓存数据。│
│ 已缓存的内容仍可访问，新数据将在网络    │
│ 恢复后自动同步。                        │
└─────────────────────────────────────────┘
```

#### 重连测试

1. 取消勾选 "Offline"
2. 观察是否出现绿色提示（3 秒）

#### 预期结果

```
✅ 离线时立即显示红色警告
✅ 重连时显示绿色成功提示
✅ 3 秒后自动消失
```

---

### 5️⃣ Hook 功能验证

#### 在任意组件中使用

```typescript
import { useOfflineStatus } from '@/components/pwa/OfflineDetector';

function TestComponent() {
  const { isOnline, lastOfflineTime } = useOfflineStatus();

  return (
    <div>
      <p>当前状态：{isOnline ? '在线' : '离线'}</p>
      {lastOfflineTime && (
        <p>最后离线：{lastOfflineTime.toLocaleString()}</p>
      )}
    </div>
  );
}
```

#### 预期结果

```
✅ useOfflineStatus 返回正确的状态
✅ lastOfflineTime 记录准确
✅ 状态变化实时更新
```

---

### 6️⃣ 自动化测试运行

#### 运行测试脚本

```javascript
// 在浏览器 Console 中运行
import('./scripts/test-service-worker.js').then(module => {
  module.runTests();
});
```

#### 预期输出

```
🚀 开始执行 Service Worker 功能测试...
============================================================

📋 测试：SW-001.1: Service Worker 文件存在
✅ 通过

📋 测试：SW-001.2: Service Worker 注册成功
✅ 通过

... (共 7 个测试)

============================================================
📊 测试结果汇总:
✅ 通过：7/7
❌ 失败：0
⚠️  警告：0

🎉 所有测试通过！Service Worker 功能正常。
```

---

## 🐛 可能的问题和解决方案

### 问题 1: Service Worker 未注册

**症状**: Console 中没有注册日志

**解决方案**:

```bash
# 清除所有缓存和 Service Worker
# DevTools > Application > Clear storage > Clear site data

# 或者在 Console 中运行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(names => names.forEach(n => caches.delete(n)));

# 然后刷新页面
location.reload();
```

---

### 问题 2: 缓存未命中

**症状**: Network 面板显示所有请求都是网络请求

**解决方案**:

```javascript
// 检查 sw.js 中的缓存策略
// 确保 handleStaticAsset 和 handleApiRequest 函数正确实现

// 在 Console 中检查缓存
caches.keys().then(keys => console.log('缓存列表:', keys));
caches.open('app-cache-v1.0.0').then(cache => {
  cache.keys().then(requests => {
    console.log(
      '缓存的请求:',
      requests.map(r => r.url)
    );
  });
});
```

---

### 问题 3: 离线提示不显示

**症状**: 断网后没有看到警告

**解决方案**:

```typescript
// 检查 OfflineDetector 是否在 layout.tsx 中正确引入
// 确认 z-index 层级（应该是 z-50）

// 检查 Alert 组件是否存在
// src/components/ui/alert.tsx 应该存在
```

---

### 问题 4: 更新检测不工作

**症状**: 修改 sw.js 后没有检测到更新

**解决方案**:

```javascript
// 手动触发更新检查
navigator.serviceWorker.ready.then(registration => {
  registration.update().then(() => {
    console.log('手动检查更新完成');
  });
});

// 监听更新事件
navigator.serviceWorker.addEventListener('message', event => {
  console.log('收到消息:', event.data);
});
```

---

## ✅ 验收签字

### 开发团队自检

- [ ] 所有代码已提交
- [ ] 测试脚本运行通过
- [ ] 文档已更新
- [ ] 无 Console 错误

### QA 验证

- [ ] 离线功能测试通过
- [ ] 缓存功能测试通过
- [ ] 更新检测测试通过
- [ ] UI 提示正常显示

### 技术负责人审批

- [ ] 代码质量符合要求
- [ ] 性能指标达标
- [ ] 文档完整清晰
- [ ] 可以进入生产环境

---

## 📊 验证结果汇总

| 验证项          | 状态      | 备注         |
| --------------- | --------- | ------------ |
| SW-001 注册     | ⬜ 待验证 | -            |
| SW-002 缓存策略 | ⬜ 待验证 | -            |
| SW-003 离线检测 | ⬜ 待验证 | -            |
| 自动化测试      | ⬜ 待验证 | 7 个测试用例 |
| 文档完整性      | ⬜ 待验证 | 3 个文档     |

---

**验证完成后请标记所有检查项并签名确认！**

---

## 🎯 快速验证命令

```bash
# 1. 启动开发服务器
npm run dev

# 2. 打开应用
open http://localhost:3000

# 3. 在 Console 中运行验证脚本
import('./scripts/test-service-worker.js').then(m => m.runTests());

# 4. 手动测试离线功能
# DevTools > Network > Offline

# 5. 检查缓存
# DevTools > Application > Cache Storage
```

---

**预计验证时间**: 15-20 分钟
**验证难度**: ⭐⭐☆☆☆ (简单)
