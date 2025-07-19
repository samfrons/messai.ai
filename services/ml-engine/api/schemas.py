"""
Pydantic schemas for API requests/responses
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class SystemType(str, Enum):
    """Supported system types"""
    MFC = "MFC"
    MEC = "MEC"
    MDC = "MDC"
    MES = "MES"
    BES = "BES"
    PEM = "PEM"
    SOFC = "SOFC"
    PAFC = "PAFC"

class MaterialSpecification(BaseModel):
    """Material specifications for electrodes and membranes"""
    anode_material: str
    cathode_material: str
    membrane_type: Optional[str] = None
    anode_surface_area: float = Field(gt=0, description="Surface area in cm²")
    cathode_surface_area: float = Field(gt=0, description="Surface area in cm²")
    anode_modifications: Optional[List[str]] = None
    cathode_modifications: Optional[List[str]] = None

class OperatingConditions(BaseModel):
    """Operating conditions for the system"""
    temperature: float = Field(ge=273.15, le=373.15, description="Temperature in Kelvin")
    ph: float = Field(ge=0, le=14, description="pH value")
    flow_rate: Optional[float] = Field(None, ge=0, description="Flow rate in mL/min")
    substrate_concentration: Optional[float] = Field(None, ge=0, description="Substrate concentration in g/L")
    external_resistance: Optional[float] = Field(None, ge=0, description="External resistance in Ohms")
    pressure: float = Field(default=1.0, ge=0, description="Pressure in atm")

class SystemConfiguration(BaseModel):
    """System geometric and design configuration"""
    reactor_volume: float = Field(gt=0, description="Reactor volume in mL")
    electrode_spacing: float = Field(gt=0, description="Electrode spacing in cm")
    num_chambers: int = Field(default=2, ge=1, le=10)
    flow_mode: Optional[str] = Field(None, description="batch/continuous/fed-batch")
    
class PredictionRequest(BaseModel):
    """Main prediction request schema"""
    system_type: SystemType
    configuration: SystemConfiguration
    conditions: OperatingConditions
    materials: MaterialSpecification
    user_id: Optional[str] = None
    experiment_id: Optional[str] = None

class PredictionMetric(BaseModel):
    """Individual prediction metric"""
    value: float
    unit: str
    confidence: float = Field(ge=0, le=1)
    uncertainty: Optional[float] = None

class OptimizationRecommendation(BaseModel):
    """Optimization recommendation"""
    parameter: str
    current_value: float
    recommended_value: float
    expected_improvement: float
    confidence: float = Field(ge=0, le=1)
    rationale: str

class PredictionResponse(BaseModel):
    """Prediction response schema"""
    prediction_id: str
    power_output: PredictionMetric
    efficiency: PredictionMetric
    current_density: Optional[PredictionMetric] = None
    voltage: Optional[PredictionMetric] = None
    optimizations: List[OptimizationRecommendation]
    model_version: str
    model_type: str
    confidence_score: float = Field(ge=0, le=1)
    processing_time_ms: float
    timestamp: datetime
    
class ModelInfo(BaseModel):
    """Information about available models"""
    model_id: str
    model_type: str
    version: str
    description: str
    supported_systems: List[SystemType]
    accuracy_metrics: Dict[str, float]
    last_updated: datetime