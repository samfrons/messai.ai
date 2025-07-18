# 🌙 MESSAI Nighttime Automation System

The MESSAI Nighttime Automation System provides comprehensive, unattended
automation for database maintenance, code quality, research data processing, and
performance monitoring.

## 🎯 Overview

This system runs automatically every night at 2:00 AM UTC via GitHub Actions,
performing essential maintenance tasks that require no supervision. All tasks
are designed to be safe, non-destructive, and provide comprehensive reporting.

## 🚀 Automated Tasks

### 1. Database Backup & Verification

- **Frequency**: Nightly at 2:00 AM UTC
- **Duration**: ~5-10 minutes
- **Tasks**:
  - Create PostgreSQL database backup
  - Verify backup integrity and completeness
  - Upload backup as GitHub artifact (30-day retention)
  - Test database connection health
  - Generate backup reports

### 2. Code Quality & Maintenance

- **Duration**: ~15-20 minutes
- **Tasks**:
  - Run security audit (`pnpm audit`)
  - Check for dependency updates
  - Auto-fix ESLint issues (`pnpm lint:fix`)
  - Format code (`pnpm format`)
  - Clean build cache and artifacts
  - Run full test suite with coverage
  - Verify production build compatibility

### 3. Research Data Enhancement

- **Duration**: ~30-45 minutes
- **Tasks**:
  - Generate database statistics for 3,721+ research papers
  - Expand algae research dataset (batch processing)
  - Generate parameter documentation using AI
  - Validate database schema consistency
  - Process research paper metadata improvements

### 4. Performance Monitoring

- **Duration**: ~10-15 minutes
- **Tasks**:
  - Analyze Next.js bundle sizes
  - Generate performance metrics
  - Monitor system resource usage
  - Create performance trend reports

## 📋 Manual Execution

### Local Development

```bash
# Run all automation tasks
pnpm nighttime:all

# Run specific task categories
pnpm nighttime:backup      # Database backup only
pnpm nighttime:maintenance # Code quality only
pnpm nighttime:data        # Research data processing only
pnpm nighttime:performance # Performance analysis only
```

### GitHub Actions (Manual Trigger)

1. Go to the **Actions** tab in your GitHub repository
2. Select **Nighttime Automation** workflow
3. Click **Run workflow**
4. Choose specific task type or run all tasks

## 📊 Monitoring & Reports

### Automated Reports

- **GitHub Actions Summary**: Comprehensive execution report with status of all
  tasks
- **Backup Artifacts**: Database backups stored as downloadable artifacts
- **Performance Metrics**: Bundle analysis and system health reports
- **Error Notifications**: Detailed failure reporting with troubleshooting steps

### Local Reports

When running locally, reports are generated in:

- `logs/nighttime-YYYY-MM-DD.log` - Detailed execution logs
- `reports/summary-YYYY-MM-DD.json` - Execution summary
- `reports/performance-YYYY-MM-DD.json` - Performance analysis

## 🔧 Configuration

### Environment Variables

Required for full functionality:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
OLLAMA_API_URL=http://localhost:11434 (for documentation generation)
```

### GitHub Secrets

Configure these secrets in your repository settings:

```
DATABASE_URL - Production database connection string
DIRECT_URL - Direct database connection string
OLLAMA_API_URL - Ollama API endpoint (optional)
```

## ⚡ Benefits

### Zero Supervision Required

- All tasks run autonomously with built-in error handling
- Safe execution with rollback capabilities
- Comprehensive logging and error reporting

### High Value Output

- **Data Quality**: Continuous improvement of research paper database
- **Code Quality**: Automated maintenance and optimization
- **Security**: Regular vulnerability scanning and dependency updates
- **Performance**: Ongoing monitoring and optimization insights

### Existing Infrastructure

- Uses proven, tested scripts and workflows
- Leverages existing MESSAI database and AI agents
- Built on established GitHub Actions and pnpm workflows

## 🛡️ Safety Features

### Non-Destructive Operations

- Database backups are created, never deleted automatically
- Code changes are formatting and linting only
- All operations have built-in verification steps

### Error Handling

- Tasks continue even if individual steps fail
- Comprehensive error logging and reporting
- Automatic cleanup of temporary files and cache

### Resource Management

- CPU and memory limits prevent system overload
- Timeouts prevent hanging processes
- Staged execution to prevent conflicts

## 📅 Schedule

```
2:00 AM UTC - Nighttime Automation starts
├── 2:00-2:15 - Database backup & verification
├── 2:15-2:35 - Code quality & maintenance
├── 2:35-3:20 - Research data enhancement
├── 3:20-3:35 - Performance monitoring
└── 3:35-3:40 - Generate summary reports
```

**Total Duration**: ~90 minutes maximum

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failures**

```bash
# Test database connection
pnpm db:test

# Check environment variables
pnpm debug:env
```

**Backup Verification Failures**

```bash
# Manually verify latest backup
pnpm db:backup:verify

# Create new backup
pnpm db:backup
```

**Local Execution Issues**

```bash
# Check Node.js and pnpm versions
node --version  # Should be 18+
pnpm --version  # Should be 8.15.0+

# Install dependencies
pnpm install --frozen-lockfile
```

### GitHub Actions Issues

- Check repository secrets are properly configured
- Verify workflow permissions in repository settings
- Review action logs for specific error messages

## 📚 Related Documentation

- [Database Management](../CLAUDE.md#database-management-commands)
- [Research Library Integration](../CLAUDE.md#research-library-database-integration)
- [CI/CD Workflows](../.github/workflows/)
- [Project Structure](../docs/ai-context/project-structure.md)

---

**🤖 Automated by MESSAI Nighttime Workflow** | Last Updated: July 2025
