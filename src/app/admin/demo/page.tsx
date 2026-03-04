'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DynamicMenu } from '@/components/admin/DynamicMenu';
import { BreadcrumbNav } from '@/components/admin/BreadcrumbNav';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AdminDemoPage() {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      role: 'content_reviewer',
      status: 'active',
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'shop_reviewer',
      status: 'inactive',
      createdAt: '2024-01-25',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 面包屑导?*/}
      <div className="bg-card border rounded-lg p-4">
        <BreadcrumbNav />
      </div>

      {/* 页面标题和操作按?*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
          <p className="text-muted-foreground mt-1">管理系统的用户账户和权限</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新用?/DialogTitle>
                <DialogDescription>请输入新用户的信?/DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">姓名</label>
                  <Input placeholder="请输入姓? className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">邮箱</label>
                  <Input
                    type="email"
                    placeholder="请输入邮?
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">角色</label>
                  <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="admin">管理?/option>
                    <option value="content_reviewer">内容审核?/option>
                    <option value="shop_reviewer">店铺审核?/option>
                    <option value="finance">财务人员</option>
                    <option value="viewer">查看?/option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>创建用户</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 动态菜单演?*/}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-medium mb-4">动态菜?/h3>
            <DynamicMenu />
          </div>
        </div>

        {/* 用户表格 */}
        <div className="lg:col-span-3">
          <div className="bg-card border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户信息</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状?/TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full text-xs px-2.5 py-0.5 ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status === 'active' ? '活跃' : '非活?}
                      </span>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 组件展示?*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-medium mb-4">按钮变体</h3>
          <div className="space-y-3">
            <Button>默认按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="destructive">危险按钮</Button>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-medium mb-4">按钮尺寸</h3>
          <div className="space-y-3">
            <Button size="sm">小按?/Button>
            <Button>默认按钮</Button>
            <Button size="lg">大按?/Button>
            <Button size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-medium mb-4">输入?/h3>
          <div className="space-y-3">
            <Input placeholder="默认输入? />
            <Input placeholder="禁用状? disabled />
            <Input type="password" placeholder="密码输入? />
          </div>
        </div>
      </div>
    </div>
  );
}

