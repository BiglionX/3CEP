import { Database } from '@/lib/database.types';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 开发环境临时绕过认证检查
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console -- 开发环境调试用
        console.log('开发环境:绕过认证检查');
      }

      try {
        // 获取查询参数
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'daily_report';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let csvData = '';
        let filename = '';

        switch (type) {
          case 'daily_report':
            csvData = await generateDailyReport(supabase, startDate, endDate);
            filename = `运营日报_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          case 'hot_links':
            csvData = await generateHotLinksReport(
              supabase,
              startDate,
              endDate
            );
            filename = `热点链接报表_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          case 'appointments':
            csvData = await generateAppointmentsReport(
              supabase,
              startDate,
              endDate
            );
            filename = `预约报表_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          default:
            return NextResponse.json(
              { success: false, error: '不支持的报表类型' },
              { status: 400 }
            );
        }

        // 设置响应头
        const headers = new Headers();
        headers.set('Content-Type', 'text/csv; charset=utf-8');
        // 使用 encodeURI 处理中文文件名
        const encodedFilename = encodeURIComponent(filename);
        headers.set(
          'Content-Disposition',
          `attachment; filename*=UTF-8''${encodedFilename}`
        );

        return new NextResponse(csvData, {
          status: 200,
          headers: headers,
        });
      } catch (error) {
        console.error('生成 CSV 报表失败:', error);
        return NextResponse.json(
          { success: false, error: '生成 CSV 报表失败' },
          { status: 500 }
        );
      }
    },
    'settings_read'
  );
}
// 生成日报数据
async function generateDailyReport(
  supabase: any,
  startDate: string | null,
  endDate: string | null
) {
  // 设置默认时间范围（最近 7 天）
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 获取各表的统计数据
  const [hotLinksData, articlesData, appointmentsData, shopsData] =
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

  // 处理数据并生成 CSV
  const rows = [];
  rows.push([
    '日期',
    '新增热点链接',
    '新增文章',
    '新增预约',
    '新增店铺',
    '待审核链接数',
  ]);

  // 按日期分组统计
  const dateMap = new Map();

  // 初始化日期范围内的所有日期
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
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

  // 统计热点链接
  hotLinksData.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      const dayData = dateMap.get(dateKey);
      dayData.hotLinks += 1;
      if (item.status === 'pending_review') {
        dayData.pendingLinks += 1;
      }
    }
  });

  // 统计文章
  articlesData.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey).articles += 1;
    }
  });

  // 统计预约
  appointmentsData.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey).appointments += 1;
    }
  });

  // 统计店铺
  shopsData.forEach((item: any) => {
    const dateKey = item.created_at.split('T')[0];
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey).shops += 1;
    }
  });

  // 生成 CSV
  Array.from(dateMap.values())
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

// 生成热点链接详细报表
async function generateHotLinksReport(
  supabase: any,
  startDate: string | null,
  endDate: string | null
) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data } = (await supabase
    .from('unified_link_library')
    .select('title, url, source, category, likes, views, status, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false })) as any;

  const rows = [];
  rows.push([
    '标题',
    '链接',
    '来源',
    '分类',
    '点赞数',
    '浏览数',
    '状态',
    '创建时间',
  ]);

  data.forEach((item: any) => {
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

// 生成预约详细报表
async function generateAppointmentsReport(
  supabase: any,
  startDate: string | null,
  endDate: string | null
) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data } = (await supabase
    .from('appointments')
    .select('start_time, end_time, status, notes, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false })) as any;

  const rows = [];
  rows.push(['开始时间', '结束时间', '状态', '备注', '创建时间']);

  data.forEach((item: any) => {
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
