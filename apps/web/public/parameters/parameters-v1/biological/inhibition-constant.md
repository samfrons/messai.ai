<!--
Parameter ID: inhibition_constant
Category: biological
Generated: 2025-01-16T11:05:00.000Z
-->

# Inhibition Constant

## Definition

Inhibition constant (Ki) quantifies the substrate concentration at which
microbial growth or substrate utilization becomes inhibited by substrate
toxicity in microbial electrochemical systems. This parameter describes the
threshold above which increasing substrate concentration reduces rather than
enhances microbial activity. Understanding Ki is crucial for preventing
substrate overloading and maintaining optimal system performance.

## Typical Values

- **Range**: 0.5 - 50 g/L
- **Typical**: 2 - 20 g/L
- **Optimal**: 5 - 15 g/L (for most organics)

**Performance Categories**:

- **Low Performance**: <1 g/L (highly sensitive to substrate)
- **Moderate Performance**: 1 - 5 g/L (moderate sensitivity)
- **High Performance**: 5 - 20 g/L (good tolerance)
- **Exceptional Performance**: >20 g/L (high tolerance)

## Measurement Methods

### Direct Measurement

1. **Substrate Inhibition Studies**:

   - Test growth at various substrate concentrations
   - Identify concentration causing 50% inhibition
   - Fit data to Haldane model: μ = μmax×S/(Ks + S + S²/Ki)
   - Use multiple substrate levels above optimum

2. **Respirometry Studies**:
   - Measure oxygen uptake at different substrate levels
   - Identify inhibitory concentrations
   - Calculate Ki from oxygen uptake inhibition
   - More rapid than growth studies

### Calculation Considerations

- Use non-linear regression for parameter estimation
- Account for lag times at high concentrations
- Consider metabolite accumulation effects

## Affecting Factors

### Primary Factors

1. **Substrate Type**:

   - Simple organics (glucose): Ki = 10-50 g/L
   - Fatty acids: Ki = 2-10 g/L
   - Alcohols: Ki = 5-20 g/L
   - Toxic organics: Ki = 0.1-5 g/L

2. **Microbial Species**:

   - Adapted organisms: Higher Ki values
   - Sensitive species: Lower Ki values
   - Mixed cultures: Variable inhibition patterns

3. **Environmental Conditions**:
   - pH stress: Lower Ki values
   - Temperature stress: Reduced tolerance
   - Optimal conditions: Higher Ki values

### Secondary Factors

1. **Adaptation State**:

   - Acclimated cultures: 2-5× higher Ki
   - Unadapted cultures: Lower tolerance
   - Gradual exposure increases Ki

2. **Growth Phase**:
   - Exponential phase: Higher tolerance
   - Stationary phase: Lower tolerance
   - Stressed cells: Reduced Ki values

## Performance Impact

**Formula**: μ = μmax×S/(Ks + S + S²/Ki)

Operating below Ki ensures optimal microbial activity. Systems operating at S >
Ki experience reduced efficiency and potential process failure. Maintaining
substrate concentrations at 0.2-0.5×Ki typically ensures stable, efficient
operation.

## Validation Rules

1. **Range validation**: 0.1 - 500 g/L
2. **Unit consistency**: Express in g/L (grams per liter)
3. **Correlation checks**: Should be higher than Ks
4. **Outlier detection**: Ki < Ks indicates measurement error
5. **Physical plausibility**: Must follow Ki > Ks relationship

## References

1. **Haldane, J.B.S.** (1930). "Enzymes". Longmans, Green and Co., London.

   - Original description of substrate inhibition kinetics

2. **Liu, H., et al.** (2005). "Scale-up of membrane-free single-chamber
   microbial fuel cells". _Journal of Power Sources_, 179(1), 274-279.

   - Substrate inhibition in microbial fuel cells

3. **Andrews, J.F.** (1968). "A mathematical model for the continuous culture of
   microorganisms utilizing inhibitory substrates". _Biotechnology and
   Bioengineering_, 10(6), 707-723.
   - Mathematical treatment of substrate inhibition

## Application Notes

**Laboratory Scale**:

- Determine Ki for specific substrates and organisms
- Use for optimal substrate loading design
- Monitor for inhibition symptoms during operation

**Pilot Scale**:

- Design substrate feeding to avoid inhibition
- Implement substrate dilution strategies
- Monitor performance for inhibition effects

**Commercial Scale**:

- Design conservative substrate loading based on Ki
- Implement substrate monitoring and control
- Plan for substrate concentration management
