#!/usr/bin/env python3
"""
Quick test script for ML service
Run with: python test_local.py
"""

import requests
import json
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8001"

def test_health():
    """Test health endpoints"""
    print("Testing health endpoints...")
    
    # Basic health
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    # Detailed status
    response = requests.get(f"{BASE_URL}/health/status")
    print(f"\nDetailed status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_models():
    """Test model listing"""
    print("\n\nTesting model listing...")
    
    response = requests.get(f"{BASE_URL}/api/ml/models")
    print(f"Available models: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_prediction():
    """Test prediction endpoint"""
    print("\n\nTesting prediction...")
    
    # Sample PEM fuel cell configuration
    test_request = {
        "system_type": "PEM",
        "configuration": {
            "reactor_volume": 100.0,
            "electrode_spacing": 2.0,
            "num_chambers": 2,
            "flow_mode": "continuous"
        },
        "conditions": {
            "temperature": 353.15,  # 80°C in Kelvin
            "ph": 7.0,
            "flow_rate": 10.0,
            "substrate_concentration": 5.0,
            "external_resistance": 100.0,
            "pressure": 3.0  # 3 atm
        },
        "materials": {
            "anode_material": "Platinum",
            "cathode_material": "Platinum",
            "membrane_type": "Nafion",
            "anode_surface_area": 50.0,
            "cathode_surface_area": 50.0,
            "anode_modifications": ["carbon_nanotubes"],
            "cathode_modifications": []
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/ml/predict",
        json=test_request,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Prediction response: {response.status_code}")
    if response.ok:
        result = response.json()
        print(json.dumps(result, indent=2))
        
        # Extract key metrics
        print(f"\nKey Results:")
        print(f"Power Output: {result['power_output']['value']:.2f} {result['power_output']['unit']}")
        print(f"Efficiency: {result['efficiency']['value']:.1f}%")
        print(f"Confidence: {result['confidence_score']:.2f}")
        print(f"Processing Time: {result['processing_time_ms']:.1f}ms")
    else:
        print(f"Error: {response.text}")

def test_mfc_prediction():
    """Test MFC prediction (currently using OPEM as placeholder)"""
    print("\n\nTesting MFC prediction...")
    
    test_request = {
        "system_type": "MFC",
        "configuration": {
            "reactor_volume": 500.0,
            "electrode_spacing": 5.0,
            "num_chambers": 2,
            "flow_mode": "batch"
        },
        "conditions": {
            "temperature": 303.15,  # 30°C
            "ph": 7.5,
            "flow_rate": 0.0,  # Batch mode
            "substrate_concentration": 10.0,
            "external_resistance": 1000.0,
            "pressure": 1.0
        },
        "materials": {
            "anode_material": "Carbon cloth",
            "cathode_material": "Carbon cloth with Pt",
            "membrane_type": "PEM",
            "anode_surface_area": 100.0,
            "cathode_surface_area": 100.0,
            "anode_modifications": ["biofilm"],
            "cathode_modifications": ["platinum_catalyst"]
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/ml/predict",
        json=test_request,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"MFC Prediction response: {response.status_code}")
    if response.ok:
        result = response.json()
        print(f"Power Output: {result['power_output']['value']:.2f} {result['power_output']['unit']}")
        print(f"Model Used: {result['model_type']}")

def test_materials():
    """Test materials API endpoints"""
    print("\n\nTesting Materials API...")
    
    # Test material properties
    print("\n1. Testing material properties lookup...")
    materials_to_test = ["platinum", "carbon", "titanium", "nafion"]
    
    for material in materials_to_test:
        response = requests.get(f"{BASE_URL}/api/materials/properties/{material}")
        print(f"\n{material}: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"  Formula: {data.get('formula')}")
            props = data.get('properties', {})
            if 'electrical_conductivity' in props:
                print(f"  Conductivity: {props['electrical_conductivity']}")
            if 'band_gap' in props:
                print(f"  Band gap: {props['band_gap']}")
    
    # Test recommendations
    print("\n\n2. Testing material recommendations...")
    response = requests.get(
        f"{BASE_URL}/api/materials/recommendations",
        params={
            "application": "anode",
            "max_cost": "low",
            "biocompatible": True
        }
    )
    print(f"Anode recommendations: {response.status_code}")
    if response.ok:
        recommendations = response.json()
        print(f"Found {len(recommendations)} recommendations:")
        for rec in recommendations[:3]:
            print(f"  - {rec['material']}: score={rec['score']:.2f}")
            print(f"    {rec['reasoning']}")
    
    # Test material comparison
    print("\n\n3. Testing material comparison...")
    response = requests.post(
        f"{BASE_URL}/api/materials/compare",
        json={
            "materials": ["carbon_cloth", "graphite", "stainless_steel"],
            "application": "anode"
        }
    )
    print(f"Material comparison: {response.status_code}")
    if response.ok:
        comparison = response.json()
        print("Conductivity comparison:")
        for material, value in comparison['comparison_matrix'].get('electrical_conductivity', {}).items():
            print(f"  {material}: {value}")

if __name__ == "__main__":
    print(f"Testing ML Service at {BASE_URL}")
    print(f"Time: {datetime.now()}")
    print("=" * 50)
    
    try:
        test_health()
        test_models()
        test_prediction()
        test_mfc_prediction()
        test_materials()
        
        print("\n\n✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to ML service")
        print("Make sure the service is running with:")
        print("  cd services/ml-engine")
        print("  pip install -r requirements.txt")
        print("  python app.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")