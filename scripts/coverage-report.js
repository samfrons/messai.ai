#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate comprehensive coverage report for MESSAI project
 */

const coverageDir = path.join(__dirname, '..', 'coverage');
const reportDir = path.join(coverageDir, 'report');

// Ensure coverage directory exists
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

console.log('🧪 Running tests with coverage...\n');

try {
  // Run tests with coverage
  execSync('COVERAGE=true pnpm test:coverage', {
    stdio: 'inherit',
    env: { ...process.env, COVERAGE: 'true' },
  });
} catch (error) {
  console.error('❌ Tests failed. Coverage report may be incomplete.\n');
}

// Read coverage summary
const summaryPath = path.join(coverageDir, 'coverage-summary.json');
if (fs.existsSync(summaryPath)) {
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  console.log('\n📊 Coverage Summary:\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(
    `Statements : ${formatPercentage(summary.total.statements.pct)}% (${
      summary.total.statements.covered
    }/${summary.total.statements.total})`
  );
  console.log(
    `Branches   : ${formatPercentage(summary.total.branches.pct)}% (${
      summary.total.branches.covered
    }/${summary.total.branches.total})`
  );
  console.log(
    `Functions  : ${formatPercentage(summary.total.functions.pct)}% (${
      summary.total.functions.covered
    }/${summary.total.functions.total})`
  );
  console.log(
    `Lines      : ${formatPercentage(summary.total.lines.pct)}% (${summary.total.lines.covered}/${
      summary.total.lines.total
    })`
  );
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Find files with low coverage
  const lowCoverageFiles = [];
  Object.entries(summary).forEach(([file, data]) => {
    if (file !== 'total' && data.statements.pct < 80) {
      lowCoverageFiles.push({
        file: file.replace(process.cwd() + '/', ''),
        coverage: data.statements.pct,
      });
    }
  });

  if (lowCoverageFiles.length > 0) {
    console.log('⚠️  Files with low coverage (<80%):\n');
    lowCoverageFiles
      .sort((a, b) => a.coverage - b.coverage)
      .forEach(({ file, coverage }) => {
        console.log(`   ${formatPercentage(coverage)}% - ${file}`);
      });
    console.log();
  }
}

// Generate detailed report
console.log('📝 Generating detailed reports...\n');

// Create coverage badge
const lcovInfoPath = path.join(coverageDir, 'lcov.info');
if (fs.existsSync(lcovInfoPath)) {
  const lcovContent = fs.readFileSync(lcovInfoPath, 'utf8');
  const lines = lcovContent.split('\n');
  let totalLines = 0;
  let coveredLines = 0;

  lines.forEach((line) => {
    if (line.startsWith('LF:')) {
      totalLines += parseInt(line.substring(3), 10);
    } else if (line.startsWith('LH:')) {
      coveredLines += parseInt(line.substring(3), 10);
    }
  });

  const percentage = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(1) : '0';

  // Create badge JSON
  const badge = {
    schemaVersion: 1,
    label: 'coverage',
    message: `${percentage}%`,
    color: getBadgeColor(parseFloat(percentage)),
  };

  fs.writeFileSync(path.join(coverageDir, 'badge.json'), JSON.stringify(badge, null, 2));
}

// Create markdown report
const markdownReport = generateMarkdownReport();
fs.writeFileSync(path.join(coverageDir, 'REPORT.md'), markdownReport);

console.log('✅ Coverage reports generated:\n');
console.log(`   📊 HTML Report: ${path.join(coverageDir, 'html', 'index.html')}`);
console.log(`   📄 LCOV Report: ${path.join(coverageDir, 'lcov.info')}`);
console.log(`   📝 Markdown Report: ${path.join(coverageDir, 'REPORT.md')}`);
console.log(`   🏷️  Coverage Badge: ${path.join(coverageDir, 'badge.json')}`);
console.log();

// Helper functions
function formatPercentage(pct) {
  return pct.toFixed(2);
}

function getBadgeColor(percentage) {
  if (percentage >= 90) return 'brightgreen';
  if (percentage >= 80) return 'green';
  if (percentage >= 70) return 'yellow';
  if (percentage >= 60) return 'orange';
  return 'red';
}

function generateMarkdownReport() {
  const date = new Date().toISOString();
  const summaryPath = path.join(coverageDir, 'coverage-summary.json');

  let report = `# MESSAI Coverage Report\n\n`;
  report += `Generated: ${date}\n\n`;

  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

    report += `## Summary\n\n`;
    report += `| Metric | Coverage | Details |\n`;
    report += `|--------|----------|----------|\n`;
    report += `| Statements | ${formatPercentage(summary.total.statements.pct)}% | ${
      summary.total.statements.covered
    }/${summary.total.statements.total} |\n`;
    report += `| Branches | ${formatPercentage(summary.total.branches.pct)}% | ${
      summary.total.branches.covered
    }/${summary.total.branches.total} |\n`;
    report += `| Functions | ${formatPercentage(summary.total.functions.pct)}% | ${
      summary.total.functions.covered
    }/${summary.total.functions.total} |\n`;
    report += `| Lines | ${formatPercentage(summary.total.lines.pct)}% | ${
      summary.total.lines.covered
    }/${summary.total.lines.total} |\n`;

    report += `\n## Coverage by Module\n\n`;

    // Group files by module
    const modules = {};
    Object.entries(summary).forEach(([file, data]) => {
      if (file === 'total') return;

      const parts = file.split('/');
      let module = 'root';

      if (parts.includes('apps')) {
        const appIndex = parts.indexOf('apps');
        module = `apps/${parts[appIndex + 1]}`;
      } else if (parts.includes('libs')) {
        const libIndex = parts.indexOf('libs');
        module = `libs/${parts[libIndex + 1]}`;
      }

      if (!modules[module]) {
        modules[module] = { files: [], total: { statements: 0, covered: 0 } };
      }

      modules[module].files.push({ file, data });
      modules[module].total.statements += data.statements.total;
      modules[module].total.covered += data.statements.covered;
    });

    Object.entries(modules).forEach(([module, info]) => {
      const coverage = ((info.total.covered / info.total.statements) * 100).toFixed(2);
      report += `### ${module} (${coverage}%)\n\n`;

      info.files
        .sort((a, b) => a.data.statements.pct - b.data.statements.pct)
        .forEach(({ file, data }) => {
          const shortFile = file.replace(process.cwd() + '/', '').replace(module + '/', '');
          report += `- ${formatPercentage(data.statements.pct)}% - ${shortFile}\n`;
        });

      report += '\n';
    });
  }

  report += `## Next Steps\n\n`;
  report += `1. Review files with low coverage\n`;
  report += `2. Add tests for uncovered branches\n`;
  report += `3. Focus on critical business logic\n`;
  report += `4. Run \`pnpm test:watch\` to develop tests interactively\n`;

  return report;
}
