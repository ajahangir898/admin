@echo off
echo Starting YOLO API Server...
echo.

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    exit /b 1
)

:: Navigate to the src directory
cd /d %~dp0

:: Check if virtual environment exists
if not exist "..\venv" (
    echo Creating virtual environment...
    python -m venv ..\venv
)

:: Activate virtual environment
call ..\venv\Scripts\activate.bat

:: Install requirements if needed
pip install -r requirements-yolo.txt --quiet

:: Start the YOLO API server
echo.
echo Starting YOLO API on http://0.0.0.0:8001
echo Press Ctrl+C to stop the server
echo.
python -m uvicorn image_analysis_api:app --host 0.0.0.0 --port 8001 --reload
