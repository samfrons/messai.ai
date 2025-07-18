<!--
Parameter ID: detection_limit
Category: operational
Generated: 2025-01-16T11:22:00.000Z
-->

# Detection Limit

## Definition

Detection limit represents the lowest concentration or amount of a target
analyte that can be reliably detected and distinguished from background noise in
microbial electrochemical systems. This parameter defines the sensitivity
threshold of analytical methods and monitoring systems, determining the minimum
measurable levels of substrates, products, and contaminants critical for system
control and optimization.

## Typical Values

- **Range**: 0.001 - 1000 μg/L
- **Typical**: 0.1 - 100 μg/L
- **Optimal**: 0.01 - 10 μg/L

**Performance Categories**:

- **Low Performance**: >100 μg/L (poor sensitivity, limited utility)
- **Moderate Performance**: 10 - 100 μg/L (basic detection)
- **High Performance**: 1 - 10 μg/L (good sensitivity)
- **Exceptional Performance**: <1 μg/L (excellent sensitivity)

## Measurement Methods

### Direct Measurement

1. **Signal-to-Noise Ratio Method**:
   - Measure background noise (blank samples)
   - Calculate standard deviation of noise
   - Detection limit = 3 × standard deviation
   - Standard statistical approach

2. **Calibration Curve Method**:
   - Prepare low-concentration standards
   - Determine lowest reliably quantifiable level
   - Account for method precision and accuracy
   - Practical approach for routine analysis

### Calculation Considerations

- Use appropriate statistical methods (3σ or 3.3σ)
- Account for matrix effects in real samples
- Consider both instrumental and method detection limits

## Affecting Factors

### Primary Factors

1. **Analytical Method**:
   - Spectrophotometry: 1-1000 μg/L typical
   - Chromatography: 0.1-100 μg/L typical
   - Mass spectrometry: 0.001-10 μg/L typical
   - Electrochemical: 0.01-100 μg/L typical

2. **Sample Matrix**:
   - Clean matrices: Lower detection limits
   - Complex matrices: Higher detection limits
   - Interference compounds: Elevated limits

3. **Instrument Quality**:
   - High-end instruments: Lower detection limits
   - Basic instruments: Higher detection limits
   - Maintenance quality affects sensitivity

### Secondary Factors

1. **Sample Preparation**:
   - Concentration steps: Improved detection limits
   - Cleanup procedures: Reduced interference
   - Sample volume: Larger volumes improve limits

2. **Environmental Conditions**:
   - Temperature stability: Better detection limits
   - Vibration control: Reduced noise
   - Electromagnetic interference: Affects electronics

## Performance Impact

Low detection limits enable early detection of changes in system performance,
contamination events, and process optimization opportunities. Systems with
detection limits 10-100× below operating concentrations provide excellent
monitoring and control capabilities.

## Validation Rules

1. **Range validation**: 0.0001 - 10,000 μg/L
2. **Unit consistency**: Express in μg/L (micrograms per liter)
3. **Correlation checks**: Should improve with better instruments
4. **Outlier detection**: <0.001 μg/L requires verification
5. **Physical plausibility**: Limited by fundamental analytical chemistry

## References

1. **EPA Method 1631** (2002). "Mercury in Water by Oxidation, Purge and Trap,
   and Cold Vapor Atomic Fluorescence Spectrometry". U.S. Environmental
   Protection Agency.
   - Standard methods for detection limit determination

2. **IUPAC Recommendations** (1995). "Nomenclature in evaluation of analytical
   methods including detection and quantification capabilities". _Pure and
   Applied Chemistry_, 67(10), 1699-1723.
   - Definitions and calculations for detection limits

3. **Standard Methods for the Examination of Water and Wastewater** (2017).
   American Public Health Association, Washington, DC.
   - Detection limit requirements for water quality analysis

## Application Notes

**Laboratory Scale**:

- Determine detection limits for all analytical methods
- Use detection limits for method validation
- Document detection limit testing procedures

**Pilot Scale**:

- Select analytical methods based on required detection limits
- Monitor detection limit performance over time
- Implement quality control for detection capability

**Commercial Scale**:

- Balance detection limit requirements with analysis costs
- Use fit-for-purpose detection limits
- Implement regular detection limit verification
