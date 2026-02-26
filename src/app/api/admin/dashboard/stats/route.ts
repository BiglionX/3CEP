import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // 创建Supabase客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // 开发环境临时绕过认证检查
  if (process.env.NODE_ENV === 'development') {
    console.log('开发环境: 绕过认证检查')
  }
  
  try {
    // 获取今天的开始和结束时间
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString()
    
    // 获取本周的开始和结束时间
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
    // 获取近7天的时间范围
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // 1. 今日新增热点链接数
    const { count: todayHotLinks } = await supabase
      .from('unified_link_library')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)
    
    // 2. 待审核链接数
    const { count: pendingLinks } = await supabase
      .from('unified_link_library')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')
    
    // 3. 本周新增文章数
    const { count: weekArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
    
    // 4. 总注册工程师数
    const { count: totalEngineers } = await supabase
      .from('user_profiles_ext')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'engineer')
    
    // 5. 总店铺数
    const { count: totalShops } = await supabase
      .from('repair_shops')
      .select('*', { count: 'exact', head: true })
    
    // 6. 近7天预约量趋势数据
    const { data: appointmentTrends } = await supabase
      .from('appointments')
      .select('created_at, status')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })
    
    // 处理趋势数据，按日期分组统计
    const trendData = processTrendData(appointmentTrends || [])
    
    const stats = {
      todayHotLinks: todayHotLinks || 0,
      pendingLinks: pendingLinks || 0,
      weekArticles: weekArticles || 0,
      totalEngineers: totalEngineers || 0,
      totalShops: totalShops || 0,
      appointmentTrends: trendData
    }
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    })
    
  } catch (error) {
    console.error('获取运营数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取运营数据失败' },
      { status: 500 }
    )
  }
}

// 处理预约趋势数据
function processTrendData(appointments: any[]) {
  const trendMap = new Map()
  
  // 初始化近7天的数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    trendMap.set(dateKey, {
      date: dateKey,
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0
    })
  }
  
  // 统计实际数据
  appointments.forEach(appointment => {
    const dateKey = appointment.created_at.split('T')[0]
    if (trendMap.has(dateKey)) {
      const dayData = trendMap.get(dateKey)
      dayData.total += 1
      if (appointment.status === 'confirmed') {
        dayData.confirmed += 1
      } else if (appointment.status === 'pending') {
        dayData.pending += 1
      } else if (appointment.status === 'cancelled') {
        dayData.cancelled += 1
      }
    }
  })
  
  return Array.from(trendMap.values()).sort((a, b) => 
    a.date.localeCompare(b.date)
  )
}