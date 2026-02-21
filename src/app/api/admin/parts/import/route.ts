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
        { success: false, error: '请选择要上传的Excel文件' },
        { status: 400 }
      );
    }
    
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '只支持Excel文件(.xlsx, .xls)和CSV文件' },
        { status: 400 }
      );
    }
    
    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 解析Excel文件
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel文件为空' },
        { status: 400 }
      );
    }
    
    // 验证必需字段
    const requiredFields = ['name', 'category'];
    const firstRow = jsonData[0] as Record<string, any>;
    const missingFields = requiredFields.filter(field => !(field in firstRow));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `缺少必需字段: ${missingFields.join(', ')}`,
          required_fields: requiredFields
        },
        { status: 400 }
      );
    }
    
    // 处理数据并批量插入
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      insertedIds: [] as string[]
    };
    
    // 获取现有的设备和故障数据用于关联
    const { data: devices } = await supabase
      .from('devices')
      .select('id, brand, model')
      .eq('status', 'active');
    
    const { data: faults } = await supabase
      .from('fault_types')
      .select('id, name, category')
      .eq('status', 'active');
    
    // 批量处理数据
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as Record<string, any>;
        
        // 准备配件数据
        const partData = {
          name: String(row.name || '').trim(),
          category: String(row.category || '').trim(),
          brand: row.brand ? String(row.brand).trim() : null,
          model: row.model ? String(row.model).trim() : null,
          part_number: row.part_number ? String(row.part_number).trim() : null,
          unit: row.unit ? String(row.unit).trim() : '个',
          description: row.description ? String(row.description).trim() : null,
          stock_quantity: parseInt(row.stock_quantity) || 0,
          min_stock: parseInt(row.min_stock) || 0,
          max_stock: parseInt(row.max_stock) || 1000,
          status: 'active'
        };
        
        // 插入配件
        const { data: partResult, error: partError } = await supabase
          .from('parts')
          .insert(partData)
          .select()
          .single();
        
        if (partError) throw new Error(partError.message);
        
        const partId = partResult.id;
        results.insertedIds.push(partId);
        results.success++;
        
        // 处理设备关联（如果提供了设备信息）
        if (row.compatible_devices) {
          const deviceNames = String(row.compatible_devices).split(',').map((d: string) => d.trim());
          const deviceIds = devices?.filter(d => 
            deviceNames.some((name: string) => 
              d.brand.includes(name) || d.model.includes(name)
            )
          ).map(d => d.id) || [];
          
          if (deviceIds.length > 0) {
            const deviceRelations = deviceIds.map(deviceId => ({
              part_id: partId,
              device_id: deviceId,
              compatibility_notes: ''
            }));
            
            await supabase.from('part_devices').insert(deviceRelations);
          }
        }
        
        // 处理故障关联（如果提供了故障信息）
        if (row.related_faults) {
          const faultNames = String(row.related_faults).split(',').map((f: string) => f.trim());
          const faultIds = faults?.filter(f => 
            faultNames.some((name: string) => 
              f.name.includes(name) || f.category.includes(name)
            )
          ).map(f => f.id) || [];
          
          if (faultIds.length > 0) {
            const faultRelations = faultIds.map(faultId => ({
              part_id: partId,
              fault_id: faultId,
              usage_notes: ''
            }));
            
            await supabase.from('part_faults').insert(faultRelations);
          }
        }
        
      } catch (error) {
        results.failed++;
        results.errors.push(`第${i + 1}行: ${(error as Error).message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        total: jsonData.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
        insertedIds: results.insertedIds
      },
      message: `批量导入完成：成功${results.success}条，失败${results.failed}条`
    });
    
  } catch (error) {
    console.error('批量导入失败:', error);
    return NextResponse.json(
      { success: false, error: '批量导入失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// 提供Excel模板下载
export async function GET() {
  try {
    // 创建模板数据
    const templateData = [
      {
        name: '示例配件名称',
        category: '屏幕',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        part_number: 'IPH15PRO-SCR-001',
        unit: '个',
        description: '配件详细描述',
        stock_quantity: 100,
        min_stock: 10,
        max_stock: 1000,
        compatible_devices: 'iPhone 15 Pro,iPhone 15 Pro Max',
        related_faults: '屏幕碎裂,屏幕显示异常'
      }
    ];
    
    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '配件数据');
    
    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="配件导入模板.xlsx"'
      }
    });
    
  } catch (error) {
    console.error('生成模板失败:', error);
    return NextResponse.json(
      { success: false, error: '生成模板失败' },
      { status: 500 }
    );
  }
}