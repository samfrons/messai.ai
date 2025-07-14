// API Response Mocks
export const mockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const mockApiError = (message: string, status = 500) => ({
  response: {
    data: { error: message },
    status,
    statusText: 'Internal Server Error',
  },
  message,
});

// Health Check Mock
export const mockHealthResponse = {
  status: 'healthy',
  timestamp: '2025-07-13T12:00:00.000Z',
  version: '1.0.0',
  services: {
    core: 'operational',
    ui: 'operational',
    api: 'operational',
  },
  environment: 'non-production',
};

// User Mock Data
export const mockUser = {
  id: 'test-user-1',
  email: 'test@messai.ai',
  name: 'Test User',
  role: 'researcher',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

// Research Paper Mock
export const mockResearchPaper = {
  id: 'paper-1',
  title: 'Enhanced Microbial Fuel Cell Performance with Novel Electrode Materials',
  authors: ['Dr. Jane Smith', 'Dr. John Doe'],
  journal: 'Journal of Bioelectrochemistry',
  year: 2024,
  doi: '10.1016/j.bioelechem.2024.001',
  abstract: 'This study investigates the performance enhancement of microbial fuel cells...',
  keywords: ['microbial fuel cell', 'bioelectrochemistry', 'electrode materials'],
  citationCount: 15,
  performanceMetrics: {
    powerDensity: 1.2,
    currentDensity: 3.4,
    voltage: 0.8,
  },
};

// Experiment Mock Data
export const mockExperiment = {
  id: 'exp-1',
  name: 'MFC Performance Test',
  description: 'Testing performance of MFC with different electrode configurations',
  status: 'completed',
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: '2025-01-07T00:00:00.000Z',
  parameters: {
    temperature: 25,
    pH: 7.0,
    substrateConcentration: 1000,
  },
  results: {
    maxPower: 1.5,
    efficiency: 0.85,
    duration: 168, // hours
  },
};

// Bioreactor Configuration Mock
export const mockBioreactorConfig = {
  id: 'bioreactor-1',
  name: 'Standard MFC Configuration',
  type: 'single-chamber',
  volume: 0.1, // liters
  electrodes: {
    anode: {
      material: 'carbon-cloth',
      surfaceArea: 10, // cm²
    },
    cathode: {
      material: 'platinum-carbon',
      surfaceArea: 8, // cm²
    },
  },
  separator: {
    type: 'proton-exchange-membrane',
    material: 'nafion',
  },
  operatingConditions: {
    temperature: 30, // °C
    pH: 7.2,
    flowRate: 0.5, // mL/min
  },
};

// Error Response Mocks
export const mockValidationError = {
  message: 'Validation failed',
  errors: [
    { field: 'email', message: 'Invalid email format' },
    { field: 'password', message: 'Password must be at least 8 characters' },
  ],
};

export const mockNotFoundError = {
  message: 'Resource not found',
  code: 'NOT_FOUND',
  statusCode: 404,
};

export const mockUnauthorizedError = {
  message: 'Unauthorized access',
  code: 'UNAUTHORIZED',
  statusCode: 401,
};

// Mock fetch for testing
export const mockFetch = (responseData: any, status = 200) => {
  const mockResponse: Partial<Response> = {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
    headers: new Map() as any,
  };

  (global as any).fetch = jest.fn(() => Promise.resolve(mockResponse));
};

// Reset all mocks utility
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
};
