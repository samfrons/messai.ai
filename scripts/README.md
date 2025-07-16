# Parameter Documentation Generation System

This system uses Ollama LLMs to automatically generate comprehensive
documentation for MESSAI parameters that are missing detailed information.

## Overview

The MESSAI parameter database contains 667 total parameters, but only 16 (2.4%)
have comprehensive documentation. This system addresses this gap by:

1. **Identifying** parameters lacking documentation
2. **Generating** high-quality markdown documentation using Ollama models
3. **Ensuring** consistency with existing documentation structure
4. **Validating** quality before saving

## System Components

### 1. Analysis & Discovery

- `generate-parameter-docs.js` - Full-featured analysis and generation system
- `generate-docs-simple.js` - Lightweight testing and small-batch generation
- `batch-generate-docs.js` - Production-ready batch processing with error
  handling

### 2. Templates & Quality Control

- `documentation-templates.js` - Category-specific templates and validation
- `test-ollama.js` - Simple connectivity and model testing

### 3. Generated Documentation

- Files are saved to `parameters/parameters-v1/[category]/[parameter-id].md`
- Each file includes metadata, structured sections, and comprehensive technical
  content

## Quick Start

### 1. Test Ollama Connectivity

```bash
node scripts/test-ollama.js
```

### 2. Analyze Parameters Needing Documentation

```bash
node scripts/generate-parameter-docs.js analyze
```

### 3. Generate Documentation for a Few Parameters (Testing)

```bash
node scripts/generate-docs-simple.js 5
```

### 4. Batch Generate Documentation (Production)

```bash
# Generate documentation for up to 50 parameters
node scripts/batch-generate-docs.js generate 50

# Generate documentation for all parameters needing it
node scripts/batch-generate-docs.js generate

# Check progress of running batch
node scripts/batch-generate-docs.js status
```

## Documentation Structure

Generated documentation follows this structure:

```markdown
# Parameter Name

## Definition

Technical definition explaining what the parameter measures

## Typical Values

- **Range**: min - max units
- **Typical**: common operational range
- **Optimal**: range for best performance

## Measurement Methods

Specific measurement techniques and procedures

## Affecting Factors

Key factors that influence the parameter

## Performance Impact

How the parameter affects system performance

## Validation Rules

Specific validation criteria and acceptable ranges

## References

Realistic literature references

## Application Notes

Practical guidance for different system scales
```

## Quality Control

The system includes multiple quality validation steps:

1. **Length validation**: Minimum 800 characters
2. **Section validation**: Required sections must be present
3. **Content validation**: Numeric values and references required
4. **Retry logic**: Up to 3 attempts for failed generations
5. **Quality scoring**: 0-1 score based on comprehensiveness

## Current Status

### Generated Documentation Examples

Successfully generated documentation for:

- **Biofilm Conductivity** (`parameters-v1/biological/biofilm-conductivity.md`)
- **Biofilm Density** (`parameters-v1/biological/biofilm-density.md`)

### Quality Metrics

- Average length: ~5000 characters
- Quality scores: 0.8-0.9 (out of 1.0)
- Generation time: 20-30 seconds per parameter
- Success rate: ~85% (with retry logic)

### Parameters Needing Documentation

Current analysis shows:

- **Total parameters**: 667
- **Already documented**: 16 (2.4%)
- **Need documentation**: 573 (85.8%)
- **Categorical variables**: 94 (14.1%) - excluded from documentation

**By Category:**

- Biological: 55 parameters
- Materials: 75 parameters
- Environmental: 66 parameters
- Operational: 114 parameters
- Electrical: 18 parameters
- Performance: 34 parameters
- Physical: 70 parameters
- Economic: 45 parameters
- Safety: 35 parameters
- Monitoring: 42 parameters
- Chemical: 19 parameters

## Configuration

### Ollama Models

The system supports multiple Ollama models:

- **phi3.5:latest** (recommended) - Fast, good quality
- **qwen2.5-coder:latest** - Excellent for technical content
- **mistral-small3.2:latest** - High quality but slower

### Performance Tuning

- **Batch size**: 10 parameters per batch
- **Request delay**: 2 seconds between requests
- **Retry attempts**: 3 attempts with 5-second delays
- **Timeout**: 120 seconds per generation

## Integration with MESSAI

### Current Integration

The parameter detail service (`parameter-detail-service.ts`) already includes:

- Markdown file mapping for existing documentation
- Quality assessment and content parsing
- Category-specific section handling

### Next Steps

1. Update the `MARKDOWN_MAPPINGS` object to include new generated files
2. Add batch updating mechanism for newly generated documentation
3. Implement automatic quality monitoring and regeneration

## Usage Recommendations

### For Development/Testing

```bash
# Generate a few parameters for testing
node scripts/generate-docs-simple.js 10
```

### For Production Batch Processing

```bash
# Generate documentation in manageable batches
node scripts/batch-generate-docs.js generate 100
```

### For Quality Assurance

1. Review generated files manually
2. Check quality scores in the generation report
3. Regenerate low-quality documentation with different prompts

## Troubleshooting

### Common Issues

1. **Ollama timeout errors**
   - Solution: Use lighter models (phi3.5) or increase timeout
2. **Quality validation failures**
   - Solution: Adjust quality thresholds or improve prompts
3. **API rate limiting**
   - Solution: Increase delays between requests

### Monitoring Progress

```bash
# Check current batch progress
node scripts/batch-generate-docs.js status

# View detailed logs in generated reports
cat parameters/parameters-v1/batch-generation-report.json
```

## Future Enhancements

1. **Model Fine-tuning**: Train a specialized model on existing high-quality
   documentation
2. **Automated Quality Improvement**: Iterative regeneration based on quality
   metrics
3. **Multi-language Support**: Generate documentation in multiple languages
4. **Real-time Integration**: Generate documentation automatically for new
   parameters
5. **User Feedback Loop**: Incorporate user ratings to improve generation
   quality

## Contributing

To improve the documentation generation system:

1. **Enhance Prompts**: Modify prompts in `documentation-templates.js`
2. **Add Quality Metrics**: Extend validation in `batch-generate-docs.js`
3. **Optimize Performance**: Adjust batch sizes and delays
4. **Add New Categories**: Extend template system for specialized parameter
   types
