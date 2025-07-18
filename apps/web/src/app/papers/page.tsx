import { Suspense } from 'react';
import { generateMetadata as generateMeta } from '../../lib/ssr-optimization';
import { PapersListServer } from './components/PapersServer';
import PapersSearch from './components/PapersSearch';
import PapersFilters from './components/PapersFilters';

export async function generateMetadata() {
  return generateMeta({
    title: 'Research Papers',
    description:
      'Explore our comprehensive database of 4,087+ microbial electrochemical systems research papers with AI-enhanced insights.',
    type: 'website',
    tags: ['research', 'papers', 'MFC', 'MEC', 'BES', 'electrochemistry'],
  });
}

// Loading component for papers
function PapersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PapersPage({
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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Research Library</h1>
        <p className="text-gray-600 text-lg">
          Discover insights from thousands of peer-reviewed papers on microbial electrochemical
          systems
        </p>
      </div>

      {/* Client-side search component */}
      <div className="mb-6">
        <PapersSearch initialSearch={searchParams.search} />
      </div>

      {/* Client-side filters */}
      <div className="mb-6">
        <PapersFilters
          initialFilters={{
            yearStart: searchParams.yearStart,
            yearEnd: searchParams.yearEnd,
            verified: searchParams.verified === 'true',
          }}
        />
      </div>

      {/* Server-side papers list with streaming */}
      <Suspense fallback={<PapersLoading />}>
        <PapersListServer searchParams={searchParams} />
      </Suspense>

      {/* Stats section - can be loaded separately */}
      <Suspense fallback={null}>
        <PapersStats />
      </Suspense>
    </div>
  );
}

// Async component for stats
async function PapersStats() {
  // This could fetch stats independently
  const stats = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/papers?includeStats=true`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  }).then((res) => res.json());

  if (!stats.data?.stats) return null;

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-3xl font-bold text-blue-600">
          {stats.data.stats.totalResults.toLocaleString()}
        </div>
        <div className="text-gray-600 mt-2">Total Papers</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-3xl font-bold text-green-600">
          {stats.data.stats.yearRange.max - stats.data.stats.yearRange.min + 1}
        </div>
        <div className="text-gray-600 mt-2">Years of Research</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-3xl font-bold text-purple-600">
          {stats.data.stats.systemTypes.length}
        </div>
        <div className="text-gray-600 mt-2">System Types</div>
      </div>
    </div>
  );
}
