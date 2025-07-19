"""
Model Manager - Handles model initialization and routing
"""

from typing import Dict, Optional, List, Any
import structlog
import asyncio

from models.base import BasePredictor
from models.opem_wrapper import OPEMPredictor
from models.mfc_predictor import MFCPredictor
from api.schemas import SystemType

logger = structlog.get_logger()

class ModelManager:
    """Manages ML model lifecycle and routing"""
    
    def __init__(self):
        self.models: Dict[str, BasePredictor] = {}
        self.system_model_mapping: Dict[SystemType, List[str]] = {
            # Fuel cell systems use OPEM models
            SystemType.PEM: ['opem_amphlett', 'opem_larminie'],
            SystemType.SOFC: ['opem_amphlett'],
            SystemType.PAFC: ['opem_amphlett'],
            
            # MES systems use MFC predictor
            SystemType.MFC: ['mfc_empirical'],
            SystemType.MEC: ['mfc_empirical'],  # MEC uses similar principles
            SystemType.MDC: ['mfc_empirical'],  # MDC also similar
            SystemType.MES: ['mfc_empirical'],
            SystemType.BES: ['mfc_empirical'],
        }
        
    async def initialize(self):
        """Initialize all models"""
        logger.info("Initializing ML models")
        
        try:
            # Initialize OPEM models
            self.models['opem_amphlett'] = OPEMPredictor('amphlett')
            self.models['opem_larminie'] = OPEMPredictor('larminie')
            self.models['opem_chamberline'] = OPEMPredictor('chamberline')
            
            # Initialize MFC predictor
            self.models['mfc_empirical'] = MFCPredictor()
            
            # TODO: Initialize other models as they're implemented
            # self.models['mfc_lstm'] = MFCLSTMPredictor()  # From JLab
            # self.models['mes_ensemble'] = MESEnsemblePredictor()
            
            logger.info(f"Initialized {len(self.models)} models successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize models", error=str(e))
            raise
    
    async def cleanup(self):
        """Cleanup models on shutdown"""
        logger.info("Cleaning up models")
        # TODO: Implement cleanup logic for models that need it
        pass
    
    def get_model_for_system(self, system_type: SystemType) -> Optional[BasePredictor]:
        """Get the best model for a given system type"""
        
        model_ids = self.system_model_mapping.get(system_type, [])
        
        if not model_ids:
            logger.warning(f"No models configured for system type: {system_type}")
            return None
        
        # For now, return the first available model
        # TODO: Implement model selection logic (A/B testing, performance-based, etc.)
        model_id = model_ids[0]
        
        return self.models.get(model_id)
    
    def get_all_models_for_system(self, system_type: SystemType) -> List[BasePredictor]:
        """Get all models that support a given system type"""
        
        model_ids = self.system_model_mapping.get(system_type, [])
        models = []
        
        for model_id in model_ids:
            if model_id in self.models:
                models.append(self.models[model_id])
        
        return models
    
    async def ensemble_predict(self, request, system_type: SystemType) -> Dict[str, Any]:
        """Generate ensemble prediction using multiple models"""
        
        models = self.get_all_models_for_system(system_type)
        
        if not models:
            raise ValueError(f"No models available for system type: {system_type}")
        
        # Run predictions in parallel
        tasks = [model.predict(request) for model in models]
        predictions = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out failed predictions
        valid_predictions = [p for p in predictions if not isinstance(p, Exception)]
        
        if not valid_predictions:
            raise ValueError("All models failed to generate predictions")
        
        # Simple averaging ensemble (can be improved with weighted averaging)
        # TODO: Implement more sophisticated ensemble methods
        ensemble_result = self._average_predictions(valid_predictions)
        
        return ensemble_result
    
    def _average_predictions(self, predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Average multiple predictions (simple ensemble)"""
        
        # Extract numerical values and average them
        power_values = [p['power_output'].value for p in predictions]
        efficiency_values = [p['efficiency'].value for p in predictions]
        confidence_values = [p['power_output'].confidence for p in predictions]
        
        avg_power = sum(power_values) / len(power_values)
        avg_efficiency = sum(efficiency_values) / len(efficiency_values)
        avg_confidence = sum(confidence_values) / len(confidence_values)
        
        # Use the first prediction as template and update values
        result = predictions[0].copy()
        result['power_output'].value = avg_power
        result['efficiency'].value = avg_efficiency
        result['power_output'].confidence = avg_confidence
        result['efficiency'].confidence = avg_confidence
        result['model_type'] = 'ensemble'
        
        return result