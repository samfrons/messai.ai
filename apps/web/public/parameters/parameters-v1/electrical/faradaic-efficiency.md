<!--
Parameter ID: faradaic_efficiency
Category: electrical
Generated: 2025-01-16T10:45:00.000Z
-->

# Faradaic Efficiency

## Definition

Faradaic efficiency quantifies the percentage of electrons transferred through
the external circuit relative to the theoretical maximum based on substrate
oxidation in microbial electrochemical systems. This parameter measures how
effectively the system converts substrate-derived electrons into electrical
current, excluding losses to competing metabolic processes like methanogenesis
or side reactions.

## Typical Values

- **Range**: 10 - 95 %
- **Typical**: 40 - 70 %
- **Optimal**: 70 - 85 %

**Performance Categories**:

- **Low Performance**: <30% (significant competing processes)
- **Moderate Performance**: 30 - 50% (mixed electron pathways)
- **High Performance**: 50 - 80% (efficient electron capture)
- **Exceptional Performance**: >80% (optimized systems)

## Measurement Methods

### Direct Measurement

1. **Coulombic Accounting**:
   - Measure total charge transferred: Q = ∫I dt
   - Calculate theoretical charge from substrate: Qtheo = n·F·Δsubstrate/MW
   - Faradaic efficiency = (Q/Qtheo) × 100%
   - Account for biomass formation

2. **Mass Balance Approach**:
   - Monitor substrate consumption and products
   - Account for all electron pathways
   - Include methanogenesis, sulfate reduction
   - Balance electron donors and acceptors

### Calculation Considerations

- Use chemical oxygen demand (COD) for complex substrates
- Account for background current and losses
- Consider electrode corrosion effects

## Affecting Factors

### Primary Factors

1. **Microbial Community**:
   - Electroactive bacteria: 70-95% efficiency
   - Mixed communities: 30-70% efficiency
   - Methanogenic communities: 10-40% efficiency

2. **Substrate Type**:
   - Simple organics (acetate): 80-95%
   - Complex organics: 40-70%
   - Wastewaters: 20-50%

3. **System Design**:
   - Single chamber: 40-70%
   - Dual chamber: 50-80%
   - Optimized configurations: 70-90%

### Secondary Factors

1. **pH**:
   - Optimal pH (6.5-7.5): Maximum efficiency
   - Acidic conditions favor fermentation
   - Basic conditions reduce proton availability

2. **Temperature**:
   - Optimal temperature: Peak efficiency
   - Low temperature: Reduced kinetics
   - High temperature: Increased competing processes

## Performance Impact

**Formula**: ηF = (8 × I × t)/(F × COD × V) × 100%

Where: I = current (A), t = time (s), F = Faraday constant, COD = chemical
oxygen demand (g/L), V = volume (L)

High faradaic efficiency indicates effective substrate-to-electricity
conversion. Systems with >70% efficiency typically demonstrate stable long-term
performance and high power output sustainability.

## Validation Rules

1. **Range validation**: 0 - 100 %
2. **Unit consistency**: Express as percentage
3. **Correlation checks**: Should correlate with current density
4. **Outlier detection**: >95% requires verification of calculation
5. **Physical plausibility**: Cannot exceed 100%

## References

1. **Logan, B.E., et al.** (2006). "Electricity generation from cysteine in a
   microbial fuel cell". _Water Research_, 40(14), 2799-2808.
   - Detailed faradaic efficiency calculations and optimization

2. **Liu, H. & Logan, B.E.** (2004). "Electricity generation using an
   air-cathode single chamber microbial fuel cell". _Environmental Science &
   Technology_, 38(14), 4040-4046.
   - Efficiency improvements through system design

3. **Rabaey, K., et al.** (2003). "A microbial fuel cell capable of converting
   glucose to electricity at high rate and efficiency". _Biotechnology Letters_,
   25(18), 1531-1535.
   - Achievement of high faradaic efficiency in optimized systems

## Application Notes

**Laboratory Scale**:

- Use for system optimization and troubleshooting
- Monitor efficiency during startup and operation
- Compare different electrode materials and configurations

**Pilot Scale**:

- Implement continuous efficiency monitoring
- Optimize operating conditions for maximum efficiency
- Balance efficiency with power output

**Commercial Scale**:

- Design for consistent high efficiency operation
- Monitor efficiency as key performance indicator
- Implement control strategies to maintain optimal efficiency
