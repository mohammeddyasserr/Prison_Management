#!/bin/bash
# CPMS Run Script for macOS/Linux
# This script starts both the backend and frontend servers

echo "========================================="
echo "CPMS - Centralized Prison Management System"
echo "Starting Application..."
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the project root directory
if [ ! -d "frontend" ] || [ ! -d "menna" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
is_port_in_use() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        print_info "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Check and free up port 8002 if needed
print_info "Checking port 8002..."
if is_port_in_use 8002; then
    print_info "Port 8002 is already in use by another process"
    print_info "Killing existing process on port 8002..."
    kill_port 8002
    sleep 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

# Check if virtual environment exists and use it
USE_VENV=false
if [ -d "menna/db_project/venv" ]; then
    USE_VENV=true
    print_info "Virtual environment found - will use for backend"
fi

# Start backend in background
print_info "Starting FastAPI backend on port 8002..."
cd menna/db_project

# Initialize database first
if [ "$USE_VENV" = true ]; then
    source venv/bin/activate
    python -c "from database import init_db; init_db()" 2>/dev/null
    deactivate
else
    $PYTHON_CMD -c "from database import init_db; init_db()" 2>/dev/null
fi

# Start uvicorn
if [ "$USE_VENV" = true ]; then
    source venv/bin/activate
    nohup python -m uvicorn main:app --reload --port 8002 > ../../backend.log 2>&1 &
    deactivate
else
    nohup uvicorn main:app --reload --port 8002 > ../../backend.log 2>&1 &
fi
BACKEND_PID=$!
cd ../..

print_success "Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
print_info "Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ! is_port_in_use 8002; then
    print_error "Backend failed to start. Check backend.log for details."
    cat backend.log
    exit 1
fi

print_success "Backend is running on http://localhost:8002"

# Start frontend
print_info "Starting React frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

print_success "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "========================================="
echo "Application is starting..."
echo "========================================="
echo ""
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}Backend API: http://localhost:8002${NC}"
echo ""
echo "Demo credentials:"
echo -e "  ${YELLOW}Username: ADMIN001${NC}"
echo -e "  ${YELLOW}Password: admin123${NC}"
echo ""
echo "To stop the application, press Ctrl+C or run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend: backend.log"
echo "  Frontend: frontend.log"
echo ""

# Wait for frontend to start
sleep 3

# Try to open in browser (macOS only)
if command -v open &> /dev/null; then
    print_info "Opening application in browser..."
    open http://localhost:5173
fi

# Keep the script running
wait