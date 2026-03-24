import { NextRequest, NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

// 模拟内容数据
const mockContents = [
  {
    id: 'content_001',
    title: '手机维修基础知识教程',
    type: 'tutorial',
    author: '技术部',
    status: 'published',
    category: '维修教程',
    tags: ['手机维修', '基础知识', 'DIY'],
    views: 1250,
    likes: 89,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-02-20T14:22:00Z',
    content: '本教程将为您详细介绍手机维修的基础知识...',
  },
  {
    id: 'content_002',
    title: '2024 年数码产品维修行业趋势分析',
    type: 'article',
    author: '市场部',
    status: 'published',
    category: '行业分析',
    tags: ['行业趋势', '市场分析', '2024'],
    views: 890,
    likes: 67,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-02-18T16:45:00Z',
    content: '随着科技的发展，数码产品维修行业正面临新的机遇和挑战...',
  },
  {
    id: 'content_003',
    title: '常见手机故障排查指南',
    type: 'faq',
    author: '客服部',
    status: 'draft',
    category: '故障排除',
    tags: ['故障排查', '手机问题', '自助维修'],
    views: 0,
    likes: 0,
    created_at: '2024-02-01T11:20:00Z',
    updated_at: '2024-02-25T09:30:00Z',
    content: 'Q: 手机无法开机怎么办？\nA: 请先检查电池电量...',
  },
  {
    id: 'content_004',
    title: '最新 iPhone 维修政策解读',
    type: 'news',
    author: '法务部',
    status: 'published',
    category: '政策法规',
    tags: ['苹果', '维修政策', '法律解读'],
    views: 2100,
    likes: 156,
    created_at: '2024-01-10T08:45:00Z',
    updated_at: '2024-02-22T13:15:00Z',
    content: '苹果公司近期发布了新的维修政策，对消费者和维修商都有重要影响...',
  },
  {
    id: 'content_005',
    title: '笔记本电脑屏幕更换教程',
    type: 'tutorial',
    author: '技术部',
    status: 'archived',
    category: '维修教程',
    tags: ['笔记本', '屏幕更换', '硬件维修'],
    views: 650,
    likes: 42,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-28T11:20:00Z',
    content: '本教程将指导您如何安全地更换笔记本电脑屏幕...',
  },
];

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    // 过滤数据
    let filteredContents = [...mockContents];

    // 搜索过滤
    if (search) {
      filteredContents = filteredContents.filter(
        content =>
          content.title.toLowerCase().includes(search.toLowerCase()) ||
          content.author.toLowerCase().includes(search.toLowerCase()) ||
          content.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 类型过滤
    if (type && type !== 'all') {
      filteredContents = filteredContents.filter(
        content => content.type === type
      );
    }

    // 状态过滤
    if (status && status !== 'all') {
      filteredContents = filteredContents.filter(
        content => content.status === status
      );
    }

    // 分页
    const total = filteredContents.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContents = filteredContents.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedContents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('获取内容列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取内容列表失败',
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      },
      { status: 500 }
    );
  }

    },
    'content_read'
  );

export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const body = await request.json();

    // 生成新 ID
    const newId = `content_${String(mockContents.length + 1).padStart(3, '0')}`;

    // 创建新内容
    const newContent = {
      id: newId,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      likes: 0,
    };

    mockContents.push(newContent);

    return NextResponse.json({
      success: true,
      data: newContent,
      message: '内容创建成功',
    });
  } catch (error) {
    console.error('创建内容失败:', error);
    return NextResponse.json(
      { success: false, error: '创建内容失败' },
      { status: 500 }
    );
  }

    },
    'content_read'
  );
