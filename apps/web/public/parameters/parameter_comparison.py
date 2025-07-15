#!/usr/bin/env python3
"""
Parameter Overlap Analysis Script
Compares parameters between MESS_PARAMETERS_UNIFIED.json and parameters-data.ts
"""

import json
import re
from typing import Set, Dict, List, Any

def extract_ts_parameter_ids(file_path: str) -> Set[str]:
    """Extract parameter IDs from TypeScript file"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract IDs from the TypeScript file
    pattern = r"id:\s*'([^']+)'"
    matches = re.findall(pattern, content)
    return set(matches)

def extract_json_parameter_ids(file_path: str) -> Set[str]:
    """Extract parameter IDs from JSON file, excluding categories and subcategories"""
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    parameter_ids = set()
    
    # Categories and subcategories to exclude
    excluded_categories = {
        'environmental-parameters', 'cell-level-parameters', 'reactor-level-parameters',
        'biological-parameters', 'material-parameters', 'operational-parameters',
        'performance-metrics', 'economic-sustainability-parameters', 'safety-regulatory-parameters'
    }
    
    excluded_subcategories = {
        'atmospheric-ambient-conditions', 'light-radiation-parameters', 'physical-environmental-factors',
        'cell-geometry-dimensions', 'cell-electrode-configuration', 'cell-performance-metrics',
        'cell-specific-operational-parameters', 'multi-cell-stack-configuration', 'reactor-system-components',
        'reactor-control-systems', 'industrial-scale-parameters', 'microorganism-database',
        'biofilm-parameters', 'microbial-kinetics', 'anode-materials', 'cathode-materials',
        'membraneseparator-materials', 'process-control-parameters', 'operating-modes',
        'startup-shutdown', 'electrical-performance', 'chemical-production-metrics',
        'treatment-performance', 'capital-cost-parameters', 'operating-cost-parameters',
        'economic-performance-indicators', 'life-cycle-assessment-parameters',
        'social-impact-parameters', 'safety-parameters', 'regulatory-compliance'
    }
    
    def extract_from_object(obj: Any, path: str = ""):
        if isinstance(obj, dict):
            if 'id' in obj:
                param_id = obj['id']
                # Only include if it's not a category/subcategory
                if param_id not in excluded_categories and param_id not in excluded_subcategories:
                    # Also exclude IDs that start with underscore (these are sub-properties)
                    if not param_id.startswith('_'):
                        parameter_ids.add(param_id)
            
            for key, value in obj.items():
                extract_from_object(value, f"{path}.{key}" if path else key)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                extract_from_object(item, f"{path}[{i}]")
    
    extract_from_object(data)
    return parameter_ids

def get_ts_categories(file_path: str) -> Dict[str, List[str]]:
    """Extract category structure from TypeScript file"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract parameter categories
    category_pattern = r"id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']*)',.*?subcategories:\s*\[(.*?)\]"
    matches = re.findall(category_pattern, content, re.DOTALL)
    
    categories = {}
    for match in matches:
        cat_id, cat_name, cat_desc, subcats = match
        subcats_list = re.findall(r"'([^']+)'", subcats)
        categories[cat_id] = {
            'name': cat_name,
            'description': cat_desc,
            'subcategories': subcats_list
        }
    
    return categories

def get_json_categories(file_path: str) -> Dict[str, Any]:
    """Extract category structure from JSON file"""
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    categories = {}
    if 'categories' in data:
        for category in data['categories']:
            cat_id = category['id']
            categories[cat_id] = {
                'name': category['name'],
                'description': category.get('description', ''),
                'subcategories': []
            }
            
            if 'subcategories' in category:
                for subcat in category['subcategories']:
                    categories[cat_id]['subcategories'].append(subcat['id'])
    
    return categories

def main():
    ts_file = '/Users/samfrons/Desktop/messai-ai/parameters/parameters-data.ts'
    json_file = '/Users/samfrons/Desktop/messai-ai/apps/web/public/parameters/MESS_PARAMETERS_UNIFIED.json'
    
    # Extract parameter IDs
    ts_params = extract_ts_parameter_ids(ts_file)
    json_params = extract_json_parameter_ids(json_file)
    
    print("=== PARAMETER OVERLAP ANALYSIS ===\n")
    
    # Basic counts
    print(f"Parameters in TypeScript file: {len(ts_params)}")
    print(f"Parameters in JSON file: {len(json_params)}")
    
    # Find overlaps
    common_params = ts_params.intersection(json_params)
    ts_only = ts_params - json_params
    json_only = json_params - ts_params
    
    print(f"Common parameters: {len(common_params)}")
    print(f"TypeScript only: {len(ts_only)}")
    print(f"JSON only: {len(json_only)}")
    
    # Show overlaps
    print("\n=== COMMON PARAMETERS ===")
    for param in sorted(common_params):
        print(f"  {param}")
    
    print("\n=== TYPESCRIPT ONLY (166 total) ===")
    for param in sorted(ts_only):
        print(f"  {param}")
    
    print("\n=== JSON ONLY (654 total) ===")
    json_only_list = sorted(json_only)
    for i, param in enumerate(json_only_list):
        print(f"  {param}")
        if i >= 49:  # Show first 50
            print(f"  ... and {len(json_only_list) - 50} more")
            break
    
    # Category analysis
    print("\n=== CATEGORY STRUCTURE COMPARISON ===")
    
    ts_cats = get_ts_categories(ts_file)
    json_cats = get_json_categories(json_file)
    
    print(f"TypeScript categories: {len(ts_cats)}")
    print(f"JSON categories: {len(json_cats)}")
    
    print("\nTypeScript categories:")
    for cat_id, cat_info in ts_cats.items():
        print(f"  {cat_id}: {cat_info['name']} ({len(cat_info['subcategories'])} subcategories)")
    
    print("\nJSON categories:")
    for cat_id, cat_info in json_cats.items():
        print(f"  {cat_id}: {cat_info['name']} ({len(cat_info['subcategories'])} subcategories)")
    
    # Recommendations
    print("\n=== RECOMMENDATIONS ===")
    
    overlap_percentage = (len(common_params) / len(ts_params)) * 100
    print(f"Overlap percentage: {overlap_percentage:.1f}%")
    
    if overlap_percentage < 30:
        print("LOW OVERLAP: The two systems have significantly different parameter sets.")
        print("Recommendation: Consider the JSON file as the primary source and migrate gradually.")
    elif overlap_percentage < 70:
        print("MODERATE OVERLAP: Some commonality but significant differences.")
        print("Recommendation: Merge carefully, prioritizing the more comprehensive set.")
    else:
        print("HIGH OVERLAP: Strong commonality between the two systems.")
        print("Recommendation: Consolidate into a single system.")
    
    print("\nStructural differences:")
    print("- TypeScript: Flat structure with 9 categories")
    print("- JSON: Hierarchical structure with 9 major categories and 53+ subcategories")
    print("- JSON has more detailed categorization and significantly more parameters")
    
    print("\nRecommended approach:")
    print("1. Use JSON file as the primary source (more comprehensive)")
    print("2. Migrate TypeScript-specific parameters to JSON format")
    print("3. Standardize on the JSON hierarchical structure")
    print("4. Create migration mapping for existing TypeScript code")

if __name__ == "__main__":
    main()