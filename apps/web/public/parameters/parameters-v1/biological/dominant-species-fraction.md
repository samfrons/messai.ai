<!--
Parameter ID: dominant_species_fraction
Category: biological
Generated: 2025-01-16T11:15:00.000Z
-->

# Dominant Species Fraction

## Definition

Dominant species fraction quantifies the percentage of the total microbial
community comprised by the most abundant species or functional group in
microbial electrochemical systems. This parameter indicates community diversity,
stability, and functional specialization. Higher dominant species fractions
suggest specialized communities, while lower fractions indicate more diverse
ecosystems.

## Typical Values

- **Range**: 10 - 90 %
- **Typical**: 30 - 70 %
- **Optimal**: 40 - 60 %

**Performance Categories**:

- **Low Performance**: <20% (highly diverse, potentially unstable)
- **Moderate Performance**: 20 - 40% (moderate dominance)
- **High Performance**: 40 - 70% (balanced dominance)
- **Exceptional Performance**: 70 - 85% (specialized, stable)

## Measurement Methods

### Direct Measurement

1. **16S rRNA Gene Sequencing**:
   - Amplify and sequence 16S rRNA genes
   - Identify species based on sequence similarity
   - Calculate relative abundance of dominant species
   - High resolution for species identification

2. **Fluorescence In Situ Hybridization (FISH)**:
   - Use species-specific fluorescent probes
   - Count cells under microscopy
   - Calculate percentage of total cells
   - Good for known target organisms

### Calculation Considerations

- Define dominance threshold (e.g., most abundant species)
- Account for detection limits of methods
- Consider functional vs taxonomic dominance

## Affecting Factors

### Primary Factors

1. **Selection Pressure**:
   - Strong selection: Higher dominance (60-90%)
   - Weak selection: Lower dominance (20-40%)
   - Electrochemical selection favors electroactive species

2. **System Maturity**:
   - Young systems: Lower dominance (20-50%)
   - Mature systems: Higher dominance (50-80%)
   - Succession toward specialized communities

3. **Substrate Type**:
   - Simple substrates: Higher dominance
   - Complex substrates: Lower dominance
   - Specialized substrates: Very high dominance (>80%)

### Secondary Factors

1. **Environmental Stress**:
   - Stress conditions: Higher dominance of tolerant species
   - Optimal conditions: More diverse communities
   - pH, temperature, toxicity effects

2. **System Design**:
   - Biofilm systems: Higher dominance
   - Suspended growth: Lower dominance
   - Continuous vs batch operation

## Performance Impact

Moderate dominant species fractions (40-60%) often correlate with stable,
efficient performance. Very high dominance (>80%) may indicate vulnerability to
perturbations, while very low dominance (<20%) may suggest unstable or
inefficient conditions.

## Validation Rules

1. **Range validation**: 5 - 100 %
2. **Unit consistency**: Express as percentage
3. **Correlation checks**: Should relate to system stability
4. **Outlier detection**: >95% suggests monoculture conditions
5. **Physical plausibility**: Cannot exceed 100%

## References

1. **Rabaey, K., et al.** (2004). "Biofuel cells select for microbial consortia
   that self-mediate electron transfer". _Applied and Environmental
   Microbiology_, 70(9), 5373-5382.
   - Community selection in bioelectrochemical systems

2. **Logan, B.E., et al.** (2019). "Electroactive microorganisms in
   bioelectrochemical systems". _Nature Reviews Microbiology_, 17(5), 307-319.
   - Microbial community dynamics in MESs

3. **Kiely, P.D., et al.** (2011). "Long-term cathode performance and the
   microbial communities that develop in microbial fuel cells fed different
   fermentation endproducts". _Bioresource Technology_, 102(1), 361-366.
   - Community structure and stability over time

## Application Notes

**Laboratory Scale**:

- Monitor community development during startup
- Use for system optimization and troubleshooting
- Correlate with performance metrics

**Pilot Scale**:

- Track community stability over time
- Monitor response to operational changes
- Use for early warning of system issues

**Commercial Scale**:

- Monitor as indicator of system health
- Design for appropriate community balance
- Implement strategies for community management
