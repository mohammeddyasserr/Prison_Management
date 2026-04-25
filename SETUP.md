# CPMS - Centralized Prison Management System - Setup Guide

This guide will help you set up and run the CPMS application on both macOS and Windows.

## Prerequisites

### For All Systems
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)

### macOS Specific
- **Homebrew** (optional, for easier package management)
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

### Windows Specific
- **Git Bash** or **WSL2** (Windows Subsystem for Linux) recommended for running shell scripts
- Alternatively, use **Command Prompt** or **PowerShell** with the provided `.bat` files

## Quick Start

### Option 1: Automated Setup (Recommended)

#### macOS / Linux
```bash
# Make scripts executable
chmod +x setup.sh run.sh

# Run setup script
./setup.sh

# Run the application
./run.sh
```

#### Windows (using Git Bash or WSL)
```bash
# Run setup script
bash setup.sh

# Run the application
bash run.sh
```

#### Windows (using Command Prompt)
```cmd
setup.bat
run.bat
```

### Option 2: Manual Setup

#### Step 1: Install Python Dependencies
```bash
cd menna/db_project
pip install -r requirements.txt
```

#### Step 2: Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Step 3: Initialize Database
```bash
cd menna/db_project
python main.py
```

#### Step 4: Run the Application

You need to run both the backend and frontend:

**Terminal 1 - Backend:**
```bash
cd menna/db_project
uvicorn main:app --reload --port 8002
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the Application

Once the servers are running:
- **Frontend:** http://localhost:5173 (or the port shown in terminal)

> **Note:** The login now works entirely in the browser - no backend required!
> The application will work even if the Python backend is not running.

### Demo Login Credentials
| Role | Username | Password |
|------|----------|----------|
| Super Admin | `ADMIN001` | `admin123` |
| Prison Manager | `MGR001` | `manager123` |
| Prison Manager | `MGR002` | `manager123` |
| Officer | `OFF001` | `officer123` |
| Officer | `OFF002` | `officer123` |
| Officer | `OFF003` | `officer123` |

## Troubleshooting

### Port Already in Use
If you get "Port already in use" errors:

**macOS / Linux:**
```bash
# Find process using port 8002
lsof -i :8002
# Kill the process (replace PID with actual process ID)
kill -9 PID
```

**Windows:**
```cmd
# Find process using port 8002
netstat -ano | findstr :8002
# Kill the process (replace PID with actual process ID)
taskkill /PID PID /F
```

### Python pip Issues

**macOS:** If you get "externally-managed-environment" error:
```bash
# Use --break-system-packages flag (not recommended for production)
pip install --break-system-packages -r requirements.txt

# OR create a virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows:** If pip is not recognized:
```cmd
# Try python -m pip
python -m pip install -r requirements.txt
```

### Node.js Issues

If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall
npm install
```

### Database Issues

If you get database errors:
```bash
# Delete the existing database and reinitialize
cd menna/db_project
rm cpms.db  # macOS/Linux
del cpms.db  # Windows

# Restart the backend to recreate the database
uvicorn main:app --reload --port 8002
```

## Project Structure

```
Prison_Management/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   └── App.jsx    # Main app component
│   ├── package.json
│   └── vite.config.js
├── menna/db_project/  # Python FastAPI backend
│   ├── routes/        # API route handlers
│   ├── templates/     # HTML templates
│   ├── static/        # CSS and JS files
│   ├── main.py        # Application entry point
│   ├── database.py    # Database setup
│   └── auth.py        # Authentication utilities
├── database/          # Database scripts
│   ├── schemas/       # SQL schema files
│   └── seeds/         # Seed data
├── setup.sh           # Setup script for macOS/Linux
├── setup.bat          # Setup script for Windows
├── run.sh             # Run script for macOS/Linux
├── run.bat            # Run script for Windows
└── SETUP.md           # This file
```

## Development

### Running in Development Mode

The application runs with hot reload enabled:
- Backend: Auto-reloads on Python file changes
- Frontend: Auto-reloads on React file changes

### Adding New Features

1. **Backend API:** Add new routes in `menna/db_project/routes/`
2. **Frontend Pages:** Add new components in `frontend/src/pages/`
3. **Database:** Add new tables in `menna/db_project/database.py`

## Production Deployment

For production deployment:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Run the backend without reload:**
   ```bash
   cd menna/db_project
   uvicorn main:app --host 0.0.0.0 --port 8002
   ```

3. **Set up a production web server** (nginx, Apache) to serve the frontend and proxy API requests.

## Support

If you encounter any issues not covered in this guide, please check:
- Existing issues on the GitHub repository
- The application logs for error messages