#!/bin/bash

# Setup Python virtual environment for ML service

echo "🔧 Setting up ML Service Environment"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create virtual environment
echo -e "\n${YELLOW}Creating virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "\n${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "\n${YELLOW}Upgrading pip...${NC}"
python -m pip install --upgrade pip

# Install requirements
echo -e "\n${YELLOW}Installing requirements...${NC}"
pip install -r requirements.txt

# Additional packages that might be missing
echo -e "\n${YELLOW}Installing additional packages...${NC}"
pip install uvicorn opem

echo -e "\n${GREEN}✅ Environment setup complete!${NC}"
echo -e "\nTo start the ML service, run:"
echo -e "  ${YELLOW}source venv/bin/activate${NC}"
echo -e "  ${YELLOW}python app.py${NC}"
echo -e "\nOr use the provided start script:"
echo -e "  ${YELLOW}./start_ml_service.sh${NC}"