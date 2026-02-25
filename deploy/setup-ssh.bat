@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════╗
echo ║     GitHub SSH 密钥配置工具                                ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 检查 SSH 目录
if not exist "%USERPROFILE%\.ssh" (
    echo [1/4] 创建 SSH 目录...
    mkdir "%USERPROFILE%\.ssh"
) else (
    echo [1/4] SSH 目录已存在
)

REM 检查现有密钥
if exist "%USERPROFILE%\.ssh\id_rsa.pub" (
    echo [2/4] 发现现有 RSA 公钥
) else if exist "%USERPROFILE%\.ssh\id_ed25519.pub" (
    echo [2/4] 发现现有 Ed25519 公钥
) else (
    echo [2/4] 未找到 SSH 密钥，将生成新密钥...
    echo.
    echo 请按提示操作：
    echo - 保存位置：直接回车（默认）
    echo - 密码短语：建议留空（方便 GitHub Actions）
    echo.
    ssh-keygen -t ed25519 -C "%USERNAME%@%COMPUTERNAME%"
)

REM 创建 SSH config 文件
echo [3/4] 创建 SSH 配置文件...
(
echo # GitHub SSH 配置
echo Host github.com
echo     HostName github.com
echo     User git
echo     IdentityFile ~/.ssh/id_ed25519
echo     IdentitiesOnly yes
echo     AddKeysToAgent yes
) > "%USERPROFILE%\.ssh\config"
echo SSH 配置文件已创建

REM 启动 ssh-agent
echo [4/4] 配置 ssh-agent...
sc query ssh-agent | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo 启动 ssh-agent 服务...
    sc config ssh-agent start=auto >nul
    net start ssh-agent >nul
)

REM 添加密钥到代理
echo.
echo 添加密钥到 ssh-agent...
ssh-add "%USERPROFILE%\.ssh\id_ed25519" 2>nul
if %errorlevel% neq 0 (
    echo 如果提示输入密码，请输入生成密钥时设置的密码短语
    echo 或者直接回车（如果未设置密码）
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    配置完成                               ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  下一步：                                                  ║
echo ║  1. 查看公钥：type %USERPROFILE%\.ssh\id_ed25519.pub       ║
echo ║  2. 复制公钥内容到 GitHub:                                 ║
echo ║     https://github.com/settings/keys                       ║
echo ║  3. 测试连接：ssh -T git@github.com                        ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
pause
