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
| `pmid`            | `pmid`                                   | string  | Direct                     |
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
| `externalUrl`     | `fullTextAvailable`                      | boolean | **Existence check**        |

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
        pmid: string,
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
        fullTextAvailable: boolean // !!externalUrl
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

## Access Full Text Functionality

### URL Field Usage

The API provides multiple URL fields for accessing research papers:

- **`fullTextAvailable`**: Boolean indicating if any URL is available
- **`url`**: Primary URL (typically DOI link)
- **`pdfUrl`**: PDF URL (same as `url` in most cases)
- **`doi`**: DOI identifier (converted to https://doi.org/{doi})
- **`pmid`**: PubMed ID (converted to https://pubmed.ncbi.nlm.nih.gov/{pmid}/)

### Frontend Implementation

The "Access Full Text" button uses this priority order:

1. `pdfUrl` (if available)
2. `url` (if available)
3. `https://doi.org/{doi}` (if DOI exists)
4. `https://pubmed.ncbi.nlm.nih.gov/{pmid}/` (if PubMed ID exists)

### Critical Frontend Mapping

Ensure the `convertToPaperData` function includes URL fields:

```typescript
// REQUIRED for Access Full Text button
doi: (paper as any).doi,
pmid: (paper as any).pmid,
url: (paper as any).url,
pdfUrl: (paper as any).pdfUrl,
```

## Database Statistics (Current)

- **Total Papers**: 4,087+
- **System Types**:
  - MFC: 677 papers
  - BES: 184 papers
  - MEC: 116 papers
  - MES: 33 papers
  - MDC: 9 papers
- **Sources**: crossref_comprehensive, crossref_api, pubmed_api, etc.
- **Year Range**: 1932 - 2025
- **URL Coverage**: 100% (all papers have accessible URLs)

## Quick Validation Commands

```bash
# Test database connection
pnpm db:test

# Test API endpoint
curl "localhost:3000/api/papers?limit=1" | jq '.data.papers[0].title'

# Test field mapping
curl "localhost:3000/api/papers?search=fuel&limit=2" | jq '.data'
```

## Troubleshooting

### "Access Full Text" Button Not Working

**Problem**: Button shows "No URL available" for papers that have URLs.

**Solution**: Check `convertToPaperData` function includes URL fields:

```typescript
// In research page, add these fields to convertToPaperData:
doi: (paper as any).doi,
pmid: (paper as any).pmid,
url: (paper as any).url,
pdfUrl: (paper as any).pdfUrl,
```

**Problem**: Button exists but nothing happens when clicked.

**Solution**: Check browser popup blockers. The function uses fallback methods:

1. `window.open()` (primary)
2. Link element click (popup blocker fallback)
3. Current window navigation (final fallback)

### API Field Mapping Errors

**Problem**: `Unknown argument` errors in Prisma queries.

**Solution**: Always use database field names, not API field names:

```typescript
// ❌ Wrong
where: {
  qualityScore: {
    gt: 50;
  }
}

// ✅ Correct
where: {
  aiConfidence: {
    gt: 0.5;
  }
}
```

**Problem**: Empty or null values in API responses.

**Solution**: Check transformations are applied correctly:

```typescript
// ❌ Wrong - missing transformation
year: paper.year; // undefined

// ✅ Correct - apply transformation
year: paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 0;
```

This reference ensures consistent API development and prevents common field
mapping errors.
