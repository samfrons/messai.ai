# Pull Request

## Description

<!-- Provide a brief description of the changes -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to
      not work as expected)
- [ ] Documentation update

## Pre-Deployment Checklist

### Critical Checks (MUST DO)

- [ ] Ran `cd apps/web && pnpm run build` locally and it succeeded
- [ ] Tested with minimal env: `DATABASE_URL="postgresql://fake" pnpm run build`
- [ ] All API routes have `export const dynamic = 'force-dynamic'`
- [ ] No `import { prisma } from '@messai/database'` in web app (use `@/lib/db`)
- [ ] Database queries don't reference fields that may not exist in production

### Build & Test

- [ ] Local development server runs without errors
- [ ] No TypeScript errors: `pnpm run type-check`
- [ ] Tests pass: `pnpm test` (if applicable)
- [ ] No console errors in browser

### Database Changes

- [ ] New database fields are optional (`field?`) until migrated
- [ ] Provided default values for new fields in frontend
- [ ] Tested with production-like data

### Common Error Prevention

- [ ] No circular references or infinite loops
- [ ] React hooks have correct dependencies
- [ ] No module-level database/Redis connections
- [ ] Dynamic imports used in API routes

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Related Issues

<!-- Link any related issues using #issue-number -->

---

⚠️ **WARNING**: Failure to complete the pre-deployment checklist may result in
deployment failures. See `docs/DEPLOYMENT_TROUBLESHOOTING.md` for common issues.
