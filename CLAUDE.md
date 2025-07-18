# [MESSAI.AI] - AI Context Template (claude-master)

## 1. Project Overview

- **Vision:** To democratize microbial electrochemical systems research,
  development, education and commericalization by creating the world's most
  comprehensive, AI-powered platform that unifies and standardizes knowledge
  extraction, experimentation, and design, accelerating the transition to
  sustainable energy solutions.

- **Mission:** MESSAI empowers researchers, engineers, and innovators worldwide
  with cutting-edge tools for designing, simulating, and optimizing
  electrochemical systems through intelligent 3D modeling, AI-driven
  predictions, and collaborative research capabilities.

- **Value Proposition**

  MESSAI bridges the gap between complex electrochemical theory and practical
  implementation by providing:
  - Unified Platform: Single interface and intelligent database for both
    microbial (MFC, MEC, MDC) and fuel cell (PEM, SOFC, PAFC), and
    electrochemical bioreactor systems
  - AI Intelligence: Machine learning models trained on 3,721+ research papers
    for accurate predictions
  - 3D Visualization: Interactive, real-time system modeling and visualization
  - Knowledge Base: Comprehensive research library with AI-enhanced insights
  - Collaborative Tools: Experiment tracking, sharing, and team collaboration
    features

## 7. Research Library Database Integration (CRITICAL FOR AI AGENTS)

### Database Architecture

MESSAI uses **PostgreSQL exclusively** for both local development and
production, containing **3,721 research papers** with comprehensive MES-specific
data.

**Environment Setup:**

- **Local Development**: Docker PostgreSQL container (`localhost:5432`)
- **Production**: Hosted PostgreSQL service (configured in Vercel environment)
- **Model**: `ResearchPaper` (NOT `Paper` - this is critical!)

### Database Connection

```typescript
// Always use the configured client
import { prisma } from '@messai/database';
// OR for API routes
import { prisma } from '../../../lib/db';

// Test connection
const count = await prisma.researchPaper.count(); // Should return 3,721
```

### Environment Setup

**Local Development**:

```bash
# 1. Setup local PostgreSQL with Docker
pnpm db:setup:local

# 2. Copy environment template
cp .env.local.example .env.local

# This automatically:
# - Starts Docker PostgreSQL container on localhost:5432
# - Database: messai_dev, User: messai, Password: messai_dev_password
# - Pushes schema to local database
```

**Production Environment**:

- Uses hosted PostgreSQL service (Supabase, Neon, Railway, etc.)
- Configured in Vercel environment variables
- Automatic connection pooling and optimization
- Contains 3,721+ research papers

### Database Management Commands

**Local Development**:

```bash
# Start/stop local PostgreSQL
pnpm db:local:start
pnpm db:local:stop
pnpm db:local:restart

# Database operations
pnpm db:push          # Push schema changes
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio

# Backup and restore
pnpm db:backup        # Create backup
pnpm db:restore       # Restore from backup
pnpm db:backup:verify # Verify backup integrity
```

### Critical Field Mappings (API vs Database)

When working with the research papers API, understand these key mappings:

**Database Schema → API Response:**

- `publicationDate` → Extract `year` via `new Date().getFullYear()`
- `aiConfidence` (0-1) → `qualityScore` (0-100) via `* 100`
- `powerOutput` → Used as proxy for `citationCount`
- `isPublic` → Used as proxy for `verified`
- `externalUrl` → Maps to both `url` and `pdfUrl`
- `abstract` → Clean JATS XML tags before serving
- `authors` → Parse JSON string to array format

**JATS XML Cleaning:**

```typescript
const cleanAbstract = (text: string) => {
  return text
    .replace(/<jats:[^>]*>/g, '') // Remove opening JATS tags
    .replace(/<\/jats:[^>]*>/g, '') // Remove closing JATS tags
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML/XML tags
    .trim();
};
```

### API Endpoint Structure

- **Endpoint**: `/api/papers`
- **Method**: GET
- **Query Params**: `search`, `sort`, `page`, `limit`, `yearStart`, `yearEnd`,
  etc.
- **Response Format**:

```typescript
{
  data: {
    papers: ResearchPaper[], // 40 per page by default
    pagination: { page, limit, total, pages },
    stats: { totalResults, systemTypes, yearRange },
    searchTime: number,
    suggestions?: string[]
  },
  error: null
}
```

### System Type Distribution

- **MFC**: 677 papers (Microbial Fuel Cells)
- **BES**: 184 papers (Bioelectrochemical Systems)
- **MEC**: 116 papers (Microbial Electrolysis Cells)
- **MES**: 33 papers (Microbial Electrochemical Systems)
- **MDC**: 9 papers (Microbial Desalination Cells)

### Environment Configuration

**Required Environment Variables:**

- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct PostgreSQL connection (same as DATABASE_URL)
- `FORCE_POSTGRES=true`: Forces PostgreSQL in development
- `NODE_ENV`: development/production

**Testing Commands:**

```bash
pnpm db:test          # Test database connection
pnpm db:generate      # Generate Prisma client
curl localhost:3000/api/db-test  # Test API connection
```

### Common Issues & Solutions

**Problem**: "Module not found: @messai/database" **Solution**: Ensure
TypeScript paths are configured:

```json
// tsconfig.base.json
"paths": {
  "@messai/database": ["libs/data-access/database/src/index.ts"]
}
```

**Problem**: "Unknown argument qualityScore" **Solution**: Use correct
ResearchPaper model fields (see mappings above)

**Problem**: "Invalid DATABASE_URL" **Solution**: Ensure environment variables
are loaded:

- Next.js: Uses `.env.local` automatically
- Scripts: Use `dotenv -e .env --` prefix or `require('dotenv').config()`

### Research Library Instructions

- **NEVER** generate mock data or research papers
- **ALWAYS** use ResearchPaper model (not Paper)
- **ALWAYS** verify API nomenclature matches database fields
- **ALWAYS** clean JATS XML from abstracts before display
- **ALWAYS** check environment variables are loaded properly

## Development Deployment Memories

- remember we use local docker then production prisma
