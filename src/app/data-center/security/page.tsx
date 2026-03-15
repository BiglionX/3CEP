'use client';
'
import { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  status: 'active' | 'disabled';
}

interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'locked' | 'inactive';
  loginAttempts: number;
}

interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export default function SecurityManagementPage() {'
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    // 模拟加载安全数据
    const mockRoles: UserRole[] = [
      {
        id: '1',
        name: '数据管理员,
        description: '拥有数据管理平台的完全访问权,
        permissions: [
          'data_center_read',
          'data_center_write',
          'data_center_manage',
        ],
        userCount: 12,
        createdAt: '2026-01-15',
        status: 'active',
      },
{
        id: '2',
        name: '数据分析,
        description: '可以查看和分析数据，但不能修改配,
        permissions: ['data_center_read', 'data_center_analyze'],
        userCount: 28,
        createdAt: '2026-01-20',
        status: 'active',
      },
{
        id: '3',
        name: '只读用户',
        description: '仅能查看数据，无法执行任何修改操,
        permissions: ['data_center_read'],
        userCount: 45,
        createdAt: '2026-02-01',
        status: 'active',
      },
    ];

    const mockUsers: UserAccount[] = [
      {
        id: '1',
        username: 'admin_user',
        email: 'admin@company.com',
        role: '数据管理员,
        lastLogin: '2026-02-28 14:30:00',
        status: 'active',
        loginAttempts: 0,
      },
{
        id: '2',
        username: 'analyst_john',
        email: 'john.analyst@company.com',
        role: '数据分析,
        lastLogin: '2026-02-28 13:45:00',
        status: 'active',
        loginAttempts: 1,
      },
{
        id: '3',
        username: 'locked_user',
        email: 'locked@company.com',
        role: '只读用户',
        lastLogin: '2026-02-25 09:15:00',
        status: 'locked',
        loginAttempts: 5,
      },
    ];

    const mockLogs: SecurityLog[] = [
      {
        id: '1',
        userId: '1',
        action: '用户登录',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Chrome/120.0',
        timestamp: '2026-02-28 14:30:00',
        status: 'success',
      },
{
        id: '2',
        userId: '3',
        action: '登录失败',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 Firefox/118.0',
        timestamp: '2026-02-28 14:25:00',
        status: 'failed',
      },
{
        id: '3',
        userId: '2',
        action: '数据查询',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 Chrome/120.0',
        timestamp: '2026-02-28 13:45:00',
        status: 'success',
      },
    ];

    setRoles(mockRoles);
    setUsers(mockUsers);
    setLogs(mockLogs);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':'
        return 'bg-green-100 text-green-800';
      case 'locked':'
        return 'bg-red-100 text-red-800';
      case 'inactive':'
        return 'bg-gray-100 text-gray-800';
      case 'disabled':'
        return 'bg-yellow-100 text-yellow-800';
      default:'
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {'
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':"
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:"
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus ='
      statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return ("
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>"
        <h1 className="text-2xl font-bold text-gray-900">安全管理</h1>"
        <p className="text-gray-600 mt-1">用户权限管理和安全审/p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>"
        <TabsList className="grid w-full grid-cols-3">"
          <TabsTrigger value="roles">角色管理</TabsTrigger>"
          <TabsTrigger value="users">用户管理</TabsTrigger>"
          <TabsTrigger value="audit">安全审计</TabsTrigger>
        </TabsList>
"
        <TabsContent value="roles" className="space-y-4">"
          <div className="flex justify-between items-center">"
            <h2 className="text-xl font-semibold">角色管理</h2>
            <Button>"
              <Plus className="mr-2 h-4 w-4" />
              添加角色
            </Button>
          </div>
"
          <div className="grid gap-4">
            {roles.map(role => (
              <Card key={role.id}>
                <CardHeader>"
                  <div className="flex items-center justify-between">
                    <div>"
                      <CardTitle className="flex items-center">"
                        <Shield className="mr-2 h-5 w-5" />
                        {role.name}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <Badge
                      variant={'
                        role.status === 'active'  'default' : 'secondary'
                      }
                    >'
                      {role.status === 'active'  '启用' : '禁用'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>"
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>"
                      <p className="text-sm text-gray-500">用户/p>"
                      <p className="font-medium">{role.userCount} /p>
                    </div>
                    <div>"
                      <p className="text-sm text-gray-500">权限/p>"
                      <p className="font-medium">
                        {role.permissions.length}                       </p>
                    </div>
                    <div>"
                      <p className="text-sm text-gray-500">创建时间</p>"
                      <p className="font-medium">{role.createdAt}</p>
                    </div>
                  </div>
"
                  <div className="mb-4">"
                    <p className="text-sm text-gray-500 mb-2">权限列表:</p>"
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
"
                  <div className="flex space-x-2">"
                    <Button size="sm" variant="outline">"
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </Button>"
                    <Button size="sm" variant="outline">"
                      <Users className="mr-2 h-4 w-4" />
                      分配用户
                    </Button>
                    {role.status === 'active' ? ("
                      <Button size="sm" variant="outline">"
                        <Lock className="mr-2 h-4 w-4" />
                        禁用
                      </Button>
                    ) : ("
                      <Button size="sm" variant="outline">"
                        <Unlock className="mr-2 h-4 w-4" />
                        启用
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
"
        <TabsContent value="users" className="space-y-4">"
          <div className="flex justify-between items-center">"
            <h2 className="text-xl font-semibold">用户管理</h2>
            <Button>"
              <Plus className="mr-2 h-4 w-4" />
              添加用户
            </Button>
          </div>

          {/* 筛选和搜索 */}
          <Card>"
            <CardContent className="pt-6">"
              <div className="flex flex-col sm:flex-row gap-4">"
                <div className="flex-1">"
                  <div className="relative">"
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input"
                      placeholder="搜索用户名或邮箱..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}"
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>"
                  <SelectTrigger className="w-[120px]">"
                    <SelectValue placeholder="状态筛 />
                  </SelectTrigger>
                  <SelectContent>"
                    <SelectItem value="all">全部</SelectItem>"
                    <SelectItem value="active">活跃</SelectItem>"
                    <SelectItem value="locked">锁定</SelectItem>"
                    <SelectItem value="inactive">非活/SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 用户列表 */}"
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <Card key={user.id}>"
                <CardContent className="p-6">"
                  <div className="flex items-center justify-between">"
                    <div className="flex items-center space-x-4">"
                      <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center">"
                        <span className="font-medium text-gray-700">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>"
                        <h3 className="font-medium">{user.username}</h3>"
                        <p className="text-sm text-gray-500">{user.email}</p>"
                        <p className="text-sm text-gray-500">
                          角色: {user.role}
                        </p>
                      </div>
                    </div>
"
                    <div className="flex items-center space-x-4">"
                      <div className="text-right">
                        <Badge className={getStatusColor(user.status)}>'
                          {user.status === 'active''
                             '活跃''
                            : user.status === 'locked''
                               '锁定''
                              : '非活}
                        </Badge>"
                        <p className="text-xs text-gray-500 mt-1">
                          最后登 {user.lastLogin}
                        </p>
                        {user.loginAttempts > 0 && ("
                          <p className="text-xs text-orange-600 mt-1">
                            登录尝试: {user.loginAttempts}                           </p>
                        )}
                      </div>
"
                      <div className="flex space-x-2">"
                        <Button size="sm" variant="outline">"
                          <Eye className="h-4 w-4" />
                        </Button>"
                        <Button size="sm" variant="outline">"
                          <Edit className="h-4 w-4" />
                        </Button>'
                        {user.status === 'locked' ? ("
                          <Button size="sm" variant="outline">"
                            <Unlock className="h-4 w-4" />
                          </Button>
                        ) : ("
                          <Button size="sm" variant="outline">"
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <Card>"
                <CardContent className="py-12 text-center">"
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />"
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无匹配用户
                  </h3>"
                  <p className="text-gray-500">调整筛选条件或添加新用/p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
"
        <TabsContent value="audit" className="space-y-4">
          <div>"
            <h2 className="text-xl font-semibold">安全审计日志</h2>"
            <p className="text-gray-600 mt-1">用户操作和安全事件记/p>
          </div>

          <Card>"
            <CardContent className="pt-6">"
              <div className="space-y-4">
                {logs.map(log => ("
                  <div key={log.id} className="border-b pb-4 last:border-b-0">"
                    <div className="flex items-start justify-between">"
                      <div className="flex items-center space-x-3">
                        {getLogStatusIcon(log.status)}
                        <div>"
                          <p className="font-medium">{log.action}</p>"
                          <p className="text-sm text-gray-500">
                            用户ID: {log.userId} IP: {log.ipAddress}
                          </p>"
                          <p className="text-xs text-gray-400 mt-1">
                            {log.userAgent}
                          </p>
                        </div>
                      </div>"
                      <div className="text-right">
                        <Badge
                          variant={'
                            log.status === 'success'  'default' : 'destructive'
                          }
                        >'
                          {log.status === 'success'  '成功' : '失败'}
                        </Badge>"
                        <p className="text-xs text-gray-500 mt-1">
                          {log.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {logs.length === 0 && ("
                  <div className="text-center py-8">"
                    <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />"
                    <p className="text-gray-500">暂无安全日志记录</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'"