// Cypress端到端测试脚本
describe('管理员登录测试', () => {
  const adminEmail = '1055603323@qq.com';
  const adminPassword = '12345678';

  it('应该能够成功登录管理员账户', () => {
    // 访问登录页面
    cy.visit('/login?redirect=%2Fadmin');

    // 输入邮箱
    cy.get('[data-testid="email-input"]').type(adminEmail);

    // 输入密码
    cy.get('[data-testid="password-input"]').type(adminPassword);

    // 提交登录
    cy.get('[data-testid="login-button"]').click();

    // 验证登录成功
    cy.url().should('include', '/admin');
    cy.contains('管理后台').should('be.visible');
  });

  it('应该能够访问管理员功能', () => {
    // 假设已经登录
    cy.visit('/admin');

    // 验证管理员功能可见
    cy.contains('用户管理').should('be.visible');
    cy.contains('系统设置').should('be.visible');
  });
});
