'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  Upload,
  Folder,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category:
    | 'business_license'
    | 'qualification'
    | 'contract'
    | 'report'
    | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  version: string;
  uploaded_by: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewer?: string;
}

export default function DocumentsManagementPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enterpriseId] = useState('enterprise-001'); // 模拟企业ID，实际应从上下文获取
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'other' as Document['category'],
    file: null as File | null,
  });

  // 从API获取文档列表
  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `/api/enterprise/documents?enterprise_id=${enterpriseId}`
      );
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data || []);
      }
    } catch (error) {
      console.error('获取文档列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { text: string; color: string; icon: any }
    > = {
      pending: {
        text: '待审',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      approved: {
        text: '已批',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      rejected: {
        text: '已拒',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
      archived: {
        text: '已归',
        color: 'bg-gray-100 text-gray-800',
        icon: Folder,
      },
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { text: string; color: string }> = {
      business_license: {
        text: '营业执照',
        color: 'bg-blue-100 text-blue-800',
      },
      qualification: {
        text: '资质证书',
        color: 'bg-purple-100 text-purple-800',
      },
      contract: { text: '合同协议', color: 'bg-green-100 text-green-800' },
      report: { text: '报告文档', color: 'bg-orange-100 text-orange-800' },
      other: { text: '其他', color: 'bg-gray-100 text-gray-800' },
    };

    const config = categoryMap[category] || categoryMap.other;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {/* 页面标题和操作按钮 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">企业资料管理</h1>
              <p className="text-gray-600 mt-1">上传和管理企业相关资质文档</p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>上传新文档</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">文档标题</Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={e =>
                        setNewDocument({
                          ...newDocument,
                          title: e.target.value,
                        })
                      }
                      placeholder="请输入文档标题"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">文档描述</Label>
                    <Input
                      id="description"
                      value={newDocument.description}
                      onChange={e =>
                        setNewDocument({
                          ...newDocument,
                          description: e.target.value,
                        })
                      }
                      placeholder="请输入文档描述"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">文档类别</Label>
                    <Select
                      value={newDocument.category}
                      onValueChange={value =>
                        setNewDocument({
                          ...newDocument,
                          category: value as Document['category'],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择文档类别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business_license">
                          营业执照
                        </SelectItem>
                        <SelectItem value="qualification">资质证书</SelectItem>
                        <SelectItem value="contract">合同协议</SelectItem>
                        <SelectItem value="report">报告文档</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file">选择文件</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                      className="cursor-pointer"
                      onChange={e =>
                        setNewDocument({
                          ...newDocument,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={uploading}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!newDocument.file) {
                        alert('请选择要上传的文件');
                        return;
                      }
                      if (!newDocument.title) {
                        alert('请输入文档标题');
                        return;
                      }

                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', newDocument.file);
                        formData.append('title', newDocument.title);
                        formData.append('description', newDocument.description);
                        formData.append('category', newDocument.category);
                        formData.append('enterprise_id', enterpriseId);
                        formData.append('version', '1.0');

                        const response = await fetch(
                          '/api/enterprise/documents',
                          {
                            method: 'POST',
                            body: formData,
                          }
                        );

                        const result = await response.json();
                        if (result.success) {
                          await fetchDocuments();
                          setIsModalOpen(false);
                          setNewDocument({
                            title: '',
                            description: '',
                            category: 'other',
                            file: null,
                          });
                          alert('文件上传成功');
                        } else {
                          alert(`上传失败: ${result.error || '未知错误'}`);
                        }
                      } catch (error) {
                        console.error('上传失败:', error);
                        alert('上传失败，请重试');
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading}
                  >
                    {uploading ? '上传中...' : '上传'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总文件数</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">所有文档</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待审核</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">等待审核</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已批准</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'approved').length}
                </div>
                <p className="text-xs text-muted-foreground">审核通过</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">存储使用</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatFileSize(
                    documents.reduce((sum, d) => sum + d.file_size, 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">总文件大小</p>
              </CardContent>
            </Card>
          </div>

          {/* 文件列表 */}
          <Card>
            <CardHeader>
              <CardTitle>文件列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        文件信息
                      </th>
                      <th className="text-left py-3 px-4 font-medium">类别</th>
                      <th className="text-left py-3 px-4 font-medium">大小</th>
                      <th className="text-left py-3 px-4 font-medium">状态</th>
                      <th className="text-left py-3 px-4 font-medium">
                        上传人
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        上传时间
                      </th>
                      <th className="text-left py-3 px-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(document => (
                      <tr
                        key={document.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-gray-400" />
                              {document.title}
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {document.version}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {document.file_name}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {document.description}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getCategoryBadge(document.category)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div>{formatFileSize(document.file_size)}</div>
                            <div className="text-gray-500">
                              {document.file_type}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(document.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="font-medium">
                              {document.uploaded_by}
                            </div>
                            {document.reviewer && (
                              <div className="text-gray-500 text-xs mt-1">
                                审核 {document.reviewer}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-500">
                            <div>{formatDate(document.uploaded_at)}</div>
                            {document.reviewed_at && (
                              <div className="text-xs mt-1">
                                审核: {formatDate(document.reviewed_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              查看
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

              {documents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无文件
                  </h3>
                  <p className="text-gray-500 mb-4">
                    上传企业相关资质文件进行管理
                  </p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Upload className="w-4 h-4 mr-2" />
                    上传文件
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
