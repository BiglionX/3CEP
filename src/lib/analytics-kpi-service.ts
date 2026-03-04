import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
} from 'lucide-react';

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'business' | 'technical' | 'user' | 'financial';
}

interface KPICategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  kpis: KPI[];
}

export class AnalyticsKPIService {
  private kpis: KPI[] = [];
  private categories: KPICategory[] = [];

  constructor() {
    this.initializeKPIs();
    this.initializeCategories();
  }

  private initializeKPIs(): void {
    this.kpis = [
      // 业务指标
      {
        id: 'kpi-001',
        name: '月度活跃用户',
        value: 85420,
        target: 100000,
        unit: '�?,
        trend: 'up',
        change: 12.5,
        category: 'business',
      },
      {
        id: 'kpi-002',
        name: '转化?,
        value: 23.8,
        target: 25,
        unit: '%',
        trend: 'up',
        change: 3.2,
        category: 'business',
      },
      {
        id: 'kpi-003',
        name: '月度收入',
        value: 1850000,
        target: 2000000,
        unit: '�?,
        trend: 'up',
        change: 8.7,
        category: 'business',
      },
      // 技术指?      {
        id: 'kpi-004',
        name: '系统可用?,
        value: 99.8,
        target: 99.9,
        unit: '%',
        trend: 'stable',
        change: 0.1,
        category: 'technical',
      },
      {
        id: 'kpi-005',
        name: 'API响应时间',
        value: 142,
        target: 200,
        unit: 'ms',
        trend: 'down',
        change: -15.3,
        category: 'technical',
      },
      {
        id: 'kpi-006',
        name: '错误?,
        value: 0.3,
        target: 0.5,
        unit: '%',
        trend: 'down',
        change: -25.0,
        category: 'technical',
      },
      // 用户体验指标
      {
        id: 'kpi-007',
        name: '用户满意?,
        value: 4.6,
        target: 4.8,
        unit: '�?,
        trend: 'up',
        change: 4.3,
        category: 'user',
      },
      {
        id: 'kpi-008',
        name: '功能使用?,
        value: 78.5,
        target: 85,
        unit: '%',
        trend: 'up',
        change: 7.6,
        category: 'user',
      },
      // 财务指标
      {
        id: 'kpi-009',
        name: '获客成本',
        value: 185,
        target: 200,
        unit: '�?,
        trend: 'down',
        change: -8.0,
        category: 'financial',
      },
      {
        id: 'kpi-010',
        name: '客单?,
        value: 2180,
        target: 2500,
        unit: '�?,
        trend: 'up',
        change: 12.8,
        category: 'financial',
      },
    ];
  }

  private initializeCategories(): void {
    this.categories = [
      {
        id: 'business',
        name: '业务指标',
        icon: 'TrendingUp',
        color: 'blue',
        kpis: this.kpis.filter(kpi => kpi.category === 'business'),
      },
      {
        id: 'technical',
        name: '技术指?,
        icon: 'BarChart3',
        color: 'green',
        kpis: this.kpis.filter(kpi => kpi.category === 'technical'),
      },
      {
        id: 'user',
        name: '用户体验',
        icon: 'Users',
        color: 'purple',
        kpis: this.kpis.filter(kpi => kpi.category === 'user'),
      },
      {
        id: 'financial',
        name: '财务指标',
        icon: 'DollarSign',
        color: 'yellow',
        kpis: this.kpis.filter(kpi => kpi.category === 'financial'),
      },
    ];
  }

  getAllKPIs(): KPI[] {
    return [...this.kpis];
  }

  getKPIById(id: string): KPI | undefined {
    return this.kpis.find(kpi => kpi.id === id);
  }

  getKPIsByCategory(category: string): KPI[] {
    return this.kpis.filter(kpi => kpi.category === category);
  }

  getCategories(): KPICategory[] {
    return [...this.categories];
  }

  getCategoryById(id: string): KPICategory | undefined {
    return this.categories.find(category => category.id === id);
  }

  updateKPIValue(kpiId: string, newValue: number): boolean {
    const kpi = this.kpis.find(k => k.id === kpiId);
    if (kpi) {
      const oldValue = kpi.value;
      kpi.value = newValue;
      kpi.change = ((newValue - oldValue) / oldValue) * 100;
      kpi.trend =
        newValue > oldValue ? 'up' : newValue < oldValue ? 'down' : 'stable';
      return true;
    }
    return false;
  }

  getOverallPerformance(): {
    achieved: number;
    total: number;
    percentage: number;
  } {
    const achieved = this.kpis.filter(kpi => kpi.value >= kpi.target).length;
    const total = this.kpis.length;
    return {
      achieved,
      total,
      percentage: (achieved / total) * 100,
    };
  }

  getTrendSummary(): { up: number; down: number; stable: number } {
    return {
      up: this.kpis.filter(kpi => kpi.trend === 'up').length,
      down: this.kpis.filter(kpi => kpi.trend === 'down').length,
      stable: this.kpis.filter(kpi => kpi.trend === 'stable').length,
    };
  }
}

// 导出全局实例
export const analyticsKPIService = new AnalyticsKPIService();
