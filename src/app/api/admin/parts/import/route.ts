import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '璇烽€夋嫨瑕佷笂犵殑Excel鏂囦欢' },
        { status: 400 }
      );
    }

    // 楠岃瘉鏂囦欢绫诲瀷
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '鍙敮鎸丒xcel鏂囦欢(.xlsx, .xls)鍜孋SV鏂囦欢' },
        { status: 400 }
      );
    }

    // 璇诲彇鏂囦欢鍐呭
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 瑙ｆ瀽Excel鏂囦欢
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel鏂囦欢涓虹┖' },
        { status: 400 }
      );
    }

    // 楠岃瘉蹇呴渶瀛楁
    const requiredFields = ['name', 'category'];
    const firstRow = jsonData[0] as Record<string, any>;
    const missingFields = requiredFields.filter(field => !(field in firstRow));

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `缂哄皯蹇呴渶瀛楁: ${missingFields.join(', ')}`,
          required_fields: requiredFields,
        },
        { status: 400 }
      );
    }

    // 澶勭悊鏁版嵁骞舵壒閲忔彃    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      insertedIds: [] as string[],
    };

    // 鑾峰彇鐜版湁鐨勮澶囧拰鏁呴殰鏁版嵁鐢ㄤ簬鍏宠仈
    const { data: devices } = await supabase
      .from('devices')
      .select('id, brand, model')
      .eq('status', 'active');

    const { data: faults } = await supabase
      .from('fault_types')
      .select('id, name, category')
      .eq('status', 'active');

    // 鎵归噺澶勭悊鏁版嵁
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as Record<string, any>;

        // 鍑嗗閰嶄欢鏁版嵁
        const partData = {
          name: String(row.name || '').trim(),
          category: String(row.category || '').trim(),
          brand: row.brand  String(row.brand).trim() : null,
          model: row.model  String(row.model).trim() : null,
          part_number: row.part_number  String(row.part_number).trim() : null,
          unit: row.unit  String(row.unit).trim() : ',
          description: row.description  String(row.description).trim() : null,
          stock_quantity: parseInt(row.stock_quantity) || 0,
          min_stock: parseInt(row.min_stock) || 0,
          max_stock: parseInt(row.max_stock) || 1000,
          status: 'active',
        };

        // 鎻掑叆閰嶄欢
        const { data: partResult, error: partError } = await supabase
          .from('parts')
          .insert(partData)
          .select()
          .single();

        if (partError) throw new Error(partError.message);

        const partId = partResult.id;
        results.insertedIds.push(partId);
        results.success++;

        // 澶勭悊璁惧鍏宠仈锛堝鏋滄彁渚涗簡璁惧淇℃伅        if (row.compatible_devices) {
          const deviceNames = String(row.compatible_devices)
            .split(',')
            .map((d: string) => d.trim());
          const deviceIds =
            devices
              .filter(d =>
                deviceNames.some(
                  (name: string) =>
                    d.brand.includes(name) || d.model.includes(name)
                )
              )
              .map(d => d.id) || [];

          if (deviceIds.length > 0) {
            const deviceRelations = deviceIds.map(deviceId => ({
              part_id: partId,
              device_id: deviceId,
              compatibility_notes: '',
            }));

            await supabase.from('part_devices').insert(deviceRelations);
          }
        }

        // 澶勭悊鏁呴殰鍏宠仈锛堝鏋滄彁渚涗簡鏁呴殰淇℃伅        if (row.related_faults) {
          const faultNames = String(row.related_faults)
            .split(',')
            .map((f: string) => f.trim());
          const faultIds =
            faults
              .filter(f =>
                faultNames.some(
                  (name: string) =>
                    f.name.includes(name) || f.category.includes(name)
                )
              )
              .map(f => f.id) || [];

          if (faultIds.length > 0) {
            const faultRelations = faultIds.map(faultId => ({
              part_id: partId,
              fault_id: faultId,
              usage_notes: '',
            }));

            await supabase.from('part_faults').insert(faultRelations);
          }
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`{i + 1} ${(error as Error).message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: jsonData.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
        insertedIds: results.insertedIds,
      },
      message: `鎵归噺瀵煎叆瀹屾垚锛氭垚{results.success}鏉★紝澶辫触${results.failed}鏉,
    });
  } catch (error) {
    console.error('鎵归噺瀵煎叆澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鎵归噺瀵煎叆澶辫触: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// 鎻愪緵Excel妯℃澘涓嬭浇
export async function GET() {
  try {
    // 鍒涘缓妯℃澘鏁版嵁
    const templateData = [
      {
        name: '绀轰緥閰嶄欢鍚嶇О',
        category: '灞忓箷',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        part_number: 'IPH15PRO-SCR-001',
        unit: ',
        description: '閰嶄欢璇︾粏鎻忚堪',
        stock_quantity: 100,
        min_stock: 10,
        max_stock: 1000,
        compatible_devices: 'iPhone 15 Pro,iPhone 15 Pro Max',
        related_faults: '灞忓箷纰庤,灞忓箷鏄剧ず寮傚父',
      },
    ];

    // 鍒涘缓宸ヤ綔    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '閰嶄欢鏁版嵁');

    // 鐢熸垚Excel鏂囦欢
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="閰嶄欢瀵煎叆妯℃澘.xlsx"',
      },
    });
  } catch (error) {
    console.error('鐢熸垚妯℃澘澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鐢熸垚妯℃澘澶辫触' },
      { status: 500 }
    );
  }
}

