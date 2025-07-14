# Release Process - MESSAI.AI

This document outlines the release process, versioning strategy, and deployment
workflow for the MESSAI.AI platform.

## Release Strategy

### Versioning Scheme

We follow [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes, major feature releases
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, security patches

### Release Channels

#### 1. Development (main branch)

- **Frequency**: Continuous integration
- **Environment**: Staging
- **Purpose**: Latest features and fixes
- **URL**: https://staging.messai.ai

#### 2. Release Candidates (release/\* branches)

- **Frequency**: Weekly/bi-weekly
- **Environment**: Staging + User Acceptance Testing
- **Purpose**: Feature-complete versions for testing
- **Format**: `v1.2.0-rc.1`, `v1.2.0-rc.2`

#### 3. Stable Releases (tagged releases)

- **Frequency**: Monthly or feature-driven
- **Environment**: Production
- **Purpose**: Stable, production-ready versions
- **URL**: https://messai.ai

## Phase-Based Release Planning

### Current Phase: Laboratory Tools (v0.3.x)

- **v0.3.0**: Laboratory Tools MVP
  - 3D bioreactor modeling
  - Electroanalytical tools
  - Basic material optimization
- **v0.3.1**: Performance improvements and bug fixes
- **v0.3.2**: Additional electrode configurations

### Upcoming Phases

- **v0.4.x**: Integration Phase
  - Authentication system
  - Real-time collaboration
  - Enhanced API endpoints
- **v0.5.x**: Experiment Platform
  - Complete experiment lifecycle
  - Advanced analytics
  - Mobile responsiveness
- **v1.0.0**: Production Release
  - Full feature set
  - Enterprise features
  - Performance optimizations

## Release Workflow

### 1. Pre-Release Preparation

#### Code Quality Checks

```bash
# Ensure all tests pass
pnpm test --coverage

# Type checking
pnpm type-check

# Linting
pnpm lint

# Security audit
pnpm audit

# Build verification
pnpm build
```

#### Documentation Updates

- Update CHANGELOG.md
- Review API documentation
- Update version in package.json
- Tag release notes

### 2. Automated Release Process

#### GitHub Actions Workflow

Our release process is automated through GitHub Actions:

1. **Trigger**: Push to `main` branch or manual workflow dispatch
2. **Testing**: Full test suite including E2E tests
3. **Build**: Generate production builds
4. **Version**: Automatic version bumping based on commits
5. **Tag**: Create Git tag with version
6. **Release**: Generate GitHub release with notes
7. **Deploy**: Automatic deployment to staging/production

#### Manual Release

```bash
# 1. Ensure clean working directory
git status

# 2. Create release branch (for major/minor releases)
git checkout -b release/v0.3.0

# 3. Update version
npm version minor --no-git-tag-version

# 4. Update CHANGELOG.md
# Add release notes and breaking changes

# 5. Commit changes
git add .
git commit -m "chore: prepare release v0.3.0"

# 6. Create pull request to main
# 7. After merge, tag will be created automatically
```

### 3. Deployment Pipeline

#### Staging Deployment

- **Trigger**: Every push to main
- **Environment**: staging.messai.ai
- **Duration**: ~5 minutes
- **Verification**: Automated smoke tests

#### Production Deployment

- **Trigger**: Manual approval after staging verification
- **Environment**: messai.ai
- **Duration**: ~10 minutes
- **Verification**: Health checks and monitoring

### 4. Post-Release Activities

#### Verification

```bash
# Health check
curl https://messai.ai/api/health

# Functionality verification
- User login/logout
- Experiment creation
- 3D model rendering
- Performance charts
```

#### Monitoring

- **Application Performance**: Response times, error rates
- **User Analytics**: Feature usage, user journeys
- **Infrastructure**: Server performance, database health
- **Security**: Vulnerability scanning, audit logs

## Environment Configuration

### Staging Environment

```bash
# Environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.messai.ai
NEXT_PUBLIC_API_URL=https://staging.messai.ai/api
NEXT_PUBLIC_ENABLE_DEBUG=true

# Database
DATABASE_URL=postgresql://user:pass@staging-db:5432/messai_staging

# External services
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

### Production Environment

```bash
# Environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://messai.ai
NEXT_PUBLIC_API_URL=https://messai.ai/api
NEXT_PUBLIC_ENABLE_DEBUG=false

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/messai_production

# Security
NEXTAUTH_SECRET=<secure-secret>
NEXTAUTH_URL=https://messai.ai
```

## Release Notes Template

```markdown
# Release v0.3.0 - Laboratory Tools

## 🚀 New Features

- **3D Bioreactor Modeling**: Interactive 3D models of bioelectrochemical
  reactors
- **Electroanalytical Tools**: Cyclic voltammetry and impedance spectroscopy
  visualization
- **Material Database**: Comprehensive electrode and membrane material
  properties

## 🔧 Improvements

- Enhanced performance prediction accuracy by 15%
- Improved 3D rendering performance for complex models
- Better error handling and user feedback

## 🐛 Bug Fixes

- Fixed issue with power density calculations in dual-chamber configurations
- Resolved memory leak in long-running experiments
- Corrected pH sensor calibration algorithms

## 🔒 Security

- Updated dependencies to address security vulnerabilities
- Enhanced API input validation
- Improved authentication token handling

## 💔 Breaking Changes

- API endpoint `/api/experiments` now requires authentication
- Configuration format for bioreactor models has changed (migration guide
  included)

## 📚 Documentation

- Added comprehensive testing guide
- Updated API documentation with new endpoints
- Created deployment troubleshooting guide

## 🔧 Development

- Implemented comprehensive testing infrastructure (80% coverage)
- Added automated security scanning
- Enhanced CI/CD pipeline with deployment automation

## Migration Guide

For users upgrading from v0.2.x, please note:

1. Update bioreactor configuration format (see docs/migration/v0.3.0.md)
2. Authentication now required for experiment APIs
3. Node.js 18+ required for development

## Contributors

- @username1: 3D modeling enhancements
- @username2: Testing infrastructure
- @username3: Security improvements

**Full Changelog**: https://github.com/org/messai-ai/compare/v0.2.0...v0.3.0
```

## Rollback Procedures

### Quick Rollback (< 1 hour)

```bash
# 1. Identify last known good version
git tag --list --sort=-version:refname | head -5

# 2. Deploy previous version
vercel --prod --prebuilt dist-v0.2.1/

# 3. Verify health
curl https://messai.ai/api/health
```

### Database Rollback (if needed)

```bash
# 1. Stop application
vercel env rm NEXT_PUBLIC_MAINTENANCE_MODE=true

# 2. Restore database backup
pg_restore --clean --dbname messai_production backup_v0.2.1.sql

# 3. Deploy compatible version
# 4. Remove maintenance mode
```

### Communication Plan

1. **Internal**: Slack #engineering channel
2. **Users**: In-app notification banner
3. **Status Page**: Update status.messai.ai
4. **Social Media**: Twitter @messai_ai (if major impact)

## Quality Gates

### Pre-Release Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Security audit clean
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Migration scripts tested
- [ ] Rollback plan documented

### Release Approval

- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] Security team approval (for major releases)
- [ ] Stakeholder notification sent

### Post-Release Verification

- [ ] Health endpoints responding
- [ ] Key user journeys tested
- [ ] Performance metrics normal
- [ ] Error rates within thresholds
- [ ] User feedback monitored

## Tools & Integrations

### Version Management

- **GitHub**: Source code and release management
- **Semantic Release**: Automated version bumping
- **Conventional Commits**: Structured commit messages

### Deployment

- **Vercel**: Hosting and deployment platform
- **GitHub Actions**: CI/CD pipeline
- **Docker**: Containerization (future)

### Monitoring

- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking (planned)
- **LogRocket**: User session recording (planned)

### Communication

- **Slack**: Team notifications
- **Email**: Stakeholder updates
- **GitHub Releases**: Public changelog

## Metrics & Success Criteria

### Release Metrics

- **Lead Time**: Time from feature complete to production
- **Deployment Frequency**: Releases per month
- **Change Failure Rate**: % of releases requiring hotfix
- **Recovery Time**: Time to resolve production issues

### Quality Metrics

- **Test Coverage**: >80% across all categories
- **Security Vulnerabilities**: Zero high/critical issues
- **Performance**: <2s page load time, <200ms API response
- **Availability**: 99.9% uptime target

## Continuous Improvement

### Monthly Reviews

- Release process retrospectives
- Deployment pipeline optimization
- Quality metrics analysis
- Tool and process improvements

### Quarterly Planning

- Release timeline planning
- Infrastructure capacity planning
- Security and compliance review
- Technology stack evaluation

---

## Quick Reference

### Essential Commands

```bash
# Release preparation
pnpm test --coverage
pnpm type-check
pnpm lint
pnpm build

# Version management
npm version patch    # Bug fixes
npm version minor    # New features
npm version major    # Breaking changes

# Deployment verification
curl https://messai.ai/api/health
pnpm nx e2e web-e2e --prod
```

### Key URLs

- **Production**: https://messai.ai
- **Staging**: https://staging.messai.ai
- **Status Page**: https://status.messai.ai
- **Documentation**: https://docs.messai.ai

For technical deployment details, see [Deployment Guide](./deployment-guide.md).
