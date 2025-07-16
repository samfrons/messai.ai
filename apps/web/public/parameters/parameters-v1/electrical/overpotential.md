<!--
Parameter ID: overpotential
Category: electrical
Generated: 2025-01-16T10:47:00.000Z
-->

# Overpotential

## Definition

Overpotential (η) represents the additional voltage required above the
thermodynamic equilibrium potential to drive an electrochemical reaction at a
specific current density in microbial electrochemical systems. This parameter
quantifies the kinetic losses and energy inefficiencies in the system. Lower
overpotentials indicate more efficient electrode reactions and higher overall
system performance.

## Typical Values

- **Range**: 10 - 1000 mV
- **Typical**: 100 - 400 mV
- **Optimal**: 50 - 200 mV

**Performance Categories**:

- **Low Performance**: >500 mV (high kinetic losses)
- **Moderate Performance**: 300 - 500 mV (moderate losses)
- **High Performance**: 100 - 300 mV (efficient kinetics)
- **Exceptional Performance**: <100 mV (very efficient)

## Measurement Methods

### Direct Measurement

1. **Polarization Curves**:

   - Measure cell voltage vs current density
   - Compare to theoretical cell potential
   - Calculate: η = Etheoretical - Emeasured
   - Separate anode and cathode contributions

2. **Three-Electrode Setup**:
   - Individual electrode potential measurement
   - Reference electrode (Ag/AgCl or SCE)
   - Calculate overpotential vs reference
   - Identify limiting electrode

### Calculation Considerations

- Account for ohmic losses (iR drop)
- Separate activation, concentration, and ohmic overpotentials
- Use IR compensation for accurate kinetic measurements

## Affecting Factors

### Primary Factors

1. **Current Density**:

   - Tafel relationship: η = a + b×log(i)
   - Higher current requires higher overpotential
   - Exponential increase at limiting currents

2. **Electrode Material**:

   - Platinum: Low overpotential (50-150 mV)
   - Carbon: Moderate overpotential (200-400 mV)
   - Stainless steel: High overpotential (400-800 mV)

3. **Biofilm Properties**:
   - Thick biofilms: Higher mass transfer overpotential
   - Conductive biofilms: Lower charge transfer overpotential
   - Biofilm composition affects overall losses

### Secondary Factors

1. **Temperature**:

   - Higher temperature: Lower activation overpotential
   - Arrhenius relationship for kinetic processes
   - Improved mass transfer at higher T

2. **pH**:
   - Affects equilibrium potentials
   - Proton availability influences cathode overpotential
   - Optimal pH minimizes total overpotential

## Performance Impact

**Formula**: η = ηactivation + ηconcentration + ηohmic

Overpotential directly reduces cell voltage and power output. Each 100 mV
reduction in overpotential can increase power density by 20-40%. Systems
maintaining <200 mV total overpotential at practical current densities achieve
superior performance and efficiency.

## Validation Rules

1. **Range validation**: 0 - 2000 mV
2. **Unit consistency**: Express in mV (millivolts)
3. **Correlation checks**: Should increase with current density
4. **Outlier detection**: <10 mV unusual, >1000 mV indicates problems
5. **Physical plausibility**: Cannot exceed applied cell voltage

## References

1. **Logan, B.E.** (2008). "Microbial fuel cells". John Wiley & Sons, Hoboken,
   NJ.

   - Comprehensive treatment of overpotential in MFCs

2. **Fan, Y., et al.** (2007). "Improved cathode materials for microbial fuel
   cells". _Environmental Science & Technology_, 41(8), 2900-2906.

   - Cathode overpotential reduction strategies

3. **Torres, C.I., et al.** (2008). "Kinetic experiments for evaluating the
   Nernst-Monod model for anode-respiring bacteria". _Environmental Science &
   Technology_, 42(17), 6593-6597.
   - Detailed analysis of anode overpotentials

## Application Notes

**Laboratory Scale**:

- Use for electrode material evaluation
- Monitor overpotential changes during operation
- Optimize operating conditions to minimize losses

**Pilot Scale**:

- Design systems for low overpotential operation
- Monitor as key performance indicator
- Identify limiting processes for improvement

**Commercial Scale**:

- Focus on materials and designs minimizing overpotential
- Implement control strategies for optimal operation
- Balance overpotential with cost considerations
