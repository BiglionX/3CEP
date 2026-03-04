#!/usr/bin/env node

/**
 * 修复 wms-shipment.service.ts 文件中的损坏字符
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  process.cwd(),
  'src/tech/utils/lib/warehouse/wms-shipment.service.ts'
);

console.log('🔧 正在修复 wms-shipment.service.ts 文件...\n');

let content = fs.readFileSync(filePath, 'utf8');

// 需要修复的损坏字符模式
const fixes = [
  { pattern: /失？/g, replacement: '失败' },
  { pattern: /成功？/g, replacement: '成功' },
  { pattern: /类型？/g, replacement: '类型' },
  { pattern: /回调？/g, replacement: '回调' },
  { pattern: /数据？/g, replacement: '数据' },
  { pattern: /配置？/g, replacement: '配置' },
  { pattern: /请求？/g, replacement: '请求' },
  { pattern: /响应？/g, replacement: '响应' },
  { pattern: /处理？/g, replacement: '处理' },
  { pattern: /更新？/g, replacement: '更新' },
  { pattern: /删除？/g, replacement: '删除' },
  { pattern: /查询？/g, replacement: '查询' },
  { pattern: /创建？/g, replacement: '创建' },
  { pattern: /发货？/g, replacement: '发货' },
  { pattern: /订单？/g, replacement: '订单' },
  { pattern: /物流？/g, replacement: '物流' },
  { pattern: /仓库？/g, replacement: '仓库' },
  { pattern: /库存？/g, replacement: '库存' },
  { pattern: /商品？/g, replacement: '商品' },
  { pattern: /用户？/g, replacement: '用户' },
  { pattern: /系统？/g, replacement: '系统' },
  { pattern: /错误？/g, replacement: '错误' },
  { pattern: /信息？/g, replacement: '信息' },
  { pattern: /状态？/g, replacement: '状态' },
  { pattern: /时间？/g, replacement: '时间' },
  { pattern: /地址？/g, replacement: '地址' },
  { pattern: /编号？/g, replacement: '编号' },
  { pattern: /备注？/g, replacement: '备注' },
  { pattern: /说明？/g, replacement: '说明' },
  { pattern: /详情？/g, replacement: '详情' },
  { pattern: /结果？/g, replacement: '结果' },
  { pattern: /操作？/g, replacement: '操作' },
  { pattern: /功能？/g, replacement: '功能' },
  { pattern: /服务？/g, replacement: '服务' },
  { pattern: /接口？/g, replacement: '接口' },
  { pattern: /方法？/g, replacement: '方法' },
  { pattern: /参数？/g, replacement: '参数' },
  { pattern: /返回值？/g, replacement: '返回值' },
  { pattern: /代码？/g, replacement: '代码' },
  { pattern: /逻辑？/g, replacement: '逻辑' },
  { pattern: /业务？/g, replacement: '业务' },
  { pattern: /流程？/g, replacement: '流程' },
  { pattern: /规则？/g, replacement: '规则' },
  { pattern: /策略？/g, replacement: '策略' },
  { pattern: /方案？/g, replacement: '方案' },
  { pattern: /记录？/g, replacement: '记录' },
  { pattern: /统计？/g, replacement: '统计' },
  { pattern: /分析？/g, replacement: '分析' },
  { pattern: /报告？/g, replacement: '报告' },
  { pattern: /监控？/g, replacement: '监控' },
  { pattern: /告警？/g, replacement: '告警' },
  { pattern: /通知？/g, replacement: '通知' },
  { pattern: /消息？/g, replacement: '消息' },
  { pattern: /邮件？/g, replacement: '邮件' },
  { pattern: /短信？/g, replacement: '短信' },
  { pattern: /电话？/g, replacement: '电话' },
  { pattern: /微信？/g, replacement: '微信' },
  { pattern: /支付宝？/g, replacement: '支付宝' },
  { pattern: /银行卡？/g, replacement: '银行卡' },
  { pattern: /支付？/g, replacement: '支付' },
  { pattern: /收款？/g, replacement: '收款' },
  { pattern: /付款？/g, replacement: '付款' },
  { pattern: /金额？/g, replacement: '金额' },
  { pattern: /价格？/g, replacement: '价格' },
  { pattern: /费用？/g, replacement: '费用' },
  { pattern: /成本？/g, replacement: '成本' },
  { pattern: /收入？/g, replacement: '收入' },
  { pattern: /利润？/g, replacement: '利润' },
  { pattern: /税率？/g, replacement: '税率' },
  { pattern: /发票？/g, replacement: '发票' },
  { pattern: /合同？/g, replacement: '合同' },
  { pattern: /协议？/g, replacement: '协议' },
  { pattern: /条款？/g, replacement: '条款' },
  { pattern: /条件？/g, replacement: '条件' },
  { pattern: /要求？/g, replacement: '要求' },
  { pattern: /标准？/g, replacement: '标准' },
  { pattern: /规范？/g, replacement: '规范' },
  { pattern: /文档？/g, replacement: '文档' },
  { pattern: /手册？/g, replacement: '手册' },
  { pattern: /指南？/g, replacement: '指南' },
  { pattern: /教程？/g, replacement: '教程' },
  { pattern: /培训？/g, replacement: '培训' },
  { pattern: /考试？/g, replacement: '考试' },
  { pattern: /成绩？/g, replacement: '成绩' },
  { pattern: /证书？/g, replacement: '证书' },
  { pattern: /资格？/g, replacement: '资格' },
  { pattern: /权限？/g, replacement: '权限' },
  { pattern: /角色？/g, replacement: '角色' },
  { pattern: /账号？/g, replacement: '账号' },
  { pattern: /密码？/g, replacement: '密码' },
  { pattern: /登录？/g, replacement: '登录' },
  { pattern: /注册？/g, replacement: '注册' },
  { pattern: /退出？/g, replacement: '退出' },
  { pattern: /会话？/g, replacement: '会话' },
  { pattern: /令牌？/g, replacement: '令牌' },
  { pattern: /认证？/g, replacement: '认证' },
  { pattern: /授权？/g, replacement: '授权' },
  { pattern: /审计？/g, replacement: '审计' },
  { pattern: /日志？/g, replacement: '日志' },
  { pattern: /备份？/g, replacement: '备份' },
  { pattern: /恢复？/g, replacement: '恢复' },
  { pattern: /归档？/g, replacement: '归档' },
  { pattern: /导入？/g, replacement: '导入' },
  { pattern: /导出？/g, replacement: '导出' },
  { pattern: /上传？/g, replacement: '上传' },
  { pattern: /下载？/g, replacement: '下载' },
  { pattern: /同步？/g, replacement: '同步' },
  { pattern: /异步？/g, replacement: '异步' },
  { pattern: /定时？/g, replacement: '定时' },
  { pattern: /任务？/g, replacement: '任务' },
  { pattern: /计划？/g, replacement: '计划' },
  { pattern: /调度？/g, replacement: '调度' },
  { pattern: /执行？/g, replacement: '执行' },
  { pattern: /运行？/g, replacement: '运行' },
  { pattern: /启动？/g, replacement: '启动' },
  { pattern: /停止？/g, replacement: '停止' },
  { pattern: /暂停？/g, replacement: '暂停' },
  { pattern: /恢复？/g, replacement: '恢复' },
  { pattern: /重启？/g, replacement: '重启' },
  { pattern: /刷新？/g, replacement: '刷新' },
  { pattern: /清理？/g, replacement: '清理' },
  { pattern: /优化？/g, replacement: '优化' },
  { pattern: /升级？/g, replacement: '升级' },
  { pattern: /降级？/g, replacement: '降级' },
  { pattern: /安装？/g, replacement: '安装' },
  { pattern: /卸载？/g, replacement: '卸载' },
  { pattern: /部署？/g, replacement: '部署' },
  { pattern: /发布？/g, replacement: '发布' },
  { pattern: /测试？/g, replacement: '测试' },
  { pattern: /调试？/g, replacement: '调试' },
  { pattern: /诊断？/g, replacement: '诊断' },
  { pattern: /修复？/g, replacement: '修复' },
  { pattern: /改进？/g, replacement: '改进' },
  { pattern: /增强？/g, replacement: '增强' },
  { pattern: /扩展？/g, replacement: '扩展' },
  { pattern: /插件？/g, replacement: '插件' },
  { pattern: /模块？/g, replacement: '模块' },
  { pattern: /组件？/g, replacement: '组件' },
  { pattern: /页面？/g, replacement: '页面' },
  { pattern: /路由？/g, replacement: '路由' },
  { pattern: /导航？/g, replacement: '导航' },
  { pattern: /菜单？/g, replacement: '菜单' },
  { pattern: /按钮？/g, replacement: '按钮' },
  { pattern: /表单？/g, replacement: '表单' },
  { pattern: /输入？/g, replacement: '输入' },
  { pattern: /输出？/g, replacement: '输出' },
  { pattern: /显示？/g, replacement: '显示' },
  { pattern: /隐藏？/g, replacement: '隐藏' },
  { pattern: /打开？/g, replacement: '打开' },
  { pattern: /关闭？/g, replacement: '关闭' },
  { pattern: /切换？/g, replacement: '切换' },
  { pattern: /选择？/g, replacement: '选择' },
  { pattern: /取消？/g, replacement: '取消' },
  { pattern: /确认？/g, replacement: '确认' },
  { pattern: /提交？/g, replacement: '提交' },
  { pattern: /保存？/g, replacement: '保存' },
  { pattern: /编辑？/g, replacement: '编辑' },
];

let totalFixes = 0;

fixes.forEach(({ pattern, replacement }) => {
  const matches = content.match(pattern);
  if (matches) {
    const count = matches.length;
    content = content.replace(pattern, replacement);
    totalFixes += count;
    if (count > 0) {
      console.log(`✅ 修复 "${pattern}": ${count} 处`);
    }
  }
});

// 创建备份
const backupPath = `${filePath}.bak2`;
fs.writeFileSync(backupPath, fs.readFileSync(filePath));

// 保存修复后的内容
fs.writeFileSync(filePath, content);

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 修复完成统计:`);
console.log(`✅ 共修复：${totalFixes} 处`);
console.log(`💾 备份文件：${path.basename(backupPath)}`);
console.log('='.repeat(60));
