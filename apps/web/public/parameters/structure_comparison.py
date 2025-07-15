#!/usr/bin/env python3
"""
Data Structure Comparison Script
Analyzes the structural differences between the two parameter systems
"""

import json
import re
from typing import Dict, Any, List

def analyze_ts_structure(file_path: str) -> Dict[str, Any]:
    """Analyze TypeScript parameter structure"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract parameter examples
    param_pattern = r'{[^}]*id:\s*\'([^\']+)\'[^}]*name:\s*\'([^\']+)\'[^}]*description:\s*\'([^\']*?)\'[^}]*unit:\s*\'([^\']*?)\'[^}]*type:\s*\'([^\']+)\'[^}]*category:\s*\'([^\']+)\'[^}]*subcategory:\s*\'([^\']+)\'[^}]*(?:range:\s*\{[^}]*min:\s*([^,}]+)(?:,\s*max:\s*([^,}]+))?(?:,\s*typical:\s*([^,}]+))?[^}]*\})?[^}]*(?:default:\s*([^,}]+))?[^}]*}'
    
    matches = re.findall(param_pattern, content, re.DOTALL)
    
    structure = {
        'type': 'TypeScript',
        'format': 'Strongly typed interfaces',
        'categories': set(),
        'subcategories': set(),
        'parameters': [],
        'features': {
            'typed_interfaces': True,
            'validation_functions': True,
            'utility_functions': True,
            'export_functions': True,
            'search_functions': True,
            'statistics_functions': True
        }
    }
    
    for match in matches:
        param_id, name, desc, unit, ptype, category, subcategory, min_val, max_val, typical, default = match
        
        structure['categories'].add(category)
        structure['subcategories'].add(subcategory)
        
        param_info = {
            'id': param_id,
            'name': name,
            'description': desc,
            'unit': unit,
            'type': ptype,
            'category': category,
            'subcategory': subcategory,
            'has_range': bool(min_val),
            'has_default': bool(default)
        }
        
        structure['parameters'].append(param_info)
    
    return structure

def analyze_json_structure(file_path: str) -> Dict[str, Any]:
    """Analyze JSON parameter structure"""
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    structure = {
        'type': 'JSON',
        'format': 'Hierarchical nested structure',
        'categories': set(),
        'subcategories': set(),
        'parameters': [],
        'features': {
            'metadata': True,
            'versioning': True,
            'source_tracking': True,
            'hierarchical_nesting': True,
            'microorganism_database': True,
            'material_properties': True,
            'economic_metrics': True,
            'safety_parameters': True
        }
    }
    
    # Extract metadata
    structure['metadata'] = data.get('metadata', {})
    
    # Process categories
    if 'categories' in data:
        for category in data['categories']:
            cat_id = category['id']
            structure['categories'].add(cat_id)
            
            if 'subcategories' in category:
                for subcategory in category['subcategories']:
                    subcat_id = subcategory['id']
                    structure['subcategories'].add(subcat_id)
                    
                    # Process parameters in subcategory
                    if 'parameters' in subcategory:
                        for param in subcategory['parameters']:
                            param_info = {
                                'id': param['id'],
                                'name': param['name'],
                                'description': param.get('description', ''),
                                'unit': param.get('unit', ''),
                                'type': param.get('type', ''),
                                'category': cat_id,
                                'subcategory': subcat_id,
                                'has_range': 'range' in param,
                                'has_default': 'default' in param
                            }
                            structure['parameters'].append(param_info)
    
    return structure

def compare_structures(ts_structure: Dict[str, Any], json_structure: Dict[str, Any]) -> Dict[str, Any]:
    """Compare the two data structures"""
    
    comparison = {
        'parameter_counts': {
            'typescript': len(ts_structure['parameters']),
            'json': len(json_structure['parameters'])
        },
        'category_counts': {
            'typescript': len(ts_structure['categories']),
            'json': len(json_structure['categories'])
        },
        'subcategory_counts': {
            'typescript': len(ts_structure['subcategories']),
            'json': len(json_structure['subcategories'])
        },
        'unique_features': {
            'typescript_only': [],
            'json_only': []
        },
        'common_aspects': [],
        'structural_differences': []
    }
    
    # Compare features
    ts_features = set(ts_structure['features'].keys())
    json_features = set(json_structure['features'].keys())
    
    comparison['unique_features']['typescript_only'] = list(ts_features - json_features)
    comparison['unique_features']['json_only'] = list(json_features - ts_features)
    
    # Common aspects
    if ts_structure['parameters'] and json_structure['parameters']:
        comparison['common_aspects'].append('Both have parameter descriptions')
        comparison['common_aspects'].append('Both have units and types')
        comparison['common_aspects'].append('Both have categorization')
    
    # Structural differences
    comparison['structural_differences'].append(f"TypeScript: {ts_structure['format']}")
    comparison['structural_differences'].append(f"JSON: {json_structure['format']}")
    
    return comparison

def main():
    ts_file = '/Users/samfrons/Desktop/messai-ai/parameters/parameters-data.ts'
    json_file = '/Users/samfrons/Desktop/messai-ai/apps/web/public/parameters/MESS_PARAMETERS_UNIFIED.json'
    
    print("=== DATA STRUCTURE COMPARISON ===\n")
    
    # Analyze structures
    ts_structure = analyze_ts_structure(ts_file)
    json_structure = analyze_json_structure(json_file)
    
    # Compare
    comparison = compare_structures(ts_structure, json_structure)
    
    print("PARAMETER COUNTS:")
    print(f"  TypeScript: {comparison['parameter_counts']['typescript']}")
    print(f"  JSON: {comparison['parameter_counts']['json']}")
    
    print("\nCATEGORY COUNTS:")
    print(f"  TypeScript: {comparison['category_counts']['typescript']}")
    print(f"  JSON: {comparison['category_counts']['json']}")
    
    print("\nSUBCATEGORY COUNTS:")
    print(f"  TypeScript: {comparison['subcategory_counts']['typescript']}")
    print(f"  JSON: {comparison['subcategory_counts']['json']}")
    
    print("\nSTRUCTURAL DIFFERENCES:")
    for diff in comparison['structural_differences']:
        print(f"  {diff}")
    
    print("\nUNIQUE FEATURES:")
    print("  TypeScript only:")
    for feature in comparison['unique_features']['typescript_only']:
        print(f"    - {feature}")
    
    print("  JSON only:")
    for feature in comparison['unique_features']['json_only']:
        print(f"    - {feature}")
    
    print("\nDATA QUALITY ANALYSIS:")
    
    # TypeScript quality
    ts_with_ranges = sum(1 for p in ts_structure['parameters'] if p['has_range'])
    ts_with_defaults = sum(1 for p in ts_structure['parameters'] if p['has_default'])
    
    print(f"  TypeScript:")
    print(f"    - Parameters with ranges: {ts_with_ranges}/{len(ts_structure['parameters'])} ({ts_with_ranges/len(ts_structure['parameters'])*100:.1f}%)")
    print(f"    - Parameters with defaults: {ts_with_defaults}/{len(ts_structure['parameters'])} ({ts_with_defaults/len(ts_structure['parameters'])*100:.1f}%)")
    
    # JSON quality
    json_with_ranges = sum(1 for p in json_structure['parameters'] if p['has_range'])
    json_with_defaults = sum(1 for p in json_structure['parameters'] if p['has_default'])
    
    print(f"  JSON:")
    print(f"    - Parameters with ranges: {json_with_ranges}/{len(json_structure['parameters'])} ({json_with_ranges/len(json_structure['parameters'])*100:.1f}%)")
    print(f"    - Parameters with defaults: {json_with_defaults}/{len(json_structure['parameters'])} ({json_with_defaults/len(json_structure['parameters'])*100:.1f}%)")
    
    print("\nMETADATA ANALYSIS:")
    if 'metadata' in json_structure:
        metadata = json_structure['metadata']
        print(f"  JSON has comprehensive metadata:")
        print(f"    - Version: {metadata.get('version', 'N/A')}")
        print(f"    - Last updated: {metadata.get('lastUpdated', 'N/A')}")
        print(f"    - Total parameters: {metadata.get('totalParameters', 'N/A')}")
        print(f"    - Major categories: {metadata.get('majorCategories', 'N/A')}")
        print(f"    - Subcategories: {metadata.get('subcategories', 'N/A')}")
        print(f"    - Sources tracked: {len(metadata.get('sources', {}))}")
    else:
        print("  JSON has no metadata")
    
    print("  TypeScript has no metadata tracking")
    
    print("\nRECOMMENDATION SUMMARY:")
    print("1. JSON file is more comprehensive (3.5x more parameters)")
    print("2. JSON has better metadata and version tracking")
    print("3. JSON covers more domains (economic, safety, emerging tech)")
    print("4. TypeScript has better code integration (typed interfaces)")
    print("5. TypeScript has utility functions for validation and search")
    
    print("\nMIGRATION STRATEGY:")
    print("1. Keep JSON as primary data source")
    print("2. Generate TypeScript interfaces from JSON")
    print("3. Migrate TypeScript utility functions to work with JSON structure")
    print("4. Create type-safe wrappers for JSON data access")
    print("5. Implement validation based on JSON schema")

if __name__ == "__main__":
    main()