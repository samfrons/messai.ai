# Merge Conflict Analysis: autowork → deployment

## Overview

Analysis of potential merge conflicts when merging `autowork` branch into
`deployment` branch.

## Key Files with Conflicts

### 1. **prisma/schema.prisma** (CRITICAL CONFLICT)

- **autowork**: Changed `Paper` model to `ResearchPaper`, switched to PostgreSQL
- **deployment**: Also switched to PostgreSQL but kept different schema
  structure
- **Conflict Type**: Schema model naming and structure differences

### 2. **API Routes** (MAJOR CONFLICTS)

#### apps/web/src/app/api/papers/route.ts

- **autowork**: Simple rename of `prisma.paper` to `prisma.researchPaper`
- **deployment**: Complete rewrite with new query structure, filters, and
  response format
- **Conflict Type**: Complete implementation divergence

#### apps/web/src/app/api/predictions/route.ts

- **autowork**: Disabled the endpoint (returns 501)
- **deployment**: Deleted the file entirely
- **Conflict Type**: File deletion vs modification

#### apps/web/src/app/api/predictions/[id]/route.ts

- **autowork**: Disabled the endpoint (returns 501)
- **deployment**: Likely deleted (need to verify)
- **Conflict Type**: File deletion vs modification

### 3. **Database Library** (NEW IN DEPLOYMENT)

- **autowork**: No database library changes
- **deployment**: Added new database library at `libs/data-access/database/`
- **Conflict Type**: New files in deployment not in autowork

### 4. **Component Files** (MINOR CONFLICTS)

The following component files were modified in both branches:

- apps/web/src/app/lab/components/PerformanceOverlay.tsx
- apps/web/src/app/lab/components/models/BenchtopReactor.tsx
- apps/web/src/app/lab/components/models/MicrofluidicCell.tsx
- apps/web/src/app/lab/components/models/StackedFuelCell.tsx
- apps/web/src/app/lab/page.tsx
- apps/web/src/app/predictions/page.tsx
- apps/web/src/components/parameters/detail-sections/\*.tsx (multiple files)

## Conflict Resolution Strategy

### 1. Schema Conflicts (prisma/schema.prisma)

**Recommendation**: Keep deployment's PostgreSQL configuration but apply
autowork's model renaming

- Keep deployment's generator output and datasource configuration
- Apply autowork's `Paper` → `ResearchPaper` rename throughout
- Merge any additional schema changes from both branches

### 2. API Route Conflicts

**For papers API route**:

- Keep deployment's enhanced implementation
- Apply autowork's model rename (`paper` → `researchPaper`)
- Ensure all references use `ResearchPaper` model

**For predictions API routes**:

- Since both branches effectively disable predictions (autowork returns 501,
  deployment deletes)
- Recommendation: Delete the prediction routes entirely as deployment does

### 3. Database Library

- Keep deployment's new database library structure
- No conflict here, just new files to include

### 4. Component Conflicts

- Need to manually review each component file
- Likely minor changes that can be merged

## Commands to Identify Specific Conflicts

```bash
# To see detailed conflicts for a specific file:
git diff autowork deployment -- <file-path>

# To attempt merge and see conflicts:
git checkout deployment
git merge autowork --no-commit --no-ff
git status

# To see three-way diff for conflicted files:
git diff --cc <file-path>
```

## Risk Assessment

- **High Risk**: prisma/schema.prisma, API routes
- **Medium Risk**: Component files
- **Low Risk**: New files in deployment (no conflicts)

## Next Steps

1. Review each conflicted file individually
2. Create a merge strategy document
3. Test the merged code thoroughly
4. Ensure database migrations work correctly
