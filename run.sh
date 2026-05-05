#!/bin/bash
echo "========================================="
echo "CPMS - Full Stack Mode"
echo "========================================="

if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

echo "Starting Backend..."
# Assuming .venv is in root
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

echo ""
echo "========================================="
echo "Backend running at http://127.0.0.1:8000"
echo "Frontend running at http://localhost:5173"
echo "========================================="
echo ""

if command -v open &> /dev/null; then
    open http://localhost:5173
fi

# Function to handle script termination
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

wait $FRONTEND_PID $BACKEND_PID