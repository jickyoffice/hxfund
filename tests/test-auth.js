/**
 * 黄氏家族寻根平台 - API 认证功能测试脚本
 * 
 * 测试认证系统：API Key、Token、速率限制
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP 请求封装
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

// 加载 API Key
function loadApiKey() {
  const authConfigPath = path.join(__dirname, 'server', 'config', 'auth.json');
  try {
    if (fs.existsSync(authConfigPath)) {
      const config = JSON.parse(fs.readFileSync(authConfigPath, 'utf-8'));
      return config.serverApiKey;
    }
  } catch (error) {
    console.error('读取认证配置失败:', error.message);
  }
  return null;
}

// 测试主函数
async function runTests() {
  log(colors.cyan, '\n╔═══════════════════════════════════════════════════════════╗');
  log(colors.cyan, '║     黄氏家族寻根平台 - API 认证功能测试                     ║');
  log(colors.cyan, '╚═══════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;
  let apiKey = null;
  let authToken = null;

  // 测试 1: 健康检查（无需认证）
  log(colors.blue, '【测试 1】健康检查 API（无需认证）...');
  try {
    const res = await request('/api/health');
    if (res.status === 200 && res.data.status === 'ok') {
      log(colors.green, '✓ 健康检查通过');
      log(colors.yellow, `  服务版本：${res.data.version}`);
      log(colors.yellow, `  认证启用：${res.data.config.auth?.enabled ? '是' : '否'}`);
      passed++;
    } else {
      log(colors.red, `✗ 健康检查失败：${JSON.stringify(res.data)}`);
      failed++;
    }
  } catch (error) {
    log(colors.red, `✗ 健康检查失败：${error.message}`);
    log(colors.red, '  提示：请先启动服务器 npm start');
    failed++;
    log(colors.yellow, '\n⚠️  服务器未运行，终止测试\n');
    return;
  }

  // 测试 2: 获取模型列表（无需认证）
  log(colors.blue, '\n【测试 2】获取模型列表 API（无需认证）...');
  try {
    const res = await request('/api/models');
    if (res.status === 200 && res.data.success) {
      log(colors.green, '✓ 模型列表获取成功');
      passed++;
    } else {
      log(colors.red, `✗ 模型列表获取失败：${JSON.stringify(res.data)}`);
      failed++;
    }
  } catch (error) {
    log(colors.red, `✗ 模型列表获取失败：${error.message}`);
    failed++;
  }

  // 测试 3: 未认证访问受保护接口
  log(colors.blue, '\n【测试 3】未认证访问 /api/chat（应被拒绝）...');
  try {
    const res = await request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { prompt: '测试' }
    });
    if (res.status === 401 && res.data.code === 'MISSING_AUTH') {
      log(colors.green, '✓ 认证拦截正确');
      log(colors.yellow, `  错误码：${res.data.code}`);
      passed++;
    } else {
      log(colors.red, `✗ 认证拦截失败：HTTP ${res.status}`);
      failed++;
    }
  } catch (error) {
    log(colors.red, `✗ 测试失败：${error.message}`);
    failed++;
  }

  // 测试 4: 获取 API Key
  log(colors.blue, '\n【测试 4】加载服务器 API Key...');
  apiKey = loadApiKey();
  if (apiKey) {
    log(colors.green, '✓ API Key 加载成功');
    log(colors.yellow, `  API Key: ${apiKey.substring(0, 10)}...`);
    passed++;
  } else {
    log(colors.red, '✗ API Key 加载失败');
    log(colors.red, '  提示：请先启动服务器生成认证配置');
    failed++;
    log(colors.yellow, '\n⚠️  无法继续认证测试，终止\n');
    return;
  }

  // 测试 5: 使用 API Key 获取 Token
  log(colors.blue, '\n【测试 5】获取访问 Token...');
  try {
    const res = await request('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { apiKey }
    });
    if (res.status === 200 && res.data.success) {
      authToken = res.data.token;
      log(colors.green, '✓ Token 获取成功');
      log(colors.yellow, `  Token: ${authToken.substring(0, 30)}...`);
      log(colors.yellow, `  有效期：${res.data.expiresIn / 1000 / 60 / 60} 小时`);
      passed++;
    } else {
      log(colors.red, `✗ Token 获取失败：${JSON.stringify(res.data)}`);
      failed++;
    }
  } catch (error) {
    log(colors.red, `✗ Token 获取失败：${error.message}`);
    failed++;
  }

  // 测试 6: 使用无效 API Key 获取 Token
  log(colors.blue, '\n【测试 6】无效 API Key 获取 Token（应被拒绝）...');
  try {
    const res = await request('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { apiKey: 'hs_invalid_key_12345' }
    });
    if (res.status === 403 && res.data.code === 'INVALID_API_KEY') {
      log(colors.green, '✓ 无效 API Key 拦截正确');
      passed++;
    } else {
      log(colors.red, `✗ 拦截失败：HTTP ${res.status}`);
      failed++;
    }
  } catch (error) {
    log(colors.red, `✗ 测试失败：${error.message}`);
    failed++;
  }

  // 测试 7: 使用 Token 访问受保护接口
  if (authToken) {
    log(colors.blue, '\n【测试 7】使用 Token 访问 /api/chat...');
    try {
      const res = await request('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: { prompt: '你好，请用 20 字以内打招呼', model: 'qwen3.5-plus' }
      });
      if (res.status === 200 && res.data.success) {
        log(colors.green, '✓ Token 认证成功');
        log(colors.yellow, `  响应时间：${res.data.responseTime}ms`);
        log(colors.yellow, `  AI 回复：${res.data.response.substring(0, 50)}...`);
        passed++;
      } else {
        log(colors.red, `✗ Token 认证失败：${JSON.stringify(res.data)}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `✗ Token 认证失败：${error.message}`);
      failed++;
    }

    // 测试 8: 使用 API Key 直接访问
    log(colors.blue, '\n【测试 8】使用 API Key 访问 /api/conversation...');
    try {
      const res = await request('/api/conversation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: { message: '测试对话', model: 'qwen3.5-plus' }
      });
      if (res.status === 200 && res.data.success) {
        log(colors.green, '✓ API Key 认证成功');
        passed++;
      } else {
        log(colors.red, `✗ API Key 认证失败：${JSON.stringify(res.data)}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `✗ API Key 认证失败：${error.message}`);
      failed++;
    }

    // 测试 9: 使用无效 Token
    log(colors.blue, '\n【测试 9】无效 Token 访问（应被拒绝）...');
    try {
      const res = await request('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_token_xyz'
        },
        body: { prompt: '测试' }
      });
      if (res.status === 401 && (res.data.code === 'INVALID_TOKEN' || res.data.code === 'TOKEN_EXPIRED')) {
        log(colors.green, '✓ 无效 Token 拦截正确');
        passed++;
      } else {
        log(colors.red, `✗ 拦截失败：HTTP ${res.status}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `✗ 测试失败：${error.message}`);
      failed++;
    }

    // 测试 10: 获取认证状态
    log(colors.blue, '\n【测试 10】获取认证状态和速率限制...');
    try {
      const res = await request('/api/auth/status', {
        headers: { 
          'Authorization': 'Bearer ' + authToken
        }
      });
      if (res.status === 200 && res.data.success) {
        log(colors.green, '✓ 认证状态获取成功');
        log(colors.yellow, `  速率限制：${res.data.rateLimit.general.remaining}/${res.data.rateLimit.general.limit} (普通)`);
        log(colors.yellow, `  速率限制：${res.data.rateLimit.chat.remaining}/${res.data.rateLimit.chat.limit} (聊天)`);
        passed++;
      } else {
        log(colors.red, `✗ 认证状态获取失败：${JSON.stringify(res.data)}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `✗ 认证状态获取失败：${error.message}`);
      failed++;
    }

    // 测试 11: 速率限制头
    log(colors.blue, '\n【测试 11】检查速率限制响应头...');
    try {
      const res = await request('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: { prompt: '速率限制测试' }
      });
      const hasLimitHeader = res.headers['x-ratelimit-limit'] !== undefined;
      const hasRemainingHeader = res.headers['x-ratelimit-remaining'] !== undefined;
      const hasResetHeader = res.headers['x-ratelimit-reset'] !== undefined;
      
      if (hasLimitHeader && hasRemainingHeader && hasResetHeader) {
        log(colors.green, '✓ 速率限制响应头完整');
        log(colors.yellow, `  X-RateLimit-Limit: ${res.headers['x-ratelimit-limit']}`);
        log(colors.yellow, `  X-RateLimit-Remaining: ${res.headers['x-ratelimit-remaining']}`);
        passed++;
      } else {
        log(colors.red, `✗ 速率限制响应头不完整`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `✗ 测试失败：${error.message}`);
      failed++;
    }
  }

  // 总结
  log(colors.cyan, '\n╔═══════════════════════════════════════════════════════════╗');
  log(colors.cyan, '║                    测试总结                               ║');
  log(colors.cyan, '╠═══════════════════════════════════════════════════════════╣');
  log(colors.cyan, `║  通过：${passed}  失败：${failed}                                ║`);
  log(colors.cyan, '╚═══════════════════════════════════════════════════════════╝\n');

  if (failed === 0) {
    log(colors.green, '🎉 所有认证测试通过！\n');
  } else {
    log(colors.red, `⚠️  有 ${failed} 个测试失败，请检查日志\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  log(colors.red, `\n❌ 测试执行失败：${error.message}`);
  process.exit(1);
});
