Materials Project API Implementation for MESSAI

1. Proper API Setup pythonfrom mp_api.client import MPRester

# Initialize with your API key

mpr = MPRester("YOUR_API_KEY") 2. Correct Query Structure for MESSAI Materials
pythondef get_messai_electrode_materials(): """ Get electrode materials using
correct API syntax """ with MPRester("YOUR_API_KEY") as mpr: # Query for
conductive materials (metals and low band-gap) electrode_materials =
mpr.materials.summary.search( # Correct field names from API docs band_gap=(0,
1.0), # Conductive materials energy_above_hull=(0, 0.1), # Stable materials  
 num_elements=(1, 3), # Simple compositions # Exclude toxic elements exclude_elements=["Pb",
"Cd", "Hg", "As", "Cr", "Be"], # Correct fields based on API documentation fields=[
"material_id", "formula_pretty", "band_gap", "energy_above_hull", "formation_energy_per_atom",
"density", "is_metal", "is_stable", "oxide_type", "total_magnetization", "ordering",
"nsites", "volume" ] )

        return electrode_materials

def get_catalyst_materials(): """ Get metal oxide catalysts for oxygen reduction
""" with MPRester("YOUR_API_KEY") as mpr: # Query for transition metal oxides
catalysts = mpr.materials.summary.search( elements=["O", "AND", ["Mn", "Fe",
"Co", "Ni", "Cu", "Mo", "W"]], energy_above_hull=(0, 0.05), band_gap=(0, 4), #
Include semiconductors fields=[ "material_id", "formula_pretty", "band_gap",
"energy_above_hull", "formation_energy_per_atom", "oxide_type", "density",
"nsites" ] )

        return catalysts

3.  Handling Large Downloads (Per API Tips) pythondef
    get_all_messai_materials_chunked(): """ Download materials in chunks to
    avoid timeouts """ import time
        with MPRester("YOUR_API_KEY") as mpr:
            all_materials = []

            # Define chunks by element groups to stay under limits
            element_groups = [
                ["C"],  # Carbon materials
                ["Ti", "V", "Cr"],  # Early transition metals
                ["Mn", "Fe", "Co", "Ni", "Cu"],  # Late transition metals
                ["Mo", "W", "Ru", "Rh", "Pd"],  # Noble/refractory metals
            ]

            for elements in element_groups:
                print(f"Fetching materials containing {elements}...")

                try:
                    materials = mpr.materials.summary.search(
                        elements=elements,
                        energy_above_hull=(0, 0.1),
                        num_sites=(1, 50),  # Limit structure size
                        fields=[
                            "material_id",
                            "formula_pretty",
                            "band_gap",
                            "energy_above_hull",
                            "formation_energy_per_atom",
                            "density",
                            "is_metal"
                        ]
                    )

                    all_materials.extend(materials)
                    print(f"Found {len(materials)} materials")

                    # Respect rate limits
                    time.sleep(1)

                except Exception as e:
                    print(f"Error fetching {elements}: {e}")
                    continue

            return all_materials
4.  Using Available Properties (From API Docs) pythondef
    create_messai_materials_database(): """ Create database using actually
    available properties """ materials_data = []
        with MPRester("YOUR_API_KEY") as mpr:
            # Get summary data (most efficient)
            docs = mpr.materials.summary.search(
                band_gap=(0, 2),  # Metals and semiconductors
                energy_above_hull=(0, 0.1),
                exclude_elements=["Pb", "Cd", "Hg", "As", "Cr"],
                num_sites=(1, 20),  # Keep queries manageable
                fields=[
                    # Basic info
                    "material_id",
                    "formula_pretty",
                    "composition",
                    "elements",
                    "nelements",

                    # Electronic properties
                    "band_gap",
                    "is_gap_direct",
                    "is_metal",
                    "efermi",

                    # Thermodynamic properties
                    "energy_above_hull",
                    "energy_per_atom",
                    "formation_energy_per_atom",
                    "is_stable",

                    # Structural properties
                    "density",
                    "volume",
                    "nsites",
                    "symmetry",

                    # Magnetic properties
                    "is_magnetic",
                    "ordering",
                    "total_magnetization"
                ]
            )

            # Process each material
            for doc in docs:
                # Calculate MESSAI-specific scores
                messai_entry = {
                    "mp_id": doc.material_id,
                    "formula": doc.formula_pretty,

                    # Conductivity proxy
                    "is_conductive": doc.is_metal or (doc.band_gap < 0.5),
                    "band_gap": doc.band_gap,

                    # Stability metrics
                    "stability_score": 1 / (doc.energy_above_hull + 0.001),
                    "is_stable": doc.is_stable,
                    "formation_energy": doc.formation_energy_per_atom,

                    # Physical properties
                    "density": doc.density,
                    "volume_per_atom": doc.volume / doc.nsites if doc.nsites > 0 else None,

                    # For ML features
                    "n_elements": doc.nelements,
                    "is_oxide": "O" in doc.elements,
                    "is_carbon": "C" in doc.elements,
                    "has_transition_metal": any(el in ["Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu"]
                                               for el in doc.elements)
                }

                materials_data.append(messai_entry)

        return materials_data
5.  Specific Queries for MESSAI Components python# ANODE MATERIALS - Focus on
    conductivity and biocompatibility anode_query = { "band_gap": (0, 0.5), #
    Highly conductive "elements": {"$in": ["C", "Ti", "Fe", "Ni", "Cu"]},
    "exclude_elements": ["Pb", "Cd", "Hg", "As", "Cr"], "energy_above_hull": (0,
    0.05) }

# CATHODE CATALYSTS - Focus on ORR activity

cathode_query = { "elements": ["O", "AND", ["Mn", "Fe", "Co", "Pt", "Pd"]],
"energy_above_hull": (0, 0.1), "is_magnetic": True # Often correlates with
catalytic activity }

# MEMBRANE MATERIALS - Focus on ionic conductivity

membrane_query = { "elements": {"$all": ["O", "H"]}, # Proton conductors
"band_gap": (2, 10), # Insulators "energy_above_hull": (0, 0.05) } 6. Complete
Working Script for Claude Code python""" Complete Materials Project extraction
for MESSAI """

from mp_api.client import MPRester import pandas as pd import time import json

def fetch_messai_materials(api_key): """ Main function to fetch all
MESSAI-relevant materials """

    with MPRester(api_key) as mpr:
        print("Fetching electrode materials...")

        # 1. Carbon-based electrodes
        carbon_materials = mpr.materials.summary.search(
            elements=["C"],
            band_gap=(0, 1),
            energy_above_hull=(0, 0.05),
            fields=["material_id", "formula_pretty", "band_gap",
                   "energy_above_hull", "density", "is_metal"]
        )
        print(f"Found {len(carbon_materials)} carbon materials")

        # 2. Metal oxide catalysts
        print("Fetching catalyst materials...")
        catalysts = mpr.materials.summary.search(
            elements=["O", "AND", ["Mn", "Fe", "Co", "Ni"]],
            energy_above_hull=(0, 0.1),
            fields=["material_id", "formula_pretty", "band_gap",
                   "energy_above_hull", "oxide_type", "is_magnetic"]
        )
        print(f"Found {len(catalysts)} catalyst materials")

        # 3. Conductive metals
        print("Fetching metal electrodes...")
        metals = mpr.materials.summary.search(
            is_metal=True,
            exclude_elements=["Pb", "Cd", "Hg", "As"],
            num_elements=(1, 2),
            energy_above_hull=(0, 0.05),
            fields=["material_id", "formula_pretty", "band_gap",
                   "energy_above_hull", "density"]
        )
        print(f"Found {len(metals)} metal materials")

    # Combine all materials
    all_materials = carbon_materials + catalysts + metals

    # Convert to DataFrame
    df = pd.DataFrame([{
        "mp_id": mat.material_id,
        "formula": mat.formula_pretty,
        "band_gap": getattr(mat, 'band_gap', None),
        "energy_above_hull": getattr(mat, 'energy_above_hull', None),
        "density": getattr(mat, 'density', None),
        "is_metal": getattr(mat, 'is_metal', False),
        "oxide_type": getattr(mat, 'oxide_type', None),
        "is_magnetic": getattr(mat, 'is_magnetic', False)
    } for mat in all_materials])

    # Calculate MESSAI scores
    df['conductivity_score'] = df['is_metal'].astype(int) + (1 / (df['band_gap'] + 0.1))
    df['stability_score'] = 1 / (df['energy_above_hull'] + 0.001)

    # Save results
    df.to_csv('messai_materials_database.csv', index=False)
    print(f"\nSaved {len(df)} materials to messai_materials_database.csv")

    # Save summary statistics
    summary = {
        "total_materials": len(df),
        "metals": len(df[df['is_metal'] == True]),
        "stable_materials": len(df[df['energy_above_hull'] < 0.025]),
        "carbon_based": len(df[df['formula'].str.contains('C')]),
        "oxides": len(df[df['formula'].str.contains('O')])
    }

    with open('materials_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)

    return df

# Run the extraction

if **name** == "**main**": API_KEY = "YOUR_API_KEY" materials_df =
fetch_messai_materials(API_KEY) print("\nExtraction complete!") 7. Request for
Claude Code (Corrected) Using the Materials Project API with my key, create a
materials database for MESSAI:

1. USE CORRECT API SYNTAX:

   - Use MPRester from mp_api.client
   - Use 'energy_above_hull' not 'e_above_hull'
   - Use 'band_gap' for conductivity screening
   - Check available fields with mpr.materials.summary.available_fields

2. FETCH IN CHUNKS TO AVOID TIMEOUTS:

   - Query by element groups
   - Limit to 1000 materials per query
   - Add 1 second delay between queries
   - Use try/except for error handling

3. GET THESE MATERIAL TYPES:

   - Electrode materials: band_gap < 1 eV
   - Catalysts: transition metal oxides
   - Stable only: energy_above_hull < 0.1
   - Non-toxic: exclude Pb, Cd, Hg, As, Cr

4. EXTRACT AVAILABLE PROPERTIES:

   - material_id, formula_pretty
   - band_gap, is_metal
   - energy_above_hull, formation_energy_per_atom
   - density, volume, nsites
   - is_magnetic, oxide_type

5. CALCULATE MESSAI SCORES:
   - Conductivity score from band_gap
   - Stability score from energy_above_hull
   - Application suitability (anode/cathode/catalyst)

Save as messai_materials_database.csv with 1000+ materials
