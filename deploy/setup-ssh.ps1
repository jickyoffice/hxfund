# GitHub SSH 密钥配置脚本
Write-Host "╔═══════════════════════════════════════════════════════════╗"
Write-Host "║     GitHub SSH 密钥配置工具                                ║"
Write-Host "╚═══════════════════════════════════════════════════════════╝"
Write-Host ""

# 1. 创建 SSH 目录
if (!(Test-Path ~\.ssh)) {
    Write-Host "[1/4] 创建 SSH 目录..."
    New-Item -ItemType Directory -Path ~\.ssh | Out-Null
} else {
    Write-Host "[1/4] SSH 目录已存在"
}

# 2. 生成密钥
if (Test-Path ~\.ssh\id_ed25519.pub) {
    Write-Host "[2/4] SSH 密钥已存在，跳过生成"
} else {
    Write-Host "[2/4] 生成新的 SSH 密钥..."
    Write-Host "按回车使用默认路径，密码短语建议留空"
    ssh-keygen -t ed25519 -C "github_deploy"
}

# 3. 创建 SSH 配置文件
Write-Host "[3/4] 创建 SSH 配置文件..."
$sshConfig = @"
# GitHub SSH 配置
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes
"@
$sshConfig | Out-File -FilePath ~\.ssh\config -Encoding ASCII

# 4. 启动 ssh-agent
Write-Host "[4/4] 配置 ssh-agent..."
$service = Get-Service ssh-agent -ErrorAction SilentlyContinue
if ($service) {
    Set-Service ssh-agent -StartupType Manual -ErrorAction SilentlyContinue
    Start-Service ssh-agent -ErrorAction SilentlyContinue
    Write-Host "ssh-agent 已启动"
} else {
    Write-Host "ssh-agent 服务不存在，跳过"
}

# 添加密钥到代理
Write-Host ""
Write-Host "添加密钥到 ssh-agent..."
ssh-add ~\.ssh\id_ed25519 2>$null

# 显示公钥
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗"
Write-Host "║                    配置完成                               ║"
Write-Host "╠═══════════════════════════════════════════════════════════╣"
Write-Host "║  下一步：                                                 ║"
Write-Host "║  1. 复制以下公钥内容：                                    ║"
Write-Host ""

Get-Content ~\.ssh\id_ed25519.pub

Write-Host ""
Write-Host "║  2. 打开 GitHub Settings → SSH and GPG keys               ║"
Write-Host "║  3. 点击 'New SSH key'                                    ║"
Write-Host "║  4. 粘贴公钥并保存                                        ║"
Write-Host "║  5. 测试：ssh -T git@github.com                           ║"
Write-Host "╚═══════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
