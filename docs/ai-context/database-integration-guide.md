# Database Integration Guide for AI Agents

## Overview

This guide provides essential context for AI agents working with MESSAI's
research paper database. The database contains **3,721 research papers** focused
on microbial electrochemical systems (MES).

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL (Prisma Data Platform)
- **ORM**: Prisma Client
- **Schema**: ResearchPaper model with MES-specific fields
- **Connection**: Environment-based configuration with fallbacks

### Key Models

```prisma
model ResearchPaper {
  id                String            @id @default(cuid())
  title             String
  authors           String            // JSON array
  abstract          String?
  doi               String?           @unique
  publicationDate   DateTime?
  journal           String?
  externalUrl       String

  // MES-specific fields
  systemType        String?           // MFC, MEC, MDC, MES, BES
  powerOutput       Float?            // mW/m²
  efficiency        Float?            // percentage

  // AI-generated fields
  aiSummary         String?
  aiKeyFindings     String?
  aiConfidence      Float?            // 0-1 scale

  // Metadata
  source            String            // 'crossref_comprehensive', etc.
  isPublic          Boolean           @default(true)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}
```

## Critical Field Mappings

When building API responses, these mappings are essential:

| Database Field    | API Response Field | Transformation                              |
| ----------------- | ------------------ | ------------------------------------------- |
| `publicationDate` | `year`             | `new Date(publicationDate).getFullYear()`   |
| `aiConfidence`    | `qualityScore`     | `aiConfidence * 100` (0-1 → 0-100)          |
| `powerOutput`     | `citationCount`    | Direct mapping (proxy)                      |
| `isPublic`        | `verified`         | Direct mapping (proxy)                      |
| `externalUrl`     | `url`, `pdfUrl`    | Same value for both                         |
| `abstract`        | `abstract`         | Clean JATS XML tags                         |
| `authors`         | `authors`          | Parse JSON → array of `{name, affiliation}` |

## JATS XML Cleaning

Research paper abstracts contain JATS XML markup that must be cleaned:

```typescript
const cleanAbstract = (text: string) => {
  if (!text) return '';
  return text
    .replace(/<jats:[^>]*>/g, '') // Remove opening JATS tags
    .replace(/<\/jats:[^>]*>/g, '') // Remove closing JATS tags
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML/XML tags
    .trim();
};
```

**Example:**

- **Before**:
  `<jats:title>Abstract</jats:title><jats:p>Platinum nanoparticles...`
- **After**: `AbstractPlatinum nanoparticles...`

## API Response Structure

The `/api/papers` endpoint returns:

```typescript
{
  data: {
    papers: Array<{
      id: string;
      title: string;
      authors: Array<{name: string, affiliation: string}>;
      abstract: string; // JATS-cleaned
      year: number; // Extracted from publicationDate
      journal: {name: string, impactFactor: number};
      doi: string;
      url: string; // externalUrl
      pdfUrl: string; // externalUrl
      citation: {
        citationCount: number; // powerOutput proxy
        hIndex: number;
        scholarProfile: string;
      };
      qualityScore: number; // aiConfidence * 100
      verified: boolean; // isPublic
      researchFocus: string[]; // [systemType]
      performanceMetrics: {
        maxPowerDensity: number; // powerOutput
        coulombicEfficiency: number; // efficiency
        currentDensity: null; // Not available
      };
      keyFindings: string[]; // Parsed aiKeyFindings JSON
      aiEnhanced: boolean; // !!aiSummary
      source: string;
      processingDate: string; // createdAt ISO
      fullTextAvailable: boolean; // !!externalUrl
    }>,
    pagination: {
      page: number;
      limit: number;
      total: number; // Total count
      pages: number; // Math.ceil(total / limit)
    },
    stats: {
      totalResults: number;
      systemTypes: Array<{type: string, count: number}>;
      yearRange: {min: number, max: number};
    },
    searchTime: number;
    suggestions?: string[];
  },
  error: null
}
```

## Database Statistics

Current research paper distribution:

- **Total Papers**: 3,721
- **MFC** (Microbial Fuel Cells): 677 papers
- **BES** (Bioelectrochemical Systems): 184 papers
- **MEC** (Microbial Electrolysis Cells): 116 papers
- **MES** (Microbial Electrochemical Systems): 33 papers
- **MDC** (Microbial Desalination Cells): 9 papers

## Environment Configuration

### Required Variables

```bash
DATABASE_URL="postgres://[credentials]@db.prisma.io:5432/?sslmode=require"
DIRECT_URL="postgres://[credentials]@db.prisma.io:5432/?sslmode=require"
FORCE_POSTGRES=true
NODE_ENV=development
```

### Environment Loading

- **Next.js API Routes**: Automatically loads `.env.local`
- **Standalone Scripts**: Use `dotenv -e .env --` or
  `require('dotenv').config()`
- **Package.json Scripts**: Already configured with dotenv-cli

## Common Issues & Solutions

### Module Resolution Error

```
Error: Module not found: Can't resolve '@messai/database'
```

**Solution**: Check TypeScript path configuration:

```json
// tsconfig.base.json and apps/web/tsconfig.json
"paths": {
  "@messai/database": ["libs/data-access/database/src/index.ts"]
}
```

### Database Field Error

```
Error: Unknown argument `qualityScore`
```

**Solution**: Use correct ResearchPaper model fields:

- ❌ `qualityScore` → ✅ `aiConfidence`
- ❌ `citationCount` → ✅ `powerOutput`
- ❌ `verified` → ✅ `isPublic`
- ❌ `year` → ✅ `publicationDate`

### Environment Variable Error

```
Error: DATABASE_URL must start with protocol postgresql://
```

**Solution**: Ensure environment variables are loaded:

1. Check `.env.local` exists in `/apps/web/`
2. For scripts: Use `pnpm db:test` (pre-configured)
3. Verify `FORCE_POSTGRES=true` is set

## Testing Commands

```bash
# Test database connection
pnpm db:test

# Generate Prisma client
pnpm db:generate

# Test API endpoint
curl "http://localhost:3000/api/papers?limit=1"

# Test database via API
curl "http://localhost:3000/api/db-test"
```

## Best Practices for Agents

1. **Always use ResearchPaper model** (never Paper)
2. **Always verify field mappings** before API work
3. **Always clean JATS XML** from abstracts
4. **Always test database connection** before proceeding
5. **Never generate mock data** - use real database
6. **Always check environment variables** are loaded
7. **Always handle pagination** properly (40 per page default)

## Quick Reference

```typescript
// ✅ Correct database usage
const papers = await prisma.researchPaper.findMany({
  where: { systemType: 'MFC' },
  select: {
    id: true,
    title: true,
    publicationDate: true, // NOT year
    aiConfidence: true, // NOT qualityScore
    powerOutput: true, // Use as citationCount proxy
    isPublic: true, // Use as verified proxy
    abstract: true, // Clean JATS XML
    authors: true, // Parse JSON string
  },
});

// ✅ Correct response transformation
const transformedPaper = {
  year: paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 0,
  qualityScore: (paper.aiConfidence || 0) * 100,
  citationCount: paper.powerOutput || 0,
  verified: paper.isPublic,
  abstract: cleanAbstract(paper.abstract || ''),
  authors: JSON.parse(paper.authors || '[]').map((name) => ({
    name,
    affiliation: '',
  })),
};
```

This guide ensures consistent, error-free database integration across all AI
agent interactions with the MESSAI research library.
