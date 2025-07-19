import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';

// Create a mock Prisma client
export type MockPrismaClient = DeepMockProxy<PrismaClient>;

/**
 * Create a mocked Prisma client for testing
 */
export const createMockPrismaClient = (): MockPrismaClient => {
  return mockDeep<PrismaClient>();
};

/**
 * Reset all mocks on the Prisma client
 */
export const resetMockPrismaClient = (mockClient: MockPrismaClient): void => {
  mockReset(mockClient);
};

/**
 * Database test data generators
 */
export const DatabaseTestData = {
  /**
   * Generate a test research paper
   */
  createResearchPaper: (overrides?: Partial<any>) => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    abstract: faker.lorem.paragraphs(2),
    authors: JSON.stringify([faker.person.fullName(), faker.person.fullName()]),
    publicationDate: faker.date.between({ from: '2010-01-01', to: '2024-12-31' }),
    journal: faker.company.name() + ' Journal',
    volume: faker.number.int({ min: 1, max: 50 }),
    issue: faker.number.int({ min: 1, max: 12 }),
    pages: `${faker.number.int({ min: 1, max: 100 })}-${faker.number.int({ min: 101, max: 200 })}`,
    doi: `10.${faker.number.int({ min: 1000, max: 9999 })}/${faker.string.alphanumeric(8)}`,
    pubmedId: faker.string.numeric(8),
    arxivId: faker.helpers.maybe(
      () => `${faker.number.int({ min: 2010, max: 2024 })}.${faker.string.numeric(5)}`
    ),
    keywords: JSON.stringify(
      faker.helpers.arrayElements(['MFC', 'biofilm', 'electrode', 'substrate', 'power'], 3)
    ),
    externalUrl: faker.internet.url(),
    fullText: faker.lorem.paragraphs(10),
    systemType: faker.helpers.arrayElement(['MFC', 'MEC', 'BES', 'MES', 'MDC']),
    substrateType: faker.helpers.arrayElement(['Glucose', 'Acetate', 'Wastewater', 'Lactate']),
    anodeMaterial: faker.helpers.arrayElement(['Carbon cloth', 'Graphite', 'Carbon brush']),
    cathodeMaterial: faker.helpers.arrayElement(['Platinum', 'Carbon', 'MnO2']),
    membraneMaterial: faker.helpers.arrayElement(['Nafion', 'PEM', 'Ultrex']),
    operatingConditions: JSON.stringify({
      temperature: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
      pH: faker.number.float({ min: 6, max: 8, fractionDigits: 1 }),
      hrt: faker.number.float({ min: 1, max: 24, fractionDigits: 1 }),
    }),
    powerOutput: faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
    currentDensity: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }),
    efficiency: faker.number.float({ min: 10, max: 90, fractionDigits: 1 }),
    resistanceInternal: faker.number.float({ min: 10, max: 1000, fractionDigits: 1 }),
    coulombicEfficiency: faker.number.float({ min: 10, max: 90, fractionDigits: 1 }),
    energyRecovery: faker.number.float({ min: 10, max: 80, fractionDigits: 1 }),
    metadata: JSON.stringify({
      fundingSource: faker.company.name(),
      researchGroup: faker.company.name() + ' Lab',
    }),
    source: 'database',
    processingStatus: 'completed',
    aiSummary: faker.lorem.paragraph(),
    aiKeyFindings: JSON.stringify(
      faker.helpers.arrayElements(
        [
          'High power density achieved',
          'Novel electrode material tested',
          'Improved substrate utilization',
          'Enhanced coulombic efficiency',
        ],
        2
      )
    ),
    aiConfidence: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
    isPublic: true,
    citationCount: faker.number.int({ min: 0, max: 500 }),
    inSilicoAvailable: faker.datatype.boolean(),
    modelType: faker.helpers.maybe(() => faker.helpers.arrayElement(['FBA', 'CFD', 'ML'])),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    uploadedBy: faker.helpers.maybe(() => faker.string.uuid()),
    ...overrides,
  }),

  /**
   * Generate a test user
   */
  createUser: (overrides?: Partial<any>) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['researcher', 'admin', 'viewer']),
    emailVerified: faker.date.recent(),
    image: faker.image.avatar(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  /**
   * Generate a test experiment
   */
  createExperiment: (overrides?: Partial<any>) => ({
    id: faker.string.uuid(),
    name: faker.science.chemicalElement().name + ' Experiment',
    description: faker.lorem.paragraph(),
    systemType: faker.helpers.arrayElement(['MFC', 'MEC', 'BES', 'MES', 'MDC']),
    status: faker.helpers.arrayElement(['draft', 'running', 'completed', 'failed']),
    userId: faker.string.uuid(),
    parameters: JSON.stringify({
      temperature: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
      pH: faker.number.float({ min: 6, max: 8, fractionDigits: 1 }),
      substrateConcentration: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
    }),
    results: JSON.stringify({
      powerDensity: faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
      coulombicEfficiency: faker.number.float({ min: 0.1, max: 100, fractionDigits: 1 }),
    }),
    notes: faker.lorem.sentences(2),
    tags: JSON.stringify(
      faker.helpers.arrayElements(['optimization', 'baseline', 'validation'], 2)
    ),
    startedAt: faker.date.recent(),
    completedAt: faker.helpers.maybe(() => faker.date.recent()),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  /**
   * Generate a test prediction
   */
  createPrediction: (overrides?: Partial<any>) => ({
    id: faker.string.uuid(),
    experimentId: faker.string.uuid(),
    model: faker.helpers.arrayElement(['RandomForest', 'NeuralNetwork', 'GradientBoosting']),
    version: faker.system.semver(),
    inputs: JSON.stringify({
      temperature: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
      pH: faker.number.float({ min: 6, max: 8, fractionDigits: 1 }),
      substrateType: faker.helpers.arrayElement(['Glucose', 'Acetate', 'Wastewater']),
    }),
    outputs: JSON.stringify({
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
    }),
    confidence: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
    metadata: JSON.stringify({
      trainingSetSize: faker.number.int({ min: 100, max: 10000 }),
      features: faker.number.int({ min: 10, max: 50 }),
    }),
    createdAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Database transaction mock helpers
 */
export const createMockTransaction = () => {
  const mockTx = createMockPrismaClient();

  return {
    tx: mockTx,
    // Mock transaction methods
    $transaction: jest.fn(async (fn: (tx: any) => Promise<any>) => {
      try {
        return await fn(mockTx);
      } catch (error) {
        throw error;
      }
    }),
  };
};

/**
 * Database query builders for testing
 */
export const DatabaseQueryMocks = {
  /**
   * Mock a successful findMany query
   */
  mockFindMany: <T>(mockClient: MockPrismaClient, model: string, data: T[]) => {
    (mockClient as any)[model].findMany.mockResolvedValue(data);
  },

  /**
   * Mock a successful findUnique query
   */
  mockFindUnique: <T>(mockClient: MockPrismaClient, model: string, data: T | null) => {
    (mockClient as any)[model].findUnique.mockResolvedValue(data);
  },

  /**
   * Mock a successful create query
   */
  mockCreate: <T>(mockClient: MockPrismaClient, model: string, data: T) => {
    (mockClient as any)[model].create.mockResolvedValue(data);
  },

  /**
   * Mock a successful update query
   */
  mockUpdate: <T>(mockClient: MockPrismaClient, model: string, data: T) => {
    (mockClient as any)[model].update.mockResolvedValue(data);
  },

  /**
   * Mock a successful delete query
   */
  mockDelete: <T>(mockClient: MockPrismaClient, model: string, data: T) => {
    (mockClient as any)[model].delete.mockResolvedValue(data);
  },

  /**
   * Mock a count query
   */
  mockCount: (mockClient: MockPrismaClient, model: string, count: number) => {
    (mockClient as any)[model].count.mockResolvedValue(count);
  },

  /**
   * Mock an aggregate query
   */
  mockAggregate: (mockClient: MockPrismaClient, model: string, result: any) => {
    (mockClient as any)[model].aggregate.mockResolvedValue(result);
  },

  /**
   * Mock a groupBy query
   */
  mockGroupBy: (mockClient: MockPrismaClient, model: string, result: any[]) => {
    (mockClient as any)[model].groupBy.mockResolvedValue(result);
  },

  /**
   * Mock a query error
   */
  mockError: (mockClient: MockPrismaClient, model: string, method: string, error: Error) => {
    (mockClient as any)[model][method].mockRejectedValue(error);
  },
};

/**
 * Database test scenarios
 */
export const DatabaseTestScenarios = {
  /**
   * Test pagination
   */
  testPagination: async (
    queryFn: (page: number, limit: number) => Promise<any>,
    totalItems: number
  ) => {
    const limit = 10;
    const totalPages = Math.ceil(totalItems / limit);

    for (let page = 0; page < totalPages; page++) {
      const result = await queryFn(page, limit);

      if (page < totalPages - 1) {
        expect(result.items).toHaveLength(limit);
      } else {
        expect(result.items.length).toBeLessThanOrEqual(limit);
      }

      expect(result.pagination).toEqual({
        page,
        limit,
        total: totalItems,
        pages: totalPages,
      });
    }
  },

  /**
   * Test search functionality
   */
  testSearch: async (queryFn: (search: string) => Promise<any>, searchTerms: string[]) => {
    for (const term of searchTerms) {
      const result = await queryFn(term);

      // Verify results contain search term
      result.items.forEach((item: any) => {
        const searchableFields = [item.title, item.abstract, item.description, item.content]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        expect(searchableFields).toContain(term.toLowerCase());
      });
    }
  },

  /**
   * Test filtering
   */
  testFiltering: async (
    queryFn: (filters: any) => Promise<any>,
    filterScenarios: Array<{ filters: any; expectedCount: number }>
  ) => {
    for (const { filters, expectedCount } of filterScenarios) {
      const result = await queryFn(filters);
      expect(result.items).toHaveLength(expectedCount);
    }
  },

  /**
   * Test sorting
   */
  testSorting: async (
    queryFn: (sort: string, order: 'asc' | 'desc') => Promise<any>,
    sortFields: string[]
  ) => {
    for (const field of sortFields) {
      for (const order of ['asc', 'desc'] as const) {
        const result = await queryFn(field, order);

        // Verify sorting
        for (let i = 1; i < result.items.length; i++) {
          const prev = result.items[i - 1][field];
          const curr = result.items[i][field];

          if (order === 'asc') {
            expect(prev <= curr).toBe(true);
          } else {
            expect(prev >= curr).toBe(true);
          }
        }
      }
    }
  },
};

/**
 * Create an in-memory database for testing
 */
export class InMemoryDatabase {
  private data: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.data.clear();
  }

  getCollection(name: string): Map<string, any> {
    if (!this.data.has(name)) {
      this.data.set(name, new Map());
    }
    return this.data.get(name)!;
  }

  insert(collection: string, item: any): any {
    const coll = this.getCollection(collection);
    const id = item.id || faker.string.uuid();
    const itemWithId = { ...item, id };
    coll.set(id, itemWithId);
    return itemWithId;
  }

  findById(collection: string, id: string): any | null {
    const coll = this.getCollection(collection);
    return coll.get(id) || null;
  }

  findMany(collection: string, predicate?: (item: any) => boolean): any[] {
    const coll = this.getCollection(collection);
    const items = Array.from(coll.values());
    return predicate ? items.filter(predicate) : items;
  }

  update(collection: string, id: string, updates: any): any | null {
    const coll = this.getCollection(collection);
    const existing = coll.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, id };
    coll.set(id, updated);
    return updated;
  }

  delete(collection: string, id: string): boolean {
    const coll = this.getCollection(collection);
    return coll.delete(id);
  }

  count(collection: string, predicate?: (item: any) => boolean): number {
    return this.findMany(collection, predicate).length;
  }
}

// Install jest-mock-extended if needed
export const setupDatabaseMocks = () => {
  // Add this to package.json devDependencies:
  // "jest-mock-extended": "^3.0.5"
  console.log('Remember to install jest-mock-extended: pnpm add -D jest-mock-extended');
};
