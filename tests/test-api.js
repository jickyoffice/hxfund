/**
 * 黄氏家族寻根平台 - API 测试脚本
 * 
 * 测试统一 CLI 调用功能
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// 发送 HTTP 请求
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 测试健康检查
async function testHealth() {
  console.log('\n📋 测试 1: 健康检查');
  console.log('=' .repeat(50));
  
  const res = await request('GET', '/api/health');
  console.log(`状态码：${res.status}`);
  console.log(`服务版本：${res.data.version}`);
  console.log(`CLI 配置：${res.data.config.cliConfigured ? '✓ 已配置' : '✗ 未配置'}`);
  console.log(`CLI 路径：${res.data.config.cliPath}`);
  console.log(`默认模型：${res.data.config.model}`);
  
  if (res.status === 200 && res.data.status === 'ok') {
    console.log('✅ 健康检查通过');
    return true;
  } else {
    console.log('❌ 健康检查失败');
    return false;
  }
}

// 测试模型列表
async function testModels() {
  console.log('\n📋 测试 2: 获取模型列表');
  console.log('=' .repeat(50));
  
  const res = await request('GET', '/api/models');
  console.log(`状态码：${res.status}`);
  
  if (res.data.success && res.data.models) {
    console.log(`模型数量：${res.data.models.length}`);
    res.data.models.forEach(m => {
      console.log(`  - ${m.id} (${m.name})${m.default ? ' [默认]' : ''}`);
    });
    console.log('✅ 模型列表获取成功');
    return true;
  } else {
    console.log('❌ 模型列表获取失败');
    return false;
  }
}

// 测试单次对话
async function testSingleChat() {
  console.log('\n📋 测试 3: 单次对话测试');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  const res = await request('POST', '/api/chat', {
    prompt: '黄姓的起源是什么？请用 50 字以内简要回答。',
    model: 'qwen3.5-plus',
    temperature: 0.7
  });
  const duration = Date.now() - startTime;
  
  console.log(`状态码：${res.status}`);
  console.log(`响应时间：${duration}ms`);
  
  if (res.status === 200 && res.data.success) {
    console.log(`模型：${res.data.model}`);
    console.log(`Token 用量：${res.data.usage?.total_tokens || 0}`);
    console.log(`来源：${res.data.source}`);
    console.log(`\nAI 回复:\n${'-' .repeat(40)}`);
    console.log(res.data.response);
    console.log('-' .repeat(40));
    console.log('✅ 单次对话测试通过');
    return true;
  } else {
    console.log(`错误：${res.data?.error || '未知错误'}`);
    console.log('❌ 单次对话测试失败');
    return false;
  }
}

// 测试多轮对话
async function testConversation() {
  console.log('\n📋 测试 4: 多轮对话测试');
  console.log('=' .repeat(50));
  
  let sessionId = null;
  
  // 第一轮对话
  console.log('第 1 轮：打招呼');
  let res1 = await request('POST', '/api/conversation', {
    message: '你好，请自我介绍',
    model: 'qwen3.5-plus'
  });
  
  if (res1.status !== 200 || !res1.data.success) {
    console.log(`❌ 第 1 轮对话失败：${res1.data?.error}`);
    return false;
  }
  
  sessionId = res1.data.sessionId;
  console.log(`会话 ID: ${sessionId}`);
  console.log(`AI: ${res1.data.response.substring(0, 100)}...`);
  
  // 第二轮对话
  console.log('\n第 2 轮：询问黄姓起源');
  let res2 = await request('POST', '/api/conversation', {
    message: '黄姓的起源是什么？',
    sessionId,
    model: 'qwen3.5-plus'
  });
  
  if (res2.status !== 200 || !res2.data.success) {
    console.log(`❌ 第 2 轮对话失败：${res2.data?.error}`);
    return false;
  }
  
  console.log(`AI: ${res2.data.response.substring(0, 100)}...`);
  console.log(`消息数：${res2.data.messageCount}`);
  
  // 第三轮对话
  console.log('\n第 3 轮：追问');
  let res3 = await request('POST', '/api/conversation', {
    message: '黄姓有哪些著名人物？',
    sessionId,
    model: 'qwen3.5-plus'
  });
  
  if (res3.status !== 200 || !res3.data.success) {
    console.log(`❌ 第 3 轮对话失败：${res3.data?.error}`);
    return false;
  }
  
  console.log(`AI: ${res3.data.response.substring(0, 100)}...`);
  
  console.log('\n✅ 多轮对话测试通过');
  return true;
}

// 测试获取会话历史
async function testSessionHistory() {
  console.log('\n📋 测试 5: 获取会话历史');
  console.log('=' .repeat(50));
  
  // 先创建一个会话
  const res1 = await request('POST', '/api/conversation', {
    message: '测试会话'
  });
  
  if (!res1.data.success) {
    console.log('❌ 创建会话失败');
    return false;
  }
  
  const sessionId = res1.data.sessionId;
  
  // 获取会话历史
  const res2 = await request('GET', `/api/session/${sessionId}`);
  
  if (res2.status === 200 && res2.data.success) {
    console.log(`会话 ID: ${res2.data.session.id}`);
    console.log(`消息数：${res2.data.session.messageCount}`);
    console.log(`创建时间：${new Date(res2.data.session.createdAt).toLocaleString()}`);
    console.log('✅ 会话历史获取成功');
    return true;
  } else {
    console.log(`❌ 会话历史获取失败：${res2.data?.error}`);
    return false;
  }
}

// 测试删除会话
async function testDeleteSession() {
  console.log('\n📋 测试 6: 删除会话');
  console.log('=' .repeat(50));
  
  // 先创建一个会话
  const res1 = await request('POST', '/api/conversation', {
    message: '临时会话'
  });
  
  if (!res1.data.success) {
    console.log('❌ 创建会话失败');
    return false;
  }
  
  const sessionId = res1.data.sessionId;
  
  // 删除会话
  const res2 = await request('DELETE', `/api/session/${sessionId}`);
  
  if (res2.status === 200 && res2.data.success) {
    console.log(`✅ 会话删除成功`);
    
    // 验证会话已删除
    const res3 = await request('GET', `/api/session/${sessionId}`);
    if (res3.status === 404) {
      console.log(`✅ 验证会话已删除`);
      return true;
    }
  }
  
  console.log(`❌ 删除会话失败：${res2.data?.error}`);
  return false;
}

// 主测试流程
async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     黄氏家族寻根平台 - API 功能测试                        ║');
  console.log('║     版本：v3.0.0 (CLI Unified)                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  // 运行所有测试
  results.push(await testHealth());
  results.push(await testModels());
  results.push(await testSingleChat());
  results.push(await testConversation());
  results.push(await testSessionHistory());
  results.push(await testDeleteSession());
  
  // 汇总结果
  console.log('\n' + '═'.repeat(50));
  console.log('测试结果汇总');
  console.log('═'.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`通过：${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log(`\n⚠️  有 ${total - passed} 个测试失败`);
  }
  
  console.log('');
}

// 运行测试
runTests().catch((error) => {
  console.error('\n❌ 测试执行出错:', error.message);
  console.error(error.stack);
  process.exit(1);
});
