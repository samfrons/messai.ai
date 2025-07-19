"""
Materials Project API Service
Fetches and caches material properties for electrochemical predictions
"""

from typing import Dict, Any, Optional, List
from mp_api.client import MPRester
from pymatgen.core import Composition
import structlog
import json
import redis
import hashlib
from datetime import timedelta

logger = structlog.get_logger()

class MaterialsService:
    """Service for fetching and caching material properties from Materials Project"""
    
    # Common electrode materials in MES/Fuel cells
    COMMON_MATERIALS = {
        # Anode materials
        "carbon_cloth": "C",
        "carbon_felt": "C",
        "carbon_brush": "C",
        "graphite": "C",
        "stainless_steel": "Fe0.7Cr0.2Ni0.1",
        "carbon_nanotubes": "C",
        "graphene": "C",
        "titanium": "Ti",
        
        # Cathode materials
        "platinum": "Pt",
        "platinum_carbon": "Pt",
        "mno2": "MnO2",
        "activated_carbon": "C",
        "copper": "Cu",
        "nickel": "Ni",
        "silver": "Ag",
        
        # Membrane materials
        "nafion": None,  # Polymer, not in MP
        "pem": None,     # Generic polymer
        "cation_exchange": None,
        "anion_exchange": None,
    }
    
    # Material property mappings for predictions
    RELEVANT_PROPERTIES = [
        "band_gap",           # Electronic properties
        "density",            # Physical properties
        "e_above_hull",       # Stability
        "formation_energy_per_atom",
        "bulk_modulus",       # Mechanical properties
        "shear_modulus",
        "elastic_modulus",
        "poisson_ratio",
        "total_magnetization", # Magnetic properties
        "is_metal",           # Conductivity indicator
        "is_gap_direct",
        "theoretical_capacity", # For battery applications
    ]
    
    def __init__(self, api_key: str, redis_client: Optional[redis.Redis] = None):
        """Initialize Materials Service
        
        Args:
            api_key: Materials Project API key
            redis_client: Optional Redis client for caching
        """
        self.api_key = api_key
        self.mprester = MPRester(api_key)
        self.redis_client = redis_client
        self.cache_ttl = timedelta(days=30)  # Cache for 30 days
        
    def _get_cache_key(self, material: str, properties: List[str]) -> str:
        """Generate cache key for material properties"""
        prop_str = "_".join(sorted(properties))
        return f"mp:material:{material}:{prop_str}"
    
    async def get_material_properties(
        self, 
        material_name: str,
        properties: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        """Get material properties from Materials Project
        
        Args:
            material_name: Common name or formula of material
            properties: List of properties to fetch (default: RELEVANT_PROPERTIES)
            
        Returns:
            Dictionary of material properties or None if not found
        """
        try:
            # Use default properties if none specified
            if properties is None:
                properties = self.RELEVANT_PROPERTIES
            
            # Check cache first
            if self.redis_client:
                cache_key = self._get_cache_key(material_name, properties)
                cached = self.redis_client.get(cache_key)
                if cached:
                    logger.info(f"Cache hit for material: {material_name}")
                    return json.loads(cached)
            
            # Map common names to formulas
            formula = self.COMMON_MATERIALS.get(
                material_name.lower().replace(" ", "_"), 
                material_name
            )
            
            # Skip polymers and non-crystalline materials
            if formula is None:
                logger.warning(f"Material {material_name} is not in Materials Project")
                return self._get_default_properties(material_name)
            
            # Query Materials Project
            logger.info(f"Fetching properties for {formula} from Materials Project")
            
            with self.mprester as mpr:
                # Search for materials matching the formula
                results = mpr.summary.search(
                    formula=formula,
                    fields=["material_id", "formula_pretty"] + properties
                )
                
                if not results:
                    logger.warning(f"No results found for {formula}")
                    return self._get_default_properties(material_name)
                
                # Get the most stable material (lowest energy above hull)
                best_material = min(results, key=lambda x: x.e_above_hull or float('inf'))
                
                # Convert to dictionary
                material_data = {
                    "material_id": best_material.material_id,
                    "formula": best_material.formula_pretty,
                    "properties": {}
                }
                
                for prop in properties:
                    value = getattr(best_material, prop, None)
                    if value is not None:
                        material_data["properties"][prop] = value
                
                # Add derived properties
                material_data["properties"]["electrical_conductivity"] = self._estimate_conductivity(best_material)
                material_data["properties"]["corrosion_resistance"] = self._estimate_corrosion_resistance(best_material)
                
                # Cache the result
                if self.redis_client:
                    self.redis_client.setex(
                        cache_key,
                        self.cache_ttl,
                        json.dumps(material_data)
                    )
                
                return material_data
                
        except Exception as e:
            logger.error(f"Error fetching material properties: {e}")
            return self._get_default_properties(material_name)
    
    def _estimate_conductivity(self, material) -> str:
        """Estimate electrical conductivity based on material properties"""
        if hasattr(material, 'is_metal') and material.is_metal:
            return "high"
        elif hasattr(material, 'band_gap'):
            if material.band_gap == 0:
                return "high"
            elif material.band_gap < 1.5:
                return "moderate"
            else:
                return "low"
        return "unknown"
    
    def _estimate_corrosion_resistance(self, material) -> str:
        """Estimate corrosion resistance based on formation energy"""
        if hasattr(material, 'formation_energy_per_atom'):
            if material.formation_energy_per_atom < -2:
                return "high"
            elif material.formation_energy_per_atom < -1:
                return "moderate"
            else:
                return "low"
        return "unknown"
    
    def _get_default_properties(self, material_name: str) -> Dict[str, Any]:
        """Get default properties for materials not in MP"""
        
        defaults = {
            "carbon_cloth": {
                "electrical_conductivity": "high",
                "corrosion_resistance": "high",
                "surface_area": "high",
                "biocompatibility": "excellent",
                "cost": "low"
            },
            "carbon_felt": {
                "electrical_conductivity": "moderate",
                "corrosion_resistance": "high",
                "surface_area": "very_high",
                "biocompatibility": "excellent",
                "cost": "low"
            },
            "platinum": {
                "electrical_conductivity": "very_high",
                "corrosion_resistance": "excellent",
                "catalytic_activity": "excellent",
                "cost": "very_high"
            },
            "nafion": {
                "proton_conductivity": "high",
                "water_uptake": "moderate",
                "chemical_stability": "excellent",
                "temperature_range": "0-80°C",
                "cost": "high"
            }
        }
        
        material_key = material_name.lower().replace(" ", "_")
        
        return {
            "material_id": f"custom_{material_key}",
            "formula": material_name,
            "properties": defaults.get(material_key, {
                "electrical_conductivity": "unknown",
                "corrosion_resistance": "unknown",
                "cost": "unknown"
            })
        }
    
    async def get_material_recommendations(
        self,
        application: str,
        constraints: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Get material recommendations for specific applications
        
        Args:
            application: Type of application (anode, cathode, membrane)
            constraints: Optional constraints (cost, conductivity, etc.)
            
        Returns:
            List of recommended materials with properties
        """
        recommendations = []
        
        if application == "anode":
            candidates = ["carbon_cloth", "carbon_felt", "graphite", "stainless_steel"]
        elif application == "cathode":
            candidates = ["platinum", "mno2", "activated_carbon", "carbon_cloth"]
        elif application == "membrane":
            candidates = ["nafion", "pem", "cation_exchange"]
        else:
            candidates = []
        
        for material in candidates:
            props = await self.get_material_properties(material)
            if props:
                # Score based on application
                score = self._score_material(props, application, constraints)
                recommendations.append({
                    "material": material,
                    "properties": props,
                    "score": score,
                    "reasoning": self._get_recommendation_reasoning(material, application)
                })
        
        # Sort by score
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _score_material(
        self, 
        properties: Dict[str, Any], 
        application: str,
        constraints: Optional[Dict[str, Any]] = None
    ) -> float:
        """Score material based on application requirements"""
        score = 0.5  # Base score
        
        props = properties.get("properties", {})
        
        # Application-specific scoring
        if application == "anode":
            if props.get("electrical_conductivity") == "high":
                score += 0.2
            if props.get("biocompatibility") == "excellent":
                score += 0.2
            if props.get("surface_area") in ["high", "very_high"]:
                score += 0.1
                
        elif application == "cathode":
            if props.get("electrical_conductivity") in ["high", "very_high"]:
                score += 0.2
            if props.get("catalytic_activity") == "excellent":
                score += 0.3
                
        # Apply constraints
        if constraints:
            if constraints.get("max_cost") == "low" and props.get("cost") == "low":
                score += 0.1
            if constraints.get("min_conductivity") and props.get("electrical_conductivity") == "high":
                score += 0.1
        
        return min(score, 1.0)
    
    def _get_recommendation_reasoning(self, material: str, application: str) -> str:
        """Get reasoning for material recommendation"""
        
        reasonings = {
            ("carbon_cloth", "anode"): "Excellent biocompatibility, high surface area, and low cost make it ideal for microbial colonization",
            ("carbon_felt", "anode"): "Very high surface area provides maximum biofilm attachment sites",
            ("platinum", "cathode"): "Superior catalytic activity for oxygen reduction reaction, though expensive",
            ("mno2", "cathode"): "Cost-effective catalyst with good performance in neutral pH conditions",
            ("nafion", "membrane"): "Industry standard proton exchange membrane with excellent stability"
        }
        
        return reasonings.get((material, application), f"Suitable material for {application} applications")