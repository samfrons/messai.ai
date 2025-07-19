"""
Prediction API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, List
import time
import uuid
from datetime import datetime
import structlog

from api.schemas import (
    PredictionRequest,
    PredictionResponse,
    ModelInfo,
    SystemType
)
from models.model_manager import ModelManager

router = APIRouter()
logger = structlog.get_logger()

def get_model_manager(request: Request) -> ModelManager:
    """Dependency to get model manager from app state"""
    return request.app.state.model_manager

@router.post("/predict", response_model=PredictionResponse)
async def generate_prediction(
    request: PredictionRequest,
    model_manager: ModelManager = Depends(get_model_manager)
) -> PredictionResponse:
    """Generate prediction for given system configuration"""
    
    start_time = time.time()
    prediction_id = f"pred_{uuid.uuid4().hex[:12]}"
    
    try:
        logger.info(
            "Processing prediction request",
            prediction_id=prediction_id,
            system_type=request.system_type
        )
        
        # Select appropriate model based on system type
        model = model_manager.get_model_for_system(request.system_type)
        
        if not model:
            raise HTTPException(
                status_code=400,
                detail=f"No model available for system type: {request.system_type}"
            )
        
        # Generate prediction
        prediction_data = await model.predict(request)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        # Build response
        response = PredictionResponse(
            prediction_id=prediction_id,
            power_output=prediction_data['power_output'],
            efficiency=prediction_data['efficiency'],
            current_density=prediction_data.get('current_density'),
            voltage=prediction_data.get('voltage'),
            optimizations=prediction_data.get('optimizations', []),
            model_version=model.version,
            model_type=prediction_data.get('model_type', model.model_id),
            confidence_score=prediction_data['power_output'].confidence,
            processing_time_ms=processing_time,
            timestamp=datetime.utcnow()
        )
        
        logger.info(
            "Prediction completed",
            prediction_id=prediction_id,
            processing_time_ms=processing_time,
            confidence=response.confidence_score
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Prediction failed",
            prediction_id=prediction_id,
            error=str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@router.get("/models", response_model=List[ModelInfo])
async def list_available_models(
    model_manager: ModelManager = Depends(get_model_manager)
) -> List[ModelInfo]:
    """List all available models and their capabilities"""
    
    models = []
    
    for model_id, model in model_manager.models.items():
        models.append(ModelInfo(
            model_id=model_id,
            model_type=model.__class__.__name__,
            version=model.version,
            description=f"{model.__class__.__doc__ or 'ML model for MES predictions'}",
            supported_systems=model.supported_systems,
            accuracy_metrics={
                "rmse": 0.12,  # Placeholder - implement actual metrics
                "r2": 0.89,
                "mae": 0.08
            },
            last_updated=datetime.utcnow()
        ))
    
    return models

@router.post("/batch-predict")
async def batch_prediction(
    requests: List[PredictionRequest],
    model_manager: ModelManager = Depends(get_model_manager)
) -> Dict[str, Any]:
    """Process multiple predictions in batch"""
    
    if len(requests) > 100:
        raise HTTPException(
            status_code=400,
            detail="Batch size exceeds maximum of 100 predictions"
        )
    
    start_time = time.time()
    batch_id = f"batch_{uuid.uuid4().hex[:12]}"
    
    logger.info(
        "Processing batch prediction",
        batch_id=batch_id,
        batch_size=len(requests)
    )
    
    results = []
    errors = []
    
    for idx, request in enumerate(requests):
        try:
            # Generate individual prediction
            response = await generate_prediction(request, model_manager)
            results.append(response.dict())
        except Exception as e:
            errors.append({
                "index": idx,
                "error": str(e),
                "system_type": request.system_type
            })
    
    processing_time = (time.time() - start_time) * 1000
    
    return {
        "batch_id": batch_id,
        "total_requests": len(requests),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
        "processing_time_ms": processing_time,
        "timestamp": datetime.utcnow()
    }