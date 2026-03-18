import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库存储
interface CodeSegment {
  id: string;
  name: string;
  startCode: string;
  endCode: string;
  totalCount: number;
  usedCount: number;
  status: 'available' | 'allocated' | 'exhausted';
  merchantId?: string;
  merchantName?: string;
  createdAt: string;
  allocatedAt?: string;
  price: number;
}

let codeSegments: CodeSegment[] = [
  {
    id: '1',
    name: '基础防伪码段-A',
    startCode: 'BC00001',
    endCode: 'BC10000',
    totalCount: 10000,
    usedCount: 3520,
    status: 'allocated',
    merchantId: 'm001',
    merchantName: '测试商户A',
    createdAt: '2024-01-15T10:00:00Z',
    allocatedAt: '2024-01-20T14:30:00Z',
    price: 0.1,
  },
  {
    id: '2',
    name: '高级防伪码段-B',
    startCode: 'BC10001',
    endCode: 'BC20000',
    totalCount: 10000,
    usedCount: 0,
    status: 'available',
    createdAt: '2024-02-01T10:00:00Z',
    price: 0.15,
  },
  {
    id: '3',
    name: '至尊防伪码段-C',
    startCode: 'BC20001',
    endCode: 'BC25000',
    totalCount: 5000,
    usedCount: 5000,
    status: 'exhausted',
    merchantId: 'm002',
    merchantName: '测试商户B',
    createdAt: '2024-02-10T10:00:00Z',
    allocatedAt: '2024-02-15T09:00:00Z',
    price: 0.2,
  },
];

// GET 获取码段列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const merchantId = searchParams.get('merchantId');

    let filteredSegments = [...codeSegments];

    if (status && status !== 'all') {
      filteredSegments = filteredSegments.filter(s => s.status === status);
    }

    if (merchantId) {
      filteredSegments = filteredSegments.filter(s => s.merchantId === merchantId);
    }

    // 统计信息
    const stats = {
      totalSegments: codeSegments.length,
      totalCodes: codeSegments.reduce((sum, s) => sum + s.totalCount, 0),
      usedCodes: codeSegments.reduce((sum, s) => sum + s.usedCount, 0),
      availableCodes: codeSegments.reduce((sum, s) => sum + (s.totalCount - s.usedCount), 0),
      totalMerchants: new Set(codeSegments.filter(s => s.merchantId).map(s => s.merchantId)).size,
    };

    return NextResponse.json({
      success: true,
      data: filteredSegments,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch code segments' },
      { status: 500 }
    );
  }
}

// POST 创建新码段
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startCode, endCode, price } = body;

    if (!name || !startCode || !endCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 计算数量
    const totalCount = parseInt(endCode) - parseInt(startCode) + 1;

    const newSegment: CodeSegment = {
      id: String(codeSegments.length + 1),
      name,
      startCode,
      endCode,
      totalCount,
      usedCount: 0,
      status: 'available',
      createdAt: new Date().toISOString(),
      price: price || 0.1,
    };

    codeSegments.push(newSegment);

    return NextResponse.json({
      success: true,
      data: newSegment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create code segment' },
      { status: 500 }
    );
  }
}

// PUT 更新码段（分配/回收）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, merchantId, merchantName } = body;

    const segmentIndex = codeSegments.findIndex(s => s.id === id);
    if (segmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Code segment not found' },
        { status: 404 }
      );
    }

    const segment = codeSegments[segmentIndex];

    if (action === 'allocate') {
      // 分配码段
      if (segment.status !== 'available') {
        return NextResponse.json(
          { success: false, error: 'Segment is not available' },
          { status: 400 }
        );
      }

      codeSegments[segmentIndex] = {
        ...segment,
        status: 'allocated',
        merchantId,
        merchantName,
        allocatedAt: new Date().toISOString(),
      };
    } else if (action === 'recycle') {
      // 回收码段
      if (segment.usedCount > 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot recycle segment with used codes' },
          { status: 400 }
        );
      }

      codeSegments[segmentIndex] = {
        ...segment,
        status: 'available',
        merchantId: undefined,
        merchantName: undefined,
        allocatedAt: undefined,
      };
    }

    return NextResponse.json({
      success: true,
      data: codeSegments[segmentIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update code segment' },
      { status: 500 }
    );
  }
}

// DELETE 删除码段
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing segment ID' },
        { status: 400 }
      );
    }

    const segmentIndex = codeSegments.findIndex(s => s.id === id);
    if (segmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Code segment not found' },
        { status: 404 }
      );
    }

    if (codeSegments[segmentIndex].usedCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete segment with used codes' },
        { status: 400 }
      );
    }

    codeSegments.splice(segmentIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete code segment' },
      { status: 500 }
    );
  }
}
