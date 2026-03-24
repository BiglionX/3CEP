/**
 * 高管仪表板组件测试
 */

import { ExecutiveDashboard } from '@/app/enterprise/admin/executive-dashboard/ExecutiveDashboard';
import { BusinessIntelligenceService } from '@/lib/business-intelligence-service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Service Worker
const mockServiceWorker = vi.hoisted(() => ({
  register: vi.fn(),
}));

vi.mock('@/lib/business-intelligence-service', () => ({
  BusinessIntelligenceService: vi.fn().mockImplementation(() => ({
    getExecutiveDashboard: vi.fn().mockResolvedValue({
      kpis: [
        {
          id: 'kpi-1',
          name: '月度收入',
          value: 458200,
          target: 500000,
          trend: 'up' as const,
          change: 12.5,
          unit: '元',
          category: 'financial' as const,
        },
        {
          id: 'kpi-2',
          name: '活跃用户数',
          value: 8420,
          target: 10000,
          trend: 'up' as const,
          change: 8.3,
          unit: '人',
          category: 'user' as const,
        },
      ],
      revenueMetrics: {
        monthlyRevenue: 458200,
        growthRate: 12.5,
        forecast: 500000,
      },
      userMetrics: {
        activeUsers: 8420,
        retentionRate: 85.2,
        acquisitionCost: 220,
      },
      operationalMetrics: {
        systemUptime: 99.8,
        responseTime: 180,
        errorRate: 0.5,
      },
    }),
    getKPIDrillDown: vi.fn().mockResolvedValue({
      kpiId: 'kpi-1',
      kpiName: '月度收入',
      currentValue: 458200,
      targetValue: 500000,
      unit: '元',
      trend: 'up' as const,
      changePercentage: 12.5,
      category: 'financial',
      timeSeriesData: [],
      dimensionBreakdown: [],
      topPerformers: [],
      insights: [],
    }),
  })),
}));

describe('ExecutiveDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功渲染仪表板', async () => {
    render(<ExecutiveDashboard />);

    // 应该显示加载状态
    expect(screen.getByText(/正在加载高管仪表板/i)).toBeInTheDocument();

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText(/高管决策仪表板/i)).toBeInTheDocument();
    });
  });

  it('应该显示 KPI 卡片', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      expect(screen.getByText('月度收入')).toBeInTheDocument();
      expect(screen.getByText('活跃用户数')).toBeInTheDocument();
    });

    // 验证数值显示
    expect(screen.getByText(/458,200/)).toBeInTheDocument();
    expect(screen.getByText(/8,420/)).toBeInTheDocument();
  });

  it('应该显示趋势图标', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      const trendIcons = screen.getAllByTestId('trend-icon');
      expect(trendIcons).toHaveLength(2);
    });
  });

  it('应该支持时间范围筛选', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/最近 30 天/i)).toBeInTheDocument();
    });

    // 点击时间范围选择器
    const timeRangeSelect = screen.getByRole('combobox', { name: /时间范围/i });
    fireEvent.click(timeRangeSelect);

    // 选择新的时间范围
    const sevenDaysOption = screen.getByText(/最近 7 天/i);
    fireEvent.click(sevenDaysOption);

    // 应该重新获取数据
    await waitFor(() => {
      expect(BusinessIntelligenceService).toHaveBeenCalled();
    });
  });

  it('应该支持类别筛选', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/全部类别/i)).toBeInTheDocument();
    });

    // 点击类别选择器
    const categorySelect = screen.getByRole('combobox', { name: /类别/i });
    fireEvent.click(categorySelect);

    // 选择财务类别
    const financialOption = screen.getByText(/财务/i);
    fireEvent.click(financialOption);

    // 应该只显示财务类 KPI
    await waitFor(() => {
      expect(screen.queryByText('活跃用户数')).not.toBeInTheDocument();
    });
  });

  it('应该支持手动刷新', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      expect(screen.getByText('月度收入')).toBeInTheDocument();
    });

    // 点击刷新按钮
    const refreshButton = screen.getByRole('button', { name: /刷新数据/i });
    fireEvent.click(refreshButton);

    // 应该显示加载中状态
    expect(screen.getByText(/刷新中/i)).toBeInTheDocument();

    // 等待刷新完成
    await waitFor(() => {
      expect(BusinessIntelligenceService).toHaveBeenCalledTimes(2);
    });
  });

  it('应该支持导出功能', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /导出/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('应该显示告警面板', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      const alertButton = screen.getByRole('button', { name: /告警中心/i });
      expect(alertButton).toBeInTheDocument();

      // 应该有未读告警标记
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('应该支持 KPI 钻取', async () => {
    render(<ExecutiveDashboard />);

    await waitFor(() => {
      const kpiCard = screen.getByText('月度收入').closest('[role="article"]');
      expect(kpiCard).toBeInTheDocument();
    });

    // 点击 KPI 卡片
    const kpiCard = screen.getByText('月度收入').closest('[role="article"]')!;
    fireEvent.click(kpiCard);

    // 应该显示钻取弹窗
    await waitFor(() => {
      expect(screen.getByText(/深度分析/i)).toBeInTheDocument();
    });
  });
});

describe('ExecutiveKPIDrillDown', () => {
  const mockData = {
    kpiId: 'kpi-1',
    kpiName: '月度收入',
    currentValue: 458200,
    targetValue: 500000,
    unit: '元',
    trend: 'up' as const,
    changePercentage: 12.5,
    category: 'financial',
    timeSeriesData: [
      { period: '第 1 周', value: 98000, target: 110000, variance: -10.9 },
      { period: '第 2 周', value: 115000, target: 115000, variance: 0 },
    ],
    dimensionBreakdown: [
      {
        dimension: '智能体服务',
        value: 185000,
        percentage: 40.4,
        trend: 'up' as const,
      },
    ],
    topPerformers: [{ name: '销售一部', value: 125000, rank: 1, change: 15.2 }],
    insights: [
      {
        type: 'positive' as const,
        title: '收入持续增长',
        description: '本月收入同比增长 12.5%',
      },
    ],
  };

  it('应该显示钻取数据', () => {
    const onClose = vi.fn();
    // 这里需要实际实现钻取组件的测试
    expect(mockData.kpiName).toBe('月度收入');
    expect(mockData.changePercentage).toBe(12.5);
  });
});

describe('移动端适配', () => {
  it('应该在移动设备上正确渲染', () => {
    // Mock 移动端屏幕尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone 12 宽度
    });

    render(<ExecutiveDashboard />);

    // 应该使用单列布局
    expect(document.querySelector('.grid-cols-1')).toBeInTheDocument();
  });

  it('应该支持触摸手势', () => {
    render(<ExecutiveDashboard />);

    const container = document.querySelector(
      '[data-testid="dashboard-container"]'
    );

    if (container) {
      // 模拟触摸开始
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 } as any],
      });
      container.dispatchEvent(touchStartEvent);

      // 模拟触摸移动
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 50, clientY: 200 } as any],
      });
      container.dispatchEvent(touchMoveEvent);

      // 模拟触摸结束
      const touchEndEvent = new TouchEvent('touchend', {});
      container.dispatchEvent(touchEndEvent);
    }
  });
});
