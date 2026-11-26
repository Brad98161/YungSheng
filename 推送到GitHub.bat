@echo off
chcp 65001 >nul
echo 正在將教育訓練管理系統程式碼推送到 GitHub (https://github.com/Brad98161/YungSheng)...
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo 恭喜！程式碼已成功推送到 GitHub！
    echo 倉庫網址：https://github.com/Brad98161/YungSheng
    echo ==============================================
) else (
    echo.
    echo 若跳出 GitHub 授權視窗，請點擊「Sign in with your browser」進行一鍵登入後再次執行。
)
pause
