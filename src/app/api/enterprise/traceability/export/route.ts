import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 导出溯源码数据
export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const format = searchParams.get('format') || 'csv'; // csv, json, excel

    // 获取企业信息
    const { data: enterprise } = await supabase
      .from('enterprise_users')
      .select('id, enterprise_name')
      .eq('user_id', user.id)
      .single();

    if (!enterprise) {
      return NextResponse.json({ error: '企业信息不存在' }, { status: 404 });
    }

    // 构建查询
    let query = supabase
      .from('enterprise_qr_codes')
      .select('id, batch_id, product_id, internal_code, serial_number, qr_content, is_active, scanned_count, last_scanned_at, first_scan_region, last_scan_region, created_at')
      .eq('enterprise_id', enterprise.id);

    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    const { data: codes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    if (!codes || codes.length === 0) {
      return NextResponse.json({ error: '暂无数据' }, { status: 404 });
    }

    // 格式化数据
    const formattedData = codes.map(code => ({
      '批次ID': code.batch_id,
      '产品ID': code.product_id,
      '企业内部编码': code.internal_code,
      '序列号': code.serial_number || '',
      '溯源码内容': code.qr_content,
      '是否激活': code.is_active ? '是' : '否',
      '扫描次数': code.scanned_count,
      '首次扫描区域': code.first_scan_region || '',
      '最后扫描区域': code.last_scan_region || '',
      '首次扫描时间': code.last_scanned_at || '',
      '创建时间': code.created_at
    }));

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        enterpriseName: enterprise.enterprise_name,
        exportDate: new Date().toISOString(),
        totalCount: codes.length,
        data: formattedData
      });
    }

    // CSV 格式
    if (formattedData.length > 0) {
      const headers = Object.keys(formattedData[0]);
      const csvRows = [
        headers.join(','),
        ...formattedData.map(row =>
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // 处理包含逗号的字段
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="溯源码_${enterprise.enterprise_name}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error exporting traceability codes:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
