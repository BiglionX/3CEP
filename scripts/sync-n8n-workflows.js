#!/usr/bin/env node

/**
 * n8n工作流同步脚本
 * 从n8n拉取工作流，并按标签和角色白名单过滤，生成缓存文件
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 配置
const CONFIG = {
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiToken: process.env.N8N_API_TOKEN || '',
    timeout: 30000,
  },
  cache: {
    outputPath: path.join(__dirname, '..', 'data', 'workflows.json'),
    ttl: 300000, // 5分钟缓存
  },
  filtering: {
    // 域白名单配置
    domainWhitelist: process.env.WORKFLOW_DOMAIN_WHITELIST
      ? process.env.WORKFLOW_DOMAIN_WHITELIST.split(',')
      : ['production', 'staging', 'development'],

    // 角色白名单配置
    roleMappings: {
      admin: ['admin', 'ops', 'developer'],
      ops: ['ops', 'support'],
      partner: ['partner', 'external'],
      user: ['user', 'customer'],
    },
  },
};

/**
 * 获取n8n工作流列表
 */
async function fetchN8nWorkflows() {
  try {
    console.log('🔄 正在从n8n获取工作流列表...');

    const response = await axios.get(`${CONFIG.n8n.baseUrl}/api/workflows`, {
      headers: {
        Authorization: `Bearer ${CONFIG.n8n.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: CONFIG.n8n.timeout,
    });

    console.log(`✅ 成功获取 ${response.data.length} 个工作流`);
    return response.data;
  } catch (error) {
    console.error('❌ 获取n8n工作流失败:', error.message);
    throw error;
  }
}

/**
 * 根据标签和域过滤工作流
 */
function filterWorkflowsByDomain(workflows) {
  const filtered = workflows.filter(workflow => {
    const tags = workflow.tags || [];
    const domains = tags
      .filter(tag => tag.startsWith('domain:'))
      .map(tag => tag.split(':')[1]);

    // 如果没有域标签，默认允许
    if (domains.length === 0) {
      return true;
    }

    // 检查是否有白名单中的域
    return domains.some(domain =>
      CONFIG.filtering.domainWhitelist.includes(domain)
    );
  });

  console.log(`📊 域过滤后剩余 ${filtered.length} 个工作流`);
  return filtered;
}

/**
 * 根据角色权限过滤工作流
 */
function filterWorkflowsByRole(workflows, userRole) {
  const allowedRoles = CONFIG.filtering.roleMappings[userRole] || [userRole];

  const filtered = workflows.filter(workflow => {
    const tags = workflow.tags || [];
    const roleTags = tags
      .filter(tag => tag.startsWith('role:'))
      .map(tag => tag.split(':')[1]);

    // 如果没有角色标签，默认允许所有角色
    if (roleTags.length === 0) {
      return true;
    }

    // 检查用户角色是否在允许的角色列表中
    return roleTags.some(role => allowedRoles.includes(role));
  });

  console.log(`👤 ${userRole} 角色过滤后剩余 ${filtered.length} 个工作流`);
  return filtered;
}

/**
 * 丰富工作流元数据
 */
function enrichWorkflowMetadata(workflows) {
  return workflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    active: workflow.active,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    version: workflow.meta?.version || '1.0.0',
    tags: workflow.tags || [],
    domain: extractDomainFromTags(workflow.tags),
    allowedRoles: extractRolesFromTags(workflow.tags),
    description: workflow.meta?.description || '',
    category: workflow.meta?.category || 'general',
    lastExecuted: workflow.meta?.lastExecuted || null,
    executionCount: workflow.meta?.executionCount || 0,
  }));
}

/**
 * 从标签中提取域信息
 */
function extractDomainFromTags(tags) {
  const domainTag = tags.find(tag => tag.startsWith('domain:'));
  return domainTag ? domainTag.split(':')[1] : 'default';
}

/**
 * 从标签中提取角色信息
 */
function extractRolesFromTags(tags) {
  return tags
    .filter(tag => tag.startsWith('role:'))
    .map(tag => tag.split(':')[1]);
}

/**
 * 生成缓存数据
 */
function generateCacheData(workflows) {
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      workflowCount: workflows.length,
      domains: [...new Set(workflows.map(w => w.domain))],
      version: '1.0.0',
    },
    workflows: workflows,
    domains: groupWorkflowsByDomain(workflows),
  };
}

/**
 * 按域分组工作流
 */
function groupWorkflowsByDomain(workflows) {
  const grouped = {};

  workflows.forEach(workflow => {
    if (!grouped[workflow.domain]) {
      grouped[workflow.domain] = [];
    }
    grouped[workflow.domain].push(workflow);
  });

  return grouped;
}

/**
 * 保存缓存文件
 */
function saveCacheFile(data) {
  // 确保data目录存在
  const dataDir = path.dirname(CONFIG.cache.outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG.cache.outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 缓存文件已保存至: ${CONFIG.cache.outputPath}`);
}

/**
 * 验证缓存文件
 */
function validateCacheFile() {
  if (!fs.existsSync(CONFIG.cache.outputPath)) {
    return false;
  }

  try {
    const cacheData = JSON.parse(
      fs.readFileSync(CONFIG.cache.outputPath, 'utf8')
    );
    const cacheAge =
      Date.now() - new Date(cacheData.metadata.generatedAt).getTime();

    return cacheAge < CONFIG.cache.ttl;
  } catch (error) {
    console.warn('⚠️ 缓存文件损坏，需要重新生成');
    return false;
  }
}

/**
 * 主同步函数
 */
async function syncWorkflows() {
  console.log('🚀 开始同步n8n工作流...');

  try {
    // 检查是否需要强制刷新或缓存已过期
    const forceRefresh = process.argv.includes('--force');
    if (!forceRefresh && validateCacheFile()) {
      console.log('✅ 缓存文件有效，跳过同步');
      return;
    }

    // 获取工作流数据
    const workflows = await fetchN8nWorkflows();

    // 过滤和丰富数据
    const filteredWorkflows = filterWorkflowsByDomain(workflows);
    const enrichedWorkflows = enrichWorkflowMetadata(filteredWorkflows);

    // 生成缓存数据
    const cacheData = generateCacheData(enrichedWorkflows);

    // 保存缓存文件
    saveCacheFile(cacheData);

    console.log('🎉 工作流同步完成!');
    console.log(`📈 总计: ${enrichedWorkflows.length} 个工作流`);
    console.log(`🏢 域数量: ${Object.keys(cacheData.domains).length}`);
  } catch (error) {
    console.error('❌ 工作流同步失败:', error.message);
    process.exit(1);
  }
}

/**
 * 按角色获取工作流列表
 */
function getWorkflowsForRole(role) {
  if (!fs.existsSync(CONFIG.cache.outputPath)) {
    throw new Error('缓存文件不存在，请先运行同步');
  }

  const cacheData = JSON.parse(
    fs.readFileSync(CONFIG.cache.outputPath, 'utf8')
  );
  const roleFiltered = filterWorkflowsByRole(cacheData.workflows, role);

  return roleFiltered;
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
n8n工作流同步工具

用法:
  node sync-n8n-workflows.js [选项]

选项:
  --force, -f    强制刷新缓存
  --help, -h     显示帮助信息
  --role <role>  按角色过滤显示工作流

环境变量:
  N8N_BASE_URL        n8n API基础URL (默认: http://localhost:5678)
  N8N_API_TOKEN       n8n API令牌
  WORKFLOW_DOMAIN_WHITELIST  域白名单 (逗号分隔)
    `);
    process.exit(0);
  }

  if (args.includes('--role')) {
    const roleIndex = args.indexOf('--role');
    if (roleIndex !== -1 && args[roleIndex + 1]) {
      try {
        const roleWorkflows = getWorkflowsForRole(args[roleIndex + 1]);
        console.log(`\n${args[roleIndex + 1]} 角色可访问的工作流:`);
        roleWorkflows.forEach(wf => {
          console.log(`  - ${wf.name} (${wf.domain})`);
        });
      } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
      }
    }
  } else {
    syncWorkflows();
  }
}

module.exports = {
  syncWorkflows,
  getWorkflowsForRole,
  CONFIG,
};
