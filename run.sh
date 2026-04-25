#!/bin/bash
echo "========================================="
echo "CPMS - Frontend Only (Mock Data Mode)"
echo "========================================="

if [ ! -d "frontend" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

cd frontend
npm run dev &
FRONTEND_PID=$!

sleep 3

echo ""
echo "========================================="
echo "Frontend running at http://localhost:5173"
echo "Running with mock data - no backend needed"
echo "========================================="
echo ""

if command -v open &> /dev/null; then
    open http://localhost:5173
fi

wait $FRONTEND_PID