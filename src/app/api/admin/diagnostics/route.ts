import { NextResponse } from 'next/server';

// 妯℃嫙璇婃柇鏁版嵁
const mockDiagnostics = [
  {
    id: 'diag_001',
    device_id: 'dev_001',
    device_model: 'iPhone 14 Pro',
    diagnosis_type: '灞忓箷妫€,
    confidence_score: 0.95,
    findings: ['灞忓箷浜害寮傚父', '瑙︽懜鍝嶅簲寤惰繜'],
    recommendation: '寤鸿鏇存崲灞忓箷缁勪欢',
    status: 'completed',
    created_at: '2026-02-28T10:30:00Z',
    completed_at: '2026-02-28T10:45:00Z',
  },
  {
    id: 'diag_002',
    device_id: 'dev_002',
    device_model: 'Samsung Galaxy S23',
    diagnosis_type: '鐢垫睜鍋ュ悍',
    confidence_score: 0.87,
    findings: ['鐢垫睜瀹归噺涓嬮檷30%', '鍏呯數熷害鍙樻參'],
    recommendation: '寤鸿鏇存崲鐢垫睜',
    status: 'completed',
    created_at: '2026-02-28T09:15:00Z',
    completed_at: '2026-02-28T09:30:00Z',
  },
  {
    id: 'diag_003',
    device_id: 'dev_003',
    device_model: 'Huawei P50',
    diagnosis_type: '鎽勫儚澶存晠,
    confidence_score: 0.92,
    findings: ['鍚庣疆鎽勫儚澶存棤娉曞, '鐓х墖妯＄硦'],
    recommendation: '寤鸿缁翠慨鎽勫儚澶存ā,
    status: 'in_progress',
    created_at: '2026-02-28T11:20:00Z',
    completed_at: null,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // 杩囨护鏁版嵁
    let filteredData = [...mockDiagnostics];

    if (search) {
      filteredData = filteredData.filter(
        diag =>
          diag.device_model.toLowerCase().includes(search.toLowerCase()) ||
          diag.diagnosis_type.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status && status !== 'all') {
      filteredData = filteredData.filter(diag => diag.status === status);
    }

    // 鍒嗛〉
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / pageSize),
      },
    });
  } catch (error) {
    console.error('鑾峰彇璇婃柇璁板綍澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇璇婃柇璁板綍澶辫触' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 鍒涘缓鏂扮殑璇婃柇璁板綍
    const newDiagnosis = {
      id: `diag_${Date.now()}`,
      ...body,
      status: 'pending',
      created_at: new Date().toISOString(),
      completed_at: null,
    };

    // 鍦ㄥ疄闄呭簲鐢ㄤ腑杩欓噷搴旇淇濆鍒版暟鎹簱
    mockDiagnostics.unshift(newDiagnosis);

    return NextResponse.json({
      success: true,
      data: newDiagnosis,
    });
  } catch (error) {
    console.error('鍒涘缓璇婃柇璁板綍澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓璇婃柇璁板綍澶辫触' },
      { status: 500 }
    );
  }
}

