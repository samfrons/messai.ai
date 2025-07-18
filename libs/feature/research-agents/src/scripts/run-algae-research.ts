#!/usr/bin/env node

/**
 * Run Algae Research - Single Command Script
 * Processes MESS papers and expands the research database
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import { runAlgaeWorkflow } from '../workflows/algae-paper-workflow';
import type { AlgaeWorkflowConfig } from '../workflows/algae-paper-workflow';

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
  targetCount: parseInt(args.find((arg) => arg.startsWith('--count='))?.split('=')[1] || '100'),
  strictness: (args.find((arg) => arg.startsWith('--strictness='))?.split('=')[1] || 'medium') as
    | 'low'
    | 'medium'
    | 'high',
  parallel: !args.includes('--no-parallel'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

// Show help
if (options.help) {
  console.log(`
${colors.bright}Algae Research Processing Tool${colors.reset}

${colors.cyan}Usage:${colors.reset}
  pnpm algae-research [options]

${colors.cyan}Options:${colors.reset}
  ${colors.green}--help, -h${colors.reset}           Show this help message
  ${colors.green}--mess-only${colors.reset}          Process only MESS papers (skip expansion)
  ${colors.green}--expand-only${colors.reset}        Expand database only (skip MESS papers)
  ${colors.green}--count=<number>${colors.reset}     Target number of papers for expansion (default: 100)
  ${colors.green}--strictness=<level>${colors.reset} Validation strictness: low, medium, high (default: medium)
  ${colors.green}--no-parallel${colors.reset}        Disable parallel processing
  ${colors.green}--verbose, -v${colors.reset}        Enable verbose output

${colors.cyan}Examples:${colors.reset}
  ${colors.dim}# Process everything (MESS papers + expand to 100 papers)${colors.reset}
  pnpm algae-research

  ${colors.dim}# Process only MESS papers${colors.reset}
  pnpm algae-research --mess-only

  ${colors.dim}# Expand database to 200 papers with high strictness${colors.reset}
  pnpm algae-research --expand-only --count=200 --strictness=high

  ${colors.dim}# Full processing with verbose output${colors.reset}
  pnpm algae-research --verbose
`);
  process.exit(0);
}

// Print banner
console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════╗
║      MESSAI Algae Research Processor       ║
╚════════════════════════════════════════════╝${colors.reset}
`);

// Check prerequisites
async function checkPrerequisites(): Promise<boolean> {
  console.log(`${colors.yellow}📋 Checking prerequisites...${colors.reset}`);

  // Check for mess-papers directory
  const messDirectory = resolve(process.cwd(), 'mess-papers');
  if (!options.expandOnly && !existsSync(messDirectory)) {
    console.error(
      `${colors.red}❌ Error: mess-papers directory not found at ${messDirectory}${colors.reset}`
    );
    console.log(
      `${colors.dim}   Please ensure the mess-papers directory exists with PDF files${colors.reset}`
    );
    return false;
  }

  // Check for Ollama (warning only)
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      console.warn(
        `${colors.yellow}⚠️  Warning: Ollama API not accessible. Will use mock responses.${colors.reset}`
      );
    } else {
      console.log(`${colors.green}✅ Ollama API is available${colors.reset}`);
    }
  } catch {
    console.warn(
      `${colors.yellow}⚠️  Warning: Ollama not running. Will use mock responses.${colors.reset}`
    );
    console.log(`${colors.dim}   To enable AI features, install and run Ollama:${colors.reset}`);
    console.log(`${colors.dim}   curl -fsSL https://ollama.com/install.sh | sh${colors.reset}`);
    console.log(`${colors.dim}   ollama serve${colors.reset}`);
  }

  return true;
}

// Main execution
async function main() {
  try {
    // Check prerequisites
    const prerequisitesOk = await checkPrerequisites();
    if (!prerequisitesOk && !options.expandOnly) {
      process.exit(1);
    }

    // Configure workflow
    const config: Partial<AlgaeWorkflowConfig> = {
      processMESSPapers: !options.expandOnly,
      expandDatabase: !options.messOnly,
      targetExpansionCount: options.targetCount,
      validationStrictness: options.strictness,
      parallelProcessing: options.parallel,
      enableRealTimeUpdates: options.verbose,
      maxConcurrentTasks: options.parallel ? 5 : 1,
    };

    // Print configuration
    console.log(`\n${colors.cyan}⚙️  Configuration:${colors.reset}`);
    console.log(
      `   Process MESS Papers: ${
        config.processMESSPapers ? colors.green + 'Yes' : colors.dim + 'No'
      }${colors.reset}`
    );
    console.log(
      `   Expand Database: ${config.expandDatabase ? colors.green + 'Yes' : colors.dim + 'No'}${
        colors.reset
      }`
    );
    if (config.expandDatabase) {
      console.log(
        `   Target Papers: ${colors.bright}${config.targetExpansionCount}${colors.reset}`
      );
    }
    console.log(
      `   Validation Strictness: ${colors.bright}${config.validationStrictness}${colors.reset}`
    );
    console.log(
      `   Parallel Processing: ${
        config.parallelProcessing ? colors.green + 'Yes' : colors.yellow + 'No'
      }${colors.reset}`
    );

    // Confirm execution
    console.log(`\n${colors.yellow}🚀 Starting processing...${colors.reset}\n`);

    // Run the workflow
    const startTime = Date.now();
    const result = await runAlgaeWorkflow(config);
    const totalTime = (Date.now() - startTime) / 1000;

    // Print summary
    console.log(`\n${colors.bright}${colors.green}✨ Processing Complete!${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(
      `   Status: ${
        result.status === 'completed'
          ? colors.green + '✅ SUCCESS'
          : result.status === 'partial'
            ? colors.yellow + '⚠️  PARTIAL'
            : colors.red + '❌ FAILED'
      }${colors.reset}`
    );
    console.log(`   Total Papers Added: ${colors.bright}${result.totalPapersAdded}${colors.reset}`);
    console.log(`   Total Time: ${colors.bright}${totalTime.toFixed(2)}s${colors.reset}`);

    if (result.qualityMetrics.averageQualityScore > 0) {
      console.log(
        `   Average Quality: ${colors.bright}${result.qualityMetrics.averageQualityScore.toFixed(
          1
        )}/100${colors.reset}`
      );
      console.log(
        `   Average Relevance: ${
          colors.bright
        }${result.qualityMetrics.averageRelevanceScore.toFixed(1)}/100${colors.reset}`
      );
    }

    // Show phase results
    if (result.phases.messProcessing) {
      const phase = result.phases.messProcessing;
      console.log(`\n   ${colors.cyan}📄 MESS Processing:${colors.reset}`);
      console.log(`      Processed: ${phase.processedPapers} papers`);
      console.log(`      Time: ${(phase.processingTime / 1000).toFixed(2)}s`);
      if (phase.errors?.length) {
        console.log(`      ${colors.red}Errors: ${phase.errors.length}${colors.reset}`);
      }
    }

    if (result.phases.databaseExpansion) {
      const phase = result.phases.databaseExpansion;
      console.log(`\n   ${colors.cyan}🔍 Database Expansion:${colors.reset}`);
      console.log(`      Added: ${phase.addedPapers} papers`);
      console.log(`      Searches: ${phase.searchQueries}`);
      console.log(`      Time: ${(phase.processingTime / 1000).toFixed(2)}s`);
      if (phase.errors?.length) {
        console.log(`      ${colors.red}Errors: ${phase.errors.length}${colors.reset}`);
      }
    }

    // Show recommendations
    if (result.recommendations.length > 0) {
      console.log(`\n${colors.cyan}💡 Recommendations:${colors.reset}`);
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Save report
    const reportPath = resolve(process.cwd(), `algae-research-report-${Date.now()}.md`);
    console.log(`\n${colors.green}📄 Report saved to: ${reportPath}${colors.reset}`);

    // Exit with appropriate code
    process.exit(result.status === 'failed' ? 1 : 0);
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

// Handle interrupts gracefully
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Processing interrupted by user${colors.reset}`);
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}🛑 Processing terminated${colors.reset}`);
  process.exit(143);
});

// Run the main function
main().catch((error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
