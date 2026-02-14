# 第三方服务密钥部署操作手册

## 📋 部署前准备清单

在开始部署前，请确保你已经准备好以下信息：

- [ ] Google账号（用于Google Cloud Platform）
- [ ] 淘宝/天猫账号（用于淘宝联盟）
- [ ] 京东账号（用于京东联盟）
- [ ] Vercel账号（已关联GitHub）

## 🚀 分步部署指南

### 第一部分：Google Custom Search API配置

#### 1. 获取Google API密钥
**目标页面：** https://console.cloud.google.com/

**详细步骤：**
1. 访问Google Cloud Console
2. 点击右上角"选择项目"下拉菜单
3. 点击"新建项目"按钮
4. 输入项目名称：`3cep-search-service`
5. 点击"创建"按钮

#### 2. 启用Custom Search API
1. 在左侧导航栏点击"API和服务" → "库"
2. 在搜索框输入：`Custom Search API`
3. 点击搜索结果中的"Custom Search API"
4. 点击蓝色的"启用"按钮

#### 3. 创建API凭据
1. 点击左侧"API和服务" → "凭据"
2. 点击顶部"创建凭据"按钮
3. 选择"API密钥"
4. 复制生成的密钥并妥善保存

#### 4. 创建自定义搜索引擎
1. 访问：https://programmablesearchengine.google.com/
2. 点击"添加"创建新的搜索引擎
3. 配置搜索引擎：
   - 名称：`3cep Product Search`
   - 搜索整个网络：✅ 勾选
   - 语言：中文
4. 点击"创建"按钮
5. 复制"搜索引擎ID"

### 第二部分：电商联盟API配置

#### 淘宝联盟配置
**目标页面：** https://pub.alimama.com/

1. 使用淘宝账号登录淘宝联盟
2. 点击顶部"开放平台"
3. 选择"服务商接入"
4. 填写开发者信息并提交申请
5. 审核通过后：
   - 进入"应用管理"
   - 创建新应用获取App Key和App Secret
   - 记录推广位PID

#### 京东联盟配置
**目标页面：** https://union.jd.com/

1. 注册并登录京东联盟账号
2. 进入"开放平台" → "API申请"
3. 选择需要的API权限
4. 提交申请等待审核
5. 审核通过后获取Access Key和Secret Key

### 第三部分：Vercel环境变量部署

**目标页面：** https://vercel.com/dashboard

#### 1. 进入项目设置
1. 登录Vercel控制台
2. 找到你的项目（3cep）
3. 点击项目进入详情页
4. 点击顶部"Settings"标签

#### 2. 添加环境变量
在"Environment Variables"部分依次添加：

**Google相关：**
```
Key: GOOGLE_CUSTOM_SEARCH_API_KEY
Value: [你获得的Google API密钥]
Environment: Production

Key: GOOGLE_CUSTOM_SEARCH_ENGINE_ID  
Value: [你的搜索引擎ID]
Environment: Production
```

**电商联盟相关：**
```
Key: TAOBAO_UNION_APP_KEY
Value: [淘宝联盟App Key]
Environment: Production

Key: TAOBAO_UNION_APP_SECRET
Value: [淘宝联盟App Secret]  
Environment: Production

Key: JD_UNION_ACCESS_KEY
Value: [京东Access Key]
Environment: Production

Key: JD_UNION_SECRET_KEY
Value: [京东Secret Key]
Environment: Production
```

#### 3. 部署更新
1. 添加完所有环境变量后
2. 回到项目概览页面
3. 点击"Deployments"标签
4. 点击最近的部署记录
5. 点击"Redeploy"按钮重新部署

### 第四部分：配置验证

#### 1. 运行本地验证
```bash
node scripts/verify-third-party-keys.js
```

#### 2. 在线功能测试
1. 访问你的部署网址
2. 测试搜索功能是否正常工作
3. 验证电商商品展示是否正确

## ⚠️ 注意事项

### 安全提醒
- ❌ 切勿将真实密钥提交到Git仓库
- ❌ 不要在前端代码中暴露敏感密钥
- ✅ 所有密钥都应该通过环境变量配置
- ✅ 定期轮换API密钥

### 成本控制
- 监控各平台API调用次数
- 设置合理的调用频率限制
- 关注免费额度使用情况

### 故障排除
如遇到问题，请按以下顺序排查：
1. 检查环境变量是否正确设置
2. 验证API密钥是否有效
3. 确认网络请求权限配置
4. 查看Vercel部署日志

## 🆘 技术支持

如需帮助，请提供：
- 具体的错误信息
- 相关的日志截图
- 已尝试的解决步骤