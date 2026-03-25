'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  lastActive?: string;
  createdAt: string;
  permissions: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  expiresAt: string;
}

export default function AgentsTeamPage() {
  const { user } = useUnifiedAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member');

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadTeamData = async () => {
    try {
      setLoading(true);

      // 加载团队成员
      const membersResponse = await fetch(`${N8N_BASE_URL}/api/v1/team`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!membersResponse.ok) {
        throw new Error(`n8n API 错误：${membersResponse.status}`);
      }

      const membersData = await membersResponse.json();
      setMembers(membersData.data || []);

      // 加载邀请列表
      const invitationsResponse = await fetch(
        `${N8N_BASE_URL}/api/v1/team/invitations`,
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!invitationsResponse.ok) {
        throw new Error(`n8n API 错误：${invitationsResponse.status}`);
      }

      const invitationsData = await invitationsResponse.json();
      setInvitations(invitationsData.data || []);
    } catch (err: any) {
      console.error('加载团队数据失败:', err);
      setMembers(getMockMembers());
      setInvitations(getMockInvitations());
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/team/invitations`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) throw new Error('邀请失败');

      await loadTeamData();
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (err: any) {
      console.error('邀请成员失败:', err);
    }
  };

  const handleUpdateRole = async (
    memberId: string,
    newRole: 'owner' | 'member' | 'viewer'
  ) => {
    try {
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/team/${memberId}/role`,
        {
          method: 'PATCH',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) throw new Error('更新失败');
      await loadTeamData();
    } catch (err: any) {
      console.error('更新角色失败:', err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('确定要移除此成员吗？')) return;

    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/team/${memberId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) throw new Error('移除失败');
      await loadTeamData();
    } catch (err: any) {
      console.error('移除成员失败:', err);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/team/invitations/${invitationId}`,
        {
          method: 'DELETE',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
          },
        }
      );

      if (!response.ok) throw new Error('取消失败');
      await loadTeamData();
    } catch (err: any) {
      console.error('取消邀请失败:', err);
    }
  };

  const getMockMembers = (): TeamMember[] => [
    {
      id: '1',
      email: 'admin@example.com',
      name: '管理员',
      role: 'owner',
      status: 'active',
      lastActive: '2026-03-25T09:30:00Z',
      createdAt: '2026-03-01T10:00:00Z',
      permissions: ['*'],
    },
    {
      id: '2',
      email: 'manager@example.com',
      name: '经理',
      role: 'member',
      status: 'active',
      lastActive: '2026-03-25T08:45:00Z',
      createdAt: '2026-03-05T14:20:00Z',
      permissions: ['workflow:read', 'workflow:execute', 'workflow:update'],
    },
    {
      id: '3',
      email: 'operator@example.com',
      name: '操作员',
      role: 'member',
      status: 'active',
      lastActive: '2026-03-24T16:00:00Z',
      createdAt: '2026-03-10T08:00:00Z',
      permissions: ['workflow:read', 'workflow:execute'],
    },
    {
      id: '4',
      email: 'viewer@example.com',
      name: '访客',
      role: 'viewer',
      status: 'inactive',
      lastActive: '2026-03-20T10:00:00Z',
      createdAt: '2026-03-15T16:45:00Z',
      permissions: ['workflow:read'],
    },
  ];

  const getMockInvitations = (): Invitation[] => [
    {
      id: '1',
      email: 'newuser@example.com',
      role: 'member',
      status: 'pending',
      sentAt: '2026-03-24T10:00:00Z',
      expiresAt: '2026-04-07T10:00:00Z',
    },
    {
      id: '2',
      email: 'guest@example.com',
      role: 'viewer',
      status: 'pending',
      sentAt: '2026-03-23T14:20:00Z',
      expiresAt: '2026-04-06T14:20:00Z',
    },
  ];

  useEffect(() => {
    loadTeamData();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="w-3 h-3" />
            所有者
          </Badge>
        );
      case 'member':
        return <Badge variant="secondary">成员</Badge>;
      case 'viewer':
        return <Badge variant="outline">访客</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            在线
          </Badge>
        );
      case 'pending':
        return <Badge variant="secondary">待处理</Badge>;
      case 'inactive':
        return <Badge variant="outline">离线</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvitationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">等待接受</Badge>;
      case 'accepted':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            已接受
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="w-3 h-3" />
            已过期
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            n8n 团队协作管理
          </h1>
          <p className="text-gray-600">管理团队成员和用户权限</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setInviteDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          邀请成员
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">团队成员</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">总成员数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线成员</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">当前活跃成员</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理邀请</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">等待接受的邀请</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">所有者</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.role === 'owner').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">团队所有者</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="mb-6">
        <TabsList>
          <TabsTrigger value="members">团队成员 ({members.length})</TabsTrigger>
          <TabsTrigger value="invitations">
            邀请列表 ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>团队成员</CardTitle>
              <CardDescription>管理工作组成员和权限分配</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>加载中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map(member => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                {member.name}
                              </h3>
                              {getRoleBadge(member.role)}
                              {getStatusBadge(member.status)}
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                              {member.email}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                最后活跃：
                                {member.lastActive
                                  ? new Date(member.lastActive).toLocaleString(
                                      'zh-CN'
                                    )
                                  : '从未'}
                              </span>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                加入：
                                {new Date(member.createdAt).toLocaleDateString(
                                  'zh-CN'
                                )}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {(member.permissions || [])
                                .slice(0, 3)
                                .map((perm: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {perm}
                                  </Badge>
                                ))}
                              {(member.permissions || []).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(member.permissions || []).length - 3} 更多
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Select
                            defaultValue={member.role}
                            onValueChange={(val: any) =>
                              handleUpdateRole(member.id, val)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="更改角色" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">所有者</SelectItem>
                              <SelectItem value="member">成员</SelectItem>
                              <SelectItem value="viewer">访客</SelectItem>
                            </SelectContent>
                          </Select>
                          {member.role !== 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>邀请列表</CardTitle>
              <CardDescription>查看和管理已发送的邀请</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>加载中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map(invitation => (
                    <div
                      key={invitation.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {invitation.email}
                            </h3>
                            {getInvitationStatusBadge(invitation.status)}
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            邀请角色：
                            <Badge variant="outline">{invitation.role}</Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              发送于：
                              {new Date(invitation.sentAt).toLocaleString(
                                'zh-CN'
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              过期：
                              {new Date(invitation.expiresAt).toLocaleString(
                                'zh-CN'
                              )}
                            </span>
                          </div>
                        </div>

                        {invitation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelInvitation(invitation.id)
                            }
                          >
                            取消邀请
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            团队协作说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>所有者 (Owner)</strong>
              ：拥有所有权限，可以管理团队、创建工作流、执行和管理所有资源
            </li>
            <li>
              <strong>成员 (Member)</strong>
              ：可以查看、执行和更新工作流，但无法删除或转移所有权
            </li>
            <li>
              <strong>访客 (Viewer)</strong>：仅能查看工作流，无法执行或修改
            </li>
            <li>邀请链接有效期为 14 天，逾期需要重新发送</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>

      {/* 邀请对话框 */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>邀请新成员</DialogTitle>
            <DialogDescription>输入邮箱地址邀请用户加入团队</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="mt-2"
            />

            <Label htmlFor="role" className="mt-4">
              角色
            </Label>
            <Select
              value={inviteRole}
              onValueChange={(val: any) => setInviteRole(val)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">成员</SelectItem>
                <SelectItem value="viewer">访客</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleInviteMember}>发送邀请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
