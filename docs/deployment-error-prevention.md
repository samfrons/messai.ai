# Deployment Error Prevention Guide

## Overview

This guide documents common deployment errors and how to prevent them from
occurring in the future.

## Critical Build Errors

### 1. TypeScript Type Errors

**Error Type**: `Type error: Element implicitly has an 'any' type` **Example**:
`substrateMaterialColors[parameters.substrateMaterial || 'nickel-foam']`

**Root Cause**: TypeScript strict mode requires explicit type annotations for
dynamic property access.

**Prevention**:

- Use `Record<string, string>` for dynamic object access
- Add fallback values with `||` operators
- Test TypeScript compilation locally before deployment

**Fix Pattern**:

```typescript
// ❌ Will cause deployment error
const colors = {
  'nickel-foam': '#D4D4D4',
  glass: '#F0F0F0',
};
const color = colors[material]; // Type error

// ✅ Correct approach
const colors: Record<string, string> = {
  'nickel-foam': '#D4D4D4',
  glass: '#F0F0F0',
};
const color = colors[material] || '#D4D4D4'; // Safe with fallback
```

### 2. Environment Variable Access Errors

**Error Type**: `DATABASE_URL environment variable is required` **Root Cause**:
API routes are being imported during build time, causing database client
initialization.

**Prevention**:

- Ensure all API routes handle missing environment variables gracefully
- Use environment variable access syntax: `process.env['DATABASE_URL']`
- Never initialize database clients at module level in API routes

**Fix Pattern**:

```typescript
// ❌ Will cause build error
const client = new PrismaClient(); // Initializes at module level

// ✅ Correct approach
let client: PrismaClient | null = null;
function getClient() {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}
```

### 3. Missing Property Errors

**Error Type**: `Property 'propertyName' does not exist on type` **Root Cause**:
Objects missing required properties defined in interfaces.

**Prevention**:

- Always add new properties to both interface and implementation
- Use optional properties (`?`) when appropriate
- Provide default values for missing properties

## Pre-Deployment Checklist

### Local Testing

```bash
# 1. Run TypeScript type checking (CRITICAL - prevents deployment failures)
cd apps/web && pnpm run type-check

# 2. Test local build (without database)
cd apps/web && pnpm run build

# 3. Test production build with environment
DATABASE_URL="postgresql://fake" pnpm run build
```

### MANDATORY Steps Before Every Push

**⚠️ ALWAYS complete these steps to prevent deployment failures:**

1. **Type Check**: `cd apps/web && pnpm run type-check`
2. **Build Test**: `cd apps/web && pnpm run build`
3. **Fix Any Errors**: Address TypeScript issues immediately
4. **Test Locally**: Verify application starts on localhost:3000
5. **Commit & Push**: Only after all checks pass

### Code Review Checklist

- [ ] All TypeScript errors resolved
- [ ] No hardcoded environment variables
- [ ] API routes handle missing environment variables
- [ ] Dynamic object access uses proper typing
- [ ] No module-level database client initialization

## Common Patterns to Avoid

### 1. Unsafe Dynamic Property Access

```typescript
// ❌ Unsafe
const value = obj[key];

// ✅ Safe
const value = obj[key] || defaultValue;
```

### 2. Module-Level Database Initialization

```typescript
// ❌ Causes build errors
import { prisma } from '@messai/database';
const result = await prisma.model.findMany(); // At module level

// ✅ Safe
export async function GET() {
  try {
    const { prisma } = await import('@messai/database');
    const result = await prisma.model.findMany();
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: 'Database unavailable' }, { status: 500 });
  }
}
```

### 3. Missing Environment Variable Handling

```typescript
// ❌ Will fail in build
const dbUrl = process.env.DATABASE_URL; // Could be undefined

// ✅ Safe
const dbUrl = process.env['DATABASE_URL'];
if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}
```

## Build Error Recovery

If deployment fails:

1. **Check Vercel build logs** for the specific error
2. **Run local build** with same conditions
3. **Fix the root cause** (usually TypeScript or environment issues)
4. **Test locally** before redeploying
5. **Document the fix** in this guide

## Environment-Specific Considerations

### Development

- Uses `.env.local` with local PostgreSQL
- Database client can initialize normally
- All features available

### Production (Vercel)

- Uses production environment variables
- Database client must handle missing variables
- Build-time restrictions apply

## Monitoring and Alerts

### Key Metrics to Watch

- Build success rate
- TypeScript compilation errors
- Environment variable validation failures
- Database connection failures during build

### Recommended Monitoring

```typescript
// Add to API routes
export async function GET() {
  try {
    // Your logic here
  } catch (error) {
    console.error('API Error:', error);
    // Report to monitoring service
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Best Practices Summary

1. **Always test TypeScript compilation** before deployment
2. **Use proper type annotations** for dynamic access
3. **Handle missing environment variables** gracefully
4. **Never initialize database clients** at module level
5. **Test build process** locally with minimal environment
6. **Document any new patterns** that could cause issues

---

_Last Updated: 2025-07-18_ _Version: 1.0_
