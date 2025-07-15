# MESSAI Research Agents

AI-powered research sub-agents for processing and expanding the algae fuel cell
research database.

## 🚀 Quick Start

Run the complete algae research workflow with a single command:

```bash
pnpm algae-research
```

This will:

1. Process all PDFs in the `mess-papers` directory
2. Expand the database with 100 high-quality related papers
3. Validate all papers to prevent fake data
4. Generate a comprehensive report

## 📋 Prerequisites

### Required

- Node.js 18+
- PNPM 8.15.0+
- `mess-papers` directory with PDF files (for MESS processing)

### Optional (Recommended)

- [Ollama](https://ollama.com/) for AI-powered paper analysis

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull a model (recommended: llama3.1:8b)
ollama pull llama3.1:8b
```

## 🛠️ Available Commands

### Main Commands

```bash
# Process everything (default: MESS papers + expand to 100 papers)
pnpm algae-research

# Process only MESS papers
pnpm algae-research:mess
# or
pnpm algae-research --mess-only

# Expand database only
pnpm algae-research:expand
# or
pnpm algae-research --expand-only
```

### Advanced Options

```bash
# Expand to 200 papers with high validation strictness
pnpm algae-research --expand-only --count=200 --strictness=high

# Process with verbose output
pnpm algae-research --verbose

# Disable parallel processing
pnpm algae-research --no-parallel

# Show help
pnpm algae-research --help
```

### Individual Scripts

```bash
# Run specific parts of the workflow
pnpm nx run feature-research-agents:process-mess-papers
pnpm nx run feature-research-agents:expand-algae-papers
pnpm nx run feature-research-agents:run-algae-workflow
```

## 🏗️ Architecture

### Dual Sub-Agent System

1. **AlgaePaperProcessor**

   - Processes PDF files from mess-papers directory
   - Extracts metadata and algae-specific data
   - Validates paper quality and relevance
   - Adds papers to knowledge graph

2. **OllamaPaperExpander**
   - Uses AI to discover related papers
   - Searches external databases (PubMed, CrossRef, arXiv)
   - Implements multiple expansion strategies:
     - Similar papers based on existing collection
     - Research gap identification
     - Trend analysis
     - Keyword expansion

### Services

- **PDFProcessor**: Extracts text and metadata from PDFs
- **OllamaService**: AI-powered analysis (optional)
- **ExternalAPIService**: Integrates with research databases
- **PaperValidator**: Comprehensive validation to prevent fake data

### Workflow Orchestration

The system uses a sophisticated workflow orchestrator that:

- Manages parallel execution of agents
- Handles retries and failures gracefully
- Provides real-time progress updates
- Generates comprehensive reports

## 📊 Output

After processing, you'll get:

1. **Console Summary**: Real-time progress and final statistics
2. **Report File**: Detailed markdown report saved to project root
3. **Database Updates**: Papers added to your research database
4. **Knowledge Graph**: Connections between papers, algae species, and concepts

### Example Output

```
✨ Processing Complete!
═══════════════════════════════════════
   Status: ✅ SUCCESS
   Total Papers Added: 127
   Total Time: 243.56s
   Average Quality: 82.4/100
   Average Relevance: 89.1/100

   📄 MESS Processing:
      Processed: 7 papers
      Time: 45.23s

   🔍 Database Expansion:
      Added: 120 papers
      Searches: 35
      Time: 198.33s

💡 Recommendations:
   1. Schedule regular workflow runs to maintain database freshness
   2. Consider implementing automated quality monitoring
```

## 🔧 Configuration

### Validation Strictness Levels

- **low**: Minimal validation, faster processing
- **medium**: Balanced validation (default)
- **high**: Strict validation, highest quality

### Environment Variables (Optional)

```bash
# Add to .env.local for external API access
PUBMED_API_KEY=your_key_here
SEMANTIC_SCHOLAR_API_KEY=your_key_here
```

## 🐛 Troubleshooting

### Common Issues

1. **"mess-papers directory not found"**

   - Ensure the directory exists at project root
   - Add PDF files to process

2. **"Ollama not available"**

   - System will use mock responses
   - Install Ollama for better results

3. **"Rate limit exceeded"**
   - External APIs have rate limits
   - Wait a few minutes and retry
   - Consider adding API keys

### Debug Mode

Run with verbose output for detailed debugging:

```bash
pnpm algae-research --verbose
```

## 📚 Development

### Running Tests

```bash
pnpm nx test feature-research-agents
```

### Building

```bash
pnpm nx build feature-research-agents
```

### Adding New Features

1. Create new agents by extending `BaseResearchAgent`
2. Add new services in the `services` directory
3. Register agents with the orchestrator
4. Update workflow configuration

## 📝 License

MIT License - See LICENSE file for details
