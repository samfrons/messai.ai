<!--
Parameter ID: cell_diameter
Category: physical
Generated: 2025-01-16T12:40:00.000Z
-->

# Cell Diameter

## Definition

Cell diameter quantifies the cross-sectional dimension of cylindrical microbial
electrochemical system reactors or the equivalent diameter of non-circular
cross-sections. This parameter affects hydrodynamics, mass transfer, electrode
spacing, and overall system performance. Cell diameter influences residence time
distribution, mixing characteristics, and scale-up considerations.

## Typical Values

- **Range**: 1 - 1000 mm
- **Typical**: 10 - 200 mm
- **Optimal**: 25 - 100 mm (depending on application)

**Performance Categories**:

- **Low Performance**: <10 mm (limited volume) or >500 mm (poor mass transfer)
- **Moderate Performance**: 10 - 25 mm or 200 - 500 mm (suboptimal design)
- **High Performance**: 25 - 100 mm (good balance of properties)
- **Exceptional Performance**: 50 - 100 mm (optimal for most applications)

## Measurement Methods

### Direct Measurement

1. **Caliper Measurement**:
   - Use precision calipers for external diameter
   - Measure at multiple points for uniformity
   - Account for wall thickness if needed
   - Simple and accurate method

2. **Dimensional Inspection**:
   - Use coordinate measuring machine (CMM)
   - High precision measurements
   - Automated measurement capability
   - Good for quality control

3. **Internal Diameter Measurement**:
   - Use inside calipers or bore gauges
   - Important for flow calculations
   - Account for internal features
   - Critical for hydraulic diameter calculations

### Calculation Considerations

- For non-circular cross-sections: D_equivalent = 4A/P
- Where A = cross-sectional area, P = wetted perimeter
- Account for internal structures affecting flow
- Consider thermal expansion at operating temperature

## Affecting Factors

### Primary Factors

1. **Application Requirements**:
   - Laboratory scale: 10-50 mm diameter
   - Pilot scale: 50-200 mm diameter
   - Commercial scale: 200-1000 mm diameter
   - Treatment capacity determines required size

2. **Manufacturing Constraints**:
   - Available pipe or tube sizes
   - Material limitations affect maximum diameter
   - Fabrication capabilities influence design
   - Cost considerations affect size selection

3. **Performance Requirements**:
   - Flow rate requirements affect diameter selection
   - Pressure drop limitations influence size
   - Residence time requirements affect volume needs
   - Mass transfer requirements influence diameter

### Secondary Factors

1. **System Integration**:
   - Available space constrains diameter
   - Connection requirements affect size
   - Maintenance access needs influence design
   - Module standardization affects diameter choice

2. **Economic Factors**:
   - Material costs increase with diameter
   - Fabrication costs vary with size
   - Installation costs affected by diameter
   - Operating efficiency varies with size

## Performance Impact

Optimal cell diameter (50-100 mm) provides good balance between volume, mass
transfer, and manufacturing feasibility. Too small diameter (<25 mm) limits
capacity and may cause high pressure drop. Too large diameter (>300 mm) may
cause poor mixing and non-uniform current distribution.

## Validation Rules

1. **Range validation**: 0.1 - 10,000 mm
2. **Unit consistency**: Express in mm or cm
3. **Correlation checks**: Should correlate with cell volume
4. **Outlier detection**: >1000 mm unusual for most applications
5. **Physical plausibility**: Must accommodate internal components

## References

1. **Perry, R.H. & Green, D.W.** (2008). "Perry's Chemical Engineers' Handbook".
   McGraw-Hill, New York.
   - Equipment sizing and dimensional considerations

2. **Logan, B.E.** (2008). "Microbial Fuel Cells". John Wiley & Sons, Hoboken,
   NJ.
   - Reactor design considerations including geometry

3. **Tchobanoglous, G., et al.** (2003). "Wastewater Engineering: Treatment and
   Reuse". McGraw-Hill, New York.
   - Reactor sizing and design principles

## Application Notes

**Laboratory Scale**:

- Select diameter based on experimental objectives
- Consider sample volume and analytical requirements
- Balance diameter with other geometric constraints

**Pilot Scale**:

- Scale diameter appropriately from laboratory results
- Consider manufacturing and operational constraints
- Validate diameter effects on performance

**Commercial Scale**:

- Optimize diameter for economic and performance requirements
- Consider modular design with standard diameters
- Balance capacity with mass transfer efficiency
