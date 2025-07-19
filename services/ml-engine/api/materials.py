"""
Materials API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
import structlog

from data.materials_service import MaterialsService
from utils.config import settings

router = APIRouter()
logger = structlog.get_logger()

def get_materials_service() -> MaterialsService:
    """Get materials service instance"""
    if not settings.MATERIALS_PROJECT_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Materials Project API key not configured"
        )
    return MaterialsService(settings.MATERIALS_PROJECT_API_KEY)

@router.get("/properties/{material_name}")
async def get_material_properties(
    material_name: str,
    properties: Optional[str] = Query(None, description="Comma-separated list of properties"),
    materials_service: MaterialsService = Depends(get_materials_service)
) -> Dict[str, Any]:
    """Get properties for a specific material from Materials Project
    
    Args:
        material_name: Common name or chemical formula of the material
        properties: Optional comma-separated list of specific properties to retrieve
        
    Returns:
        Material properties including conductivity, stability, and other relevant data
    """
    try:
        # Parse properties list
        props_list = properties.split(",") if properties else None
        
        # Get material properties
        material_data = await materials_service.get_material_properties(
            material_name,
            props_list
        )
        
        if not material_data:
            raise HTTPException(
                status_code=404,
                detail=f"Material '{material_name}' not found"
            )
        
        return material_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching material properties: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch material properties: {str(e)}"
        )

@router.get("/recommendations")
async def get_material_recommendations(
    application: str = Query(..., description="Application type: anode, cathode, or membrane"),
    max_cost: Optional[str] = Query(None, description="Maximum cost constraint: low, medium, high"),
    min_conductivity: Optional[str] = Query(None, description="Minimum conductivity: low, moderate, high"),
    biocompatible: Optional[bool] = Query(None, description="Require biocompatibility"),
    materials_service: MaterialsService = Depends(get_materials_service)
) -> List[Dict[str, Any]]:
    """Get material recommendations for specific applications
    
    Args:
        application: Type of application (anode, cathode, membrane)
        max_cost: Optional cost constraint
        min_conductivity: Optional minimum conductivity requirement
        biocompatible: Optional biocompatibility requirement
        
    Returns:
        List of recommended materials with properties and scores
    """
    try:
        # Validate application type
        if application not in ["anode", "cathode", "membrane"]:
            raise HTTPException(
                status_code=400,
                detail="Application must be one of: anode, cathode, membrane"
            )
        
        # Build constraints
        constraints = {}
        if max_cost:
            constraints["max_cost"] = max_cost
        if min_conductivity:
            constraints["min_conductivity"] = min_conductivity
        if biocompatible is not None:
            constraints["biocompatible"] = biocompatible
        
        # Get recommendations
        recommendations = await materials_service.get_material_recommendations(
            application,
            constraints
        )
        
        return recommendations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting material recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recommendations: {str(e)}"
        )

@router.post("/compare")
async def compare_materials(
    materials: List[str],
    application: Optional[str] = None,
    materials_service: MaterialsService = Depends(get_materials_service)
) -> Dict[str, Any]:
    """Compare multiple materials for a given application
    
    Args:
        materials: List of material names to compare
        application: Optional application context for comparison
        
    Returns:
        Comparison matrix with properties and recommendations
    """
    try:
        if len(materials) < 2:
            raise HTTPException(
                status_code=400,
                detail="At least 2 materials required for comparison"
            )
        
        if len(materials) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 materials for comparison"
            )
        
        # Fetch properties for all materials
        comparison_data = {
            "materials": {},
            "comparison_matrix": {},
            "recommendations": []
        }
        
        for material in materials:
            props = await materials_service.get_material_properties(material)
            if props:
                comparison_data["materials"][material] = props
        
        if not comparison_data["materials"]:
            raise HTTPException(
                status_code=404,
                detail="No valid materials found"
            )
        
        # Build comparison matrix
        properties_to_compare = [
            "electrical_conductivity",
            "corrosion_resistance",
            "cost",
            "band_gap",
            "density",
            "formation_energy_per_atom"
        ]
        
        for prop in properties_to_compare:
            comparison_data["comparison_matrix"][prop] = {}
            for material, data in comparison_data["materials"].items():
                value = data.get("properties", {}).get(prop, "N/A")
                comparison_data["comparison_matrix"][prop][material] = value
        
        # Add application-specific recommendations
        if application:
            best_material = max(
                comparison_data["materials"].items(),
                key=lambda x: materials_service._score_material(x[1], application, None)
            )
            comparison_data["recommendations"].append({
                "message": f"For {application} applications, {best_material[0]} appears most suitable",
                "reasoning": materials_service._get_recommendation_reasoning(best_material[0], application)
            })
        
        return comparison_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing materials: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compare materials: {str(e)}"
        )

@router.get("/common")
async def list_common_materials() -> Dict[str, List[str]]:
    """List common materials used in electrochemical systems
    
    Returns:
        Dictionary of common materials by category
    """
    return {
        "anodes": [
            "carbon_cloth",
            "carbon_felt",
            "carbon_brush",
            "graphite",
            "stainless_steel",
            "titanium"
        ],
        "cathodes": [
            "platinum",
            "platinum_carbon",
            "mno2",
            "activated_carbon",
            "copper",
            "nickel",
            "silver"
        ],
        "membranes": [
            "nafion",
            "pem",
            "cation_exchange",
            "anion_exchange"
        ],
        "catalysts": [
            "platinum",
            "palladium",
            "ruthenium",
            "mno2",
            "cobalt_oxide",
            "iron_oxide"
        ]
    }