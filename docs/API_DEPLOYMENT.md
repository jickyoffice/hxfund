# 黄氏家族寻根平台 - API 部署文档

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 CLI 工具

运行初始化向导配置 API Key：

```bash
node qwen-code.js --init
```

或交互式配置：

```bash
node qwen-code.js -i
```

获取 API Key: https://bailian.console.aliyun.com/cn-beijing/?tab=service#/coding-plan

### 3. 启动服务

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

访问 http://localhost:3000/api/docs 查看 API 文档

---

## 架构说明

**v3.0.0 (CLI Unified)** - 统一使用 `qwen-code.js` CLI 工具调用 AI

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   前端 API   │────▶│ server/index │────▶│ qwen-code.js CLI │
│   请求      │     │   .js        │     │                  │
└─────────────┘     └──────────────┘     └─────────────────┘
                                              │
                                              ▼
                                     ┌───────────────┐
                                     │ 阿里云百炼    │
                                     │ Coding Plan   │
                                     └───────────────┘
```

**优势：**
- 统一配置管理（`~/.qwen-code/config.json`）
- 统一调用入口
- 支持 CLI 所有功能（模型切换、温度调节等）

---

## API 端点

### 单次对话

```bash
POST /api/chat
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 用户问题 |
| model | string | 否 | 模型 ID，默认 `qwen3.5-plus` |
| temperature | number | 否 | 温度 (0-2)，默认 0.7 |

**示例：**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "黄姓的起源是什么？"}'
```

**响应：**

```json
{
  "success": true,
  "response": "黄姓起源于...",
  "model": "qwen3.5-plus",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 100,
    "total_tokens": 120
  },
  "requestId": "abc123",
  "responseTime": 1500
}
```

---

### 多轮对话（带会话历史）

```bash
POST /api/conversation
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户消息 |
| sessionId | string | 否 | 会话 ID，首次可不传 |
| model | string | 否 | 模型 ID |
| temperature | number | 否 | 温度 (0-2) |

**示例：**

```bash
# 第一轮对话
curl -X POST http://localhost:3000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "黄姓的起源是什么？"}'

# 后续对话（带上返回的 sessionId）
curl -X POST http://localhost:3000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "那黄氏的字辈有哪些？", "sessionId": "返回的 sessionId"}'
```

---

### 流式响应（SSE）

```bash
POST /api/chat/stream
```

**前端示例：**

```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: '黄姓的起源是什么？' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  for (const line of chunk.split('\n')) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data.choices?.[0]?.delta?.content || '');
    }
  }
}
```

---

### 会话管理

#### 获取会话历史

```bash
GET /api/session/:sessionId
```

#### 删除会话

```bash
DELETE /api/session/:sessionId
```

---

### 模型管理

#### 获取模型列表

```bash
GET /api/models
```

**响应：**

```json
{
  "success": true,
  "models": [
    { "id": "qwen3.5-plus", "name": "Qwen3.5 Plus", "default": true },
    { "id": "qwen3-max-2026-01-23", "name": "Qwen3 Max" },
    ...
  ],
  "default": "qwen3.5-plus"
}
```

---

### 健康检查

```bash
GET /api/health
```

---

## 前端集成示例

### React Hook

```jsx
import { useState, useCallback } from 'react';

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sendMessage = useCallback(async (message) => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      return data.response;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { sendMessage, loading, sessionId };
}
```

### Vue Composable

```vue
<script setup>
import { ref } from 'vue';

export function useChat() {
  const loading = ref(false);
  const sessionId = ref(null);

  const sendMessage = async (message) => {
    loading.value = true;
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: sessionId.value })
      });
      const data = await res.json();
      sessionId.value = data.sessionId;
      return data.response;
    } finally {
      loading.value = false;
    }
  };

  return { sendMessage, loading, sessionId };
}
</script>
```

---

## 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t huangshi-api .
docker run -p 3000:3000 -e QWEN_API_KEY=sk-sp-xxx huangshi-api
```

### PM2 部署

```bash
npm install -g pm2
pm2 start server/index.js --name huangshi-api
pm2 save
pm2 startup
```

---

## 环境变量（可选）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |

**注意：** v3.0.0 版本不再需要 `QWEN_API_KEY` 环境变量，API Key 由 CLI 工具统一管理（`~/.qwen-code/config.json`）

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| INVALID_PROMPT | prompt 为空 |
| INVALID_MESSAGE | message 为空 |
| CLI_NOT_CONFIGURED | CLI 未配置 API Key |
| CLI_ERROR | CLI 调用失败 |
