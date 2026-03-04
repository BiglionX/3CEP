'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Headphones,
  QrCode,
  BookOpen,
  Wrench,
  BarChart3,
  Smartphone,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Plus,
  Settings,
  Package,
  HelpCircle,
  TrendingUp,
  Search,
  AlertCircle,
  X,
  Award,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SupportTicket {
  id: string;
  customerName: string;
  productModel: string;
  issueType: string;
  status: 'open' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdate: string;
}

export default function AfterSalesServicePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    productModel: '',
    issueType: '',
    description: '',
  });

  const supportTickets: SupportTicket[] = [
    {
      id: 'TK-001',
      customerName: '张三',
      productModel: 'XYZ-2024-Pro',
      issueType: '硬件故障',
      status: 'processing',
      priority: 'high',
      createdAt: '2024-01-20',
      lastUpdate: '2024-01-20 15:30',
    },
    {
      id: 'TK-002',
      customerName: '李四',
      productModel: 'ABC-2023-Standard',
      issueType: '软件问题',
      status: 'open',
      priority: 'medium',
      createdAt: '2024-01-19',
      lastUpdate: '2024-01-19 10:15',
    },
    {
      id: 'TK-003',
      customerName: '王五',
      productModel: 'DEF-2024-Premium',
      issueType: '使用咨询',
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-18',
      lastUpdate: '2024-01-18 16:45',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // 处理工单提交逻辑
    alert('工单已提交，我们将尽快处理！');
    setNewTicket({
      customerName: '',
      productModel: '',
      issueType: '',
      description: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回主页按钮 */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => router.push('/enterprise')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            返回企业主页
          </button>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Headphones className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            产品服务官智能体
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            扫码绑定、多语言说明书、AI故障诊断，全方位提升售后服务体验
          </p>
        </div>

        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              'dashboard',
              'tickets',
              'qr-management',
              'knowledge-base',
              'content-management',
            ].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && '仪表?}
                {tab === 'tickets' && '工单管理'}
                {tab === 'qr-management' && '二维码管?}
                {tab === 'knowledge-base' && '知识?}
                {tab === 'content-management' && '内容管理'}
              </button>
            ))}
          </nav>
        </div>

        {/* 仪表板内?*/}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    今日工单
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">较昨?+12%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">处理?/CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    平均响应时间: 2.5小时
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">已解?/CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">解决? 94.2%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">满意?/CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">五星评分</p>
                </CardContent>
              </Card>
            </div>

            {/* 功能特色 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>二维码管?/CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    设备扫码绑定，快速获取产品信息和服务记录
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      快速设备识?                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      服务历史追溯
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>多语言说明?/CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    支持多种语言的电子说明书和操作指?                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      中英日韩多语言
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      视频操作指导
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>AI故障诊断</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    智能故障识别和解决方案推?                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      智能问题识别
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      解决方案推荐
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 工单管理 */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>新建服务工单</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">客户姓名</Label>
                      <Input
                        id="customerName"
                        value={newTicket.customerName}
                        onChange={e =>
                          setNewTicket({
                            ...newTicket,
                            customerName: e.target.value,
                          })
                        }
                        placeholder="请输入客户姓?
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productModel">产品型号</Label>
                      <Input
                        id="productModel"
                        value={newTicket.productModel}
                        onChange={e =>
                          setNewTicket({
                            ...newTicket,
                            productModel: e.target.value,
                          })
                        }
                        placeholder="请输入产品型?
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueType">问题类型</Label>
                    <select
                      id="issueType"
                      value={newTicket.issueType}
                      onChange={e =>
                        setNewTicket({
                          ...newTicket,
                          issueType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">请选择问题类型</option>
                      <option value="hardware">硬件故障</option>
                      <option value="software">软件问题</option>
                      <option value="usage">使用咨询</option>
                      <option value="maintenance">保养维护</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">问题描述</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={e =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                      placeholder="请详细描述遇到的问题"
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit">提交工单</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>工单列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">工单?/th>
                        <th className="text-left py-3 px-4">客户</th>
                        <th className="text-left py-3 px-4">产品型号</th>
                        <th className="text-left py-3 px-4">问题类型</th>
                        <th className="text-left py-3 px-4">状?/th>
                        <th className="text-left py-3 px-4">优先?/th>
                        <th className="text-left py-3 px-4">创建时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.map(ticket => (
                        <tr
                          key={ticket.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">{ticket.id}</td>
                          <td className="py-3 px-4">{ticket.customerName}</td>
                          <td className="py-3 px-4">{ticket.productModel}</td>
                          <td className="py-3 px-4">{ticket.issueType}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                            >
                              {ticket.status === 'open' && '待处?}
                              {ticket.status === 'processing' && '处理?}
                              {ticket.status === 'resolved' && '已解?}
                              {ticket.status === 'closed' && '已关?}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                            >
                              {ticket.priority === 'low' && '�?}
                              {ticket.priority === 'medium' && '�?}
                              {ticket.priority === 'high' && '�?}
                              {ticket.priority === 'urgent' && '紧?}
                            </span>
                          </td>
                          <td className="py-3 px-4">{ticket.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 二维码管?*/}
        {activeTab === 'qr-management' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  二维码批量生?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        设备绑定
                      </h3>
                      <p className="text-blue-700 text-sm">
                        为每台设备生成唯一二维码，便于快速识别和信息查询
                      </p>
                    </div>
                    <Button className="w-full">批量生成二维?/Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">
                        服务记录
                      </h3>
                      <p className="text-green-700 text-sm">
                        扫码查看设备完整服务历史和维护记?                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      查看服务记录
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        保修查询
                      </h3>
                      <p className="text-purple-700 text-sm">
                        快速查询设备保修状态和剩余期限
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      保修查询
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 知识?*/}
        {activeTab === 'knowledge-base' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  智能知识?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">常见问题解答</h3>
                    <div className="space-y-3">
                      {[
                        '如何重置设备密码?,
                        'WiFi连接失败怎么办？',
                        '电池续航时间短的原因?,
                        '固件升级步骤说明',
                      ].map((faq, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 bg-gray-50 rounded-lg"
                        >
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{faq}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">多语言支持</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { lang: '中文', flag: '🇨🇳' },
                        { lang: 'English', flag: '🇺🇸' },
                        { lang: '日本?, flag: '🇯🇵' },
                        { lang: '한국�?, flag: '🇰🇷' },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-xl mr-2">{item.flag}</span>
                          <span className="text-sm">{item.lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 内容管理 */}
        {activeTab === 'content-management' && <EnterpriseContentManagement />}
      </div>
    </div>
  );
}

// 企业内容管理组件
function EnterpriseContentManagement() {
  const [activeSubTab, setActiveSubTab] = useState('parts');

  const subTabs = [
    { id: 'parts', name: '配件管理', icon: '🔧' },
    { id: 'manuals', name: '说明?, icon: '📖' },
    { id: 'repair-tips', name: '维修技?, icon: '🛠�? },
    { id: 'software', name: '软件升级', icon: '💾' },
    { id: 'quiz', name: '有奖问答', icon: '�? },
    { id: 'crowdfunding', name: '新品众筹', icon: '💰' },
    { id: 'documents', name: '企业资料', icon: '📁' },
  ];

  return (
    <div className="space-y-6">
      {/* 子标签导?*/}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 配件管理 */}
      {activeSubTab === 'parts' && <EnterprisePartsManagement />}

      {/* 说明书管?*/}
      {activeSubTab === 'manuals' && <EnterpriseManualsManagement />}

      {/* 维修技巧管?*/}
      {activeSubTab === 'repair-tips' && <EnterpriseRepairTipsManagement />}

      {/* 软件升级管理 */}
      {activeSubTab === 'software' && <EnterpriseSoftwareUpdatesManagement />}

      {/* 有奖问答管理 */}
      {activeSubTab === 'quiz' && <EnterpriseRewardQuizManagement />}

      {/* 新品众筹管理 */}
      {activeSubTab === 'crowdfunding' && <EnterpriseCrowdfundingManagement />}

      {/* 企业资料管理 */}
      {activeSubTab === 'documents' && <EnterpriseDocumentsManagement />}
    </div>
  );
}

// 配件管理组件
function EnterprisePartsManagement() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 表单状?  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    part_number: '',
    description: '',
    price: '',
    stock_quantity: 0,
    min_stock: 0,
    warranty_period: '',
    image_urls: [] as string[],
    status: 'draft',
  });

  // 获取配件列表
  const fetchParts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/enterprise/parts?${params}`);
      const result = await response.json();

      if (result.success) {
        setParts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('获取配件列表失败');
      console.error('获取配件列表错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建配件
  const createPart = async () => {
    try {
      const response = await fetch('/api/enterprise/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          stock_quantity: parseInt(formData.stock_quantity.toString()),
          min_stock: parseInt(formData.min_stock.toString()),
          warranty_period: formData.warranty_period
            ? parseInt(formData.warranty_period)
            : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('配件创建成功?);
        setShowCreateModal(false);
        fetchParts();
        resetForm();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (err) {
      alert('创建请求失败');
      console.error('创建配件失败:', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      part_number: '',
      description: '',
      price: '',
      stock_quantity: 0,
      min_stock: 0,
      warranty_period: '',
      image_urls: [],
      status: 'draft',
    });
  };

  // 初始化数?  useEffect(() => {
    fetchParts();
  }, [searchTerm, statusFilter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">配件管理</h2>
          <p className="text-gray-600 mt-1">发布和管理企业配件信?/p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          发布新配?        </Button>
      </div>

      {/* 搜索和过?*/}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索配件名称或描?.."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状?/option>
              <option value="draft">草稿</option>
              <option value="pending_review">审核?/option>
              <option value="published">已发?/option>
              <option value="rejected">已拒?/option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">全部分类</option>
              <option value="手机配件">手机配件</option>
              <option value="电脑配件">电脑配件</option>
              <option value="平板配件">平板配件</option>
              <option value="相机配件">相机配件</option>
              <option value="耳机音响">耳机音响</option>
              <option value="充电配件">充电配件</option>
              <option value="数据线材">数据线材</option>
              <option value="保护配件">保护配件</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 配件列表 */}
      <Card>
        <CardHeader>
          <CardTitle>配件列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载?..</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : parts.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无配件
              </h3>
              <p className="text-gray-500">开始发布您的第一个配?/p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      配件信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      库存
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parts.map(part => (
                    <tr key={part.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {part.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {part.brand} {part.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {part.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {part.price ? `${part.price} ${part.currency}` : '面议'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        库存: {part.stock_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(part.status)}`}
                        >
                          {part.status === 'published'
                            ? '已发?
                            : part.status === 'pending_review'
                              ? '审核?
                              : part.status === 'rejected'
                                ? '已拒?
                                : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            编辑
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            查看详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建配件模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  发布新配?                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">配件名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="请输入配件名?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">分类 *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={e =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">请选择分类</option>
                      <option value="手机配件">手机配件</option>
                      <option value="电脑配件">电脑配件</option>
                      <option value="平板配件">平板配件</option>
                      <option value="相机配件">相机配件</option>
                      <option value="耳机音响">耳机音响</option>
                      <option value="充电配件">充电配件</option>
                      <option value="数据线材">数据线材</option>
                      <option value="保护配件">保护配件</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">品牌</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={e =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      placeholder="请输入品?
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">型号</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={e =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      placeholder="请输入型?
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">价格</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={e =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="请输入价?
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">库存数量</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          stock_quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="请输入库存数?
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">配件描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="请输入配件详细描?
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={createPart}>发布配件</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 说明书管理组?function EnterpriseManualsManagement() {
  const [manuals, setManuals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productModelFilter, setProductModelFilter] = useState('all');

  // 表单状?  const [formData, setFormData] = useState({
    product_name: '',
    product_model: '',
    title: { zh: '', en: '' },
    content: { zh: '', en: '' },
    language_codes: ['zh'],
    cover_image_url: '',
    attachment_urls: [] as string[],
  });

  // 获取说明书列?  const fetchManuals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (productModelFilter !== 'all')
        params.append('product_model', productModelFilter);

      const response = await fetch(`/api/enterprise/manuals?${params}`);
      const result = await response.json();

      if (result.success) {
        setManuals(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('获取说明书列表失?);
      console.error('获取说明书列表错?', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建说明?  const createManual = async () => {
    try {
      const response = await fetch('/api/enterprise/manuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('说明书创建成功！');
        setShowCreateModal(false);
        fetchManuals();
        resetForm();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (err) {
      alert('创建请求失败');
      console.error('创建说明书失?', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      product_name: '',
      product_model: '',
      title: { zh: '', en: '' },
      content: { zh: '', en: '' },
      language_codes: ['zh'],
      cover_image_url: '',
      attachment_urls: [],
    });
  };

  // 初始化数?  useEffect(() => {
    fetchManuals();
  }, [searchTerm, statusFilter, productModelFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">产品说明书管?/h2>
          <p className="text-gray-600 mt-1">发布和管理多语言产品说明?/p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          上传说明?        </Button>
      </div>

      {/* 搜索和过?*/}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索产品名称或标?.."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状?/option>
              <option value="draft">草稿</option>
              <option value="pending_review">审核?/option>
              <option value="published">已发?/option>
              <option value="rejected">已拒?/option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={productModelFilter}
              onChange={e => setProductModelFilter(e.target.value)}
            >
              <option value="all">全部产品</option>
              <option value="iPhone 15 Pro">iPhone 15 Pro</option>
              <option value="Galaxy S24">Galaxy S24</option>
              <option value="MacBook Pro">MacBook Pro</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 说明书列?*/}
      <Card>
        <CardHeader>
          <CardTitle>说明书列?/CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载?..</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : manuals.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无说明?              </h3>
              <p className="text-gray-500">开始上传您的第一份产品说明书</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      语言
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      浏览?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {manuals.map(manual => (
                    <tr key={manual.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {manual.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {manual.product_model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {manual?.zh || manual?.en || '未命?}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-1">
                          {manual?.map((lang: string) => (
                            <span
                              key={lang}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {lang.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(manual.status)}`}
                        >
                          {manual.status === 'published'
                            ? '已发?
                            : manual.status === 'pending_review'
                              ? '审核?
                              : manual.status === 'rejected'
                                ? '已拒?
                                : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {manual.view_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            编辑
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            预览
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            下载
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建说明书模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  上传新产品说明书
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="product_name">产品名称 *</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          product_name: e.target.value,
                        })
                      }
                      placeholder="请输入产品名?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="product_model">产品型号</Label>
                    <Input
                      id="product_model"
                      value={formData.product_model}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          product_model: e.target.value,
                        })
                      }
                      placeholder="请输入产品型?
                    />
                  </div>
                </div>

                <div>
                  <Label>中文标题 *</Label>
                  <Input
                    value={formData.title.zh}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        title: { ...formData.title, zh: e.target.value },
                      })
                    }
                    placeholder="请输入中文标?
                    required
                  />
                </div>

                <div>
                  <Label>英文标题</Label>
                  <Input
                    value={formData.title.en}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        title: { ...formData.title, en: e.target.value },
                      })
                    }
                    placeholder="请输入英文标?
                  />
                </div>

                <div>
                  <Label>中文内容 *</Label>
                  <Textarea
                    value={formData.content.zh}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, zh: e.target.value },
                      })
                    }
                    placeholder="请输入中文说明书内容"
                    rows={8}
                    required
                  />
                </div>

                <div>
                  <Label>英文内容</Label>
                  <Textarea
                    value={formData.content.en}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, en: e.target.value },
                      })
                    }
                    placeholder="请输入英文说明书内容"
                    rows={8}
                  />
                </div>

                <div>
                  <Label>支持的语言</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.language_codes.includes('zh')}
                        onChange={e => {
                          const codes = e.target.checked
                            ? [...formData.language_codes, 'zh']
                            : formData.language_codes.filter(
                                code => code !== 'zh'
                              );
                          setFormData({ ...formData, language_codes: codes });
                        }}
                        className="mr-2"
                      />
                      中文
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.language_codes.includes('en')}
                        onChange={e => {
                          const codes = e.target.checked
                            ? [...formData.language_codes, 'en']
                            : formData.language_codes.filter(
                                code => code !== 'en'
                              );
                          setFormData({ ...formData, language_codes: codes });
                        }}
                        className="mr-2"
                      />
                      英文
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.language_codes.includes('ja')}
                        onChange={e => {
                          const codes = e.target.checked
                            ? [...formData.language_codes, 'ja']
                            : formData.language_codes.filter(
                                code => code !== 'ja'
                              );
                          setFormData({ ...formData, language_codes: codes });
                        }}
                        className="mr-2"
                      />
                      日文
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.language_codes.includes('ko')}
                        onChange={e => {
                          const codes = e.target.checked
                            ? [...formData.language_codes, 'ko']
                            : formData.language_codes.filter(
                                code => code !== 'ko'
                              );
                          setFormData({ ...formData, language_codes: codes });
                        }}
                        className="mr-2"
                      />
                      韩文
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={createManual}>上传说明?/Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 维修技巧管理组?function EnterpriseRepairTipsManagement() {
  const [repairTips, setRepairTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // 表单状?  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'article',
    content_html: '',
    video_url: '',
    image_urls: [] as string[],
    device_models: [] as string[],
    fault_types: [] as string[],
    difficulty_level: 1,
    estimated_time: 0,
    tools_required: [] as string[],
    parts_required: {} as Record<string, number>,
  });

  // 获取维修技巧列?  const fetchRepairTips = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (contentTypeFilter !== 'all')
        params.append('content_type', contentTypeFilter);
      if (difficultyFilter !== 'all')
        params.append('difficulty', difficultyFilter);

      const response = await fetch(`/api/enterprise/repair-tips?${params}`);
      const result = await response.json();

      if (result.success) {
        setRepairTips(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('获取维修技巧列表失?);
      console.error('获取维修技巧列表错?', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建维修技?  const createRepairTip = async () => {
    try {
      const response = await fetch('/api/enterprise/repair-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('维修技巧创建成功！');
        setShowCreateModal(false);
        fetchRepairTips();
        resetForm();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (err) {
      alert('创建请求失败');
      console.error('创建维修技巧失?', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content_type: 'article',
      content_html: '',
      video_url: '',
      image_urls: [],
      device_models: [],
      fault_types: [],
      difficulty_level: 1,
      estimated_time: 0,
      tools_required: [],
      parts_required: {},
    });
  };

  // 初始化数?  useEffect(() => {
    fetchRepairTips();
  }, [searchTerm, statusFilter, contentTypeFilter, difficultyFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return '📝';
      case 'video':
        return '🎥';
      case 'image_gallery':
        return '🖼�?;
      default:
        return '📄';
    }
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ['入门', '初级', '中级', '高级', '专家'];
    return labels[level - 1] || '未知';
  };

  return (
    <div className="space-y-6">
      {/* 操作?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">维修技巧管?/h2>
          <p className="text-gray-600 mt-1">发布和管理图?视频维修技?/p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          发布技?        </Button>
      </div>

      {/* 搜索和过?*/}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索技巧标题或描述..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状?/option>
              <option value="draft">草稿</option>
              <option value="pending_review">审核?/option>
              <option value="published">已发?/option>
              <option value="rejected">已拒?/option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={contentTypeFilter}
              onChange={e => setContentTypeFilter(e.target.value)}
            >
              <option value="all">全部类型</option>
              <option value="article">图文教程</option>
              <option value="video">视频教程</option>
              <option value="image_gallery">图集教程</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
            >
              <option value="all">全部难度</option>
              <option value="1">入门</option>
              <option value="2">初级</option>
              <option value="3">中级</option>
              <option value="4">高级</option>
              <option value="5">专家</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 维修技巧列?*/}
      <Card>
        <CardHeader>
          <CardTitle>维修技巧列?/CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载?..</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : repairTips.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无维修技?              </h3>
              <p className="text-gray-500">开始发布您的第一条维修技?/p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      技巧信?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      适用设备
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      难度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      预估时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repairTips.map(tip => (
                    <tr key={tip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tip.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tip?.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center">
                          <span className="mr-2">
                            {getContentTypeIcon(tip.content_type)}
                          </span>
                          {tip.content_type === 'article'
                            ? '图文'
                            : tip.content_type === 'video'
                              ? '视频'
                              : '图集'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {tip
                            ?.slice(0, 2)
                            .map((model: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {model}
                              </span>
                            ))}
                          {tip?.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{tip.device_models.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getDifficultyLabel(tip.difficulty_level || 1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tip.estimated_time
                          ? `${tip.estimated_time}分钟`
                          : '未设?}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tip.status)}`}
                        >
                          {tip.status === 'published'
                            ? '已发?
                            : tip.status === 'pending_review'
                              ? '审核?
                              : tip.status === 'rejected'
                                ? '已拒?
                                : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            编辑
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            预览
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            分享
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建维修技巧模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  发布新维修技?                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">技巧标?*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="请输入技巧标?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content_type">内容类型 *</Label>
                    <select
                      id="content_type"
                      value={formData.content_type}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          content_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="article">图文教程</option>
                      <option value="video">视频教程</option>
                      <option value="image_gallery">图集教程</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">技巧描?/Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="请输入技巧详细描?
                    rows={3}
                  />
                </div>

                {formData.content_type === 'article' && (
                  <div>
                    <Label htmlFor="content_html">图文内容 *</Label>
                    <Textarea
                      id="content_html"
                      value={formData.content_html}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          content_html: e.target.value,
                        })
                      }
                      placeholder="请输入HTML格式的图文内?
                      rows={6}
                      required
                    />
                  </div>
                )}

                {formData.content_type === 'video' && (
                  <div>
                    <Label htmlFor="video_url">视频URL *</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={e =>
                        setFormData({ ...formData, video_url: e.target.value })
                      }
                      placeholder="请输入视频链接地址"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>适用设备型号</Label>
                    <Input
                      value={formData.device_models.join(', ')}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          device_models: e.target.value
                            .split(',')
                            .map(item => item.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="输入设备型号，用逗号分隔"
                    />
                  </div>

                  <div>
                    <Label>适用故障类型</Label>
                    <Input
                      value={formData.fault_types.join(', ')}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          fault_types: e.target.value
                            .split(',')
                            .map(item => item.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="输入故障类型，用逗号分隔"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="difficulty_level">难度等级</Label>
                    <select
                      id="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          difficulty_level: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">入门 (1�?</option>
                      <option value="2">初级 (2�?</option>
                      <option value="3">中级 (3�?</option>
                      <option value="4">高级 (4�?</option>
                      <option value="5">专家 (5�?</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="estimated_time">预估时间(分钟)</Label>
                    <Input
                      id="estimated_time"
                      type="number"
                      value={formData.estimated_time}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          estimated_time: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="请输入预估维修时?
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={createRepairTip}>发布技?/Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 软件升级管理组件
function EnterpriseSoftwareUpdatesManagement() {
  const [softwareUpdates, setSoftwareUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateTypeFilter, setUpdateTypeFilter] = useState('all');
  const [productModelFilter, setProductModelFilter] = useState('all');

  // 表单状?  const [formData, setFormData] = useState({
    product_name: '',
    product_model: '',
    software_version: '',
    previous_version: '',
    update_type: 'firmware',
    title: '',
    description: '',
    changelog: '',
    file_url: '',
    file_size: '',
    file_hash: '',
    release_date: '',
    compatibility_info: {},
    installation_guide: '',
    warning_notes: '',
  });

  // 获取软件升级包列?  const fetchSoftwareUpdates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (updateTypeFilter !== 'all')
        params.append('update_type', updateTypeFilter);
      if (productModelFilter !== 'all')
        params.append('product_model', productModelFilter);

      const response = await fetch(
        `/api/enterprise/software-updates?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setSoftwareUpdates(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('获取软件升级包列表失?);
      console.error('获取软件升级包列表错?', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建软件升级?  const createSoftwareUpdate = async () => {
    try {
      const response = await fetch('/api/enterprise/software-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('软件升级包创建成功！');
        setShowCreateModal(false);
        fetchSoftwareUpdates();
        resetForm();
      } else {
        alert(`创建失败: ${result.error}`);
      }
    } catch (err) {
      alert('创建请求失败');
      console.error('创建软件升级包失?', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      product_name: '',
      product_model: '',
      software_version: '',
      previous_version: '',
      update_type: 'firmware',
      title: '',
      description: '',
      changelog: '',
      file_url: '',
      file_size: '',
      file_hash: '',
      release_date: '',
      compatibility_info: {},
      installation_guide: '',
      warning_notes: '',
    });
  };

  // 初始化数?  useEffect(() => {
    fetchSoftwareUpdates();
  }, [searchTerm, statusFilter, updateTypeFilter, productModelFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_review':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      firmware: { color: 'bg-purple-100 text-purple-800', text: '固件' },
      driver: { color: 'bg-blue-100 text-blue-800', text: '驱动' },
      app: { color: 'bg-green-100 text-green-800', text: '应用' },
      system: { color: 'bg-orange-100 text-orange-800', text: '系统' },
    };
    return badges[type] || { color: 'bg-gray-100 text-gray-800', text: type };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="space-y-6">
      {/* 操作?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">软件升级包管?/h2>
          <p className="text-gray-600 mt-1">发布和管理各类软件升级包</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          上传升级?        </Button>
      </div>

      {/* 搜索和过?*/}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="搜索产品名称或标?.."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状?/option>
              <option value="draft">草稿</option>
              <option value="pending_review">审核?/option>
              <option value="published">已发?/option>
              <option value="rejected">已拒?/option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={updateTypeFilter}
              onChange={e => setUpdateTypeFilter(e.target.value)}
            >
              <option value="all">全部类型</option>
              <option value="firmware">固件升级</option>
              <option value="driver">驱动程序</option>
              <option value="app">应用程序</option>
              <option value="system">系统更新</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={productModelFilter}
              onChange={e => setProductModelFilter(e.target.value)}
            >
              <option value="all">全部产品</option>
              <option value="iPhone 15 Pro">iPhone 15 Pro</option>
              <option value="Galaxy S24">Galaxy S24</option>
              <option value="MacBook Pro">MacBook Pro</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 软件升级包列?*/}
      <Card>
        <CardHeader>
          <CardTitle>软件升级包列?/CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载?..</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : softwareUpdates.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无软件升级?              </h3>
              <p className="text-gray-500">开始上传您的第一个软件升级包</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      升级包信?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      版本信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      发布时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      下载?                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {softwareUpdates.map(update => (
                    <tr key={update.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {update.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {update.product_name} {update.product_model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUpdateTypeBadge(update.update_type).color}`}
                        >
                          {getUpdateTypeBadge(update.update_type).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>v{update.software_version}</div>
                          {update.previous_version && (
                            <div className="text-gray-500">
                              �?v{update.previous_version} 升级
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.file_size
                          ? formatFileSize(update.file_size)
                          : '未知'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.release_date || '未设?}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}
                        >
                          {update.status === 'published'
                            ? '已发?
                            : update.status === 'pending_review'
                              ? '审核?
                              : update.status === 'rejected'
                                ? '已拒?
                                : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.download_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            编辑
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            预览
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            下载
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建软件升级包模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  上传新软件升级包
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="product_name">产品名称 *</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          product_name: e.target.value,
                        })
                      }
                      placeholder="请输入产品名?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="product_model">产品型号</Label>
                    <Input
                      id="product_model"
                      value={formData.product_model}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          product_model: e.target.value,
                        })
                      }
                      placeholder="请输入产品型?
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="software_version">软件版本 *</Label>
                    <Input
                      id="software_version"
                      value={formData.software_version}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          software_version: e.target.value,
                        })
                      }
                      placeholder="�? 1.2.3"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="previous_version">前一版本</Label>
                    <Input
                      id="previous_version"
                      value={formData.previous_version}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          previous_version: e.target.value,
                        })
                      }
                      placeholder="�? 1.2.2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="update_type">更新类型 *</Label>
                    <select
                      id="update_type"
                      value={formData.update_type}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          update_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="firmware">固件升级</option>
                      <option value="driver">驱动程序</option>
                      <option value="app">应用程序</option>
                      <option value="system">系统更新</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">升级包标?*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="请输入升级包标题"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">升级包描?/Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="请输入升级包详细描述"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="changelog">更新日志</Label>
                  <Textarea
                    id="changelog"
                    value={formData.changelog}
                    onChange={e =>
                      setFormData({ ...formData, changelog: e.target.value })
                    }
                    placeholder="请输入本次更新的主要变更内容"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="file_url">文件URL *</Label>
                    <Input
                      id="file_url"
                      value={formData.file_url}
                      onChange={e =>
                        setFormData({ ...formData, file_url: e.target.value })
                      }
                      placeholder="请输入升级包文件的下载链?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="file_size">文件大小(字节)</Label>
                    <Input
                      id="file_size"
                      type="number"
                      value={formData.file_size}
                      onChange={e =>
                        setFormData({ ...formData, file_size: e.target.value })
                      }
                      placeholder="请输入文件大?
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="file_hash">文件哈希?/Label>
                    <Input
                      id="file_hash"
                      value={formData.file_hash}
                      onChange={e =>
                        setFormData({ ...formData, file_hash: e.target.value })
                      }
                      placeholder="请输入文件SHA256哈希?
                    />
                  </div>

                  <div>
                    <Label htmlFor="release_date">发布日期</Label>
                    <Input
                      id="release_date"
                      type="date"
                      value={formData.release_date}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          release_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={createSoftwareUpdate}>上传升级?/Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 有奖问答管理组件
function EnterpriseRewardQuizManagement() {
  const [questions, setQuestions] = useState<any[]>([
    {
      id: '1',
      title: '产品使用技巧问?,
      description: '关于产品日常使用的常见问题解?,
      question: '如何正确清洁设备表面?,
      answer_options: [
        'A. 使用酒精擦拭',
        'B. 使用专用清洁?,
        'C. 直接用水冲洗',
        'D. 不需要清?,
      ],
      correct_answer: 'B',
      reward_points: 100,
      reward_fc_amount: 50,
      start_time: '2024-01-15T00:00:00Z',
      end_time: '2024-02-15T23:59:59Z',
      max_participants: 1000,
      current_participants: 245,
      status: 'active',
      view_count: 1234,
    },
    {
      id: '2',
      title: '新品功能了解问答',
      description: '测试用户对新产品功能的了解程?,
      question: '以下哪项是本产品的核心优势？',
      answer_options: [
        'A. 高性价?,
        'B. 创新技?,
        'C. 完善售后',
        'D. 以上都是',
      ],
      correct_answer: 'D',
      reward_points: 150,
      reward_fc_amount: 75,
      start_time: '2024-01-20T00:00:00Z',
      end_time: '2024-02-20T23:59:59Z',
      max_participants: 500,
      current_participants: 128,
      status: 'active',
      view_count: 856,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    question: '',
    answer_options: ['', '', '', ''],
    correct_answer: '',
    reward_points: 100,
    reward_fc_amount: 50,
    start_time: '',
    end_time: '',
    max_participants: 100,
  });

  const statusOptions = [
    { value: 'draft', label: '草稿', color: 'bg-gray-100 text-gray-800' },
    { value: 'active', label: '进行?, color: 'bg-green-100 text-green-800' },
    { value: 'ended', label: '已结?, color: 'bg-blue-100 text-blue-800' },
    { value: 'closed', label: '已关?, color: 'bg-red-100 text-red-800' },
  ];

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}
      >
        {option.label}
      </span>
    ) : null;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      question: '',
      answer_options: ['', '', '', ''],
      correct_answer: '',
      reward_points: 100,
      reward_fc_amount: 50,
      start_time: '',
      end_time: '',
      max_participants: 100,
    });
  };

  const createQuestion = () => {
    // 验证必填字段
    if (!formData.title || !formData.question || !formData.correct_answer) {
      alert('请填写所有必填字?);
      return;
    }

    // 创建新问?    const newQuestion = {
      id: (questions.length + 1).toString(),
      ...formData,
      current_participants: 0,
      view_count: 0,
      status: 'draft',
    };

    setQuestions([...questions, newQuestion]);
    setShowCreateModal(false);
    resetForm();
    alert('问答创建成功?);
  };

  const viewStatistics = (question: any) => {
    setSelectedQuestion(question);
    setShowStatsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const calculateProgress = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作?*/}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">有奖问答管理</h2>
          <p className="text-gray-600 mt-1">
            创建和管理有奖问答活动，提升用户参与?          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建问答
        </Button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总问答数</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">所有问答活?/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行?/CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">活跃活动</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总参与人?/CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.reduce((sum, q) => sum + q.current_participants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">累计参与</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">奖励发放</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.reduce(
                (sum, q) => sum + q.reward_fc_amount * q.current_participants,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">FC币总额</p>
          </CardContent>
        </Card>
      </div>

      {/* 问答列表 */}
      <Card>
        <CardHeader>
          <CardTitle>问答活动列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">活动名称</th>
                  <th className="text-left py-3 px-4 font-medium">问题</th>
                  <th className="text-left py-3 px-4 font-medium">奖励</th>
                  <th className="text-left py-3 px-4 font-medium">参与情况</th>
                  <th className="text-left py-3 px-4 font-medium">状?/th>
                  <th className="text-left py-3 px-4 font-medium">时间</th>
                  <th className="text-left py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(question => (
                  <tr key={question.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{question.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {question.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div
                        className="text-sm truncate"
                        title={question.question}
                      >
                        {question.question}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div>积分: {question.reward_points}</div>
                        <div>FC�? {question.reward_fc_amount}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm">
                          {question.current_participants}/
                          {question.max_participants}
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${calculateProgress(question.current_participants, question.max_participants)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(question.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div>{formatDate(question.start_time)}</div>
                        <div className="text-gray-500">
                          �?{formatDate(question.end_time)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewStatistics(question)}
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          统计
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {questions.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无问答活动
              </h3>
              <p className="text-gray-500 mb-4">
                创建第一个有奖问答活动来提升用户参与?              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建问答
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建问答模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">创建有奖问答</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">活动标题 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="请输入活动标?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reward_points">奖励积分</Label>
                    <Input
                      id="reward_points"
                      type="number"
                      value={formData.reward_points}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          reward_points: parseInt(e.target.value),
                        })
                      }
                      placeholder="积分数量"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">活动描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="请输入活动描?
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="question">问题内容 *</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={e =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="请输入问题内?
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label>答案选项 *</Label>
                  <div className="space-y-3 mt-2">
                    {['A', 'B', 'C', 'D'].map((letter, index) => (
                      <div key={letter} className="flex items-center space-x-3">
                        <span className="font-medium w-8">{letter}.</span>
                        <Input
                          value={formData.answer_options[index]}
                          onChange={e => {
                            const newOptions = [...formData.answer_options];
                            newOptions[index] = e.target.value;
                            setFormData({
                              ...formData,
                              answer_options: newOptions,
                            });
                          }}
                          placeholder={`选项${letter}内容`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="correct_answer">正确答案 *</Label>
                    <Select
                      value={formData.correct_answer}
                      onValueChange={value =>
                        setFormData({ ...formData, correct_answer: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择正确答案" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reward_fc_amount">奖励FC�?/Label>
                    <Input
                      id="reward_fc_amount"
                      type="number"
                      value={formData.reward_fc_amount}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          reward_fc_amount: parseInt(e.target.value),
                        })
                      }
                      placeholder="FC币数?
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start_time">开始时?/Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={e =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">结束时间</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={e =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="max_participants">最大参与人?/Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        max_participants: parseInt(e.target.value),
                      })
                    }
                    placeholder="最多允许参与人?
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={createQuestion}>创建问答</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统计详情模态框 */}
      {showStatsModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">问答统计详情</h3>
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setSelectedQuestion(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">参与?/CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateProgress(
                          selectedQuestion.current_participants,
                          selectedQuestion.max_participants
                        )}
                        %
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedQuestion.current_participants} /{' '}
                        {selectedQuestion.max_participants}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">浏览?/CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedQuestion.view_count}
                      </div>
                      <div className="text-sm text-gray-500">次浏?/div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">奖励成本</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedQuestion.reward_fc_amount *
                          selectedQuestion.current_participants}
                      </div>
                      <div className="text-sm text-gray-500">FC�?/div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>问题详情</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">问题?/h4>
                        <p className="text-gray-700">
                          {selectedQuestion.question}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">答案选项?/h4>
                        <div className="space-y-2">
                          {selectedQuestion.answer_options.map(
                            (option: string, index: number) => (
                              <div
                                key={index}
                                className={`p-2 rounded ${selectedQuestion.correct_answer === ['A', 'B', 'C', 'D'][index] ? 'bg-green-100 border border-green-300' : 'bg-gray-50'}`}
                              >
                                <span className="font-medium mr-2">
                                  {['A', 'B', 'C', 'D'][index]}.
                                </span>
                                {option}
                                {selectedQuestion.correct_answer ===
                                  ['A', 'B', 'C', 'D'][index] && (
                                  <span className="ml-2 text-green-600 font-medium">
                                    (正确答案)
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import EnterpriseCrowdfundingManagement from '@/components/EnterpriseCrowdfundingManagement';
import EnterpriseDocumentsManagement from '@/components/EnterpriseDocumentsManagement';

