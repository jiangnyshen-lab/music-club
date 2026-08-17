@echo off
chcp 65001 >nul
title 音乐圈
cd /d "%~dp0"
echo.
echo   ==========================================
echo      🎵 音乐圈 正在启动...
echo   ==========================================
echo.
echo   启动成功后，在浏览器打开下面这个网址：
echo.
echo       http://localhost:3001
echo.
echo   ⚠️  请保持这个窗口开着！关闭这个窗口 = 停止网站
echo.
node server\index.js
echo.
echo   网站已停止。按任意键关闭窗口。
pause >nul
