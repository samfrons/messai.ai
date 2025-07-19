"""
OPEM (Open Source PEM Fuel Cell Simulation Tool) wrapper
Integrates validated fuel cell models for MESSAI predictions
"""

from typing import Dict, Any, List, Optional
import numpy as np
from opem.Static import Amphlett, Larminie_Dicks, Chamberline_Kim
from opem.Dynamic import Padulles1, Padulles2, Padulles_Amphlett
import structlog
import asyncio

from models.base import BasePredictor
from api.schemas import (
    PredictionRequest, 
    SystemType,
    PredictionMetric,
    OptimizationRecommendation
)
try:
    from data.materials_service import MaterialsService
except ImportError:
    MaterialsService = None
    
from utils.config import settings

logger = structlog.get_logger()

class OPEMPredictor(BasePredictor):
    """Wrapper for OPEM fuel cell models"""
    
    # Available OPEM models
    STATIC_MODELS = {
        'amphlett': Amphlett,
        'larminie': Larminie_Dicks,
        'chamberline': Chamberline_Kim,
    }
    
    DYNAMIC_MODELS = {
        'padulles1': Padulles1,
        'padulles2': Padulles2,
        'padulles_amphlett': Padulles_Amphlett,
    }
    
    def __init__(self, model_type: str = 'amphlett', materials_service: Optional[MaterialsService] = None):
        super().__init__(
            model_id=f"opem_{model_type}",
            version="1.4.0"
        )
        self.model_type = model_type
        self.supported_systems = [SystemType.PEM, SystemType.SOFC, SystemType.PAFC]
        
        # Initialize materials service if API key is available
        if materials_service:
            self.materials_service = materials_service
        elif MaterialsService and hasattr(settings, 'MATERIALS_PROJECT_API_KEY') and settings.MATERIALS_PROJECT_API_KEY:
            self.materials_service = MaterialsService(settings.MATERIALS_PROJECT_API_KEY)
        else:
            self.materials_service = None
            if not MaterialsService:
                logger.info("Materials Project API not available (optional)")
            else:
                logger.info("Materials Project API key not configured (optional)")
        
        # Select appropriate model
        if model_type in self.STATIC_MODELS:
            self.model_class = self.STATIC_MODELS[model_type]
            self.is_dynamic = False
        elif model_type in self.DYNAMIC_MODELS:
            self.model_class = self.DYNAMIC_MODELS[model_type]
            self.is_dynamic = True
        else:
            raise ValueError(f"Unknown OPEM model type: {model_type}")
    
    def _map_messai_to_opem(self, request: PredictionRequest) -> Dict[str, Any]:
        """Map MESSAI request format to OPEM parameters"""
        
        # Common parameters for all OPEM models
        params = {
            'T': request.conditions.temperature,  # Temperature (K)
            'A': request.materials.anode_surface_area,  # Active area (cm²)
        }
        
        # Model-specific parameter mapping
        if self.model_type == 'amphlett':
            params.update({
                'PH2': request.conditions.pressure,  # H2 pressure (atm)
                'PO2': request.conditions.pressure * 0.21,  # O2 pressure (assuming air)
                'i-start': 0.1,  # Starting current density
                'i-stop': 75,    # Stopping current density
                'i-step': 0.1,   # Current density step
                'lambda': 23,    # Membrane water content
                'N': 1,          # Number of cells
                'R': 0,          # Resistance (will be calculated)
                'B': 0.016,      # Tafel slope
                'JMax': 1.5,     # Maximum current density
            })
            
            # Adjust for SOFC if needed
            if request.system_type == SystemType.SOFC:
                params['T'] = max(params['T'], 973.15)  # SOFC operates at higher temp
                
        elif self.model_type == 'larminie':
            params.update({
                'i-start': 0.1,
                'i-stop': 60,
                'i-step': 0.1,
                'A': request.materials.anode_surface_area,
                'E0': 1.229,  # Standard potential
                'RM': 0.0018,  # Membrane resistance
                'i_0': 0.00001,  # Exchange current density
                'i_n': 0.002,    # Internal current density
                'i_L': 100,      # Limiting current density
            })
            
        elif self.model_type == 'chamberline':
            params.update({
                'i-start': 0.1,
                'i-stop': 60,
                'i-step': 0.1,
                'E0': 1.229,
                'b': 0.016,   # Tafel slope
                'R': 0.0018,  # Resistance
                'i_0': 0.00001,
                'i_L': 100,
            })
            
        return params
    
    def preprocess(self, request: PredictionRequest) -> Dict[str, Any]:
        """Preprocess request for OPEM model"""
        return self._map_messai_to_opem(request)
    
    async def predict(self, request: PredictionRequest) -> Dict[str, Any]:
        """Generate prediction using OPEM model"""
        try:
            # Map parameters
            opem_params = self.preprocess(request)
            
            # Enhance with material properties if available
            if self.materials_service:
                material_adjustments = await self._get_material_adjustments(request)
                opem_params = self._apply_material_adjustments(opem_params, material_adjustments)
            
            # Run OPEM simulation
            logger.info(f"Running OPEM {self.model_type} simulation", params=opem_params)
            
            if self.is_dynamic:
                # Dynamic models return time-series data
                result = self.model_class.Dynamic_Analysis(
                    InputMethod=opem_params,
                    TestMode=True,  # Disable file output
                    PrintMode=False  # Disable console output
                )
            else:
                # Static models return steady-state data
                result = self.model_class.Static_Analysis(
                    InputMethod=opem_params,
                    TestMode=True,
                    PrintMode=False
                )
            
            # Process results
            prediction = self.postprocess(result, request)
            
            # Add material insights if available
            if self.materials_service and 'material_adjustments' in locals():
                prediction['material_insights'] = material_adjustments.get('insights', {})
            
            return prediction
            
        except Exception as e:
            logger.error(f"OPEM prediction failed", error=str(e))
            raise
    
    async def _get_material_adjustments(self, request: PredictionRequest) -> Dict[str, Any]:
        """Get material property adjustments for prediction"""
        adjustments = {
            'conductivity_factor': 1.0,
            'catalyst_activity': 1.0,
            'stability_factor': 1.0,
            'insights': {}
        }
        
        try:
            # Get anode material properties
            anode_props = await self.materials_service.get_material_properties(
                request.materials.anode_material
            )
            
            # Get cathode material properties
            cathode_props = await self.materials_service.get_material_properties(
                request.materials.cathode_material
            )
            
            # Analyze conductivity
            if anode_props:
                anode_cond = anode_props.get('properties', {}).get('electrical_conductivity', 'unknown')
                if anode_cond == 'high':
                    adjustments['conductivity_factor'] *= 1.1
                elif anode_cond == 'very_high':
                    adjustments['conductivity_factor'] *= 1.2
                elif anode_cond == 'low':
                    adjustments['conductivity_factor'] *= 0.8
                
                adjustments['insights']['anode'] = {
                    'material': request.materials.anode_material,
                    'conductivity': anode_cond,
                    'properties': anode_props.get('properties', {})
                }
            
            if cathode_props:
                cathode_cond = cathode_props.get('properties', {}).get('electrical_conductivity', 'unknown')
                catalyst = cathode_props.get('properties', {}).get('catalytic_activity', 'unknown')
                
                if cathode_cond in ['high', 'very_high']:
                    adjustments['conductivity_factor'] *= 1.1
                
                if catalyst == 'excellent':
                    adjustments['catalyst_activity'] = 1.3
                elif catalyst == 'good':
                    adjustments['catalyst_activity'] = 1.1
                
                adjustments['insights']['cathode'] = {
                    'material': request.materials.cathode_material,
                    'conductivity': cathode_cond,
                    'catalytic_activity': catalyst,
                    'properties': cathode_props.get('properties', {})
                }
            
            # Material compatibility check
            if anode_props and cathode_props:
                adjustments['insights']['compatibility'] = self._check_material_compatibility(
                    anode_props, cathode_props, request
                )
            
        except Exception as e:
            logger.warning(f"Could not fetch material properties: {e}")
        
        return adjustments
    
    def _apply_material_adjustments(self, opem_params: Dict[str, Any], adjustments: Dict[str, Any]) -> Dict[str, Any]:
        """Apply material property adjustments to OPEM parameters"""
        
        # Adjust exchange current density based on catalyst activity
        if 'i_0' in opem_params and adjustments['catalyst_activity'] != 1.0:
            opem_params['i_0'] *= adjustments['catalyst_activity']
        
        # Adjust resistance based on conductivity
        if 'R' in opem_params and adjustments['conductivity_factor'] != 1.0:
            opem_params['R'] /= adjustments['conductivity_factor']
        
        # Adjust limiting current based on material properties
        if 'i_L' in opem_params and adjustments['conductivity_factor'] > 1.0:
            opem_params['i_L'] *= (adjustments['conductivity_factor'] ** 0.5)
        
        return opem_params
    
    def _check_material_compatibility(
        self, 
        anode_props: Dict[str, Any], 
        cathode_props: Dict[str, Any],
        request: PredictionRequest
    ) -> Dict[str, Any]:
        """Check compatibility between electrode materials"""
        
        compatibility = {
            'score': 0.8,  # Default good compatibility
            'issues': [],
            'recommendations': []
        }
        
        # Check for galvanic corrosion risk
        anode_form_e = anode_props.get('properties', {}).get('formation_energy_per_atom', 0)
        cathode_form_e = cathode_props.get('properties', {}).get('formation_energy_per_atom', 0)
        
        if abs(anode_form_e - cathode_form_e) > 2:
            compatibility['score'] -= 0.2
            compatibility['issues'].append("High galvanic corrosion risk")
            compatibility['recommendations'].append("Consider using materials with similar nobility")
        
        # Check conductivity matching
        anode_cond = anode_props.get('properties', {}).get('electrical_conductivity', 'unknown')
        cathode_cond = cathode_props.get('properties', {}).get('electrical_conductivity', 'unknown')
        
        if anode_cond == 'low' and cathode_cond in ['high', 'very_high']:
            compatibility['score'] -= 0.1
            compatibility['issues'].append("Conductivity mismatch may limit performance")
            compatibility['recommendations'].append("Upgrade anode material conductivity")
        
        return compatibility
    
    def postprocess(self, raw_output: Dict[str, Any], request: PredictionRequest) -> Dict[str, Any]:
        """Convert OPEM output to MESSAI format"""
        
        # Extract key metrics from OPEM output
        if 'P' in raw_output:
            # Power array from OPEM
            power_array = np.array(raw_output['P'])
            max_power = np.max(power_array)
            avg_power = np.mean(power_array)
            
            # Power density (mW/cm²)
            power_density = (max_power * 1000) / request.materials.anode_surface_area
        else:
            power_density = 0.0
            
        if 'V' in raw_output:
            # Voltage array
            voltage_array = np.array(raw_output['V'])
            operating_voltage = np.mean(voltage_array[voltage_array > 0.4])  # Operating region
        else:
            operating_voltage = 0.7
            
        if 'EFF' in raw_output:
            # Efficiency array
            eff_array = np.array(raw_output['EFF'])
            max_efficiency = np.max(eff_array) * 100  # Convert to percentage
        else:
            # Calculate theoretical efficiency
            max_efficiency = (operating_voltage / 1.229) * 100
        
        # Calculate confidence based on model and data quality
        confidence = self.calculate_confidence({'power': power_density}, request)
        
        # Generate optimization recommendations
        optimizations = self.generate_optimizations(
            {'power_density': power_density, 'efficiency': max_efficiency},
            request
        )
        
        return {
            'power_output': PredictionMetric(
                value=power_density,
                unit='mW/cm²',
                confidence=confidence
            ),
            'efficiency': PredictionMetric(
                value=max_efficiency,
                unit='%',
                confidence=confidence
            ),
            'voltage': PredictionMetric(
                value=operating_voltage,
                unit='V',
                confidence=confidence
            ),
            'current_density': PredictionMetric(
                value=power_density / (operating_voltage * 1000),  # mA/cm²
                unit='mA/cm²',
                confidence=confidence
            ),
            'optimizations': optimizations,
            'model_type': f'OPEM_{self.model_type}',
            'raw_data': raw_output if len(str(raw_output)) < 1000 else None  # Include raw data if small
        }
    
    def generate_optimizations(
        self, 
        prediction: Dict[str, Any], 
        request: PredictionRequest
    ) -> List[OptimizationRecommendation]:
        """Generate optimization recommendations based on OPEM results"""
        
        recommendations = []
        
        # Temperature optimization
        if request.system_type == SystemType.PEM:
            optimal_temp = 353.15  # 80°C for PEM
            if abs(request.conditions.temperature - optimal_temp) > 10:
                recommendations.append(OptimizationRecommendation(
                    parameter="temperature",
                    current_value=request.conditions.temperature,
                    recommended_value=optimal_temp,
                    expected_improvement=15.0,
                    confidence=0.85,
                    rationale="PEM fuel cells typically operate optimally at 80°C"
                ))
        
        # Pressure optimization
        if request.conditions.pressure < 2.0:
            recommendations.append(OptimizationRecommendation(
                parameter="pressure",
                current_value=request.conditions.pressure,
                recommended_value=3.0,
                expected_improvement=20.0,
                confidence=0.80,
                rationale="Higher pressure improves reactant concentration and performance"
            ))
        
        # Surface area optimization
        if request.materials.anode_surface_area < 100:
            recommendations.append(OptimizationRecommendation(
                parameter="electrode_area",
                current_value=request.materials.anode_surface_area,
                recommended_value=request.materials.anode_surface_area * 2,
                expected_improvement=80.0,
                confidence=0.90,
                rationale="Larger electrode area provides more reaction sites"
            ))
        
        return recommendations