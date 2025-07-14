# Contributing to MESSAI.AI

Thank you for contributing to MESSAI.AI! This guide will help you get started
with our development workflow.

## Prerequisites

- Node.js 18+
- pnpm 8.15.0+ (auto-installed via corepack)
- Git

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository>
   cd messai-ai
   corepack enable
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in the required environment variables
   ```

## Development Workflow

### 1. Code Quality & Formatting

Our project uses automated code quality tools:

- **Prettier**: Code formatting
- **ESLint**: Code linting and best practices
- **TypeScript**: Strict type checking
- **Pre-commit hooks**: Automatic checks before commits

### 2. Making Changes

1. **Create a feature branch:**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Start development server:**

   ```bash
   pnpm dev
   ```

3. **Make your changes** following our coding standards:
   - Use TypeScript strict mode
   - Follow ESLint rules
   - Write tests for new functionality
   - Update documentation as needed

### 3. Before Committing

Our pre-commit hooks will automatically:

- Run ESLint and fix issues
- Format code with Prettier
- Run TypeScript type checking
- Stage formatted files

If any checks fail, fix the issues before committing.

### 4. Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```bash
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `security`: Security improvements

**Examples:**

```bash
feat(ui): add dark mode toggle component
fix(api): resolve authentication middleware bug
docs: update installation instructions
test(core): add unit tests for prediction engine
```

### 5. Testing

```bash
# Run all tests
pnpm test

# Run tests for affected projects only
pnpm affected:test

# Run specific app tests
nx run web:test

# Run E2E tests
nx run web-e2e:e2e
```

### 6. Type Checking

```bash
# Check all TypeScript errors
pnpm type-check

# Watch mode for development
pnpm type-check:watch
```

### 7. Linting and Formatting

```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format all code
pnpm format

# Check formatting
pnpm format:check
```

## Project Structure

```
messai-ai/
├── apps/
│   ├── web/              # Main Next.js application
│   └── web-e2e/          # E2E tests
├── libs/
│   ├── shared/           # Shared utilities and components
│   ├── feature/          # Feature-specific modules
│   └── data-access/      # API and data layers
├── docs/                 # Documentation
├── .husky/               # Git hooks
└── [config files]
```

## Nx Commands

Our monorepo uses Nx for build orchestration:

```bash
# View dependency graph
pnpm graph

# Run affected commands (only changed projects)
pnpm affected:build
pnpm affected:test
pnpm affected:lint

# Run for all projects
pnpm build
pnpm test
pnpm lint
```

## Security Practices

1. **Environment Variables**: Never commit secrets to the repository
2. **Dependencies**: Run `pnpm audit` regularly to check for vulnerabilities
3. **Type Safety**: Use TypeScript strict mode for all code
4. **Validation**: Validate all inputs and API responses

```bash
# Security checks
pnpm audit
pnpm security:check
```

## Submitting Changes

1. **Push your branch:**

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create a Pull Request** with:

   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test plan for new features

3. **Ensure CI passes:**
   - All tests pass
   - Type checking succeeds
   - Linting passes
   - Build succeeds

## Getting Help

- **Documentation**: Check the [docs](./docs) directory
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## Code Style Guidelines

- Use functional components with hooks
- Prefer composition over inheritance
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions
- Follow the single responsibility principle
- Use TypeScript strict mode features

## Performance Considerations

- Use Next.js optimizations (Image, Link, etc.)
- Implement proper lazy loading
- Monitor bundle size with build analysis
- Use Nx affected commands for faster CI builds

Thank you for contributing to MESSAI.AI! 🔬⚡
