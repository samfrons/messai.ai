# Documentation Architecture

This project uses a **3-tier documentation system** that organizes knowledge by
stability and scope, enabling efficient AI context loading and scalable
development.

## How the 3-Tier System Works

**Tier 1 (Foundation)**: Stable, system-wide documentation that rarely changes -
architectural principles, technology decisions, cross-component patterns, and
core development protocols.

**Tier 2 (Component)**: Architectural charters for major components - high-level
design principles, integration patterns, and component-wide conventions without
feature-specific details.

**Tier 3 (Feature-Specific)**: Granular documentation co-located with code -
specific implementation patterns, technical details, and local architectural
decisions that evolve with features.

This hierarchy allows AI agents to load targeted context efficiently while
maintaining a stable foundation of core knowledge.

## Documentation Principles

- **Co-location**: Documentation lives near relevant code
- **Smart Extension**: New documentation files created automatically when
  warranted
- **AI-First**: Optimized for efficient AI context loading and machine-readable
  patterns

## Essential Database Documentation (CRITICAL FOR ALL AGENTS)

**⚠️ READ FIRST**: Before working on any research library or database features:

- **[Database Integration Guide](./database-integration-guide.md)** - Complete
  database architecture, field mappings, and common issues
- **[API Nomenclature Reference](./api-nomenclature-reference.md)** - Critical
  field mappings between database schema and API responses

**Key Points for All Agents**:

- Database has **3,721 research papers** using `ResearchPaper` model (NOT
  `Paper`)
- Always clean JATS XML from abstracts
- Use correct field mappings (see guides above)
- Test with `pnpm db:test` before proceeding

## Tier 1: Foundational Documentation (System-Wide)

- **[Master Context](/CLAUDE.md)** - _Essential for every session._ Coding
  standards, security requirements, MCP server integration patterns, and
  development protocols
- **[Project Structure](/docs/ai-context/project-structure.md)** - _REQUIRED
  reading._ Complete technology stack, file tree, and system architecture. Must
  be attached to Gemini consultations
- **[System Integration](/docs/ai-context/system-integration.md)** - _For
  cross-component work._ Communication patterns, data flow, testing strategies,
  and performance optimization
- **[Deployment Infrastructure](/docs/ai-context/deployment-infrastructure.md)** -
  _Infrastructure patterns._ Containerization, monitoring, CI/CD workflows, and
  scaling strategies
- **[Task Management](/docs/ai-context/handoff.md)** - _Session continuity._
  Current tasks, documentation system progress, and next session goals

## Tier 2: Component-Level Documentation

### Backend Components

- **[Backend Context](/backend/CONTEXT.md)** - _Server implementation._ API
  patterns, database integration, service architecture, and performance
  considerations
- **[Worker Services](/workers/CONTEXT.md)** - _Background processing._ Job
  queue patterns, scheduling, and async task management
- **[Shared Libraries](/shared/CONTEXT.md)** - _Reusable code._ Common
  utilities, shared types, and cross-component functionality

### Frontend Components

- **[Web Application](/frontend/CONTEXT.md)** - _Client implementation._ UI
  patterns, state management, routing, and user interaction patterns
- **[Mobile Application](/mobile/CONTEXT.md)** - _Mobile implementation._
  Platform-specific patterns, native integrations, and mobile optimizations
- **[Admin Dashboard](/admin/CONTEXT.md)** - _Administrative interface._
  Permission patterns, admin workflows, and management tools

### Infrastructure Components

- **[Infrastructure Code](/infrastructure/CONTEXT.md)** - _IaC patterns._
  Terraform/CloudFormation templates, resource definitions, and deployment
  automation
- **[Monitoring Setup](/monitoring/CONTEXT.md)** - _Observability patterns._
  Metrics collection, alerting rules, and dashboard configurations

## Tier 3: Feature-Specific Documentation

Granular CONTEXT.md files co-located with code for minimal cascade effects:

### Backend Feature Documentation

- **[Core Services](/backend/src/core/services/CONTEXT.md)** - _Business logic
  patterns._ Service architecture, data processing, integration patterns, and
  error handling
- **[API Layer](/backend/src/api/CONTEXT.md)** - _API patterns._ Endpoint
  design, validation, middleware, and request/response handling
- **[Data Layer](/backend/src/data/CONTEXT.md)** - _Data patterns._ Database
  models, queries, migrations, and data access patterns
- **[Authentication](/backend/src/auth/CONTEXT.md)** - _Auth patterns._
  Authentication flows, authorization rules, session management, and security
- **[Integrations](/backend/src/integrations/CONTEXT.md)** - _External
  services._ Third-party API clients, webhook handlers, and service adapters

### Frontend Feature Documentation

- **[UI Components](/frontend/src/components/CONTEXT.md)** - _Component
  patterns._ Reusable components, styling patterns, accessibility, and
  composition strategies
- **[State Management](/frontend/src/store/CONTEXT.md)** - _State patterns._
  Global state, local state, data flow, and persistence strategies
- **[API Client](/frontend/src/api/CONTEXT.md)** - _Client patterns._ HTTP
  clients, error handling, caching, and data synchronization
- **[Routing](/frontend/src/routes/CONTEXT.md)** - _Navigation patterns._ Route
  definitions, guards, lazy loading, and deep linking
- **[Utilities](/frontend/src/utils/CONTEXT.md)** - _Helper functions._
  Formatters, validators, transformers, and common utilities

### Shared Feature Documentation

- **[Common Types](/shared/src/types/CONTEXT.md)** - _Type definitions._ Shared
  interfaces, enums, and type utilities
- **[Validation Rules](/shared/src/validation/CONTEXT.md)** - _Validation
  patterns._ Schema definitions, custom validators, and error messages
- **[Constants](/shared/src/constants/CONTEXT.md)** - _Shared constants._
  Configuration values, enums, and magic numbers
- **[Utilities](/shared/src/utils/CONTEXT.md)** - _Shared utilities._
  Cross-platform helpers, formatters, and common functions

## Adding New Documentation

### New Component

1. Create `/new-component/CONTEXT.md` (Tier 2)
2. Add entry to this file under appropriate section
3. Create feature-specific Tier 3 docs as features develop

### New Feature

1. Create `/component/src/feature/CONTEXT.md` (Tier 3)
2. Reference parent component patterns
3. Add entry to this file under component's features

### Deprecating Documentation

1. Remove obsolete CONTEXT.md files
2. Update this mapping document
3. Check for broken references in other docs

---

_This documentation architecture template should be customized to match your
project's actual structure and components. Add or remove sections based on your
architecture._
