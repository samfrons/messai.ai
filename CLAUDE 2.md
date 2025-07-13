# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Start development server (Next.js app on port 3000)
pnpm dev

# Build all packages and apps
pnpm build

# Run linting across all packages
pnpm lint

# Run tests across all packages
pnpm test

# Type checking across all packages
pnpm type-check

# Clean build artifacts
pnpm clean
```

### Database Commands
```bash
# Generate Prisma client
pnpm db:generate

# Push database schema changes
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio
```

## Project Architecture

### Turborepo Monorepo Structure
This is a clean architecture foundation using Turborepo for build orchestration. The project follows a modular monorepo pattern with:

- **Root workspace**: Contains the main Next.js web application in `apps/web/`
- **Shared packages**: Located in `packages/@messai/` namespace
- **Package manager**: PNPM with workspace configuration
- **Build system**: Turbo for efficient builds and caching

### Core Packages

#### @messai/core
Business logic and scientific calculations for bioelectrochemical systems:
- Scientific constants and utilities
- Power prediction algorithms
- Material and microbial databases
- Type-safe interfaces with Zod validation
- Location: `packages/@messai/core/`

#### @messai/ui
Shared UI components and design system:
- Basic components (Button, Input, Card)
- Tailwind CSS integration
- Theme utilities
- Accessible design patterns
- Location: `packages/@messai/ui/`

### Technology Stack
- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Package Manager**: PNPM 8+
- **Build Tool**: Turborepo
- **Node Version**: 18+

### Scientific Domain
MESSAi specializes in microbial electrochemical systems:
- Microbial Fuel Cells (MFC)
- Microbial Electrolysis Cells (MEC)
- Microbial Desalination Cells (MDC)
- Microbial Electrosynthesis (MES)

## Development Patterns

### Code Quality Standards
- TypeScript strict mode enforced
- React functional components with hooks only
- Test-driven development approach
- ESLint with strict rules, Prettier for formatting

### Package Development
When making changes:
1. **Core logic changes** → `packages/@messai/core`
2. **UI components** → `packages/@messai/ui`
3. **Web application features** → `apps/web`
4. **Cross-cutting concerns** → Shared packages

### Extension Strategy
This clean foundation supports feature-specific worktrees:
- Laboratory tools (3D modeling, simulations)
- Research management (paper database, analysis)
- AI/ML features (advanced predictions, optimization)
- Marketing site (public-facing content)

## API Structure
- **Health Check**: GET `/api/health`
- Current APIs are minimal in this clean architecture foundation
- Follow RESTful conventions for new endpoints

## Deployment
- **Primary**: Vercel (recommended for Next.js apps)
- **Alternative**: Docker for self-hosted deployments
- **Packages**: Can be published to npm registry individually