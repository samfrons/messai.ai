<!--
Parameter ID: c_n_ratio
Category: chemical
Generated: 2025-01-16T12:00:00.000Z
-->

# Carbon to Nitrogen Ratio (C:N Ratio)

## Definition

The carbon to nitrogen ratio (C:N ratio) quantifies the relative amounts of
carbon and nitrogen in substrate materials used in microbial electrochemical
systems. This parameter affects microbial growth, biofilm development, and
system performance by controlling nutrient balance and metabolic pathways.
Optimal C:N ratios promote balanced microbial communities and efficient
substrate utilization.

## Typical Values

- **Range**: 5:1 - 50:1
- **Typical**: 10:1 - 30:1
- **Optimal**: 15:1 - 25:1

**Performance Categories**:

- **Low Performance**: <10:1 or >40:1 (imbalanced nutrition)
- **Moderate Performance**: 10:1 - 15:1 or 30:1 - 40:1 (suboptimal balance)
- **High Performance**: 15:1 - 25:1 (balanced nutrition)
- **Exceptional Performance**: 20:1 - 25:1 (optimal microbial growth)

## Measurement Methods

### Direct Measurement

1. **Elemental Analysis**:
   - Total organic carbon (TOC) analysis
   - Total nitrogen (TN) analysis
   - Calculate ratio: C:N = TOC/TN
   - Express as mass ratio

2. **Chemical Oxygen Demand**:
   - COD measurement for carbon content estimation
   - Kjeldahl nitrogen for total nitrogen
   - Correlation with direct carbon measurement
   - Useful for complex substrates

### Calculation Considerations

- Use mass-based ratios (g C : g N)
- Account for inorganic nitrogen forms
- Consider bioavailable vs total carbon and nitrogen

## Affecting Factors

### Primary Factors

1. **Substrate Type**:
   - Carbohydrates: High C:N ratio (>30:1)
   - Proteins: Low C:N ratio (3:1 - 6:1)
   - Mixed organic waste: Variable ratios (10:1 - 25:1)
   - Synthetic media: Controlled ratios

2. **Substrate Composition**:
   - Cellulose content: Increases C:N ratio
   - Protein content: Decreases C:N ratio
   - Lipid content: Increases C:N ratio
   - Nitrogen additives: Decrease C:N ratio

3. **Processing History**:
   - Pre-treatment: Can alter C:N ratio
   - Fermentation: Changes carbon availability
   - Composting: Reduces C:N ratio over time

### Secondary Factors

1. **Analytical Methods**:
   - Different methods give different results
   - Bioavailable vs total content
   - Sample preparation effects

2. **Environmental Conditions**:
   - pH affects nitrogen speciation
   - Temperature affects volatilization
   - Oxidation state affects carbon forms

## Performance Impact

**Formula**: Optimal growth when C:N = 20-25:1

C:N ratio affects microbial growth rate, biofilm formation, and metabolic
efficiency. Too high ratios (>30:1) lead to nitrogen limitation; too low ratios
(<10:1) cause carbon limitation and potential ammonia toxicity. Optimal ratios
(20-25:1) maximize biomass yield and power output.

## Validation Rules

1. **Range validation**: 1:1 - 100:1
2. **Unit consistency**: Express as dimensionless ratio (mass:mass)
3. **Correlation checks**: Should correlate with substrate type
4. **Outlier detection**: Ratios >50:1 or <5:1 require verification
5. **Physical plausibility**: Limited by biological material composition

## References

1. **Logan, B.E.** (2008). "Microbial fuel cells". John Wiley & Sons, Hoboken,
   NJ.
   - Substrate composition effects on performance

2. **Pham, T.H., et al.** (2006). "A novel electrochemically active and
   Fe(III)-reducing bacterium phylogenetically related to Aeromonas hydrophila,
   isolated from a microbial fuel cell". _FEMS Microbiology Letters_, 223(1),
   129-136.
   - Nutrient requirements for electroactive bacteria

3. **Cheng, S., et al.** (2006). "Increased performance of single-chamber
   microbial fuel cells using an improved cathode structure". _Electrochemistry
   Communications_, 8(3), 489-494.
   - C:N ratio optimization in MFC systems

## Application Notes

**Laboratory Scale**:

- Control C:N ratio for reproducible experiments
- Use synthetic media for precise ratio control
- Monitor ratio changes during operation

**Pilot Scale**:

- Adjust C:N ratio through substrate blending
- Monitor ratio in feed streams
- Account for ratio variability in real substrates

**Commercial Scale**:

- Optimize C:N ratio for feedstock mixtures
- Implement nitrogen supplementation if needed
- Design for substrate ratio consistency
