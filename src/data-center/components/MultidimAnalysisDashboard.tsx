/**
 * @file MultidimAnalysisDashboard.tsx
 * @description 多维分析仪表板组?
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Button,
  Table,
  Spin,
  Alert,
  Space,
  Tag,
  DatePicker,
  Input,
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 类型定义
interface Dimension {
  id: string;
  name: string;
  type: string;
  dataType: string;
}

interface Metric {
  id: string;
  name: string;
  type: string;
  aggregation: string;
}

interface FilterCondition {
  field: string;
  operator: string;
  value: any;
}

interface MultidimQueryConfig {
  dimensions: Dimension[];
  metrics: Metric[];
  filters: FilterCondition[];
  sortBy?: { field: string; order: 'asc' | 'desc' }[];
  limit?: number;
  timeRange?: {
    start: string;
    end: string;
    granularity: string;
  };
}

interface QueryResult {
  data: any[];
  columns: any[];
  metadata: {
    queryTime: number;
    rowCount: number;
    cacheHit: boolean;
  };
  summary?: any;
}

const MultidimAnalysisDashboard: React.FC = () => {
  // 状态管?
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<ColumnsType<any>>([]);

  // 初始化数?
  useEffect(() => {
    fetchDimensionsAndMetrics();
  }, []);

  // 获取维度和指?
  const fetchDimensionsAndMetrics = async () => {
    try {
      setLoading(true);

      // 获取维度
      const dimResponse = await fetch(
        '/api/data-center/multidim?action=dimensions'
      );
      const dimData = await dimResponse.json();
      setDimensions(dimData.dimensions || []);

      // 获取指标
      const metricResponse = await fetch(
        '/api/data-center/multidim?action=metrics'
      );
      const metricData = await metricResponse.json();
      setMetrics(metricData.metrics || []);
    } catch (err) {
      setError('获取维度和指标失?);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 构建查询配置
  const buildQueryConfig = (): MultidimQueryConfig => {
    const configDimensions = dimensions.filter(dim =>
      selectedDimensions.includes(dim.id)
    );

    const configMetrics = metrics.filter(metric =>
      selectedMetrics.includes(metric.id)
    );

    return {
      dimensions: configDimensions,
      metrics: configMetrics,
      filters: filters,
      limit: 1000,
    };
  };

  // 执行分析查询
  const executeAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedDimensions.length === 0 || selectedMetrics.length === 0) {
        setError('请选择至少一个维度和一个指?);
        return;
      }

      const config = buildQueryConfig();

      const response = await fetch('/api/data-center/multidim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          config,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setQueryResult(result);
        generateTableColumns(result.columns);
      } else {
        setError(result.error || '查询执行失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 生成表格列定?
  const generateTableColumns = (columns: any[]) => {
    const antdColumns: ColumnsType<any> = columns.map(col => ({
      title: col.displayName || col.name,
      dataIndex: col.name,
      key: col.name,
      sorter: (a, b) => {
        if (
          typeof a[col.name] === 'number' &&
          typeof b[col.name] === 'number'
        ) {
          return a[col.name] - b[col.name];
        }
        return String(a[col.name]).localeCompare(String(b[col.name]));
      },
      render: (value: any) => {
        if (col.format === 'currency' && typeof value === 'number') {
          return `¥${value.toFixed(2)}`;
        }
        if (col.isDimension) {
          return <Tag color="blue">{String(value)}</Tag>;
        }
        if (col.isMetric && typeof value === 'number') {
          return (
            <span style={{ fontWeight: 'bold' }}>{value.toLocaleString()}</span>
          );
        }
        return value;
      },
    }));

    setTableColumns(antdColumns);
  };

  // 导出数据
  const exportData = async (format: any: 'csv' | 'json') => {
    try {
      const config = buildQueryConfig();

      const response = await fetch('/api/data-center/multidim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export',
          config,
          format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `multidim-analysis-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('导出失败:', err);
    }
  };

  // 添加过滤条件
  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '' }]);
  };

  // 更新过滤条件
  const updateFilter = (index: number, field: string, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  // 移除过滤条件
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">多维分析仪表?/h1>

      {/* 配置面板 */}
      <Card title="分析配置" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 维度选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">选择维度</label>
            <Select
              mode="multiple"
              placeholder="请选择分析维度"
              value={selectedDimensions}
              onChange={setSelectedDimensions}
              style={{ width: '100%' }}
              options={dimensions.map(dim => ({
                label: dim.name,
                value: dim.id,
              }))}
            />
          </div>

          {/* 指标选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">选择指标</label>
            <Select
              mode="multiple"
              placeholder="请选择分析指标"
              value={selectedMetrics}
              onChange={setSelectedMetrics}
              style={{ width: '100%' }}
              options={metrics.map(metric => ({
                label: metric.name,
                value: metric.id,
              }))}
            />
          </div>
        </div>

        {/* 过滤条件 */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">过滤条件</label>
            <Button onClick={addFilter} size="small">
              添加条件
            </Button>
          </div>

          {filters.map((filter, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <Input
                placeholder="字段?
                value={filter.field}
                onChange={e => updateFilter(index, 'field', e.target.value)}
                style={{ width: 150 }}
              />
              <Select
                value={filter.operator}
                onChange={value => updateFilter(index, 'operator', value)}
                style={{ width: 100 }}
                options={[
                  { label: '=', value: '=' },
                  { label: '!=', value: '!=' },
                  { label: '>', value: '>' },
                  { label: '<', value: '<' },
                  { label: '>=', value: '>=' },
                  { label: '<=', value: '<=' },
                  { label: '包含', value: 'like' },
                ]}
              />
              <Input
                placeholder="�?
                value={filter.value}
                onChange={e => updateFilter(index, 'value', e.target.value)}
                style={{ width: 150 }}
              />
              <Button danger onClick={() => removeFilter(index)} size="small">
                删除
              </Button>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-6">
          <Button
            type="primary"
            onClick={executeAnalysis}
            loading={loading}
            icon={<BarChartOutlined />}
          >
            执行分析
          </Button>
          <Button onClick={fetchDimensionsAndMetrics} icon={<ReloadOutlined />}>
            刷新配置
          </Button>
        </div>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          className="mb-6"
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* 结果展示 */}
      {queryResult && (
        <Card
          title={`分析结果 (${queryResult.metadata.rowCount} 条记?`}
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportData('csv')}
              >
                导出CSV
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportData('json')}
              >
                导出JSON
              </Button>
              <Tag color={queryResult.metadata.cacheHit ? 'green' : 'blue'}>
                {queryResult.metadata.cacheHit ? '缓存命中' : '实时查询'}
              </Tag>
              <Tag>耗时: {queryResult.metadata.queryTime}ms</Tag>
            </Space>
          }
        >
          {queryResult.summary && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">汇总信?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(queryResult.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-gray-600">{key}</div>
                    <div className="text-lg font-semibold">
                      {typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Table
            dataSource={queryResult.data}
            columns={tableColumns}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `�?${total} 条记录`,
            }}
            scroll={{ x: 800 }}
            loading={loading}
          />
        </Card>
      )}

      {/* 加载状?*/}
      {loading && !queryResult && (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="正在执行分析..." />
        </div>
      )}
    </div>
  );
};

export default MultidimAnalysisDashboard;
