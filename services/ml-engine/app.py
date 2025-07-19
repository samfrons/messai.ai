"""
MESSAI ML Service - Main FastAPI Application
Provides ML predictions for microbial electrochemical systems
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog
from prometheus_client import make_asgi_app

from api.predict import router as predict_router
from api.health import router as health_router

# Optional materials router (requires mp-api)
try:
    from api.materials import router as materials_router
    MATERIALS_AVAILABLE = True
except ImportError:
    materials_router = None
    MATERIALS_AVAILABLE = False
from utils.logging import setup_logging
from utils.config import settings

# Setup structured logging
setup_logging()
logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    logger.info("Starting ML service", version=settings.VERSION)
    
    # Initialize models on startup
    try:
        from models.model_manager import ModelManager
        model_manager = ModelManager()
        await model_manager.initialize()
        app.state.model_manager = model_manager
        logger.info("Models initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize models", error=str(e))
        raise
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down ML service")
    await model_manager.cleanup()

# Create FastAPI app
app = FastAPI(
    title="MESSAI ML Service",
    description="Machine Learning predictions for microbial electrochemical systems",
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include routers
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(predict_router, prefix="/api/ml", tags=["predictions"])

# Include materials router if available
if MATERIALS_AVAILABLE:
    app.include_router(materials_router, prefix="/api/materials", tags=["materials"])
    logger.info("Materials API enabled")
else:
    logger.info("Materials API disabled (mp-api not installed)")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "MESSAI ML Engine",
        "version": settings.VERSION,
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )