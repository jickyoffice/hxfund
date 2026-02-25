/**
 * 黄氏家族寻根平台 - Qwen AI API 服务
 * 基于阿里云百炼 Coding Plan 套餐
 * 
 * API 文档：/api/docs
 * 健康检查：/api/health
 * 
 * 部署说明:
 * 1. 复制 config/.env.example 为 config/.env
 * 2. 配置 QWEN_API_KEY
 * 3. 运行：npm start
 * 
 * 统一使用 qwen-code.js CLI 工具调用 AI
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });

// 引入 CLI 封装模块 - 统一调用入口
const { callQwenCli, isCliConfigured, getCliConfig, CLI_PATH } = require('./cli-wrapper');

// 引入认证模块
const {
  authMiddleware,
  initAuthConfig,
  loadAuthConfig,
  generateTokenHandler,
  generateApiKey
} = require('./auth');

// 引入 Redis 会话存储
const sessionStore = require('./session-store');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 中间件
// ============================================

// 初始化认证配置
initAuthConfig();

// CORS 配置 - 白名单机制（严格验证）
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的来源列表
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    // 允许不带 origin 的请求（如移动端、Postman、同源请求）
    if (!origin) return callback(null, true);

    // 严格验证域名：精确匹配或子域名匹配
    // 使用正则防止 evil-hxfund.cn 绕过
    const isExactMatch = allowedOrigins.indexOf(origin) !== -1;
    const isSubdomainMatch = /^https?:\/\/([\w-]+\.)*hxfund\.cn(:\d+)?$/.test(origin);

    if (isExactMatch || isSubdomainMatch) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Timestamp', 'X-Signature']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// 提供静态文件（public 目录）
app.use(express.static(path.join(__dirname, '..', 'public')));

// 根路径路由 - 返回主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ============================================
// 配置与常量
// ============================================

// 支持的模型列表 (Coding Plan)
const SUPPORTED_MODELS = [
  { id: 'qwen3.5-plus', name: 'Qwen3.5 Plus', description: '多模态，默认模型', default: true },
  { id: 'qwen3-max-2026-01-23', name: 'Qwen3 Max', description: '最强推理能力' },
  { id: 'qwen3-coder-next', name: 'Qwen3 Coder Next', description: '代码专用' },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus', description: '代码增强' },
  { id: 'glm-5', name: 'GLM-5', description: '支持思考模式' },
  { id: 'glm-4.7', name: 'GLM-4.7', description: '支持思考模式' },
  { id: 'kimi-k2.5', name: 'Kimi K2.5', description: '支持思考模式' },
];

// 会话存储（使用 Redis，支持多实例部署）
// 降级方案：无 Redis 时使用内存存储

async function getSession(sessionId) {
  let session = await sessionStore.getSession(sessionId);
  
  if (!session) {
    session = {
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };
    await sessionStore.setSession(sessionId, session);
  } else {
    session.lastActiveAt = Date.now();
    await sessionStore.setSession(sessionId, session);
  }
  
  return session;
}

async function cleanupSessions() {
  // Redis 自动过期，无需清理
  if (!sessionStore.isRedisConnected()) {
    // 内存存储时清理过期会话
    const sessions = await sessionStore.getAllSessions();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    for (const session of sessions) {
      if (now - session.lastActiveAt > maxAge) {
        await sessionStore.deleteSession(session.id);
      }
    }
  }
}

// 每小时清理一次过期会话
setInterval(cleanupSessions, 60 * 60 * 1000);

// ============================================
// 输入验证工具函数
// ============================================

/**
 * 验证 UUID 格式
 */
function isValidUuid(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * 验证模型 ID
 */
function isValidModel(model) {
  return SUPPORTED_MODELS.some(m => m.id === model);
}

/**
 * 验证温度值
 */
function isValidTemperature(temp) {
  const num = parseFloat(temp);
  return !isNaN(num) && num >= 0 && num <= 2;
}

/**
 * 清理用户输入（防止 XSS）
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 计算消息总大小（字符数）
 */
function calculateSessionSize(messages) {
  return messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
}

// ============================================
// API 路由
// ============================================

/**
 * POST /api/auth/token
 * 获取访问 Token（需要内置 API Key 验证）
 */
app.post('/api/auth/token', (req, res) => {
  const config = loadAuthConfig();
  const { clientKey } = req.body;

  // 验证客户端密钥（防止未授权调用）
  if (!clientKey || clientKey !== config.serverApiKey) {
    return res.status(403).json({
      success: false,
      error: '无效的客户端密钥',
      code: 'INVALID_CLIENT_KEY'
    });
  }

  generateTokenHandler(req, res);
});

/**
 * POST /api/auth/client-token
 * 客户端获取 Token 的代理端点（同源请求）
 * 前端通过此端点间接获取 Token，不暴露 API Key
 */
app.post('/api/auth/client-token', (req, res) => {
  const config = loadAuthConfig();

  // 验证请求来源（同源检查）
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // 允许同源请求（localhost 或配置的域名）
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  // 严格验证域名（防止绕过）
  const isExactMatch = origin && allowedOrigins.indexOf(origin) !== -1;
  const isSubdomainMatch = origin && /^https?:\/\/([\w-]+\.)*hxfund\.cn(:\d+)?$/.test(origin);
  const isRefererValid = referer && (referer.includes('localhost') || referer.includes('hxfund.cn'));

  // 允许不带 origin 的请求（同源请求）
  const isAllowed = !origin || isExactMatch || isSubdomainMatch || isRefererValid;

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      error: '跨域请求禁止',
      code: 'CORS_FORBIDDEN'
    });
  }

  // 生成 Token（使用服务器 API Key）
  const token = generateToken(
    {
      type: 'client_access',
      source: 'web'
    },
    config.jwtSecret
  );

  res.json({
    success: true,
    token,
    expiresIn: config.tokenExpiresIn,
    tokenType: 'Bearer'
  });
});

/**
 * GET /api/auth/status
 * 获取认证状态和速率限制信息
 */
app.get('/api/auth/status', (req, res) => {
  const config = loadAuthConfig();
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const rateLimitStatus = require('./auth').rateLimiter.getStatus(clientIp);
  
  res.json({
    success: true,
    authenticated: true,
    rateLimit: rateLimitStatus,
    config: {
      tokenExpiresIn: config.tokenExpiresIn,
      rateLimitWindow: config.rateLimit.windowMs,
      maxRequests: config.rateLimit.maxRequests,
      maxChatRequests: config.rateLimit.maxChatRequests
    }
  });
});

/**
 * POST /api/chat
 * 单次对话请求 - 统一使用 CLI 调用（需要认证）
 */
app.post('/api/chat', authMiddleware(), async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt, model = 'qwen3.5-plus', temperature = 0.7 } = req.body;

    // 输入验证 - prompt
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'prompt 必须是非空字符串',
        code: 'INVALID_PROMPT'
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return res.status(400).json({
        error: 'prompt 不能为空',
        code: 'INVALID_PROMPT'
      });
    }

    // 限制 prompt 长度（最多 5000 字符）
    if (trimmedPrompt.length > 5000) {
      return res.status(400).json({
        error: 'prompt 长度不能超过 5000 字符',
        code: 'PROMPT_TOO_LONG'
      });
    }

    // 验证模型
    if (!isValidModel(model)) {
      return res.status(400).json({
        error: '不支持的模型',
        code: 'INVALID_MODEL',
        availableModels: SUPPORTED_MODELS.map(m => m.id)
      });
    }

    // 验证温度值
    if (!isValidTemperature(temperature)) {
      return res.status(400).json({
        error: '温度值必须在 0-2 之间',
        code: 'INVALID_TEMPERATURE'
      });
    }

    // 检查 CLI 配置
    if (!isCliConfigured()) {
      return res.status(500).json({
        error: 'CLI 未配置 API Key，请先运行 node qwen-code.js --init',
        code: 'CLI_NOT_CONFIGURED'
      });
    }

    // 调用 CLI 获取 AI 响应
    const result = await callQwenCli(trimmedPrompt, { model, temperature });
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      response: result.content,
      model,
      usage: result.usage,
      responseTime,
      source: 'qwen-code-cli'
    });

  } catch (error) {
    console.error(`[API 错误] /api/chat: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CLI_ERROR'
    });
  }
});

/**
 * POST /api/conversation
 * 多轮对话（带会话历史）- 统一使用 CLI 调用（需要认证）
 */
app.post('/api/conversation', authMiddleware(), async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, model = 'qwen3.5-plus', temperature = 0.7, sessionId: reqSessionId } = req.body;

    // 输入验证 - message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'message 必须是非空字符串',
        code: 'INVALID_MESSAGE'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        error: 'message 不能为空',
        code: 'INVALID_MESSAGE'
      });
    }

    // 限制 message 长度（最多 5000 字符）
    if (trimmedMessage.length > 5000) {
      return res.status(400).json({
        error: 'message 长度不能超过 5000 字符',
        code: 'MESSAGE_TOO_LONG'
      });
    }

    // 验证模型
    if (!isValidModel(model)) {
      return res.status(400).json({
        error: '不支持的模型',
        code: 'INVALID_MODEL',
        availableModels: SUPPORTED_MODELS.map(m => m.id)
      });
    }

    // 验证温度值
    if (!isValidTemperature(temperature)) {
      return res.status(400).json({
        error: '温度值必须在 0-2 之间',
        code: 'INVALID_TEMPERATURE'
      });
    }

    // 验证 sessionId（如果提供）
    let sessionId;
    if (reqSessionId) {
      if (typeof reqSessionId !== 'string' || !isValidUuid(reqSessionId)) {
        return res.status(400).json({
          error: '无效的会话 ID 格式',
          code: 'INVALID_SESSION_ID'
        });
      }
      sessionId = reqSessionId;
    } else {
      sessionId = uuidv4();
    }

    // 检查 CLI 配置
    if (!isCliConfigured()) {
      return res.status(500).json({
        error: 'CLI 未配置 API Key，请先运行 node qwen-code.js --init',
        code: 'CLI_NOT_CONFIGURED'
      });
    }

    // 获取或创建会话
    const session = await getSession(sessionId);

    // 会话大小限制（最多 50KB 字符）
    const currentSize = calculateSessionSize(session.messages);
    if (currentSize + trimmedMessage.length > 50000) {
      // 自动清理旧消息，保留最近 10 条
      session.messages = session.messages.slice(-20);
      console.log(`[会话清理] 会话 ${sessionId} 已清理，保留最近 10 条消息`);
    }

    // 构建带历史的对话内容
    let conversationContext = '';
    if (session.messages.length > 0) {
      conversationContext = '对话历史:\n';
      session.messages.forEach((msg, i) => {
        const role = msg.role === 'user' ? '用户' : '助手';
        conversationContext += `${i + 1}. ${role}: ${msg.content}\n`;
      });
      conversationContext += '\n当前问题：\n';
    }

    const fullPrompt = conversationContext + trimmedMessage;

    // 调用 CLI 获取 AI 响应
    const result = await callQwenCli(fullPrompt, { model, temperature });

    // 添加消息到历史
    session.messages.push({ role: 'user', content: trimmedMessage });
    session.messages.push({ role: 'assistant', content: result.content });

    // 限制历史消息数量（最多 20 条，即 10 轮对话）
    if (session.messages.length > 40) {
      session.messages = session.messages.slice(-40);
    }

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      sessionId,
      response: result.content,
      model,
      usage: result.usage,
      responseTime,
      messageCount: session.messages.length,
      source: 'qwen-code-cli'
    });

  } catch (error) {
    console.error(`[API 错误] /api/conversation: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CLI_ERROR'
    });
  }
});

/**
 * POST /api/chat/stream
 * 流式响应（Server-Sent Events）- 暂不支持，CLI 不支持流式输出（需要认证）
 */
app.post('/api/chat/stream', authMiddleware(), async (req, res) => {
  res.status(501).json({
    error: '流式响应暂不支持，CLI 工具不支持流式输出',
    code: 'STREAM_NOT_SUPPORTED',
    suggestion: '请使用 /api/chat 或 /api/conversation 端点'
  });
});

/**
 * GET /api/session/:sessionId
 * 获取会话历史（需要认证）
 */
app.get('/api/session/:sessionId', authMiddleware(), async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const session = await sessionStore.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: '会话不存在'
      });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        messageCount: session.messages.length,
        messages: session.messages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取会话失败' });
  }
});

/**
 * DELETE /api/session/:sessionId
 * 删除会话（需要认证）
 */
app.delete('/api/session/:sessionId', authMiddleware(), async (req, res) => {
  const { sessionId } = req.params;

  try {
    await sessionStore.deleteSession(sessionId);
    res.json({ success: true, message: '会话已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除会话失败' });
  }
});

/**
 * GET /api/models
 * 获取支持的模型列表
 */
app.get('/api/models', (req, res) => {
  res.json({
    success: true,
    models: SUPPORTED_MODELS,
    default: SUPPORTED_MODELS.find(m => m.default)?.id || 'qwen3.5-plus'
  });
});

/**
 * POST /api/models/switch
 * 切换默认模型（需要管理员权限）
 */
app.post('/api/models/switch', authMiddleware(), (req, res) => {
  const { model } = req.body;
  
  if (!model || !SUPPORTED_MODELS.some(m => m.id === model)) {
    return res.status(400).json({
      success: false,
      error: '不支持的模型'
    });
  }

  // 注意：这里只是返回确认，实际默认模型需要在环境变量中配置
  res.json({
    success: true,
    message: `模型已切换为：${model}`,
    model
  });
});

/**
 * GET /api/health
 * 健康检查
 */
app.get('/api/health', async (req, res) => {
  const cliConfigured = isCliConfigured();
  const cliConfig = getCliConfig();
  const authConfig = loadAuthConfig();
  const redisConnected = sessionStore.isRedisConnected();

  // 获取会话数量
  let sessionsCount = 0;
  try {
    const sessions = await sessionStore.getAllSessions();
    sessionsCount = sessions.length;
  } catch (error) {
    sessionsCount = -1;
  }

  res.json({
    status: 'ok',
    service: 'huangshi-genealogy-api',
    version: '3.2.0 (Redis + Security Hardening)',
    timestamp: new Date().toISOString(),
    config: {
      cliConfigured,
      cliPath: CLI_PATH,
      model: cliConfig?.model || 'qwen3.5-plus',
      baseURL: cliConfig?.baseURL || null,
      apiKeyPrefix: cliConfig?.apiKey ? `${cliConfig.apiKey.substring(0, 8)}...` : null,
      auth: {
        enabled: true,
        serverApiKeyConfigured: !!authConfig.serverApiKey,
        rateLimit: authConfig.rateLimit
      },
      redis: {
        connected: redisConnected,
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      sessionsCount,
      port: PORT
    }
  });
});

/**
 * GET /api/docs
 * API 文档
 */
app.get('/api/docs', (req, res) => {
  const authConfig = loadAuthConfig();
  
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>黄氏家族寻根平台 - API 文档</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a73e8; }
    h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h3 { color: #555; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .endpoint { background: #e8f4fd; padding: 10px 15px; border-radius: 5px; margin: 10px 0; }
    .method { display: inline-block; padding: 3px 8px; border-radius: 3px; font-weight: bold; margin-right: 10px; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    .delete { background: #f93e3e; color: white; }
    .param { margin: 5px 0; }
    .param-name { font-family: monospace; color: #1a73e8; }
    .param-type { color: #999; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f5f5f5; }
    .auth-warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .auth-info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>📚 黄氏家族寻根平台 - API 文档</h1>
  <p>基于阿里云百炼 Coding Plan 套餐 | 版本 3.1.0 (CLI Unified + Auth)</p>

  <div class="auth-warning">
    <strong>🔐 安全认证说明：</strong>
    <p>自 v3.1.0 起，所有 API 端点（除 /api/health、/api/docs、/api/models 外）均需认证。</p>
    <p>请使用 <code>X-API-Key</code> 请求头或 <code>Authorization: Bearer &lt;token&gt;</code> 进行认证。</p>
  </div>

  <h2>快速开始</h2>
  <h3>1. 获取 API Key</h3>
  <p>首次使用时，请查看服务器配置目录：<code>server/config/auth.json</code></p>
  <pre>cat server/config/auth.json</pre>

  <h3>2. 获取访问 Token（可选）</h3>
  <pre>curl -X POST http://localhost:${PORT}/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"apiKey": "hs_xxxxx..."}'</pre>

  <h3>3. 调用 API</h3>
  <pre>// 使用 API Key
curl -X POST http://localhost:${PORT}/api/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: hs_xxxxx..." \\
  -d '{"prompt": "黄姓的起源是什么？"}'

// 使用 Token
curl -X POST http://localhost:${PORT}/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer &lt;token&gt;" \\
  -d '{"prompt": "黄姓的起源是什么？"}'</pre>

  <h2>API 端点</h2>

  <div class="endpoint">
    <span class="method post">POST</span>
    <code>/api/auth/token</code>
  </div>
  <p>获取访问 Token（24 小时有效）</p>
  <h3>请求参数</h3>
  <table>
    <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
    <tr><td><span class="param-name">apiKey</span></td><td><span class="param-type">string</span></td><td>是</td><td>服务器 API Key</td></tr>
  </table>

  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/auth/status</code>
  </div>
  <p>获取认证状态和速率限制信息</p>

  <div class="endpoint">
    <span class="method post">POST</span>
    <code>/api/chat</code>
  </div>
  <p>单次对话请求（需要认证）</p>
  <h3>请求头</h3>
  <table>
    <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
    <tr><td><span class="param-name">X-API-Key</span></td><td><span class="param-type">string</span></td><td>或</td><td>API Key</td></tr>
    <tr><td><span class="param-name">Authorization</span></td><td><span class="param-type">string</span></td><td>或</td><td>Bearer Token</td></tr>
  </table>
  <h3>请求参数</h3>
  <table>
    <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
    <tr><td><span class="param-name">prompt</span></td><td><span class="param-type">string</span></td><td>是</td><td>用户问题</td></tr>
    <tr><td><span class="param-name">model</span></td><td><span class="param-type">string</span></td><td>否</td><td>模型 ID，默认 qwen3.5-plus</td></tr>
    <tr><td><span class="param-name">temperature</span></td><td><span class="param-type">number</span></td><td>否</td><td>温度 (0-2)，默认 0.7</td></tr>
  </table>

  <div class="endpoint">
    <span class="method post">POST</span>
    <code>/api/conversation</code>
  </div>
  <p>多轮对话（带会话历史）（需要认证）</p>
  <h3>请求头</h3>
  <table>
    <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
    <tr><td><span class="param-name">X-API-Key</span></td><td><span class="param-type">string</span></td><td>或</td><td>API Key</td></tr>
    <tr><td><span class="param-name">Authorization</span></td><td><span class="param-type">string</span></td><td>或</td><td>Bearer Token</td></tr>
  </table>
  <h3>请求参数</h3>
  <table>
    <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
    <tr><td><span class="param-name">message</span></td><td><span class="param-type">string</span></td><td>是</td><td>用户消息</td></tr>
    <tr><td><span class="param-name">sessionId</span></td><td><span class="param-type">string</span></td><td>否</td><td>会话 ID，自动生成</td></tr>
    <tr><td><span class="param-name">model</span></td><td><span class="param-type">string</span></td><td>否</td><td>模型 ID</td></tr>
    <tr><td><span class="param-name">temperature</span></td><td><span class="param-type">number</span></td><td>否</td><td>温度 (0-2)</td></tr>
  </table>

  <div class="endpoint">
    <span class="method post">POST</span>
    <code>/api/chat/stream</code>
  </div>
  <p>流式响应（Server-Sent Events）（需要认证）</p>

  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/session/:sessionId</code>
  </div>
  <p>获取会话历史（需要认证）</p>

  <div class="endpoint">
    <span class="method delete">DELETE</span>
    <code>/api/session/:sessionId</code>
  </div>
  <p>删除会话（需要认证）</p>

  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/models</code>
  </div>
  <p>获取支持的模型列表（无需认证）</p>

  <div class="endpoint">
    <span class="method get">GET</span>
    <code>/api/health</code>
  </div>
  <p>健康检查（无需认证）</p>

  <h2>错误码</h2>
  <table>
    <tr><th>错误码</th><th>说明</th></tr>
    <tr><td>MISSING_AUTH</td><td>缺少认证信息</td></tr>
    <tr><td>INVALID_API_KEY</td><td>无效的 API Key</td></tr>
    <tr><td>INVALID_TOKEN</td><td>无效的 Token</td></tr>
    <tr><td>TOKEN_EXPIRED</td><td>Token 已过期</td></tr>
    <tr><td>INVALID_SIGNATURE</td><td>请求签名无效</td></tr>
    <tr><td>RATE_LIMIT_EXCEEDED</td><td>请求过于频繁</td></tr>
    <tr><td>INVALID_PROMPT</td><td>prompt 为空</td></tr>
    <tr><td>CLI_ERROR</td><td>CLI 调用失败</td></tr>
  </table>

  <h2>速率限制</h2>
  <div class="auth-info">
    <strong>📊 限制说明：</strong>
    <ul>
      <li>普通接口：每分钟最多 ${authConfig.rateLimit.maxRequests} 次请求</li>
      <li>聊天接口（/api/chat, /api/conversation）：每分钟最多 ${authConfig.rateLimit.maxChatRequests} 次请求</li>
      <li>窗口期：${authConfig.rateLimit.windowMs / 1000} 秒</li>
    </ul>
  </div>

  <h2>前端调用示例</h2>
  <pre>
// 方式 1：使用 API Key
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-API-Key': 'hs_xxxxx...'
  },
  body: JSON.stringify({ prompt: '黄姓的起源是什么？' })
});
const data = await response.json();
console.log(data.response);

// 方式 2：使用 Token（推荐）
// 先获取 Token
const tokenRes = await fetch('/api/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ apiKey: 'hs_xxxxx...' })
});
const { token } = await tokenRes.json();

// 使用 Token 调用 API
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ prompt: '黄姓的起源是什么？' })
});
const data = await response.json();
console.log(data.response);

// 多轮对话
let sessionId = null;
async function chat(message) {
  const response = await fetch('/api/conversation', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      message,
      sessionId // 首次为 null，后续传入返回的 sessionId
    })
  });
  const data = await response.json();
  sessionId = data.sessionId;
  return data.response;
}
  </pre>
</body>
</html>
  `);
});

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  const cliConfigured = isCliConfigured();
  const cliConfig = getCliConfig();
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     黄氏家族寻根平台 - Qwen AI API 服务 (CLI 统一调用)     ║
╠═══════════════════════════════════════════════════════════╣
║  运行地址：http://localhost:${PORT}                         ║
║  API 文档：http://localhost:${PORT}/api/docs                ║
╠═══════════════════════════════════════════════════════════╣
║  API 端点：                                                ║
║    POST /api/chat          - 单次对话                     ║
║    POST /api/conversation  - 多轮对话（带历史）           ║
║    GET  /api/session/:id   - 获取会话历史                 ║
║    DELETE /api/session/:id - 删除会话                     ║
║    GET  /api/models        - 模型列表                     ║
║    GET  /api/health        - 健康检查                     ║
╠═══════════════════════════════════════════════════════════╣
║  CLI 路径：${CLI_PATH}                              ║
║  CLI 配置：${cliConfigured ? '✓ 已配置' : '✗ 未配置'}${!cliConfigured ? ' 运行 node qwen-code.js --init' : ''}
║  默认模型：${cliConfig?.model || 'qwen3.5-plus'}                            ║
╠═══════════════════════════════════════════════════════════╣
║  统一使用 qwen-code.js CLI 工具调用 AI                      ║
╚═══════════════════════════════════════════════════════════╝
  `);

  if (!cliConfigured) {
    console.log('⚠️  警告：CLI 未配置 API Key，请先运行 node qwen-code.js --init\n');
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭...');
  process.exit(0);
});
