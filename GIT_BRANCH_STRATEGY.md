# 精简 Git 分支策略

## 主要分支

- **main**: 生产环境代码（稳定版本）
- **develop**: 开发主分支（日常开发）

## 功能分支命名规范

- `feature/功能描述` - 新功能开发
- `fix/问题描述` - Bug 修复
- `hotfix/紧急修复` - 生产环境紧急修复

## 工作流程

1. 从 develop 创建功能分支
2. 开发完成后合并回 develop
3. 发布时从 develop 合并到 main

## 示例

```bash
# 创建新功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-auth

# 开发完成后
git add .
git commit -m "feat(auth): 实现用户认证功能"
git push origin feature/user-auth

# 合并到 develop
git checkout develop
git merge feature/user-auth
git push origin develop
```
