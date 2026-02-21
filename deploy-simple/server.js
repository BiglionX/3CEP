const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const { requirePermission, requireTenant } = require('../src/middleware/permissions');
const { audit } = require('../src/lib/audit');

// 全局JSON响应函数
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// JWT 认证中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return sendJsonResponse(res, 401, {
      success: false,
      error: '缺少认证令牌',
      code: 'MISSING_AUTH_TOKEN'
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return sendJsonResponse(res, 401, {
      success: false,
      error: '无效的认证令牌格式',
      code: 'INVALID_AUTH_FORMAT'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      roles: decoded.roles || [],
      tenant_id: decoded.tenantId || null,
      email: decoded.email || null,
      exp: decoded.exp
    };
    next();
  } catch (error) {
    return sendJsonResponse(res, 401, {
      success: false,
      error: '无效的认证令牌',
      code: 'INVALID_TOKEN',
      details: error.message
    });
  }
}

// 简单的环境变量加载
function loadEnv() {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#') && line.includes('=')) {
          const [key, value] = line.split('=');
          process.env[key.trim()] = value ? value.trim() : '';
        }
      });
    }
  } catch (error) {
    console.log('⚠️  环境变量加载失败:', error.message);
  }
}

loadEnv();

// 简单的Mock议价引擎
class MockNegotiationEngine {
  async startNegotiation(data) {
    return {
      sessionId: `session_${Date.now()}`,
      status: 'started',
      initialQuote: data.initialQuote,
      targetPrice: data.targetPrice,
      round: 1
    };
  }
  
  async executeNegotiationRound(data) {
    return {
      sessionId: data.sessionId,
      status: 'in_progress',
      currentQuote: data.supplierQuote,
      round: 2,
      accepted: data.supplierQuote <= 1000 // 简单的价格接受逻辑
    };
  }
  
  async getNegotiationStatus(sessionId) {
    return {
      sessionId,
      status: 'completed',
      finalPrice: 950,
      rounds: 2
    };
  }
}

// 简单的议价引擎HTTP服务
class SimpleNegotiationServer {
  constructor() {
    this.engine = new MockNegotiationEngine();
    this.sessions = new Map();
  }

  async initialize() {
    console.log('✅ 服务已初始化');
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // 处理OPTIONS预检请求
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    console.log(`${method} ${pathname}`);

    try {
      if (pathname === '/api/health') {
        this.handleHealthCheck(res);
      } else if (pathname === '/api/auth/login' && method === 'POST') {
        this.handleLogin(req, res);
      } else if (pathname === '/api/auth/test-token') {
        authMiddleware(req, res, () => {
          sendJsonResponse(res, 200, {
            success: true,
            message: '认证成功',
            user: req.user
          });
        });
      } else if (pathname === '/api/admin/users' && method === 'GET') {
        // 测试需要 users_read 权限的接口
        authMiddleware(req, res, () => {
          requirePermission('users_read')(req, res, () => {
            sendJsonResponse(res, 200, {
              success: true,
              message: '用户列表访问成功',
              data: []
            });
          });
        });
      } else if (pathname === '/api/content/manage' && method === 'POST') {
        // 测试需要 content_create 权限的接口
        authMiddleware(req, res, () => {
          requirePermission('content_create')(req, res, () => {
            requireTenant()(req, res, async () => {
              // 记录审计日志
              await audit(
                'content_create',
                { id: req.user.id, roles: req.user.roles, tenant_id: req.user.tenant_id },
                'content',
                { title: '测试内容', action: 'create' },
                'trace-' + Date.now(),
                { ip: req.connection.remoteAddress }
              );
              
              sendJsonResponse(res, 200, {
                success: true,
                message: '内容创建成功',
                tenant: req.tenant
              });
            });
          });
        });
      } else if (pathname === '/api/audit/test' && method === 'POST') {
        // 测试审计日志功能
        authMiddleware(req, res, async () => {
          try {
            await audit(
              'test_operation',
              { id: req.user.id, roles: req.user.roles, tenant_id: req.user.tenant_id },
              'test_resource',
              { testData: '测试数据' },
              'test-trace-' + Date.now()
            );
            
            sendJsonResponse(res, 200, {
              success: true,
              message: '审计日志测试成功'
            });
          } catch (error) {
            sendJsonResponse(res, 500, {
              success: false,
              error: '审计日志记录失败'
            });
          }
        });
      } else if (pathname === '/agents/invoke' && method === 'POST') {
        this.handleAgentsInvoke(req, res);
      } else if (pathname === '/api/negotiation/start' && method === 'POST') {
        this.handleStartNegotiation(req, res);
      } else if (pathname.startsWith('/api/negotiation/') && pathname.endsWith('/round') && method === 'POST') {
        this.handleExecuteRound(req, res, pathname);
      } else if (pathname.startsWith('/api/negotiation/') && method === 'GET') {
        this.handleGetStatus(req, res, pathname);
      } else {
        this.sendError(res, 404, '接口不存在');
      }
    } catch (error) {
      console.error('处理请求错误:', error);
      this.sendError(res, 500, '服务器内部错误');
    }
  }

  handleHealthCheck(res) {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      service: '智能议价引擎',
      timestamp: new Date().toISOString()
    }));
  }

  // 处理登录请求
  handleLogin(req, res) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const credentials = JSON.parse(body);
        
        // 简单的身份验证（生产环境中应该连接数据库）
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          const token = jwt.sign(
            {
              userId: 'admin-user-id',
              email: 'admin@example.com',
              roles: ['admin'],
              tenantId: 'main-tenant',
              iss: '3cep-auth-service'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
          );

          sendJsonResponse(res, 200, {
            success: true,
            token: token,
            user: {
              id: 'admin-user-id',
              email: 'admin@example.com',
              roles: ['admin'],
              tenant_id: 'main-tenant'
            }
          });
        } else {
          sendJsonResponse(res, 401, {
            success: false,
            error: '用户名或密码错误'
          });
        }
      } catch (error) {
        sendJsonResponse(res, 400, {
          success: false,
          error: '请求格式错误'
        });
      }
    });
  }

  async handleStartNegotiation(req, res) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // 验证必需参数
        if (!data.procurementRequestId || !data.supplierId || !data.targetPrice || !data.initialQuote) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }

        const result = await this.engine.startNegotiation(data);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: result
        }));
      } catch (error) {
        this.sendError(res, 400, error.message);
      }
    });
  }

  async handleExecuteRound(req, res, pathname) {
    const sessionId = pathname.split('/')[3]; // /api/negotiation/{sessionId}/round
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        if (!data.supplierQuote) {
          this.sendError(res, 400, '缺少供应商报价');
          return;
        }

        const result = await this.engine.executeNegotiationRound({
          sessionId,
          supplierQuote: data.supplierQuote,
          roundRemarks: data.roundRemarks
        });
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: result
        }));
      } catch (error) {
        this.sendError(res, 400, error.message);
      }
    });
  }

  async handleGetStatus(req, res, pathname) {
    const sessionId = pathname.split('/')[3]; // /api/negotiation/{sessionId}
    
    try {
      const status = await this.engine.getNegotiationStatus(sessionId);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: status
      }));
    } catch (error) {
      this.sendError(res, 404, error.message);
    }
  }

  sendError(res, statusCode, message, data = null) {
    res.writeHead(statusCode);
    res.end(JSON.stringify({
      success: false,
      error: message,
      data: data
    }));
  }

  // 通用JSON响应函数
  static sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
  }

  // 验证API密钥鉴权
  validateApiKey(req) {
    const authHeader = req.headers['authorization'];
    const apiKey = process.env.AGENTS_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  AGENTS_API_KEY 未配置，请在环境变量中设置');
      return true; // 开发环境下允许无密钥
    }
    
    if (!authHeader) {
      return false;
    }
    
    const token = authHeader.replace('Bearer ', '');
    return token === apiKey;
  }

  // 参数校验方法
  validateAgentInvokeRequest(data) {
    const errors = [];
    
    // 必需字段检查
    if (!data.idempotency_key) {
      errors.push('缺少 idempotency_key 字段');
    } else if (typeof data.idempotency_key !== 'string' || data.idempotency_key.length > 128) {
      errors.push('idempotency_key 必须是长度不超过128的字符串');
    }
    
    if (!data.trace_id) {
      errors.push('缺少 trace_id 字段');
    } else if (typeof data.trace_id !== 'string' || data.trace_id.length > 64) {
      errors.push('trace_id 必须是长度不超过64的字符串');
    }
    
    if (!data.timeout) {
      errors.push('缺少 timeout 字段');
    } else if (typeof data.timeout !== 'number' || data.timeout < 1 || data.timeout > 300) {
      errors.push('timeout 必须是1-300之间的数字');
    }
    
    if (!data.agent_name) {
      errors.push('缺少 agent_name 字段');
    } else if (typeof data.agent_name !== 'string' || data.agent_name.length > 100) {
      errors.push('agent_name 必须是长度不超过100的字符串');
    }
    
    if (!data.payload) {
      errors.push('缺少 payload 字段');
    } else if (typeof data.payload !== 'object') {
      errors.push('payload 必须是对象类型');
    }
    
    return errors;
  }

  // 生成mock响应
  generateMockResponse(agentName, payload) {
    const startTime = Date.now();
    
    // 模拟不同的智能体响应
    let result;
    switch (agentName) {
      case 'AI故障诊断服务':
        result = {
          diagnosis: '设备电池电量耗尽',
          suggested_solutions: [
            '请给设备充电30分钟后再试',
            '如仍无法开机，建议联系专业维修'
          ],
          confidence: 0.92,
          estimated_time: '15-30分钟'
        };
        break;
      case 'FCX智能推荐引擎':
        result = {
          recommendations: [
            {
              type: 'repair_shop',
              name: '苹果官方授权维修点',
              distance: '2.5km',
              rating: 4.8,
              price_range: '¥200-500'
            }
          ],
          confidence: 0.85
        };
        break;
      default:
        result = {
          message: `模拟响应: 已接收到对 ${agentName} 的调用请求`,
          received_payload: payload,
          mock_result: '这是mock响应数据'
        };
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      status: 'completed',
      result: result,
      metrics: {
        execution_time_ms: executionTime,
        tokens_consumed: Math.floor(Math.random() * 1000) + 500,
        model_used: 'deepseek-chat',
        timestamp: new Date().toISOString()
      }
    };
  }

  // 处理 agents/invoke 请求
  async handleAgentsInvoke(req, res) {
    // 鉴权验证
    if (!this.validateApiKey(req)) {
      this.sendError(res, 401, '无效的API密钥');
      return;
    }
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // 参数校验
        const validationErrors = this.validateAgentInvokeRequest(data);
        if (validationErrors.length > 0) {
          this.sendError(res, 400, '请求参数错误', {
            field_errors: validationErrors
          });
          return;
        }
        
        console.log(`🤖 接收到智能体调用请求: ${data.agent_name}`);
        console.log(`   幂等键: ${data.idempotency_key}`);
        console.log(`   追踪ID: ${data.trace_id}`);
        console.log(`   超时设置: ${data.timeout}秒`);
        
        // 生成mock响应
        const mockResponse = this.generateMockResponse(data.agent_name, data.payload);
        
        // 返回成功响应
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'X-Mock-Response': 'true',
          'X-Execution-Time': `${mockResponse.metrics.execution_time_ms}ms`
        });
        
        res.end(JSON.stringify({
          code: 200,
          data: mockResponse,
          message: 'success'
        }));
        
        console.log(`✅ 智能体调用完成: ${data.agent_name}, 执行时间: ${mockResponse.metrics.execution_time_ms}ms`);
        
      } catch (error) {
        if (error instanceof SyntaxError) {
          this.sendError(res, 400, '无效的JSON格式');
        } else {
          console.error('处理agents/invoke请求错误:', error);
          this.sendError(res, 500, '服务器内部错误');
        }
      }
    });
  }

  start(port = 3001) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, () => {
      console.log(`🚀 智能议价引擎API服务已启动`);
      console.log(`📡 监听端口: ${port}`);
      console.log(`📄 API文档:`);
      console.log(`   GET  /api/health - 健康检查`);
      console.log(`   POST /api/auth/login - 用户登录获取JWT令牌`);
      console.log(`   GET  /api/auth/test-token - 测试JWT认证 (需Authorization头)`);
      console.log(`   GET  /api/admin/users - 测试用户管理权限 (需users_read权限)`);
      console.log(`   POST /api/content/manage - 测试内容创建权限 (需content_create权限+租户验证+审计)`);
      console.log(`   POST /api/audit/test - 测试审计日志功能`);
      console.log(`   POST /agents/invoke - 智能体统一调用接口 (需API密钥)`);
      console.log(`   POST /api/negotiation/start - 启动议价`);
      console.log(`   POST /api/negotiation/{sessionId}/round - 执行议价回合`);
      console.log(`   GET  /api/negotiation/{sessionId} - 获取议价状态`);
      console.log(`\n💡 服务已准备好接收请求!`);
    });

    return server;
  }
}

// 启动服务
async function startServer() {
  const server = new SimpleNegotiationServer();
  await server.initialize();
  server.start(3001);
}

// 如果直接运行此文件则启动服务
if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = { SimpleNegotiationServer, startServer };
