# Prison Management System

## Project Overview
The Prison Management System is a full-stack application designed to efficiently manage and streamline prison operations. It provides an intuitive interface and a robust backend to handle various administrative tasks, including inmate records management, staff shift scheduling, incident and disciplinary action tracking, and automated inmate release processing.

## Setup and Running Instructions

There are two ways to set up and run the project: using the provided automated scripts, or following the manual step-by-step instructions.

---

### Option 1: Automated Setup (Recommended)

#### 1. Run the Setup Script
Run the automated setup script to create the virtual environment, install all dependencies (Python & Node.js), and generate a `.env` file with default values:
- **Windows**:
  ```cmd
  setup.bat
  ```
- **macOS/Linux**:
  ```bash
  ./setup.sh
  ```

#### 2. Run the Application
Run the start script to automatically execute the release checker, start the backend server, start the frontend server, and open the app in your browser:
- **Windows**:
  ```cmd
  run.bat
  ```
- **macOS/Linux**:
  ```bash
  ./run.sh
  ```

---

### Option 2: Manual Setup

#### 1. Create a Virtual Environment
Create a Python virtual environment to manage dependencies:
```bash
python -m venv .venv
```

#### 2. Activate the Virtual Environment
Activate the newly created virtual environment:
- **Windows**:
  ```bash
  .venv\Scripts\activate
  ```
- **macOS/Linux**:
  ```bash
  source .venv/bin/activate
  ```

#### 3. Install Requirements
Install all the necessary Python dependencies for the project:
```bash
pip install -r requirements.txt
```

#### 4. Configure Environment Variables
Create a `.env` file in the root directory and populate it with the required configuration data:
```env
MAIL_USERNAME=username
MAIL_PASSWORD=**********
MAIL_FROM=test@email.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

#### 5. Initialize the Database
Run the database initialization script to set up the necessary tables and structure:
```bash
python database/initialize.py
```

#### 6. Run the Release Checker
Execute the script that checks and updates the status of inmates who are due for release:
```bash
python backend/check_release.py
```

#### 7. Run the Backend
Start the backend server. Navigate to the `backend` folder and run the server application:
```bash
cd backend
uvicorn main:app --reload
```

#### 8. Run the Frontend
Start the frontend application. Open a new terminal, navigate to the `frontend` folder, install Node.js dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
