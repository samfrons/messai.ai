# Database Connection Guide

## ⚠️ CRITICAL: Use This Module for Database Access ⚠️

**Always import from `@/lib/db` instead of `@messai/database` in the web app!**

## Why?

The `@messai/database` module uses a Proxy pattern that can cause infinite
recursion errors ("Maximum call stack size exceeded"). This local module
provides a simpler, more reliable implementation.

## Usage

### In API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';

// REQUIRED: Prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Always use lazy import to prevent build-time initialization
    const { prisma } = await import('@/lib/db');

    const data = await prisma.researchPaper.findMany();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    );
  }
}
```

### In Server Components

```typescript
import { prisma } from '@/lib/db';

export default async function ServerComponent() {
  const papers = await prisma.researchPaper.findMany();

  return <div>{/* render papers */}</div>;
}
```

### In Utility Functions

```typescript
// Always use lazy imports in functions that might be called during build
export async function fetchPapers() {
  const { prisma } = await import('@/lib/db');
  return prisma.researchPaper.findMany();
}
```

## Common Errors and Solutions

### Error: Maximum call stack size exceeded

**Cause:** Using `@messai/database` which has a Proxy implementation issue.

**Solution:** Replace all imports:

```typescript
// ❌ WRONG
import { prisma } from '@messai/database';

// ✅ CORRECT
import { prisma } from '@/lib/db';
```

### Error: Cannot read properties of undefined

**Cause:** Database connection being accessed during build time.

**Solution:** Use lazy imports in API routes:

```typescript
// ❌ WRONG - Top level import
import { prisma } from '@/lib/db';

export async function GET() {
  const data = await prisma.researchPaper.findMany();
}

// ✅ CORRECT - Lazy import
export async function GET() {
  const { prisma } = await import('@/lib/db');
  const data = await prisma.researchPaper.findMany();
}
```

## Best Practices

1. **Always use lazy imports in API routes** to prevent build-time execution
2. **Add required exports** to all API routes:
   ```typescript
   export const dynamic = 'force-dynamic';
   export const runtime = 'nodejs';
   ```
3. **Handle errors gracefully** with try-catch blocks
4. **Log errors** for debugging but don't expose sensitive info to clients
5. **Use appropriate Prisma methods** to minimize data transfer

## Database Schema Notes

Some fields may exist in the schema but not in production database yet:

- `inSilicoAvailable`
- `modelType`

Always provide defaults for optional fields:

```typescript
const paper = {
  ...dbPaper,
  inSilicoAvailable: dbPaper.inSilicoAvailable ?? false,
  modelType: dbPaper.modelType ?? '',
};
```

## Connection Management

The database client is automatically managed:

- Single instance per Node.js process
- Automatic connection pooling
- Graceful shutdown on process termination

You don't need to manually connect or disconnect - just import and use!
