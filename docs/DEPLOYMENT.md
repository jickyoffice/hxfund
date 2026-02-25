# 黄氏家族寻根平台 - CDN 部署指南

## 目录结构

```
dist/
├── index.html          # 主页面（优化版）
├── manifest.json       # 资源清单
├── css/
│   ├── style.css      # 原始 CSS
│   └── style.min.css  # 压缩 CSS (35.54 KB)
├── js/
│   ├── data.js        # 数据模块
│   ├── data.min.js    # 压缩数据 (4.83 KB)
│   ├── main.js        # 主脚本
│   ├── main.min.js    # 压缩主脚本 (5.50 KB)
│   ├── modules.js     # 功能模块
│   ├── modules.min.js # 压缩模块 (13.20 KB)
│   ├── script.js      # AI 客户端
│   └── script.min.js  # 压缩客户端 (9.72 KB)
└── images/            # 图片资源
```

## 构建命令

```bash
# 本地构建
node build.js

# 输出目录
dist/
```

## 部署方式

### 方式 1：GitHub Pages

1. 推送 `dist/` 目录到 `gh-pages` 分支

```bash
git subtree push --prefix dist origin gh-pages
```

2. 访问：`https://username.github.io/repo-name/`

### 方式 2：Vercel

1. 安装 Vercel CLI

```bash
npm i -g vercel
```

2. 部署

```bash
cd dist
vercel --prod
```

### 方式 3：Netlify

1. 拖放 `dist/` 目录到 Netlify

或使用 CLI：

```bash
npm i -g netlify-cli
cd dist
netlify deploy --prod
```

### 方式 4：Cloudflare Pages

1. 登录 Cloudflare Dashboard
2. 创建 Pages 项目
3. 连接 GitHub 仓库
4. 构建配置：
   - 构建命令：`node build.js`
   - 输出目录：`dist`

### 方式 5：阿里云 OSS

1. 创建 OSS Bucket
2. 上传 `dist/` 目录内容
3. 配置 CDN 加速
4. 绑定自定义域名

### 方式 6：腾讯云 COS

1. 创建 COS Bucket
2. 上传 `dist/` 目录内容
3. 配置 CDN 加速
4. 绑定自定义域名

## CDN 配置建议

### 缓存策略

| 文件类型 | 缓存时间 | 说明 |
|---------|---------|------|
| HTML | 1 小时 | 经常更新 |
| CSS | 1 年 | 带版本号 |
| JS | 1 年 | 带版本号 |
| 图片 | 1 年 | 静态资源 |
| JSON | 1 小时 | 配置文件 |

### HTTP 响应头

```
# HTML
Cache-Control: public, max-age=3600

# CSS/JS (压缩版)
Cache-Control: public, max-age=31536000, immutable

# 图片
Cache-Control: public, max-age=31536000, immutable
```

### Gzip/Brotli 压缩

启用 Gzip 或 Brotli 压缩可进一步减少文件大小：

- CSS: 再减少 70-80%
- JS: 再减少 60-70%
- HTML: 再减少 70-80%

## 性能优化

### 构建后文件大小

| 资源 | 原始 | 压缩 | 压缩率 |
|------|------|------|--------|
| CSS | 44.20 KB | 35.54 KB | 25.5% ↓ |
| JS (总计) | 38.30 KB | 33.25 KB | 95.6% ↓ |
| HTML | 20.56 KB | 20.56 KB | - |

**总计**: ~89 KB (压缩后)

### 加载优化

1. **关键 CSS 内联** - 首屏样式直接嵌入 HTML
2. **资源预加载** - 使用 `<link rel="preload">`
3. **JS 异步加载** - 使用 `defer` 属性
4. **图片懒加载** - 使用 `loading="lazy"`
5. **字体优化** - 使用 `display=swap`

### Lighthouse 评分目标

- Performance: 95+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+

## API 配置

如果后端 API 分离部署，需要配置 API 地址：

### 方式 1：环境变量

在构建前设置：

```bash
export API_BASE_URL=https://api.example.com
node build.js
```

### 方式 2：配置文件

创建 `dist/config.js`：

```javascript
window.API_CONFIG = {
  baseURL: 'https://api.example.com',
  timeout: 30000
};
```

### 方式 3：代理配置

在 CDN 配置代理规则：

```
/api/* -> https://api.example.com/api/*
```

## 监控与分析

### 性能监控

1. **Google Analytics** - 用户行为分析
2. **Cloudflare Analytics** - 流量分析
3. **Web Vitals** - 核心性能指标

### 错误监控

1. **Sentry** - JavaScript 错误追踪
2. **LogRocket** - 会话录制

## 安全建议

### HTTPS

- 强制使用 HTTPS
- 启用 HSTS
- 配置 TLS 1.3

### CSP (内容安全策略)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src https://fonts.gstatic.com;">
```

## 更新流程

1. 修改源代码
2. 运行 `node build.js`
3. 测试 `dist/` 目录
4. 部署到 CDN
5. 清除 CDN 缓存（如需要）

## 回滚方案

保留历史版本，出现问题时快速回滚：

```bash
# 部署上一版本
git checkout HEAD~1
node build.js
# 重新部署
```

## 联系支持

如有问题，请提交 Issue 或联系开发团队。
