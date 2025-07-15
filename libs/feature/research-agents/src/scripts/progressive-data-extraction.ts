#!/usr/bin/env node

/**
 * Progressive Data Extraction Pipeline
 * Processes 7 MESS papers + top 400 database papers with structured extraction
 */

import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { OllamaService } from '../services/ollama-service';
import { PDFProcessor } from '../utils/pdf-processor';
import { ExternalAPIService } from '../services/external-apis';
import { PaperValidator } from '../services/paper-validator';

// Color codes for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

interface ProcessingStats {
  totalPapers: number;
  processedPapers: number;
  successfulExtractions: number;
  failedExtractions: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  qualityScores: number[];
  extractionTemplates: Record<string, number>;
}

interface ExtractedPaperData {
  paperId: string;
  title: string;
  extractedData: Record<string, any>;
  processingTime: number;
  qualityScore: number;
  validationResults: any;
  insights: any;
}

class ProgressiveDataExtractor {
  private prisma: PrismaClient;
  private ollama: OllamaService;
  private pdfProcessor: PDFProcessor;
  private externalAPI: ExternalAPIService;
  private validator: PaperValidator;
  private stats: ProcessingStats;

  constructor() {
    this.prisma = new PrismaClient();
    this.ollama = new OllamaService();
    this.pdfProcessor = new PDFProcessor();
    this.externalAPI = new ExternalAPIService();
    this.validator = new PaperValidator(
      {
        minQualityScore: 60,
        strictMode: false,
        enableAIValidation: true,
      },
      this.externalAPI,
      this.ollama
    );

    this.stats = {
      totalPapers: 0,
      processedPapers: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0,
      qualityScores: [],
      extractionTemplates: {},
    };
  }

  async initialize(): Promise<void> {
    console.log(
      `${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗`
    );
    console.log(`║           MESSAI Progressive Data Extraction               ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.yellow}🔧 Initializing services...${colors.reset}`);
    await this.ollama.initialize();

    // Check system health
    const systemHealth = await this.ollama.getSystemHealth();
    console.log(`${colors.green}✅ System Health: ${systemHealth.systemHealth}${colors.reset}`);
    console.log(
      `${colors.dim}   - Available Models: ${systemHealth.availableModels}/${systemHealth.totalModels}${colors.reset}`
    );
    console.log(
      `${colors.dim}   - Ollama Status: ${
        systemHealth.isOllamaRunning ? 'Running' : 'Not Running'
      }${colors.reset}`
    );
  }

  /**
   * Phase 1: Process 7 MESS papers with advanced extraction
   */
  async processMessPapers(): Promise<ExtractedPaperData[]> {
    console.log(
      `\n${colors.bright}${colors.blue}📄 Phase 1: Processing MESS Papers${colors.reset}`
    );
    console.log(`${colors.dim}${'='.repeat(50)}${colors.reset}`);

    const messDirectory = resolve(process.cwd(), 'mess-papers');
    if (!existsSync(messDirectory)) {
      console.error(`${colors.red}❌ Error: mess-papers directory not found${colors.reset}`);
      return [];
    }

    const pdfFiles = readdirSync(messDirectory)
      .filter((f) => f.endsWith('.pdf'))
      .slice(0, 7); // Process first 7 papers

    console.log(`${colors.green}📁 Found ${pdfFiles.length} PDF files${colors.reset}`);

    const results: ExtractedPaperData[] = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const fileName = pdfFiles[i];
      const filePath = resolve(messDirectory, fileName);

      console.log(
        `\n${colors.cyan}📄 Processing: ${fileName} (${i + 1}/${pdfFiles.length})${colors.reset}`
      );

      try {
        const startTime = Date.now();

        // Extract text from PDF
        const pdfText = await this.pdfProcessor.extractTextFromPDF(filePath);

        // Extract structured data using all templates
        const templateIds = [
          'algae_performance_metrics',
          'system_configuration',
          'algae_species_cultivation',
          'operating_conditions',
          'electrode_materials',
          'substrate_medium',
          'research_metadata',
        ];

        console.log(`${colors.dim}   🔄 Extracting structured data...${colors.reset}`);
        const extractedData = await this.ollama.extractMultipleDataTypes(pdfText, templateIds, {
          parallel: true,
          failFast: false,
        });

        // Generate AI insights
        console.log(`${colors.dim}   🧠 Generating AI insights...${colors.reset}`);
        const insights = await this.ollama.generateAIInsights(pdfText, 'paper_insights');

        // Validate paper quality
        console.log(`${colors.dim}   ✅ Validating paper quality...${colors.reset}`);
        const validationResults = await this.ollama.comprehensiveValidation(pdfText, {
          strictMode: false,
          skipPlagiarism: true,
        });

        const processingTime = Date.now() - startTime;

        // Calculate quality score
        const qualityScore =
          Object.values(validationResults).reduce((sum, result) => sum + (result.score || 0), 0) /
          Object.keys(validationResults).length;

        const result: ExtractedPaperData = {
          paperId: `mess_${i + 1}`,
          title: extractedData.research_metadata?.data?.title || fileName,
          extractedData,
          processingTime,
          qualityScore,
          validationResults,
          insights,
        };

        results.push(result);

        // Update stats
        this.stats.processedPapers++;
        this.stats.successfulExtractions++;
        this.stats.qualityScores.push(qualityScore);
        this.stats.totalProcessingTime += processingTime;

        console.log(
          `${colors.green}   ✅ Completed in ${(processingTime / 1000).toFixed(
            2
          )}s (Quality: ${qualityScore.toFixed(1)}/100)${colors.reset}`
        );

        // Show extracted data preview
        if (extractedData.algae_performance_metrics?.data?.powerDensity) {
          console.log(
            `${colors.dim}   📊 Power Density: ${extractedData.algae_performance_metrics.data.powerDensity} mW/m²${colors.reset}`
          );
        }
        if (extractedData.algae_species_cultivation?.data?.algaeSpecies) {
          console.log(
            `${colors.dim}   🦠 Algae Species: ${JSON.stringify(
              extractedData.algae_species_cultivation.data.algaeSpecies
            )}${colors.reset}`
          );
        }
      } catch (error) {
        console.error(
          `${colors.red}   ❌ Error processing ${fileName}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }${colors.reset}`
        );
        this.stats.failedExtractions++;
      }
    }

    console.log(
      `\n${colors.green}✅ Phase 1 Complete: ${results.length} papers processed${colors.reset}`
    );
    return results;
  }

  /**
   * Phase 2: Process top 400 database papers
   */
  async processTopDatabasePapers(): Promise<ExtractedPaperData[]> {
    console.log(
      `\n${colors.bright}${colors.blue}🗄️  Phase 2: Processing Top 400 Database Papers${colors.reset}`
    );
    console.log(`${colors.dim}${'='.repeat(50)}${colors.reset}`);

    try {
      // Get top 400 papers by quality score
      const topPapers = await this.prisma.paper.findMany({
        where: {
          abstract: { not: null },
          processingStatus: 'completed',
        },
        orderBy: [{ qualityScore: 'desc' }, { citationCount: 'desc' }, { year: 'desc' }],
        take: 400,
        select: {
          id: true,
          title: true,
          abstract: true,
          authors: true,
          journal: true,
          year: true,
          doi: true,
          qualityScore: true,
        },
      });

      console.log(
        `${colors.green}📊 Retrieved ${topPapers.length} papers from database${colors.reset}`
      );

      const results: ExtractedPaperData[] = [];
      const batchSize = 20; // Process in batches to avoid overwhelming

      for (let i = 0; i < topPapers.length; i += batchSize) {
        const batch = topPapers.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(topPapers.length / batchSize);

        console.log(
          `\n${colors.cyan}📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} papers)${colors.reset}`
        );

        const batchPromises = batch.map(async (paper) => {
          try {
            const startTime = Date.now();

            // Create combined text for extraction
            const combinedText = `
              Title: ${paper.title}
              Authors: ${paper.authors}
              Journal: ${paper.journal} (${paper.year})
              DOI: ${paper.doi || 'N/A'}
              Abstract: ${paper.abstract}
            `;

            // Extract performance metrics (most important for database papers)
            const performanceData = await this.ollama.extractStructuredData(
              combinedText,
              'algae_performance_metrics',
              { temperature: 0.1, validateOutput: true }
            );

            // Extract system configuration
            const systemConfig = await this.ollama.extractStructuredData(
              combinedText,
              'system_configuration',
              { temperature: 0.1, validateOutput: true }
            );

            // Generate quick insights
            const insights = await this.ollama.generateAIInsights(combinedText, 'paper_insights');

            const processingTime = Date.now() - startTime;

            const result: ExtractedPaperData = {
              paperId: paper.id,
              title: paper.title,
              extractedData: {
                algae_performance_metrics: performanceData,
                system_configuration: systemConfig,
              },
              processingTime,
              qualityScore: paper.qualityScore || 0,
              validationResults: null, // Skip validation for database papers
              insights,
            };

            results.push(result);

            // Update database with extracted performance data
            await this.prisma.paper.update({
              where: { id: paper.id },
              data: {
                performanceData: {
                  powerDensity: performanceData.data.powerDensity,
                  currentDensity: performanceData.data.currentDensity,
                  voltage: performanceData.data.voltage,
                  efficiency: performanceData.data.efficiency,
                  systemType: systemConfig.data.systemType,
                  reactorVolume: systemConfig.data.reactorVolume,
                  extractedAt: new Date(),
                },
                updatedAt: new Date(),
              },
            });

            this.stats.processedPapers++;
            this.stats.successfulExtractions++;
            this.stats.totalProcessingTime += processingTime;

            return result;
          } catch (error) {
            console.error(
              `${colors.red}   ❌ Error processing paper ${paper.id}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }${colors.reset}`
            );
            this.stats.failedExtractions++;
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const successfulResults = batchResults.filter((r) => r !== null);

        console.log(
          `${colors.green}   ✅ Batch ${batchNumber} completed: ${successfulResults.length}/${batch.length} successful${colors.reset}`
        );

        // Show progress
        const totalProcessed = Math.min(i + batchSize, topPapers.length);
        const progressPercent = (totalProcessed / topPapers.length) * 100;
        const progressBar =
          '█'.repeat(Math.floor(progressPercent / 2)) +
          '░'.repeat(50 - Math.floor(progressPercent / 2));
        console.log(
          `${colors.dim}   📈 Progress: [${progressBar}] ${progressPercent.toFixed(1)}%${
            colors.reset
          }`
        );
      }

      console.log(
        `\n${colors.green}✅ Phase 2 Complete: ${results.length} papers processed${colors.reset}`
      );
      return results;
    } catch (error) {
      console.error(
        `${colors.red}❌ Database processing error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }${colors.reset}`
      );
      return [];
    }
  }

  /**
   * Phase 3: Progressive expansion with analytics
   */
  async progressiveExpansion(): Promise<void> {
    console.log(`\n${colors.bright}${colors.blue}🚀 Phase 3: Progressive Expansion${colors.reset}`);
    console.log(`${colors.dim}${'='.repeat(50)}${colors.reset}`);

    try {
      // Get remaining papers in batches
      const remainingPapers = await this.prisma.paper.findMany({
        where: {
          abstract: { not: null },
          processingStatus: 'completed',
          performanceData: null, // Only unprocessed papers
        },
        orderBy: [{ qualityScore: 'desc' }, { citationCount: 'desc' }],
        take: 200, // Process another 200 papers
        select: {
          id: true,
          title: true,
          abstract: true,
          authors: true,
          qualityScore: true,
        },
      });

      console.log(
        `${colors.green}📊 Found ${remainingPapers.length} papers for progressive expansion${colors.reset}`
      );

      const batchSize = 25;
      let processedCount = 0;

      for (let i = 0; i < remainingPapers.length; i += batchSize) {
        const batch = remainingPapers.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(remainingPapers.length / batchSize);

        console.log(
          `\n${colors.cyan}⚡ Expansion batch ${batchNumber}/${totalBatches}${colors.reset}`
        );

        const batchPromises = batch.map(async (paper) => {
          try {
            const combinedText = `Title: ${paper.title}\nAuthors: ${paper.authors}\nAbstract: ${paper.abstract}`;

            // Fast extraction - only performance metrics
            const performanceData = await this.ollama.extractStructuredData(
              combinedText,
              'algae_performance_metrics',
              { temperature: 0.1, validateOutput: false }
            );

            // Update database
            await this.prisma.paper.update({
              where: { id: paper.id },
              data: {
                performanceData: {
                  powerDensity: performanceData.data.powerDensity,
                  currentDensity: performanceData.data.currentDensity,
                  voltage: performanceData.data.voltage,
                  efficiency: performanceData.data.efficiency,
                  extractedAt: new Date(),
                },
                updatedAt: new Date(),
              },
            });

            processedCount++;
            return true;
          } catch (error) {
            return false;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const successCount = batchResults.filter(Boolean).length;

        console.log(
          `${colors.green}   ✅ Processed ${successCount}/${batch.length} papers${colors.reset}`
        );

        // Real-time progress
        const progressPercent = (processedCount / remainingPapers.length) * 100;
        console.log(
          `${colors.dim}   📈 Total Progress: ${processedCount}/${
            remainingPapers.length
          } (${progressPercent.toFixed(1)}%)${colors.reset}`
        );
      }

      console.log(
        `\n${colors.green}✅ Phase 3 Complete: ${processedCount} additional papers processed${colors.reset}`
      );
    } catch (error) {
      console.error(
        `${colors.red}❌ Progressive expansion error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }${colors.reset}`
      );
    }
  }

  /**
   * Generate comprehensive analytics
   */
  async generateAnalytics(): Promise<void> {
    console.log(`\n${colors.bright}${colors.magenta}📊 Analytics Dashboard${colors.reset}`);
    console.log(`${colors.dim}${'='.repeat(50)}${colors.reset}`);

    // Database statistics
    const dbStats = await this.prisma.paper.aggregate({
      _count: { id: true },
      _avg: { qualityScore: true },
      where: { performanceData: { not: null } },
    });

    const totalPapersWithData = dbStats._count.id;
    const avgQuality = dbStats._avg.qualityScore || 0;

    // Processing statistics
    this.stats.averageProcessingTime = this.stats.totalProcessingTime / this.stats.processedPapers;
    const avgQualityScore =
      this.stats.qualityScores.reduce((a, b) => a + b, 0) / this.stats.qualityScores.length;

    console.log(`${colors.green}📈 Processing Statistics:${colors.reset}`);
    console.log(`${colors.dim}   Papers Processed: ${this.stats.processedPapers}${colors.reset}`);
    console.log(
      `${colors.dim}   Successful Extractions: ${this.stats.successfulExtractions}${colors.reset}`
    );
    console.log(
      `${colors.dim}   Failed Extractions: ${this.stats.failedExtractions}${colors.reset}`
    );
    console.log(
      `${colors.dim}   Success Rate: ${(
        (this.stats.successfulExtractions / this.stats.processedPapers) *
        100
      ).toFixed(1)}%${colors.reset}`
    );
    console.log(
      `${colors.dim}   Average Processing Time: ${(this.stats.averageProcessingTime / 1000).toFixed(
        2
      )}s${colors.reset}`
    );
    console.log(
      `${colors.dim}   Total Processing Time: ${(this.stats.totalProcessingTime / 1000).toFixed(
        2
      )}s${colors.reset}`
    );

    console.log(`\n${colors.green}🗄️  Database Statistics:${colors.reset}`);
    console.log(
      `${colors.dim}   Papers with Performance Data: ${totalPapersWithData}${colors.reset}`
    );
    console.log(
      `${colors.dim}   Average Quality Score: ${avgQuality.toFixed(1)}/100${colors.reset}`
    );
    console.log(
      `${colors.dim}   Processing Quality Score: ${avgQualityScore.toFixed(1)}/100${colors.reset}`
    );

    // Performance benchmarks
    const throughputPerHour =
      (this.stats.processedPapers / (this.stats.totalProcessingTime / 1000)) * 3600;
    console.log(`\n${colors.green}⚡ Performance Benchmarks:${colors.reset}`);
    console.log(
      `${colors.dim}   Throughput: ${throughputPerHour.toFixed(0)} papers/hour${colors.reset}`
    );
    console.log(`${colors.dim}   Cost per Paper: $0.00 (local processing)${colors.reset}`);
    console.log(
      `${colors.dim}   Quality vs Speed: ${(
        avgQualityScore /
        (this.stats.averageProcessingTime / 1000)
      ).toFixed(2)} quality/second${colors.reset}`
    );

    console.log(
      `\n${colors.bright}${colors.green}🎉 Progressive Data Extraction Complete!${colors.reset}`
    );
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const extractor = new ProgressiveDataExtractor();

  try {
    await extractor.initialize();

    // Phase 1: MESS Papers
    const messResults = await extractor.processMessPapers();

    // Phase 2: Top 400 Database Papers
    const databaseResults = await extractor.processTopDatabasePapers();

    // Phase 3: Progressive Expansion
    await extractor.progressiveExpansion();

    // Generate Analytics
    await extractor.generateAnalytics();
  } catch (error) {
    console.error(
      `${colors.red}❌ Fatal Error: ${error instanceof Error ? error.message : 'Unknown error'}${
        colors.reset
      }`
    );
    process.exit(1);
  } finally {
    await extractor.cleanup();
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Processing interrupted by user${colors.reset}`);
  process.exit(130);
});

// Run the main function
main().catch(console.error);
