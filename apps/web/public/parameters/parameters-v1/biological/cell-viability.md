<!--
Parameter ID: cell_viability
Category: biological
Generated: 2025-01-16T11:26:00.000Z
-->

# Cell Viability

## Definition

Cell viability quantifies the percentage of living, metabolically active cells
within the total microbial population in microbial electrochemical systems. This
parameter indicates the health and functional capacity of the microbial
community, directly affecting system performance, substrate utilization
efficiency, and current generation capability. Higher viability indicates a
healthier, more active microbial community.

## Typical Values

- **Range**: 30 - 99 %
- **Typical**: 70 - 90 %
- **Optimal**: 85 - 95 %

**Performance Categories**:

- **Low Performance**: <60% (stressed, dying community)
- **Moderate Performance**: 60 - 80% (moderate health)
- **High Performance**: 80 - 95% (healthy community)
- **Exceptional Performance**: >95% (very healthy, active)

## Measurement Methods

### Direct Measurement

1. **Live/Dead Staining**:
   - Use SYTO 9 (live) and propidium iodide (dead) dyes
   - Count viable vs total cells by microscopy
   - Calculate viability percentage
   - High resolution for spatial analysis

2. **ATP Measurement**:
   - Extract cellular ATP
   - Use luciferin-luciferase assay
   - ATP indicates metabolically active cells
   - Rapid quantitative method

### Calculation Considerations

- Account for different cell sizes and activities
- Consider dormant vs dead cells
- Use appropriate controls for staining methods

## Affecting Factors

### Primary Factors

1. **Environmental Stress**:
   - pH extremes: Reduced viability (40-70%)
   - Temperature stress: Lower viability
   - Toxic compounds: Significant viability loss

2. **Nutrient Availability**:
   - Sufficient nutrients: High viability (85-95%)
   - Starvation conditions: Reduced viability (50-80%)
   - Balanced nutrition: Optimal viability

3. **System Age**:
   - Young biofilms: High viability (90-99%)
   - Mature biofilms: Moderate viability (70-90%)
   - Aging biofilms: Lower viability (60-80%)

### Secondary Factors

1. **Oxygen Exposure**:
   - Appropriate O₂ levels: Optimal viability
   - Oxidative stress: Reduced viability
   - Anaerobic stress for aerobes: Lower viability

2. **Mechanical Stress**:
   - High shear: Physical damage to cells
   - Gentle mixing: Maintains viability
   - Static conditions: May reduce viability over time

## Performance Impact

High cell viability (>85%) correlates with robust current generation and stable
system performance. Low viability (<60%) indicates stressed conditions requiring
intervention, potentially leading to 30-60% reduction in system performance.

## Validation Rules

1. **Range validation**: 0 - 100 %
2. **Unit consistency**: Express as percentage
3. **Correlation checks**: Should correlate with metabolic activity
4. **Outlier detection**: >99% rare in mixed communities
5. **Physical plausibility**: Cannot exceed 100%

## References

1. **Boulos, L., et al.** (1999). "LIVE/DEAD BacLight: application of a new
   rapid staining method for direct enumeration of viable and total bacteria in
   drinking water". _Applied and Environmental Microbiology_, 65(4), 1623-1629.
   - Standard live/dead staining methodology

2. **Phe, M.H., et al.** (2005). "Nucleic acid fluorochromes and flow cytometry
   prove useful in assessing the effect of chlorination on drinking water
   bacteria". _Water Research_, 39(15), 3618-3628.
   - Cell viability assessment methods

3. **Logan, B.E.** (2008). "Microbial fuel cells". John Wiley & Sons, Hoboken,
   NJ.
   - Microbial health considerations in bioelectrochemical systems

## Application Notes

**Laboratory Scale**:

- Monitor viability during biofilm development
- Use viability to assess stress conditions
- Correlate viability with performance metrics

**Pilot Scale**:

- Implement viability monitoring for system health
- Use viability trends for predictive maintenance
- Optimize conditions to maintain high viability

**Commercial Scale**:

- Monitor viability as key health indicator
- Implement early warning systems based on viability
- Design operating procedures to maintain cell viability
