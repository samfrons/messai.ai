#!/bin/bash

# Quick Start ML Service - Handles everything automatically

echo "🚀 MESSAI ML Service Quick Start"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

# Setup virtual environment if not exists
if [ ! -d "venv" ]; then
    echo -e "\n${YELLOW}Setting up virtual environment...${NC}"
    python3 -m venv venv
    
    # Activate and install requirements
    source venv/bin/activate
    python -m pip install --upgrade pip
    
    echo -e "\n${YELLOW}Installing core requirements...${NC}"
    # Install only essential packages first
    pip install fastapi uvicorn pydantic numpy scipy
    
    echo -e "\n${YELLOW}Installing OPEM...${NC}"
    pip install opem
    
    echo -e "\n${YELLOW}Installing additional packages...${NC}"
    pip install structlog prometheus-client python-dotenv pydantic-settings
else
    echo -e "${GREEN}✅ Virtual environment found${NC}"
    source venv/bin/activate
fi

# Set environment variables
export ML_SERVICE_HOST=0.0.0.0
export ML_SERVICE_PORT=8001
export LOG_LEVEL=INFO

# Check if service is already running
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "\n${YELLOW}⚠️  Port 8001 is already in use${NC}"
    echo "ML service might already be running."
    echo "Check: http://localhost:8001/health"
    exit 0
fi

# Start the service
echo -e "\n${GREEN}🎉 Starting ML Service...${NC}"
echo "================================"
echo "Service URL: http://localhost:8001"
echo "Health Check: http://localhost:8001/health"
echo "API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop"
echo "================================"

# Use Python directly if uvicorn command not found
if command_exists uvicorn; then
    uvicorn app:app --host 0.0.0.0 --port 8001 --reload
else
    python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
fi