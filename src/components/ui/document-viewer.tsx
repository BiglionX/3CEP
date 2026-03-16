'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Search,
  BookOpen,
  FileText,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';

interface DocumentViewerProps {
  document: {
    id: string;
    title: string;
    content: string;
    language: string;
    category: string;
    views: number;
    likes: number;
    created_at: string;
    updated_at: string;
    status: 'published' | 'pending' | 'rejected';
    author?: {
      name: string;
      avatar?: string;
    };
  };
  onClose?: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // 分页处理
  const paragraphs = document.content.split('\n\n').filter(p => p.trim());
  const totalPages = Math.ceil(paragraphs.length / 3); // 每页显示3段落

  // 搜索功能
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results: number[] = [];
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(Math.floor(index / 3) + 1); // 转换为页码
      }
    });

    setSearchResults(Array.from(new Set(results))); // 去重
    setCurrentSearchIndex(0);

    if (results.length > 0) {
      setCurrentPage(results[0]);
    }
  };

  // 导航功能
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  // 缩放功能
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const resetZoom = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  // 获取当前页内容
  const getCurrentPageContent = () => {
    const startIndex = (currentPage - 1) * 3;
    return paragraphs.slice(startIndex, startIndex + 3);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">{document.title}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge
                  variant={
                    document.status === 'published' ? 'default' : 'secondary'
                  }
                >
                  {document.status === 'published'
                    ? '已发布'
                    : document.status === 'pending'
                      ? '待审核'
                      : '已拒绝'}
                </Badge>
                <span>{document.language}</span>
                <span>|</span>
                <span>{document.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              关闭
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex p-0">
          {/* 左侧控制面板 */}
          <div className="w-64 border-r bg-gray-50 p-4 flex flex-col">
            {/* 文档信息 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">文档信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    创建: {new Date(document.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>浏览: {document.views} 次</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>点赞: {document.likes} 次</span>
                </div>
              </div>
            </div>

            {/* 搜索功能 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">搜索</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="搜索内容..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  找到 {searchResults.length} 个结?                  {currentSearchIndex + 1}/{searchResults.length}
                </div>
              )}
            </div>

            {/* 导航控制 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">页面导航</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" onClick={goToFirstPage}>
                  首页
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  上一?                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  下一?                </Button>
                <Button size="sm" variant="outline" onClick={goToLastPage}>
                  末页
                </Button>
              </div>
              <div className="mt-2 text-center text-sm text-muted-foreground">
                第 {currentPage} / {totalPages} 页
              </div>
            </div>

            {/* 显示控制 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">显示设置</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">缩放:</span>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="px-2 py-1 text-sm bg-white border rounded min-w-[60px] text-center">
                      {zoomLevel}%
                    </span>
                    <Button size="sm" variant="outline" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={resetZoom}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  重置视图
                </Button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-auto space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                下载PDF
              </Button>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI诊断
              </Button>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 flex flex-col">
            {/* 内容头部 */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">内容预览</h2>
                <div className="flex items-center space-x-2">
                  {searchResults.length > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newIndex =
                            (currentSearchIndex - 1 + searchResults.length) %
                            searchResults.length;
                          setCurrentSearchIndex(newIndex);
                          setCurrentPage(searchResults[newIndex]);
                        }}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newIndex =
                            (currentSearchIndex + 1) % searchResults.length;
                          setCurrentSearchIndex(newIndex);
                          setCurrentPage(searchResults[newIndex]);
                        }}
                      >
                        �?                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 内容主体 */}
            <ScrollArea className="flex-1 p-6">
              <div
                className="prose max-w-none"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease',
                }}
              >
                {getCurrentPageContent().map((paragraph, index) => (
                  <p
                    key={index}
                    className={`mb-4 ${searchTerm && paragraph.toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-yellow-100 p-2 rounded' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}

                {getCurrentPageContent().length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>暂无内容</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 页面导航?*/}
            <div className="border-t p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                共 {totalPages} 页，当前第 {currentPage} 页
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一?                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  下一?                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
