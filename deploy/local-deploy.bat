# 本地部署脚本 - 用于本地测试和手动部署

@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔═══════════════════════════════════════════════════════════╗
echo ║     黄氏家族寻根平台 - 本地部署脚本                        ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 获取 Git 远程仓库信息
for /f "tokens=2" %%i in ('git remote get-url origin 2^>nul') do set REPO_URL=%%i

if "%REPO_URL%"=="" (
    echo ❌ 未找到 Git 远程仓库，请先配置
    echo 使用命令：git remote add origin git@github.com:USERNAME/REPO.git
    pause
    exit /b 1
)

echo [1/4] 检查 Git 状态...
git status --porcelain | findstr /r "^??" >nul
if %errorlevel% equ 0 (
    echo 发现未跟踪的文件，是否提交？
    choice /c YN /m "是否提交更改"
    if errorlevel 2 goto :skip_commit
    git add .
    git commit -m "chore: 本地部署前提交"
    :skip_commit
)

echo [2/4] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ 推送失败，请检查 SSH 配置
    echo.
    echo 运行以下命令配置 SSH:
    echo   deploy\setup-ssh.bat
    echo.
    pause
    exit /b 1
)

echo [3/4] 触发 GitHub Actions 部署...
echo ✅ 代码已推送，GitHub Actions 将自动部署
echo.
echo 查看部署状态:
echo   https://github.com/%REPO_URL:github.com/:/=.git/actions
echo.

echo [4/4] 部署说明...
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  部署工作流                                               ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  前端部署：deploy-frontend.yml                            ║
echo ║    → 构建并上传到阿里云虚拟主机                           ║
echo ║                                                           ║
echo ║  后端部署：deploy-docker.yml                              ║
echo ║    → 构建 Docker 镜像并推送到阿里云 ECS                    ║
echo ║                                                           ║
echo ║  完整部署：deploy-all.yml                                 ║
echo ║    → 同时部署前端和后端                                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 查看实时日志:
echo   https://github.com/%REPO_URL:github.com/:/=.git/actions
echo.
pause
