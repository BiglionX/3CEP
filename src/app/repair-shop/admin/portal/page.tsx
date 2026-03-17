'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Bot,
  Coins,
  Globe,
  Upload,
  Image as ImageIcon,
  FileText,
  Eye,
  Edit,
  Trash2,
  Save,
  Plus,
  Link as LinkIcon,
  X,
  Menu,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  published: boolean;
  views: number;
  createdAt: string;
}

interface PromotionalImage {
  id: string;
  url: string;
  title: string;
  order: number;
}

export default function RepairShopPortalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: '智能体管理', href: '/repair-shop/admin/agents', icon: Bot },
    { name: 'Token管理', href: '/repair-shop/admin/tokens', icon: Coins },
    { name: '门户管理', href: '/repair-shop/admin/portal', icon: Globe },
    { name: 'FXC管理', href: '/repair-shop/admin/fxc', icon: CreditCard },
  ];

  const [portalSettings, setPortalSettings] = useState({
    name: '我的维修店门户',
    description: '专业的汽车维修服务',
    logo: '',
    favicon: '',
    themeColor: '#2563eb',
  });

  const [businessLinks, setBusinessLinks] = useState([
    { id: '1', name: '官方网站', url: 'https://example.com' },
    { id: '2', name: '预约系统', url: 'https://booking.example.com' },
    { id: '3', name: '配件商城', url: 'https://parts.example.com' },
  ]);

  const [blogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: '春季汽车保养小贴士',
      excerpt: '春天来了，为您的爱车做一次全面的保养检查...',
      published: true,
      views: 856,
      createdAt: '2025-03-10',
    },
    {
      id: '2',
      title: '如何识别车辆故障信号',
      excerpt: '及时发现车辆故障信号，避免更大的损失...',
      published: true,
      views: 642,
      createdAt: '2025-03-08',
    },
    {
      id: '3',
      title: '新能源汽车维护指南',
      excerpt: '新能源汽车的维护要点和注意事项...',
      published: false,
      views: 0,
      createdAt: '2025-03-05',
    },
  ]);

  const [promotionalImages] = useState<PromotionalImage[]>([
    { id: '1', url: '/images/promo1.jpg', title: '专业维修服务', order: 1 },
    { id: '2', url: '/images/promo2.jpg', title: '原厂配件', order: 2 },
    { id: '3', url: '/images/promo3.jpg', title: '快速维修', order: 3 },
  ]);

  const [activeTab, setActiveTab] = useState<
    'basic' | 'links' | 'images' | 'blog'
  >('basic');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'basic' as const, label: '基本信息', icon: Globe },
    { id: 'links' as const, label: '业务链接', icon: LinkIcon },
    { id: 'images' as const, label: '宣传图片', icon: ImageIcon },
    { id: 'blog' as const, label: '博客管理', icon: FileText },
  ];

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
                <span className="text-white font-bold">R</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                维修店管理中心
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
        {/* 侧边栏 */}
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
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 移动端遮罩层 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主要内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">门户管理</h1>
                <p className="mt-2 text-gray-600">
                  自定义您的维修店门户页面，展示品牌形象和服务信息
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Eye className="w-4 h-4" />
                      预览
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      编辑
                    </>
                  )}
                </Button>
                <Button className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存更改
                </Button>
              </div>
            </div>

            {/* 预览链接 */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      您的门户地址：
                    </span>
                    <span className="text-sm font-mono text-blue-700">
                      https://portal.example.com/repair-shop/your-portal
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    查看门户
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 标签页导航 */}
            <div className="mb-6 border-b">
              <nav className="flex gap-4">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 内容区域 */}
            {activeTab === 'basic' && (
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo上传 */}
                  <div>
                    <Label>门户Logo</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        点击或拖拽上传Logo
                      </p>
                      <p className="text-xs text-gray-500">
                        支持 PNG、JPG、SVG 格式，最大 2MB
                      </p>
                      {portalSettings.logo && (
                        <div className="mt-4">
                          <img
                            src={portalSettings.logo}
                            alt="Logo预览"
                            className="max-h-20 mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 门户名称 */}
                  <div>
                    <Label htmlFor="portalName">门户名称</Label>
                    <Input
                      id="portalName"
                      value={portalSettings.name}
                      onChange={e =>
                        setPortalSettings({
                          ...portalSettings,
                          name: e.target.value,
                        })
                      }
                      placeholder="输入门户名称"
                      className="mt-1"
                    />
                  </div>

                  {/* 门户描述 */}
                  <div>
                    <Label htmlFor="portalDescription">门户描述</Label>
                    <Input
                      id="portalDescription"
                      value={portalSettings.description}
                      onChange={e =>
                        setPortalSettings({
                          ...portalSettings,
                          description: e.target.value,
                        })
                      }
                      placeholder="输入门户描述"
                      className="mt-1"
                    />
                  </div>

                  {/* 主题颜色 */}
                  <div>
                    <Label htmlFor="themeColor">主题颜色</Label>
                    <div className="flex gap-4 mt-2">
                      <Input
                        id="themeColor"
                        type="color"
                        value={portalSettings.themeColor}
                        onChange={e =>
                          setPortalSettings({
                            ...portalSettings,
                            themeColor: e.target.value,
                          })
                        }
                        className="w-20 h-10"
                      />
                      <div
                        className="flex-1 rounded-lg"
                        style={{ backgroundColor: portalSettings.themeColor }}
                      >
                        <span className="flex items-center justify-center h-10 text-sm text-white">
                          {portalSettings.themeColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'links' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>业务链接</CardTitle>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      添加链接
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessLinks.map(link => (
                      <div
                        key={link.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <LinkIcon className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <Input
                            value={link.name}
                            onChange={e => {
                              const newLinks = businessLinks.map(l =>
                                l.id === link.id
                                  ? { ...l, name: e.target.value }
                                  : l
                              );
                              setBusinessLinks(newLinks);
                            }}
                            placeholder="链接名称"
                            className="mb-2"
                          />
                          <Input
                            value={link.url}
                            onChange={e => {
                              const newLinks = businessLinks.map(l =>
                                l.id === link.id
                                  ? { ...l, url: e.target.value }
                                  : l
                              );
                              setBusinessLinks(newLinks);
                            }}
                            placeholder="链接地址"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'images' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>宣传图片</CardTitle>
                    <div>
                      <span className="text-sm text-gray-500 mr-4">
                        已使用 {promotionalImages.length}/5
                      </span>
                      <Button size="sm" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        上传图片
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-6">
                    上传宣传图片，每张图片最大 5MB，最多 5 张
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {promotionalImages.map(image => (
                      <div
                        key={image.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gray-100 rounded mb-4 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <Input
                          value={image.title}
                          placeholder="图片标题"
                          className="mb-2"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            排序: {image.order}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {promotionalImages.length < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                        <Plus className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600">添加图片</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'blog' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>博客管理</CardTitle>
                    <div>
                      <span className="text-sm text-gray-500 mr-4">
                        已发布 {blogPosts.filter(p => p.published).length}/10
                      </span>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        新建文章
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-6">
                    管理博客文章，最多 10 篇已发布文章
                  </p>
                  <div className="space-y-4">
                    {blogPosts.map(post => (
                      <div
                        key={post.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {post.title}
                            </h3>
                            {post.published ? (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                                已发布
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                                草稿
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>创建于: {post.createdAt}</span>
                            <span>浏览: {post.views}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
