<!--
Parameter ID: h2_purity
Category: performance
Generated: 2025-01-16T12:43:00.000Z
-->

# Hydrogen Purity

## Definition

Hydrogen purity quantifies the concentration of hydrogen gas in the product
stream from microbial electrolysis cells (MECs) and other hydrogen-producing
bioelectrochemical systems. This parameter is critical for downstream
applications, storage requirements, and economic value of the hydrogen product.
Higher purity reduces purification costs and improves application compatibility.

## Typical Values

- **Range**: 30 - 99.9%
- **Typical**: 60 - 95%
- **Optimal**: 90 - 99%

**Performance Categories**:

- **Low Performance**: <60% (poor purity, requires significant purification)
- **Moderate Performance**: 60 - 80% (moderate purity)
- **High Performance**: 80 - 95% (good purity)
- **Exceptional Performance**: >95% (excellent purity)

## Measurement Methods

### Direct Measurement

1. **Gas Chromatography (GC)**:
   - Separate H₂ from other gases using thermal conductivity detector
   - High accuracy and precision for composition analysis
   - Can identify and quantify impurities
   - Standard method for gas purity analysis

2. **Mass Spectrometry**:
   - Direct molecular identification and quantification
   - High sensitivity for trace impurities
   - Real-time monitoring capability
   - Expensive but very accurate

3. **Thermal Conductivity Analysis**:
   - Measure thermal conductivity of gas mixture
   - Compare to known standards
   - Suitable for binary mixtures (H₂/CO₂)
   - Less expensive than GC/MS

### Calculation Considerations

- Purity = (Volume H₂) / (Total Gas Volume) × 100%
- Account for water vapor content
- Consider temperature and pressure effects
- Correct for instrument response factors

## Affecting Factors

### Primary Factors

1. **Operating Conditions**:
   - Applied voltage affects gas evolution rates
   - pH influences competing reactions
   - Temperature affects gas solubility and reaction rates
   - Current density affects H₂ evolution efficiency

2. **System Design**:
   - Electrode materials affect selectivity
   - Gas separation efficiency affects purity
   - Membrane properties influence gas crossover
   - Reactor design affects gas collection

3. **Biological Activity**:
   - Methanogenic activity produces CH₄ impurity
   - CO₂ production from metabolism dilutes H₂
   - Hydrogenase activity can consume produced H₂
   - pH changes affect gas solubility

### Secondary Factors

1. **Feed Composition**:
   - Bicarbonate content affects CO₂ production
   - Organic acids affect pH and gas production
   - Sulfate presence can produce H₂S impurity
   - Nitrogen content affects purge gas requirements

2. **Gas Collection System**:
   - Collection efficiency affects apparent purity
   - Headspace composition affects measurements
   - Purge gas dilution affects purity
   - Sampling location affects representative measurement

## Performance Impact

High hydrogen purity (>90%) enables direct use in fuel cells and reduces
purification costs for industrial applications. Low purity (<70%) requires
expensive separation processes and limits application options, reducing the
economic value of the hydrogen product.

## Validation Rules

1. **Range validation**: 10 - 100%
2. **Unit consistency**: Express as percentage (vol% or mol%)
3. **Correlation checks**: Should correlate with operating conditions
4. **Outlier detection**: >99.5% exceptional without purification
5. **Physical plausibility**: Must account for all gas production sources

## References

1. **Rozendal, R.A., et al.** (2006). "Hydrogen production with a microbial
   biocathode". _Environmental Science & Technology_, 40(17), 5206-5211.
   - Hydrogen production and purity in bioelectrochemical systems

2. **Call, D. & Logan, B.E.** (2008). "Hydrogen production in a single chamber
   microbial electrolysis cell lacking a membrane". _Environmental Science &
   Technology_, 42(9), 3401-3406.
   - Factors affecting hydrogen purity in MECs

3. **Escapa, A., et al.** (2012). "Microbial electrolysis cells: what we have
   learned and where we are heading". _Environmental Science & Technology_,
   46(24), 13564-13574.
   - Review of hydrogen production and purification in bioelectrochemical
     systems

## Application Notes

**Laboratory Scale**:

- Monitor hydrogen purity for system characterization
- Study factors affecting gas composition
- Optimize conditions for maximum purity

**Pilot Scale**:

- Implement purity monitoring for process control
- Validate purity requirements for downstream applications
- Design gas separation and purification systems

**Commercial Scale**:

- Design for target hydrogen purity requirements
- Implement automated purity monitoring and control
- Balance purity with production rate and costs
