# Deployment Troubleshooting Guide

## Common Deployment Issues and Solutions

### 1. PNPM Lockfile Mismatch (`ERR_PNPM_OUTDATED_LOCKFILE`)

**Error:**

```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

**Cause:**

- Added/updated dependencies in `package.json` without updating `pnpm-lock.yaml`
- Vercel runs `pnpm install --frozen-lockfile` which requires exact sync

**Solution:**

```bash
# Update lockfile locally
pnpm install

# Verify lockfile sync
pnpm install --frozen-lockfile

# Commit the updated lockfile
git add pnpm-lock.yaml
git commit -m "fix: update pnpm-lock.yaml after dependency changes"
```

**Prevention:**

- Always run `pnpm install` after modifying `package.json`
- Include `pnpm-lock.yaml` in all commits that modify dependencies
- Use `pnpm add <package>` instead of manually editing `package.json`

### 2. TypeScript Schema Mismatches

**Error:**

```
Type 'string' is not assignable to type 'string[]'
```

**Cause:**

- Development schema differs from production schema
- Type mismatches between SQLite (dev) and PostgreSQL (prod)

**Solution:**

```bash
# Test with production schema
pnpm type-check:prod

# Validate schema compatibility
pnpm schema:validate

# Build with production schema
pnpm build:prod
```

**Prevention:**

- Use cross-environment utility functions (e.g., `normalizeAuthorsForDB`)
- Run `pnpm schema:validate` before deployment
- Test builds with production schema in CI/CD

### 3. Missing Dependencies in Build Environment

**Error:**

```
sh: command not found: tsx
```

**Cause:**

- Scripts reference packages not installed in build environment
- Missing devDependencies needed for build process

**Solution:**

```bash
# Add missing dependency
pnpm add -D tsx

# Update lockfile
pnpm install

# Commit changes
git add package.json pnpm-lock.yaml
git commit -m "fix: add missing build dependency"
```

**Prevention:**

- Ensure all build-time dependencies are in `devDependencies`
- Use Node.js versions of scripts when possible
- Test builds in clean environments

## Deployment Checklist

Before deploying:

- [ ] Run `pnpm install` to sync lockfile
- [ ] Test `pnpm install --frozen-lockfile` locally
- [ ] Run `pnpm schema:validate` for schema compatibility
- [ ] Test `pnpm build:prod` for production build
- [ ] Verify all new dependencies are in `package.json`
- [ ] Commit `pnpm-lock.yaml` with dependency changes

## Emergency Deployment Fix

If deployment fails:

1. **Check the error logs** in Vercel dashboard
2. **Identify the issue** (lockfile, types, missing deps)
3. **Fix locally** using solutions above
4. **Test the fix** with appropriate commands
5. **Commit and redeploy** immediately

## Monitoring and Prevention

### CI/CD Pipeline

The GitHub Actions workflow includes:

- Schema validation (`pnpm schema:validate`)
- Production type checking (`pnpm type-check:prod`)
- Frozen lockfile testing
- Build verification

### Scripts Available

- `pnpm schema:validate` - Check schema compatibility
- `pnpm schema:diff` - Compare dev vs prod schemas
- `pnpm type-check:prod` - Type check with production schema
- `pnpm build:prod` - Build with production configuration

### Vercel Configuration

```json
{
  "buildCommand": "pnpm build:prod",
  "installCommand": "pnpm install",
  "env": {
    "NODE_ENV": "production",
    "DATABASE_PROVIDER": "postgresql"
  }
}
```

## Contact and Support

For deployment issues:

1. Check this guide first
2. Review GitHub Actions logs
3. Check Vercel build logs
4. Use `pnpm schema:validate` and `pnpm build:prod` locally
5. Consult the team if issues persist

## Deployment Worktree Workflow

### Using the Deployment Worktree

A `deployment` branch and worktree have been created to maintain a stable,
deployment-ready state:

```bash
# Switch to deployment worktree
cd ../messai-ai-deployment

# Verify deployment readiness
pnpm schema:validate
pnpm install --frozen-lockfile
pnpm build:prod

# Update deployment branch from main
git merge main
```

### Merging to Deployment Branch

```bash
# From main branch
git checkout deployment
git merge main

# Test deployment compatibility
pnpm schema:validate
pnpm build:prod

# Push to trigger deployment
git push origin deployment
```

### Worktree Benefits

- **Stable deployment state**: Always ready for production
- **Parallel development**: Work on main while deployment stays stable
- **Easy rollback**: Keep previous working state available
- **Testing isolation**: Test deployment changes without affecting main

## Recent Fixes Applied

### December 2024 - Authors Field Type Mismatch

- **Issue**: `authors` field type difference between dev/prod schemas
- **Fix**: Created `author-utils.ts` with cross-environment compatibility
- **Prevention**: Added schema validation to CI/CD pipeline

### December 2024 - PNPM Lockfile Sync

- **Issue**: Added `tsx` dependency but didn't update lockfile
- **Fix**: Updated `pnpm-lock.yaml` and committed changes
- **Prevention**: Added lockfile verification to deployment process
