# 黄氏家族寻根平台 - 快速启动指南

## 项目概述

黄氏家族寻根平台是一个数字化传承黄氏家族文化的 Web 应用，包含以下核心功能：

- 🌳 **3D 动态族谱树** - 递归展示黄氏传承脉络
- 🔤 **智能字辈计算器** - 输入代数智能匹配字辈汉字
- 🤖 **Qwen AI 客户端** - 与通义千问 AI 对话，获取智能化服务
- 📊 **项目路演 PPT** - 项目白皮书幻灯片展示
- 🔗 **区块链存证** - 哈希上链机制，确保数据防篡改
- 📝 **宗亲留言墙** - 发布寻亲信息，连接全球宗亲

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **后端**: Node.js + Express
- **AI**: 阿里云百炼 Coding Plan (Qwen3.5)
- **认证**: JWT Token + API Key + 速率限制

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

首次使用需要配置阿里云百炼 API Key：

```bash
node qwen-code.js --init
```

按照提示输入 API Key 和选择模型。

### 3. 启动服务器

```bash
# 方式 1: 直接启动
node server/index.js

# 方式 2: 使用 npm 脚本
npm start
```

服务器启动后访问：http://localhost:3000

## 目录结构

```
qwen3.5/
├── index.html              # 主页面（关键 CSS 内联优化）
├── package.json            # 项目配置
├── qwen-code.js            # AI CLI 工具
├── server/
│   ├── index.js            # Express 服务器
│   ├── auth.js             # 认证模块 (JWT + API Key)
│   ├── cli-wrapper.js      # AI CLI 封装
│   └── config/
│       ├── .env            # 环境变量（CLI 配置）
│       └── auth.json       # 认证配置（API Key + JWT 密钥）
├── public/
│   ├── css/
│   │   └── style.css       # 样式文件 (44KB)
│   └── js/
│       ├── main.js         # 主脚本（页面加载、导航）6KB
│       ├── modules.js      # 功能模块 UI 渲染 14KB
│       ├── data.js         # 数据模块（家族树、PPT 数据）6KB
│       └── script.js       # Qwen AI 客户端 10KB
└── docs/                   # 文档目录
```

## API 端点

### 公开接口（无需认证）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 主页 |
| `/api/health` | GET | 健康检查 |
| `/api/models` | GET | 模型列表 |
| `/api/docs` | GET | API 文档 |

### 受保护接口（需要认证）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/token` | POST | 获取访问 Token |
| `/api/auth/status` | GET | 认证状态和速率限制 |
| `/api/chat` | POST | 单次对话 |
| `/api/conversation` | POST | 多轮对话（带历史） |
| `/api/session/:id` | GET | 获取会话历史 |
| `/api/session/:id` | DELETE | 删除会话 |

## 认证说明

### 获取 Token

```javascript
const response = await fetch('/api/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    apiKey: 'hs_xxxxx...' // 从 server/config/auth.json 获取
  })
});
const { token } = await response.json();
```

### 使用 Token

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ 
    prompt: '黄姓的起源是什么？' 
  })
});
```

## 速率限制

| 接口类型 | 限制 | 窗口期 |
|---------|------|--------|
| 普通接口 | 30 次/分钟 | 60 秒 |
| 聊天接口 | 10 次/分钟 | 60 秒 |

## 测试

```bash
# AI 对话功能测试
node test-chat.js

# API 认证功能测试
node test-auth.js
```

## 常见问题

### Q: 页面一直显示"载入中..."

A: 检查浏览器控制台是否有 JavaScript 错误，确保：
1. `/js/main.js` 和 `/js/script.js` 加载成功
2. 没有被浏览器扩展拦截

### Q: API 返回"缺少认证信息"

A: 确保请求头包含：
- `Authorization: Bearer <token>` 或
- `X-API-Key: hs_xxxxx...`

### Q: CLI 调用超时

A: 检查网络连接和 API Key 是否有效，访问 https://bailian.console.aliyun.com/ 查看配额。

## 更新日志

### v3.1.1 (2026-02-25) 性能优化
- ✅ 关键 CSS 内联，首屏加载更快
- ✅ JS 文件 defer 异步加载
- ✅ 数据与代码分离（data.js）
- ✅ 字体加载优化（display=swap）
- ✅ CSS 异步加载，非阻塞渲染

### v3.1.0 (2026-02-25)
- ✅ 添加 API 认证系统（JWT + API Key）
- ✅ 添加速率限制
- ✅ 修复前端资源加载路径
- ✅ 添加页面加载动画控制
- ✅ 前端自动获取和刷新 Token

### v3.0.0
- ✅ 统一使用 CLI 调用 AI
- ✅ 多轮对话支持
- ✅ 会话管理

## 许可证

MIT License

---

**黄氏家族寻根平台** · 传承家风，继往开来
