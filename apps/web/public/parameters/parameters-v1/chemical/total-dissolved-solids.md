<!--
Parameter ID: total_dissolved_solids
Category: chemical
Generated: 2025-01-16T12:36:00.000Z
-->

# Total Dissolved Solids (TDS)

## Definition

Total dissolved solids (TDS) quantifies the total concentration of dissolved
inorganic and organic substances in microbial electrochemical systems. This
parameter affects solution conductivity, osmotic pressure, and microbial
physiology. TDS influences electrical performance through its relationship with
ionic conductivity while also affecting biological processes through osmotic and
ionic effects.

## Typical Values

- **Range**: 100 - 50,000 mg/L
- **Typical**: 500 - 5,000 mg/L
- **Optimal**: 1,000 - 10,000 mg/L

**Performance Categories**:

- **Low Performance**: <500 mg/L (poor conductivity) or >30,000 mg/L (osmotic
  stress)
- **Moderate Performance**: 500 - 1,500 mg/L or 15,000 - 30,000 mg/L
  (suboptimal)
- **High Performance**: 1,500 - 10,000 mg/L (good balance)
- **Exceptional Performance**: 3,000 - 8,000 mg/L (optimal range)

## Measurement Methods

### Direct Measurement

1. **Gravimetric Method**:
   - Filter sample through 0.45 μm membrane
   - Evaporate filtrate at 180°C until dry
   - Weigh residue after cooling in desiccator
   - Most accurate method for TDS determination

2. **Conductivity Conversion**:
   - Measure electrical conductivity
   - Apply conversion factor (typically 0.5-0.8)
   - TDS (mg/L) ≈ Conductivity (μS/cm) × 0.64
   - Rapid method but less accurate

3. **TDS Meter**:
   - Direct reading electronic meter
   - Uses conductivity measurement with built-in conversion
   - Convenient for field measurements
   - Requires calibration for specific water types

### Calculation Considerations

- Include all dissolved substances passing through 0.45 μm filter
- Account for volatile organics lost during evaporation
- Consider temperature effects on solubility
- Distinguish from suspended solids

## Affecting Factors

### Primary Factors

1. **Water Source**:
   - Fresh water: 50-1,000 mg/L TDS
   - Brackish water: 1,000-10,000 mg/L TDS
   - Seawater: ~35,000 mg/L TDS
   - Industrial wastewater: Highly variable

2. **System Processes**:
   - Evaporation concentrates TDS
   - Membrane processes can concentrate or remove TDS
   - Biological processes may alter TDS composition
   - Chemical additions increase TDS

3. **Operating Conditions**:
   - Temperature affects solubility limits
   - pH influences dissolution and precipitation
   - Retention time affects accumulation
   - Recirculation concentrates dissolved solids

### Secondary Factors

1. **Chemical Additions**:
   - Nutrient supplements increase TDS
   - Buffer chemicals contribute to TDS
   - Cleaning chemicals temporarily increase TDS
   - pH adjustment chemicals affect levels

2. **Biological Activity**:
   - Metabolic products contribute to TDS
   - Cell lysis releases intracellular contents
   - Biofilm EPS may contribute to dissolved organics
   - Mineralization affects inorganic TDS

## Performance Impact

Optimal TDS levels (3,000-8,000 mg/L) provide good electrical conductivity while
maintaining biological compatibility. Low TDS (<1,000 mg/L) reduces conductivity
and power output. Very high TDS (>20,000 mg/L) causes osmotic stress and may
inhibit microbial activity.

## Validation Rules

1. **Range validation**: 10 - 100,000 mg/L
2. **Unit consistency**: Express in mg/L or g/L
3. **Correlation checks**: Should correlate with conductivity
4. **Outlier detection**: >50,000 mg/L requires verification
5. **Physical plausibility**: Must be consistent with conductivity measurements

## References

1. **APHA, AWWA, WEF** (2017). "Standard Methods for the Examination of Water
   and Wastewater". 23rd Edition, American Public Health Association,
   Washington, DC.
   - Standard methods for TDS measurement and analysis

2. **Tchobanoglous, G., et al.** (2003). "Wastewater Engineering: Treatment and
   Reuse". McGraw-Hill, New York.
   - TDS considerations in water and wastewater treatment

3. **Logan, B.E.** (2008). "Microbial Fuel Cells". John Wiley & Sons, Hoboken,
   NJ.
   - TDS effects on bioelectrochemical system performance

## Application Notes

**Laboratory Scale**:

- Monitor TDS for solution characterization
- Control TDS levels for reproducible experiments
- Study TDS effects on microbial performance

**Pilot Scale**:

- Implement TDS monitoring for process control
- Manage TDS accumulation through system design
- Optimize TDS levels for performance and stability

**Commercial Scale**:

- Design TDS management systems for long-term operation
- Monitor TDS for regulatory compliance
- Balance electrical performance with biological requirements
