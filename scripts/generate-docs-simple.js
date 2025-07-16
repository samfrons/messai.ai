#!/usr/bin/env node

/**
 * Simplified Parameter Documentation Generator
 *
 * Focuses on efficiency and quick generation of parameter documentation
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const CONFIG = {
  model: 'phi3.5:latest',
  baseUrl: 'http://localhost:11434',
  unifiedDataPath: './parameters/MESS_PARAMETERS_UNIFIED_FINAL.json',
  outputPath: './parameters/parameters-v1',
  delayBetweenRequests: 1000,
};

class SimpleDocGenerator {
  constructor() {
    this.unifiedData = null;
  }

  async initialize() {
    console.log('🚀 Loading parameter data...');
    const data = await fs.readFile(CONFIG.unifiedDataPath, 'utf8');
    this.unifiedData = JSON.parse(data);
    console.log(`✅ Loaded ${this.unifiedData.metadata?.totalParameters || 'unknown'} parameters`);
  }

  async generateSimpleDoc(param) {
    const prompt = this.createSimplePrompt(param);

    try {
      const curlCommand = `curl -s -X POST ${
        CONFIG.baseUrl
      }/api/generate -H "Content-Type: application/json" -d '${JSON.stringify({
        model: CONFIG.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1500,
        },
      }).replace(/'/g, "'\\''")}' --max-time 90`;

      const { stdout } = await execAsync(curlCommand);
      const response = JSON.parse(stdout);

      if (response.error) {
        throw new Error(`Ollama API error: ${response.error}`);
      }

      return this.formatDocumentation(response.response, param);
    } catch (error) {
      throw new Error(`Failed to generate documentation: ${error.message}`);
    }
  }

  createSimplePrompt(param) {
    return `Generate technical documentation for the parameter "${
      param.name
    }" in microbial electrochemical systems (MESS).

Parameter Details:
- ID: ${param.id}
- Name: ${param.name}
- Description: ${param.description || 'No description provided'}
- Unit: ${param.unit || 'unitless'}
- Category: ${param.category}

Create documentation with these sections:

## Definition
Provide a technical definition explaining what this parameter measures in MESS systems.

## Typical Values
- **Range**: [min] - [max] ${param.unit || 'units'}
- **Typical**: [typical range] 
- **Optimal**: [optimal range for performance]

## Measurement Methods
Describe how this parameter is typically measured or calculated.

## Affecting Factors
List 3-4 key factors that influence this parameter.

## Performance Impact
Explain how this parameter affects system performance.

## Validation Rules
Provide specific validation criteria and acceptable ranges.

## References
Include 2-3 realistic literature references.

Keep the response concise but technically accurate. Use specific numeric ranges where appropriate.`;
  }

  formatDocumentation(content, param) {
    // Ensure proper heading
    if (!content.startsWith(`# ${param.name}`)) {
      content = `# ${param.name}\n\n${content}`;
    }

    // Add metadata
    const metadata = `<!-- 
Parameter ID: ${param.id}
Category: ${param.category}
Generated: ${new Date().toISOString()}
Model: ${CONFIG.model}
-->

`;

    return metadata + content;
  }

  async saveDocumentation(param, content) {
    const categoryFolder = this.getCategoryFolder(param.category);
    const outputDir = path.join(CONFIG.outputPath, categoryFolder);

    await fs.mkdir(outputDir, { recursive: true });

    const filename = `${param.id.replace(/_/g, '-')}.md`;
    const outputPath = path.join(outputDir, filename);

    await fs.writeFile(outputPath, content, 'utf8');
    return outputPath;
  }

  getCategoryFolder(category) {
    const mapping = {
      biological: 'biological',
      chemical: 'chemical',
      economic: 'economic',
      electrical: 'electrical',
      environmental: 'environmental',
      materials: 'materials',
      monitoring: 'monitoring',
      operational: 'operational',
      performance: 'performance',
      physical: 'physical',
      safety: 'safety',
    };
    return mapping[category] || 'general';
  }

  async findParametersNeedingDocs(limit = 10) {
    const params = [];

    for (const category of this.unifiedData.categories) {
      for (const subcategory of category.subcategories) {
        for (const param of subcategory.parameters) {
          // Skip categorical variables
          if (this.isCategoricalVariable(param)) continue;

          // Add category info
          param.category = category.id.replace('-parameters', '');
          param.subcategoryName = subcategory.name;

          params.push(param);

          if (params.length >= limit) return params;
        }
      }
    }

    return params;
  }

  isCategoricalVariable(param) {
    if (param.type === 'select') return true;
    if (param.type === 'string' && !param.unit) return true;
    if (param.unit) return false;

    const categoricalIds = [
      'microbial_species',
      'dominant_species',
      'species_selection',
      'organism_type',
      'bacterial_strain',
      'microbe_selection',
    ];

    return categoricalIds.includes(param.id?.toLowerCase());
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limit = parseInt(args[0]) || 3;

  const generator = new SimpleDocGenerator();

  try {
    await generator.initialize();

    console.log(`🔍 Finding ${limit} parameters to document...`);
    const params = await generator.findParametersNeedingDocs(limit);

    console.log(`📝 Generating documentation for ${params.length} parameters...`);
    const results = { successful: [], failed: [] };

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      console.log(`\n[${i + 1}/${params.length}] Processing: ${param.name}`);

      try {
        const documentation = await generator.generateSimpleDoc(param);
        const outputPath = await generator.saveDocumentation(param, documentation);

        results.successful.push({ param, outputPath });
        console.log(`✅ Generated: ${outputPath}`);

        // Check quality
        const quality = documentation.length > 800 ? '✅ Good' : '⚠️  Short';
        console.log(`   Quality: ${quality} (${documentation.length} chars)`);
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        results.failed.push({ param, error: error.message });
      }

      // Delay between requests
      if (i < params.length - 1) {
        console.log(`⏳ Waiting ${CONFIG.delayBetweenRequests}ms...`);
        await generator.sleep(CONFIG.delayBetweenRequests);
      }
    }

    console.log(`\n📊 RESULTS:`);
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.successful.length > 0) {
      console.log(`\n📁 Generated files:`);
      results.successful.forEach((r) => console.log(`   ${r.outputPath}`));
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
