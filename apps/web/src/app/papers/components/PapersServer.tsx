import { Suspense } from 'react';
import { prisma } from '@messai/database';
import {
  createCachedFunction,
  REVALIDATION_TIMES,
  loadServerData,
} from '../../../lib/ssr-optimization';
import { Paper } from '../../../stores/usePapersStore';

// Cached function for fetching papers
const getCachedPapers = createCachedFunction(
  async (params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    filters?: Record<string, any>;
  }) => {
    const { search = '', page = 0, limit = 40, sort = 'relevance', filters = {} } = params;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { authors: { contains: search, mode: 'insensitive' } },
        { journal: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply filters
    if (filters.yearStart || filters.yearEnd) {
      where.publicationDate = {};
      if (filters.yearStart) {
        where.publicationDate.gte = new Date(`${filters.yearStart}-01-01`);
      }
      if (filters.yearEnd) {
        where.publicationDate.lte = new Date(`${filters.yearEnd}-12-31`);
      }
    }

    if (filters.verified) {
      where.isPublic = true;
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sort) {
      case 'date':
        orderBy = { publicationDate: 'desc' };
        break;
      case 'citations':
        orderBy = { powerOutput: 'desc' };
        break;
      case 'quality':
        orderBy = { aiConfidence: 'desc' };
        break;
      default:
        orderBy = [{ aiConfidence: 'desc' }, { createdAt: 'desc' }];
    }

    // Fetch papers with optimized select
    const [papers, total] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        orderBy,
        skip: page * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          authors: true,
          abstract: true,
          publicationDate: true,
          journal: true,
          doi: true,
          externalUrl: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          aiConfidence: true,
          isPublic: true,
          createdAt: true,
          aiKeyFindings: true,
        },
      }),
      prisma.researchPaper.count({ where }),
    ]);

    // Transform to frontend format
    const transformedPapers: Paper[] = papers.map((paper) => ({
      id: paper.id,
      title: paper.title,
      authors: JSON.parse(paper.authors || '[]').map((name: string) => ({
        name,
        affiliation: '',
      })),
      abstract: paper.abstract || '',
      year: paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 0,
      journal: {
        name: paper.journal || '',
        impactFactor: 0,
      },
      doi: paper.doi || '',
      url: paper.externalUrl || '',
      pdfUrl: paper.externalUrl || '',
      citation: {
        citationCount: paper.powerOutput || 0,
        hIndex: 0,
        scholarProfile: '',
      },
      qualityScore: (paper.aiConfidence || 0) * 100,
      aiConfidenceScore: (paper.aiConfidence || 0) * 100,
      verified: paper.isPublic,
      researchFocus: paper.systemType ? [paper.systemType] : [],
      performanceMetrics: {
        maxPowerDensity: paper.powerOutput,
        coulombicEfficiency: paper.efficiency,
        currentDensity: null,
      },
      keyFindings: JSON.parse(paper.aiKeyFindings || '[]'),
      aiEnhanced: true,
      source: 'database',
      processingDate: paper.createdAt.toISOString(),
      fullTextAvailable: !!paper.externalUrl,
      inSilicoAvailable: false,
      modelType: '',
    }));

    return {
      papers: transformedPapers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
  {
    revalidate: REVALIDATION_TIMES.DYNAMIC,
    tags: ['papers'],
  }
);

// Server component for papers list
export async function PapersListServer({
  searchParams,
}: {
  searchParams: {
    search?: string;
    page?: string;
    sort?: string;
    yearStart?: string;
    yearEnd?: string;
    verified?: string;
  };
}) {
  const params = {
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 0,
    sort: searchParams.sort || 'relevance',
    filters: {
      yearStart: searchParams.yearStart ? parseInt(searchParams.yearStart, 10) : undefined,
      yearEnd: searchParams.yearEnd ? parseInt(searchParams.yearEnd, 10) : undefined,
      verified: searchParams.verified === 'true',
    },
  };

  const { data, error } = await loadServerData(() => getCachedPapers(params), {
    fallback: { papers: [], pagination: { page: 0, limit: 40, total: 0, pages: 0 } },
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load papers. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Research Papers ({data?.pagination.total || 0})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {data && data.pagination.pages > 1 && (
        <PaginationServer
          currentPage={data.pagination.page}
          totalPages={data.pagination.pages}
          baseUrl="/papers"
          searchParams={searchParams}
        />
      )}
    </div>
  );
}

// Paper card component (can be shared between server and client)
function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{paper.title}</h3>

      <p className="text-sm text-gray-600 mb-2">
        {paper.authors
          .slice(0, 3)
          .map((a) => a.name)
          .join(', ')}
        {paper.authors.length > 3 && ' et al.'}
      </p>

      <p className="text-sm text-gray-500 mb-3">
        {paper.journal.name} • {paper.year}
      </p>

      <p className="text-sm text-gray-700 line-clamp-3 mb-4">{paper.abstract}</p>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            Score: {paper.qualityScore.toFixed(0)}%
          </span>
          {paper.verified && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Verified</span>
          )}
        </div>

        <a
          href={`/papers/${paper.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details →
        </a>
      </div>
    </div>
  );
}

// Server-side pagination component
function PaginationServer({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
}) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.append(key, value);
      }
    });
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2">
      {currentPage > 0 && (
        <a
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Previous
        </a>
      )}

      <span className="px-3 py-1">
        Page {currentPage + 1} of {totalPages}
      </span>

      {currentPage < totalPages - 1 && (
        <a
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Next
        </a>
      )}
    </div>
  );
}
