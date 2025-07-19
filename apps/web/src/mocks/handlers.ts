import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Mock data generators
const generateResearchPaper = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  abstract: faker.lorem.paragraphs(2),
  authors: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
  })),
  year: faker.number.int({ min: 2010, max: 2024 }),
  systemType: faker.helpers.arrayElement(['MFC', 'BES', 'MEC', 'MES', 'MDC']),
  powerDensity: faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
  coulombicEfficiency: faker.number.float({ min: 0.1, max: 100, fractionDigits: 1 }),
  substrateType: faker.helpers.arrayElement(['Glucose', 'Acetate', 'Wastewater', 'Lactate']),
  url: faker.internet.url(),
  pdfUrl: faker.internet.url(),
  qualityScore: faker.number.float({ min: 60, max: 100, fractionDigits: 1 }),
  verified: faker.datatype.boolean(),
  citationCount: faker.number.int({ min: 0, max: 500 }),
  tags: faker.helpers.arrayElements(
    ['electrochemistry', 'biofilm', 'wastewater', 'energy', 'sustainability'],
    { min: 1, max: 3 }
  ),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

const generateExperiment = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.science.chemicalElement().name + ' ' + faker.lorem.words(2),
  description: faker.lorem.paragraph(),
  systemType: faker.helpers.arrayElement(['MFC', 'BES', 'MEC', 'MES', 'MDC']),
  status: faker.helpers.arrayElement(['draft', 'running', 'completed', 'failed']),
  createdBy: faker.string.uuid(),
  parameters: {
    temperature: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
    pH: faker.number.float({ min: 6, max: 8, fractionDigits: 1 }),
    hydraulicRetentionTime: faker.number.float({ min: 1, max: 24, fractionDigits: 1 }),
    substrateConcentration: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
  },
  results: {
    powerDensity: faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
    coulombicEfficiency: faker.number.float({ min: 0.1, max: 100, fractionDigits: 1 }),
    voltageOutput: faker.number.float({ min: 0.1, max: 1.2, fractionDigits: 3 }),
  },
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
});

const generatePrediction = (overrides = {}) => ({
  id: faker.string.uuid(),
  experimentId: faker.string.uuid(),
  model: faker.helpers.arrayElement(['RandomForest', 'NeuralNetwork', 'GradientBoosting']),
  inputs: {
    temperature: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
    pH: faker.number.float({ min: 6, max: 8, fractionDigits: 1 }),
    substrateType: faker.helpers.arrayElement(['Glucose', 'Acetate', 'Wastewater']),
    anodeMaterial: faker.helpers.arrayElement(['Carbon cloth', 'Graphite', 'MXene']),
  },
  predictions: {
    powerDensity: {
      value: faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
      confidence: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
      unit: 'mW/m²',
    },
    coulombicEfficiency: {
      value: faker.number.float({ min: 0.1, max: 100, fractionDigits: 1 }),
      confidence: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
      unit: '%',
    },
  },
  accuracy: faker.number.float({ min: 0.8, max: 0.99, fractionDigits: 2 }),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

// API handlers
export const handlers = [
  // Papers endpoints
  http.get('/api/papers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '40');
    const search = url.searchParams.get('search') || '';
    const systemType = url.searchParams.get('systemType');

    let papers = Array.from({ length: 100 }, () => generateResearchPaper());

    // Apply filters
    if (search) {
      papers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.abstract.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (systemType) {
      papers = papers.filter((p) => p.systemType === systemType);
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPapers = papers.slice(start, end);

    return HttpResponse.json({
      data: {
        papers: paginatedPapers,
        pagination: {
          page,
          limit,
          total: papers.length,
          pages: Math.ceil(papers.length / limit),
        },
        stats: {
          totalResults: papers.length,
          systemTypes: {
            MFC: papers.filter((p) => p.systemType === 'MFC').length,
            BES: papers.filter((p) => p.systemType === 'BES').length,
            MEC: papers.filter((p) => p.systemType === 'MEC').length,
            MES: papers.filter((p) => p.systemType === 'MES').length,
            MDC: papers.filter((p) => p.systemType === 'MDC').length,
          },
          yearRange: { min: 2010, max: 2024 },
        },
        searchTime: faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 3 }),
      },
      error: null,
    });
  }),

  http.get('/api/papers/:id', ({ params }) => {
    const paper = generateResearchPaper({ id: params.id as string });
    return HttpResponse.json({ data: paper, error: null });
  }),

  // Experiments endpoints
  http.get('/api/experiments', () => {
    const experiments = Array.from({ length: 20 }, () => generateExperiment());
    return HttpResponse.json({
      data: experiments,
      error: null,
    });
  }),

  http.post('/api/experiments', async ({ request }) => {
    const body = await request.json();
    const experiment = generateExperiment(body as any);
    return HttpResponse.json({ data: experiment, error: null }, { status: 201 });
  }),

  http.get('/api/experiments/:id', ({ params }) => {
    const experiment = generateExperiment({ id: params.id as string });
    return HttpResponse.json({ data: experiment, error: null });
  }),

  http.put('/api/experiments/:id', async ({ params, request }) => {
    const body = await request.json();
    const experiment = generateExperiment({ id: params.id as string, ...body });
    return HttpResponse.json({ data: experiment, error: null });
  }),

  http.delete('/api/experiments/:id', () => {
    return HttpResponse.json({ data: { success: true }, error: null });
  }),

  // Predictions endpoints
  http.post('/api/predictions', async ({ request }) => {
    const body = await request.json();
    const prediction = generatePrediction({ inputs: body });
    return HttpResponse.json({ data: prediction, error: null }, { status: 201 });
  }),

  http.get('/api/predictions/:experimentId', ({ params }) => {
    const predictions = Array.from({ length: 5 }, () =>
      generatePrediction({ experimentId: params.experimentId as string })
    );
    return HttpResponse.json({ data: predictions, error: null });
  }),

  // Parameters endpoint
  http.get('/api/parameters', () => {
    const parameters = [
      {
        id: 'temperature',
        name: 'Temperature',
        category: 'operational',
        unit: '°C',
        range: { min: 15, max: 45 },
        defaultValue: 30,
      },
      {
        id: 'pH',
        name: 'pH Level',
        category: 'chemical',
        unit: '',
        range: { min: 5, max: 9 },
        defaultValue: 7,
      },
      {
        id: 'substrate-concentration',
        name: 'Substrate Concentration',
        category: 'chemical',
        unit: 'g/L',
        range: { min: 0.5, max: 20 },
        defaultValue: 5,
      },
    ];
    return HttpResponse.json({ data: parameters, error: null });
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        data: {
          user: {
            id: faker.string.uuid(),
            email: body.email,
            name: 'Test User',
            role: 'researcher',
          },
          token: faker.string.alphanumeric(40),
        },
        error: null,
      });
    }
    return HttpResponse.json(
      { data: null, error: { message: 'Invalid credentials' } },
      { status: 401 }
    );
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ data: { success: true }, error: null });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      data: {
        user: {
          id: faker.string.uuid(),
          email: 'test@example.com',
          name: 'Test User',
          role: 'researcher',
        },
      },
      error: null,
    });
  }),

  // DB test endpoint
  http.get('/api/db-test', () => {
    return HttpResponse.json({
      data: {
        connected: true,
        paperCount: 1000,
        environment: 'test',
      },
      error: null,
    });
  }),

  // Research endpoints
  http.get('/api/research/mess-papers', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const papers = Array.from({ length: 10 }, () => ({
      ...generateResearchPaper(),
      relevanceScore: faker.number.float({ min: 0.7, max: 1, fractionDigits: 2 }),
    }));
    return HttpResponse.json({ data: papers, error: null });
  }),

  // Handle unmatched requests
  http.get('*', () => {
    return HttpResponse.json({ error: { message: 'Endpoint not found' } }, { status: 404 });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  http.get('/api/papers', () => {
    return HttpResponse.json(
      { data: null, error: { message: 'Database connection error' } },
      { status: 500 }
    );
  }),

  http.post('/api/experiments', () => {
    return HttpResponse.json(
      { data: null, error: { message: 'Validation error: Missing required fields' } },
      { status: 400 }
    );
  }),

  http.post('/api/predictions', () => {
    return HttpResponse.json(
      { data: null, error: { message: 'Model service unavailable' } },
      { status: 503 }
    );
  }),
];
