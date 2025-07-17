# Autowork → Deployment Merge Strategy

## Overview

This document outlines the strategy for intelligently merging changes from the
`autowork` branch into the `deployment` branch. Due to significant architectural
differences between the branches, a selective merge approach is required.

## Branch Analysis Summary

### Deployment Branch (Target)

- Complete database schema overhaul with new models:
  - MFCDesign, ExperimentPaper, ResearchCluster, KnowledgeNode
  - Parameter system with extensive documentation
- API routes completely reimplemented with complex data transformations
- Predictions API deleted
- 3,721 research papers in PostgreSQL database
- Production-ready configuration

### Autowork Branch (Source)

- Database model rename: Paper → ResearchPaper
- TypeScript fixes (22+ files)
- Jest configuration fixes (ESM → CommonJS)
- Removed unused React imports
- Disabled predictions API (501 responses)
- NEW: Ollama Cost Optimization System
  - CostOptimizationService
  - OptimizedOllamaWrapper
  - Configuration system with presets
  - Comprehensive test coverage (67 test cases)

## Merge Strategy

### 1. Changes to Apply to Deployment

#### High Priority

1. **Ollama Cost Optimization System** (NEW)

   - Copy entire optimization system to deployment:
     - `libs/feature/research-agents/src/services/cost-optimization-service.ts`
     - `libs/feature/research-agents/src/services/optimized-ollama-wrapper.ts`
     - `libs/feature/research-agents/src/config/cost-optimization-config.ts`
   - Copy all test files:
     - `libs/feature/research-agents/src/__tests__/cost-optimization-service.test.ts`
     - `libs/feature/research-agents/src/__tests__/optimized-ollama-wrapper.test.ts`
     - `libs/feature/research-agents/src/__tests__/cost-optimization-config.test.ts`
     - `libs/feature/research-agents/src/__tests__/cost-optimization-integration.test.ts`
     - `libs/feature/research-agents/src/__tests__/cost-optimization-model-selection.test.ts`
     - `libs/feature/research-agents/src/__tests__/cost-optimization-concurrency.test.ts`

2. **Jest Configuration Fixes**

   - Convert all `export default` to `module.exports =` in Jest configs
   - Apply to all affected files in deployment branch

3. **React Import Cleanup**
   - Remove unused React imports from all components
   - Safe to apply as React 18+ doesn't require imports for JSX

#### Medium Priority

4. **TypeScript Fixes**
   - Apply type safety improvements
   - Fix any remaining TypeScript errors

### 2. Changes NOT to Apply

1. **Database Schema Changes**

   - Do NOT apply Paper → ResearchPaper rename
   - Deployment has a more comprehensive schema that should be preserved

2. **API Route Changes**

   - Do NOT apply autowork's API changes
   - Deployment has more sophisticated implementations

3. **Predictions API Changes**
   - Deployment already deleted these files
   - No action needed

### 3. Implementation Plan

1. **Phase 1: Ollama Integration**

   - Copy Ollama optimization files to deployment
   - Update imports to match deployment's structure
   - Ensure compatibility with deployment's existing services

2. **Phase 2: Code Quality**

   - Apply Jest configuration fixes
   - Remove unused React imports
   - Fix any TypeScript issues

3. **Phase 3: Testing**

   - Run all tests to ensure nothing breaks
   - Verify Ollama optimization works with deployment's architecture
   - Check that database operations still function correctly

4. **Phase 4: Documentation**
   - Update CLAUDE.md with Ollama optimization details
   - Document configuration options
   - Add usage examples

## Risks and Mitigations

1. **Risk**: Ollama system might conflict with deployment's architecture

   - **Mitigation**: Carefully review imports and dependencies

2. **Risk**: Jest fixes might break existing tests

   - **Mitigation**: Run tests after each change

3. **Risk**: TypeScript fixes might be incompatible
   - **Mitigation**: Apply selectively, test thoroughly

## Conclusion

This merge strategy focuses on bringing valuable improvements from autowork
(Ollama optimization, code quality fixes) while preserving deployment's
architectural improvements. The selective approach ensures we get the best of
both branches without introducing conflicts or regressions.
