'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Tutorial {
  id: string;
  device_model: string;
  fault_type: string;
  title: string;
  description: string;
  steps: any[];
  video_url: string | null;
  tools: string[];
  parts: string[];
  cover_image: string | null;
  difficulty_level: number;
  estimated_time: number;
  view_count: number;
  like_count: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export default function TutorialsPublicPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedFault, setSelectedFault] = useState('all');

  // 获取教程列表
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('pageSize', '10');

      if (searchTerm) params.append('search', searchTerm);
      if (selectedDevice !== 'all')
        params.append('deviceModel', selectedDevice);
      if (selectedFault !== 'all') params.append('faultType', selectedFault);

      const response = await fetch(`/api/tutorials${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setTutorials(result.tutorials || []);
      } else {
        console.error('获取教程列表失败:', result.error);
      }
    } catch (error) {
      console.error('获取教程列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取唯一的设备型号和故障类型
  const uniqueDevices = [...new Set(mockTutorials.map(t => t.device_model))];
  const uniqueFaults = [...new Set(mockTutorials.map(t => t.fault_type))];

  useEffect(() => {
    fetchTutorials();
  }, [searchTerm, selectedDevice, selectedFault]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载教程中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                FixCycle DIY
              </Link>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </Link>
                <Link
                  href="/tutorials"
                  className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  教程中心
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">维修教程中心</h1>
          <p className="mt-2 text-gray-600">学习如何自己修理电子设备</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜索教程..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有设备</option>
              {uniqueDevices.map(device => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>

            <select
              value={selectedFault}
              onChange={e => setSelectedFault(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有故障</option>
              {uniqueFaults.map(fault => (
                <option key={fault} value={fault}>
                  {fault}
                </option>
              ))}
            </select>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              筛选
            </button>
          </div>
        </div>

        {/* 教程列表 */}
        {tutorials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              未找到相关教程
            </h3>
            <p className="mt-1 text-gray-500">尝试调整搜索条件或筛选选项</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map(tutorial => (
              <div
                key={tutorial.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {tutorial.cover_image && (
                  <img
                    src={tutorial.cover_image}
                    alt={tutorial.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tutorial.device_model}
                    </span>
                    <span className="text-sm text-gray-500">
                      {tutorial.view_count} 浏览
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {tutorial.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {tutorial.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {tutorial.estimated_time}分钟
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {tutorial.like_count}
                    </div>
                  </div>

                  <Link
                    href={`/tutorials/${tutorial.id}`}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-md transition-colors block"
                  >
                    查看教程
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 FixCycle. 所有权利保留。</p>
        </div>
      </footer>
    </div>
  );
}

// Mock数据用于演示
const mockTutorials: Tutorial[] = [
  {
    id: '1',
    device_model: 'iPhone 14 Pro',
    fault_type: 'screen_broken',
    title: 'iPhone 14 Pro 屏幕更换详细教程',
    description:
      '从拆机到安装的完整iPhone 14 Pro屏幕更换指南，包含所需工具和注意事项',
    steps: [],
    video_url: 'https://www.youtube.com/watchv=screen_repair_demo',
    tools: ['螺丝刀套装', '吸盘', '撬棒', '镊子', '热风枪'],
    parts: ['iPhone 14 Pro原装屏幕', '屏幕胶水'],
    cover_image: 'https://picsum.photos/400/200random=1',
    difficulty_level: 4,
    estimated_time: 60,
    view_count: 1250,
    like_count: 89,
    status: 'published',
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: '2',
    device_model: 'Samsung Galaxy S23',
    fault_type: 'battery_issue',
    title: '三星Galaxy S23 电池更换指南',
    description: '详细的三星Galaxy S23电池更换步骤，适合有一定动手能力的用户',
    steps: [],
    video_url: 'https://www.bilibili.com/video/BV123456789',
    tools: ['精密螺丝刀', '塑料撬棒', '热风枪', '吸盘'],
    parts: ['三星S23原装电池', '后盖胶水'],
    cover_image: 'https://picsum.photos/400/200random=2',
    difficulty_level: 3,
    estimated_time: 40,
    view_count: 890,
    like_count: 67,
    status: 'published',
    created_at: '2026-02-14T14:30:00Z',
  },
  {
    id: '3',
    device_model: 'Huawei Mate 50',
    fault_type: 'water_damage',
    title: '华为Mate 50 进水应急处理方案',
    description: '手机意外进水后的紧急处理步骤和专业维修建议',
    steps: [],
    video_url: null,
    tools: ['干净毛巾', '干燥剂', '吹风机(冷风)'],
    parts: [],
    cover_image: 'https://picsum.photos/400/200random=3',
    difficulty_level: 2,
    estimated_time: 30,
    view_count: 2100,
    like_count: 156,
    status: 'published',
    created_at: '2026-02-13T09:15:00Z',
  },
];
