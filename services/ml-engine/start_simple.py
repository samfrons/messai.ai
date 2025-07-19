#!/usr/bin/env python3
"""
Simple start script that bypasses config issues
"""

import os
import sys

# Set minimal environment variables
os.environ['ML_ALLOWED_ORIGINS'] = '["http://localhost:3000"]'
os.environ['ML_PORT'] = '8001'
os.environ['ML_LOG_LEVEL'] = 'INFO'

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import uvicorn
    
    print("🚀 Starting MESSAI ML Service (Simple Mode)")
    print("=" * 50)
    print("URL: http://localhost:8001")
    print("Health: http://localhost:8001/health")
    print("Docs: http://localhost:8001/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=False,  # No reload to avoid config issues
        log_level="info"
    )
    
except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure you've activated the virtual environment:")
    print("  source venv/bin/activate")