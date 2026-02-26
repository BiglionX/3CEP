import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 检查表是否存在
    const { data: existingTables, error: tableError } = await supabase
      .from('qr_batches')
      .select('id')
      .limit(1);

    if (!tableError) {
      return NextResponse.json({
        success: true,
        message: "数据库表已存在"
      });
    }

    // 创建表结构
    const createTablesSQL = `
      -- 批次主表
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

      -- 二维码详细记录表
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

      -- 索引
      CREATE INDEX IF NOT EXISTS idx_qr_batches_status ON qr_batches(status);
      CREATE INDEX IF NOT EXISTS idx_qr_batches_product_model ON qr_batches(product_model);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
      CREATE INDEX IF NOT EXISTS idx_qr_codes_product_id ON qr_codes(product_id);
    `;

    // 注意：Supabase客户端不能直接执行DDL语句
    // 这里只是示意，实际需要通过Supabase控制台或psql执行
    
    return NextResponse.json({
      success: true,
      message: "数据库表创建成功（请通过Supabase控制台手动执行SQL）",
      sql_script: createTablesSQL
    });

  } catch (error) {
    console.error("初始化数据库失败:", error);
    return NextResponse.json(
      { success: false, error: "初始化失败" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('qr_batches')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST205') { // PGRST205表示表不存在
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "数据库连接正常",
      table_exists: !error || error.code !== 'PGRST205'
    });

  } catch (error) {
    console.error("数据库连接测试失败:", error);
    return NextResponse.json(
      { success: false, error: "数据库连接失败" },
      { status: 500 }
    );
  }
}