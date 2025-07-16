#!/usr/bin/env node

/**
 * Batch Parameter Documentation Generator
 *
 * Production-ready script for generating parameter documentation at scale
 * with comprehensive error handling, progress tracking, and quality control.
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

  // Batch processing settings (adjusted for reliable generation)
  batchSize: 5,
  delayBetweenRequests: 1000, // 1 second delay between requests
  retryAttempts: 1,
  retryDelay: 3000, // 3 second delay between retries

  // Quality thresholds
  minDocLength: 800,
  requiredSections: ['Definition', 'Typical Values', 'Measurement Methods', 'References'],

  // Progress tracking
  saveProgressInterval: 5, // Save progress every 5 successful generations
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
};

class BatchDocGenerator {
  constructor() {
    this.unifiedData = null;
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      startTime: null,
      lastSaveTime: null,
    };
    this.results = {
      successful: [],
      failed: [],
      skipped: [],
    };
  }

  log(level, message) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[CONFIG.logLevel]) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  async initialize() {
    this.log('info', '🚀 Initializing Batch Documentation Generator...');

    // Load unified parameter data
    await this.loadUnifiedData();

    // Create output directories
    await this.createOutputDirectories();

    // Load existing progress if available
    await this.loadProgress();

    this.log('info', '✅ Initialization complete');
  }

  async loadUnifiedData() {
    try {
      const data = await fs.readFile(CONFIG.unifiedDataPath, 'utf8');
      this.unifiedData = JSON.parse(data);
      this.log(
        'info',
        `✅ Loaded ${this.unifiedData.metadata?.totalParameters || 'unknown'} parameters`
      );
    } catch (error) {
      throw new Error(`Failed to load unified data: ${error.message}`);
    }
  }

  async createOutputDirectories() {
    const categories = [
      'biological',
      'chemical',
      'economic',
      'electrical',
      'environmental',
      'materials',
      'monitoring',
      'operational',
      'performance',
      'physical',
      'safety',
    ];

    for (const category of categories) {
      const dirPath = path.join(CONFIG.outputPath, category);
      await fs.mkdir(dirPath, { recursive: true });
    }

    this.log('info', '📁 Created output directories');
  }

  async loadProgress() {
    const progressFile = path.join(CONFIG.outputPath, 'batch-progress.json');
    try {
      const data = await fs.readFile(progressFile, 'utf8');
      const savedProgress = JSON.parse(data);
      this.progress = { ...this.progress, ...savedProgress };
      this.log(
        'info',
        `📊 Loaded previous progress: ${this.progress.successful} successful, ${this.progress.failed} failed`
      );
    } catch (error) {
      this.log('info', '🆕 Starting fresh batch process');
    }
  }

  async saveProgress() {
    const progressFile = path.join(CONFIG.outputPath, 'batch-progress.json');
    const progressData = {
      ...this.progress,
      lastSaveTime: new Date().toISOString(),
      estimatedTimeRemaining: this.calculateETA(),
    };

    await fs.writeFile(progressFile, JSON.stringify(progressData, null, 2));
    this.log('debug', `💾 Progress saved: ${this.progress.processed}/${this.progress.total}`);
  }

  calculateETA() {
    if (!this.progress.startTime || this.progress.processed === 0) return 'unknown';

    const elapsed = Date.now() - new Date(this.progress.startTime).getTime();
    const avgTimePerParam = elapsed / this.progress.processed;
    const remaining = this.progress.total - this.progress.processed;
    const etaMs = remaining * avgTimePerParam;

    return new Date(Date.now() + etaMs).toISOString();
  }

  async findParametersToProcess(limit = null) {
    const params = [];
    const existingFiles = await this.scanExistingFiles();

    for (const category of this.unifiedData.categories) {
      for (const subcategory of category.subcategories) {
        for (const param of subcategory.parameters) {
          // Skip categorical variables
          if (this.isCategoricalVariable(param)) continue;

          // Check if already documented
          const expectedPath = this.getExpectedFilePath(param);
          if (existingFiles.has(expectedPath)) {
            this.progress.skipped++;
            continue;
          }

          // Add category info
          param.category = category.id.replace('-parameters', '');
          param.subcategoryName = subcategory.name;
          param.categoryId = category.id;

          params.push(param);

          if (limit && params.length >= limit) break;
        }
        if (limit && params.length >= limit) break;
      }
      if (limit && params.length >= limit) break;
    }

    return params;
  }

  async scanExistingFiles() {
    const existingFiles = new Set();

    try {
      const categories = await fs.readdir(CONFIG.outputPath);

      for (const category of categories) {
        const categoryPath = path.join(CONFIG.outputPath, category);
        const stat = await fs.stat(categoryPath).catch(() => null);

        if (stat && stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          files.forEach((file) => {
            if (file.endsWith('.md')) {
              existingFiles.add(path.join(categoryPath, file));
            }
          });
        }
      }
    } catch (error) {
      this.log('warn', `⚠️ Error scanning existing files: ${error.message}`);
    }

    this.log('info', `📄 Found ${existingFiles.size} existing documentation files`);
    return existingFiles;
  }

  getExpectedFilePath(param) {
    const categoryFolder = this.getCategoryFolder(param.category);
    const filename = `${param.id.replace(/_/g, '-')}.md`;
    return path.join(CONFIG.outputPath, categoryFolder, filename);
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
    this.progress.total = parameters.length;
    this.progress.startTime = new Date().toISOString();

    this.log('info', `📝 Starting batch processing of ${parameters.length} parameters...`);

    for (let i = 0; i < parameters.length; i += CONFIG.batchSize) {
      const batch = parameters.slice(i, i + CONFIG.batchSize);
      const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
      const totalBatches = Math.ceil(parameters.length / CONFIG.batchSize);

      this.log(
        'info',
        `\n🔄 Processing batch ${batchNum}/${totalBatches} (${batch.length} parameters)`
      );

      await this.processSingleBatch(batch);

      // Save progress periodically
      if (this.progress.successful % CONFIG.saveProgressInterval === 0) {
        await this.saveProgress();
      }

      // Delay between batches (except for the last batch)
      if (i + CONFIG.batchSize < parameters.length) {
        this.log('debug', `⏳ Waiting ${CONFIG.delayBetweenRequests}ms before next batch...`);
        await this.sleep(CONFIG.delayBetweenRequests);
      }
    }

    // Final progress save
    await this.saveProgress();
    await this.generateFinalReport();
  }

  async processSingleBatch(parameters) {
    const batchPromises = parameters.map(async (param, index) => {
      const paramNum = this.progress.processed + index + 1;

      try {
        this.log('debug', `[${paramNum}/${this.progress.total}] Processing: ${param.name}`);

        const documentation = await this.generateDocumentationWithRetry(param);
        const quality = this.assessQuality(documentation);

        if (quality.passed) {
          const outputPath = await this.saveDocumentation(param, documentation);

          this.results.successful.push({
            parameter: param,
            outputPath,
            quality: quality.score,
            length: documentation.length,
          });

          this.progress.successful++;
          this.log(
            'info',
            `✅ [${paramNum}] Generated: ${param.name} (${
              documentation.length
            } chars, score: ${quality.score.toFixed(2)})`
          );
        } else {
          throw new Error(`Quality check failed: ${quality.issues.join(', ')}`);
        }
      } catch (error) {
        this.log('error', `❌ [${paramNum}] Failed: ${param.name} - ${error.message}`);

        this.results.failed.push({
          parameter: param,
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        this.progress.failed++;
      }

      this.progress.processed++;
    });

    await Promise.allSettled(batchPromises);
  }

  async generateDocumentationWithRetry(param) {
    let lastError = null;

    for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
      try {
        return await this.generateDocumentation(param);
      } catch (error) {
        lastError = error;
        this.log(
          'warn',
          `⚠️ Attempt ${attempt}/${CONFIG.retryAttempts} failed for ${param.name}: ${error.message}`
        );

        if (attempt < CONFIG.retryAttempts) {
          this.log('debug', `⏳ Retrying in ${CONFIG.retryDelay}ms...`);
          await this.sleep(CONFIG.retryDelay);
        }
      }
    }

    throw lastError;
  }

  async generateDocumentation(param) {
    const prompt = this.createPrompt(param);

    const curlCommand = `curl -s -X POST ${
      CONFIG.baseUrl
    }/api/generate -H "Content-Type: application/json" -d '${JSON.stringify({
      model: CONFIG.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 1200,
      },
    }).replace(/'/g, "'\\''")}' --max-time 180`;

    const { stdout } = await execAsync(curlCommand);
    const response = JSON.parse(stdout);

    if (response.error) {
      throw new Error(`Ollama API error: ${response.error}`);
    }

    return this.formatDocumentation(response.response, param);
  }

  createPrompt(param) {
    return `Generate comprehensive technical documentation for the parameter "${
      param.name
    }" in microbial electrochemical systems (MESS).

Parameter Details:
- ID: ${param.id}
- Name: ${param.name}
- Description: ${param.description || 'Generate appropriate description'}
- Unit: ${param.unit || 'unitless'}
- Category: ${param.category}
- Subcategory: ${param.subcategoryName || ''}

Create well-structured documentation with these sections:

## Definition
Provide a detailed technical definition explaining what this parameter measures in MESS systems. Include physical/chemical significance and units.

## Typical Values
- **Range**: [minimum] - [maximum] ${param.unit || 'units'}
- **Typical**: [common operational range]
- **Optimal**: [range for best performance]

Include performance categories (Low/Moderate/High/Exceptional) with specific ranges.

## Measurement Methods
Describe specific measurement techniques, equipment needed, and calculation procedures. Include:
- Primary measurement method
- Alternative approaches
- Important considerations for accuracy

## Affecting Factors
List 4-5 key factors that influence this parameter:
1. **Factor Name**: Brief description of impact
2. **Another Factor**: How it affects the parameter
(Continue with remaining factors)

## Performance Impact
Explain how this parameter affects overall MESS system performance, including relationships to power output, efficiency, or stability.

## Validation Rules
Provide specific validation criteria:
- Acceptable ranges
- Quality control thresholds
- Common validation checks
- Error detection methods

## References
Include 2-3 realistic literature references in proper format:
1. **Author et al.** (Year). "Title". *Journal Name*, Volume(Issue), pages.

Make the documentation scientifically accurate with specific numeric ranges. Write in technical but accessible language.`;
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
Subcategory: ${param.subcategoryName || ''}
Generated: ${new Date().toISOString()}
Model: ${CONFIG.model}
Generator: Batch Documentation System v1.0
-->

`;

    return metadata + content;
  }

  assessQuality(documentation) {
    const quality = {
      score: 0,
      passed: false,
      issues: [],
    };

    // Check length
    if (documentation.length >= CONFIG.minDocLength) {
      quality.score += 0.3;
    } else {
      quality.issues.push(`Too short (${documentation.length} < ${CONFIG.minDocLength})`);
    }

    // Check required sections
    let sectionsFound = 0;
    CONFIG.requiredSections.forEach((section) => {
      if (documentation.includes(`## ${section}`)) {
        sectionsFound++;
        quality.score += 0.15;
      } else {
        quality.issues.push(`Missing section: ${section}`);
      }
    });

    // Check for numeric values
    const numericMatches = documentation.match(/\d+(\.\d+)?/g);
    if (numericMatches && numericMatches.length >= 5) {
      quality.score += 0.1;
    } else {
      quality.issues.push('Insufficient numeric detail');
    }

    // Check for references
    if (documentation.includes('## References') && documentation.match(/\d+\./)) {
      quality.score += 0.1;
    } else {
      quality.issues.push('No proper references');
    }

    quality.passed = quality.score >= 0.7 && quality.issues.length <= 2;

    return quality;
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

  async generateFinalReport() {
    const report = {
      timestamp: new Date().toISOString(),
      processingTime: this.progress.startTime
        ? (Date.now() - new Date(this.progress.startTime).getTime()) / 1000
        : 0,
      summary: {
        total: this.progress.total,
        processed: this.progress.processed,
        successful: this.progress.successful,
        failed: this.progress.failed,
        skipped: this.progress.skipped,
        successRate:
          this.progress.processed > 0
            ? ((this.progress.successful / this.progress.processed) * 100).toFixed(2)
            : 0,
      },
      qualityMetrics: {
        averageLength:
          this.results.successful.length > 0
            ? Math.round(
                this.results.successful.reduce((sum, r) => sum + r.length, 0) /
                  this.results.successful.length
              )
            : 0,
        averageQuality:
          this.results.successful.length > 0
            ? (
                this.results.successful.reduce((sum, r) => sum + r.quality, 0) /
                this.results.successful.length
              ).toFixed(2)
            : 0,
      },
      categoryBreakdown: this.generateCategoryBreakdown(),
      failureAnalysis: this.analyzeFailures(),
      generatedFiles: this.results.successful.map((r) => r.outputPath),
    };

    const reportPath = path.join(CONFIG.outputPath, 'batch-generation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log('info', `\n📊 BATCH GENERATION COMPLETE`);
    this.log('info', `⏱️  Processing time: ${Math.round(report.processingTime)}s`);
    this.log('info', `✅ Successful: ${report.summary.successful}`);
    this.log('info', `❌ Failed: ${report.summary.failed}`);
    this.log('info', `⏭️  Skipped: ${report.summary.skipped}`);
    this.log('info', `📈 Success rate: ${report.summary.successRate}%`);
    this.log('info', `📄 Average length: ${report.qualityMetrics.averageLength} chars`);
    this.log('info', `🎯 Average quality: ${report.qualityMetrics.averageQuality}`);
    this.log('info', `📋 Report saved to: ${reportPath}`);

    return report;
  }

  generateCategoryBreakdown() {
    const breakdown = {};

    this.results.successful.forEach((result) => {
      const category = result.parameter.category;
      if (!breakdown[category]) {
        breakdown[category] = { successful: 0, failed: 0 };
      }
      breakdown[category].successful++;
    });

    this.results.failed.forEach((result) => {
      const category = result.parameter.category;
      if (!breakdown[category]) {
        breakdown[category] = { successful: 0, failed: 0 };
      }
      breakdown[category].failed++;
    });

    return breakdown;
  }

  analyzeFailures() {
    const errorTypes = {};

    this.results.failed.forEach((failure) => {
      const errorType = this.categorizeError(failure.error);
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    return {
      totalFailures: this.results.failed.length,
      errorTypes,
      mostCommonError:
        Object.keys(errorTypes).reduce((a, b) => (errorTypes[a] > errorTypes[b] ? a : b), '') ||
        'none',
    };
  }

  categorizeError(errorMessage) {
    if (errorMessage.includes('timeout') || errorMessage.includes('max-time')) {
      return 'timeout';
    } else if (errorMessage.includes('Quality check failed')) {
      return 'quality_check';
    } else if (errorMessage.includes('Ollama API error')) {
      return 'ollama_api';
    } else if (errorMessage.includes('Command failed')) {
      return 'system_error';
    } else {
      return 'unknown';
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  const limit = parseInt(args[1]) || null;

  const generator = new BatchDocGenerator();

  try {
    await generator.initialize();

    switch (command) {
      case 'generate':
        const parameters = await generator.findParametersToProcess(limit);
        if (parameters.length === 0) {
          console.log('✅ No parameters need documentation generation');
          return;
        }

        console.log(`🚀 Found ${parameters.length} parameters to process`);
        await generator.processBatch(parameters);
        break;

      case 'status':
        await generator.loadProgress();
        console.log('📊 Current Progress:');
        console.log(`   Total: ${generator.progress.total}`);
        console.log(`   Processed: ${generator.progress.processed}`);
        console.log(`   Successful: ${generator.progress.successful}`);
        console.log(`   Failed: ${generator.progress.failed}`);
        console.log(`   Skipped: ${generator.progress.skipped}`);
        if (generator.progress.startTime) {
          console.log(`   Started: ${generator.progress.startTime}`);
          console.log(`   ETA: ${generator.calculateETA()}`);
        }
        break;

      default:
        console.log(`
Usage: node batch-generate-docs.js [command] [limit]

Commands:
  generate [limit]  - Generate documentation (optional limit)
  status           - Show current progress

Examples:
  node batch-generate-docs.js generate 50
  node batch-generate-docs.js generate
  node batch-generate-docs.js status
        `);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { BatchDocGenerator };
