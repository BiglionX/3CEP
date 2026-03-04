/**
 * @file multidimensional-analysis.test.ts
 * @description 多维分析功能单元测试
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

import {
  MultidimensionalQueryBuilder,
  Dimension,
  Metric,
  FilterCondition,
} from '@/data-center/analytics/multidimensional-query-builder';

describe('MultidimensionalQueryBuilder', () => {
  let queryBuilder: MultidimensionalQueryBuilder;

  beforeEach(() => {
    queryBuilder = new MultidimensionalQueryBuilder();
  });

  describe('维度和指标管理', () => {
    test('应该能够获取可用维度列表', async () => {
      const dimensions = await queryBuilder.getAvailableDimensions('test-user');
      expect(dimensions).toBeInstanceOf(Array);
      expect(dimensions.length).toBeGreaterThan(0);

      // 验证维度结构
      const dimension = dimensions[0];
      expect(dimension).toHaveProperty('id');
      expect(dimension).toHaveProperty('name');
      expect(dimension).toHaveProperty('type');
      expect(dimension).toHaveProperty('dataType');
    });

    test('应该能够获取可用指标列表', async () => {
      const metrics = await queryBuilder.getAvailableMetrics('test-user');
      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBeGreaterThan(0);

      // 验证指标结构
      const metric = metrics[0];
      expect(metric).toHaveProperty('id');
      expect(metric).toHaveProperty('name');
      expect(metric).toHaveProperty('type');
      expect(metric).toHaveProperty('aggregation');
    });
  });

  describe('查询配置验证', () => {
    const mockDimensions: Dimension[] = [
      {
        id: 'time_dim',
        name: '时间维度',
        type: 'time',
        dataType: 'date',
        table: 'sales',
        column: 'sale_date',
      },
    ];

    const mockMetrics: Metric[] = [
      {
        id: 'sales_amount',
        name: '销售额',
        type: 'aggregation',
        aggregation: 'sum',
        table: 'sales',
        column: 'amount',
      },
    ];

    test('应该拒绝空维度和指标的查询', async () => {
      const config = {
        dimensions: [],
        metrics: [],
        filters: [],
      };

      await expect(
        queryBuilder.executeQuery(config, 'test-user')
      ).rejects.toThrow();
    });

    test('应该接受有效的查询配置', async () => {
      const config = {
        dimensions: mockDimensions,
        metrics: mockMetrics,
        filters: [],
      };

      // 使用mock数据避免真实数据库调用
      jest.spyOn(queryBuilder as any, 'buildSQLQuery').mockReturnValue({
        query: 'SELECT * FROM sales',
        params: {},
      });

      jest
        .spyOn(queryBuilder as any, 'dataSourceManager', 'get')
        .mockReturnValue({
          executeQuery: jest.fn().mockResolvedValue({
            rows: [{ amount: 1000 }],
            rowCount: 1,
            columns: [{ name: 'amount', type: 'number' }],
          }),
        });

      const result = await queryBuilder.executeQuery(config, 'test-user');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('columns');
      expect(result).toHaveProperty('metadata');
    });
  });

  describe('SQL查询构建', () => {
    test('应该正确构建基础查询SQL', () => {
      const config = {
        dimensions: [
          {
            id: 'product_dim',
            name: '产品',
            type: 'categorical',
            dataType: 'string',
            table: 'products',
            column: 'product_name',
          },
        ],
        metrics: [
          {
            id: 'sales_count',
            name: '销售数量',
            type: 'aggregation',
            aggregation: 'count',
            table: 'sales',
            column: 'id',
          },
        ],
        filters: [],
      };

      // 调用私有方法进行测试
      const buildSQLQuery = (queryBuilder as any).buildSQLQuery.bind(
        queryBuilder
      );
      const result = buildSQLQuery(config);

      expect(result.query).toContain('SELECT');
      expect(result.query).toContain('FROM');
      expect(result.query).toContain('GROUP BY');
    });

    test('应该正确处理过滤条件', () => {
      const config = {
        dimensions: [],
        metrics: [],
        filters: [
          {
            field: 'amount',
            operator: '>',
            value: 100,
            valueType: 'static',
          },
        ] as FilterCondition[],
      };

      const buildSQLQuery = (queryBuilder as any).buildSQLQuery.bind(
        queryBuilder
      );
      const result = buildSQLQuery(config);

      expect(result.query).toContain('WHERE');
      expect(result.query).toContain('amount >');
      expect(result.params).toHaveProperty('param_0');
      expect(result.params.param_0).toBe(100);
    });

    test('应该正确处理BETWEEN操作符', () => {
      const config = {
        dimensions: [],
        metrics: [],
        filters: [
          {
            field: 'date',
            operator: 'between',
            value: ['2024-01-01', '2024-12-31'],
            valueType: 'static',
          },
        ] as FilterCondition[],
      };

      const buildSQLQuery = (queryBuilder as any).buildSQLQuery.bind(
        queryBuilder
      );
      const result = buildSQLQuery(config);

      expect(result.query).toContain('BETWEEN');
      expect(result.params).toHaveProperty('param_0_start');
      expect(result.params).toHaveProperty('param_0_end');
    });
  });

  describe('结果处理', () => {
    test('应该正确处理查询结果', () => {
      const rawResult = {
        rows: [
          { product_name: 'iPhone', sales_amount: 50000 },
          { product_name: 'Samsung', sales_amount: 30000 },
        ],
        rowCount: 2,
        columns: [
          { name: 'product_name', type: 'string' },
          { name: 'sales_amount', type: 'number' },
        ],
      };

      const config = {
        dimensions: [
          {
            id: 'product_dim',
            name: '产品',
            type: 'categorical',
            dataType: 'string',
            table: 'products',
            column: 'product_name',
          },
        ],
        metrics: [
          {
            id: 'sales_amount',
            name: '销售额',
            type: 'aggregation',
            aggregation: 'sum',
            table: 'sales',
            column: 'amount',
            format: 'currency',
          },
        ],
        filters: [],
      };

      const processQueryResult = (queryBuilder as any).processQueryResult.bind(
        queryBuilder
      );
      const result = processQueryResult(rawResult, config);

      expect(result.data).toHaveLength(2);
      expect(result.columns).toHaveLength(2);
      expect(result.metadata.rowCount).toBe(2);
      expect(result.metadata.columnCount).toBe(2);
    });

    test('应该正确计算汇总信息', () => {
      const data = [
        { amount: 100, quantity: 5 },
        { amount: 200, quantity: 3 },
        { amount: 150, quantity: 7 },
      ];

      const metrics = [
        {
          id: 'amount',
          name: '金额',
          type: 'aggregation',
          aggregation: 'sum',
          table: 'sales',
          column: 'amount',
        },
      ];

      const calculateSummary = (queryBuilder as any).calculateSummary.bind(
        queryBuilder
      );
      const summary = calculateSummary(data, metrics);

      expect(summary).toHaveProperty('金额_total');
      expect(summary['金额_total']).toBe(450);
    });
  });

  describe('权限控制', () => {
    test('应该验证用户权限', async () => {
      const config: any = {
        dimensions: [
          {
            id: 'sensitive_dim',
            name: '敏感维度',
            type: 'categorical' as const,
            dataType: 'string' as const,
            table: 'sensitive_data',
            column: 'secret_field',
          },
        ],
        metrics: [],
        filters: [],
      };

      // 模拟权限检查失败
      jest
        .spyOn(queryBuilder as any, 'checkDimensionAccess')
        .mockResolvedValue(false);

      await expect(
        queryBuilder.executeQuery(config, 'unauthorized-user')
      ).rejects.toThrow('无权访问维度');
    });
  });

  describe('缓存机制', () => {
    test('应该生成正确的缓存键', () => {
      const config = {
        dimensions: [{ id: 'time' } as any],
        metrics: [{ id: 'sales' } as any],
        filters: [],
      };

      const generateCacheKey = (queryBuilder as any).generateCacheKey.bind(
        queryBuilder
      );
      const cacheKey1 = generateCacheKey(config, 'user1');
      const cacheKey2 = generateCacheKey(config, 'user2');

      // 同一用户相同配置应该生成相同键
      expect(generateCacheKey(config, 'user1')).toBe(cacheKey1);
      // 不同用户应该生成不同键
      expect(cacheKey1).not.toBe(cacheKey2);
    });
  });

  describe('OLAP立方体生成', () => {
    test('应该能够生成OLAP立方体', async () => {
      const config: any = {
        dimensions: [
          {
            id: 'product',
            name: '产品',
            type: 'categorical' as const,
            dataType: 'string' as const,
            table: 'products',
            column: 'name',
          },
        ],
        metrics: [
          {
            id: 'sales',
            name: '销售额',
            type: 'aggregation' as const,
            aggregation: 'sum' as const,
            table: 'sales',
            column: 'amount',
          },
        ],
        filters: [],
      };

      // 模拟查询执行
      jest.spyOn(queryBuilder, 'executeQuery').mockResolvedValue({
        data: [
          { 产品: 'iPhone', 销售额: 50000 },
          { 产品: 'Samsung', 销售额: 30000 },
        ],
        columns: [],
        metadata: {
          queryTime: 100,
          rowCount: 2,
          columnCount: 2,
          cacheHit: false,
        },
      } as any);

      const cube = await queryBuilder.generateOLAPCube(config, 'test-user');

      expect(cube).toHaveProperty('dimensions');
      expect(cube).toHaveProperty('measures');
      expect(cube).toHaveProperty('cells');
      expect(cube.metadata.recordCount).toBe(2);
    });
  });
});

describe('集成测试场景', () => {
  test('完整的多维分析流程', async () => {
    const queryBuilder = new MultidimensionalQueryBuilder();

    // 1. 获取维度和指标
    const dimensions = await queryBuilder.getAvailableDimensions('test-user');
    const metrics = await queryBuilder.getAvailableMetrics('test-user');

    expect(dimensions).toBeInstanceOf(Array);
    expect(metrics).toBeInstanceOf(Array);

    // 2. 构建查询配置
    const config = {
      dimensions: [dimensions[0]], // 使用第一个维度
      metrics: [metrics[0]], // 使用第一个指标
      filters: [],
      limit: 100,
    };

    // 3. 执行查询（使用mock避免真实数据库）
    jest
      .spyOn(queryBuilder as any, 'dataSourceManager', 'get')
      .mockReturnValue({
        executeQuery: jest.fn().mockResolvedValue({
          rows: [
            {
              [config.dimensions[0].name]: 'test',
              [config.metrics[0].name]: 100,
            },
          ],
          rowCount: 1,
          columns: [
            { name: config.dimensions[0].name, type: 'string' },
            { name: config.metrics[0].name, type: 'number' },
          ],
        }),
      });

    const result = await queryBuilder.executeQuery(config, 'test-user');

    expect(result.data).toHaveLength(1);
    expect(result.columns).toHaveLength(2);
    expect(result.metadata.rowCount).toBe(1);
  });
});
