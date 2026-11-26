@echo off
setlocal
cd /d "%~dp0web"

netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    start "" /b npx next start -p 3001
    ping 127.0.0.1 -n 4 >nul
)

start http://localhost:3001
exit
