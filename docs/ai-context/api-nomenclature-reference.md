# API Nomenclature Reference

## Critical Database Field Mappings

**⚠️ IMPORTANT**: The database uses `ResearchPaper` model, NOT `Paper`. Always
verify field names before API development.

### Database Schema → API Response Mappings

| Database Field    | API Response Field                       | Type    | Transformation             |
| ----------------- | ---------------------------------------- | ------- | -------------------------- |
| `id`              | `id`                                     | string  | Direct                     |
| `title`           | `title`                                  | string  | Direct                     |
| `abstract`        | `abstract`                               | string  | **Clean JATS XML**         |
| `authors`         | `authors`                                | array   | **Parse JSON → objects**   |
| `publicationDate` | `year`                                   | number  | **Extract year**           |
| `journal`         | `journal.name`                           | string  | Direct                     |
| `doi`             | `doi`                                    | string  | Direct                     |
| `externalUrl`     | `url`, `pdfUrl`                          | string  | **Same value both fields** |
| `systemType`      | `researchFocus[0]`                       | string  | **Array wrapper**          |
| `powerOutput`     | `citation.citationCount`                 | number  | **Proxy mapping**          |
| `efficiency`      | `performanceMetrics.coulombicEfficiency` | number  | Direct                     |
| `aiConfidence`    | `qualityScore`                           | number  | **Scale 0-1 → 0-100**      |
| `aiConfidence`    | `aiConfidenceScore`                      | number  | **Scale 0-1 → 0-100**      |
| `isPublic`        | `verified`                               | boolean | **Proxy mapping**          |
| `aiSummary`       | `aiEnhanced`                             | boolean | **Existence check**        |
| `aiKeyFindings`   | `keyFindings`                            | array   | **Parse JSON**             |
| `source`          | `source`                                 | string  | Direct                     |
| `createdAt`       | `processingDate`                         | string  | **ISO string**             |
| `externalUrl`     | `hasFullText`                            | boolean | **Existence check**        |

### Transformations Required

#### 1. JATS XML Cleaning

```typescript
const cleanAbstract = (text: string) => {
  return text
    .replace(/<jats:[^>]*>/g, '') // Remove opening JATS tags
    .replace(/<\/jats:[^>]*>/g, '') // Remove closing JATS tags
    .replace(/<[^>]*>/g, '') // Remove remaining HTML/XML
    .trim();
};
```

#### 2. Authors JSON Parsing

```typescript
let authorsList: string[] = [];
if (Array.isArray(paper.authors)) {
  authorsList = paper.authors;
} else if (typeof paper.authors === 'string') {
  try {
    authorsList = JSON.parse(paper.authors);
  } catch {
    authorsList = [paper.authors];
  }
}
const transformedAuthors = authorsList.map((name) => ({
  name,
  affiliation: '',
}));
```

#### 3. Year Extraction

```typescript
const year = paper.publicationDate
  ? new Date(paper.publicationDate).getFullYear()
  : null;
```

#### 4. Quality Score Scaling

```typescript
const qualityScore = (paper.aiConfidence || 0) * 100; // 0-1 → 0-100
```

#### 5. Key Findings Parsing

```typescript
let keyFindings: string[] = [];
if (paper.aiKeyFindings) {
  try {
    keyFindings = JSON.parse(paper.aiKeyFindings as string);
  } catch {
    keyFindings = [];
  }
}
```

## API Response Structure Template

```typescript
// Complete API response structure
{
  data: {
    papers: [
      {
        id: string,
        title: string,
        authors: [{ name: string, affiliation: string }],
        abstract: string, // JATS-cleaned
        year: number, // from publicationDate
        journal: { name: string, impactFactor: number },
        doi: string,
        url: string, // externalUrl
        pdfUrl: string, // externalUrl
        citation: {
          citationCount: number, // powerOutput proxy
          hIndex: number, // 0
          scholarProfile: string // ""
        },
        qualityScore: number, // aiConfidence * 100
        aiConfidenceScore: number, // aiConfidence * 100
        verified: boolean, // isPublic
        researchFocus: [string], // [systemType]
        performanceMetrics: {
          maxPowerDensity: number, // powerOutput
          coulombicEfficiency: number, // efficiency
          currentDensity: null // Not available
        },
        keyFindings: [string], // parsed aiKeyFindings
        aiEnhanced: boolean, // !!aiSummary
        source: string,
        processingDate: string, // createdAt ISO
        hasFullText: boolean // !!externalUrl
      }
    ],
    pagination: {
      page: number,
      limit: number,
      total: number,
      pages: number
    },
    stats: {
      totalResults: number,
      systemTypes: [{ type: string, count: number }],
      yearRange: { min: number, max: number }
    },
    searchTime: number,
    suggestions?: [string]
  },
  error: null
}
```

## Common Mistakes to Avoid

### ❌ Wrong Model

```typescript
// WRONG - Paper model doesn't exist
await prisma.paper.findMany();

// CORRECT - Use ResearchPaper
await prisma.researchPaper.findMany();
```

### ❌ Wrong Field Names

```typescript
// WRONG - These fields don't exist
select: {
  year: true,           // Use publicationDate
  qualityScore: true,   // Use aiConfidence
  citationCount: true,  // Use powerOutput
  verified: true,       // Use isPublic
  url: true            // Use externalUrl
}

// CORRECT
select: {
  publicationDate: true,
  aiConfidence: true,
  powerOutput: true,
  isPublic: true,
  externalUrl: true
}
```

### ❌ Missing Transformations

```typescript
// WRONG - Direct field mapping
return {
  abstract: paper.abstract, // Contains JATS XML
  authors: paper.authors, // JSON string
  year: paper.year, // Field doesn't exist
};

// CORRECT - Apply transformations
return {
  abstract: cleanAbstract(paper.abstract || ''),
  authors: JSON.parse(paper.authors || '[]').map((name) => ({
    name,
    affiliation: '',
  })),
  year: paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 0,
};
```

## Database Statistics (Current)

- **Total Papers**: 3,721
- **System Types**:
  - MFC: 677 papers
  - BES: 184 papers
  - MEC: 116 papers
  - MES: 33 papers
  - MDC: 9 papers
- **Sources**: crossref_comprehensive, crossref_api, pubmed_api, etc.
- **Year Range**: 1932 - 2025

## Quick Validation Commands

```bash
# Test database connection
pnpm db:test

# Test API endpoint
curl "localhost:3000/api/papers?limit=1" | jq '.data.papers[0].title'

# Test field mapping
curl "localhost:3000/api/papers?search=fuel&limit=2" | jq '.data'
```

This reference ensures consistent API development and prevents common field
mapping errors.
