'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  File,
  Image,
  FileSpreadsheet,
  FileText as FileTextIcon,
  Archive,
  Search,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_extension: string;
  category: string;
  version: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  tags: string[];
  uploaded_by: string;
  uploaded_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  access_level: 'private' | 'internal' | 'public';
}

export default function EnterpriseDocumentsManagement() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: '营业执照副本',
      description: '企业法人营业执照副本扫描?,
      file_name: 'business_license_2024.pdf',
      file_size: 2456789,
      file_type: 'application/pdf',
      file_extension: 'pdf',
      category: 'business_license',
      version: '1.0',
      status: 'approved',
      tags: ['营业执照', '2024'],
      uploaded_by: '张经?,
      uploaded_at: '2024-01-15T10:30:00Z',
      reviewed_by: '李主?,
      reviewed_at: '2024-01-16T14:20:00Z',
      access_level: 'internal',
    },
    {
      id: '2',
      title: 'ISO9001认证证书',
      description: '质量管理体系认证证书',
      file_name: 'iso9001_certificate.pdf',
      file_size: 1890123,
      file_type: 'application/pdf',
      file_extension: 'pdf',
      category: 'qualification',
      version: '1.0',
      status: 'pending',
      tags: ['认证', '质量管理'],
      uploaded_by: '王专?,
      uploaded_at: '2024-01-20T09:15:00Z',
      access_level: 'private',
    },
    {
      id: '3',
      title: '年度财务报告',
      description: '2023年度财务审计报告',
      file_name: 'annual_report_2023.xlsx',
      file_size: 3245678,
      file_type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_extension: 'xlsx',
      category: 'report',
      version: '1.0',
      status: 'approved',
      tags: ['财务', '年报', '2023'],
      uploaded_by: '财务?,
      uploaded_at: '2024-01-10T16:45:00Z',
      reviewed_by: '审计?,
      reviewed_at: '2024-01-12T11:30:00Z',
      access_level: 'internal',
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    version: '1.0',
    access_level: 'private',
    tags: '',
    file_name: '',
  });

  const categoryOptions = [
    { value: 'business_license', label: '营业执照', icon: '🏢' },
    { value: 'qualification', label: '资质证书', icon: '🏆' },
    { value: 'contract', label: '合同协议', icon: '📝' },
    { value: 'report', label: '报告文档', icon: '📊' },
    { value: 'financial', label: '财务资料', icon: '💰' },
    { value: 'other', label: '其他资料', icon: '📁' },
  ];

  const statusOptions = [
    {
      value: 'pending',
      label: '待审?,
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
    },
    {
      value: 'approved',
      label: '已批?,
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    {
      value: 'rejected',
      label: '已拒?,
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
    },
    {
      value: 'archived',
      label: '已归?,
      color: 'bg-gray-100 text-gray-800',
      icon: Archive,
    },
  ];

  const getFileIcon = (fileType: string, extension: string) => {
    if (fileType.startsWith('image/'))
      return <Image className="w-8 h-8 text-blue-500" />;
    if (
      fileType.includes('spreadsheet') ||
      extension === 'xlsx' ||
      extension === 'xls'
    )
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (fileType === 'application/pdf')
      return <FileTextIcon className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return null;
    const IconComponent = option.icon;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${option.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {option.label}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
        <span className="mr-1">{option.icon}</span>
        {option.label}
      </span>
    ) : null;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('不支持的文件类型。请上传 PDF、Word、Excel 或图片文件?);
      return;
    }

    // 验证文件大小 (10MB 限制)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小超过 10MB 限制?);
      return;
    }

    // 设置文件?    setUploadData(prev => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      file_name: file.name,
    }));

    // 这里应该调用实际的上传API
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('准备上传文件:', file)};

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const submitUpload = () => {
    if (!uploadData.title || !uploadData.category) {
      alert('请填写必要信?);
      return;
    }

    // 创建新文档记?    const newDocument: Document = {
      id: (documents.length + 1).toString(),
      ...uploadData,
      file_name: uploadData.file_name || '未命名文?,
      file_size: 0, // 实际上传时获?      file_type: 'application/octet-stream', // 实际上传时获?      file_extension: uploadData.file_name.split('.').pop() || '',
      status: 'pending',
      tags: uploadData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      uploaded_by: '当前用户',
      uploaded_at: new Date().toISOString(),
      access_level: uploadData.access_level as
        | 'private'
        | 'internal'
        | 'public',
    };

    setDocuments([...documents, newDocument]);
    setShowUploadModal(false);
    resetUploadForm();
    alert('文件上传成功，等待审核！');
  };

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      category: '',
      version: '1.0',
      access_level: 'private',
      tags: '',
      file_name: '',
    });
  };

  const viewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const downloadDocument = (document: Document) => {
    // 这里应该调用实际的下载API
    alert(`下载文件: ${document.file_name}`);
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作?*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">企业资料管理</h2>
          <p className="text-gray-600 mt-1">上传和管理企业相关资质文?/p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          上传文件
        </Button>
      </div>

      {/* 搜索和筛?*/}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索文件..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="文件分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center">
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="审核状? />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状?/SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center">
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-500">
                �?{filteredDocuments.length} 个文?              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文件列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(doc => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.file_type, doc.file_extension)}
                  <div>
                    <CardTitle className="text-base line-clamp-2">
                      {doc.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.file_name}
                    </p>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {doc.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {getCategoryBadge(doc.category)}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  v{doc.version}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {formatFileSize(doc.file_size)}
                </span>
              </div>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 mb-3">
                上传? {doc.uploaded_by}
                <br />
                上传时间: {formatDate(doc.uploaded_at)}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => viewDocument(doc)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  查看
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(doc)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
            <p className="text-gray-500 mb-4">上传企业相关资质文件进行管理</p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              上传文件
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 上传文件模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">上传企业资料</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="file-upload">选择文件 *</Label>
                  <div
                    className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
                    onClick={triggerFileUpload}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          上传文件
                        </span>
                        <p className="pl-1">或将文件拖拽到这?/p>
                      </div>
                      <p className="text-xs text-gray-500">
                        支持 PDF, Word, Excel, 图片格式，最?10MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">文件标题 *</Label>
                    <Input
                      id="title"
                      value={uploadData.title}
                      onChange={e =>
                        setUploadData({ ...uploadData, title: e.target.value })
                      }
                      placeholder="请输入文件标?
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">文件分类 *</Label>
                    <Select
                      value={uploadData.category}
                      onValueChange={value =>
                        setUploadData({ ...uploadData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center">
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">文件描述</Label>
                  <Textarea
                    id="description"
                    value={uploadData.description}
                    onChange={e =>
                      setUploadData({
                        ...uploadData,
                        description: e.target.value,
                      })
                    }
                    placeholder="请输入文件描?
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="version">版本?/Label>
                    <Input
                      id="version"
                      value={uploadData.version}
                      onChange={e =>
                        setUploadData({
                          ...uploadData,
                          version: e.target.value,
                        })
                      }
                      placeholder="�? 1.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="access_level">访问权限</Label>
                    <Select
                      value={uploadData.access_level}
                      onValueChange={value =>
                        setUploadData({ ...uploadData, access_level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">私有</SelectItem>
                        <SelectItem value="internal">内部</SelectItem>
                        <SelectItem value="public">公开</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    id="tags"
                    value={uploadData.tags}
                    onChange={e =>
                      setUploadData({ ...uploadData, tags: e.target.value })
                    }
                    placeholder="输入标签，用逗号分隔"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={submitUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    上传文件
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文件预览模态框 */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">文件预览</h3>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedDocument(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      {getFileIcon(
                        selectedDocument.file_type,
                        selectedDocument.file_extension
                      )}
                      <span>{selectedDocument.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">文件?/Label>
                        <p className="font-medium">
                          {selectedDocument.file_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          文件大小
                        </Label>
                        <p className="font-medium">
                          {formatFileSize(selectedDocument.file_size)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">分类</Label>
                        <p>{getCategoryBadge(selectedDocument.category)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">状?/Label>
                        <p>{getStatusBadge(selectedDocument.status)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">版本</Label>
                        <p className="font-medium">
                          v{selectedDocument.version}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">
                          访问权限
                        </Label>
                        <p className="font-medium capitalize">
                          {selectedDocument.access_level}
                        </p>
                      </div>
                    </div>

                    {selectedDocument.description && (
                      <div className="mt-4">
                        <Label className="text-sm text-gray-500">描述</Label>
                        <p className="mt-1">{selectedDocument.description}</p>
                      </div>
                    )}

                    {selectedDocument.tags.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm text-gray-500">标签</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedDocument.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <Label>上传信息</Label>
                        <p className="mt-1">
                          上传? {selectedDocument.uploaded_by}
                        </p>
                        <p>
                          上传时间: {formatDate(selectedDocument.uploaded_at)}
                        </p>
                      </div>
                      {selectedDocument.reviewed_at && (
                        <div>
                          <Label>审核信息</Label>
                          <p className="mt-1">
                            审核? {selectedDocument.reviewed_by}
                          </p>
                          <p>
                            审核时间: {formatDate(selectedDocument.reviewed_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedDocument.status === 'rejected' &&
                      selectedDocument.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <Label className="text-sm text-red-800">
                              拒绝原因
                            </Label>
                          </div>
                          <p className="mt-1 text-red-700">
                            {selectedDocument.rejection_reason}
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => downloadDocument(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载文件
                  </Button>
                  <Button>Edit Document</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
