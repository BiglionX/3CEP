import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// 获取设备和故障选项数据
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'devices' 或 'faults'
    const search = searchParams.get('search') || '';
    
    if (type === 'devices') {
      let query = supabase
        .from('devices')
        .select('id, brand, model, series, category')
        .eq('status', 'active');
      
      if (search) {
        query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('brand').order('model');
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        data: data || []
      });
      
    } else if (type === 'faults') {
      let query = supabase
        .from('fault_types')
        .select('id, name, category, sub_category, difficulty_level')
        .eq('status', 'active');
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
      }
      
      const { data, error } = await query.order('category').order('name');
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        data: data || []
      });
      
    } else {
      return NextResponse.json(
        { success: false, error: '无效的请求类型' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('获取选项数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取选项数据失败' },
      { status: 500 }
    );
  }
}