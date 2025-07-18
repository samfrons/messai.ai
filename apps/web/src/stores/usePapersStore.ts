import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Paper {
  id: string;
  title: string;
  authors: { name: string; affiliation: string }[];
  abstract: string;
  year: number;
  journal: {
    name: string;
    impactFactor: number;
  };
  doi: string;
  url: string;
  pdfUrl: string;
  citation: {
    citationCount: number;
    hIndex: number;
    scholarProfile: string;
  };
  qualityScore: number;
  aiConfidenceScore: number;
  verified: boolean;
  researchFocus: string[];
  performanceMetrics: {
    maxPowerDensity: number | null;
    coulombicEfficiency: number | null;
    currentDensity: number | null;
  };
  keyFindings: string[];
  aiEnhanced: boolean;
  source: string;
  processingDate: string;
  fullTextAvailable: boolean;
  inSilicoAvailable: boolean;
  modelType: string;
}

interface PapersState {
  // Paper data
  papers: Paper[];
  selectedPaper: Paper | null;
  totalCount: number;

  // Search and filters
  searchQuery: string;
  filters: {
    yearStart?: number;
    yearEnd?: number;
    minCitations?: number;
    minQualityScore?: number;
    hasMetrics?: boolean;
    verified?: boolean;
    systemTypes?: string[];
  };
  sort: string;

  // Pagination
  page: number;
  limit: number;

  // UI state
  viewMode: 'grid' | 'list' | 'table';
  isSearching: boolean;

  // Stats
  stats: {
    totalResults: number;
    systemTypes: Array<{ type: string; count: number }>;
    yearRange: { min: number; max: number };
  } | null;
}

interface PapersActions {
  // Paper actions
  setPapers: (papers: Paper[]) => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (id: string, updates: Partial<Paper>) => void;
  removePaper: (id: string) => void;
  setSelectedPaper: (paper: Paper | null) => void;
  setTotalCount: (count: number) => void;

  // Search and filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: PapersState['filters']) => void;
  updateFilter: <K extends keyof PapersState['filters']>(
    key: K,
    value: PapersState['filters'][K]
  ) => void;
  clearFilters: () => void;
  setSort: (sort: string) => void;

  // Pagination actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // UI actions
  setViewMode: (mode: PapersState['viewMode']) => void;
  setIsSearching: (searching: boolean) => void;

  // Stats actions
  setStats: (stats: PapersState['stats']) => void;

  // Complex actions
  searchPapers: (params?: {
    query?: string;
    filters?: PapersState['filters'];
    page?: number;
    limit?: number;
    sort?: string;
  }) => Promise<void>;
  loadPaperDetails: (paperId: string) => Promise<void>;
}

export const usePapersStore = create<PapersState & PapersActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        papers: [],
        selectedPaper: null,
        totalCount: 0,
        searchQuery: '',
        filters: {},
        sort: 'relevance',
        page: 0,
        limit: 40,
        viewMode: 'grid',
        isSearching: false,
        stats: null,

        // Paper actions
        setPapers: (papers) =>
          set((state) => {
            state.papers = papers;
          }),

        addPaper: (paper) =>
          set((state) => {
            state.papers.unshift(paper);
            state.totalCount += 1;
          }),

        updatePaper: (id, updates) =>
          set((state) => {
            const index = state.papers.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.papers[index] = { ...state.papers[index], ...updates };
            }

            if (state.selectedPaper?.id === id) {
              state.selectedPaper = { ...state.selectedPaper, ...updates };
            }
          }),

        removePaper: (id) =>
          set((state) => {
            state.papers = state.papers.filter((p) => p.id !== id);
            state.totalCount = Math.max(0, state.totalCount - 1);

            if (state.selectedPaper?.id === id) {
              state.selectedPaper = null;
            }
          }),

        setSelectedPaper: (paper) =>
          set((state) => {
            state.selectedPaper = paper;
          }),

        setTotalCount: (count) =>
          set((state) => {
            state.totalCount = count;
          }),

        // Search and filter actions
        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
            state.page = 0; // Reset to first page on new search
          }),

        setFilters: (filters) =>
          set((state) => {
            state.filters = filters;
            state.page = 0; // Reset to first page on filter change
          }),

        updateFilter: (key, value) =>
          set((state) => {
            if (value === undefined || value === null) {
              delete state.filters[key];
            } else {
              (state.filters as any)[key] = value;
            }
            state.page = 0; // Reset to first page on filter change
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {};
            state.page = 0;
          }),

        setSort: (sort) =>
          set((state) => {
            state.sort = sort;
            state.page = 0; // Reset to first page on sort change
          }),

        // Pagination actions
        setPage: (page) =>
          set((state) => {
            state.page = page;
          }),

        setLimit: (limit) =>
          set((state) => {
            state.limit = limit;
            state.page = 0; // Reset to first page on limit change
          }),

        nextPage: () =>
          set((state) => {
            const maxPage = Math.ceil(state.totalCount / state.limit) - 1;
            if (state.page < maxPage) {
              state.page += 1;
            }
          }),

        previousPage: () =>
          set((state) => {
            if (state.page > 0) {
              state.page -= 1;
            }
          }),

        // UI actions
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),

        setIsSearching: (searching) =>
          set((state) => {
            state.isSearching = searching;
          }),

        // Stats actions
        setStats: (stats) =>
          set((state) => {
            state.stats = stats;
          }),

        // Complex actions
        searchPapers: async (params) => {
          const { searchQuery, filters, page, limit, sort } = get();

          set((state) => {
            state.isSearching = true;
          });

          try {
            const queryParams = new URLSearchParams();

            // Add search query
            if (params?.query !== undefined ? params.query : searchQuery) {
              queryParams.append('search', params?.query || searchQuery);
            }

            // Add filters
            const activeFilters = params?.filters || filters;
            Object.entries(activeFilters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
              }
            });

            // Add pagination
            queryParams.append('page', String(params?.page ?? page));
            queryParams.append('limit', String(params?.limit ?? limit));
            queryParams.append('sort', params?.sort || sort);
            queryParams.append('includeStats', 'true');

            const response = await fetch(`/api/papers?${queryParams}`);
            const result = await response.json();

            if (result.error) {
              throw new Error(result.error.message);
            }

            set((state) => {
              state.papers = result.data.papers;
              state.totalCount = result.data.pagination.total;
              state.stats = result.data.stats;
              state.isSearching = false;
            });
          } catch (error) {
            console.error('Failed to search papers:', error);
            set((state) => {
              state.isSearching = false;
            });
            throw error;
          }
        },

        loadPaperDetails: async (paperId) => {
          try {
            const response = await fetch(`/api/papers/${paperId}`);
            const result = await response.json();

            if (result.error) {
              throw new Error(result.error.message);
            }

            // Transform the paper data to match the frontend format
            const paper: Paper = {
              id: result.data.id,
              title: result.data.title,
              authors: JSON.parse(result.data.authors || '[]').map((name: string) => ({
                name,
                affiliation: '',
              })),
              abstract: result.data.abstract || '',
              year: new Date(result.data.publicationDate).getFullYear(),
              journal: {
                name: result.data.journal || '',
                impactFactor: 0,
              },
              doi: result.data.doi || '',
              url: result.data.externalUrl || '',
              pdfUrl: result.data.externalUrl || '',
              citation: {
                citationCount: result.data.powerOutput || 0,
                hIndex: 0,
                scholarProfile: '',
              },
              qualityScore: (result.data.aiConfidence || 0) * 100,
              aiConfidenceScore: (result.data.aiConfidence || 0) * 100,
              verified: result.data.isPublic,
              researchFocus: result.data.systemType ? [result.data.systemType] : [],
              performanceMetrics: {
                maxPowerDensity: result.data.powerOutput,
                coulombicEfficiency: result.data.efficiency,
                currentDensity: null,
              },
              keyFindings: JSON.parse(result.data.aiKeyFindings || '[]'),
              aiEnhanced: !!result.data.aiSummary,
              source: result.data.source || 'database',
              processingDate: result.data.createdAt,
              fullTextAvailable: !!result.data.externalUrl,
              inSilicoAvailable: result.data.inSilicoAvailable || false,
              modelType: result.data.modelType || '',
            };

            set((state) => {
              state.selectedPaper = paper;
            });
          } catch (error) {
            console.error('Failed to load paper details:', error);
            throw error;
          }
        },
      }))
    ),
    {
      name: 'MessAI Papers Store',
    }
  )
);

// Selectors
export const selectPapers = (state: PapersState & PapersActions) => state.papers;
export const selectSelectedPaper = (state: PapersState & PapersActions) => state.selectedPaper;
export const selectPagination = (state: PapersState & PapersActions) => ({
  page: state.page,
  limit: state.limit,
  total: state.totalCount,
  pages: Math.ceil(state.totalCount / state.limit),
});
export const selectActiveFiltersCount = (state: PapersState & PapersActions) =>
  Object.values(state.filters).filter((v) => v !== undefined && v !== null).length;
