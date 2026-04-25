@echo off
echo =========================================
echo CPMS - Frontend Only (Mock Data Mode)
echo =========================================
echo.

if not exist "frontend" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Starting React frontend with mock data...
cd frontend
start "CPMS Frontend" cmd /k "npm run dev"
cd ..

echo.
timeout /t 3 /nobreak >nul

echo =========================================
echo Frontend running at http://localhost:5173
echo Running with mock data - no backend needed
echo =========================================
echo.

start http://localhost:5173
pause