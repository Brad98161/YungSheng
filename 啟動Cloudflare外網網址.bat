@echo off
chcp 65001 >nul
title Cloudflare 外網安全隧道
echo ===================================================
echo 正在為教育訓練管理系統建立 Cloudflare 公網安全連線...
echo 終端機內出現的「https://xxxx.trycloudflare.com」
echo 即為可供任何手機 4G/外網隨時開啟的專屬網址！
echo (請保持此視窗開啟，關閉視窗即停止外網連線)
echo ===================================================
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3001
pause
