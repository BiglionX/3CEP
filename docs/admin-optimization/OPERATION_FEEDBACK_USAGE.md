# 统一操作反馈组件使用指南

**创建日期**: 2026-03-23
**版本**: v1.0.0

---

## 📋 目录

- [简介](#简介)
- [核心 Hook](#核心-hook)
- [组件使用](#组件使用)
- [最佳实践](#最佳实践)
- [示例代码](#示例代码)

---

## 简介

统一操作反馈系统提供了一套完整的用户交互解决方案，包括:

- ✅ **Toast 通知** - 操作结果即时反馈
- ⏳ **加载状态** - LoadingOverlay 显示处理进度
- ❓ **确认对话框** - 重要操作二次确认
- 🔄 **批量操作** - 批量任务进度追踪

---

## 核心 Hook

### useOperation

最基础的异步操作 Hook，适用于简单的 CRUD 操作。

#### API

```typescript
function useOperation<T>(options?: UseOperationOptions): {
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  isLoading: boolean;
  reset: () => void;
  setLoading: (loading: boolean) => void;
};
```

#### 配置选项

```typescript
interface UseOperationOptions {
  successMessage?: string; // 成功提示消息
  errorMessage?: string; // 错误提示消息
  showToast?: boolean; // 是否显示 Toast，默认 true
  onSuccess?: (result: T) => void; // 成功回调
  onError?: (error: Error) => void; // 错误回调
}
```

#### 基础示例

```tsx
import { useOperation } from '@/hooks/use-operation';

function UserForm() {
  const { execute, isLoading } = useOperation({
    successMessage: '用户创建成功',
    errorMessage: '创建用户失败',
  });

  const handleSubmit = async (data: FormData) => {
    await execute(async () => {
      await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    });
  };

  return (
    <Button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? '创建中...' : '创建用户'}
    </Button>
  );
}
```

---

### useBatchOperation

用于批量操作场景，自动显示进度和统计结果。

#### API

```typescript
function useBatchOperation<T>(options?: UseBatchOperationOptions): {
  executeBatch: (
    items: T[],
    operation: (item: T, index: number) => Promise<any>
  ) => Promise<BatchOperationResult<T>[]>;
  isLoading: boolean;
  progress: { completed: number; total: number };
  reset: () => void;
};
```

#### 批量删除示例

```tsx
import { useBatchOperation } from '@/hooks/use-operation';

function UserTable() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { executeBatch, isLoading, progress } = useBatchOperation({
    successMessage: '批量删除完成',
    continueOnError: true, // 单项失败时继续执行
    onProgress: (completed, total) => {
      console.log(`进度：${completed}/${total}`);
    },
  });

  const handleBatchDelete = async () => {
    await executeBatch(selectedUsers, async userId => {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    });

    setSelectedUsers([]);
  };

  return (
    <>
      <Button onClick={handleBatchDelete} disabled={isLoading}>
        {isLoading
          ? `删除中 (${progress.completed}/${progress.total})`
          : '批量删除'}
      </Button>

      {/* 表格内容 */}
    </>
  );
}
```

---

## 组件使用

### OperationFeedback 组件

包装任意子组件，自动添加反馈逻辑。

#### 基础用法

```tsx
import { OperationFeedback } from '@/components/business/OperationFeedback';

function DeleteUserButton({ userId }: { userId: string }) {
  return (
    <OperationFeedback
      requireConfirm
      confirmTitle="确认删除"
      confirmDescription="此操作将永久删除该用户，无法恢复"
      confirmButtonText="删除"
      successMessage="用户已删除"
      errorMessage="删除失败"
    >
      <Button variant="destructive">删除用户</Button>
    </OperationFeedback>
  );
}
```

#### 使用 renderTrigger

```tsx
<OperationFeedback
  requireConfirm
  successMessage="保存成功"
  renderTrigger={({ onClick, isLoading }) => (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading ? '保存中...' : '保存更改'}
    </Button>
  )}
/>
```

---

### OperationButton 组件

快速创建带反馈的操作按钮。

#### 简单示例

```tsx
import { OperationButton } from '@/components/business/OperationFeedback';

function Actions() {
  return (
    <OperationButton
      buttonText="导出数据"
      onClick={async () => {
        await fetch('/api/export', { method: 'POST' });
      }}
      successMessage="导出成功"
      errorMessage="导出失败"
    />
  );
}
```

#### 带确认的破坏性操作

```tsx
<OperationButton
  buttonText="删除账户"
  variant="destructive"
  requireConfirm
  confirmTitle="危险操作"
  confirmDescription="删除账户后所有数据将无法恢复"
  onClick={async () => {
    await deleteAccount();
  }}
/>
```

---

## 最佳实践

### 1. 选择合适的抽象层级

```tsx
// ✅ 推荐：简单操作使用 useOperation
const { execute } = useOperation({ successMessage: '保存成功' });

// ✅ 推荐：批量操作使用 useBatchOperation
const { executeBatch } = useBatchOperation({ continueOnError: true });

// ✅ 推荐：需要确认对话框使用 OperationFeedback 组件
<OperationFeedback requireConfirm>

// ❌ 避免：过度封装导致难以理解
```

### 2. 提供清晰的反馈消息

```tsx
// ✅ 好的反馈消息
useOperation({
  successMessage: '用户信息已更新',
  errorMessage: '网络异常，请稍后重试',
});

// ❌ 模糊的反馈消息
useOperation({
  successMessage: '成功',
  errorMessage: '失败',
});
```

### 3. 重要操作必须确认

```tsx
// ✅ 删除、禁用等破坏性操作需要确认
<OperationFeedback
  requireConfirm
  confirmTitle="确认删除"
  confirmDescription="删除后数据无法恢复"
>
  <Button variant="destructive">删除</Button>
</OperationFeedback>

// ✅ 查询、导出等非破坏性操作不需要确认
<OperationFeedback successMessage="导出成功">
  <Button>导出</Button>
</OperationFeedback>
```

### 4. 批量操作显示进度

```tsx
const { executeBatch, progress } = useBatchOperation({
  onProgress: (completed, total) => {
    // 实时更新 UI 显示进度
  },
});

<Button disabled={isLoading}>
  {isLoading ? `处理中 ${progress.completed}/${progress.total}` : '批量处理'}
</Button>;
```

### 5. 错误处理和降级

```tsx
const { execute } = useOperation({
  errorMessage: '操作失败，请稍后重试',
  onError: error => {
    // 记录错误日志
    console.error('Operation failed:', error);

    // 发送错误报告
    reportError(error);
  },
});
```

---

## 完整示例

### 用户管理页面

```tsx
'use client';

import { useState } from 'react';
import { useOperation, useBatchOperation } from '@/hooks/use-operation';
import { OperationButton } from '@/components/business/OperationFeedback';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 单个用户操作
  const { execute: deleteUserOp } = useOperation({
    successMessage: '用户已删除',
    errorMessage: '删除失败',
  });

  // 批量操作
  const { executeBatch, isLoading: isBatchLoading } = useBatchOperation({
    successMessage: '批量删除完成',
    continueOnError: true,
  });

  // 处理删除单个用户
  const handleDeleteUser = async (userId: string) => {
    await deleteUserOp(async () => {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== userId));
    });
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    await executeBatch(selectedIds, async userId => {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    });

    setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
    setSelectedIds([]);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1>用户管理</h1>

        {selectedIds.length > 0 && (
          <OperationButton
            buttonText={`批量删除 (${selectedIds.length})`}
            variant="destructive"
            requireConfirm
            confirmTitle="确认批量删除"
            confirmDescription={`将删除 ${selectedIds.length} 个用户，此操作不可逆`}
            onClick={handleBatchDelete}
          />
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <OperationButton
                  buttonText="删除"
                  variant="destructive"
                  size="sm"
                  requireConfirm
                  confirmTitle="确认删除"
                  confirmDescription="删除后无法恢复"
                  onClick={() => handleDeleteUser(user.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## 迁移指南

### 从旧代码迁移

#### 迁移前

```tsx
function OldComponent() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await someApiCall();
      alert('成功');
    } catch (error) {
      alert('失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      操作
    </Button>
  );
}
```

#### 迁移后

```tsx
import { useOperation } from '@/hooks/use-operation';

function NewComponent() {
  const { execute, isLoading } = useOperation({
    successMessage: '操作成功',
    errorMessage: '操作失败',
  });

  const handleClick = () => {
    execute(() => someApiCall());
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      操作
    </Button>
  );
}
```

---

## 常见问题

### Q: 如何处理表单提交？

```tsx
function FormExample() {
  const { execute, isLoading } = useOperation({
    successMessage: '表单提交成功',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await execute(async () => {
      await submitForm(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '提交中...' : '提交'}
      </Button>
    </form>
  );
}
```

### Q: 如何在操作成功后刷新数据？

```tsx
const { execute } = useOperation({
  successMessage: '更新成功',
  onSuccess: () => {
    // 重新加载数据
    refetchData();
  },
});
```

### Q: 如何自定义 Toast 样式？

Toast 样式在 `feedback-system.tsx` 中统一管理，可以通过修改 `FeedbackType` 对应的样式类来定制。

---

## 相关文件

- Hook 实现：`src/hooks/use-operation.ts`
- 组件实现：`src/components/business/OperationFeedback.tsx`
- 反馈系统：`src/components/feedback-system.tsx`
- Loading 组件：`src/components/ui/loading.tsx`

---

**最后更新**: 2026-03-23
**维护者**: 前端开发团队
