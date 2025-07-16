#!/usr/bin/env node

/**
 * Efficient Parameter Documentation Generator
 *
 * Generates concise but comprehensive parameter documentation
 * with shorter prompts and faster generation
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const CONFIG = {
  model: 'phi3.5:latest',
  baseUrl: 'http://localhost:11434',
  unifiedDataPath: path.join(
    __dirname,
    '../apps/web/public/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json'
  ),
  outputPath: path.join(__dirname, '../apps/web/public/parameters/parameters-v1'),
  delayBetweenRequests: 500,
  batchSize: 5,
  maxRetries: 2,
};

class EfficientDocGenerator {
  constructor() {
    this.unifiedData = null;
    this.existingFiles = new Set();
  }

  async initialize() {
    console.log('🚀 Initializing Efficient Doc Generator...');

    // Load parameter data
    const data = await fs.readFile(CONFIG.unifiedDataPath, 'utf8');
    this.unifiedData = JSON.parse(data);

    // Scan existing files
    await this.scanExistingFiles();

    console.log(`✅ Loaded ${this.unifiedData.metadata?.totalParameters || 'unknown'} parameters`);
    console.log(`📁 Found ${this.existingFiles.size} existing documentation files`);
  }

  async scanExistingFiles() {
    try {
      await this.scanDirectory(CONFIG.outputPath);
    } catch (error) {
      console.log('📁 No existing files found');
    }
  }

  async scanDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'INDEX.md') {
          // Extract parameter ID from filename
          const paramId = entry.name.replace('.md', '').replace(/-/g, '_');
          this.existingFiles.add(paramId);
        }
      }
    } catch (error) {
      // Directory doesn't exist yet
    }
  }

  async generateDoc(param) {
    const prompt = this.createEfficientPrompt(param);

    const curlCommand = `curl -s -X POST ${
      CONFIG.baseUrl
    }/api/generate -H "Content-Type: application/json" -d '${JSON.stringify({
      model: CONFIG.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 800,
        top_p: 0.9,
      },
    }).replace(/'/g, "'\\''")}' --max-time 45`;

    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
      try {
        const { stdout } = await execAsync(curlCommand);
        const response = JSON.parse(stdout);

        if (response.error) {
          throw new Error(`Ollama API error: ${response.error}`);
        }

        return this.formatDocumentation(response.response, param);
      } catch (error) {
        if (attempt === CONFIG.maxRetries) {
          throw error;
        }
        console.log(`   Retry ${attempt}/${CONFIG.maxRetries}...`);
        await this.sleep(1000);
      }
    }
  }

  createEfficientPrompt(param) {
    const unit = param.unit || 'dimensionless';
    const description =
      param.description || `Parameter measuring ${param.name.toLowerCase()} in MESS`;

    return `Create concise technical documentation for "${param.name}" (${param.id}) - ${description}.

Include ONLY these sections with brief content:

# ${param.name}

## Definition
Technical definition of what this parameter measures in MESS. (2-3 sentences)

## Typical Values
Range: [value] - [value] ${unit}
Optimal: [value] ${unit}

## Measurement Methods
Primary method in 2-3 bullet points.

## Affecting Factors
List 3 main factors as bullet points.

## Performance Impact
How it affects MESS performance. (2 sentences)

## Validation Rules
- Range: [min] - [max] ${unit}
- Units: ${unit}
- Physical limits

## References
Two relevant papers with authors and year.

Keep total under 500 words. Be specific with numbers.`;
  }

  formatDocumentation(content, param) {
    // Ensure proper heading
    if (!content.startsWith(`# ${param.name}`)) {
      content = `# ${param.name}\n\n${content}`;
    }

    // Add metadata
    const metadata = `<!-- 
Parameter ID: ${param.id}
Category: ${param.categoryId}
Subcategory: ${param.subcategoryId}
Generated: ${new Date().toISOString()}
Model: ${CONFIG.model}
-->

`;

    return metadata + content;
  }

  async saveDocumentation(param, content) {
    const categoryFolder = this.getCategoryFolder(param.categoryId);
    const outputDir = path.join(CONFIG.outputPath, categoryFolder);

    await fs.mkdir(outputDir, { recursive: true });

    const filename = `${param.id.replace(/_/g, '-')}.md`;
    const outputPath = path.join(outputDir, filename);

    await fs.writeFile(outputPath, content, 'utf8');
    return outputPath;
  }

  getCategoryFolder(categoryId) {
    const mapping = {
      'environmental-parameters': 'environmental',
      'material-parameters': 'materials',
      'biological-parameters': 'biological',
      'substrate-parameters': 'substrates',
      'membrane-parameters': 'membranes',
      'cell-level-parameters': 'electrical',
      'reactor-level-parameters': 'system',
      'cost-parameters': 'economic',
      'performance-parameters': 'electrical',
      'analytical-parameters': 'measurement',
      'quality-control-parameters': 'validation',
      'safety-parameters': 'safety',
      'standardization-parameters': 'standards',
    };

    return mapping[categoryId] || 'general';
  }

  async findParametersNeedingDocs(limit = 100) {
    const params = [];

    for (const category of this.unifiedData.categories) {
      for (const subcategory of category.subcategories) {
        for (const param of subcategory.parameters) {
          // Skip categorical variables
          if (this.isCategoricalVariable(param)) continue;

          // Skip if already documented
          if (this.existingFiles.has(param.id)) continue;

          // Add category info
          params.push({
            ...param,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
          });

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

  async processBatch(parameters) {
    const results = { successful: [], failed: [] };

    for (let i = 0; i < parameters.length; i++) {
      const param = parameters[i];
      console.log(`  [${i + 1}/${parameters.length}] ${param.name} (${param.id})`);

      try {
        const documentation = await this.generateDoc(param);
        const outputPath = await this.saveDocumentation(param, documentation);

        results.successful.push({ param, outputPath });
        console.log(`    ✅ Generated (${documentation.length} chars)`);
      } catch (error) {
        console.error(`    ❌ Failed: ${error.message.substring(0, 50)}...`);
        results.failed.push({ param, error: error.message });
      }

      // Small delay between requests
      if (i < parameters.length - 1) {
        await this.sleep(CONFIG.delayBetweenRequests);
      }
    }

    return results;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateReport(allResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: allResults.successful.length + allResults.failed.length,
        successful: allResults.successful.length,
        failed: allResults.failed.length,
        successRate:
          (
            (allResults.successful.length /
              (allResults.successful.length + allResults.failed.length)) *
            100
          ).toFixed(1) + '%',
      },
      successful: allResults.successful.map((r) => ({
        id: r.param.id,
        name: r.param.name,
        path: r.outputPath,
      })),
      failed: allResults.failed.map((r) => ({
        id: r.param.id,
        name: r.param.name,
        error: r.error.substring(0, 100),
      })),
    };

    const reportPath = path.join(CONFIG.outputPath, 'generation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const totalLimit = parseInt(args[0]) || 50;

  const generator = new EfficientDocGenerator();

  try {
    await generator.initialize();

    // Find parameters needing documentation
    const params = await generator.findParametersNeedingDocs(totalLimit);
    console.log(`📝 Found ${params.length} parameters needing documentation`);

    if (params.length === 0) {
      console.log('✅ All parameters are already documented!');
      return;
    }

    // Process in batches
    const allResults = { successful: [], failed: [] };

    for (let i = 0; i < params.length; i += CONFIG.batchSize) {
      const batch = params.slice(i, i + CONFIG.batchSize);
      const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
      const totalBatches = Math.ceil(params.length / CONFIG.batchSize);

      console.log(`\n🔄 Batch ${batchNum}/${totalBatches}`);
      const batchResults = await generator.processBatch(batch);

      allResults.successful.push(...batchResults.successful);
      allResults.failed.push(...batchResults.failed);

      // Delay between batches
      if (i + CONFIG.batchSize < params.length) {
        console.log(`⏳ Waiting before next batch...`);
        await generator.sleep(2000);
      }
    }

    // Generate report
    const report = await generator.generateReport(allResults);

    console.log('\n📊 GENERATION COMPLETE');
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    console.log(`📄 Report saved to: ${CONFIG.outputPath}/generation-report.json`);

    // Calculate overall progress
    const totalParameters = 573; // Total measurable parameters
    const totalDocumented = generator.existingFiles.size + report.summary.successful;
    const progressPercent = ((totalDocumented / totalParameters) * 100).toFixed(1);

    console.log(
      `\n📊 OVERALL PROGRESS: ${totalDocumented}/${totalParameters} (${progressPercent}%)`
    );
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
