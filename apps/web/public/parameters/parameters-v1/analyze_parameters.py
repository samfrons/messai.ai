#!/usr/bin/env python3
"""
Script to analyze MESS_PARAMETERS_UNIFIED_FINAL.json and identify undocumented parameters
"""

import json
import os
from typing import Dict, List, Set, Tuple

def get_documented_parameters() -> Set[str]:
    """Extract all documented parameter IDs from the parameter-detail-service.ts file"""
    documented = set()
    
    # These are the parameter IDs from MARKDOWN_MAPPINGS in parameter-detail-service.ts
    documented_params = [
        # Anode materials
        'carbon_cloth', 'ti3c2tx_mxene', 'nb2ctx_mxene', 'v2ctx_mxene',
        # Cathode materials
        'air_cathode', 'platinum_cathode',
        # Membranes
        'proton_exchange_membrane',
        # Electrical parameters
        'power_density', 'current_density', 'voltage_output', 'coulombic_efficiency', 
        'internal_resistance', 'faradaic_efficiency', 'exchange_current_density', 
        'overpotential', 'tafel_slope', 'limiting_current', 'double_layer_capacitance',
        'charge_transfer_resistance', 'power_efficiency', 'redox_potential',
        'electrode_potential', 'cell_potential', 'current_efficiency', 'resistance',
        'voltage_stability', 'energy_density', 'diffusion_resistance', 'capacitance',
        'cell_voltage', 'maximum_power_density',
        # Biological parameters
        'biofilm_thickness', 'microbial_diversity', 'substrate_utilization',
        'biofilm_conductivity', 'biofilm_coverage', 'biofilm_density', 'biofilm_porosity',
        'biofilm_roughness', 'biofilm_adhesion_strength', 'metabolic_activity',
        'substrate_utilization_rate', 'mediator_concentration', 'doubling_time',
        'atp_concentration', 'enzyme_activity', 'metabolic_rate', 'respiration_rate',
        'half_saturation_constant', 'decay_rate', 'maximum_growth_rate', 'yield_coefficient',
        'inhibition_constant', 'maintenance_coefficient', 'substrate_affinity',
        'substrate_uptake_rate', 'dominant_species_fraction', 'extracellular_polymeric_substances',
        'cell_viability', 'biofilm_age', 'biofilm_resistance', 'bod_concentration',
        'bacterial_concentration', 'initial_substrate_conc', 'substrate_loading_rate',
        'inoculum_concentration', 'cod_concentration', 'substrate_concentration',
        'biofilm_permeability', 'microbial_activity', 'electron_transfer_rate', 'growth_rate',
        # Materials parameters
        'conductivity_printed', 'material_viscosity', 'layer_resolution', 'shrinkage_rate',
        'printing_speed', 'nozzle_temperature', 'bed_temperature', 'surface_roughness',
        'porosity', 'catalyst_loading', 'membrane_thickness', 'specific_surface_area',
        'electrode_thickness', 'membrane_permeability', 'porosity_electrode',
        # Chemical parameters
        'chemical_stability', 'ionic_strength', 'buffer_concentration', 'c_n_ratio',
        'surface_tension', 'corrosivity', 'dissolved_oxygen', 'conductivity', 'ph_level',
        'ionic_conductivity', 'oxidation_reduction_potential', 'salt_concentration',
        'viscosity', 'total_dissolved_solids',
        # Physical parameters
        'electrode_spacing_cell', 'cell_volume', 'electrode_surface_area', 'contact_resistance',
        'reactor_geometry', 'mass_transfer_coefficient', 'hydraulic_permeability',
        'cell_diameter', 'cell_height',
        # Operational parameters
        'calibration_frequency', 'detection_limit', 'hydraulic_retention_time', 'flow_rate',
        'operating_temperature', 'ohmic_resistance',
        # Performance parameters
        'conversion_efficiency', 'h2_production_rate', 'biogas_yield', 'ch4_content_biogas',
        'ch4_production_rate', 'energy_efficiency', 'h2_purity',
        # Environmental parameters
        'ambient_temperature', 'atmospheric_pressure', 'relative_humidity', 'co2_concentration',
        'air_flow_rate', 'ambient_oxygen_concentration',
        # Safety parameters
        'compliance_audits', 'emission_standard_co2',
        # Monitoring parameters
        'sampling_rate', 'model_accuracy', 'alarm_threshold_temperature',
        # Economic parameters
        'carbon_footprint', 'payback_period',
        # Additional
        'microbial_growth_rate'
    ]
    
    # Also need to account for some variations in naming
    variations = {
        'initial_substrate_conc': 'initial_substrate_concentration',
        'ch4_content_biogas': 'methane_content',
        'ch4_production_rate': 'methane_production_rate',
    }
    
    for param in documented_params:
        documented.add(param)
        # Add variations if they exist
        if param in variations:
            documented.add(variations[param])
    
    return documented

def is_categorical_variable(param: Dict) -> bool:
    """Check if a parameter is a categorical variable (should be filtered out)"""
    param_name = param.get('name', '').lower()
    param_id = param.get('id', '').lower()
    
    # Check if it's a select type (categorical)
    if param.get('type') == 'select':
        return True
    
    # Check if it's a string type without unit (likely categorical)
    if param.get('type') == 'string' and not param.get('unit'):
        return True
    
    # If parameter has a unit, it's likely measurable regardless of name patterns
    if param.get('unit'):
        return False
    
    # Specific biological categorical variables to exclude
    biological_categorical_ids = [
        'microbial_species',
        'dominant_species',
        'species_selection',
        'organism_type',
        'bacterial_strain',
        'microbe_selection',
    ]
    
    if param_id in biological_categorical_ids:
        return True
    
    # Categorical patterns
    categorical_patterns = [
        'material_type',
        'membrane_type',
        'electrode_type',
        'system_type',
        'configuration_type',
        'method_type',
        'technique_type',
        'source_type',
        'brand_name',
        'model_name',
        'vendor_name',
        'supplier_name',
        'manufacturer_name',
        'selection',
        'choice',
        'option',
    ]
    
    # Check for categorical patterns in name or ID
    return any(
        pattern in param_name or pattern in param_id
        for pattern in categorical_patterns
    )

def load_unified_parameters() -> Dict:
    """Load the unified parameters JSON file"""
    file_path = '/Users/samfrons/Desktop/messai-ai/apps/web/public/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json'
    with open(file_path, 'r') as f:
        return json.load(f)

def get_category_name(category_id: str) -> str:
    """Map category ID to a readable category name"""
    mapping = {
        'environmental-parameters': 'environmental',
        'material-parameters': 'materials',
        'biological-parameters': 'biological',
        'substrate-parameters': 'chemical',
        'membrane-parameters': 'materials',
        'cell-level-parameters': 'electrical',
        'reactor-level-parameters': 'physical',
        'cost-parameters': 'economic',
        'performance-parameters': 'performance',
        'analytical-parameters': 'monitoring',
        'quality-control-parameters': 'operational',
        'safety-parameters': 'safety',
        'standardization-parameters': 'operational',
    }
    return mapping.get(category_id, 'other')

def analyze_parameters():
    """Main analysis function"""
    # Load data
    data = load_unified_parameters()
    documented = get_documented_parameters()
    
    # Extract all parameters
    all_params = []
    category_counts = {}
    
    for category in data.get('categories', []):
        category_id = category.get('id', '')
        category_name = get_category_name(category_id)
        
        for subcategory in category.get('subcategories', []):
            for param in subcategory.get('parameters', []):
                # Skip categorical variables
                if is_categorical_variable(param):
                    continue
                
                param_info = {
                    'id': param.get('id', ''),
                    'name': param.get('name', ''),
                    'category': category_name,
                    'subcategory': subcategory.get('name', ''),
                    'unit': param.get('unit', ''),
                    'description': param.get('description', ''),
                    'is_documented': param.get('id', '') in documented
                }
                all_params.append(param_info)
                
                # Count by category
                if category_name not in category_counts:
                    category_counts[category_name] = {'total': 0, 'documented': 0}
                category_counts[category_name]['total'] += 1
                if param_info['is_documented']:
                    category_counts[category_name]['documented'] += 1
    
    # Filter out undocumented parameters
    undocumented = [p for p in all_params if not p['is_documented']]
    
    # Print summary
    print(f"Total measurable parameters: {len(all_params)}")
    print(f"Documented parameters: {len(all_params) - len(undocumented)}")
    print(f"Undocumented parameters: {len(undocumented)}")
    print("\nCategory breakdown:")
    for cat, counts in sorted(category_counts.items()):
        print(f"  {cat}: {counts['documented']}/{counts['total']} documented")
    
    # Group undocumented by category
    undoc_by_category = {}
    for param in undocumented:
        cat = param['category']
        if cat not in undoc_by_category:
            undoc_by_category[cat] = []
        undoc_by_category[cat].append(param)
    
    # Select 14 parameters for batch 8
    # Target distribution: biological(3), electrical(2), materials(2), chemical(2), 
    # physical(2), operational(1), environmental(1), performance(1)
    
    batch_8 = []
    targets = {
        'biological': 3,
        'electrical': 2,
        'materials': 2,
        'chemical': 2,
        'physical': 2,
        'operational': 1,
        'environmental': 1,
        'performance': 1
    }
    
    # Prioritize commonly used parameters
    priority_keywords = ['temperature', 'pressure', 'velocity', 'area', 'volume', 
                        'efficiency', 'rate', 'time', 'concentration', 'ratio']
    
    for category, target_count in targets.items():
        if category in undoc_by_category:
            candidates = undoc_by_category[category]
            
            # Sort by priority (parameters with priority keywords first)
            candidates.sort(key=lambda p: any(kw in p['name'].lower() for kw in priority_keywords), reverse=True)
            
            # Select up to target_count parameters
            selected = candidates[:target_count]
            batch_8.extend(selected)
    
    # Print batch 8 selection
    print(f"\n{'='*60}")
    print("BATCH 8 PARAMETERS (14 total):")
    print(f"{'='*60}")
    
    # Group by category for display
    batch_by_cat = {}
    for param in batch_8:
        cat = param['category']
        if cat not in batch_by_cat:
            batch_by_cat[cat] = []
        batch_by_cat[cat].append(param)
    
    for category in sorted(batch_by_cat.keys()):
        print(f"\n{category.upper()} ({len(batch_by_cat[category])} parameters):")
        for param in batch_by_cat[category]:
            print(f"  - {param['id']}: {param['name']} ({param['unit'] if param['unit'] else 'no unit'})")
            if param['description']:
                print(f"    Description: {param['description'][:80]}...")

if __name__ == "__main__":
    analyze_parameters()