# Git 日常操作精简清单

## 🚀 快速开始
```bash
# 初始化（如果是新仓库）
git init
git remote add origin https://github.com/BiglionX/3CEP

# 克隆现有仓库
git clone https://github.com/BiglionX/3CEP
```

## 📝 日常开发流程

### 1. 开始新功能
```bash
git checkout develop
git pull origin develop
git checkout -b feature/功能名称
```

### 2. 提交更改
```bash
git add .
git commit -m "feat(scope): 描述变更内容"
git push origin feature/功能名称
```

### 3. 合并到开发分支
```bash
git checkout develop
git pull origin develop
git merge feature/功能名称
git push origin develop
```

## 🔧 常用命令速查

| 操作 | 命令 |
|------|------|
| 查看状态 | `git status` |
| 查看差异 | `git diff` |
| 查看提交历史 | `git log --oneline` |
| 撤销工作区更改 | `git checkout -- 文件名` |
| 撤销暂存区更改 | `git reset HEAD 文件名` |
| 修改最后一次提交 | `git commit --amend` |

## ⚠️ 注意事项

1. **提交前检查**：
   - 确认没有敏感信息（.env等）
   - 确保代码能正常运行
   - 遵循提交消息格式

2. **分支管理**：
   - 功能完成后及时删除本地分支
   - 定期同步 develop 分支

3. **冲突处理**：
   - 先拉取最新代码
   - 手动解决冲突
   - 测试后再提交

## 🆘 紧急情况处理

### 撤销最近一次提交（保留更改）
```bash
git reset --soft HEAD~1
```

### 完全撤销最近一次提交
```bash
git reset --hard HEAD~1
```

### 恢复误删文件
```bash
git checkout HEAD -- 文件名
```