/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@messai/database';
import { server } from '../../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock the database module
jest.mock('@messai/database', () => ({
  prisma: {
    researchPaper: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

// Mock the cache module
jest.mock('../../../../lib/cache', () => ({
  withCache: jest.fn((category, key, fn) => fn()),
  generateCacheKey: jest.fn((params) => JSON.stringify(params)),
  invalidateCache: jest.fn(),
}));

// Mock production safety
jest.mock('../../../../lib/production-safety', () => ({
  checkProductionWrite: jest.fn(),
  createProductionSafetyResponse: jest.fn(() => ({
    data: null,
    error: { message: 'Production write not allowed', code: 'PRODUCTION_WRITE_ERROR' },
  })),
}));

describe('/api/papers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return papers with default pagination', async () => {
      const mockPapers = [
        {
          id: '1',
          title: 'Test Paper 1',
          authors: JSON.stringify(['Author 1', 'Author 2']),
          abstract: 'Test abstract with <jats:p>JATS tags</jats:p>',
          publicationDate: new Date('2023-01-01'),
          journal: 'Test Journal',
          doi: '10.1234/test',
          externalUrl: 'https://example.com/paper1',
          systemType: 'MFC',
          powerOutput: 100,
          efficiency: 85,
          aiSummary: 'AI summary',
          aiKeyFindings: JSON.stringify(['Finding 1', 'Finding 2']),
          aiConfidence: 0.9,
          source: 'database',
          isPublic: true,
          createdAt: new Date(),
          inSilicoAvailable: false,
          modelType: null,
        },
      ];

      (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue(mockPapers);
      (prisma.researchPaper.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/papers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBeNull();
      expect(data.data.papers).toHaveLength(1);
      expect(data.data.papers[0]).toMatchObject({
        id: '1',
        title: 'Test Paper 1',
        abstract: 'Test abstract with JATS tags', // JATS tags removed
        year: 2023,
        qualityScore: 90,
        verified: true,
      });
      expect(data.data.pagination).toEqual({
        page: 0,
        limit: 40,
        total: 1,
        pages: 1,
      });
    });

    it('should handle search queries', async () => {
      (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.researchPaper.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost:3000/api/papers?search=microbial&page=1&limit=20'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(prisma.researchPaper.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'microbial', mode: 'insensitive' } },
              { abstract: { contains: 'microbial', mode: 'insensitive' } },
              { authors: { contains: 'microbial', mode: 'insensitive' } },
              { journal: { contains: 'microbial', mode: 'insensitive' } },
              { systemType: { contains: 'microbial', mode: 'insensitive' } },
            ]),
          }),
          skip: 20,
          take: 20,
        })
      );

      expect(response.status).toBe(200);
      expect(data.data.papers).toEqual([]);
      expect(data.data.suggestions).toEqual([]);
    });

    it('should apply filters correctly', async () => {
      (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.researchPaper.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost:3000/api/papers?yearStart=2020&yearEnd=2023&minQualityScore=80&verified=true'
      );
      await GET(request);

      expect(prisma.researchPaper.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            publicationDate: {
              gte: new Date('2020-01-01'),
              lte: new Date('2023-12-31'),
            },
            aiConfidence: { gte: 0.8 }, // 80/100 = 0.8
            isPublic: true,
          }),
        })
      );
    });

    it('should handle sorting options', async () => {
      (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.researchPaper.count as jest.Mock).mockResolvedValue(0);

      const sortOptions = [
        { sort: 'date', expected: { publicationDate: 'desc' } },
        { sort: 'year-asc', expected: { publicationDate: 'asc' } },
        { sort: 'citations-desc', expected: { powerOutput: 'desc' } },
        { sort: 'quality', expected: { aiConfidence: 'desc' } },
      ];

      for (const { sort, expected } of sortOptions) {
        const request = new NextRequest(`http://localhost:3000/api/papers?sort=${sort}`);
        await GET(request);

        expect(prisma.researchPaper.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: expected,
          })
        );
      }
    });

    it('should include statistics when requested', async () => {
      (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.researchPaper.count as jest.Mock).mockResolvedValue(10);
      (prisma.researchPaper.groupBy as jest.Mock).mockResolvedValue([
        { systemType: 'MFC', _count: 5 },
        { systemType: 'MEC', _count: 3 },
        { systemType: 'BES', _count: 2 },
      ]);
      (prisma.researchPaper.aggregate as jest.Mock).mockResolvedValue({
        _min: { publicationDate: new Date('2010-01-01') },
        _max: { publicationDate: new Date('2023-12-31') },
      });

      const request = new NextRequest('http://localhost:3000/api/papers?includeStats=true');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.stats).toEqual({
        totalResults: 10,
        systemTypes: [
          { type: 'MFC', count: 5 },
          { type: 'MEC', count: 3 },
          { type: 'BES', count: 2 },
        ],
        yearRange: { min: 2010, max: 2023 },
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.researchPaper.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/papers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toEqual({
        message: 'Database connection failed',
        code: 'FETCH_ERROR',
      });
      expect(data.data).toBeNull();
    });

    it('should parse authors correctly', async () => {
      const testCases = [
        {
          authors: JSON.stringify(['Author 1', 'Author 2']),
          expected: [
            { name: 'Author 1', affiliation: '' },
            { name: 'Author 2', affiliation: '' },
          ],
        },
        {
          authors: 'Single Author',
          expected: [{ name: 'Single Author', affiliation: '' }],
        },
        {
          authors: ['Already Array'],
          expected: [{ name: 'Already Array', affiliation: '' }],
        },
      ];

      for (const { authors, expected } of testCases) {
        (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue([
          {
            id: '1',
            title: 'Test',
            authors,
            publicationDate: new Date(),
            createdAt: new Date(),
          },
        ]);
        (prisma.researchPaper.count as jest.Mock).mockResolvedValue(1);

        const request = new NextRequest('http://localhost:3000/api/papers');
        const response = await GET(request);
        const data = await response.json();

        expect(data.data.papers[0].authors).toEqual(expected);
      }
    });
  });

  describe('POST', () => {
    const validPaperData = {
      title: 'New Research Paper',
      abstract: 'This is a test abstract',
      authors: ['Author 1', 'Author 2'],
      journal: 'Test Journal',
      year: 2023,
      doi: '10.1234/new-paper',
      pmid: '12345678',
      url: 'https://example.com/paper',
    };

    it('should create a new paper successfully', async () => {
      const { checkProductionWrite } = require('../../../../lib/production-safety');
      checkProductionWrite.mockImplementation(() => {}); // Allow write

      const createdPaper = {
        id: 'new-id',
        ...validPaperData,
        authors: JSON.stringify(validPaperData.authors),
        publicationDate: new Date('2023-01-01'),
        createdAt: new Date(),
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      (prisma.researchPaper.create as jest.Mock).mockResolvedValue(createdPaper);

      const request = new NextRequest('http://localhost:3000/api/papers', {
        method: 'POST',
        body: JSON.stringify(validPaperData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.error).toBeNull();
      expect(data.data).toMatchObject({
        id: 'new-id',
        title: 'New Research Paper',
      });

      expect(prisma.researchPaper.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: validPaperData.title,
            abstract: validPaperData.abstract,
            authors: JSON.stringify(validPaperData.authors),
            journal: validPaperData.journal,
            publicationDate: new Date('2023-01-01'),
            doi: validPaperData.doi,
            pubmedId: validPaperData.pmid,
            externalUrl: validPaperData.url,
            keywords: '[]',
            source: 'user',
          }),
        })
      );

      // Check cache invalidation
      const { invalidateCache } = require('../../../../lib/cache');
      expect(invalidateCache).toHaveBeenCalledWith('papers');
      expect(invalidateCache).toHaveBeenCalledWith('stats');
    });

    it('should prevent writes in production', async () => {
      const { checkProductionWrite } = require('../../../../lib/production-safety');
      checkProductionWrite.mockImplementation(() => {
        throw new Error('Production write not allowed');
      });

      const request = new NextRequest('http://localhost:3000/api/papers', {
        method: 'POST',
        body: JSON.stringify(validPaperData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toEqual({
        message: 'Production write not allowed',
        code: 'PRODUCTION_WRITE_ERROR',
      });
      expect(prisma.researchPaper.create).not.toHaveBeenCalled();
    });

    it('should validate request data', async () => {
      const { checkProductionWrite } = require('../../../../lib/production-safety');
      checkProductionWrite.mockImplementation(() => {});

      const invalidData = {
        title: '', // Empty title
        authors: [], // Empty authors
        year: 1800, // Invalid year
      };

      const request = new NextRequest('http://localhost:3000/api/papers', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeDefined();
      expect(prisma.researchPaper.create).not.toHaveBeenCalled();
    });

    it('should handle duplicate paper errors', async () => {
      const { checkProductionWrite } = require('../../../../lib/production-safety');
      checkProductionWrite.mockImplementation(() => {});

      (prisma.researchPaper.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`doi`)')
      );

      const request = new NextRequest('http://localhost:3000/api/papers', {
        method: 'POST',
        body: JSON.stringify(validPaperData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toEqual({
        message: 'Paper with this DOI/PMID already exists',
        code: 'DUPLICATE_ERROR',
      });
    });

    it('should handle general database errors', async () => {
      const { checkProductionWrite } = require('../../../../lib/production-safety');
      checkProductionWrite.mockImplementation(() => {});

      (prisma.researchPaper.create as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/papers', {
        method: 'POST',
        body: JSON.stringify(validPaperData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toEqual({
        message: 'Failed to create paper',
        code: 'CREATION_ERROR',
      });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON in POST request', async () => {
      const request = new NextRequest('http://localhost:3000/api/papers', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
