#!/bin/bash
echo "========================================="
echo "CPMS - Setup"
echo "========================================="

if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

echo "--- Backend Setup ---"
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed."
    exit 1
fi
echo "✓ Python 3 found"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

echo "Installing Python dependencies..."
source .venv/bin/activate
pip install -r requirements.txt

echo ""
echo "--- Environment Variables ---"
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat <<EOF > .env
MAIL_USERNAME="username"
MAIL_PASSWORD="**********"
MAIL_FROM="test@email.com"
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "--- Frontend Setup ---"
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
echo "  Backend will run on http://127.0.0.1:8000"
echo "  Frontend will run on http://localhost:5173"
echo ""