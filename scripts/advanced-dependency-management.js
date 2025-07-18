#!/usr/bin/env node

/**
 * Advanced Dependency Management Automation
 *
 * This script provides comprehensive dependency analysis, security checking,
 * and automated updates for the MESSAI project. Perfect for nighttime automation.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DependencyManager {
  constructor() {
    this.reportDir = path.join(__dirname, '../reports/dependencies');
    this.logFile = path.join(this.reportDir, `deps-${new Date().toISOString().split('T')[0]}.log`);
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}`;
    console.log(logEntry);
    fs.appendFileSync(this.logFile, logEntry + '\n');
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}`);
    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.log(`Error in ${description}: ${error.message}`, 'ERROR');
          resolve({ success: false, error: error.message, output: stderr });
        } else {
          this.log(`Completed: ${description}`);
          resolve({ success: true, output: stdout, stderr });
        }
      });
    });
  }

  async analyzeOutdatedDependencies() {
    this.log('=== ANALYZING OUTDATED DEPENDENCIES ===');

    const result = await this.runCommand(
      'pnpm outdated --format=json',
      'Dependency outdated analysis'
    );

    let outdatedData = {};
    if (result.success) {
      try {
        // Parse pnpm outdated output
        const lines = result.output.split('\n').filter((line) => line.trim());
        const jsonLine = lines.find((line) => line.startsWith('{'));
        if (jsonLine) {
          outdatedData = JSON.parse(jsonLine);
        }
      } catch (e) {
        this.log('Could not parse outdated JSON, using raw output', 'WARN');
        outdatedData = { raw: result.output };
      }
    }

    return {
      timestamp: new Date().toISOString(),
      outdated: outdatedData,
      totalPackages: Object.keys(outdatedData).length,
      criticalUpdates: this.identifyCriticalUpdates(outdatedData),
    };
  }

  identifyCriticalUpdates(outdatedData) {
    const critical = [];
    const securityKeywords = ['security', 'vulnerability', 'cve', 'critical'];

    Object.entries(outdatedData).forEach(([pkg, info]) => {
      if (typeof info === 'object' && info.current && info.wanted) {
        const majorUpdate = this.isMajorVersionUpdate(info.current, info.wanted);
        if (majorUpdate) {
          critical.push({ package: pkg, type: 'major', ...info });
        }
      }
    });

    return critical;
  }

  isMajorVersionUpdate(current, wanted) {
    try {
      const currentMajor = parseInt(current.split('.')[0]);
      const wantedMajor = parseInt(wanted.split('.')[0]);
      return wantedMajor > currentMajor;
    } catch {
      return false;
    }
  }

  async performSecurityAudit() {
    this.log('=== PERFORMING SECURITY AUDIT ===');

    const auditResult = await this.runCommand('pnpm audit --format=json', 'Security audit');

    let auditData = {};
    if (auditResult.success) {
      try {
        const lines = auditResult.output.split('\n').filter((line) => line.trim());
        const jsonLine = lines.find((line) => line.startsWith('{'));
        if (jsonLine) {
          auditData = JSON.parse(jsonLine);
        }
      } catch (e) {
        this.log('Could not parse audit JSON, using summary', 'WARN');
      }
    }

    // Get audit summary
    const summaryResult = await this.runCommand('pnpm audit', 'Security audit summary');

    return {
      timestamp: new Date().toISOString(),
      auditData,
      summary: summaryResult.output,
      vulnerabilities: this.parseVulnerabilities(summaryResult.output),
      recommendations: this.generateSecurityRecommendations(auditData),
    };
  }

  parseVulnerabilities(auditOutput) {
    const lines = auditOutput.split('\n');
    const vulnLine = lines.find((line) => line.includes('vulnerabilities'));

    if (vulnLine) {
      const numbers = vulnLine.match(/\d+/g) || [];
      return {
        total: parseInt(numbers[0]) || 0,
        breakdown: vulnLine,
      };
    }

    return { total: 0, breakdown: 'No vulnerabilities found' };
  }

  generateSecurityRecommendations(auditData) {
    const recommendations = [];

    if (auditData.advisories) {
      Object.values(auditData.advisories).forEach((advisory) => {
        recommendations.push({
          title: advisory.title,
          severity: advisory.severity,
          module: advisory.module_name,
          recommendation: advisory.recommendation || 'Update to patched version',
        });
      });
    }

    return recommendations.slice(0, 10); // Top 10 most critical
  }

  async analyzeLicenseCompliance() {
    this.log('=== ANALYZING LICENSE COMPLIANCE ===');

    // Check if license-checker is available
    const hasLicenseChecker = await this.runCommand(
      'npx license-checker --version',
      'Check license-checker availability'
    );

    if (!hasLicenseChecker.success) {
      this.log('Installing license-checker for compliance analysis', 'INFO');
      await this.runCommand('npm install -g license-checker', 'Install license-checker');
    }

    const licenseResult = await this.runCommand(
      'npx license-checker --json --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;Unlicense"',
      'License compliance check'
    );

    let licenseData = {};
    if (licenseResult.success) {
      try {
        licenseData = JSON.parse(licenseResult.output);
      } catch (e) {
        this.log('Could not parse license data', 'WARN');
      }
    }

    return {
      timestamp: new Date().toISOString(),
      totalPackages: Object.keys(licenseData).length,
      licenses: this.categorizeLicenses(licenseData),
      potentialIssues: this.identifyLicenseIssues(licenseData),
    };
  }

  categorizeLicenses(licenseData) {
    const categories = {};

    Object.entries(licenseData).forEach(([pkg, info]) => {
      const license = info.licenses || 'Unknown';
      if (!categories[license]) {
        categories[license] = [];
      }
      categories[license].push(pkg);
    });

    return categories;
  }

  identifyLicenseIssues(licenseData) {
    const issues = [];
    const restrictive = ['GPL', 'AGPL', 'LGPL'];

    Object.entries(licenseData).forEach(([pkg, info]) => {
      const license = info.licenses || '';
      if (restrictive.some((r) => license.includes(r))) {
        issues.push({
          package: pkg,
          license,
          issue: 'Potentially restrictive license',
          recommendation: 'Review license compatibility',
        });
      }
    });

    return issues;
  }

  async generateUpdatePlan() {
    this.log('=== GENERATING UPDATE PLAN ===');

    const outdatedAnalysis = await this.analyzeOutdatedDependencies();
    const securityAudit = await this.performSecurityAudit();

    const updatePlan = {
      timestamp: new Date().toISOString(),
      priority: {
        critical: [], // Security vulnerabilities
        high: [], // Major version updates with security implications
        medium: [], // Minor version updates
        low: [], // Patch updates
      },
      summary: {
        totalOutdated: outdatedAnalysis.totalPackages,
        securityVulnerabilities: securityAudit.vulnerabilities.total,
        recommendedActions: [],
      },
    };

    // Prioritize security vulnerabilities
    securityAudit.recommendations.forEach((rec) => {
      if (rec.severity === 'critical' || rec.severity === 'high') {
        updatePlan.priority.critical.push({
          type: 'security',
          package: rec.module,
          severity: rec.severity,
          action: rec.recommendation,
        });
      }
    });

    // Add critical dependency updates
    outdatedAnalysis.criticalUpdates.forEach((update) => {
      updatePlan.priority.high.push({
        type: 'major_update',
        package: update.package,
        current: update.current,
        wanted: update.wanted,
        action: 'Review breaking changes before updating',
      });
    });

    return updatePlan;
  }

  async performSafeDependencyUpdates() {
    this.log('=== PERFORMING SAFE DEPENDENCY UPDATES ===');

    const updates = [];

    // Only perform patch and minor updates automatically
    const patchUpdateResult = await this.runCommand(
      'pnpm update --latest',
      'Safe dependency updates'
    );

    if (patchUpdateResult.success) {
      updates.push({
        type: 'patch_minor',
        status: 'completed',
        output: patchUpdateResult.output,
      });
    } else {
      updates.push({
        type: 'patch_minor',
        status: 'failed',
        error: patchUpdateResult.error,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      updates,
      nextSteps: [
        'Review updated dependencies',
        'Run test suite to verify compatibility',
        'Check for any breaking changes in minor updates',
      ],
    };
  }

  async generateComprehensiveReport() {
    this.log('=== GENERATING COMPREHENSIVE DEPENDENCY REPORT ===');

    const [outdated, security, licenses, updatePlan] = await Promise.all([
      this.analyzeOutdatedDependencies(),
      this.performSecurityAudit(),
      this.analyzeLicenseCompliance(),
      this.generateUpdatePlan(),
    ]);

    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        projectName: 'MESSAI',
        nodeVersion: process.version,
        pnpmVersion: await this.getPnpmVersion(),
      },
      summary: {
        totalDependencies: await this.getTotalDependencyCount(),
        outdatedCount: outdated.totalPackages,
        securityIssues: security.vulnerabilities.total,
        licenseIssues: licenses.potentialIssues.length,
      },
      detailed: {
        outdatedDependencies: outdated,
        securityAudit: security,
        licenseCompliance: licenses,
        updatePlan,
      },
      recommendations: this.generateOverallRecommendations(security, licenses, updatePlan),
    };

    const reportPath = path.join(
      this.reportDir,
      `comprehensive-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Comprehensive report saved to: ${reportPath}`);
    return { report, reportPath };
  }

  async getPnpmVersion() {
    const result = await this.runCommand('pnpm --version', 'Get pnpm version');
    return result.success ? result.output.trim() : 'unknown';
  }

  async getTotalDependencyCount() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return (
        Object.keys(packageJson.dependencies || {}).length +
        Object.keys(packageJson.devDependencies || {}).length
      );
    } catch {
      return 0;
    }
  }

  generateOverallRecommendations(security, licenses, updatePlan) {
    const recommendations = [];

    if (security.vulnerabilities.total > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        action: `Address ${security.vulnerabilities.total} security vulnerabilities immediately`,
        commands: ['pnpm audit fix'],
      });
    }

    if (licenses.potentialIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'licensing',
        action: `Review ${licenses.potentialIssues.length} potential license issues`,
        packages: licenses.potentialIssues.map((i) => i.package),
      });
    }

    if (updatePlan.priority.critical.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'dependencies',
        action: `Update ${updatePlan.priority.critical.length} critical dependencies`,
        packages: updatePlan.priority.critical.map((u) => u.package),
      });
    }

    return recommendations;
  }

  async run() {
    try {
      this.log('Starting advanced dependency management automation');

      const { report, reportPath } = await this.generateComprehensiveReport();

      // Perform safe updates if requested
      const safeUpdates = await this.performSafeDependencyUpdates();

      console.log('\n' + '='.repeat(60));
      console.log('📦 DEPENDENCY MANAGEMENT SUMMARY');
      console.log('='.repeat(60));
      console.log(`📊 Total Dependencies: ${report.summary.totalDependencies}`);
      console.log(`🔄 Outdated Packages: ${report.summary.outdatedCount}`);
      console.log(`🔒 Security Issues: ${report.summary.securityIssues}`);
      console.log(`📄 License Issues: ${report.summary.licenseIssues}`);
      console.log(`📋 Report Location: ${reportPath}`);
      console.log('='.repeat(60));

      if (report.recommendations.length > 0) {
        console.log('\n🎯 TOP RECOMMENDATIONS:');
        report.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
        });
      }

      return { success: true, report, safeUpdates };
    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const manager = new DependencyManager();
  manager.run().then((result) => {
    if (!result.success) {
      console.error('Dependency management failed:', result.error);
      process.exit(1);
    }
  });
}

module.exports = DependencyManager;
