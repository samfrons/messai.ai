#!/usr/bin/env node

/**
 * Parameter Documentation Generator using Ollama
 *
 * This script identifies parameters lacking comprehensive documentation
 * and generates high-quality markdown files using Ollama models.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Ollama settings
  model: 'qwen2.5-coder:latest', // Use faster model for documentation
  baseUrl: 'http://localhost:11434',

  // File paths
  unifiedDataPath: './parameters/MESS_PARAMETERS_UNIFIED_FINAL.json',
  existingDocsPath: './parameters/parameters-v1',
  outputPath: './parameters/parameters-v1',

  // Documentation generation settings
  batchSize: 5, // Process parameters in batches
  delayBetweenRequests: 2000, // 2 second delay between Ollama requests

  // Quality thresholds
  minDocumentationScore: 0.8, // Minimum quality score for generated docs
  templateMatchThreshold: 0.9, // How closely to match existing templates
};

// Template structure based on existing comprehensive documentation
const DOCUMENTATION_TEMPLATE = {
  sections: [
    'Definition',
    'Typical Values',
    'Measurement Methods',
    'Affecting Factors',
    'Performance Impact',
    'Compatible Systems',
    'Validation Rules',
    'References',
    'Application Notes',
  ],

  // Category-specific additional sections
  categorySpecific: {
    electrical: ['Formula', 'Electrochemical Properties'],
    biological: ['Molecular Biology', 'Species Considerations', 'Transfer Mechanisms'],
    materials: ['Composition & Structure', 'Alternative Systems', 'Preparation Methods'],
  },
};

class ParameterDocumentationGenerator {
  constructor() {
    this.unifiedData = null;
    this.existingDocs = new Map();
    this.processedParameters = new Set();
  }

  async initialize() {
    console.log('🚀 Initializing Parameter Documentation Generator...');

    // Check Ollama availability
    await this.checkOllamaAvailability();

    // Load unified parameter data
    await this.loadUnifiedData();

    // Scan existing documentation
    await this.scanExistingDocumentation();

    console.log('✅ Initialization complete');
  }

  async checkOllamaAvailability() {
    try {
      const { stdout } = await execAsync('ollama list');
      const models = stdout
        .split('\n')
        .slice(1)
        .filter((line) => line.trim());
      const availableModels = models.map((line) => line.split(/\s+/)[0]);

      if (!availableModels.includes(CONFIG.model)) {
        console.log(`⚠️  Model ${CONFIG.model} not found. Available models:`, availableModels);
        CONFIG.model = availableModels[0]; // Use first available model
        console.log(`🔄 Using model: ${CONFIG.model}`);
      }

      console.log(`✅ Ollama is available with model: ${CONFIG.model}`);
    } catch (error) {
      throw new Error(`Ollama not available: ${error.message}`);
    }
  }

  async loadUnifiedData() {
    try {
      const data = await fs.readFile(CONFIG.unifiedDataPath, 'utf8');
      this.unifiedData = JSON.parse(data);
      console.log(
        `✅ Loaded ${this.unifiedData.metadata?.totalParameters || 'unknown'} parameters`
      );
    } catch (error) {
      throw new Error(`Failed to load unified data: ${error.message}`);
    }
  }

  async scanExistingDocumentation() {
    try {
      const exists = await fs
        .access(CONFIG.existingDocsPath)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        console.log('📁 Creating parameters-v1 directory...');
        await fs.mkdir(CONFIG.existingDocsPath, { recursive: true });
        return;
      }

      // Recursively scan for existing markdown files
      await this.scanDirectory(CONFIG.existingDocsPath);
      console.log(`✅ Found ${this.existingDocs.size} existing documentation files`);
    } catch (error) {
      console.warn(`⚠️  Error scanning existing docs: ${error.message}`);
    }
  }

  async scanDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'INDEX.md') {
        const content = await fs.readFile(fullPath, 'utf8');
        const parameterId = this.extractParameterIdFromPath(fullPath);
        if (parameterId) {
          this.existingDocs.set(parameterId, {
            path: fullPath,
            content,
            quality: this.assessDocumentationQuality(content),
          });
        }
      }
    }
  }

  extractParameterIdFromPath(filePath) {
    // Try to match parameter IDs based on filename patterns
    const filename = path.basename(filePath, '.md');

    // Common patterns for parameter file naming
    const patterns = [filename.replace(/-/g, '_'), filename.replace(/_/g, '-'), filename];

    return patterns[0]; // Return first pattern for now
  }

  assessDocumentationQuality(content) {
    let score = 0;
    const sections = DOCUMENTATION_TEMPLATE.sections;

    // Check for presence of required sections
    sections.forEach((section) => {
      if (content.includes(`## ${section}`)) {
        score += 1 / sections.length;
      }
    });

    // Bonus points for comprehensive content
    if (content.length > 2000) score += 0.1;
    if (content.includes('Formula:')) score += 0.1;
    if (content.includes('References')) score += 0.1;
    if (content.match(/\d+\.\s+\*\*/)) score += 0.1; // Numbered citations

    return Math.min(score, 1.0);
  }

  async identifyParametersNeedingDocumentation() {
    const needsDocumentation = [];

    // Iterate through all parameters in unified data
    for (const category of this.unifiedData.categories) {
      for (const subcategory of category.subcategories) {
        for (const param of subcategory.parameters) {
          // Skip categorical variables
          if (this.isCategoricalVariable(param)) continue;

          const hasDocumentation = this.existingDocs.has(param.id);
          const documentationQuality = hasDocumentation
            ? this.existingDocs.get(param.id).quality
            : 0;

          if (!hasDocumentation || documentationQuality < CONFIG.minDocumentationScore) {
            needsDocumentation.push({
              ...param,
              category: category.name,
              categoryId: category.id,
              subcategory: subcategory.name,
              subcategoryId: subcategory.id,
              currentQuality: documentationQuality,
              needsUpdate: hasDocumentation && documentationQuality < CONFIG.minDocumentationScore,
            });
          }
        }
      }
    }

    console.log(`📊 Found ${needsDocumentation.length} parameters needing documentation`);
    return needsDocumentation;
  }

  isCategoricalVariable(param) {
    // Use the same logic as the main application
    const paramName = param.name?.toLowerCase() || '';
    const paramId = param.id?.toLowerCase() || '';

    if (param.type === 'select') return true;
    if (param.type === 'string' && !param.unit) return true;
    if (param.unit) return false;

    const biologicalCategoricalIds = [
      'microbial_species',
      'dominant_species',
      'species_selection',
      'organism_type',
      'bacterial_strain',
      'microbe_selection',
    ];

    if (biologicalCategoricalIds.includes(paramId)) return true;

    const categoricalPatterns = [
      'material_type',
      'membrane_type',
      'electrode_type',
      'system_type',
      'configuration_type',
      'method_type',
      'technique_type',
      'source_type',
      'brand_name',
      'model_name',
      'vendor_name',
      'supplier_name',
      'manufacturer_name',
      'selection',
      'choice',
      'option',
    ];

    return categoricalPatterns.some(
      (pattern) => paramName.includes(pattern) || paramId.includes(pattern)
    );
  }

  async generateDocumentation(parameters) {
    console.log(`📝 Generating documentation for ${parameters.length} parameters...`);

    const results = {
      successful: [],
      failed: [],
      skipped: [],
    };

    // Process in batches to avoid overwhelming Ollama
    for (let i = 0; i < parameters.length; i += CONFIG.batchSize) {
      const batch = parameters.slice(i, i + CONFIG.batchSize);
      console.log(
        `\n🔄 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(
          parameters.length / CONFIG.batchSize
        )}`
      );

      await this.processBatch(batch, results);

      // Delay between batches
      if (i + CONFIG.batchSize < parameters.length) {
        console.log(`⏳ Waiting ${CONFIG.delayBetweenRequests}ms before next batch...`);
        await this.sleep(CONFIG.delayBetweenRequests);
      }
    }

    return results;
  }

  async processBatch(parameters, results) {
    const batchPromises = parameters.map(async (param) => {
      try {
        const documentation = await this.generateParameterDocumentation(param);
        const outputPath = await this.saveDocumentation(param, documentation);

        results.successful.push({
          parameter: param,
          outputPath,
          quality: this.assessDocumentationQuality(documentation),
        });

        console.log(`✅ Generated: ${param.name} (${param.id})`);
      } catch (error) {
        console.error(`❌ Failed: ${param.name} - ${error.message}`);
        results.failed.push({
          parameter: param,
          error: error.message,
        });
      }
    });

    await Promise.allSettled(batchPromises);
  }

  async generateParameterDocumentation(param) {
    // Get relevant examples from existing documentation
    const examples = this.getRelevantExamples(param);

    // Create comprehensive prompt for Ollama
    const prompt = this.createDocumentationPrompt(param, examples);

    // Generate documentation using Ollama
    const documentation = await this.callOllama(prompt);

    // Post-process and validate
    return this.postProcessDocumentation(documentation, param);
  }

  getRelevantExamples(param) {
    const examples = [];

    // Find examples from same category
    for (const [id, doc] of this.existingDocs) {
      if (doc.quality >= CONFIG.templateMatchThreshold) {
        examples.push({
          id,
          content: doc.content.substring(0, 1000), // First 1000 chars as example
          quality: doc.quality,
        });

        if (examples.length >= 2) break; // Use top 2 examples
      }
    }

    return examples;
  }

  createDocumentationPrompt(param, examples) {
    const exampleContent = examples
      .map((ex) => `\n--- Example from ${ex.id} ---\n${ex.content}\n---\n`)
      .join('');

    return `You are a technical documentation specialist for microbial electrochemical systems (MESS). Generate comprehensive, scientifically accurate documentation for the following parameter.

PARAMETER TO DOCUMENT:
- ID: ${param.id}
- Name: ${param.name}
- Description: ${param.description || 'No description provided'}
- Unit: ${param.unit || 'No unit specified'}
- Type: ${param.type || 'unspecified'}
- Category: ${param.category} (${param.categoryId})
- Subcategory: ${param.subcategory} (${param.subcategoryId})
${param.range ? `- Range: ${param.range.min} - ${param.range.max}` : ''}
${
  param.typical_range
    ? `- Typical Range: ${param.typical_range.min} - ${param.typical_range.max}`
    : ''
}

DOCUMENTATION REQUIREMENTS:
1. Follow the exact structure and style of the examples below
2. Include all required sections: Definition, Typical Values, Measurement Methods, Affecting Factors, Performance Impact, Compatible Systems, Validation Rules, References, Application Notes
3. Be scientifically accurate and cite relevant literature
4. Include specific numeric ranges and validation criteria
5. Provide practical measurement guidance
6. Consider the parameter's role in MESS systems

STYLE GUIDELINES:
- Use technical but accessible language
- Include specific formulas where applicable
- Provide comprehensive typical value ranges
- Include validation rules with specific criteria
- Reference actual scientific literature (use realistic citations)
- Structure content with clear headings and subheadings
- Include practical application notes for different system scales

EXAMPLE DOCUMENTATION STRUCTURE:
${exampleContent}

Generate comprehensive documentation for ${
      param.name
    } following the same structure, depth, and quality as the examples. The documentation should be complete, technically accurate, and immediately useful for researchers and engineers working with microbial electrochemical systems.`;
  }

  async callOllama(prompt) {
    try {
      const curlCommand = `curl -s -X POST ${
        CONFIG.baseUrl
      }/api/generate -H "Content-Type: application/json" -d '${JSON.stringify({
        model: CONFIG.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.8,
          num_predict: 2000,
        },
      }).replace(/'/g, "'\\''")}' --max-time 120`;

      const { stdout } = await execAsync(curlCommand);
      const response = JSON.parse(stdout);

      if (response.error) {
        throw new Error(`Ollama API error: ${response.error}`);
      }

      return response.response;
    } catch (error) {
      throw new Error(`Failed to call Ollama: ${error.message}`);
    }
  }

  postProcessDocumentation(documentation, param) {
    // Clean up and validate the generated documentation
    let processed = documentation;

    // Ensure it starts with the parameter name as heading
    if (!processed.startsWith(`# ${param.name}`)) {
      processed = `# ${param.name}\n\n${processed}`;
    }

    // Validate required sections are present
    const requiredSections = DOCUMENTATION_TEMPLATE.sections;
    const missingSections = requiredSections.filter(
      (section) => !processed.includes(`## ${section}`)
    );

    if (missingSections.length > 3) {
      throw new Error(
        `Generated documentation missing too many required sections: ${missingSections.join(', ')}`
      );
    }

    // Add parameter metadata comment at the top
    const metadata = `<!-- 
Parameter: ${param.id}
Category: ${param.categoryId}
Subcategory: ${param.subcategoryId}
Generated: ${new Date().toISOString()}
Generator: Ollama (${CONFIG.model})
-->

`;

    return metadata + processed;
  }

  async saveDocumentation(param, documentation) {
    // Determine output path based on category
    const categoryFolder = this.getCategoryFolder(param.categoryId);
    const outputDir = path.join(CONFIG.outputPath, categoryFolder);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate filename
    const filename = `${param.id.replace(/_/g, '-')}.md`;
    const outputPath = path.join(outputDir, filename);

    // Save documentation
    await fs.writeFile(outputPath, documentation, 'utf8');

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

  async generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.successful.length + results.failed.length + results.skipped.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        averageQuality:
          results.successful.length > 0
            ? results.successful.reduce((sum, r) => sum + r.quality, 0) / results.successful.length
            : 0,
      },
      details: results,
    };

    const reportPath = path.join(CONFIG.outputPath, 'generation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 GENERATION REPORT`);
    console.log(`Total Parameters: ${report.summary.total}`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏭️  Skipped: ${report.summary.skipped}`);
    console.log(`📈 Average Quality: ${report.summary.averageQuality.toFixed(2)}`);
    console.log(`📄 Report saved to: ${reportPath}`);

    return report;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';

  const generator = new ParameterDocumentationGenerator();

  try {
    await generator.initialize();

    switch (command) {
      case 'analyze':
        const needsDoc = await generator.identifyParametersNeedingDocumentation();
        console.log(`\n📊 ANALYSIS RESULTS:`);
        console.log(`Parameters needing documentation: ${needsDoc.length}`);

        // Group by category
        const byCategory = needsDoc.reduce((acc, param) => {
          acc[param.categoryId] = (acc[param.categoryId] || 0) + 1;
          return acc;
        }, {});

        console.log(`\nBy Category:`);
        Object.entries(byCategory).forEach(([cat, count]) => {
          console.log(`  ${cat}: ${count}`);
        });
        break;

      case 'generate':
        const limit = parseInt(args[1]) || 50; // Limit for testing
        const parametersToProcess = await generator.identifyParametersNeedingDocumentation();
        const limitedParameters = parametersToProcess.slice(0, limit);

        console.log(`\n🚀 Generating documentation for ${limitedParameters.length} parameters...`);
        const results = await generator.generateDocumentation(limitedParameters);
        await generator.generateReport(results);
        break;

      case 'test':
        // Test with a single parameter
        const testParams = await generator.identifyParametersNeedingDocumentation();
        if (testParams.length > 0) {
          console.log(`\n🧪 Testing with parameter: ${testParams[0].name}`);
          const testResults = await generator.generateDocumentation([testParams[0]]);
          await generator.generateReport(testResults);
        }
        break;

      default:
        console.log(`
Usage: node generate-parameter-docs.js [command] [options]

Commands:
  analyze           - Analyze parameters needing documentation
  generate [limit]  - Generate documentation (default limit: 50)
  test             - Test with a single parameter
  
Examples:
  node generate-parameter-docs.js analyze
  node generate-parameter-docs.js generate 10
  node generate-parameter-docs.js test
        `);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ParameterDocumentationGenerator, CONFIG };
