'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentViewer } from '@/components/ui/document-viewer';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Eye,
  ThumbsUp,
  Calendar,
  Languages,
} from 'lucide-react';

interface Document {
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
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 模拟数据
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        title: 'iPhone 15 Pro 使用说明?,
        content:
          '欢迎使用 iPhone 15 Pro。本手册将帮助您了解如何使用这款强大的智能手机。\n\n开箱即用\n当您首次开机时，请按照屏幕上的指示进行设置。您可以选择恢复备份或设置为新设备。\n\n基本操作\n主屏幕：轻点应用图标即可打开应用\n控制中心：从屏幕右上角向下滑动\n通知中心：从屏幕左上角向下滑动\n多任务处理：向上滑动并暂停以查看最近使用的应用\n\n相机功能\niPhone 15 Pro 配备了先进的三摄系统：\n�?主摄像头?8MP，支持传感器位移式光学图像防抖功能\n�?超广角摄像头?2MP\n�?长焦摄像头：12MP，支?倍光学变焦\n\n电池续航\n视频播放：最长可?9小时\n流媒体视频播放：最长可?0小时\n音频播放：最长可?5小时',
        language: 'zh-CN',
        category: '手机',
        views: 1234,
        likes: 89,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        status: 'published',
        author: { name: 'Apple官方' },
      },
      {
        id: '2',
        title: 'Samsung Galaxy S24 User Manual',
        content:
          'Welcome to Samsung Galaxy S24. This guide will help you get started with your new smartphone.\n\nGetting Started\nWhen you first turn on your device, follow the on-screen setup instructions. You can restore from backup or set up as new.\n\nBasic Operations\nHome Screen: Tap app icons to open applications\nQuick Panel: Swipe down from the top of the screen\nNotification Panel: Swipe down from the top with two fingers\nRecent Apps: Tap the Recent Apps button or swipe up from the bottom\n\nCamera Features\nGalaxy S24 features advanced camera system:\n�?Main Camera: 50MP with OIS\n�?Ultra Wide Camera: 12MP\n�?Telephoto Camera: 10MP with 3x zoom\n\nBattery Life\nVideo playback: Up to 26 hours\nStreaming video: Up to 18 hours\nAudio playback: Up to 80 hours',
        language: 'en-US',
        category: '手机',
        views: 856,
        likes: 67,
        created_at: '2024-01-14T14:30:00Z',
        updated_at: '2024-01-14T14:30:00Z',
        status: 'published',
        author: { name: 'Samsung Official' },
      },
      {
        id: '3',
        title: 'MacBook Pro 16イン�?取扱説明?,
        content:
          'MacBook Pro 16インチへようこそ。このガイドは新しいラップトップの使い方を説明します。\n\n初期設定\n初回起動時は画面の指示に従ってください。バックアップからの復元または新規設定を選択できます。\n\n基本操作\nホーム画面：アプリアイコンをタップしてアプリを開く\nコントロールセンター：画面右上の角から下にスワイプ\n通知センター：画面左上の角から下にスワイプ\n最近使ったアプリ：Dockの最近使ったアプリセクションを確認\n\nカメラ機能\nMacBook Proには以下のカメラが搭載されています：\n�?メインカメラ�?080p FaceTime HDカメラ\n�?オーディオ：6スピーカ�?サウンドシステム\n\nバッテリー寿命\nビデオ再生：最?1時間\nストリーミング：最?7時間\n音楽再生：最?0時間',
        language: 'ja-JP',
        category: '笔记本电?,
        views: 432,
        likes: 34,
        created_at: '2024-01-13T09:15:00Z',
        updated_at: '2024-01-13T09:15:00Z',
        status: 'published',
        author: { name: 'Apple公式' },
      },
    ];

    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
    setLoading(false);
  }, []);

  // 过滤功能
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(doc => doc.language === selectedLanguage);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedCategory, selectedLanguage]);

  const categories = ['all', '手机', '笔记本电?, '平板电脑', '耳机', '其他'];
  const languages = ['all', 'zh-CN', 'en-US', 'ja-JP', 'ko-KR'];

  const getLanguageName = (langCode: string) => {
    const langMap: Record<string, string> = {
      'zh-CN': '中文',
      'en-US': 'English',
      'ja-JP': '日本?,
      'ko-KR': '한국�?,
    };
    return langMap[langCode] || langCode;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载?..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">产品说明?/h1>
          <p className="text-gray-600 mt-2">浏览和搜索各类产品的详细使用说明</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          上传说明?        </Button>
      </div>

      {/* 搜索和筛?*/}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索说明?.."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? '全部分类' : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? '全部语言' : getLanguageName(lang)}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            高级筛?          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {documents.length}
          </div>
          <div className="text-gray-600">总文档数</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {documents.filter(d => d.language === 'zh-CN').length}
          </div>
          <div className="text-gray-600">中文文档</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {documents.filter(d => d.category === '手机').length}
          </div>
          <div className="text-gray-600">手机类别</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {documents.reduce((sum, doc) => sum + doc.views, 0)}
          </div>
          <div className="text-gray-600">总浏览量</div>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(document => (
          <div
            key={document.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            onClick={() => setSelectedDocument(document)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {document.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    document.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : document.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {document.status === 'published'
                    ? '已发?
                    : document.status === 'pending'
                      ? '待审?
                      : '已拒?}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Languages className="h-4 w-4 mr-1" />
                  {getLanguageName(document.language)}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(document.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    {document.views}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {document.likes}
                  </div>
                </div>
                <div className="text-gray-500">{document.category}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状?*/}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            未找到相关文?          </h3>
          <p className="text-gray-500">尝试调整搜索条件或筛选器</p>
        </div>
      )}

      {/* 文档查看器模态框 */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

