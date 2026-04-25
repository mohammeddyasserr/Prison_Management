@echo off
echo =========================================
echo CPMS - Frontend Setup (Mock Data Mode)
echo =========================================
echo.

if not exist "frontend" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Download from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
node --version

echo.
echo Checking Node.js dependencies...
cd frontend
if exist "node_modules" (
    echo ✓ Node.js dependencies already installed
) else (
    call npm install
    echo ✓ Node.js dependencies installed
)
cd ..

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo   Run 'run.bat' to start the application
echo   Open http://localhost:5173 in your browser
echo.
pause