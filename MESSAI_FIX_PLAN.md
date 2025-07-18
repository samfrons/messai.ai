# MESSAI Platform Fix Plan - Context Transfer

## Analysis Summary

We've completed comprehensive analysis of the MESSAI platform and identified
critical issues across:

- Frontend UI/UX components
- API endpoints and backend services
- Database schema and performance
- Authentication and security
- Build and deployment configuration

## Critical Issues to Fix (Priority Order)

### 1. TypeScript & Build Errors

- Remove problematic path from tsconfig.json:
  `../../dist/apps/web/.next/types/**/*.ts`
- Export ActiveFilterTags from UI library (@messai/ui)
- Fix className vs class issues in JSX

### 2. Security Vulnerabilities

- Remove all console.log statements (100+ instances)
- Fix exposed env vars in /api/db-test/route.ts
- Add auth middleware to protect API routes
- Update esbuild security vulnerability

### 3. Database Critical Issues

- Generate Prisma migrations (currently using destructive db push)
- Fix field mappings: powerOutput→citationCount, aiConfidence→qualityScore
- Add composite indexes for search performance

### 4. API Improvements

- Add Zod validation to all endpoints
- Fix TypeScript 'any' types throughout
- Implement proper error handling
- Add rate limiting

### 5. Frontend Fixes

- Fix missing responsive design
- Update component imports to use aliases
- Fix broken features (export, auth flows)

### 6. Dependencies Update

- Nx packages: 21.2.3 → 21.2.4
- @swc/core: 1.5.29 → 1.12.14
- Next.js: 15.2.5 → 15.4.1
- Prisma: 6.11.1 → 6.12.0

## Working Instructions

1. Create new branch: `git checkout -b fix/platform-issues`
2. Make fixes in priority order
3. Test each fix thoroughly
4. Commit atomically with clear messages
5. Run full test suite before merging

## Key Files to Fix

**TypeScript Config**: `/tsconfig.json` - Remove problematic path **UI
Exports**: `/libs/shared/ui/src/index.ts` - Export ActiveFilterTags **API
Security**: `/apps/web/src/app/api/db-test/route.ts` - Remove env exposure
**Database Schema**: `/prisma/schema.prisma` - Add indexes **API Routes**:
`/apps/web/src/app/api/papers/route.ts` - Add validation

## Testing Checklist

- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] API endpoints return proper data
- [ ] Frontend loads without console errors
- [ ] Database queries are performant

## Environment Notes

- Production DB has 3,721 research papers
- Use FORCE_POSTGRES=true for local PostgreSQL
- Test with both development and production configs
