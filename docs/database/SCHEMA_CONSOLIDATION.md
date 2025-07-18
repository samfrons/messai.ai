# Database Schema Consolidation Notice

## Important: Single Schema Architecture

As of the latest update, MESSAI uses a **single, consolidated Prisma schema**
located at:

```
/prisma/schema.prisma
```

### Key Points for AI Agents

1. **There is only ONE schema file** - Do not look for or reference any schema
   files in other locations
2. **The library schema does NOT exist** -
   `/libs/data-access/database/prisma/schema.prisma` has been removed
3. **All database operations use the root schema** - Both development and
   production use the same schema file

### Common Misconceptions to Avoid

❌ **INCORRECT**: "There are multiple schema files" ✅ **CORRECT**: There is
only one schema at `/prisma/schema.prisma`

❌ **INCORRECT**: "The database library has its own schema" ✅ **CORRECT**: The
database library references the root schema

❌ **INCORRECT**: "Use `--schema=../../prisma/schema.prisma` in commands" ✅
**CORRECT**: Prisma will find the schema automatically from the root

### Schema Features

The consolidated schema includes:

- All authentication models (User, Account, Session)
- Research paper models with comprehensive fields
- Parameter extraction fields (experimental, reactor, biological, etc.)
- In silico modeling fields (modelType, modelParameters, etc.)
- Knowledge graph models (KnowledgeNode, KnowledgeEdge, ResearchCluster)
- Research trend analysis models

### Database Package Configuration

The database library (`/libs/data-access/database/package.json`) correctly
references the root schema:

```json
{
  "scripts": {
    "generate": "prisma generate --schema=../../../prisma/schema.prisma",
    "push": "prisma db push --schema=../../../prisma/schema.prisma",
    "studio": "prisma studio --schema=../../../prisma/schema.prisma"
  }
}
```

### For Future Development

- Always use `/prisma/schema.prisma` as the single source of truth
- Do not create additional schema files
- All new models should be added to the root schema
- Maintain backward compatibility when modifying existing models

### Environment Notes

- Local development: Uses Docker PostgreSQL with ~1000 papers (subset)
- Production: Contains 3,721+ research papers (full dataset)
- Both environments use the same schema structure

---

_Last updated: January 2025 - Schema consolidation completed_
