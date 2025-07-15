# Git Worktree Workflow Guide

## Overview

This project uses Git worktrees to maintain multiple working directories for
parallel development and deployment stability. The primary worktrees are:

- **Main worktree**: `/Users/samfrons/Desktop/messai-ai` (development)
- **Deployment worktree**: `/Users/samfrons/Desktop/messai-ai-deployment`
  (stable deployment)

## Worktree Structure

```
messai-ai/                    # Main development worktree
├── .git/                     # Git repository
├── apps/
├── docs/
└── ...

messai-ai-deployment/         # Deployment worktree
├── .git -> ../messai-ai/.git/worktrees/deployment/
├── apps/
├── docs/
└── ...
```

## Working with Worktrees

### Switching Between Worktrees

```bash
# Work on main development
cd /Users/samfrons/Desktop/messai-ai

# Switch to deployment worktree
cd ../messai-ai-deployment

# List all worktrees
git worktree list
```

### Managing the Deployment Worktree

#### Update Deployment from Main

```bash
# From main worktree
cd /Users/samfrons/Desktop/messai-ai
git checkout main
git pull origin main

# Switch to deployment worktree
cd ../messai-ai-deployment
git merge main

# Test deployment compatibility
pnpm schema:validate
pnpm install --frozen-lockfile
pnpm build:prod

# If tests pass, push to deployment
git push origin deployment
```

#### Deployment Verification Checklist

Before merging to deployment:

```bash
# 1. Schema validation
pnpm schema:validate

# 2. Lockfile verification
pnpm install --frozen-lockfile

# 3. Production build test
pnpm build:prod

# 4. Type checking with production schema
pnpm type-check:prod

# 5. All validation passes
echo "✅ Ready for deployment"
```

## Branch Management

### Branch Structure

- **main**: Active development branch
- **deployment**: Stable, deployment-ready branch
- **feature/\***: Feature development branches
- **hotfix/\***: Emergency fixes for deployment

### Workflow

```bash
# Development workflow
git checkout main
git pull origin main
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feature/new-feature
# ... create PR to main ...

# Deployment workflow
git checkout deployment
git merge main
# ... run deployment tests ...
git push origin deployment
```

## Common Operations

### Creating a New Worktree

```bash
# Create new feature worktree
git worktree add ../messai-ai-feature feature/new-feature

# Work in the feature worktree
cd ../messai-ai-feature
# ... make changes ...
git add .
git commit -m "feat: implement feature"
git push origin feature/new-feature

# Remove worktree when done
git worktree remove ../messai-ai-feature
```

### Removing a Worktree

```bash
# Remove worktree directory
git worktree remove ../messai-ai-deployment

# Or remove and prune
git worktree remove ../messai-ai-deployment
git worktree prune
```

### Syncing Worktrees

```bash
# Ensure all worktrees are up to date
git fetch --all

# Update main worktree
cd /Users/samfrons/Desktop/messai-ai
git checkout main
git pull origin main

# Update deployment worktree
cd ../messai-ai-deployment
git pull origin deployment
```

## Best Practices

### Development Best Practices

1. **Always work in main worktree for development**
2. **Use deployment worktree only for deployment testing**
3. **Keep deployment branch in sync with main**
4. **Test deployment compatibility before pushing**
5. **Use feature branches for new development**

### Deployment Best Practices

1. **Never develop directly in deployment worktree**
2. **Always run full validation before deployment**
3. **Keep deployment branch stable and working**
4. **Use deployment worktree for hotfixes only**
5. **Document any deployment-specific changes**

## Troubleshooting

### Common Issues

#### Worktree Out of Sync

```bash
# Reset deployment worktree to match main
cd ../messai-ai-deployment
git reset --hard main
git clean -fd
pnpm install
```

#### Conflicting Changes

```bash
# Resolve conflicts during merge
cd ../messai-ai-deployment
git merge main
# ... resolve conflicts ...
git add .
git commit -m "merge: resolve conflicts with main"
```

#### Lockfile Issues

```bash
# Update lockfile in deployment worktree
cd ../messai-ai-deployment
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: update lockfile"
```

### Recovery Commands

```bash
# Recreate deployment worktree
git worktree remove ../messai-ai-deployment
git branch -D deployment
git branch deployment main
git worktree add ../messai-ai-deployment deployment
```

## Integration with CI/CD

### Vercel Configuration

The deployment worktree can be connected to Vercel for automatic deployments:

```json
{
  "buildCommand": "pnpm build:prod",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install"
}
```

### GitHub Actions

The CI/CD pipeline validates both main and deployment branches:

```yaml
name: CI
on:
  push:
    branches: [main, deployment]
  pull_request:
    branches: [main, deployment]
```

## Team Workflow

### For Team Members

1. **Clone the repository**
2. **Set up both worktrees**
3. **Develop in main worktree**
4. **Test deployment in deployment worktree**
5. **Create PRs to main branch**
6. **Merge to deployment after validation**

### For Maintainers

1. **Review PRs in main branch**
2. **Merge approved PRs to main**
3. **Update deployment worktree**
4. **Validate deployment compatibility**
5. **Push to deployment branch**
6. **Monitor deployment status**

## Documentation Updates

When updating this workflow:

1. Update this document (`docs/worktree-workflow.md`)
2. Update deployment troubleshooting (`docs/deployment-troubleshooting.md`)
3. Update main documentation (`CLAUDE.md`)
4. Inform team members of changes

## References

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Deployment Troubleshooting Guide](./deployment-troubleshooting.md)
- [Project Structure Guide](./ai-context/project-structure.md)
