#!/usr/bin/env python3
"""
Minimal test to verify ML service starts correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    
    # Test basic imports
    import fastapi
    print("✅ FastAPI imported")
    
    import opem
    print("✅ OPEM imported")
    
    # Test OPEM modules
    from opem.Static import Amphlett, Larminie_Dicks, Chamberline_Kim
    print("✅ OPEM Static models imported")
    
    # Test our modules
    from models.mfc_predictor import MFCPredictor
    print("✅ MFC Predictor imported")
    
    from models.opem_wrapper import OPEMPredictor
    print("✅ OPEM Wrapper imported")
    
    # Test model manager
    from models.model_manager import ModelManager
    print("✅ Model Manager imported")
    
    # Test app
    from app import app
    print("✅ FastAPI app imported")
    
    print("\n🎉 All imports successful! The service should start correctly.")
    print("\nRun the service with: ./quickstart.sh")
    
except ImportError as e:
    print(f"\n❌ Import error: {e}")
    print("\nTry running:")
    print("  source venv/bin/activate")
    print("  pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)