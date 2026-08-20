@echo off
title FlixHub Development Environment
echo ================================
echo FlixHub Development Environment
echo ================================
echo.

echo Checking MongoDB status...
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service not found. Starting manually...
    echo Please ensure MongoDB is installed and running.
    echo Run start-mongodb.bat first if needed.
) else (
    echo MongoDB service found. Starting if not running...
    net start MongoDB 2>nul
)

echo.
echo Starting Backend Server...
start "FlixHub Backend" cmd /k "cd server && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Development Server...
start "FlixHub Frontend" cmd /k "cd client && npm run dev"

echo.
echo ================================
echo Development Environment Started!
echo ================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Close this window to keep both servers running.
echo Or press any key to exit...
pause >nul