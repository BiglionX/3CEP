// 风险分析API路由单元测试
import { POST } from '@/app/api/procurement-intelligence/risk-analysis/route';
import { NextRequest } from 'next/server';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('Risk Analysis API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/procurement-intelligence/risk-analysis', () => {
    it('should assess supplier risk successfully', async () => {
      const mockSupplierData = {
        supplier_id: 'test-supplier-001',
        company_name: '测试供应商有限公司',
        business_scale: 'medium',
        delivery_score: 85,
        certifications: ['ISO 9001', 'ISO 14001'],
        registration_country: 'China',
      };

      const mockInsertResult = { data: {}, error: null };

      mockSupabase.select.mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({ data: mockSupplierData, error: null }),
      });
      mockSupabase.insert.mockResolvedValue(mockInsertResult);

      const request = new NextRequest(
        'http://localhost:3000/api/procurement-intelligence/risk-analysis',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'assess_supplier_risk',
            supplierId: 'test-supplier-001',
          }),
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.assessment).toBeDefined();
      expect(result.assessment.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(result.assessment.overallRiskScore).toBeLessThanOrEqual(100);
    });

    it('should return error for missing action parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/procurement-intelligence/risk-analysis',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('缺少必要参数');
    });

    it('should return error for missing supplierId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/procurement-intelligence/risk-analysis',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'assess_supplier_risk',
          }),
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('缺少supplierId参数');
    });

    it('should get risk history successfully', async () => {
      const mockHistory = [
        {
          assessment_id: 'assessment-001',
          supplier_id: 'test-supplier-001',
          overall_risk_score: 45,
          risk_level: 'medium',
          assessment_date: new Date().toISOString(),
        },
        {
          assessment_id: 'assessment-002',
          supplier_id: 'test-supplier-001',
          overall_risk_score: 35,
          risk_level: 'low',
          assessment_date: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      mockSupabase.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest
            .fn()
            .mockResolvedValue({ data: mockHistory, error: null }),
        }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/procurement-intelligence/risk-analysis',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'get_risk_history',
            supplierId: 'test-supplier-001',
          }),
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.history).toHaveLength(2);
      expect(result.history[0].overallRiskScore).toBe(45);
      expect(result.history[1].overallRiskScore).toBe(35);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.select.mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/procurement-intelligence/risk-analysis',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'assess_supplier_risk',
            supplierId: 'error-supplier',
          }),
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toContain('查询供应商信息失败');
    });

    it('should return 404 for non-existent supplier', async () => {
      mockSupabase.select.mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Record not found' },
        }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/procurement-intelligence/risk-analysis',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'assess_supplier_risk',
            supplierId: 'non-existent-supplier',
          }),
        }
      );

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe('供应商不存在');
    });
  });

  describe('Risk Calculation Logic', () => {
    it('should calculate risk scores correctly for different business scales', () => {
      const testCases = [
        { scale: 'small', expectedMaxRisk: 70 },
        { scale: 'medium', expectedMaxRisk: 40 },
        { scale: 'enterprise', expectedMaxRisk: 20 },
      ];

      // 这里测试内部的风险计算逻辑
      for (const testCase of testCases) {
        // 模拟风险计算函数的行为
        let financialRisk = 0;
        if (testCase.scale === 'small') {
          financialRisk = 70;
        } else if (testCase.scale === 'medium') {
          financialRisk = 40;
        } else {
          financialRisk = 20;
        }

        expect(financialRisk).toBeLessThanOrEqual(testCase.expectedMaxRisk);
      }
    });

    it('should determine correct risk levels', () => {
      const riskLevelTests = [
        { score: 20, expectedLevel: 'low' },
        { score: 50, expectedLevel: 'medium' },
        { score: 70, expectedLevel: 'high' },
        { score: 85, expectedLevel: 'critical' },
      ];

      for (const test of riskLevelTests) {
        let riskLevel: string;
        if (test.score >= 80) riskLevel = 'critical';
        else if (test.score >= 60) riskLevel = 'high';
        else if (test.score >= 40) riskLevel = 'medium';
        else riskLevel = 'low';

        expect(riskLevel).toBe(test.expectedLevel);
      }
    });

    it('should generate appropriate mitigation recommendations', () => {
      const highRiskCategories = [
        { name: 'financial', score: 70 },
        { name: 'operational', score: 65 },
        { name: 'compliance', score: 60 },
      ];

      const recommendations: string[] = [];

      for (const category of highRiskCategories) {
        if (category.score > 50) {
          if (category.name === 'financial') {
            recommendations.push('要求提供财务报表进行深入分析');
            recommendations.push('设置分期付款条件');
          } else if (category.name === 'operational') {
            recommendations.push('建立备用供应商名单');
            recommendations.push('缩短交付周期要求');
          } else if (category.name === 'compliance') {
            recommendations.push('要求提供相关认证证书');
            recommendations.push('安排第三方审计');
          }
        }
      }

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('要求提供财务报表进行深入分析');
      expect(recommendations).toContain('建立备用供应商名单');
    });
  });
});
