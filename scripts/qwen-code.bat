@echo off
REM 黄氏家族寻根平台 - Qwen Code CLI 启动脚本
REM 使用方式：qwen-code [问题]
REM          qwen-code -i (交互模式)
REM          qwen-code -c (配置)

node "%~dp0qwen-code.js" %*
