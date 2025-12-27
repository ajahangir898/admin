#!/bin/bash

echo "Starting YOLO API Server..."
echo ""

# Navigate to the src directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv ../venv
fi

# Activate virtual environment
source ../venv/bin/activate

# Install requirements if needed
pip install -r requirements-yolo.txt --quiet

# Start the YOLO API server
echo ""
echo "Starting YOLO API on http://0.0.0.0:8001"
echo "Press Ctrl+C to stop the server"
echo ""
python -m uvicorn image_analysis_api:app --host 0.0.0.0 --port 8001 --reload
