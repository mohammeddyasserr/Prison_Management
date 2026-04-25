#!/bin/bash
# CPMS Setup Script for macOS/Linux
# This script installs all required dependencies for the CPMS application

echo "========================================="
echo "CPMS - Centralized Prison Management System"
echo "Setup Script for macOS/Linux"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if we're in the project root directory
if [ ! -d "frontend" ] || [ ! -d "menna" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check for Node.js
print_info "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16 or higher."
    echo "Download from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version must be 16 or higher (found: $NODE_VERSION)"
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check for npm
print_info "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js."
    exit 1
fi
print_success "npm $(npm -v) found"

# Check for Python
print_info "Checking for Python..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    print_error "Python is not installed. Please install Python v3.8 or higher."
    echo "Download from: https://www.python.org/downloads/"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
print_success "Python $PYTHON_VERSION found"

# Check Python version
PYTHON_MAJOR=$($PYTHON_CMD -c "import sys; print(sys.version_info.major)")
PYTHON_MINOR=$($PYTHON_CMD -c "import sys; print(sys.version_info.minor)")
if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
    print_error "Python version must be 3.8 or higher (found: $PYTHON_VERSION)"
    exit 1
fi

# Check for pip
print_info "Checking for pip..."
if ! $PYTHON_CMD -m pip --version &> /dev/null; then
    print_error "pip is not installed. Please install pip for Python."
    exit 1
fi
print_success "pip found"

echo ""
echo "========================================="
echo "Installing Dependencies"
echo "========================================="
echo ""

# Install Python dependencies
print_info "Installing Python dependencies..."
cd menna/db_project
if [ -d "venv" ]; then
    print_success "Virtual environment already exists - skipping Python dependency installation"
else
    # Try to install directly, fallback to virtualenv if needed
    if ! pip install -r requirements.txt 2>/dev/null; then
        print_info "Creating virtual environment..."
        $PYTHON_CMD -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        deactivate
        print_success "Virtual environment created and dependencies installed"
    else
        print_success "Python dependencies installed globally"
    fi
fi
cd ../..

# Install Node.js dependencies
print_info "Checking Node.js dependencies..."
cd frontend
if [ -d "node_modules" ]; then
    print_success "Node.js dependencies already installed"
else
    npm install
    print_success "Node.js dependencies installed"
fi
cd ..

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
print_info "Next steps:"
echo "  1. Run './run.sh' to start the application"
echo "  2. Open http://localhost:5173 in your browser"
echo "  3. Login with: ADMIN001 / admin123"
echo ""