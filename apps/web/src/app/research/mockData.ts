/**
 * Mock Research Paper Data
 *
 * Comprehensive mock data representing realistic research papers for the MESSAI
 * Research Intelligence System. This data simulates the 3,721+ enhanced papers
 * with extracted performance metrics and AI analysis.
 */

import type { ResearchPaper, ResearchFocus, JournalType } from './types';

/**
 * Sample research papers representing different focus areas and journals
 */
export const mockResearchPapers: ResearchPaper[] = [
  {
    id: 'paper-001',
    title:
      'Enhanced Performance of Microbial Fuel Cells Through Novel Graphene-Based Electrode Design',
    authors: [
      {
        name: 'Dr. Sarah Chen',
        affiliation: 'MIT Department of Chemical Engineering',
        isCorresponding: true,
        orcid: '0000-0002-1234-5678',
      },
      {
        name: 'Prof. Michael Rodriguez',
        affiliation: 'Stanford University',
        orcid: '0000-0003-2345-6789',
      },
      {
        name: 'Dr. Emily Watson',
        affiliation: 'MIT Department of Chemical Engineering',
      },
    ],
    journal: {
      name: 'Energy & Environmental Science',
      type: 'Energy',
      impactFactor: 38.5,
      issn: '1754-5706',
      publisher: 'Royal Society of Chemistry',
    },
    year: 2024,
    researchFocus: ['MFC', 'Electrode Design', 'Materials Science'],
    abstract:
      'This study presents a novel graphene-based electrode design that significantly enhances the performance of microbial fuel cells (MFCs). By incorporating nitrogen-doped graphene nanosheets with optimized surface functionalization, we achieved unprecedented power densities while maintaining long-term stability. The electrode demonstrated superior biocompatibility with Shewanella oneidensis, resulting in enhanced electron transfer kinetics and improved biofilm formation. Our results show a 340% increase in maximum power density compared to conventional carbon cloth electrodes, reaching 4,250 mW/m². Additionally, the coulombic efficiency improved to 89.3%, with stable performance over 180 days of continuous operation.',
    methodology: [
      'Nitrogen-doped graphene synthesis',
      'Surface functionalization optimization',
      'Biofilm characterization',
      'Electrochemical impedance spectroscopy',
      'Long-term stability testing',
    ],
    performanceMetrics: {
      maxPowerDensity: 4250,
      currentDensity: 8500,
      openCircuitVoltage: 0.78,
      coulombicEfficiency: 89.3,
      energyRecoveryEfficiency: 12.4,
      lifespanDays: 180,
      costPerKwh: 0.085,
    },
    citation: {
      doi: '10.1039/D4EE00123K',
      citationCount: 47,
      hIndex: 12,
    },
    keywords: [
      'microbial fuel cell',
      'graphene electrode',
      'nitrogen doping',
      'biofilm engineering',
      'electron transfer',
      'power density',
      'Shewanella oneidensis',
    ],
    aiEnhanced: true,
    aiConfidenceScore: 0.94,
    publishedDate: new Date('2024-03-15'),
    addedToDatabase: new Date('2024-03-20'),
    qualityScore: 9.2,
    relatedPapers: ['paper-015', 'paper-032', 'paper-048'],
    fullTextAvailable: true,
    externalLinks: {
      pdfUrl: 'https://example.com/papers/paper-001.pdf',
      publisherUrl: 'https://pubs.rsc.org/en/content/articlelanding/2024/ee/d4ee00123k',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/38234567',
    },
  },
  {
    id: 'paper-002',
    title:
      'Sustainable Wastewater Treatment Using Microbial Electrolysis Cells: A Techno-Economic Analysis',
    authors: [
      {
        name: 'Dr. James Thompson',
        affiliation: 'University of California, Berkeley',
        isCorresponding: true,
      },
      {
        name: 'Dr. Lisa Park',
        affiliation: 'Lawrence Berkeley National Laboratory',
      },
      {
        name: 'Prof. David Kim',
        affiliation: 'Seoul National University',
      },
    ],
    journal: {
      name: 'Water Research',
      type: 'Environmental',
      impactFactor: 12.8,
      issn: '0043-1354',
      publisher: 'Elsevier',
    },
    year: 2023,
    researchFocus: ['MEC', 'Economic Analysis', 'Environmental Impact'],
    abstract:
      'This comprehensive study evaluates the techno-economic feasibility of implementing microbial electrolysis cells (MECs) for municipal wastewater treatment. Through pilot-scale testing and detailed economic modeling, we demonstrate the potential for MECs to achieve both effective organic matter removal and hydrogen production. Our analysis reveals that MECs can achieve 92% COD removal efficiency while producing 1.2 m³ H₂/m³ wastewater treated. The break-even point for MEC technology is reached at treatment capacities above 10,000 m³/day, with estimated operational costs 15% lower than conventional activated sludge processes when accounting for hydrogen revenue.',
    methodology: [
      'Pilot-scale MEC operation',
      'Life cycle assessment',
      'Techno-economic modeling',
      'Sensitivity analysis',
      'Market price analysis',
    ],
    performanceMetrics: {
      treatmentEfficiency: 92.0,
      energyRecoveryEfficiency: 76.8,
      costPerKwh: 0.067,
      lifespanDays: 365,
    },
    citation: {
      doi: '10.1016/j.watres.2023.119823',
      citationCount: 89,
      hIndex: 18,
    },
    keywords: [
      'microbial electrolysis cell',
      'wastewater treatment',
      'hydrogen production',
      'techno-economic analysis',
      'sustainability',
      'COD removal',
      'life cycle assessment',
    ],
    aiEnhanced: true,
    aiConfidenceScore: 0.91,
    publishedDate: new Date('2023-09-22'),
    addedToDatabase: new Date('2023-09-25'),
    qualityScore: 8.8,
    relatedPapers: ['paper-007', 'paper-019', 'paper-041'],
    fullTextAvailable: true,
    externalLinks: {
      pdfUrl: 'https://example.com/papers/paper-002.pdf',
      publisherUrl: 'https://www.sciencedirect.com/science/article/pii/S0043135423008234',
    },
  },
  {
    id: 'paper-003',
    title:
      'Biofilm Engineering in Microbial Desalination Cells: Optimizing Salt Removal and Power Generation',
    authors: [
      {
        name: 'Dr. Maria Gonzalez',
        affiliation: 'Technical University of Denmark',
        isCorresponding: true,
        orcid: '0000-0001-3456-7890',
      },
      {
        name: 'Dr. Ahmed Hassan',
        affiliation: 'King Abdullah University of Science and Technology',
      },
    ],
    journal: {
      name: 'Desalination',
      type: 'Environmental',
      impactFactor: 10.2,
      issn: '0011-9164',
      publisher: 'Elsevier',
    },
    year: 2024,
    researchFocus: ['MDC', 'Biofilm Engineering', 'Performance Optimization'],
    abstract:
      'Microbial desalination cells (MDCs) represent a promising technology for simultaneous water desalination and electricity generation. This study focuses on optimizing biofilm architecture and microbial community composition to enhance both salt removal efficiency and power output. Through systematic biofilm engineering using electroactive bacteria consortia, we achieved 85% salt removal from synthetic seawater while generating power densities of 2,180 mW/m². The engineered biofilm exhibited exceptional stability and resistance to salt stress, maintaining performance over 120 days of continuous operation.',
    methodology: [
      'Biofilm architecture optimization',
      'Microbial community analysis',
      'Electrochemical characterization',
      'Salt stress testing',
      'Performance monitoring',
    ],
    performanceMetrics: {
      maxPowerDensity: 2180,
      currentDensity: 4200,
      openCircuitVoltage: 0.65,
      coulombicEfficiency: 78.5,
      treatmentEfficiency: 85.0,
      lifespanDays: 120,
    },
    citation: {
      doi: '10.1016/j.desal.2024.117234',
      citationCount: 23,
      hIndex: 8,
    },
    keywords: [
      'microbial desalination cell',
      'biofilm engineering',
      'salt removal',
      'electroactive bacteria',
      'power generation',
      'seawater desalination',
    ],
    aiEnhanced: true,
    aiConfidenceScore: 0.88,
    publishedDate: new Date('2024-01-10'),
    addedToDatabase: new Date('2024-01-15'),
    qualityScore: 8.4,
    relatedPapers: ['paper-009', 'paper-026', 'paper-053'],
    fullTextAvailable: false,
    externalLinks: {
      publisherUrl: 'https://www.sciencedirect.com/science/article/pii/S0011916424001234',
    },
  },
  {
    id: 'paper-004',
    title:
      'Advanced Proton Exchange Membrane Materials for High-Temperature Fuel Cell Applications',
    authors: [
      {
        name: 'Prof. Robert Anderson',
        affiliation: 'University of Tokyo',
        isCorresponding: true,
      },
      {
        name: 'Dr. Yuki Tanaka',
        affiliation: 'Toyota Central R&D Labs',
      },
      {
        name: 'Dr. Hans Mueller',
        affiliation: 'Max Planck Institute for Polymer Research',
      },
    ],
    journal: {
      name: 'Journal of Power Sources',
      type: 'Energy',
      impactFactor: 9.7,
      issn: '0378-7753',
      publisher: 'Elsevier',
    },
    year: 2023,
    researchFocus: ['PEM', 'Materials Science', 'Performance Optimization'],
    abstract:
      'This research presents novel sulfonated poly(ether ether ketone) (SPEEK) membranes modified with ionic liquid additives for high-temperature proton exchange membrane fuel cells (PEMFCs). The modified membranes demonstrate superior proton conductivity and thermal stability at operating temperatures up to 180°C. Through molecular dynamics simulations and experimental validation, we show that the ionic liquid creates additional proton conduction pathways while maintaining membrane integrity under harsh operating conditions.',
    methodology: [
      'Membrane synthesis and modification',
      'Molecular dynamics simulations',
      'High-temperature testing',
      'Proton conductivity measurements',
      'Durability assessment',
    ],
    performanceMetrics: {
      maxPowerDensity: 1850,
      currentDensity: 3200,
      openCircuitVoltage: 0.95,
      energyRecoveryEfficiency: 45.2,
      lifespanDays: 5000,
    },
    citation: {
      doi: '10.1016/j.jpowsour.2023.232876',
      citationCount: 156,
      hIndex: 25,
    },
    keywords: [
      'proton exchange membrane',
      'SPEEK',
      'ionic liquid',
      'high temperature',
      'fuel cell',
      'proton conductivity',
    ],
    aiEnhanced: true,
    aiConfidenceScore: 0.96,
    publishedDate: new Date('2023-07-18'),
    addedToDatabase: new Date('2023-07-20'),
    qualityScore: 9.5,
    relatedPapers: ['paper-012', 'paper-034', 'paper-067'],
    fullTextAvailable: true,
    externalLinks: {
      pdfUrl: 'https://example.com/papers/paper-004.pdf',
      publisherUrl: 'https://www.sciencedirect.com/science/article/pii/S0378775323008765',
    },
  },
  {
    id: 'paper-005',
    title: 'Machine Learning-Assisted Optimization of Solid Oxide Fuel Cell Performance',
    authors: [
      {
        name: 'Dr. Kevin Liu',
        affiliation: 'Georgia Institute of Technology',
        isCorresponding: true,
        orcid: '0000-0004-5678-9012',
      },
      {
        name: 'Dr. Anna Petrov',
        affiliation: 'Russian Academy of Sciences',
      },
      {
        name: 'Prof. John Smith',
        affiliation: 'Imperial College London',
      },
    ],
    journal: {
      name: 'Nature Energy',
      type: 'Energy',
      impactFactor: 67.4,
      issn: '2058-7546',
      publisher: 'Nature Publishing Group',
    },
    year: 2024,
    researchFocus: ['SOFC', 'Performance Optimization', 'Systems Integration'],
    abstract:
      'We present a comprehensive machine learning framework for optimizing solid oxide fuel cell (SOFC) performance through automated materials discovery and operational parameter optimization. Using a combination of neural networks and genetic algorithms, our system identified optimal compositions for SOFC cathode materials that achieve 25% higher power densities than conventional designs. The framework successfully predicted performance metrics with 94% accuracy and reduced development time by 60%.',
    methodology: [
      'Neural network modeling',
      'Genetic algorithm optimization',
      'High-throughput screening',
      'Materials characterization',
      'Performance validation',
    ],
    performanceMetrics: {
      maxPowerDensity: 3420,
      currentDensity: 5800,
      openCircuitVoltage: 1.1,
      energyRecoveryEfficiency: 62.8,
      lifespanDays: 8760,
      costPerKwh: 0.045,
    },
    citation: {
      doi: '10.1038/s41560-024-01456-8',
      citationCount: 234,
      hIndex: 35,
    },
    keywords: [
      'solid oxide fuel cell',
      'machine learning',
      'materials optimization',
      'neural networks',
      'genetic algorithms',
      'cathode materials',
    ],
    aiEnhanced: true,
    aiConfidenceScore: 0.97,
    publishedDate: new Date('2024-02-28'),
    addedToDatabase: new Date('2024-03-01'),
    qualityScore: 9.8,
    relatedPapers: ['paper-018', 'paper-042', 'paper-071'],
    fullTextAvailable: true,
    externalLinks: {
      pdfUrl: 'https://example.com/papers/paper-005.pdf',
      publisherUrl: 'https://www.nature.com/articles/s41560-024-01456-8',
    },
  },
  {
    id: 'paper-006',
    title: 'Cost-Effective Phosphoric Acid Fuel Cell Stack Design for Distributed Power Generation',
    authors: [
      {
        name: 'Dr. Patricia Williams',
        affiliation: 'University of Connecticut',
        isCorresponding: true,
      },
      {
        name: 'Dr. Mark Johnson',
        affiliation: 'FuelCell Energy Inc.',
      },
    ],
    journal: {
      name: 'International Journal of Hydrogen Energy',
      type: 'Energy',
      impactFactor: 7.2,
      issn: '0360-3199',
      publisher: 'Elsevier',
    },
    year: 2023,
    researchFocus: ['PAFC', 'Economic Analysis', 'Systems Integration'],
    abstract:
      'This study presents a novel stack design for phosphoric acid fuel cells (PAFCs) that reduces manufacturing costs by 35% while maintaining performance standards. Through innovative cell interconnect design and optimized thermal management, we achieved power densities of 280 mW/cm² with improved durability. The economic analysis demonstrates commercial viability for distributed power applications with payback periods under 7 years.',
    methodology: [
      'Stack design optimization',
      'Thermal management analysis',
      'Cost modeling',
      'Performance testing',
      'Economic feasibility study',
    ],
    performanceMetrics: {
      maxPowerDensity: 2800,
      currentDensity: 4000,
      openCircuitVoltage: 0.98,
      energyRecoveryEfficiency: 42.5,
      lifespanDays: 3650,
      costPerKwh: 0.095,
    },
    citation: {
      doi: '10.1016/j.ijhydene.2023.28567',
      citationCount: 67,
      hIndex: 15,
    },
    keywords: [
      'phosphoric acid fuel cell',
      'stack design',
      'cost reduction',
      'distributed power',
      'thermal management',
      'economic analysis',
    ],
    aiEnhanced: true,
    aiConfidenceScore: 0.85,
    publishedDate: new Date('2023-11-14'),
    addedToDatabase: new Date('2023-11-18'),
    qualityScore: 8.1,
    relatedPapers: ['paper-023', 'paper-045', 'paper-068'],
    fullTextAvailable: true,
    externalLinks: {
      pdfUrl: 'https://example.com/papers/paper-006.pdf',
      publisherUrl: 'https://www.sciencedirect.com/science/article/pii/S0360319923028567',
    },
  },
];

/**
 * Additional mock papers for search and filtering demonstrations
 */
export const generateAdditionalMockPapers = (count: number): ResearchPaper[] => {
  const titles = [
    'Novel Carbon Nanotube Electrodes for Enhanced MFC Performance',
    'Biohydrogen Production in Two-Chamber Microbial Electrolysis Cells',
    'Integrated Water Treatment and Energy Recovery Using BioMECs',
    'Advanced Ceramic Materials for SOFC Electrolytes',
    'Platinum-Free Catalysts for PEM Fuel Cell Applications',
    'Scale-Up Challenges in Microbial Fuel Cell Technology',
    'AI-Driven Process Optimization in Bioelectrochemical Systems',
    'Life Cycle Assessment of Microbial Electrochemical Technologies',
    'Novel Membrane Materials for Fuel Cell Applications',
    'Renewable Energy Integration with Fuel Cell Systems',
  ];

  const journals = [
    { name: 'Applied Energy', type: 'Energy' as JournalType, impactFactor: 11.2 },
    { name: 'Bioresource Technology', type: 'Biotechnology' as JournalType, impactFactor: 9.6 },
    {
      name: 'Environmental Science & Technology',
      type: 'Environmental' as JournalType,
      impactFactor: 10.8,
    },
    { name: 'Advanced Materials', type: 'Materials' as JournalType, impactFactor: 29.4 },
    {
      name: 'Chemical Engineering Journal',
      type: 'Engineering' as JournalType,
      impactFactor: 13.3,
    },
  ];

  const researchFocusOptions: ResearchFocus[] = [
    'MFC',
    'MEC',
    'MDC',
    'PEM',
    'SOFC',
    'PAFC',
    'Electrode Design',
    'Biofilm Engineering',
    'Performance Optimization',
    'Materials Science',
    'Systems Integration',
    'Economic Analysis',
  ];

  const authors = [
    'Dr. Zhang Wei',
    'Prof. Sarah Johnson',
    'Dr. Carlos Rodriguez',
    'Dr. Hiroshi Yamamoto',
    'Prof. Elena Petrov',
    'Dr. Mohammed Al-Rashid',
    'Dr. Anna Kowalski',
    'Prof. Jean Dubois',
    'Dr. Priya Sharma',
  ];

  return Array.from({ length: count }, (_, index) => {
    const id = `paper-${String(index + 7).padStart(3, '0')}`;
    const year = Math.floor(Math.random() * 5) + 2020;
    const journalIndex = Math.floor(Math.random() * journals.length);
    const selectedJournal = journals[journalIndex] || journals[0]!;
    const focusCount = Math.floor(Math.random() * 3) + 1;
    const selectedFocus = Array.from(
      { length: focusCount },
      () => researchFocusOptions[Math.floor(Math.random() * researchFocusOptions.length)]
    );

    return {
      id,
      title: titles[index % titles.length] + ` - Study ${index + 1}`,
      authors: [
        {
          name: authors[Math.floor(Math.random() * authors.length)] || 'Unknown Author',
          affiliation: 'Research University',
          isCorresponding: true,
        },
      ],
      journal: {
        name: selectedJournal.name,
        type: selectedJournal.type,
        impactFactor: selectedJournal.impactFactor,
        issn: '1234-5678',
        publisher: 'Academic Publisher',
      },
      year,
      researchFocus: [...new Set(selectedFocus)] as ResearchFocus[],
      abstract: `This study investigates ${
        selectedFocus[0]?.toLowerCase() || 'bioelectrochemical'
      } technology with focus on performance optimization and practical applications. The research demonstrates significant improvements in key performance metrics through innovative approaches and novel materials.`,
      performanceMetrics: {
        maxPowerDensity: Math.floor(Math.random() * 4000) + 500,
        currentDensity: Math.floor(Math.random() * 8000) + 1000,
        openCircuitVoltage: Math.round((Math.random() * 0.5 + 0.5) * 100) / 100,
        coulombicEfficiency: Math.round((Math.random() * 30 + 60) * 10) / 10,
        energyRecoveryEfficiency: Math.round((Math.random() * 40 + 20) * 10) / 10,
        lifespanDays: Math.floor(Math.random() * 300) + 30,
      },
      citation: {
        doi: `10.1000/182.${Math.floor(Math.random() * 900000) + 100000}`,
        citationCount: Math.floor(Math.random() * 200),
        hIndex: Math.floor(Math.random() * 30),
      },
      methodology: ['experimental design', 'data analysis', 'performance testing'],
      keywords: [
        selectedFocus[0]?.toLowerCase() || 'bioelectrochemical',
        'performance',
        'optimization',
        'efficiency',
        'innovation',
      ],
      aiEnhanced: Math.random() > 0.2,
      aiConfidenceScore: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
      publishedDate: new Date(
        year,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
      addedToDatabase: new Date(
        year,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
      qualityScore: Math.round((Math.random() * 3 + 6) * 10) / 10,
      relatedPapers: [],
      fullTextAvailable: Math.random() > 0.3,
      externalLinks: {
        publisherUrl: `https://example.com/papers/${id}`,
      },
    };
  });
};

/**
 * Complete mock dataset combining featured papers and generated papers
 */
export const allMockPapers = [...mockResearchPapers, ...generateAdditionalMockPapers(100)];

/**
 * Helper function to simulate search functionality
 */
export const searchPapers = (
  query: string,
  papers: ResearchPaper[] = allMockPapers
): ResearchPaper[] => {
  if (!query.trim()) return papers;

  const searchTerms = query.toLowerCase().split(' ');

  return papers.filter((paper) => {
    const searchableText = [
      paper.title,
      paper.abstract,
      ...paper.keywords,
      ...paper.authors.map((a) => a.name),
      paper.journal.name,
      ...paper.researchFocus,
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.some((term) => searchableText.includes(term));
  });
};

/**
 * Helper function to get papers by research focus
 */
export const getPapersByFocus = (
  focus: ResearchFocus,
  papers: ResearchPaper[] = allMockPapers
): ResearchPaper[] => {
  return papers.filter((paper) => paper.researchFocus.includes(focus));
};

/**
 * Helper function to get papers by year range
 */
export const getPapersByYear = (
  startYear: number,
  endYear: number,
  papers: ResearchPaper[] = allMockPapers
): ResearchPaper[] => {
  return papers.filter((paper) => paper.year >= startYear && paper.year <= endYear);
};

/**
 * Helper function to get top cited papers
 */
export const getTopCitedPapers = (
  limit: number = 10,
  papers: ResearchPaper[] = allMockPapers
): ResearchPaper[] => {
  return [...papers]
    .sort((a, b) => b.citation.citationCount - a.citation.citationCount)
    .slice(0, limit);
};

/**
 * Helper function to get recent papers
 */
export const getRecentPapers = (
  limit: number = 10,
  papers: ResearchPaper[] = allMockPapers
): ResearchPaper[] => {
  return [...papers]
    .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
    .slice(0, limit);
};
