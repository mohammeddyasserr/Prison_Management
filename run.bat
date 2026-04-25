@echo off
REM CPMS Run Script for Windows
REM This script starts both the backend and frontend servers

echo =========================================
echo CPMS - Centralized Prison Management System
echo Starting Application...
echo =========================================
echo.

REM Check if we're in the project root directory
if not exist "frontend" (
    echo ERROR: Please run this script from the project root directory
    echo Could not find 'frontend' folder
    pause
    exit /b 1
)

if not exist "menna" (
    echo ERROR: Please run this script from the project root directory
    echo Could not find 'menna' folder
    pause
    exit /b 1
)

REM Determine Python command
where python >nul 2>nul
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
) else (
    where python3 >nul 2>nul
    if %errorlevel% equ 0 (
        set PYTHON_CMD=python3
    ) else (
        echo ERROR: Python is not installed.
        pause
        exit /b 1
    )
)

REM Check if virtual environment exists and use it
set VENV_DIR=menna\db_project\venv
if exist "%VENV_DIR%" (
    echo Using virtual environment for Python...
    call "%VENV_DIR%\Scripts\activate.bat"
)

REM Kill any existing processes on port 8002
echo Checking port 8002...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8002') do (
    echo Killing process on port 8002 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>nul
)

REM Start backend
echo Starting FastAPI backend on port 8002...
cd menna\db_project

REM Initialize database first
%PYTHON_CMD% -c "from database import init_db; init_db()" 2>nul

REM Start uvicorn in a new window
start "CPMS Backend" cmd /k "cd menna\db_project && %PYTHON_CMD% -m uvicorn main:app --reload --port 8002"
cd ..\..

echo ✓ Backend starting...

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting React frontend...
cd frontend
start "CPMS Frontend" cmd /k "npm run dev"
cd ..

echo ✓ Frontend starting...

echo.
echo =========================================
echo Application is starting...
echo =========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8002
echo.
echo Demo credentials:
echo   Username: ADMIN001
echo   Password: admin123
echo.
echo Two new command windows will open:
echo   - CPMS Backend (port 8002)
echo   - CPMS Frontend (port 5173)
echo.
echo To stop the application, close both windows.
echo.

REM Try to open in browser
start http://localhost:5173

pause