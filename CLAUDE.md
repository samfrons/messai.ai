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
  - AI Intelligence: Machine learning models trained on 4,087+ research papers
    for accurate predictions
  - 3D Visualization: Interactive, real-time system modeling and visualization
  - Knowledge Base: Comprehensive research library with AI-enhanced insights
  - Collaborative Tools: Experiment tracking, sharing, and team collaboration
    features

[... rest of existing content remains unchanged ...]

## 7. Research Library Database Integration (CRITICAL FOR AI AGENTS)

### ⚠️ CRITICAL: Environment-Specific Database Configuration ⚠️

**ALWAYS verify which environment you're working with before running ANY
database commands.**

### Database Architecture

MESSAI uses **PostgreSQL exclusively** but with DIFFERENT data in each
environment:

#### 🏠 LOCAL DEVELOPMENT DATABASE

- **Container**: Docker PostgreSQL (`localhost:5432`)
- **Database Name**: `messai_dev`
- **Credentials**: User: `messai`, Password: `messai_dev_password`
- **Data**: Contains **1000 research papers** (subset for development)
- **Connection**:
  `postgresql://messai:messai_dev_password@localhost:5432/messai_dev`
- **Safe for**: ALL operations - migrations, seeds, experiments, destructive
  commands
- **Setup**: Run `pnpm db:setup:local` then `pnpm db:restore`

#### 🌐 PRODUCTION DATABASE

- **Host**: Managed PostgreSQL service (Supabase/Neon/Railway)
- **Database Name**: Configured in Vercel environment
- **Credentials**: **NEVER hardcode** - use environment variables ONLY
- **Data**: Contains **4,087+ research papers** (LIVE DATA - DO NOT MODIFY)
- **Connection**: Via `DATABASE_URL` environment variable ONLY
- **Safe for**: **READ-ONLY operations ONLY**
- **Access**: Through deployed API endpoints only

**Model**: Always use `ResearchPaper` (NOT `Paper` - this is critical!)

### Database Connection

#### Import Path Guidelines

```typescript
// For library code (libs/* directories):
import { prisma } from '@messai/database';

// For API routes (apps/web/src/app/api/*):
import { prisma } from '../../../lib/db';

// Test connection - count will vary by environment:
const count = await prisma.researchPaper.count();
// Local: Returns ~1000
// Production: Returns 4,087+
```

#### Environment Verification

```typescript
// ALWAYS verify environment before operations
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

if (
  isProduction ||
  databaseUrl?.includes('supabase') ||
  databaseUrl?.includes('neon')
) {
  console.warn('⚠️ PRODUCTION DATABASE - READ ONLY!');
  // Only perform read operations
}
```

### Environment Setup

#### 🏠 Local Development Setup

```bash
# 1. Setup local PostgreSQL with Docker
pnpm db:setup:local
# This command:
# - Copies .env.development.local to .env.local (WARNING: overwrites existing)
# - Starts Docker PostgreSQL container on localhost:5432
# - Creates database: messai_dev
# - Pushes Prisma schema

# 2. Restore research papers data (1000 papers)
pnpm db:restore
# This populates your local database with development data

# 3. Verify connection
pnpm db:test
# Should show: "Total ResearchPapers in database: 1,000"
```

#### 🌐 Production Environment

**⚠️ NEVER run setup commands against production!**

- Hosted PostgreSQL service (configured in Vercel)
- Environment variables set in Vercel dashboard
- Contains 4,087+ LIVE research papers
- Automatic connection pooling
- **Access via deployed API only** - no direct database access

### Database Management Commands

#### 🏠 LOCAL-ONLY Commands (NEVER use on production)

```bash
# Container management
pnpm db:local:start     # Start Docker PostgreSQL
pnpm db:local:stop      # Stop Docker PostgreSQL
pnpm db:local:reset     # Reset database (DESTROYS ALL DATA)

# Schema modifications (LOCAL ONLY)
pnpm db:push            # Push schema changes
pnpm db:migrate         # Run migrations
pnpm db:seed            # Seed test data
pnpm db:restore         # Restore from backup

# Development tools
pnpm db:studio          # Open Prisma Studio (visual editor)
pnpm db:local:shell     # PostgreSQL shell access
```

#### ✅ Safe for Both Environments

```bash
# Read-only operations
pnpm db:generate        # Generate Prisma client
pnpm db:test           # Test connection (read-only)
pnpm db:backup         # Create backup (read-only)
pnpm db:backup:verify  # Verify backup (read-only)
```

#### 🚫 NEVER Run on Production

- `db:push` - Modifies schema
- `db:migrate` - Runs migrations
- `db:seed` - Adds test data
- `db:restore` - Overwrites data
- `db:local:reset` - Destroys database
- Any command with `local` in the name

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

#### 📋 Environment Variable Setup

**Local Development (.env.local)**:

```bash
# CRITICAL: The db:setup:local command OVERWRITES .env.local!
# Back up any custom settings before running it.

DATABASE_URL=postgresql://messai:messai_dev_password@localhost:5432/messai_dev
DIRECT_URL=postgresql://messai:messai_dev_password@localhost:5432/messai_dev
FORCE_POSTGRES=true
NODE_ENV=development
```

**Production (Vercel Environment Variables)**:

```bash
# Set in Vercel Dashboard - NEVER commit to code
DATABASE_URL=<your-production-database-url>
DIRECT_URL=<your-production-database-url>
NODE_ENV=production
```

#### 🔧 Environment Loading for Scripts

**Next.js API Routes**: Automatically loads `.env.local`

**Node.js Scripts**: Must explicitly load environment:

```javascript
// ✅ Correct - loads .env.local
require('dotenv').config({ path: '.env.local' });

// ❌ Wrong - might load wrong file
require('dotenv').config();
```

**CLI Commands**: Use dotenv prefix:

```bash
# ✅ Correct - ensures .env.local is loaded
dotenv -e .env.local -- prisma studio

# ❌ Wrong - might use wrong environment
prisma studio
```

#### 🧪 Testing Your Environment

```bash
# 1. Check which environment you're in
pnpm db:test

# 2. Verify environment variables
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
node -e "console.log('DB Host:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0])"

# 3. Test API connection
curl localhost:3000/api/db-test
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

### 🚨 Production Database Safety Guidelines 🚨

**CRITICAL**: Production contains LIVE data. Follow these rules to prevent data
loss:

#### Before ANY Database Operation

1. **Check your environment**:

   ```bash
   echo $NODE_ENV
   echo $DATABASE_URL | grep -E "(localhost|supabase|neon)"
   ```

2. **Verify paper count**:

   ```bash
   pnpm db:test
   # Local: ~1,000 papers
   # Production: 4,087+ papers
   ```

3. **Use read-only operations in production**:

   ```typescript
   // ✅ SAFE for production
   const papers = await prisma.researchPaper.findMany({ take: 10 });
   const count = await prisma.researchPaper.count();

   // ❌ NEVER in production
   await prisma.researchPaper.create(...);
   await prisma.researchPaper.update(...);
   await prisma.researchPaper.delete(...);
   ```

#### Production Access Rules

- **API Routes**: Use deployed endpoints only (`https://messai.ai/api/*`)
- **Direct Database**: NEVER connect directly to production database
- **Migrations**: Only through CI/CD pipeline with reviews
- **Backups**: Automated daily - never manual restore to production

#### If You Accidentally Connect to Production

1. **STOP** all operations immediately
2. **DO NOT** run any commands
3. **CHECK** what environment you're in
4. **SWITCH** to local: `cp .env.local.example .env.local`
5. **VERIFY** with `pnpm db:test` (should show ~1,000 papers)
