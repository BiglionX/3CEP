import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 妫€鏌ヨ〃鏄惁瀛樺湪
    const { data: existingTables, error: tableError } = await supabase
      .from('qr_batches')
      .select('id')
      .limit(1);

    if (!tableError) {
      return NextResponse.json({
        success: true,
        message: '鏁版嵁搴撹〃宸插,
      });
    }

    // 鍒涘缓琛ㄧ粨    const createTablesSQL = `
      -- 鎵规涓昏〃
      CREATE TABLE IF NOT EXISTS qr_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id VARCHAR(100) UNIQUE NOT NULL,
        product_model VARCHAR(100) NOT NULL,
        product_category VARCHAR(50) NOT NULL,
        brand_id UUID,
        product_name VARCHAR(200) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        generated_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        config JSONB NOT NULL DEFAULT '{}',
        start_date DATE,
        end_date DATE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 浜岀淮鐮佽缁嗚褰曡〃
      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id VARCHAR(100) REFERENCES qr_batches(batch_id) ON DELETE CASCADE,
        product_id VARCHAR(100) NOT NULL,
        qr_content TEXT NOT NULL,
        qr_image_base64 TEXT,
        serial_number VARCHAR(20) NOT NULL,
        format VARCHAR(10) DEFAULT 'png',
        size INTEGER DEFAULT 300,
        is_active BOOLEAN DEFAULT true,
        scanned_count INTEGER DEFAULT 0,
        last_scanned_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 绱㈠紩
      CREATE INDEX IF NOT EXISTS idx_qr_batches_status ON qr_batches(status);
      CREATE INDEX IF NOT EXISTS idx_qr_batches_product_model ON qr_batches(product_model);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_product_id ON qr_codes(product_id);
    `;

    // 娉ㄦ剰锛歋upabase瀹㈡埛绔笉鑳界洿鎺ユ墽琛孌DL璇彞
    // 杩欓噷鍙槸绀烘剰锛屽疄闄呴渶瑕侀€氳繃Supabase鎺у埗鍙版垨psql鎵ц

    return NextResponse.json({
      success: true,
      message: '鏁版嵁搴撹〃鍒涘缓鎴愬姛锛堣氳繃Supabase鎺у埗鍙版墜鍔ㄦ墽琛孲QL,
      sql_script: createTablesSQL,
    });
  } catch (error) {
    console.error('鍒濆鍖栨暟鎹簱澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒濆鍖栧け },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 娴嬭瘯鏁版嵁搴撹繛    const { data, error } = await supabase
      .from('qr_batches')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST205') {
      // PGRST205琛ㄧず琛ㄤ笉瀛樺湪
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '鏁版嵁搴撹繛鎺ユ,
      table_exists: !error || error.code !== 'PGRST205',
    });
  } catch (error) {
    console.error('鏁版嵁搴撹繛鎺ユ祴璇曞け', error);
    return NextResponse.json(
      { success: false, error: '鏁版嵁搴撹繛鎺ュけ },
      { status: 500 }
    );
  }
}

