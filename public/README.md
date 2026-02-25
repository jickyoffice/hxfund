# public/ 前端资源目录说明

## 📁 目录结构

```
public/
├── 📂 css/              # 样式表
│   ├── modules/         # CSS 模块（可选）
│   └── style.css        # 主样式表
│
├── 📂 js/               # JavaScript 脚本
│   ├── data.js          # 数据模块（家族树、字辈数据）
│   ├── main.js          # 主逻辑（页面加载、导航、动画）
│   ├── modules.js       # 功能模块（UI 渲染）
│   ├── script.js        # AI 客户端（Qwen 对话）
│   └── error-monitor.js # 错误监控
│
├── 📂 pwa/              # PWA 相关文件
│   ├── manifest.json    # PWA 清单文件
│   └── service-worker.js# Service Worker
│
├── 📂 tests/            # 测试页面
│   ├── api-test.html    # API 测试页面
│   ├── test-ai.html     # AI 测试页面
│   └── whitepaper.html  # 项目白皮书
│
├── 📂 html/             # 额外 HTML 页面（空）
└── 📂 images/           # 图片资源（空）
```

---

## 📂 各目录说明

### `/css` - 样式表

| 文件 | 说明 | 大小 |
|------|------|------|
| `style.css` | 主样式表（新中式古风设计） | ~44 KB |
| `modules/` | CSS 模块目录（预留） | - |

**设计特点**:
- 主色调：棕色 `#8B4513` + 金色 `#C8933A`
- 字体：Noto Serif SC（思源宋体）
- 响应式设计
- 宣纸纹理背景

---

### `/js` - JavaScript 脚本

| 文件 | 说明 | 大小 | 功能 |
|------|------|------|------|
| `data.js` | 数据模块 | 7.3 KB | 家族树数据、字辈诗、PPT 数据 |
| `main.js` | 主逻辑 | 8.8 KB | 页面加载、导航、动画、错误处理 |
| `modules.js` | 功能模块 | 15.5 KB | 族谱树、字辈计算器、区块链、留言墙 |
| `script.js` | AI 客户端 | 12.2 KB | Qwen AI 对话、Token 管理 |
| `error-monitor.js` | 错误监控 | 8.4 KB | 全局错误捕获、性能监控 |

**加载顺序**:
```html
<script src="/js/error-monitor.js" defer></script>
<script src="/js/data.js" defer></script>
<script src="/js/main.js" defer></script>
<script src="/js/modules.js" defer></script>
<script src="/js/script.js" defer></script>
```

---

### `/pwa` - PWA 相关

| 文件 | 说明 |
|------|------|
| `manifest.json` | PWA 清单（应用名称、图标、快捷方式） |
| `service-worker.js` | Service Worker（离线缓存、版本更新） |

**PWA 功能**:
- ✅ 添加到主屏幕
- ✅ 离线访问
- ✅ 缓存优先策略
- ✅ 自动更新检测

**快捷方式**:
1. 族谱查询 → `/#tree`
2. 字辈推算 → `/#calculator`
3. AI 助手 → `/#qwen`

---

### `/tests` - 测试页面

| 文件 | 说明 |
|------|------|
| `api-test.html` | API 接口测试页面 |
| `test-ai.html` | AI 功能测试页面 |
| `whitepaper.html` | 项目白皮书（独立页面） |

---

### `/html` - 额外 HTML 页面

预留目录，用于存放额外的 HTML 页面。

---

### `/images` - 图片资源

预留目录，用于存放图片资源。

**需要的图标**:
- `icon-192.png` - PWA 图标（192x192）
- `icon-512.png` - PWA 图标（512x512）
- `screenshot-1.png` - 截图（1280x720）
- `screenshot-2.png` - 截图（1280x720）

---

## 🔧 构建优化

构建后会在 `dist/` 目录生成压缩版本：

```
dist/
├── css/
│   └── style.min.css      # 压缩后 ~35 KB
├── js/
│   ├── data.min.js        # 压缩后 ~3 KB
│   ├── main.min.js        # 压缩后 ~3.4 KB
│   ├── modules.min.js     # 压缩后 ~9 KB
│   └── script.min.js      # 压缩后 ~4.8 KB
├── pwa/
│   ├── manifest.json
│   └── service-worker.js
└── index.html
```

**压缩率**:
- CSS: 25.9%
- JS: 52.0%

---

## 📊 文件大小统计

| 分类 | 原始大小 | 压缩后 |
|------|----------|--------|
| CSS | 44.2 KB | 34.7 KB |
| JS | 52.2 KB | 20.2 KB |
| HTML | 25.1 KB | 25.1 KB |
| **总计** | **121.5 KB** | **80.0 KB** |

---

## 🎯 性能优化

1. **关键 CSS 内联** - 首屏样式嵌入 HTML
2. **非关键 CSS 异步加载** - 不阻塞渲染
3. **JS defer 加载** - 异步加载，不阻塞解析
4. **图片懒加载** - 按需加载
5. **Service Worker 缓存** - 离线访问

---

**更新日期**: 2026 年 2 月 25 日
**版本**: v3.3.0
