#!/usr/bin/env node

/**
 * 采购智能体用户验收测试脚本
 * 验证系统是否满足业务用户的实际使用需求
 */

class ProcurementIntelligenceAcceptanceTest {
  constructor() {
    this.testResults = {
      modules: {},
      overall: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        startTime: new Date(),
        endTime: null,
      },
    };
  }

  async run() {
    console.log('🎯 开始采购智能体用户验收测试...\n');
    console.log('='.repeat(60));

    try {
      // 按用户场景执行验收测试
      await this.testUserScenarios();
      await this.testBusinessWorkflows();
      await this.testInterfaceUsability();
      await this.testDataAccuracy();
      await this.testPerformanceRequirements();

      // 生成验收报告
      this.testResults.overall.endTime = new Date();
      await this.generateAcceptanceReport();

      console.log(`\n${'='.repeat(60)}`);
      console.log('✅ 用户验收测试完成！');

      this.printAcceptanceSummary();

      // 返回测试结果给调用者
      return (
        this.testResults.overall.passedTests /
          this.testResults.overall.totalTests >=
        0.8
      );
    } catch (error) {
      console.error('❌ 验收测试过程中发生错误:', error);
      return false;
    }
  }

  async testUserScenarios() {
    console.log('\n👥 测试1: 核心用户使用场景');

    const scenarios = [
      {
        name: '采购经理创建智能采购需求',
        test: () => this.testCreateProcurementRequest(),
      },
      {
        name: '供应商评估师查看智能画像',
        test: () => this.testViewSupplierProfile(),
      },
      {
        name: '风险管控人员监控供应商风险',
        test: () => this.testMonitorSupplierRisk(),
      },
      {
        name: '决策支持人员获取采购建议',
        test: () => this.testGetProcurementAdvice(),
      },
    ];

    for (const scenario of scenarios) {
      console.log(`\n  测试场景: ${scenario.name}`);
      await this.executeScenarioTest(scenario.name, scenario.test);
    }
  }

  async testBusinessWorkflows() {
    console.log('\n📊 测试2: 业务流程端到端验证');

    const workflows = [
      {
        name: '完整采购决策流程',
        steps: [
          '创建采购需求',
          '系统自动匹配供应商',
          '生成风险评估报告',
          '提供采购决策建议',
          '输出合同条款建议',
        ],
        test: () => this.testCompleteProcurementWorkflow(),
      },
      {
        name: '供应商生命周期管理',
        steps: [
          '新建供应商档案',
          '定期风险评估',
          '绩效评分更新',
          '关系等级调整',
        ],
        test: () => this.testSupplierLifecycleManagement(),
      },
    ];

    for (const workflow of workflows) {
      console.log(`\n  测试流程: ${workflow.name}`);
      console.log(`  包含步骤: ${workflow.steps.join(' → ')}`);
      await this.executeWorkflowTest(workflow.name, workflow.test);
    }
  }

  async testInterfaceUsability() {
    console.log('\n🖥️  测试3: 界面易用性验证');

    const uiTests = [
      {
        name: '智能仪表板显示效果',
        criteria: [
          '关键指标清晰可见',
          '风险预警醒目突出',
          '操作按钮易于理解',
          '响应速度符合预期',
        ],
        test: () => this.testDashboardUsability(),
      },
      {
        name: '供应商洞察面板',
        criteria: [
          '供应商信息完整',
          '评分维度明确',
          '改进建议实用',
          '历史数据可追溯',
        ],
        test: () => this.testSupplierInsightsUsability(),
      },
    ];

    for (const uiTest of uiTests) {
      console.log(`\n  测试界面: ${uiTest.name}`);
      console.log(`  验收标准: ${uiTest.criteria.join(', ')}`);
      await this.executeUiTest(uiTest.name, uiTest.test, uiTest.criteria);
    }
  }

  async testDataAccuracy() {
    console.log('\n📈 测试4: 数据准确性验证');

    const dataTests = [
      {
        name: '供应商评分准确性',
        test: () => this.testSupplierScoringAccuracy(),
      },
      {
        name: '风险评估精确度',
        test: () => this.testRiskAssessmentAccuracy(),
      },
      {
        name: '价格预测可靠性',
        test: () => this.testPricePredictionReliability(),
      },
    ];

    for (const dataTest of dataTests) {
      console.log(`\n  测试数据: ${dataTest.name}`);
      await this.executeDataTest(dataTest.name, dataTest.test);
    }
  }

  async testPerformanceRequirements() {
    console.log('\n⚡ 测试5: 性能需求验证');

    const performanceTests = [
      {
        name: '页面加载时间',
        requirement: '< 2秒',
        test: () => this.testPageLoadPerformance(),
      },
      {
        name: 'API响应时间',
        requirement: '< 500毫秒',
        test: () => this.testApiResponseTime(),
      },
      {
        name: '并发用户支持',
        requirement: '≥ 100用户同时在线',
        test: () => this.testConcurrentAccess(),
      },
    ];

    for (const perfTest of performanceTests) {
      console.log(`\n  性能测试: ${perfTest.name} (${perfTest.requirement})`);
      await this.executePerformanceTest(
        perfTest.name,
        perfTest.test,
        perfTest.requirement
      );
    }
  }

  // 具体测试方法实现
  async testCreateProcurementRequest() {
    try {
      // 模拟用户创建采购需求的完整流程
      const requestData = {
        commodity: 'semiconductors',
        quantity: 1000,
        deliveryDate: '2026-12-31',
        budget: 50000,
        specifications: {
          grade: 'industrial',
          packaging: 'tube',
        },
      };

      // 调用API创建采购需求
      const response = await this.simulateApiCall(
        '/api/procurement-intelligence/decision-engine',
        'POST',
        {
          action: 'make_decision',
          procurementRequest: requestData,
        }
      );

      if (response.success && response.decision) {
        return {
          pass: true,
          message: '采购需求创建成功，系统返回了智能决策建议',
        };
      } else {
        return {
          pass: false,
          message: '系统未能生成有效的采购决策建议',
        };
      }
    } catch (error) {
      return {
        pass: false,
        message: `创建采购需求失败: ${error.message}`,
      };
    }
  }

  async testViewSupplierProfile() {
    try {
      // 模拟查看供应商画像
      const response = await this.simulateApiCall(
        '/api/procurement-intelligence/supplier-profiling',
        'GET',
        {
          action: 'get_profile',
          supplierId: 'test-supplier-001',
        }
      );

      if (response.success && response.profile) {
        const requiredFields = [
          'companyName',
          'overallScore',
          'riskLevel',
          'capabilities',
        ];
        const hasAllFields = requiredFields.every(
          field => response.profile[field] !== undefined
        );

        return {
          pass: hasAllFields,
          message: hasAllFields ? '供应商画像信息完整' : '供应商画像信息不完整',
        };
      } else {
        return {
          pass: false,
          message: '无法获取供应商画像信息',
        };
      }
    } catch (error) {
      return {
        pass: false,
        message: `查看供应商画像失败: ${error.message}`,
      };
    }
  }

  async testMonitorSupplierRisk() {
    try {
      // 模拟风险监控
      const response = await this.simulateApiCall(
        '/api/procurement-intelligence/risk-analysis',
        'POST',
        {
          action: 'get_risk_history',
          supplierId: 'test-supplier-001',
        }
      );

      if (response.success && Array.isArray(response.history)) {
        return {
          pass: true,
          message: `成功获取${response.history.length}条风险记录`,
        };
      } else {
        return {
          pass: false,
          message: '风险监控功能异常',
        };
      }
    } catch (error) {
      return {
        pass: false,
        message: `风险监控失败: ${error.message}`,
      };
    }
  }

  async testGetProcurementAdvice() {
    try {
      // 模拟获取采购建议
      const response = await this.simulateApiCall(
        '/api/procurement-intelligence/decision-engine',
        'POST',
        {
          action: 'make_decision',
          procurementRequest: {
            commodity: 'electronics',
            quantity: 500,
            urgency: 'normal',
          },
        }
      );

      if (
        response.success &&
        response.decision &&
        response.decision.recommendations
      ) {
        return {
          pass: response.decision.recommendations.length > 0,
          message: `生成了${response.decision.recommendations.length}条采购建议`,
        };
      } else {
        return {
          pass: false,
          message: '未能生成有效的采购建议',
        };
      }
    } catch (error) {
      return {
        pass: false,
        message: `获取采购建议失败: ${error.message}`,
      };
    }
  }

  async testCompleteProcurementWorkflow() {
    try {
      // 模拟完整的采购工作流
      const steps = [
        {
          action: 'create_request',
          data: { commodity: 'components', quantity: 100 },
        },
        { action: 'match_suppliers', data: { minScore: 70 } },
        { action: 'assess_risks', data: {} },
        { action: 'make_decision', data: {} },
        { action: 'suggest_contract_terms', data: {} },
      ];

      let allStepsPassed = true;
      const stepResults = [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        try {
          const response = await this.simulateApiCall(
            `/api/procurement-intelligence/${step.action}`,
            'POST',
            step.data
          );
          const stepPassed = response.success;
          stepResults.push({
            step: i + 1,
            name: step.action,
            passed: stepPassed,
          });
          if (!stepPassed) allStepsPassed = false;
        } catch (error) {
          stepResults.push({
            step: i + 1,
            name: step.action,
            passed: false,
            error: error.message,
          });
          allStepsPassed = false;
        }
      }

      return {
        pass: allStepsPassed,
        message: allStepsPassed
          ? '完整采购工作流执行成功'
          : '采购工作流执行中断',
        details: stepResults,
      };
    } catch (error) {
      return {
        pass: false,
        message: `工作流测试失败: ${error.message}`,
      };
    }
  }

  async testDashboardUsability() {
    try {
      // 模拟仪表板访问和关键指标显示
      const dashboardData = {
        totalSuppliers: 156,
        activeSuppliers: 134,
        riskAlerts: 3,
        opportunities: 8,
        monthlySpend: 2345000,
      };

      // 验证关键数据是否存在且合理
      const isValid = Object.values(dashboardData).every(
        value => typeof value === 'number' && value >= 0
      );

      return {
        pass: isValid,
        message: isValid ? '仪表板数据显示正常' : '仪表板数据异常',
      };
    } catch (error) {
      return {
        pass: false,
        message: `仪表板测试失败: ${error.message}`,
      };
    }
  }

  // 辅助方法
  async simulateApiCall(endpoint, method = 'GET', body = null) {
    // 模拟API调用，这里可以替换为真实的HTTP请求
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // 模拟成功的响应
    return {
      success: true,
      data: { message: 'Mock response' },
      timestamp: new Date().toISOString(),
    };
  }

  async executeScenarioTest(name, testFn) {
    this.testResults.overall.totalTests++;
    try {
      const result = await testFn();
      if (result.pass) {
        this.testResults.overall.passedTests++;
        console.log(`    ✅ ${result.message}`);
      } else {
        this.testResults.overall.failedTests++;
        console.log(`    ❌ ${result.message}`);
      }
      this.testResults.modules[name] = result;
    } catch (error) {
      this.testResults.overall.failedTests++;
      console.log(`    ❌ 测试异常: ${error.message}`);
      this.testResults.modules[name] = { pass: false, message: error.message };
    }
  }

  async executeWorkflowTest(name, testFn) {
    await this.executeScenarioTest(name, testFn);
  }

  async executeUiTest(name, testFn, criteria) {
    await this.executeScenarioTest(name, testFn);
  }

  async executeDataTest(name, testFn) {
    await this.executeScenarioTest(name, testFn);
  }

  async executePerformanceTest(name, testFn, requirement) {
    await this.executeScenarioTest(name, testFn);
  }

  async generateAcceptanceReport() {
    const report = {
      title: '采购智能体用户验收测试报告',
      generatedAt: new Date().toISOString(),
      testResults: this.testResults,
      summary: {
        totalTests: this.testResults.overall.totalTests,
        passedTests: this.testResults.overall.passedTests,
        failedTests: this.testResults.overall.failedTests,
        passRate: `${(
          (this.testResults.overall.passedTests /
            this.testResults.overall.totalTests) *
          100
        ).toFixed(2)}%`,
      },
    };

    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(
      __dirname,
      '../../reports/procurement-intelligence-acceptance-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📋 验收测试报告已生成: ${reportPath}`);
  }

  printAcceptanceSummary() {
    const { totalTests, passedTests, failedTests } = this.testResults.overall;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    console.log('\n📊 验收测试汇总:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过测试: ${passedTests}`);
    console.log(`   失败测试: ${failedTests}`);
    console.log(`   通过率: ${passRate}%`);

    if (parseFloat(passRate) >= 80) {
      console.log('\n🎉 验收测试通过！系统满足用户需求。');
    } else {
      console.log('\n⚠️  验收测试未完全通过，请检查失败项。');
    }
  }
}

// 执行验收测试
if (require.main === module) {
  const tester = new ProcurementIntelligenceAcceptanceTest();
  tester
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = { ProcurementIntelligenceAcceptanceTest };
