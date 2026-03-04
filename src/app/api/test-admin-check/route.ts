import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('馃攳 娴嬭瘯绠＄悊鍛樻潈闄怉PI璺敱...');

    // 浣跨敤宸茬煡鐨勭鐞嗗憳鐢ㄦ埛ID杩涜娴嬭瘯
    const testUserId = '6c83c463-bd84-4f3a-9e61-383b00bc3cfb';

    // 鎵ц绠＄悊鍛樻潈闄愭?    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('user_id', testUserId)
      .eq('is_active', true)
      .single();

    const isAdmin = !error && data !== null;

    console.log('API娴嬭瘯缁撴灉:');
    console.log('User ID:', testUserId);
    console.log('Is Admin:', isAdmin);
    console.log('Data:', data);
    console.log('Error:', error);

    return NextResponse.json({
      success: true,
      isAdmin: isAdmin,
      userId: testUserId,
      data: data,
      error: error?.message || null,
    });
  } catch (error: any) {
    console.error('API娴嬭瘯澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

