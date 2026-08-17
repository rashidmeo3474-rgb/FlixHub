@echo off
echo ===================================
echo  FlixHub Streaming Platform Startup
echo ===================================
echo.

echo [1/4] Checking system requirements...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [2/4] Starting MongoDB (optional)...
net start MongoDB >nul 2>nul
if %errorlevel% equ 0 (
    echo MongoDB service started successfully.
) else (
    echo MongoDB not available - will run in MOCK MODE
    echo For full functionality, install and start MongoDB
)

echo.
echo [3/4] Starting Backend Server...
start "FlixHub Server" cmd /k "cd /d server && npm run dev"
timeout /t 3 >nul

echo [4/4] Starting Frontend Client...  
start "FlixHub Client" cmd /k "cd /d client && npm run dev"

echo.
echo ===================================
echo  System Starting...
echo ===================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend Client: http://localhost:5173
echo.
echo ADMIN LOGIN (Mock Mode):
echo Email: businessyttom@gmail.com
echo Password: admin123
echo.
echo Press any key to open admin panel...
pause >nul
start http://localhost:5173

echo.
echo System started! Check the opened windows.
echo Press any key to exit this window...
pause >nul