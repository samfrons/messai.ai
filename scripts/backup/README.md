# 🗃️ Database Backup System

A comprehensive backup and restore system for the MESSAI PostgreSQL database.

## 🎯 Overview

This backup system protects your valuable research data (3,721+ papers) with:

- ✅ **Local and remote backup support**
- ✅ **Automated cleanup (30-day retention)**
- ✅ **Backup verification and integrity checks**
- ✅ **Safe restore procedures**
- ✅ **Docker and cloud database compatibility**

## 🚀 Quick Start

### Create a Backup

```bash
# Create immediate backup
pnpm db:backup

# Verify the backup
pnpm db:backup:verify
```

### Restore from Backup

```bash
# List and restore from available backups
pnpm db:restore
```

## 📋 Available Commands

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `pnpm db:backup`        | Create a new database backup        |
| `pnpm db:restore`       | Restore from a backup (interactive) |
| `pnpm db:backup:verify` | Verify the latest backup integrity  |

## 🏗️ How It Works

### Backup Process

1. **Detects Environment**: Automatically handles local Docker or remote
   PostgreSQL
2. **Creates Timestamped Backup**: `messai-backup-YYYY-MM-DDTHH-mm-ss.sql`
3. **Stores in `/backups`**: Organized backup directory
4. **Cleans Old Files**: Keeps 30 most recent backups
5. **Verifies Success**: Checks file size and content

### Backup Locations

```
/backups/
├── messai-backup-2025-01-17T10-30-00-000Z.sql
├── messai-backup-2025-01-16T10-30-00-000Z.sql
└── ...
```

### Restore Process

1. **Lists Available Backups**: Shows date, size, and age
2. **Interactive Selection**: Choose which backup to restore
3. **Safety Confirmation**: Requires "YES" to proceed
4. **Database Recreation**: Safely replaces current data
5. **Completion Verification**: Confirms successful restore

## 🔒 Safety Features

### For Local Development (Docker)

- ✅ **Safe Restore**: Drops and recreates database cleanly
- ✅ **No Production Risk**: Only works with localhost databases
- ✅ **Interactive Confirmation**: Requires explicit "YES" confirmation

### For Production/Remote

- ⚠️ **Extra Protection**: Remote restore requires special handling
- 🛡️ **Backup Only**: Creates backups but prevents accidental remote restore
- 📞 **Manual Process**: Contact admin for production restores

## 🔍 Backup Verification

The verification system checks:

- ✅ **PostgreSQL dump header**
- ✅ **Table creation statements**
- ✅ **Data insertion statements**
- ✅ **Research papers content**
- ✅ **Users and experiments tables**
- ✅ **Valid file ending**
- ✅ **Reasonable file size**

## 📊 Backup Content

Each backup includes:

- 🗃️ **All database tables and indexes**
- 📚 **3,721+ research papers**
- 👥 **User accounts and profiles**
- 🧪 **Experiments and measurements**
- 🔗 **Relationships and foreign keys**
- ⚙️ **Database schema and constraints**

## 🚨 Emergency Recovery

If your database is corrupted:

1. **Check available backups**:

   ```bash
   ls -la backups/
   ```

2. **Verify latest backup**:

   ```bash
   pnpm db:backup:verify
   ```

3. **Restore from backup**:

   ```bash
   pnpm db:restore
   ```

4. **Regenerate Prisma client**:
   ```bash
   pnpm db:generate
   ```

## 🔧 Configuration

### Environment Variables

```bash
# Database connection (automatically detected)
DATABASE_URL="postgresql://..."

# Backup settings (optional)
BACKUP_RETENTION_DAYS=30  # Default: 30 days
```

### Local Development Setup

```bash
# Setup local PostgreSQL with Docker
pnpm db:setup:local

# Create first backup
pnpm db:backup
```

## ⚡ Best Practices

### 📅 Regular Backups

- **Before schema changes**: Always backup before migrations
- **Before experiments**: Backup before running research scripts
- **Weekly routine**: Create weekly backups for peace of mind

### 🧪 Testing Restores

```bash
# Test your backup system monthly
pnpm db:backup:verify
```

### 📁 Backup Management

- Backups are automatically cleaned after 30 days
- Each backup is ~5-50MB depending on data size
- Stored locally in `/backups` directory

## 🆘 Troubleshooting

### Common Issues

**"No backups found"**

```bash
# Create your first backup
pnpm db:backup
```

**"Docker container not found"**

```bash
# Start local PostgreSQL
pnpm db:local:start
```

**"Permission denied"**

```bash
# Check Docker is running and database is accessible
pnpm db:test
```

**"Backup file is empty"**

```bash
# Check database connection and try again
pnpm db:test
pnpm db:backup
```

## 📞 Support

For backup-related issues:

1. Run `pnpm db:test` to verify database connection
2. Check Docker containers: `docker ps`
3. Review backup logs for error messages
4. Ensure sufficient disk space for backups

---

**💡 Remember**: Your research data is valuable! Regular backups ensure you
never lose progress.
