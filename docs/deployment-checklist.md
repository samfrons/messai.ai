# Vercel Deployment Checklist

## Pre-Deployment Verification

### 1. Prisma Configuration

- [ ] Ensure `prisma/schema.prisma` does NOT have custom output path
- [ ] All Prisma imports use `@prisma/client` (not custom paths)
- [ ] No reference to `schema.production.prisma` in package.json scripts
- [ ] Verify postinstall/prebuild scripts use: `prisma generate` (default schema
      location)

### 2. API Routes

- [ ] Verify all database model fields exist in schema before querying
- [ ] Remove queries for non-existent fields (e.g., inSilicoAvailable,
      modelType)
- [ ] Check that all relations (e.g., user, experiments) exist in models

### 3. Type Compatibility

- [ ] NextAuth PrismaAdapter imports standard `@prisma/client`
- [ ] No type assertions needed for PrismaClient
- [ ] All imports resolve correctly

### 4. Build Testing

```bash
# Local build test commands
pnpm install
pnpm db:generate
pnpm build
```

### 5. Common Issues and Fixes

#### Issue: "Could not load schema from provided path"

**Fix**: Remove references to `schema.production.prisma`

#### Issue: "Property 'researchPaper' does not exist"

**Fix**: Use standard `@prisma/client` imports, not custom paths

#### Issue: "Type 'PrismaClient' is not assignable"

**Fix**: Remove custom output from Prisma schema generator

#### Issue: "Object literal may only specify known properties"

**Fix**: Remove queries for fields that don't exist in the database schema

## Environment Variables

Ensure these are set in Vercel:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - Generated secret
- `GITHUB_ID` - OAuth app ID
- `GITHUB_SECRET` - OAuth app secret

## Post-Deployment

- [ ] Check Vercel build logs for any warnings
- [ ] Test authentication flow
- [ ] Verify database connectivity with `/api/db-test`
- [ ] Check research papers API at `/api/papers`
