# 第五阶段完成 - 快速启动指南 ⚡

**目标**: 5 分钟内开始使用 Lighthouse 性能测试系统

---

## 🚀 快速开始（5 分钟）

### 步骤 1: 安装依赖 (1 分钟)

```bash
# 安装 Lighthouse 和 Chrome Launcher
npm install -D lighthouse chrome-launcher
```

### 步骤 2: 启动开发服务器 (1 分钟)

```bash
# 启动 Next.js 开发服务器
npm run dev
# 默认端口：3001
```

### 步骤 3: 运行性能测试 (3 分钟)

```bash
# 在新终端中运行 Lighthouse 测试
node scripts/run-lighthouse.js
```

**预期输出**:

```
🚀 开始执行 Lighthouse 性能测试...

配置信息:
  基础 URL: http://localhost:3001
  测试页面数：6
  阈值要求：Performance ≥90, Accessibility ≥90

🌐 启动 Chrome 浏览器...
✅ Chrome 已启动 (端口 43210)

🔍 测试 http://localhost:3001/...
✅ http://localhost:3001/ - Performance: 92, Accessibility: 95

🔍 测试 http://localhost:3001/analytics/executive-dashboard...
✅ ... - Performance: 90, Accessibility: 94

... (更多测试结果)

================================================================================
📋 Lighthouse 测试结果汇总
================================================================================
| 页面                                              | Performance | Accessibility | Best Practices | SEO     |
|---------------------------------------------------|-------------|---------------|----------------|---------|
| /                                                 |           92|             95|              93|       91|
| /analytics/executive-dashboard                    |           90|             94|              92|       90|
...

================================================================================
📊 性能分数检查
================================================================================
✅ performance: 91/100 (要求 ≥90)
✅ accessibility: 94/100 (要求 ≥90)
✅ best-practices: 92/100 (要求 ≥90)
✅ seo: 90/100 (要求 ≥90)
================================================================================
✅ 所有性能指标达到要求！

🎉 Lighthouse 测试完成！所有指标达标。
```

---

## 📊 查看测试报告

### HTML 报告

```bash
# 打开最新的 HTML 报告（任选一个）
open reports/lighthouse/*.html

# 或在文件浏览器中查看
# Windows: 资源管理器 → reports/lighthouse/
# Mac: Finder → reports/lighthouse/
```

### JSON 汇总

```bash
# 查看最新汇总
cat reports/lighthouse/latest-summary.json

# 或使用文本编辑器打开
code reports/lighthouse/latest-summary.json
```

---

## 📝 生成基准报告

```bash
# 生成 Markdown 格式的基准报告
node scripts/generate-lighthouse-report.js

# 查看报告
open docs/LIGHTHOUSE_BENCHMARK_REPORT.md
```

**报告内容**:

- ✅ 总体评分表格
- ✅ 各页面详细得分
- ✅ 性能指标分析
- ✅ 智能优化建议
- ✅ 下一步行动计划

---

## 🔧 常用命令

### 测试单个页面

```bash
# 仅测试首页
BASE_URL=http://localhost:3001 node scripts/run-lighthouse.js --url=/

# 仅测试仪表板
BASE_URL=http://localhost:3001 node scripts/run-lighthouse.js --url=/analytics/executive-dashboard
```

### 自定义配置

```bash
# 修改阈值（编辑脚本中的 CONFIG）
# scripts/run-lighthouse.js 第 18-23 行

thresholds: {
  performance: 90,      // 改为你的目标值
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
}
```

### 调试模式

```bash
# 查看详细日志
DEBUG=lighthouse:* node scripts/run-lighthouse.js

# 跳过阈值检查
SKIP_THRESHOLD_CHECK=true node scripts/run-lighthouse.js
```

---

## 🤖 CI/CD 集成

### GitHub Actions

工作流已配置在 `.github/workflows/lighthouse.yml`

**触发条件**:

- ✅ Push 到 main/staging/develop 分支
- ✅ Pull Request 创建
- ✅ 每天 UTC 凌晨 2 点定时运行
- ✅ 手动触发（workflow_dispatch）

**输出**:

- ✅ HTML 报告（保留 30 天）
- ✅ JSON 汇总（保留 90 天）
- ✅ PR 自动评论性能结果

### 手动触发工作流

1. 进入 GitHub Actions 标签
2. 选择 "Lighthouse Performance Test"
3. 点击 "Run workflow"
4. 选择分支
5. 点击 "Run workflow" 按钮

---

## 🎯 性能优化流程

### 1. 运行基线测试

```bash
node scripts/run-lighthouse.js
node scripts/generate-lighthouse-report.js
```

### 2. 识别问题

打开 `docs/LIGHTHOUSE_BENCHMARK_REPORT.md`，查看:

- 最低分的指标
- 具体的优化建议
- 优先级排序

### 3. 实施优化

参考报告中的建议逐项优化:

- **P0 优先级**: 影响用户体验的关键问题
- **P1 优先级**: 重要但不紧急的问题
- **P2 优先级**: 持续改进项

### 4. 验证效果

```bash
# 重新运行测试
node scripts/run-lighthouse.js

# 对比分数变化
cat reports/lighthouse/latest-summary.json | jq '.averageScores'
```

---

## 📈 监控和维护

### 日常监控

```bash
# 查看最近的测试结果
cat reports/lighthouse/latest-summary.json

# 查看历史趋势
ls -la reports/lighthouse/*-summary.json
```

### 告警设置

建议在 GitHub 设置:

- Performance 分数下降超过 5 分 → 发送邮件通知
- 任何指标低于 80 分 → 创建 Issue

### 定期审查

- **每周**: 查看性能趋势图
- **每月**: 深度分析性能瓶颈
- **每季度**: 制定新的优化目标

---

## 🐛 常见问题

### Q1: Chrome 无法启动

**错误**: `Error: Failed to launch the browser process`

**解决**:

```bash
# 确保 Chrome 或 Chromium 已安装
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install --cask google-chrome

# Windows
# 下载并安装 Chrome: https://www.google.com/chrome/
```

### Q2: 测试超时

**错误**: `Navigation timeout of 30000 ms exceeded`

**解决**:

```javascript
// scripts/run-lighthouse.js
// 增加超时时间（第 73 行）
const options = {
  // ... 其他配置
  maxWaitForLoad: 60000, // 改为 60 秒
};
```

### Q3: 分数波动大

**现象**: 同一页面多次测试分数差异大

**解决**:

1. 关闭其他占用 CPU 的程序
2. 确保网络环境稳定
3. 清除浏览器缓存
4. 多次测试取平均值

### Q4: 服务器未响应

**错误**: `Connection refused` 或 `ERR_CONNECTION_REFUSED`

**解决**:

```bash
# 确保开发服务器正在运行
npm run dev

# 检查端口是否正确
lsof -i :3001

# 如果使用不同端口，修改 BASE_URL
BASE_URL=http://localhost:3000 node scripts/run-lighthouse.js
```

---

## 💡 最佳实践

### 1. 建立性能预算

```javascript
// 在 package.json 中添加
"performance-budget": {
  "performance": 90,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 90
}
```

### 2. PR 检查清单

在 PR 描述中添加:

```markdown
## 性能影响

- [ ] Performance 分数无下降
- [ ] 无新增大型依赖
- [ ] 图片已优化
- [ ] 代码已压缩
```

### 3. 本地开发习惯

```bash
# 每次重大改动后运行测试
git commit -m "feat: add new feature"
node scripts/run-lighthouse.js

# 确保性能达标后再 push
```

---

## 🎓 学习资源

### 官方文档

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://web.dev/performance-best-practices/)

### 进阶学习

- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/evaluate-performance/)
- [Web Performance Testing](https://developer.mozilla.org/en-US/docs/Web/Performance/How_to_test)

---

## 📞 获取帮助

### 内部资源

- 查看完整文档：`tasks/LIGHTHOUSE_COMPLETION_REPORT.md`
- 技术实现细节：`scripts/run-lighthouse.js` 注释
- 历史报告：`reports/lighthouse/` 目录

### 社区支持

- Stack Overflow: [#lighthouse](https://stackoverflow.com/questions/tagged/lighthouse)
- GitHub Issues: [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse/issues)
- Web.dev Community: [web.dev/community](https://web.dev/community/)

---

## ✅ 检查清单

完成后请确认:

- [ ] 依赖已安装 (`lighthouse`, `chrome-launcher`)
- [ ] 开发服务器可正常启动
- [ ] 测试脚本可成功运行
- [ ] 能看到 HTML 报告
- [ ] 能查看 JSON 汇总
- [ ] 了解如何解读报告
- [ ] 知道如何优化性能
- [ ] 熟悉 CI/CD 集成

---

**预计用时**: 5-10 分钟
**难度**: ⭐⭐☆☆☆ (简单)
**先决条件**: Node.js 18+, npm 9+

---

🎉 **准备就绪！开始性能优化之旅吧！**

```bash
# 现在就试试
npm install -D lighthouse chrome-launcher
npm run dev
node scripts/run-lighthouse.js
```
