import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// 鑾峰彇璁惧鍜屾晠闅滈€夐」鏁版嵁
export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'devices' 'faults'
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
        data: data || [],
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
        data: data || [],
      });
    } else {
      return NextResponse.json(
        { success: false, error: '犳晥鐨勮姹傜被 },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('鑾峰彇夐」鏁版嵁澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇夐」鏁版嵁澶辫触' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );

