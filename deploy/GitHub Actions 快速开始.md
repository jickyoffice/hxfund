# GitHub Actions 部署 - 快速开始

## 🚀 5 分钟配置指南

### 步骤 1：复制工作流文件

确保以下文件存在：

```
.github/workflows/
├── deploy-frontend.yml    # 前端部署
├── deploy-backend.yml     # 后端部署
└── deploy-all.yml         # 完整部署
```

✅ 已创建

---

### 步骤 2：配置 GitHub Secrets

#### 2.1 进入 Secrets 设置

1. 打开 GitHub 仓库
2. 点击 `Settings`
3. 点击 `Secrets and variables` → `Actions`
4. 点击 `New repository secret`

#### 2.2 添加前端 Secrets

| Name | Value | 说明 |
|------|-------|------|
| `FTP_SERVER` | `ftp.hxfund.cn` | 阿里云虚拟主机 FTP 地址 |
| `FTP_USERNAME` | `你的 FTP 用户名` | 从阿里云控制台获取 |
| `FTP_PASSWORD` | `你的 FTP 密码` | 从阿里云控制台获取 |
| `API_BASE_URL` | `https://api.hxfund.cn` | 后端 API 地址 |

#### 2.3 添加后端 Secrets

**首先生成 SSH 密钥**（在本地或 ECS 上）：

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy -N ""

# 查看私钥（复制到 GitHub Secret）
cat ~/.ssh/github_deploy

# 查看公钥（添加到 ECS）
cat ~/.ssh/github_deploy.pub
```

**添加 ECS Secrets**：

| Name | Value | 说明 |
|------|-------|------|
| `ECS_HOST` | `47.100.xx.xx` | ECS 公网 IP |
| `ECS_USER` | `root` | SSH 用户名 |
| `ECS_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | SSH 私钥（完整内容） |
| `APP_NAME` | `huangshi-api` | PM2 应用名称 |
| `APP_DIR` | `/var/www/huangshi-genealogy` | 应用目录 |
| `API_DOMAIN` | `api.hxfund.cn` | API 域名 |

---

### 步骤 3：配置 ECS 服务器

登录 ECS 并执行：

```bash
# 1. 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 2. 安装 PM2
npm install -g pm2

# 3. 创建应用目录
mkdir -p /var/www/huangshi-genealogy

# 4. 设置目录权限
chown -R $USER:$USER /var/www/huangshi-genealogy
```

**添加 SSH 公钥到 ECS**：

```bash
# 将本地生成的公钥添加到 ECS
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
```

---

### 步骤 4：测试部署

#### 4.1 推送测试

```bash
# 提交更改
git add .
git commit -m "test: 测试 GitHub Actions 部署"
git push origin main
```

#### 4.2 查看部署状态

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 查看正在运行的工作流

#### 4.3 手动触发部署

1. 进入 `Actions` → `前端部署 - 阿里云虚拟主机`
2. 点击 `Run workflow`
3. 选择分支（main）
4. 点击 `Run workflow`

---

### 步骤 5：验证部署

#### 前端验证

```bash
# 访问前端页面
curl https://hxfund.cn

# 应该返回 HTML 内容
```

#### 后端验证

```bash
# 访问健康检查接口
curl https://api.hxfund.cn/api/health

# 应该返回：
# {"status":"ok","service":"huangshi-genealogy-api",...}
```

---

## 📊 工作流程说明

### 前端部署流程

```
推送代码 → GitHub Actions → npm install → npm run build → FTP 上传 → 完成
```

### 后端部署流程

```
推送代码 → GitHub Actions → npm install → SSH 上传 → PM2 重启 → 健康检查 → 完成
```

---

## 🔧 常见问题

### Q1: FTP 部署失败

**错误**: `530 Login authentication failed`

**解决**:
1. 检查 FTP 用户名密码是否正确
2. 确认 FTP 服务器地址正确
3. 尝试使用 FTPS 协议（`protocol: ftps`）

### Q2: SSH 连接失败

**错误**: `Permission denied (publickey)`

**解决**:
1. 确认 SSH 私钥格式正确（包含 BEGIN/END）
2. 确认公钥已添加到 ECS `~/.ssh/authorized_keys`
3. 检查 ECS 安全组是否开放 22 端口

### Q3: PM2 启动失败

**错误**: `Error: Cannot find module`

**解决**:
```bash
# 登录 ECS 检查
cd /var/www/huangshi-genealogy
npm install --production
pm2 restart huangshi-api
```

---

## 📝 自定义配置

### 修改触发条件

编辑 `.github/workflows/deploy-frontend.yml`：

```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'public/**'      # 仅当前端文件变更时触发
      - 'index.html'
```

### 添加部署通知

在 workflow 中添加钉钉通知：

```yaml
- name: 📧 发送钉钉通知
  uses: zcong1993/actions-ding@master
  with:
    dingToken: ${{ secrets.DINGTALK_WEBHOOK }}
    body: |
      {
        "msgtype": "text",
        "text": {
          "content": "部署完成！\n前端：https://hxfund.cn\n后端：https://api.hxfund.cn"
        }
      }
```

---

## 🎯 部署策略

### 开发环境

```yaml
# 创建 .github/workflows/deploy-dev.yml
on:
  push:
    branches: [ develop ]
```

### 生产环境

```yaml
# 当前配置：推送到 main 自动部署
on:
  push:
    branches: [ main ]
```

### 手动审批部署

```yaml
# 添加环境审批
environment:
  name: production
  url: https://hxfund.cn
```

---

## 📊 查看部署历史

1. 进入 GitHub 仓库
2. 点击 `Actions`
3. 选择工作流查看历史运行
4. 点击具体运行查看详细日志

---

## 🔒 安全建议

1. **定期轮换密钥**
   - SSH 密钥每 90 天更换
   - FTP 密码定期更新

2. **限制 Secrets 访问**
   - 仅在必要时使用 Secrets
   - 不在日志中打印 Secrets

3. **启用分支保护**
   - Settings → Branches → Add rule
   - 要求 Pull Request 审批

---

**更新日期**: 2026 年 2 月 25 日
