<!--
Parameter ID: corrosivity
Category: chemical
Generated: 2025-01-16T12:03:00.000Z
-->

# Corrosivity

## Definition

Corrosivity quantifies the tendency of electrolyte solutions to cause
electrochemical corrosion of metal components in microbial electrochemical
systems. This parameter affects material selection, system longevity, and
maintenance requirements. Understanding corrosivity is crucial for designing
durable systems and preventing premature component failure.

## Typical Values

- **Range**: 0.1 - 100 mm/year
- **Typical**: 0.5 - 10 mm/year
- **Optimal**: <2 mm/year

**Performance Categories**:

- **Low Performance**: >20 mm/year (highly corrosive, rapid degradation)
- **Moderate Performance**: 5 - 20 mm/year (moderately corrosive)
- **High Performance**: 1 - 5 mm/year (mildly corrosive)
- **Exceptional Performance**: <1 mm/year (minimally corrosive)

## Measurement Methods

### Direct Measurement

1. **Weight Loss Method**:

   - Expose metal coupons to electrolyte
   - Measure weight loss over time
   - Calculate corrosion rate: CR = 87.6 × W/(D × A × T)
   - Where W = weight loss (mg), D = density (g/cm³), A = area (cm²), T = time
     (h)

2. **Linear Polarization Resistance**:

   - Apply small potential perturbation
   - Measure current response
   - Calculate: CR = B/(Rp × ρ)
   - Faster than weight loss method

3. **Electrochemical Impedance Spectroscopy**:
   - Apply AC voltage across frequency range
   - Extract charge transfer resistance
   - Calculate corrosion current and rate
   - Provides mechanistic information

### Calculation Considerations

- Temperature correction: Rate doubles per 10°C typically
- Account for galvanic effects between different metals
- Consider crevice and pitting corrosion modes

## Affecting Factors

### Primary Factors

1. **Electrolyte Composition**:

   - Chloride concentration: Increases corrosivity
   - pH: Low pH increases corrosion rate
   - Dissolved oxygen: Promotes cathodic reactions
   - Conductivity: Higher conductivity increases corrosion

2. **Environmental Conditions**:

   - Temperature: Higher temperature increases corrosion
   - Flow velocity: Can increase or decrease corrosion
   - Pressure: Generally minimal effect
   - Biofilm presence: Can inhibit or accelerate corrosion

3. **Material Properties**:
   - Alloy composition: Affects corrosion resistance
   - Surface finish: Smoother surfaces less prone to corrosion
   - Stress levels: Stress corrosion cracking possible
   - Protective coatings: Reduce corrosion rates

### Secondary Factors

1. **Biological Activity**:

   - Microbiologically influenced corrosion (MIC)
   - pH changes from microbial metabolism
   - Biofilm protective effects
   - Biogenic acid production

2. **System Design**:
   - Galvanic coupling between dissimilar metals
   - Crevice formation and stagnant areas
   - Cathodic protection effectiveness
   - Ventilation and moisture control

## Performance Impact

**Formula**: Corrosion Rate = K × i_corr / (n × ρ)

Where K = constant, i_corr = corrosion current density, n = electrons per metal
atom, ρ = metal density. High corrosivity (>10 mm/year) leads to rapid component
failure and increased maintenance costs. Low corrosivity (<2 mm/year) enables
long-term system operation.

## Validation Rules

1. **Range validation**: 0.001 - 1000 mm/year
2. **Unit consistency**: Express in mm/year (millimeters per year)
3. **Correlation checks**: Should correlate with chloride content and pH
4. **Outlier detection**: Rates >100 mm/year unusual for most environments
5. **Physical plausibility**: Limited by metal properties and environment

## References

1. **Fontana, M.G. & Greene, N.D.** (1986). "Corrosion Engineering, 3rd
   Edition". McGraw-Hill, New York.

   - Comprehensive corrosion theory and measurement

2. **Videla, H.A.** (1996). "Manual of Biocorrosion". CRC Press, Boca Raton, FL.

   - Microbiologically influenced corrosion

3. **Logan, B.E.** (2008). "Microbial fuel cells". John Wiley & Sons, Hoboken,
   NJ.
   - Material considerations in bioelectrochemical systems

## Application Notes

**Laboratory Scale**:

- Use standard reference electrodes for measurements
- Control environment for reproducible corrosion testing
- Screen materials for corrosion resistance

**Pilot Scale**:

- Implement corrosion monitoring systems
- Use corrosion-resistant materials in critical components
- Plan maintenance based on corrosion rates

**Commercial Scale**:

- Design for acceptable corrosion rates over system lifetime
- Implement cathodic protection where appropriate
- Use economic analysis to balance material costs vs replacement
