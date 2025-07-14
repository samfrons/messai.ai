# TypeScript and Linting Configuration

This document describes the enhanced TypeScript and linting setup for the
MESSAI.AI project.

## TypeScript Configuration

### Dual Configuration Approach

The project uses a dual TypeScript configuration approach to handle the
complexity of Next.js within an Nx monorepo:

#### Base Configuration (`tsconfig.base.json`)

- **Purpose**: Monorepo-wide settings and path mappings
- **Features**: Strict mode, composite projects, shared library paths
- **Path Mappings**: All `@messai/*` library references resolve here

#### App-Specific Configurations

- **`apps/web/tsconfig.json`**: Next.js build configuration
  - Optimized for Next.js build process
  - Includes Next.js type generation files
  - Handles local paths and Next.js specific settings
- **`apps/web/tsconfig.type-check.json`**: Comprehensive type checking
  - Used for development type checking with `nx run web:type-check`
  - Includes all shared libraries and their source files
  - Excludes test files for cleaner checking
  - Resolves monorepo imports correctly

This approach resolves conflicts between:

- Next.js type generation (creates files outside `rootDir`)
- Nx monorepo library imports
- TypeScript project references and path mapping

### Strictness Settings

The base TypeScript configuration (`tsconfig.base.json`) now includes additional
strict compiler options:

- **`noUnusedParameters`**: Catches unused function parameters
- **`noUncheckedIndexedAccess`**: Ensures safer array/object access by treating
  indexed access as potentially undefined
- **`exactOptionalPropertyTypes`**: Stricter optional property handling -
  prevents assigning `undefined` to optional properties
- **`noPropertyAccessFromIndexSignature`**: Requires explicit index signature
  access
- **`verbatimModuleSyntax`**: Better ESM/CJS handling with clearer import/export
  syntax
- **`allowUnusedLabels`**: Set to `false` to prevent unused labels
- **`allowUnreachableCode`**: Set to `false` to catch unreachable code

### Type Checking

Run type checking with:

```bash
# Monorepo-wide type checking
pnpm type-check        # Check all files using base config
pnpm type-check:watch  # Watch mode

# App-specific type checking
pnpm nx run web:type-check  # Web app with comprehensive library checking

# Verify builds work correctly
pnpm nx build web          # Next.js production build
pnpm nx dev web           # Development server (http://localhost:3000)
```

### Testing TypeScript Configuration

After making changes to TypeScript configuration:

1. **Test monorepo type checking**: `pnpm type-check`
2. **Test app-specific checking**: `pnpm nx run web:type-check`
3. **Verify build process**: `pnpm nx build web`
4. **Test development mode**: `pnpm nx dev web`

If you encounter path resolution issues:

- Check that `@messai/*` imports resolve correctly
- Verify shared library builds: `pnpm nx build testing ui`
- Ensure Next.js types are included properly

## ESLint Configuration

The ESLint setup now includes comprehensive rules for code quality:

### TypeScript Rules

- Prevents use of `any` type
- Enforces explicit return types (as warning for flexibility)
- Catches unused variables (with `_` prefix convention for ignored)
- Enforces consistent type imports
- Prevents floating promises and misused promises
- Enforces nullish coalescing and optional chaining

### React Rules

- Enforces proper key usage in lists
- Self-closing component tags
- Boolean prop shorthand
- Minimal JSX curly braces

### Accessibility Rules

- Alt text for images
- Valid ARIA properties
- Role-based ARIA requirements

### Import Organization

- Automatic import ordering
- Groups: builtin → external → internal → parent/sibling → index → type
- Alphabetical sorting within groups
- Newlines between groups

### Code Quality Rules

- Maximum nesting depth of 4
- Complexity threshold of 20
- No console.log (except warn/error)
- Prefer const/template literals
- Object destructuring preferred

## Prettier Configuration

Prettier is configured with:

- Single quotes for JS/TS
- Semicolons required
- 100 character line width
- Trailing commas (ES5)
- Arrow function parentheses always

## Pre-commit Hooks

The project is set up with Husky and lint-staged for pre-commit quality checks:

### Setup

```bash
pnpm install  # Husky will be installed automatically via prepare script
```

### What runs on commit

- ESLint fix on staged JS/TS files
- Prettier formatting on all supported files
- Commit message linting (conventional commits)

### Commit Message Format

```
type(scope): subject

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert` Scopes: `web`, `api`, `ui`, `core`, `utils`, `research`,
`laboratory`, `predictions`, etc.

## VS Code Integration

The `.vscode/settings.json` configures:

- Format on save with Prettier
- ESLint auto-fix on save
- TypeScript SDK from workspace
- Proper file exclusions for search/explorer

## Scripts

```bash
# Linting
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix

# Formatting
pnpm format       # Format all files with Prettier
pnpm format:check # Check if files are formatted

# Type checking
pnpm type-check       # Run TypeScript compiler checks
pnpm type-check:watch # Run in watch mode
```

## Migration Notes

When migrating existing code:

1. **Array/Object Access**: With `noUncheckedIndexedAccess`, you may need to add
   null checks:

   ```typescript
   // Before
   const value = array[index];

   // After
   const value = array[index];
   if (value !== undefined) {
     // Use value
   }
   ```

2. **Optional Properties**: With `exactOptionalPropertyTypes`:

   ```typescript
   // Before
   interface Props {
     value?: string;
   }
   props.value = undefined; // Now error

   // After
   delete props.value; // Correct way to remove
   ```

3. **Type Imports**: ESLint will auto-fix to use type imports:

   ```typescript
   // Before
   import { User } from './types';

   // After
   import type { User } from './types';
   ```
