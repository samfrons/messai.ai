#!/bin/bash

# Start ML Service with virtual environment

echo "🚀 Starting MESSAI ML Service"
echo "============================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Please run: ./setup_env.sh first"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Set environment variables
export ML_SERVICE_HOST=0.0.0.0
export ML_SERVICE_PORT=8001
export LOG_LEVEL=INFO

# Start the service
echo "Starting ML service on port 8001..."
python app.py