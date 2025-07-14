// Test data fixtures for consistent testing

export const researchPaperFixtures = {
  mfcPaper: {
    id: 'paper-mfc-1',
    title: 'Microbial Fuel Cell Performance Enhancement through Novel Electrode Design',
    authors: ['Dr. Sarah Chen', 'Dr. Michael Johnson', 'Dr. Lisa Wang'],
    journal: 'Bioelectrochemistry',
    year: 2024,
    doi: '10.1016/j.bioelechem.2024.108256',
    abstract:
      'This paper presents a comprehensive study on enhancing microbial fuel cell performance through innovative electrode design strategies...',
    keywords: ['microbial fuel cell', 'electrode design', 'bioelectrochemistry', 'power density'],
    citationCount: 23,
    performanceMetrics: {
      powerDensity: 2.1, // W/m²
      currentDensity: 5.2, // A/m²
      voltage: 0.65, // V
      efficiency: 0.78,
    },
    extractedData: {
      electrodeType: 'carbon-fiber-brush',
      substrateType: 'acetate',
      operatingTemperature: 30, // °C
      pH: 7.0,
    },
  },

  mecPaper: {
    id: 'paper-mec-1',
    title: 'Hydrogen Production Optimization in Microbial Electrolysis Cells',
    authors: ['Dr. James Rodriguez', 'Dr. Anna Petrov'],
    journal: 'International Journal of Hydrogen Energy',
    year: 2023,
    doi: '10.1016/j.ijhydene.2023.045123',
    abstract:
      'Optimization strategies for hydrogen production in microbial electrolysis cells are investigated...',
    keywords: ['microbial electrolysis cell', 'hydrogen production', 'bioelectrochemistry'],
    citationCount: 31,
    performanceMetrics: {
      hydrogenProductionRate: 1.8, // m³/m³/day
      energyEfficiency: 0.82,
      currentDensity: 4.1, // A/m²
      appliedVoltage: 0.9, // V
    },
  },
};

export const experimentFixtures = {
  mfcExperiment: {
    id: 'exp-mfc-1',
    name: 'MFC Performance Baseline Test',
    description: 'Baseline performance testing of single-chamber MFC with standard configuration',
    type: 'performance_test',
    status: 'completed',
    createdBy: 'test-user-1',
    startDate: '2025-01-15T09:00:00.000Z',
    endDate: '2025-01-22T09:00:00.000Z',
    configuration: {
      reactor: {
        type: 'single-chamber',
        volume: 0.15, // L
        material: 'plexiglass',
      },
      electrodes: {
        anode: {
          material: 'carbon-cloth',
          surfaceArea: 12, // cm²
          placement: 'bottom',
        },
        cathode: {
          material: 'carbon-cloth-pt',
          surfaceArea: 10, // cm²
          placement: 'top',
        },
      },
      separator: null, // single chamber
      inoculum: {
        source: 'wastewater',
        volume: 0.1, // L
        acclimatization: 14, // days
      },
      substrate: {
        type: 'acetate',
        concentration: 1000, // mg/L
        feeding: 'batch',
      },
    },
    measurements: [
      {
        timestamp: '2025-01-15T10:00:00.000Z',
        voltage: 0.45,
        current: 0.012,
        power: 0.0054,
        temperature: 25.2,
        pH: 7.1,
      },
      {
        timestamp: '2025-01-16T10:00:00.000Z',
        voltage: 0.52,
        current: 0.018,
        power: 0.0094,
        temperature: 25.1,
        pH: 7.0,
      },
    ],
    results: {
      maxPowerDensity: 1.8, // W/m²
      maxCurrentDensity: 4.2, // A/m²
      maxVoltage: 0.68, // V
      totalEnergyGenerated: 0.24, // Wh
      coulombicEfficiency: 0.73,
      organicRemovalEfficiency: 0.86,
    },
  },
};

export const materialFixtures = {
  carbonCloth: {
    id: 'mat-cc-1',
    name: 'Carbon Cloth',
    type: 'electrode',
    category: 'carbon-based',
    properties: {
      conductivity: 0.5, // S/cm
      surfaceArea: 0.9, // m²/g
      porosity: 0.85,
      cost: 15.5, // $/m²
      biocompatibility: 'high',
    },
    specifications: {
      thickness: 0.4, // mm
      density: 0.45, // g/cm³
      tensileStrength: 120, // MPa
    },
    performance: {
      powerDensity: 1.5, // W/m² (typical)
      stability: 'excellent',
      lifespan: 365, // days
    },
  },

  platinumCarbon: {
    id: 'mat-ptc-1',
    name: 'Platinum on Carbon',
    type: 'catalyst',
    category: 'precious-metal',
    properties: {
      conductivity: 2.1, // S/cm
      surfaceArea: 150, // m²/g
      porosity: 0.65,
      cost: 180.0, // $/g
      catalyticActivity: 'very-high',
    },
    specifications: {
      platinumLoading: 0.5, // mg/cm²
      carbonSupport: 'vulcan-xc72',
      particleSize: 3.2, // nm
    },
    performance: {
      exchangeCurrentDensity: 0.8, // mA/cm²
      stability: 'good',
      lifespan: 180, // days
    },
  },
};

export const userFixtures = {
  researcher: {
    id: 'user-researcher-1',
    email: 'researcher@messai.ai',
    name: 'Dr. Emily Research',
    role: 'researcher',
    institution: 'University of Bioelectrochemistry',
    department: 'Environmental Engineering',
    experience: 'advanced',
    specialization: ['microbial-fuel-cells', 'bioelectrochemistry'],
    preferences: {
      units: 'metric',
      theme: 'light',
      notifications: true,
    },
  },

  student: {
    id: 'user-student-1',
    email: 'student@university.edu',
    name: 'Alex Student',
    role: 'student',
    institution: 'State University',
    department: 'Chemical Engineering',
    experience: 'beginner',
    specialization: ['learning'],
    preferences: {
      units: 'metric',
      theme: 'dark',
      notifications: true,
    },
  },
};

export const configurationFixtures = {
  standardMFC: {
    id: 'config-mfc-standard',
    name: 'Standard Single-Chamber MFC',
    type: 'microbial-fuel-cell',
    chamber: 'single',
    volume: 0.1, // L
    electrodes: {
      anode: {
        material: 'carbon-cloth',
        surfaceArea: 10, // cm²
        position: { x: 0, y: 0, z: -5 },
      },
      cathode: {
        material: 'carbon-cloth-pt',
        surfaceArea: 8, // cm²
        position: { x: 0, y: 0, z: 5 },
      },
    },
    separator: null,
    operatingConditions: {
      temperature: 30, // °C
      pH: 7.0,
      substrateFeedRate: 0.1, // mL/min
    },
    predictedPerformance: {
      powerDensity: 1.2, // W/m²
      efficiency: 0.75,
      startupTime: 72, // hours
    },
  },
};

// Factory functions for creating test data
export const createTestPaper = (
  overrides: Partial<typeof researchPaperFixtures.mfcPaper> = {}
) => ({
  ...researchPaperFixtures.mfcPaper,
  ...overrides,
});

export const createTestExperiment = (
  overrides: Partial<typeof experimentFixtures.mfcExperiment> = {}
) => ({
  ...experimentFixtures.mfcExperiment,
  ...overrides,
});

export const createTestUser = (overrides: Partial<typeof userFixtures.researcher> = {}) => ({
  ...userFixtures.researcher,
  ...overrides,
});
