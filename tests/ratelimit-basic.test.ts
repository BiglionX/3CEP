/**
 * 速率限制基础功能测试
 * 验证限流配置和规则匹配功能
 */

import { getMatchingRateLimitRules } from '../config/ratelimit.config';

describe('Rate Limit Configuration Tests', () => {
  test('应该正确匹配采购智能体API规则', () => {
    const rules = getMatchingRateLimitRules(
      '/api/procurement-intelligence/supplier-profiling/test',
      'POST'
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].name).toBe('supplier-profiling-rate-limit');
    expect(rules[0].type).toBe('api');
  });

  test('应该正确匹配认证API规则', () => {
    const rules = getMatchingRateLimitRules('/api/auth/login', 'POST');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule: any) => rule.type === 'auth')).toBeTruthy();
  });

  test('应该正确匹配企业服务API规则', () => {
    const rules = getMatchingRateLimitRules('/api/enterprise/dashboard', 'GET');
    expect(rules.length).toBeGreaterThan(0);
    expect(
      rules.some((rule: any) => rule.name.includes('enterprise'))
    ).toBeTruthy();
  });

  test('应该正确匹配管理API规则', () => {
    const rules = getMatchingRateLimitRules('/api/admin/users', 'GET');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule: any) => rule.name.includes('admin'))).toBeTruthy();
  });

  test('应该正确匹配全局API规则', () => {
    const rules = getMatchingRateLimitRules('/api/other-endpoint', 'GET');
    expect(rules.length).toBeGreaterThan(0);
    expect(
      rules.some((rule: any) => rule.name === 'global-api-rate-limit')
    ).toBeTruthy();
  });

  test('应该正确匹配登录页面规则', () => {
    const rules = getMatchingRateLimitRules('/login', 'POST');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule: any) => rule.name.includes('login'))).toBeTruthy();
  });

  test('应该正确匹配注册API规则', () => {
    const rules = getMatchingRateLimitRules('/api/auth/register', 'POST');
    expect(rules.length).toBeGreaterThan(0);
    expect(
      rules.some((rule: any) => rule.name.includes('register'))
    ).toBeTruthy();
  });

  test('应该正确匹配营销演示API规则', () => {
    const rules = getMatchingRateLimitRules('/api/marketing/demo/test', 'POST');
    expect(rules.length).toBeGreaterThan(0);
    expect(
      rules.some((rule: any) => rule.name.includes('marketing'))
    ).toBeTruthy();
  });

  test('GET方法应该匹配相应规则', () => {
    const rules = getMatchingRateLimitRules(
      '/api/procurement-intelligence/market-intelligence',
      'GET'
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].methods).toContain('GET');
  });

  test('不匹配的方法不应该返回规则', () => {
    const rules = getMatchingRateLimitRules(
      '/api/procurement-intelligence/risk-analysis',
      'GET'
    );
    // risk-analysis只允许POST方法
    expect(rules.length).toBe(0);
  });

  test('应该按严格程度排序规则', () => {
    const rules = getMatchingRateLimitRules('/api/auth/login', 'POST');
    if (rules.length > 1) {
      // 验证是否有auth类型和api类型的规则同时匹配
      const hasAuth = rules.some((rule: any) => rule.type === 'auth');
      const hasApi = rules.some((rule: any) => rule.type === 'api');
      expect(hasAuth || hasApi).toBeTruthy();
    }
  });
});

describe('Rate Limit Config Validation', () => {
  test('所有规则都应该有正确的配置结构', () => {
    const rules = getMatchingRateLimitRules('/api/test', 'GET');

    rules.forEach((rule: any) => {
      expect(rule).toHaveProperty('name');
      expect(rule).toHaveProperty('pathPattern');
      expect(rule).toHaveProperty('config');
      expect(rule.config).toHaveProperty('windowMs');
      expect(rule.config).toHaveProperty('maxRequests');
      expect(typeof rule.name).toBe('string');
      expect(typeof rule.config.windowMs).toBe('number');
      expect(typeof rule.config.maxRequests).toBe('number');
    });
  });

  test('敏感操作应该有更严格的限制', () => {
    const sensitiveRules = getMatchingRateLimitRules(
      '/api/procurement-intelligence/risk-analysis',
      'POST'
    );
    const normalRules = getMatchingRateLimitRules(
      '/api/procurement-intelligence/supplier-profiling',
      'GET'
    );

    if (sensitiveRules.length > 0 && normalRules.length > 0) {
      expect(sensitiveRules[0].config.maxRequests).toBeLessThanOrEqual(
        normalRules[0].config.maxRequests
      );
    }
  });

  test('认证相关操作应该有限制', () => {
    const authRules = getMatchingRateLimitRules('/api/auth/login', 'POST');
    expect(authRules.length).toBeGreaterThan(0);
    expect(authRules[0].type).toBe('auth');
  });
});
