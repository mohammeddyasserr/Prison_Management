@echo off
echo =========================================
echo CPMS - Setup
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

echo --- Backend Setup ---
echo Checking for Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed.
    pause
    exit /b 1
)
echo ✓ Python found

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Installing Python dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo --- Frontend Setup ---
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
echo   Backend will run on http://127.0.0.1:8000
echo   Frontend will run on http://localhost:5173
echo.
pause