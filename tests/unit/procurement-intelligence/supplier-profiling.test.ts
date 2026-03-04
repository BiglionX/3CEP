import { SupplierProfilingService } from '../../../src/modules/procurement-intelligence/services/supplier-profiling.service';
import { PROCUREMENT_CONSTANTS } from '../../../src/modules/procurement-intelligence/constants';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  single: jest.fn(),
  limit: jest.fn().mockReturnThis(),
};

// Mock the Supabase client creation
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}));

describe('SupplierProfilingService', () => {
  let service: SupplierProfilingService;

  beforeEach(() => {
    service = new SupplierProfilingService();
    jest.clearAllMocks();
  });

  describe('createOrUpdateSupplierProfile', () => {
    it('should successfully create a supplier profile', async () => {
      const profileData = {
        supplierId: 'test-supplier-001',
        companyName: '测试供应商有限公司',
        registrationCountry: '中国',
        businessScale: 'medium' as const,
        industrySectors: ['电子产品', '半导体'],
        certifications: ['ISO 9001', 'ISO 14001'],
        financialData: {
          annualRevenue: 50000000,
          employeeCount: 200,
          establishedYear: 2010,
        },
      };

      mockSupabase.upsert.mockResolvedValue({ data: {}, error: null });

      const result = await service.createOrUpdateSupplierProfile(profileData);

      expect(result.success).toBe(true);
      expect(result.profileId).toBe('test-supplier-001');
      expect(mockSupabase.from).toHaveBeenCalledWith(
        'supplier_intelligence_profiles'
      );
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('should return error when required fields are missing', async () => {
      const profileData = {
        supplierId: '',
        companyName: '',
        registrationCountry: '中国',
        businessScale: 'medium' as const,
        industrySectors: ['电子产品'],
        certifications: ['ISO 9001'],
      };

      const result = await service.createOrUpdateSupplierProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('缺少必要字段');
    });

    it('should handle database error gracefully', async () => {
      const profileData = {
        supplierId: 'test-supplier-001',
        companyName: '测试供应商有限公司',
        registrationCountry: '中国',
        businessScale: 'medium' as const,
        industrySectors: ['电子产品'],
        certifications: ['ISO 9001'],
      };

      mockSupabase.upsert.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await service.createOrUpdateSupplierProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('数据库操作失败');
    });
  });

  describe('getSupplierProfile', () => {
    it('should successfully retrieve supplier profile', async () => {
      const mockProfile = {
        supplier_id: 'test-supplier-001',
        company_name: '测试供应商有限公司',
        overall_score: 85,
        supplier_tier: 'standard',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await service.getSupplierProfile('test-supplier-001');

      expect(result.success).toBe(true);
      expect(result.profile).toEqual(mockProfile);
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        'supplier_id',
        'test-supplier-001'
      );
    });

    it('should return error when supplier profile not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await service.getSupplierProfile('non-existent-supplier');

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('供应商画像不存在');
    });
  });

  describe('getMultipleSupplierProfiles', () => {
    it('should successfully retrieve multiple supplier profiles', async () => {
      const mockProfiles = [
        { supplier_id: 'sup-001', company_name: '供应商A', overall_score: 85 },
        { supplier_id: 'sup-002', company_name: '供应商B', overall_score: 92 },
      ];

      mockSupabase.select.mockReturnValue({
        in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      });

      const result = await service.getMultipleSupplierProfiles([
        'sup-001',
        'sup-002',
      ]);

      expect(result.success).toBe(true);
      expect(result.profiles).toHaveLength(2);
      expect(result.profiles![0].supplier_id).toBe('sup-001');
    });
  });

  describe('updateSupplierScores', () => {
    it('should successfully update supplier scores', async () => {
      // Mock existing profile
      const existingProfile = {
        success: true,
        profile: {
          quality_score: 80,
          price_score: 75,
          delivery_score: 85,
          service_score: 90,
          innovation_score: 70,
        },
      };

      // Mock the getSupplierProfile method
      jest
        .spyOn(service, 'getSupplierProfile')
        .mockResolvedValue(existingProfile);

      mockSupabase.update.mockResolvedValue({ data: {}, error: null });

      const result = await service.updateSupplierScores('test-supplier-001', {
        quality: 85,
        price: 80,
      });

      expect(result.success).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('should return error when supplier profile does not exist', async () => {
      jest.spyOn(service, 'getSupplierProfile').mockResolvedValue({
        success: false,
        errorMessage: '供应商画像不存在',
      });

      const result = await service.updateSupplierScores(
        'non-existent-supplier',
        {
          quality: 85,
        }
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('供应商画像不存在');
    });
  });

  describe('searchSuppliers', () => {
    it('should successfully search suppliers with filters', async () => {
      const mockSuppliers = [
        {
          supplier_id: 'sup-001',
          company_name: '优质供应商',
          overall_score: 90,
          supplier_tier: 'premium',
        },
        {
          supplier_id: 'sup-002',
          company_name: '标准供应商',
          overall_score: 75,
          supplier_tier: 'standard',
        },
      ];

      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        contains: jest
          .fn()
          .mockResolvedValue({ data: mockSuppliers, error: null, count: 2 }),
      };

      mockSupabase.from.mockReturnValue(mockQueryChain);

      const result = await service.searchSuppliers({
        minScore: 70,
        maxScore: 100,
        tier: 'standard',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.suppliers).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });
  });

  describe('calculateInitialScores', () => {
    it('should calculate correct scores based on business scale', () => {
      // Access private method through reflection for testing
      const calculateMethod = (service as any).calculateInitialScores.bind(
        service
      );

      const profileData = {
        businessScale: 'enterprise',
        certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
        financialData: { establishedYear: 2005 },
      };

      const scores = calculateMethod(profileData);

      expect(scores.quality).toBeGreaterThanOrEqual(85);
      expect(scores.overallScore).toBeGreaterThan(0);
      expect(scores.overallScore).toBeLessThanOrEqual(100);
    });

    it('should handle small business scale appropriately', () => {
      const calculateMethod = (service as any).calculateInitialScores.bind(
        service
      );

      const profileData = {
        businessScale: 'small',
        certifications: [],
        financialData: { establishedYear: 2020 },
      };

      const scores = calculateMethod(profileData);

      expect(scores.quality).toBeGreaterThanOrEqual(55);
      expect(scores.quality).toBeLessThanOrEqual(75);
    });
  });

  describe('determineSupplierTier', () => {
    it('should correctly assign premium tier', () => {
      const determineMethod = (service as any).determineSupplierTier.bind(
        service
      );

      const tier = determineMethod(
        PROCUREMENT_CONSTANTS.SUPPLIER_TIERS.PREMIUM + 5
      );

      expect(tier).toBe('premium');
    });

    it('should correctly assign standard tier', () => {
      const determineMethod = (service as any).determineSupplierTier.bind(
        service
      );

      const score =
        (PROCUREMENT_CONSTANTS.SUPPLIER_TIERS.STANDARD +
          PROCUREMENT_CONSTANTS.SUPPLIER_TIERS.PREMIUM) /
        2;
      const tier = determineMethod(score);

      expect(tier).toBe('standard');
    });

    it('should correctly assign risky tier for low scores', () => {
      const determineMethod = (service as any).determineSupplierTier.bind(
        service
      );

      const tier = determineMethod(
        PROCUREMENT_CONSTANTS.SUPPLIER_TIERS.BASIC - 10
      );

      expect(tier).toBe('risky');
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate higher risk for high-risk countries', () => {
      const calculateMethod = (service as any).calculateRiskScore.bind(service);

      const profileData1 = {
        registrationCountry: 'China',
        businessScale: 'medium',
        certifications: [],
      };
      const profileData2 = {
        registrationCountry: 'North Korea',
        businessScale: 'medium',
        certifications: [],
      };

      const riskScore1 = calculateMethod(profileData1);
      const riskScore2 = calculateMethod(profileData2);

      expect(riskScore2).toBeGreaterThan(riskScore1);
    });

    it('should calculate lower risk for enterprise scale', () => {
      const calculateMethod = (service as any).calculateRiskScore.bind(service);

      const profileData1 = {
        registrationCountry: 'China',
        businessScale: 'small',
        certifications: [],
      };
      const profileData2 = {
        registrationCountry: 'China',
        businessScale: 'enterprise',
        certifications: [],
      };

      const riskScore1 = calculateMethod(profileData1);
      const riskScore2 = calculateMethod(profileData2);

      expect(riskScore2).toBeLessThan(riskScore1);
    });

    it('should reduce risk score with more certifications', () => {
      const calculateMethod = (service as any).calculateRiskScore.bind(service);

      const profileData1 = {
        registrationCountry: 'China',
        businessScale: 'medium',
        certifications: [],
      };
      const profileData2 = {
        registrationCountry: 'China',
        businessScale: 'medium',
        certifications: ['ISO 9001', 'ISO 14001'],
      };

      const riskScore1 = calculateMethod(profileData1);
      const riskScore2 = calculateMethod(profileData2);

      expect(riskScore2).toBeLessThanOrEqual(riskScore1);
    });
  });
});
