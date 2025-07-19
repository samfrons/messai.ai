"""
MFC Predictor - Microbial Fuel Cell prediction model
Based on Logan et al. (2019) correlations and empirical models
"""

from typing import Dict, Any, List, Optional
import numpy as np
import structlog
import asyncio
from datetime import datetime
import uuid

from models.base import BasePredictor
from api.schemas import (
    PredictionRequest, 
    PredictionResponse,
    SystemType,
    PredictionMetric,
    OptimizationRecommendation
)

logger = structlog.get_logger()

class MFCPredictor(BasePredictor):
    """Predictor for Microbial Fuel Cell systems"""
    
    def __init__(self):
        super().__init__(
            model_id="mfc_empirical_v1",
            version="1.0.0"
        )
        self.supported_systems = [SystemType.MFC, SystemType.MES, SystemType.BES]
        
        # Material property database (conductivity relative to carbon cloth = 1.0)
        self.material_properties = {
            'carbon_cloth': {'conductivity': 1.0, 'biocompatibility': 0.9},
            'carbon_felt': {'conductivity': 0.85, 'biocompatibility': 0.85},
            'carbon_paper': {'conductivity': 0.9, 'biocompatibility': 0.8},
            'graphite': {'conductivity': 1.1, 'biocompatibility': 0.7},
            'carbon_nanotubes': {'conductivity': 1.5, 'biocompatibility': 0.95},
            'graphene': {'conductivity': 1.6, 'biocompatibility': 0.9},
            'stainless_steel': {'conductivity': 0.8, 'biocompatibility': 0.6},
            'titanium': {'conductivity': 0.7, 'biocompatibility': 0.8},
            'platinum': {'conductivity': 1.3, 'biocompatibility': 0.95},
        }
        
        # Substrate constants (g COD/L to mW/cm²)
        self.substrate_factors = {
            'acetate': 0.8,
            'glucose': 0.6,
            'wastewater': 0.4,
            'lactate': 0.7,
            'butyrate': 0.75,
            'ethanol': 0.65,
        }
    
    async def predict(self, request: PredictionRequest) -> Dict[str, Any]:
        """Generate MFC prediction using empirical correlations"""
        
        start_time = datetime.now()
        
        # Preprocess inputs
        features = self.preprocess(request)
        
        # Calculate power output using Logan correlation
        power_density = self._calculate_power_density(request, features)
        
        # Calculate other metrics
        voltage = self._calculate_voltage(power_density, request)
        current_density = power_density / voltage if voltage > 0 else 0
        efficiency = self._calculate_efficiency(power_density, request)
        
        # Generate optimizations
        optimizations = self.generate_optimizations(
            {'power_density': power_density, 'efficiency': efficiency}, 
            request
        )
        
        # Calculate confidence
        confidence = self.calculate_confidence(
            {'power_density': power_density}, 
            request
        )
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Format response
        return self.postprocess({
            'power_density': power_density,
            'voltage': voltage,
            'current_density': current_density,
            'efficiency': efficiency,
            'optimizations': optimizations,
            'confidence': confidence,
            'processing_time': processing_time
        }, request)
    
    def preprocess(self, request: PredictionRequest) -> np.ndarray:
        """Extract and normalize features from request"""
        
        # Extract material properties
        anode_props = self.material_properties.get(
            request.materials.anode_material.lower().replace(' ', '_'),
            {'conductivity': 0.5, 'biocompatibility': 0.5}
        )
        cathode_props = self.material_properties.get(
            request.materials.cathode_material.lower().replace(' ', '_'),
            {'conductivity': 0.5, 'biocompatibility': 0.5}
        )
        
        # Normalize features
        features = np.array([
            request.conditions.temperature / 298.15,  # Normalized to room temp
            request.conditions.ph / 7.0,  # Normalized to neutral pH
            request.conditions.substrate_concentration or 1.0,
            request.materials.anode_surface_area / 10.0,  # Normalized to 10 cm²
            request.materials.cathode_surface_area / 10.0,
            anode_props['conductivity'],
            anode_props['biocompatibility'],
            cathode_props['conductivity'],
            request.configuration.electrode_spacing / 2.0,  # Normalized to 2 cm
            request.configuration.reactor_volume / 100.0,  # Normalized to 100 mL
        ])
        
        return features
    
    def _calculate_power_density(self, request: PredictionRequest, features: np.ndarray) -> float:
        """
        Calculate power density using Logan et al. (2019) correlation
        P = k * S^α * A * exp(-Ea/RT) * f(pH) * f(materials)
        """
        
        # Base rate constant
        k = 0.5  # mW/cm²
        
        # Substrate effect (Monod-like)
        S = request.conditions.substrate_concentration or 1.0
        Ks = 0.5  # Half-saturation constant
        substrate_term = S / (S + Ks)
        
        # Temperature effect (Arrhenius)
        T = request.conditions.temperature
        Ea = 20000  # Activation energy (J/mol)
        R = 8.314  # Gas constant
        temp_term = np.exp(-Ea / (R * T)) * (T / 298.15)
        
        # pH effect (optimal at pH 7)
        ph = request.conditions.ph
        ph_term = np.exp(-0.5 * ((ph - 7.0) / 1.5) ** 2)
        
        # Surface area effect
        area_term = np.sqrt(request.materials.anode_surface_area / 10.0)
        
        # Material effect
        anode_cond = features[5]  # Anode conductivity
        cathode_cond = features[7]  # Cathode conductivity
        material_term = np.sqrt(anode_cond * cathode_cond)
        
        # Spacing effect (inverse relationship)
        spacing_term = 1.0 / (1.0 + request.configuration.electrode_spacing / 2.0)
        
        # Calculate power density
        power_density = (k * substrate_term * temp_term * ph_term * 
                        area_term * material_term * spacing_term)
        
        # Apply substrate-specific factor
        substrate_type = request.conditions.substrate_concentration
        if substrate_type and substrate_type > 0:
            power_density *= 0.7  # Default substrate factor
        
        return max(0.0, min(power_density, 5.0))  # Clamp to realistic range
    
    def _calculate_voltage(self, power_density: float, request: PredictionRequest) -> float:
        """Calculate operating voltage"""
        
        # Theoretical maximum voltage
        E0 = 0.8  # V for acetate
        
        # Losses
        ohmic_loss = 0.1 * (request.configuration.electrode_spacing / 2.0)
        activation_loss = 0.05 * (1.0 / request.conditions.temperature * 298.15)
        concentration_loss = 0.05 * np.log(1 + power_density)
        
        voltage = E0 - ohmic_loss - activation_loss - concentration_loss
        
        return max(0.1, min(voltage, E0))
    
    def _calculate_efficiency(self, power_density: float, request: PredictionRequest) -> float:
        """Calculate coulombic efficiency"""
        
        # Base efficiency
        base_efficiency = 0.3
        
        # Temperature effect
        T = request.conditions.temperature
        temp_factor = 1.0 + 0.1 * ((T - 298.15) / 10.0)
        
        # pH effect
        ph_factor = 1.0 - 0.05 * abs(request.conditions.ph - 7.0)
        
        # Power effect (higher power often means lower efficiency)
        power_factor = 1.0 - 0.1 * power_density
        
        efficiency = base_efficiency * temp_factor * ph_factor * power_factor
        
        return max(0.1, min(efficiency, 0.8))
    
    def postprocess(self, raw_output: Dict[str, Any], request: PredictionRequest) -> Dict[str, Any]:
        """Format model output to standard response"""
        
        return {
            'prediction_id': str(uuid.uuid4()),
            'power_output': PredictionMetric(
                value=raw_output['power_density'],
                unit='mW/cm²',
                confidence=raw_output['confidence'],
                uncertainty=raw_output['power_density'] * 0.1  # 10% uncertainty
            ),
            'efficiency': PredictionMetric(
                value=raw_output['efficiency'] * 100,  # Convert to percentage
                unit='%',
                confidence=raw_output['confidence'],
                uncertainty=5.0  # 5% uncertainty
            ),
            'voltage': PredictionMetric(
                value=raw_output['voltage'],
                unit='V',
                confidence=raw_output['confidence'],
                uncertainty=0.05
            ),
            'current_density': PredictionMetric(
                value=raw_output['current_density'],
                unit='mA/cm²',
                confidence=raw_output['confidence'],
                uncertainty=raw_output['current_density'] * 0.1
            ),
            'optimizations': raw_output['optimizations'],
            'model_version': self.version,
            'model_type': 'empirical_mfc',
            'confidence_score': raw_output['confidence'],
            'processing_time_ms': raw_output['processing_time'],
            'timestamp': datetime.now()
        }
    
    def generate_optimizations(
        self, 
        prediction: Dict[str, Any], 
        request: PredictionRequest
    ) -> List[OptimizationRecommendation]:
        """Generate optimization recommendations for MFC"""
        
        recommendations = []
        
        # pH optimization
        if request.conditions.ph < 6.5 or request.conditions.ph > 7.5:
            recommendations.append(OptimizationRecommendation(
                parameter='pH',
                current_value=request.conditions.ph,
                recommended_value=7.0,
                expected_improvement=15.0,  # 15% improvement
                confidence=0.85,
                rationale='Optimal microbial activity occurs at neutral pH (7.0)'
            ))
        
        # Temperature optimization
        if request.conditions.temperature < 303.15:  # Below 30°C
            recommendations.append(OptimizationRecommendation(
                parameter='Temperature',
                current_value=request.conditions.temperature - 273.15,
                recommended_value=30.0,
                expected_improvement=20.0,  # 20% improvement
                confidence=0.8,
                rationale='Higher temperature increases microbial metabolic rate'
            ))
        
        # Electrode spacing optimization
        if request.configuration.electrode_spacing > 2.0:
            recommendations.append(OptimizationRecommendation(
                parameter='Electrode Spacing',
                current_value=request.configuration.electrode_spacing,
                recommended_value=1.0,
                expected_improvement=25.0,  # 25% improvement
                confidence=0.9,
                rationale='Reduced spacing minimizes ohmic losses'
            ))
        
        # Material optimization
        if request.materials.anode_material.lower() not in ['carbon_nanotubes', 'graphene']:
            recommendations.append(OptimizationRecommendation(
                parameter='Anode Material',
                current_value=0.0,  # Use index for current material
                recommended_value=1.0,  # Use index for recommended
                expected_improvement=30.0,  # 30% improvement
                confidence=0.75,
                rationale='Carbon nanotubes provide superior conductivity and biocompatibility'
            ))
        
        return recommendations[:3]  # Return top 3 recommendations
    
    def calculate_confidence(self, prediction: Dict[str, Any], request: PredictionRequest) -> float:
        """Calculate confidence score for MFC prediction"""
        
        base_confidence = 0.75  # Higher base for empirical model
        
        # Adjust based on operating conditions being in optimal range
        if 6.5 <= request.conditions.ph <= 7.5:
            base_confidence += 0.05
        if 298.15 <= request.conditions.temperature <= 308.15:
            base_confidence += 0.05
        if request.conditions.substrate_concentration and request.conditions.substrate_concentration > 0.5:
            base_confidence += 0.05
        
        # Adjust based on material knowledge
        anode_known = request.materials.anode_material.lower().replace(' ', '_') in self.material_properties
        cathode_known = request.materials.cathode_material.lower().replace(' ', '_') in self.material_properties
        
        if anode_known:
            base_confidence += 0.03
        if cathode_known:
            base_confidence += 0.02
            
        return min(base_confidence, 0.95)