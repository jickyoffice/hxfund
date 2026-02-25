# GitHub Actions 部署配置说明

## 📋 Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets：

**进入路径**: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 前端部署（阿里云虚拟主机）

| Secret 名称 | 说明 | 示例值 |
|-----------|------|--------|
| `FTP_SERVER` | FTP 服务器地址 | `ftp.hxfund.cn` |
| `FTP_USERNAME` | FTP 用户名 | `hxfund_cn` |
| `FTP_PASSWORD` | FTP 密码 | `your_ftp_password` |
| `API_BASE_URL` | 后端 API 地址 | `https://api.hxfund.cn` |

### 后端部署（阿里云 ECS）

| Secret 名称 | 说明 | 示例值 |
|-----------|------|--------|
| `ECS_HOST` | ECS 公网 IP | `47.100.xx.xx` |
| `ECS_USER` | SSH 用户名 | `root` |
| `ECS_SSH_KEY` | SSH 私钥 | `-----BEGIN RSA PRIVATE KEY-----...` |
| `APP_NAME` | PM2 应用名称 | `huangshi-api` |
| `APP_DIR` | 应用目录 | `/var/www/huangshi-genealogy` |
| `API_DOMAIN` | API 域名 | `api.hxfund.cn` |

---

## 🔑 获取 SSH 密钥

### 在 ECS 上生成密钥（如果还没有）

```bash
# 登录 ECS
ssh root@your-ecs-ip

# 生成密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""

# 查看公钥（用于添加到 authorized_keys）
cat ~/.ssh/github_actions.pub

# 查看私钥（用于配置 GitHub Secret）
cat ~/.ssh/github_actions
```

### 配置 GitHub Secret

1. 复制私钥内容（包含 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`）
2. 在 GitHub 仓库设置中添加 `ECS_SSH_KEY`

---

## 🚀 触发部署

### 自动触发

推送到 `main` 分支时自动部署：

```bash
git add .
git commit -m "feat: 更新功能"
git push origin main
```

### 手动触发

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择对应的工作流
4. 点击 `Run workflow`
5. 选择分支后点击 `Run workflow`

---

## 📊 工作流程说明

### 1. `deploy-frontend.yml` - 前端部署

**触发条件**: 
- 推送到 main 分支且修改了前端文件
- 或手动触发

**执行步骤**:
1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 构建生产版本
5. 通过 FTP 上传到阿里云虚拟主机

### 2. `deploy-backend.yml` - 后端部署

**触发条件**: 
- 推送到 main 分支且修改了后端文件
- 或手动触发

**执行步骤**:
1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 通过 SSH 上传到 ECS
5. 使用 PM2 重启服务
6. 健康检查

### 3. `deploy-all.yml` - 完整部署

**触发条件**: 
- 任意推送到 main 分支
- 或手动触发

**执行步骤**:
1. 构建前端和后端
2. 并行部署到前端和后端

---

## 🔧 自定义配置

### 修改触发路径

编辑 `.github/workflows/*.yml` 中的 `paths`:

```yaml
on:
  push:
    paths:
      - 'public/**'      # 前端文件
      - 'server/**'      # 后端文件
      - 'index.html'     # 主页面
```

### 添加部署后通知

在 workflow 中添加：

```yaml
- name: 📧 发送通知
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      部署完成！
      前端：https://hxfund.cn
      后端：https://api.hxfund.cn
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## ⚠️ 注意事项

1. **SSH 密钥安全**:
   - 使用专用密钥对
   - 定期轮换密钥
   - 限制密钥权限

2. **FTP 安全**:
   - 使用 FTPS（加密 FTP）
   - 不要明文存储密码

3. **部署回滚**:
   - ECS 脚本会自动备份旧版本
   - 可通过 PM2 回滚：`pm2 restore`

4. **构建时间**:
   - 免费套餐：每月 2000 分钟
   - 超时限制：6 小时/任务

---

## 🧪 测试工作流

```bash
# 1. 创建测试分支
git checkout -b test-deploy

# 2. 推送测试
git push origin test-deploy

# 3. 在 GitHub 上创建 Pull Request
# 4. 观察 Actions 中的工作流运行
```

---

## 📊 查看部署日志

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择对应的工作流运行
4. 查看详细日志输出

---

**更新日期**: 2026 年 2 月 25 日
