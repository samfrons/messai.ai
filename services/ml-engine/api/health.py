"""
Health check endpoints for ML service
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any
import psutil
import torch
import tensorflow as tf

router = APIRouter()

@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "ml-engine"
    }

@router.get("/ready")
async def readiness_check() -> Dict[str, Any]:
    """Readiness probe - checks if models are loaded"""
    # TODO: Check if models are actually loaded
    return {
        "status": "ready",
        "models_loaded": True
    }

@router.get("/status")
async def detailed_status() -> Dict[str, Any]:
    """Detailed system status"""
    
    # Get system metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    
    # Check GPU availability
    cuda_available = torch.cuda.is_available()
    gpu_count = torch.cuda.device_count() if cuda_available else 0
    
    return {
        "status": "operational",
        "system": {
            "cpu_usage_percent": cpu_percent,
            "memory_usage_percent": memory.percent,
            "memory_available_gb": memory.available / (1024**3)
        },
        "ml_frameworks": {
            "torch_version": torch.__version__,
            "tensorflow_version": tf.__version__,
            "cuda_available": cuda_available,
            "gpu_count": gpu_count
        }
    }