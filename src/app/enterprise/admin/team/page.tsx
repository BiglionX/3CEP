'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Bot,
  Coins,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  DollarSign,
  Package,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  Eye,
  Key,
  Building,
  Briefcase,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  department: string;
  position: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActive: string;
  permissions: string[];
}

interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  memberCount: number;
  createdAt: string;
}

export default function TeamManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // 邀请表单状态
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as TeamMember['role'],
    department: '',
  });

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'member' as TeamMember['role'],
    department: '',
    position: '',
    phone: '',
  });

  const menuItems = [
    { name: '仪表盘', href: '/enterprise/admin/dashboard', icon: BarChart3 },
    { name: '售后管理', href: '/enterprise/after-sales', icon: Headphones },
    { name: '智能体管理', href: '/enterprise/admin/agents', icon: Bot },
    { name: 'Token管理', href: '/enterprise/admin/tokens', icon: Coins },
    { name: '门户管理', href: '/enterprise/admin/portal', icon: Globe },
    { name: 'FXC管理', href: '/enterprise/admin/fxc', icon: CreditCard },
    {
      name: '采购管理',
      href: '/enterprise/admin/procurement',
      icon: ShoppingCart,
    },
    { name: '有奖问答', href: '/enterprise/admin/reward-qa', icon: HelpCircle },
    {
      name: '新品众筹',
      href: '/enterprise/admin/crowdfunding',
      icon: DollarSign,
    },
    { name: '企业资料', href: '/enterprise/admin/documents', icon: FileText },
    { name: '设备管理', href: '/enterprise/admin/devices', icon: Package },
    { name: '数据分析', href: '/enterprise/admin/analytics', icon: TrendingUp },
    {
      name: '二维码溯源',
      href: '/enterprise/admin/traceability',
      icon: QrCode,
    },
    { name: '团队管理', href: '/enterprise/admin/team', icon: Users },
    { name: '系统设置', href: '/enterprise/admin/settings', icon: Settings },
  ];

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟团队成员数据
      const mockMembers: TeamMember[] = [
        {
          id: 'member-001',
          name: '张明',
          email: 'zhangming@example.com',
          avatar: '',
          role: 'admin',
          department: '技术部',
          position: '技术总监',
          phone: '13800138001',
          status: 'active',
          joinedAt: '2023-01-15',
          lastActive: '2025-03-17 14:30',
          permissions: ['all'],
        },
        {
          id: 'member-002',
          name: '李娜',
          email: 'lina@example.com',
          avatar: '',
          role: 'manager',
          department: '市场部',
          position: '市场经理',
          phone: '13800138002',
          status: 'active',
          joinedAt: '2023-03-20',
          lastActive: '2025-03-17 13:45',
          permissions: ['manage_members', 'view_reports', 'manage_content'],
        },
        {
          id: 'member-003',
          name: '王强',
          email: 'wangqiang@example.com',
          avatar: '',
          role: 'member',
          department: '销售部',
          position: '销售主管',
          phone: '13800138003',
          status: 'active',
          joinedAt: '2023-05-10',
          lastActive: '2025-03-17 12:15',
          permissions: ['view_reports', 'manage_content'],
        },
        {
          id: 'member-004',
          name: '刘芳',
          email: 'liufang@example.com',
          avatar: '',
          role: 'member',
          department: '客服部',
          position: '客服经理',
          phone: '13800138004',
          status: 'active',
          joinedAt: '2023-07-25',
          lastActive: '2025-03-17 11:30',
          permissions: ['view_reports'],
        },
        {
          id: 'member-005',
          name: '陈伟',
          email: 'chenwei@example.com',
          avatar: '',
          role: 'viewer',
          department: '财务部',
          position: '财务专员',
          phone: '13800138005',
          status: 'active',
          joinedAt: '2023-09-12',
          lastActive: '2025-03-17 10:45',
          permissions: ['view_reports'],
        },
        {
          id: 'member-006',
          name: '赵琳',
          email: 'zhaolin@example.com',
          avatar: '',
          role: 'member',
          department: '产品部',
          position: '产品经理',
          phone: '13800138006',
          status: 'inactive',
          joinedAt: '2023-11-05',
          lastActive: '2025-03-10 09:20',
          permissions: ['view_reports', 'manage_content'],
        },
        {
          id: 'member-007',
          name: '孙浩',
          email: 'sunhao@example.com',
          avatar: '',
          role: 'member',
          department: '技术部',
          position: '前端工程师',
          phone: '13800138007',
          status: 'pending',
          joinedAt: '2024-01-18',
          lastActive: '2025-03-17 09:10',
          permissions: ['view_reports'],
        },
        {
          id: 'member-008',
          name: '周婷',
          email: 'zhouting@example.com',
          avatar: '',
          role: 'manager',
          department: '人力资源部',
          position: '人事经理',
          phone: '13800138008',
          status: 'active',
          joinedAt: '2024-02-22',
          lastActive: '2025-03-17 15:20',
          permissions: ['manage_members', 'view_reports'],
        },
      ];

      // 模拟邀请数据
      const mockInvitations: TeamInvitation[] = [
        {
          id: 'invite-001',
          email: 'newmember1@example.com',
          role: 'member',
          invitedBy: '张明',
          invitedAt: '2025-03-15',
          expiresAt: '2025-03-22',
          status: 'pending',
        },
        {
          id: 'invite-002',
          email: 'newmember2@example.com',
          role: 'viewer',
          invitedBy: '李娜',
          invitedAt: '2025-03-10',
          expiresAt: '2025-03-17',
          status: 'pending',
        },
        {
          id: 'invite-003',
          email: 'oldinvite@example.com',
          role: 'manager',
          invitedBy: '王强',
          invitedAt: '2025-02-28',
          expiresAt: '2025-03-07',
          status: 'expired',
        },
      ];

      // 模拟部门数据
      const mockDepartments: Department[] = [
        {
          id: 'dept-001',
          name: '技术部',
          description: '负责技术开发和系统维护',
          manager: '张明',
          memberCount: 8,
          createdAt: '2023-01-10',
        },
        {
          id: 'dept-002',
          name: '市场部',
          description: '负责市场推广和品牌建设',
          manager: '李娜',
          memberCount: 6,
          createdAt: '2023-02-15',
        },
        {
          id: 'dept-003',
          name: '销售部',
          description: '负责产品销售和客户关系',
          manager: '王强',
          memberCount: 12,
          createdAt: '2023-03-20',
        },
        {
          id: 'dept-004',
          name: '客服部',
          description: '负责客户服务和售后支持',
          manager: '刘芳',
          memberCount: 10,
          createdAt: '2023-04-25',
        },
        {
          id: 'dept-005',
          name: '财务部',
          description: '负责财务管理和资金运作',
          manager: '陈伟',
          memberCount: 5,
          createdAt: '2023-05-30',
        },
        {
          id: 'dept-006',
          name: '产品部',
          description: '负责产品规划和管理',
          manager: '赵琳',
          memberCount: 7,
          createdAt: '2023-06-10',
        },
        {
          id: 'dept-007',
          name: '人力资源部',
          description: '负责人才招聘和员工发展',
          manager: '周婷',
          memberCount: 4,
          createdAt: '2023-07-15',
        },
      ];

      setMembers(mockMembers);
      setInvitations(mockInvitations);
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('获取团队数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤成员列表
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesDepartment =
      departmentFilter === 'all' || member.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  // 获取角色信息
  const getRoleInfo = (role: TeamMember['role']) => {
    const roleMap = {
      admin: {
        label: '管理员',
        color: 'bg-red-100 text-red-800',
        icon: Shield,
      },
      manager: {
        label: '经理',
        color: 'bg-blue-100 text-blue-800',
        icon: Users,
      },
      member: {
        label: '成员',
        color: 'bg-green-100 text-green-800',
        icon: UserPlus,
      },
      viewer: {
        label: '观察员',
        color: 'bg-gray-100 text-gray-800',
        icon: Eye,
      },
    };
    return roleMap[role] || roleMap.member;
  };

  // 获取状态信息
  const getStatusInfo = (status: TeamMember['status']) => {
    const statusMap = {
      active: {
        label: '活跃',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      inactive: {
        label: '未激活',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      pending: {
        label: '待审核',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
    };
    return statusMap[status] || statusMap.active;
  };

  // 获取邀请状态信息
  const getInvitationStatusInfo = (status: TeamInvitation['status']) => {
    const statusMap = {
      pending: {
        label: '待接受',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      accepted: {
        label: '已接受',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      expired: {
        label: '已过期',
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
      },
      revoked: {
        label: '已撤销',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // 处理发送邀请
  const handleSendInvitation = async () => {
    if (!inviteForm.email.trim()) {
      alert('请输入邮箱地址');
      return;
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      const newInvitation: TeamInvitation = {
        id: `invite-${Date.now()}`,
        email: inviteForm.email,
        role: inviteForm.role,
        invitedBy: '张明', // 当前用户
        invitedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        status: 'pending',
      };

      setInvitations(prev => [newInvitation, ...prev]);
      setIsInviteModalOpen(false);
      setInviteForm({ email: '', role: 'member', department: '' });
      alert('邀请已发送');
    } catch (error) {
      console.error('发送邀请失败:', error);
      alert('发送邀请失败，请重试');
    }
  };

  // 处理编辑成员
  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      position: member.position,
      phone: member.phone || '',
    });
    setIsEditMemberModalOpen(true);
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!selectedMember) return;

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      setMembers(prev =>
        prev.map(member =>
          member.id === selectedMember.id ? { ...member, ...editForm } : member
        )
      );

      setIsEditMemberModalOpen(false);
      setSelectedMember(null);
      alert('成员信息已更新');
    } catch (error) {
      console.error('更新成员信息失败:', error);
      alert('更新失败，请重试');
    }
  };

  // 处理删除成员
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('确定要删除此成员吗？此操作不可撤销。')) {
      return;
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      setMembers(prev => prev.filter(member => member.id !== memberId));
      alert('成员已删除');
    } catch (error) {
      console.error('删除成员失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 处理撤销邀请
  const handleRevokeInvitation = async (inviteId: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      setInvitations(prev =>
        prev.map(invite =>
          invite.id === inviteId ? { ...invite, status: 'revoked' } : invite
        )
      );
      alert('邀请已撤销');
    } catch (error) {
      console.error('撤销邀请失败:', error);
      alert('撤销失败，请重试');
    }
  };

  // 处理重新发送邀请
  const handleResendInvitation = async (inviteId: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      setInvitations(prev =>
        prev.map(invite =>
          invite.id === inviteId
            ? {
                ...invite,
                invitedAt: new Date().toISOString().split('T')[0],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
                status: 'pending',
              }
            : invite
        )
      );
      alert('邀请已重新发送');
    } catch (error) {
      console.error('重新发送邀请失败:', error);
      alert('重新发送失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-40 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                企业管理中心
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边菜单 */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">管理菜单</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = item.href === '/enterprise/admin/team';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 主要内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题和统计 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">团队管理</h1>
                <p className="mt-1 text-sm text-gray-600">
                  管理企业团队成员、权限和部门
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchTeamData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新数据
                </Button>
                <Dialog
                  open={isInviteModalOpen}
                  onOpenChange={setIsInviteModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      邀请成员
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>邀请新成员</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">邮箱地址</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="请输入邮箱地址"
                          value={inviteForm.email}
                          onChange={e =>
                            setInviteForm({
                              ...inviteForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">角色</Label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(value: TeamMember['role']) =>
                            setInviteForm({ ...inviteForm, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">管理员</SelectItem>
                            <SelectItem value="manager">经理</SelectItem>
                            <SelectItem value="member">成员</SelectItem>
                            <SelectItem value="viewer">观察员</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">部门</Label>
                        <Select
                          value={inviteForm.department}
                          onValueChange={value =>
                            setInviteForm({ ...inviteForm, department: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择部门" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteModalOpen(false)}
                      >
                        取消
                      </Button>
                      <Button onClick={handleSendInvitation}>发送邀请</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    团队成员
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}人</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      活跃: {members.filter(m => m.status === 'active').length}
                      人
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      待审核:{' '}
                      {members.filter(m => m.status === 'pending').length}人
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    部门数量
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {departments.length}个
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    平均每部门 {Math.round(members.length / departments.length)}
                    人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    待处理邀请
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {invitations.filter(i => i.status === 'pending').length}个
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    总计邀请: {invitations.length}个
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    角色分布
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {members.filter(m => m.role === 'admin').length}管理员
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {members.filter(m => m.role === 'manager').length}经理,
                    {members.filter(m => m.role === 'member').length}成员
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 标签页内容 */}
            <Tabs defaultValue="members" className="space-y-4">
              <TabsList>
                <TabsTrigger value="members">
                  <Users className="mr-2 h-4 w-4" />
                  成员管理
                </TabsTrigger>
                <TabsTrigger value="invitations">
                  <Mail className="mr-2 h-4 w-4" />
                  邀请管理
                </TabsTrigger>
                <TabsTrigger value="departments">
                  <Building className="mr-2 h-4 w-4" />
                  部门管理
                </TabsTrigger>
                <TabsTrigger value="permissions">
                  <Key className="mr-2 h-4 w-4" />
                  权限设置
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                {/* 搜索和过滤 */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="搜索成员姓名、邮箱或部门..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={roleFilter}
                          onValueChange={setRoleFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="所有角色" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有角色</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                            <SelectItem value="manager">经理</SelectItem>
                            <SelectItem value="member">成员</SelectItem>
                            <SelectItem value="viewer">观察员</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={departmentFilter}
                          onValueChange={setDepartmentFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="所有部门" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有部门</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline">
                          <Filter className="mr-2 h-4 w-4" />
                          更多筛选
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 成员列表 */}
                <Card>
                  <CardHeader>
                    <CardTitle>团队成员列表</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              成员
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              角色
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              部门/职位
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              状态
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              加入时间
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map(member => {
                            const roleInfo = getRoleInfo(member.role);
                            const statusInfo = getStatusInfo(member.status);
                            const RoleIcon = roleInfo.icon;
                            const StatusIcon = statusInfo.icon;

                            return (
                              <tr
                                key={member.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-medium">
                                        {member.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {member.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {member.email}
                                      </div>
                                      {member.phone && (
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {member.phone}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    className={cn(
                                      roleInfo.color,
                                      'flex items-center gap-1 w-fit'
                                    )}
                                  >
                                    <RoleIcon className="h-3 w-3" />
                                    {roleInfo.label}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-medium">
                                      {member.department}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {member.position}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    className={cn(
                                      statusInfo.color,
                                      'flex items-center gap-1 w-fit'
                                    )}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusInfo.label}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="text-sm">
                                    <div>{member.joinedAt}</div>
                                    <div className="text-gray-500">
                                      最后活跃: {member.lastActive}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditMember(member)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteMember(member.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invitations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>邀请管理</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              邮箱地址
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              角色
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              邀请人
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              邀请时间
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              过期时间
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              状态
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invitations.map(invite => {
                            const statusInfo = getInvitationStatusInfo(
                              invite.status
                            );
                            const StatusIcon = statusInfo.icon;
                            const roleInfo = getRoleInfo(invite.role);

                            return (
                              <tr
                                key={invite.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-3 px-4 font-medium">
                                  {invite.email}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    className={cn(
                                      roleInfo.color,
                                      'flex items-center gap-1 w-fit'
                                    )}
                                  >
                                    {roleInfo.label}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  {invite.invitedBy}
                                </td>
                                <td className="py-3 px-4">
                                  {invite.invitedAt}
                                </td>
                                <td className="py-3 px-4">
                                  {invite.expiresAt}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    className={cn(
                                      statusInfo.color,
                                      'flex items-center gap-1 w-fit'
                                    )}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusInfo.label}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {invite.status === 'pending' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleResendInvitation(invite.id)
                                          }
                                        >
                                          重新发送
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleRevokeInvitation(invite.id)
                                          }
                                        >
                                          撤销
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="departments" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map(dept => (
                    <Card key={dept.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{dept.name}</span>
                          <Badge variant="outline">{dept.memberCount}人</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          {dept.description}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">负责人</span>
                            <span className="font-medium">{dept.manager}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">创建时间</span>
                            <span>{dept.createdAt}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between">
                            <Button variant="outline" size="sm">
                              查看成员
                            </Button>
                            <Button variant="outline" size="sm">
                              编辑
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>权限管理</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          角色权限说明
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            {
                              role: '管理员',
                              desc: '拥有所有权限，可以管理整个系统',
                              color: 'bg-red-50 text-red-700',
                            },
                            {
                              role: '经理',
                              desc: '可以管理团队成员和内容，查看报表',
                              color: 'bg-blue-50 text-blue-700',
                            },
                            {
                              role: '成员',
                              desc: '可以访问基本功能，创建和编辑内容',
                              color: 'bg-green-50 text-green-700',
                            },
                            {
                              role: '观察员',
                              desc: '只能查看信息，不能进行修改',
                              color: 'bg-gray-50 text-gray-700',
                            },
                          ].map(item => (
                            <div
                              key={item.role}
                              className={cn(
                                'p-4 rounded-lg border',
                                item.color
                              )}
                            >
                              <h4 className="font-bold mb-2">{item.role}</h4>
                              <p className="text-sm">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">权限设置</h3>
                        <div className="space-y-4">
                          {[
                            {
                              id: 'perm-1',
                              name: '查看仪表板',
                              desc: '可以查看企业仪表板数据',
                            },
                            {
                              id: 'perm-2',
                              name: '管理成员',
                              desc: '可以添加、编辑和删除团队成员',
                            },
                            {
                              id: 'perm-3',
                              name: '查看报表',
                              desc: '可以查看各种分析报表',
                            },
                            {
                              id: 'perm-4',
                              name: '管理内容',
                              desc: '可以创建、编辑和删除内容',
                            },
                            {
                              id: 'perm-5',
                              name: '系统设置',
                              desc: '可以修改系统设置',
                            },
                            {
                              id: 'perm-6',
                              name: '财务管理',
                              desc: '可以查看和管理财务信息',
                            },
                          ].map(perm => (
                            <div
                              key={perm.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <div className="font-medium">{perm.name}</div>
                                <div className="text-sm text-gray-500">
                                  {perm.desc}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">
                                    管理员
                                  </span>
                                  <Switch defaultChecked />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">
                                    经理
                                  </span>
                                  <Switch
                                    defaultChecked={
                                      !['perm-5', 'perm-6'].includes(perm.id)
                                    }
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">
                                    成员
                                  </span>
                                  <Switch
                                    defaultChecked={[
                                      'perm-1',
                                      'perm-3',
                                      'perm-4',
                                    ].includes(perm.id)}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">
                                    观察员
                                  </span>
                                  <Switch
                                    defaultChecked={[
                                      'perm-1',
                                      'perm-3',
                                    ].includes(perm.id)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 底部操作 */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t">
              <div className="text-sm text-gray-500">
                共 {members.length} 名成员，{departments.length} 个部门
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/enterprise/admin/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    返回仪表板
                  </Link>
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  导出团队列表
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 编辑成员弹窗 */}
      <Dialog
        open={isEditMemberModalOpen}
        onOpenChange={setIsEditMemberModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={e =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={e =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">角色</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: TeamMember['role']) =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="manager">经理</SelectItem>
                    <SelectItem value="member">成员</SelectItem>
                    <SelectItem value="viewer">观察员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">部门</Label>
                <Select
                  value={editForm.department}
                  onValueChange={value =>
                    setEditForm({ ...editForm, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-position">职位</Label>
                <Input
                  id="edit-position"
                  value={editForm.position}
                  onChange={e =>
                    setEditForm({ ...editForm, position: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">电话</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={e =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditMemberModalOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveEdit}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
