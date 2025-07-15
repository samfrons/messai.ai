#!/usr/bin/env node

/**
 * Integrated Algae Research Workflow
 * This script properly integrates the MESS paper processing and database expansion
 */

import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { MESSPaperProcessor } from './process-mess-papers';
import { AlgaePaperExpansion } from './expand-algae-papers';

// Color codes for console output
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

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  help: args.includes('--help') || args.includes('-h'),
  messOnly: args.includes('--mess-only'),
  expandOnly: args.includes('--expand-only'),
  targetCount: parseInt(args.find((arg) => arg.startsWith('--count='))?.split('=')[1] || '50'),
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Show help
if (options.help) {
  console.log(`
${colors.bright}Integrated Algae Research Workflow${colors.reset}

${colors.cyan}Usage:${colors.reset}
  pnpm algae-research:integrated [options]

${colors.cyan}Options:${colors.reset}
  ${colors.green}--help, -h${colors.reset}           Show this help message
  ${colors.green}--mess-only${colors.reset}          Process only MESS papers
  ${colors.green}--expand-only${colors.reset}        Expand database only
  ${colors.green}--count=<number>${colors.reset}     Target papers for expansion (default: 50)
  ${colors.green}--dry-run${colors.reset}            Show what would be done without executing
  ${colors.green}--verbose, -v${colors.reset}        Enable verbose output

${colors.cyan}Examples:${colors.reset}
  ${colors.dim}# Process everything${colors.reset}
  pnpm algae-research:integrated

  ${colors.dim}# Dry run to see what would happen${colors.reset}
  pnpm algae-research:integrated --dry-run
`);
  process.exit(0);
}

// Print banner
console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════╗
║    MESSAI Integrated Research Workflow     ║
╚════════════════════════════════════════════╝${colors.reset}
`);

// Main execution
async function main() {
  const startTime = Date.now();
  let totalPapersAdded = 0;

  try {
    // Phase 1: Process MESS Papers
    if (!options.expandOnly) {
      const messDirectory = resolve(process.cwd(), 'mess-papers');

      console.log(`\n${colors.yellow}📄 Phase 1: Processing MESS Papers${colors.reset}`);
      console.log(`${colors.dim}Directory: ${messDirectory}${colors.reset}`);

      if (!existsSync(messDirectory)) {
        console.error(`${colors.red}❌ Error: mess-papers directory not found${colors.reset}`);
        console.log(
          `${colors.dim}   Create the directory and add PDF files to process${colors.reset}`
        );

        if (!options.expandOnly) {
          process.exit(1);
        }
      } else {
        // Check for PDF files
        const pdfFiles = readdirSync(messDirectory).filter((f) => f.endsWith('.pdf'));
        console.log(`${colors.green}✓ Found ${pdfFiles.length} PDF files${colors.reset}`);

        if (pdfFiles.length === 0) {
          console.warn(
            `${colors.yellow}⚠️  No PDF files found in mess-papers directory${colors.reset}`
          );
        } else {
          if (options.dryRun) {
            console.log(`\n${colors.cyan}[DRY RUN] Would process:${colors.reset}`);
            pdfFiles.forEach((file, i) => {
              console.log(`  ${i + 1}. ${file}`);
            });
          } else {
            // Actually process the papers
            const processor = new MESSPaperProcessor();
            await processor.initialize();
            const messResults = await processor.processAllPapers();

            totalPapersAdded += messResults.successfullyProcessed;

            // Generate report
            const report = await processor.generateReport();
            console.log(`\n${colors.green}✓ MESS processing complete${colors.reset}`);
            console.log(
              `  Papers processed: ${messResults.successfullyProcessed}/${messResults.totalPapers}`
            );
          }
        }
      }
    }

    // Phase 2: Expand Database
    if (!options.messOnly) {
      console.log(`\n${colors.yellow}🔍 Phase 2: Expanding Database${colors.reset}`);
      console.log(`${colors.dim}Target: ${options.targetCount} papers${colors.reset}`);

      if (options.dryRun) {
        console.log(`\n${colors.cyan}[DRY RUN] Would perform:${colors.reset}`);
        console.log(`  - Search for papers similar to MESS collection`);
        console.log(`  - Identify and fill research gaps`);
        console.log(`  - Analyze trends in algae fuel cell research`);
        console.log(`  - Expand keywords and find related papers`);
        console.log(`  - Target: ${options.targetCount} high-quality papers`);
      } else {
        // Actually expand the database
        const expander = new AlgaePaperExpansion();
        await expander.initialize();
        const expansionResults = await expander.expandDatabase(options.targetCount);

        totalPapersAdded += expansionResults.addedToDatabase;

        // Generate report
        const report = await expander.generateExpansionReport(expansionResults);
        console.log(`\n${colors.green}✓ Database expansion complete${colors.reset}`);
        console.log(`  Papers added: ${expansionResults.addedToDatabase}`);
      }
    }

    // Final Summary
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n${colors.bright}${colors.green}✨ Workflow Complete!${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);

    if (!options.dryRun) {
      console.log(`   Total Papers Added: ${colors.bright}${totalPapersAdded}${colors.reset}`);
      console.log(`   Total Time: ${colors.bright}${totalTime.toFixed(2)}s${colors.reset}`);

      // Important note about mock database
      console.log(
        `\n${colors.yellow}⚠️  Note: The current implementation uses mock database operations.${colors.reset}`
      );
      console.log(
        `${colors.dim}   Papers are not actually saved to a real database yet.${colors.reset}`
      );
      console.log(
        `${colors.dim}   To integrate with Prisma, update the addToDatabase methods.${colors.reset}`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}💥 Fatal Error:${colors.reset}`);
    console.error(
      colors.red + (error instanceof Error ? error.message : 'Unknown error') + colors.reset
    );
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(colors.dim + error.stack + colors.reset);
    }
    process.exit(1);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Processing interrupted${colors.reset}`);
  process.exit(130);
});

// Run
main();
