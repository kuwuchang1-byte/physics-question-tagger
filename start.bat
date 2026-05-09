@echo off
echo ╔══════════════════════════════════════╗
echo ║     物理学习助手                     ║
echo ║  拍题识别 · 标注 · 分析 · 对话      ║
echo ╚══════════════════════════════════════╝
echo.
cd /d %~dp0
echo 启动中...
start http://localhost:3001
node server.js
