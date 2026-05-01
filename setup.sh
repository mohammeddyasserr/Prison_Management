#!/bin/bash
echo "========================================="
echo "CPMS - Frontend Setup (Mock Data Mode)"
echo "========================================="

if [ ! -d "frontend" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Download from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js $(node -v) found"

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi
echo "✓ npm $(npm -v) found"

cd frontend
if [ -d "node_modules" ]; then
    echo "✓ Node.js dependencies already installed"
else
    npm install
    echo "✓ Node.js dependencies installed"
fi
cd ..

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo "  Run './run.sh' to start the application"
echo "  Open http://localhost:5173 in your browser"
echo ""