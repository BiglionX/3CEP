# 代码规范与最佳实践

## 📋 代码规范总则

### 1. 基本原则

- **可读性优先**: 代码首先是给人读的，其次才是给机器执行
- **一致性**: 项目内保持统一的编码风格
- **简洁性**: 用最简单的方式解决问题
- **可维护性**: 考虑代码的长期维护成本

### 2. 技术栈规范

- **语言版本**: TypeScript 5.0+, ES2020+
- **框架版本**: Next.js 14+, React 18+
- **包管理**: npm 9+
- **构建工具**: Webpack 5+, SWC

## 🎯 命名规范

### 变量命名

```typescript
// ✅ 推荐
const userProfile = {};
const isLoading = true;
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ 避免
const user_profile = {}; // 使用驼峰命名
const loading = true; // 布尔值应该表达状态
const maxretrycount = 3; // 常量应该大写
const apiUrl = '...'; // 常量应该全大写
```

### 函数命名

```typescript
// ✅ 推荐 - 动词开头，表达动作
function getUserProfile(userId: string): Promise<User> {}
function isValidEmail(email: string): boolean {}
function calculateTotalPrice(items: CartItem[]): number {}

// ❌ 避免
function user_profile(userId: string) {} // 缺少动词
function emailCheck(email: string) {} // 不够明确
function total(items: CartItem[]) {} // 不表达计算含义
```

### 类和接口命名

```typescript
// ✅ 推荐 - 使用帕斯卡命名法
class UserService {}
class DataProcessor {}
interface UserProfile {}
interface ApiResponse<T> {}

// ❌ 避免
class userService {} // 应该大写首字母
class data_processor {} // 应该使用帕斯卡命名
interface user_profile {} // 接口也应该使用帕斯卡命名
```

### 文件命名

```typescript
// ✅ 推荐
user - service.ts;
data - processor.ts;
api - client.ts;
user - profile.interface.ts;

// ❌ 避免
userService.ts; // 应该使用连字符
DataProcessor.ts; // 混合命名风格
ApiClient.ts; // 不一致的大小写
UserProfileInterface.ts; // 过于冗长
```

## 📐 代码结构规范

### 文件组织

```
src/
├── modules/
│   ├── auth/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── repair-service/
│       ├── app/
│       ├── components/
│       ├── services/
│       └── utils/
├── tech/
│   ├── api/
│   ├── database/
│   └── utils/
└── shared/
    ├── constants/
    ├── types/
    └── utils/
```

### 导入顺序

```typescript
// 1. 外部依赖
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// 2. 内部模块
import { UserService } from '@auth/services';
import { WorkOrder } from '@repair/types';

// 3. 相对导入
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 4. 类型导入
import type { User, WorkOrderStatus } from '@/types';
```

### 目录结构约定

```typescript
// 组件目录结构
components/
├── ui/                    # 原子组件
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── business/              # 业务组件
│   ├── user-profile/
│   │   ├── user-profile.tsx
│   │   ├── user-profile.types.ts
│   │   └── index.ts
│   └── work-order-list/
│       ├── work-order-list.tsx
│       └── work-order-item.tsx
└── layout/                # 布局组件
    ├── header.tsx
    └── sidebar.tsx
```

## 🔧 TypeScript 规范

### 类型定义

```typescript
// ✅ 推荐 - 明确的类型定义
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

type UserRole = 'admin' | 'user' | 'guest';

// ❌ 避免 - 使用 any 或隐式类型
let userData: any = {};
function processData(data) {
  /* ... */
}
```

### 泛型使用

```typescript
// ✅ 推荐 - 合理使用泛型
class Repository<T> {
  async findById(id: string): Promise<T | null> {
    // 实现
  }

  async findAll(filters?: Partial<T>): Promise<T[]> {
    // 实现
  }
}

// ❌ 避免 - 过度复杂的泛型
type ComplexGeneric<T, U, V, W> = T extends U ? V : W;
```

### 可选属性和默认值

```typescript
// ✅ 推荐 - 合理使用可选属性
interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string; // 可选字段
  role?: UserRole; // 可选字段，默认值在服务层处理
}

// ❌ 避免 - 滥用可选属性
interface BadExample {
  name?: string; // 必需字段不应该可选
  email?: string; // 必需字段不应该可选
}
```

## 🎨 React 规范

### 组件定义

```typescript
// ✅ 推荐 - 使用函数组件和 Hooks
interface UserProfileProps {
  userId: string;
  className?: string;
}

export function UserProfile({ userId, className }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <div>User not found</div>;

  return (
    <div className={cn('user-profile', className)}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// ❌ 避免 - 使用过时的 Class 组件
export class UserProfile extends Component {
  // 避免使用 Class 组件
}
```

### Hooks 使用

```typescript
// ✅ 推荐 - 自定义 Hooks
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    userService
      .findById(userId)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
}

// ❌ 避免 - 重复的逻辑
function ComponentA() {
  // 重复的用户获取逻辑
}

function ComponentB() {
  // 相同的用户获取逻辑
}
```

### Props 传递

```typescript
// ✅ 推荐 - 明确的 Props 定义
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// ❌ 避免 - 过于宽泛的 Props
interface BadButtonProps {
  [key: string]: any; // 避免使用 any 索引签名
}
```

## 🔒 安全编码规范

### 输入验证

```typescript
// ✅ 推荐 - 严格的输入验证
function validateUserInput(input: unknown): input is CreateUserRequest {
  if (!input || typeof input !== 'object') return false;

  const data = input as Record<string, unknown>;

  return (
    typeof data.name === 'string' &&
    data.name.length > 0 &&
    typeof data.email === 'string' &&
    EMAIL_REGEX.test(data.email)
  );
}

// ❌ 避免 - 信任客户端输入
function badValidation(input: any) {
  // 直接使用未经验证的输入
  return input; // 危险！
}
```

### SQL 注入防护

```typescript
// ✅ 推荐 - 使用参数化查询
class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND status = 'active'
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }
}

// ❌ 避免 - 字符串拼接
async function badFindByEmail(email: string) {
  const query = `SELECT * FROM users WHERE email = '${email}'`; // 危险！
  // ...
}
```

### XSS 防护

```typescript
// ✅ 推荐 - 内容安全策略
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: ['class'],
  });
}

// ❌ 避免 - 直接插入 HTML
function dangerousHtmlInsertion(content: string) {
  document.getElementById('content').innerHTML = content; // 危险！
}
```

## 🧪 测试规范

### 单元测试

```typescript
// ✅ 推荐 - 清晰的测试结构
describe('UserService', () => {
  let userService: UserService;
  let mockDb: jest.Mocked<Database>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    userService = new UserService(mockDb);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const userId = 'user-123';
      const expectedUser = { id: userId, name: 'John' };

      mockDb.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await userService.findById(userId);

      expect(result).toEqual(expectedUser);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [userId]
      );
    });

    it('should return null when user not found', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });

      const result = await userService.findById('non-existent');

      expect(result).toBeNull();
    });
  });
});
```

### 测试覆盖率要求

- **核心业务逻辑**: 100% 覆盖率
- **API 接口**: 95% 覆盖率
- **工具函数**: 90% 覆盖率
- **UI 组件**: 80% 覆盖率

## 📊 性能优化规范

### React 性能

```typescript
// ✅ 推荐 - 性能优化
const ExpensiveComponent = React.memo(({ data }: { data: LargeDataSet }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} />
      ))}
    </div>
  );
});

// ❌ 避免 - 性能陷阱
function BadComponent({ data }: { data: LargeDataSet }) {
  const processedData = data.map(item => expensiveTransform(item)); // 每次渲染都计算

  return (
    <div>
      {processedData.map(item => (
        <Item key={Math.random()} data={item} /> // 不稳定的 key
      ))}
    </div>
  );
}
```

### 数据获取优化

```typescript
// ✅ 推荐 - 合理的数据获取策略
function useOptimizedData(query: string) {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);

  // 防抖查询
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setData([]);
      return;
    }

    setLoading(true);
    fetchData(debouncedQuery)
      .then(setData)
      .catch(handleError)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return { data, loading };
}
```

## 🛠️ 开发工具配置

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // 严格模式
    'no-unused-vars': 'error',
    '@typescript-eslint/no-unused-vars': 'error',

    // React 规范
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript 规范
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### Prettier 配置

```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 📈 代码审查清单

### 功能性检查

- [ ] 代码实现了预期功能
- [ ] 边界条件处理完整
- [ ] 错误处理机制健全
- [ ] 性能影响在可接受范围内

### 质量检查

- [ ] 代码符合命名规范
- [ ] 类型定义完整准确
- [ ] 注释清晰且有必要
- [ ] 测试覆盖率达标

### 安全检查

- [ ] 输入验证完整
- [ ] 没有SQL注入风险
- [ ] XSS防护措施到位
- [ ] 敏感信息处理得当

### 可维护性检查

- [ ] 代码结构清晰
- [ ] 职责分离合理
- [ ] 依赖关系明确
- [ ] 文档更新及时

---

_规范版本: v2.0_
_最后更新: 2026年2月21日_
_维护团队: 技术委员会_
