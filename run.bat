@echo off
echo =========================================
echo CPMS - Full Stack Mode
echo =========================================
echo.

if not exist "frontend" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)
if not exist "backend" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Starting Backend...
cd backend
if exist "..\.venv\Scripts\activate.bat" (
    start "CPMS Backend" cmd /k "..\.venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"
) else (
    start "CPMS Backend" cmd /k "uvicorn main:app --reload --port 8000"
)
cd ..

echo Starting React frontend...
cd frontend
start "CPMS Frontend" cmd /k "npm run dev"
cd ..

echo.
timeout /t 3 /nobreak >nul

echo =========================================
echo Backend running at http://127.0.0.1:8000
echo Frontend running at http://localhost:5173
echo =========================================
echo.

start http://localhost:5173
pause