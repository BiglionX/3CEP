import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  // 寮€鍙戠幆澧冧复鏃剁粫杩囪璇佹?  if (process.env.NODE_ENV === 'development') {
    console.log('寮€鍙戠幆? 缁曡繃璁よ瘉妫€?);
  }

  try {
    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'daily_report';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let csvData = '';
    let filename = '';

    switch (type) {
      case 'daily_report':
        csvData = await generateDailyReport(supabase, startDate, endDate);
        filename = `杩愯惀鏃ユ姤_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'hot_links':
        csvData = await generateHotLinksReport(supabase, startDate, endDate);
        filename = `鐑偣閾炬帴鎶ヨ〃_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'appointments':
        csvData = await generateAppointmentsReport(
          supabase,
          startDate,
          endDate
        );
        filename = `棰勭害鎶ヨ〃_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: '涓嶆敮鎸佺殑鎶ヨ〃绫诲瀷' },
          { status: 400 }
        );
    }

    // 璁剧疆鍝嶅簲?    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    // 浣跨敤encodeURI澶勭悊涓枃鏂囦欢?    const encodedFilename = encodeURIComponent(filename);
    headers.set(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodedFilename}`
    );

    return new NextResponse(csvData, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('鐢熸垚CSV鎶ヨ〃澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鐢熸垚CSV鎶ヨ〃澶辫触' },
      { status: 500 }
    );
  }
}

// 鐢熸垚鏃ユ姤鏁版嵁
async function generateDailyReport(
  supabase: any,
  startDate?: string | null,
  endDate?: string | null
) {
  // 璁剧疆榛樿鏃堕棿鑼冨洿锛堟渶?澶╋級
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 鑾峰彇鍚勮〃鐨勭粺璁℃暟?  const [hotLinksData, articlesData, appointmentsData, shopsData] =
    await Promise.all([
      supabase
        .from('unified_link_library')
        .select('created_at, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      supabase
        .from('articles')
        .select('created_at, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      supabase
        .from('appointments')
        .select('created_at, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      supabase
        .from('repair_shops')
        .select('created_at, status')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
    ]);

  // 澶勭悊鏁版嵁骞剁敓鎴怌SV
  const rows = [];
  rows.push([
    '鏃ユ湡',
    '鏂板鐑偣閾炬帴',
    '鏂板鏂囩珷',
    '鏂板棰勭害',
    '鏂板搴楅摵',
    '寰呭鏍搁摼?,
  ]);

  // 鎸夋棩鏈熷垎缁勭粺?  const dateMap = new Map();

  // 鍒濆鍖栨棩鏈熻寖鍥村唴鐨勬墍鏈夋棩?  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = new Date(d).toISOString().split('T')[0];
    dateMap.set(dateKey, {
      date: dateKey,
      hotLinks: 0,
      articles: 0,
      appointments: 0,
      shops: 0,
      pendingLinks: 0,
    });
  }

  // 缁熻鐑偣閾炬帴
  hotLinksData?.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      const dayData = dateMap.get(dateKey);
      dayData.hotLinks += 1;
      if (item.status === 'pending_review') {
        dayData.pendingLinks += 1;
      }
    }
  });

  // 缁熻鏂囩珷
  articlesData?.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey).articles += 1;
    }
  });

  // 缁熻棰勭害
  appointmentsData?.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey).appointments += 1;
    }
  });

  // 缁熻搴楅摵
  shopsData?.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey).shops += 1;
    }
  });

  // 鐢熸垚CSV锟?  Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(dayData => {
      rows.push([
        dayData.date,
        dayData.hotLinks.toString(),
        dayData.articles.toString(),
        dayData.appointments.toString(),
        dayData.shops.toString(),
        dayData.pendingLinks.toString(),
      ]);
    });

  return rows.map(row => row.join(',')).join('\n');
}

// 鐢熸垚鐑偣閾炬帴璇︾粏鎶ヨ〃
async function generateHotLinksReport(
  supabase: any,
  startDate?: string | null,
  endDate?: string | null
) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from('unified_link_library')
    .select('title, url, source, category, likes, views, status, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false });

  const rows = [];
  rows.push([
    '鏍囬',
    '閾炬帴',
    '鏉ユ簮',
    '鍒嗙被',
    '鐐硅禐?,
    '娴忚?,
    '鐘?,
    '鍒涘缓鏃堕棿',
  ]);

  data?.forEach((item: any) => {
    rows.push([
      `"${item.title || ''}"`,
      item.url || '',
      item.source || '',
      item.category || '',
      (item.likes || 0).toString(),
      (item.views || 0).toString(),
      item.status || '',
      item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
    ]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

// 鐢熸垚棰勭害璇︾粏鎶ヨ〃
async function generateAppointmentsReport(
  supabase: any,
  startDate?: string | null,
  endDate?: string | null
) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from('appointments')
    .select('start_time, end_time, status, notes, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false });

  const rows = [];
  rows.push(['寮€濮嬫椂?, '缁撴潫鏃堕棿', '鐘?, '澶囨敞', '鍒涘缓鏃堕棿']);

  data?.forEach((item: any) => {
    rows.push([
      item.start_time ? new Date(item.start_time).toLocaleString() : '',
      item.end_time ? new Date(item.end_time).toLocaleString() : '',
      item.status || '',
      `"${item.notes || ''}"`,
      item.created_at ? new Date(item.created_at).toLocaleString() : '',
    ]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

