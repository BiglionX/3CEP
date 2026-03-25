import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 从 data_assets 表获取真实数据
    const { data: assets, error } = await supabase
      .from('data_assets')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 转换数据格式以匹配前端接口
    const formattedAssets =
      assets?.map(asset => ({
        id: asset.id,
        name: asset.name,
        displayName: asset.display_name || asset.name,
        description: asset.description || '',
        type: asset.asset_type as 'table' | 'view' | 'api' | 'file' | 'stream',
        category: asset.category || '',
        owner: asset.technical_owner || '',
        department: asset.department || '',
        tags: asset.tags || [],
        businessTags: asset.business_tags || [],
        technicalTags: asset.technical_tags || [],
        dataSize: asset.size_bytes || 0,
        rowCount: asset.record_count || 0,
        lastModified: asset.updated_at || asset.created_at,
        createdDate: asset.created_at,
        businessOwner: asset.business_owner || '',
        dataSteward: asset.data_steward || '',
        sensitivityLevel: asset.sensitivity_level as
          | 'public'
          | 'internal'
          | 'confidential'
          | 'restricted',
        qualityScore: Number(asset.quality_score) || 0,
        lastQualityCheck: asset.last_quality_check_at || '',
        qualityIssues: [],
      })) || [];

    // 获取统计数据
    const stats = {
      totalAssets: formattedAssets.length,
      assetsByType: formattedAssets.reduce(
        (acc, asset) => {
          acc[asset.type] = (acc[asset.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      assetsByCategory: formattedAssets.reduce(
        (acc, asset) => {
          acc[asset.category] = (acc[asset.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      averageQualityScore:
        formattedAssets.length > 0
          ? formattedAssets.reduce(
              (sum, asset) => sum + (asset.qualityScore || 0),
              0
            ) / formattedAssets.length
          : 0,
      assetsBySensitivity: formattedAssets.reduce(
        (acc, asset) => {
          acc[asset.sensitivityLevel] = (acc[asset.sensitivityLevel] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentUpdates: formattedAssets.filter(asset => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return new Date(asset.lastModified) > threeDaysAgo;
      }).length,
      qualityIssuesCount: 0, // 可以从 data_quality_rules 表获取
    };

    return NextResponse.json({
      success: true,
      data: {
        assets: formattedAssets,
        statistics: stats,
      },
    });
  } catch (error: any) {
    console.error('加载元数据失败:', error);

    // 如果表不存在或为空，返回空结果而不是错误
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: {
          assets: [],
          statistics: {
            totalAssets: 0,
            assetsByType: {},
            assetsByCategory: {},
            averageQualityScore: 0,
            assetsBySensitivity: {},
            recentUpdates: 0,
            qualityIssuesCount: 0,
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
