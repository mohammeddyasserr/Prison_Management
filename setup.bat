@echo off
REM CPMS Setup Script for Windows
REM This script installs all required dependencies for the CPMS application

echo =========================================
echo CPMS - Centralized Prison Management System
echo Setup Script for Windows
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

REM Check for Node.js
echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js v16 or higher from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found: 
node --version
echo.

REM Check for npm
echo Checking for npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install Node.js.
    pause
    exit /b 1
)
echo ✓ npm found: 
npm --version
echo.

REM Check for Python
echo Checking for Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo ERROR: Python is not installed.
        echo Please install Python v3.8 or higher from https://www.python.org/downloads/
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)

echo ✓ Python found
%PYTHON_CMD% --version
echo.

REM Check for pip
echo Checking for pip...
%PYTHON_CMD% -m pip --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: pip is not installed. Please install pip for Python.
    pause
    exit /b 1
)
echo ✓ pip found
echo.

echo =========================================
echo Installing Dependencies
echo =========================================
echo.

REM Install Python dependencies
echo Installing Python dependencies...
cd menna\db_project

REM Check if virtual environment exists
if exist "venv" (
    echo ✓ Virtual environment already exists - skipping Python installation
) else (
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo.
        echo Creating virtual environment...
        python -m venv venv
        call venv\Scripts\activate.bat
        python -m pip install -r requirements.txt
        call venv\Scripts\deactivate.bat
        echo ✓ Virtual environment created and dependencies installed
    ) else (
        echo ✓ Python dependencies installed globally
    )
)
cd ..\..

echo.

REM Install Node.js dependencies
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
echo Next steps:
echo   1. Run 'run.bat' to start the application
echo   2. Open http://localhost:5173 in your browser
echo   3. Login with: ADMIN001 / admin123
echo.
pause