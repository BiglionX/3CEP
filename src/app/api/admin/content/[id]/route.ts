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
    title: '2024年数码产品维修行业趋势分析',
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
    title: '最新iPhone维修政策解读',
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const contentId = params.id;
    const body = await request.json();

    // 查找内容
    const contentIndex = mockContents.findIndex(
      content => content.id === contentId
    );

    if (contentIndex === -1) {
      return NextResponse.json(
        { success: false, error: '内容不存在' },
        { status: 404 }
      );
    }

    // 更新内容信息
    const updatedContent = {
      ...mockContents[contentIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };

    mockContents[contentIndex] = updatedContent;

    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: '内容更新成功',
    });
  } catch (error) {
    console.error('更新内容失败:', error);
    return NextResponse.json(
      { success: false, error: '更新内容失败' },
      { status: 500 }
    );
  }

    },
    'content_read'
  );

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const contentId = params.id;

    // 查找内容
    const contentIndex = mockContents.findIndex(
      content => content.id === contentId
    );

    if (contentIndex === -1) {
      return NextResponse.json(
        { success: false, error: '内容不存在' },
        { status: 404 }
      );
    }

    // 删除内容
    mockContents.splice(contentIndex, 1);

    return NextResponse.json({
      success: true,
      message: '内容删除成功',
    });
  } catch (error) {
    console.error('删除内容失败:', error);
    return NextResponse.json(
      { success: false, error: '删除内容失败' },
      { status: 500 }
    );
  }

    },
    'content_read'
  );

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const contentId = params.id;

    // 查找内容
    const content = mockContents.find(c => c.id === contentId);

    if (!content) {
      return NextResponse.json(
        { success: false, error: '内容不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('获取内容详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取内容详情失败' },
      { status: 500 }
    );
  }

    },
    'content_read'
  );
