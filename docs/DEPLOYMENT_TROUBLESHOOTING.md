# Deployment Troubleshooting Guide

This guide documents common deployment issues and their solutions to prevent
future occurrences.

## Table of Contents

- [Build-Time Errors](#build-time-errors)
- [Runtime Errors](#runtime-errors)
- [Database Issues](#database-issues)
- [Best Practices](#best-practices)

---

## Build-Time Errors

### 1. pnpm Lockfile Mismatch

**Error:**

```
Cannot install with 'frozen-lockfile' because pnpm-lock.yaml is not up to date
```

**Cause:** Dependencies in package.json don't match the lockfile.

**Solution:**

```bash
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "fix: update pnpm lockfile"
```

**Prevention:**

- Always commit lockfile changes after adding/updating dependencies
- Run `pnpm install` before pushing changes

### 2. API Routes Executing During Build

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:6379 (Redis)
Error: DATABASE_URL environment variable is required
```

**Cause:** Next.js tries to execute API routes during static generation.

**Solution:** Add these exports to ALL API routes:

```typescript
// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

**Prevention:**

- Use the API route template below for all new routes
- Never import database/Redis at module level in API routes

### 3. Dynamic Import Issues in Pages

**Error:**

```
TypeError: Cannot read properties of undefined (reading 'apis')
Error occurred prerendering page "/api-docs"
```

**Cause:** Client-side libraries (like Swagger UI) being accessed during
SSR/SSG.

**Solution Options:**

**Option 1: Convert to Route Handler (Recommended for API docs)**

```typescript
// app/api-docs/route.ts
export async function GET() {
  const html = `<!DOCTYPE html>...`;
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

**Option 2: Use Client Component with Guards**

```typescript
'use client';
import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
```

---

## Runtime Errors

### 1. Maximum Call Stack Size Exceeded

**Error:**

```
RangeError: Maximum call stack size exceeded
```

**Common Causes:**

1. Infinite loops in React hooks
2. Circular references in Proxy objects
3. Recursive function calls without base case

**Solutions:**

**For React Hooks:**

```typescript
// ❌ BAD - Creates infinite loop
const executeSearch = useCallback(async () => {
  // ...
}, [searchState]); // Dependencies cause recreation

// ✅ GOOD - Use ref for current state
const searchStateRef = useRef(searchState);
useEffect(() => {
  searchStateRef.current = searchState;
}, [searchState]);

const executeSearch = useCallback(async () => {
  const state = searchStateRef.current;
  // ...
}, []); // No dependencies
```

**For Database Clients:**

```typescript
// ❌ BAD - Proxy can cause recursion
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return prisma[prop]; // Circular reference!
  },
});

// ✅ GOOD - Direct instantiation
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
```

### 2. Database Connection Errors

**Prevention:**

- Always use lazy imports in API routes
- Never initialize database connections at module level
- Use connection pooling appropriately

---

## Database Issues

### 1. Schema Mismatch Between Environments

**Error:**

```
The column `ResearchPaper.inSilicoAvailable` does not exist in the current database
```

**Cause:** Schema in code doesn't match production database.

**Solution:**

1. Make new fields optional in schema: `fieldName String?`
2. Remove field references from queries until migration
3. Provide default values in frontend

**Prevention Checklist:**

- [ ] Run migrations in staging before production
- [ ] Test with production-like data locally
- [ ] Keep a schema changelog
- [ ] Use feature flags for new fields

### 2. Connection Pool Exhaustion

**Prevention:**

```typescript
// Configure connection limits based on environment
const connectionLimit =
  process.env.DATABASE_CONNECTION_LIMIT || (isProduction ? 5 : 10);
```

---

## Best Practices

### API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server';

// REQUIRED: Prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Lazy import database/external services
    const { prisma } = await import('../../../lib/db');

    // Your logic here

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Pre-Deployment Checklist

1. **Local Build Test:**

   ```bash
   cd apps/web && pnpm run build
   ```

2. **Check for TypeScript Errors:**

   ```bash
   cd apps/web && pnpm run type-check
   ```

3. **Test with Minimal Environment:**

   ```bash
   DATABASE_URL="postgresql://fake" pnpm run build
   ```

4. **Verify API Routes:**
   - All have `export const dynamic = 'force-dynamic'`
   - Database imports are lazy (inside functions)
   - No module-level external service connections

### Common Pitfalls to Avoid

1. **Never use Proxy for singletons** - It can cause infinite recursion
2. **Always lazy-load external services** in API routes
3. **Don't access client-only objects during SSR/SSG**
4. **Avoid circular dependencies** in imports
5. **Test builds locally** before pushing

### Environment-Specific Considerations

**Local Development:**

- More relaxed connection limits
- Verbose logging enabled
- Hot reloading active

**Production:**

- Conservative connection limits
- Minimal logging
- No development dependencies
- Environment variables properly set

---

## Quick Fixes Reference

| Error                | Quick Fix                                         |
| -------------------- | ------------------------------------------------- |
| Lockfile mismatch    | `pnpm install --no-frozen-lockfile`               |
| Build-time DB access | Add `export const dynamic = 'force-dynamic'`      |
| Maximum call stack   | Remove circular references, fix hook dependencies |
| Schema mismatch      | Make fields optional, provide defaults            |
| SSR/SSG errors       | Convert to API route or use dynamic imports       |

---

## Monitoring Deployments

After pushing fixes, monitor the deployment:

1. Check Vercel dashboard for build status
2. Review build logs for warnings
3. Test critical endpoints after deployment
4. Monitor error tracking for runtime issues

Remember: **Always test locally with `pnpm run build` before pushing!**
