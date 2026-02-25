# Qwen Code CLI 使用指南（增强版）

## 概述

`qwen-code.js` 是一个符合阿里云百炼 Coding Plan 使用限制的命令行交互工具（增强版）。支持多种 AI 工具的初始化配置。

## ⚠️ 重要提示

根据 Coding Plan 套餐规定：
- ✅ **允许**: 在编程工具中以交互式方式使用
- ❌ **禁止**: 自动化脚本、后端 API 调用、批量非交互式调用

---

## 快速开始

### 1. 初始化配置（新增）

```bash
# 运行初始化配置向导
node qwen-code.js --init

# 或
npm run qwen -- --init
```

初始化向导将引导您完成：
1. ✅ Node.js 版本检查
2. ✅ 选择 AI 工具（Qwen Code、OpenCode、Claude Code、Cline、Cursor）
3. ✅ 配置 API Key
4. ✅ 选择默认模型
5. ✅ 保存配置并测试

### 2. 查看支持的 AI 工具

```bash
node qwen-code.js --tools
```

输出示例：
```
支持的 AI 工具列表:

  1. OpenCode (opencode)
     安装：npm install -g opencode-ai

  2. Qwen Code (官方) (qwenCode)
     安装：npm install -g @qwen-code/qwen-code@latest
     说明：Qwen Code 启动后使用 /auth 命令配置 API Key

  3. Claude Code (claudeCode)
     安装：npm install -g @anthropic-ai/claude-code
     ...
```

### 3. 交互模式

```bash
# 进入交互式对话
node qwen-code.js -i

# 或直接运行（如果已配置）
node qwen-code.js
```

---

## AI 工具接入配置

### Qwen Code (官方 CLI)

```bash
# 1. 安装
npm install -g @qwen-code/qwen-code@latest

# 2. 启动
qwen

# 3. 在对话中输入 /auth 进入设置界面
# 4. 选择 Coding Plan（百炼，中国）
# 5. 输入 API Key (sk-sp-xxxxx)

# 切换模型
/model
```

### OpenCode

```bash
# 1. 安装
npm install -g opencode-ai

# 2. 使用 CLI 配置（自动创建配置文件）
node qwen-code.js --init
# 选择 OpenCode，输入 API Key

# 3. 启动
opencode

# 4. 选择模型
/models
# 输入：Model Studio Coding Plan
```

### Claude Code

```bash
# 1. 安装
npm install -g @anthropic-ai/claude-code

# 2. 启动
claude

# 3. 配置
/auth
# 选择 Coding Plan
# Base URL: https://coding.dashscope.aliyuncs.com/apps/anthropic/v1
# API Key: sk-sp-xxxxx
```

### Cline (VS Code 插件)

```bash
# 1. 在 VS Code 中安装 Cline 插件

# 2. 配置
# Base URL: https://coding.dashscope.aliyuncs.com/v1
# API Key: sk-sp-xxxxx
```

### Cursor

```bash
# 1. 下载并安装 Cursor IDE

# 2. 设置中配置
# Provider: OpenAI Compatible
# Base URL: https://coding.dashscope.aliyuncs.com/v1
# API Key: sk-sp-xxxxx
# Model: qwen3.5-plus
```

---

## 命令行选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `-h, --help` | 显示帮助 | `node qwen-code.js --help` |
| `-v, --version` | 显示版本 | `node qwen-code.js --version` |
| `-c, --config` | 配置向导 | `node qwen-code.js -c` |
| `--init` | 初始化配置 | `node qwen-code.js --init` |
| `--tools` | AI 工具列表 | `node qwen-code.js --tools` |
| `-m, --model` | 指定模型 | `node qwen-code.js -m qwen3-max-2026-01-23 "问题"` |
| `-t, --temperature` | 设置温度 | `node qwen-code.js -t 0.9 "问题"` |
| `-i, --interactive` | 交互模式 | `node qwen-code.js -i` |
| `--list-models` | 列出模型 | `node qwen-code.js --list-models` |

---

## 支持的模型 (Coding Plan)

| 模型 ID | 说明 | 特性 |
|---------|------|------|
| `qwen3.5-plus` | Qwen3.5 Plus (多模态) | [默认] |
| `qwen3-max-2026-01-23` | Qwen3 Max 2026-01-23 | |
| `qwen3-coder-next` | Qwen3 Coder Next | |
| `qwen3-coder-plus` | Qwen3 Coder Plus | |
| `glm-5` | GLM-5 | 支持思考模式 |
| `glm-4.7` | GLM-4.7 | 支持思考模式 |
| `kimi-k2.5` | Kimi K2.5 | 支持思考模式 |

---

## 交互模式命令

| 命令 | 说明 |
|------|------|
| `/quit`, `/exit` | 退出 |
| `/clear` | 清空对话历史 |
| `/help` | 显示帮助 |
| `/model` | 查看/切换模型 |
| `/model <模型名>` | 切换到指定模型 |
| `/history` | 查看对话历史 |
| `/usage` | Token 用量 |
| `/config` | 查看当前配置 |

---

## 配置文件

### CLI 配置
位置：`~/.qwen-code/config.json`

```json
{
  "apiKey": "sk-sp-xxxxx",
  "baseURL": "https://coding.dashscope.aliyuncs.com/v1",
  "model": "qwen3.5-plus",
  "temperature": 0.7
}
```

### OpenCode 配置
位置：`~/.config/opencode/opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "bailian-coding-plan": {
      "npm": "@ai-sdk/anthropic",
      "name": "Model Studio Coding Plan",
      "options": {
        "baseURL": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
        "apiKey": "sk-sp-xxxxx"
      },
      "models": {
        "qwen3.5-plus": { "name": "Qwen3.5 Plus" },
        "qwen3-coder-next": { "name": "Qwen3 Coder Next" }
      }
    }
  }
}
```

### Qwen Code 配置
位置：`~/.qwen/settings.json`

通过 `/auth` 命令交互式配置。

---

## 使用场景

### ✅ 推荐用法

1. **编程辅助**
   ```bash
   node qwen-code.js -i
   > 帮我写一个 Python 函数，计算斐波那契数列
   ```

2. **代码解释**
   ```bash
   node qwen-code.js "解释这段代码：function foo() { return bar && baz || qux; }"
   ```

3. **黄氏家族文化咨询**
   ```bash
   node qwen-code.js "江夏黄氏的字辈诗是什么？"
   ```

4. **AI 工具配置**
   ```bash
   node qwen-code.js --init
   # 选择要配置的 AI 工具
   ```

---

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `invalid access token` | API Key 无效/过期 | 检查 API Key，确认订阅状态 |
| `hour allocated quota exceeded` | 5 小时额度用完 | 等待 5 小时或升级套餐 |
| `week allocated quota exceeded` | 周额度用完 | 等待下周一或升级套餐 |
| `month allocated quota exceeded` | 月额度用完 | 等待下月或升级套餐 |
| `model 'xxx' is not supported` | 模型名称错误 | 检查模型名称拼写 |

---

## 版本

Qwen Code CLI v1.1.0 (增强版)

**更新日志:**
- ✅ 新增初始化配置向导
- ✅ 支持多种 AI 工具配置（Qwen Code、OpenCode、Claude Code、Cline、Cursor）
- ✅ 新增 /config 命令
- ✅ 改进配置管理
