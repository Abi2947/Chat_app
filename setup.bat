@echo off
REM filepath: c:\Users\aabin\Desktop\intern_tasks\palm_mind\chat_app\frontend\setup.bat
REM Chat App Frontend - Automated Setup Script for Windows

echo.
echo ========================================
echo   Chat App - Frontend Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check if npm is installed
echo Checking for npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✓ npm is installed

echo.
echo ========================================
echo   Installing Dependencies
echo ========================================
echo.

REM Install dependencies
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully

echo.
echo ========================================
echo   Creating .env File
echo ========================================
echo.

REM Check if .env exists
if exist .env (
    echo .env file already exists. Skipping...
) else (
    REM Create .env from .env.example
    if exist .env.example (
        copy .env.example .env
        echo ✓ .env file created from .env.example
    ) else (
        echo Creating .env file...
        (
            echo REACT_APP_API_URL=http://localhost:5000
            echo REACT_APP_SOCKET_URL=http://localhost:5000
        ) > .env
        echo ✓ .env file created
    )
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env file if needed:
echo    - REACT_APP_API_URL (Backend API URL)
echo    - REACT_APP_SOCKET_URL (Socket.IO URL)
echo.
echo 2. Start the development server:
echo    npm start
echo.
echo 3. The app will open at: http://localhost:3000
echo.
echo Make sure your backend is running on http://localhost:5000
echo.
pause