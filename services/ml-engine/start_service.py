#!/usr/bin/env python3
"""
Quick start script for MESSAI ML Service
"""

import os
import sys
import subprocess
from pathlib import Path

# Add the service directory to Python path
service_dir = Path(__file__).parent
sys.path.insert(0, str(service_dir))

def check_requirements():
    """Check if required packages are installed"""
    try:
        import fastapi
        import opem
        import structlog
        print("✅ Core packages installed")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("\nInstalling requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def start_service():
    """Start the ML service"""
    print("\n🚀 Starting MESSAI ML Service...")
    print("=" * 50)
    
    # Set environment variables if not set
    os.environ.setdefault('ML_SERVICE_HOST', '0.0.0.0')
    os.environ.setdefault('ML_SERVICE_PORT', '8001')
    os.environ.setdefault('LOG_LEVEL', 'INFO')
    
    # Use uvicorn to run the service
    try:
        import uvicorn
        uvicorn.run(
            "app:app",
            host=os.environ.get('ML_SERVICE_HOST', '0.0.0.0'),
            port=int(os.environ.get('ML_SERVICE_PORT', 8001)),
            reload=True,
            log_level=os.environ.get('LOG_LEVEL', 'info').lower()
        )
    except ImportError:
        # Fallback to running directly
        print("Installing uvicorn...")
        subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn"])
        # Try again
        import uvicorn
        uvicorn.run(
            "app:app",
            host='0.0.0.0',
            port=8001,
            reload=True
        )

if __name__ == "__main__":
    check_requirements()
    start_service()