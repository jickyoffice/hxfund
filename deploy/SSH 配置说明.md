# GitHub SSH 配置说明

## 🔑 生成 SSH 密钥

### Windows PowerShell

```powershell
# 生成新的 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按提示操作：
# - 保存位置：默认 (~/.ssh/id_ed25519)
# - 密码短语：可以留空（方便 GitHub Actions）或设置密码（更安全）
```

### 查看公钥

```powershell
# 查看公钥内容
type $env:USERPROFILE\.ssh\id_ed25519.pub

# 或者使用 cat
cat ~/.ssh/id_ed25519.pub
```

### 复制公钥到 GitHub

1. 复制公钥内容（整个 `ssh-ed25519 AAAA...` 行）
2. 打开 GitHub → Settings → SSH and GPG keys
3. 点击 "New SSH key"
4. 粘贴公钥内容
5. 添加标题（如：Windows Desktop）
6. 点击 "Add SSH key"

---

## 📝 配置 SSH Config

创建或编辑 `~/.ssh/config` 文件：

```powershell
# 使用记事本打开
notepad $env:USERPROFILE\.ssh\config
```

添加以下内容：

```
# GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes
```

---

## 🧪 测试 SSH 连接

```powershell
# 测试连接
ssh -T git@github.com

# 首次连接会提示确认指纹，输入 yes
# 成功会显示：Hi username! You've successfully authenticated...
```

---

## 🚀 推送代码

```powershell
cd c:\Users\alice\qwen3.5

# 如果使用 HTTPS 远程 URL，先改为 SSH
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git

# 查看当前远程 URL
git remote -v

# 推送
git push origin main
```

---

## ⚠️ 常见问题

### Q1: Permission denied (publickey)

**解决**:
```powershell
# 确保 SSH 代理运行
Get-Service ssh-agent | Set-Service -StartupType Manual
Start-Service ssh-agent

# 添加密钥到代理
ssh-add ~/.ssh/id_ed25519

# 验证
ssh-add -l
```

### Q2: 密钥权限问题

**解决**:
```powershell
# 设置正确的权限（Windows）
icacls $env:USERPROFILE\.ssh\id_rsa /inheritance:r
icacls $env:USERPROFILE\.ssh\id_rsa /grant:r "$($env:USERNAME):(R)"
icacls $env:USERPROFILE\.ssh\id_rsa.pub /inheritance:r
icacls $env:USERPROFILE\.ssh\id_rsa.pub /grant:r "$($env:USERNAME):(R)"
```

### Q3: 远程仓库不存在

**解决**:
```powershell
# 检查远程 URL
git remote -v

# 更正远程 URL（替换为你的仓库）
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git

# 或者添加远程
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
```

---

## 🔐 使用密码短语

如果设置了密码短语，每次推送都需要输入：

```powershell
# 输入密码短语后推送
git push origin main
```

### 避免每次输入密码

**方式 1: 使用 ssh-agent**

```powershell
# 启动 ssh-agent
Start-Service ssh-agent

# 添加密钥（会提示输入密码）
ssh-add ~/.ssh/id_ed25519

# 之后推送不需要再输入密码
```

**方式 2: 使用无密码密钥（仅本地）**

```powershell
# 生成无密码密钥
ssh-keygen -t ed25519 -f ~/.ssh/github_no_pass -N ""

# 添加到 ssh-agent
ssh-add ~/.ssh/github_no_pass
```

---

**更新日期**: 2026 年 2 月 25 日
