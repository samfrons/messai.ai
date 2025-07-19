"""
Base model interface for all ML models
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from api.schemas import (
    PredictionRequest, 
    PredictionResponse,
    SystemType,
    OptimizationRecommendation
)
import numpy as np

class BasePredictor(ABC):
    """Abstract base class for all prediction models"""
    
    def __init__(self, model_id: str, version: str):
        self.model_id = model_id
        self.version = version
        self.supported_systems: List[SystemType] = []
        
    @abstractmethod
    async def predict(self, request: PredictionRequest) -> Dict[str, Any]:
        """Generate prediction from request"""
        pass
    
    @abstractmethod
    def preprocess(self, request: PredictionRequest) -> np.ndarray:
        """Preprocess request into model input format"""
        pass
    
    @abstractmethod
    def postprocess(self, raw_output: Any, request: PredictionRequest) -> Dict[str, Any]:
        """Convert model output to standardized format"""
        pass
    
    def supports_system(self, system_type: SystemType) -> bool:
        """Check if model supports given system type"""
        return system_type in self.supported_systems
    
    def calculate_confidence(self, prediction: Dict[str, Any], request: PredictionRequest) -> float:
        """Calculate confidence score for prediction"""
        # Base implementation - can be overridden
        base_confidence = 0.7
        
        # Adjust based on data completeness
        if request.conditions.flow_rate is not None:
            base_confidence += 0.05
        if request.conditions.substrate_concentration is not None:
            base_confidence += 0.05
        if request.materials.anode_modifications:
            base_confidence += 0.05
        if request.materials.cathode_modifications:
            base_confidence += 0.05
            
        return min(base_confidence, 0.95)
    
    def generate_optimizations(
        self, 
        prediction: Dict[str, Any], 
        request: PredictionRequest
    ) -> List[OptimizationRecommendation]:
        """Generate optimization recommendations"""
        # Base implementation - should be overridden by specific models
        return []