/**
 * Paper Validation Service
 * Prevents fake data and ensures paper quality and authenticity
 */

import { ExternalAPIService, type ExternalPaper } from './external-apis';
import { OllamaService } from './ollama-service';

export interface ValidationConfig {
  minQualityScore: number;
  requireDOI: boolean;
  requireAbstract: boolean;
  minYearThreshold: number;
  maxYearThreshold: number;
  algaeRelevanceThreshold: number;
  citationCountThreshold: number;
  enableExternalValidation: boolean;
  enableAIValidation: boolean;
  strictMode: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  qualityScore: number;
  validationChecks: {
    metadataComplete: boolean;
    externalValidation: boolean;
    duplicateCheck: boolean;
    algaeRelevance: boolean;
    authorValidation: boolean;
    journalValidation: boolean;
    citationValidation: boolean;
    contentQuality: boolean;
    aiValidation: boolean;
  };
  warnings: string[];
  errors: string[];
  recommendations: string[];
  processingTime: number;
}

export interface PaperToValidate {
  title: string;
  authors: string;
  abstract: string;
  year: number;
  journal?: string;
  doi?: string;
  pmid?: string;
  arxivId?: string;
  url?: string;
  citationCount?: number;
  keywords?: string[];
  source?: string;
}

export class PaperValidator {
  private config: ValidationConfig;
  private externalAPI: ExternalAPIService;
  private ollama: OllamaService;
  private validatedPapers: Set<string> = new Set();
  private blacklistedSources: Set<string> = new Set();
  private trustedJournals: Set<string> = new Set();

  constructor(
    config: Partial<ValidationConfig> = {},
    externalAPI: ExternalAPIService,
    ollama: OllamaService
  ) {
    this.config = {
      minQualityScore: 70,
      requireDOI: false,
      requireAbstract: true,
      minYearThreshold: 1990,
      maxYearThreshold: new Date().getFullYear() + 1,
      algaeRelevanceThreshold: 60,
      citationCountThreshold: 0,
      enableExternalValidation: true,
      enableAIValidation: true,
      strictMode: false,
      ...config,
    };

    this.externalAPI = externalAPI;
    this.ollama = ollama;
    this.initializeTrustedSources();
  }

  private initializeTrustedSources(): void {
    // Initialize trusted journals
    this.trustedJournals = new Set([
      'nature',
      'science',
      'cell',
      'applied energy',
      'energy & environmental science',
      'bioresource technology',
      'renewable energy',
      'journal of power sources',
      'energy conversion and management',
      'algal research',
      'biotechnology for biofuels',
      'environmental science & technology',
      'green chemistry',
      'sustainable energy & fuels',
      'ieee transactions on biomedical engineering',
      'lab on a chip',
      'microfluidics and nanofluidics',
    ]);

    // Initialize blacklisted sources (predatory journals, etc.)
    this.blacklistedSources = new Set([
      'ijser',
      'ijert',
      'ijesrt',
      'academicpublishingplatform',
      'scirp',
      'hilarispublisher',
      'omicsonline',
    ]);
  }

  async validatePaper(paper: PaperToValidate): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      isValid: false,
      confidence: 0,
      qualityScore: 0,
      validationChecks: {
        metadataComplete: false,
        externalValidation: false,
        duplicateCheck: false,
        algaeRelevance: false,
        authorValidation: false,
        journalValidation: false,
        citationValidation: false,
        contentQuality: false,
        aiValidation: false,
      },
      warnings: [],
      errors: [],
      recommendations: [],
      processingTime: 0,
    };

    try {
      // 1. Metadata completeness check
      result.validationChecks.metadataComplete = await this.validateMetadata(paper, result);

      // 2. External validation (DOI, PMID, etc.)
      if (this.config.enableExternalValidation) {
        result.validationChecks.externalValidation = await this.validateExternally(paper, result);
      }

      // 3. Duplicate check
      result.validationChecks.duplicateCheck = await this.checkDuplicates(paper, result);

      // 4. Algae relevance check
      result.validationChecks.algaeRelevance = await this.validateAlgaeRelevance(paper, result);

      // 5. Author validation
      result.validationChecks.authorValidation = await this.validateAuthors(paper, result);

      // 6. Journal validation
      result.validationChecks.journalValidation = await this.validateJournal(paper, result);

      // 7. Citation validation
      result.validationChecks.citationValidation = await this.validateCitations(paper, result);

      // 8. Content quality check
      result.validationChecks.contentQuality = await this.validateContentQuality(paper, result);

      // 9. AI validation
      if (this.config.enableAIValidation) {
        result.validationChecks.aiValidation = await this.validateWithAI(paper, result);
      }

      // Calculate overall scores
      result.qualityScore = await this.calculateQualityScore(paper, result);
      result.confidence = this.calculateConfidence(result);
      result.isValid = this.determineValidity(result);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(paper, result);

      result.processingTime = Date.now() - startTime;
      return result;
    } catch (error) {
      result.errors.push(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  private async validateMetadata(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    let valid = true;

    // Check required fields
    if (!paper.title || paper.title.length < 10) {
      result.errors.push('Title is missing or too short');
      valid = false;
    }

    if (!paper.authors || paper.authors.length < 3) {
      result.errors.push('Authors field is missing or too short');
      valid = false;
    }

    if (this.config.requireAbstract && (!paper.abstract || paper.abstract.length < 100)) {
      result.errors.push('Abstract is missing or too short');
      valid = false;
    }

    if (this.config.requireDOI && !paper.doi) {
      result.errors.push('DOI is required but missing');
      valid = false;
    }

    // Check year validity
    if (paper.year < this.config.minYearThreshold || paper.year > this.config.maxYearThreshold) {
      result.errors.push(
        `Year ${paper.year} is outside acceptable range (${this.config.minYearThreshold}-${this.config.maxYearThreshold})`
      );
      valid = false;
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(paper)) {
      result.warnings.push('Paper contains suspicious patterns that may indicate fake content');
      if (this.config.strictMode) {
        valid = false;
      }
    }

    return valid;
  }

  private async validateExternally(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    try {
      const externalPaper: ExternalPaper = {
        id: paper.doi || `temp-${Date.now()}`,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        year: paper.year,
        journal: paper.journal,
        doi: paper.doi,
        pmid: paper.pmid,
        arxivId: paper.arxivId,
        url: paper.url,
        source: 'validation',
        citationCount: paper.citationCount,
      };

      const validation = await this.externalAPI.validatePaper(externalPaper);

      if (validation.exists && validation.verified) {
        result.warnings.push('Paper verified through external database');
        return true;
      } else if (validation.exists && !validation.verified) {
        result.warnings.push('Paper exists but could not be fully verified');
        return !this.config.strictMode;
      } else {
        result.warnings.push('Paper could not be found in external databases');
        return !this.config.strictMode;
      }
    } catch (error) {
      result.warnings.push('External validation failed due to API error');
      return !this.config.strictMode;
    }
  }

  private async checkDuplicates(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    const paperKey = this.generatePaperKey(paper);

    if (this.validatedPapers.has(paperKey)) {
      result.errors.push('Paper appears to be a duplicate');
      return false;
    }

    // Check for similar titles (fuzzy matching)
    const similarPapers = Array.from(this.validatedPapers).filter((key) => {
      const similarity = this.calculateTitleSimilarity(paper.title, key);
      return similarity > 0.8;
    });

    if (similarPapers.length > 0) {
      result.warnings.push('Paper has similar title to existing papers');
      if (this.config.strictMode) {
        return false;
      }
    }

    this.validatedPapers.add(paperKey);
    return true;
  }

  private async validateAlgaeRelevance(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    const algaeKeywords = [
      'algae',
      'microalgae',
      'chlorella',
      'scenedesmus',
      'spirulina',
      'dunaliella',
      'chlamydomonas',
      'nannochloropsis',
      'arthrospira',
      'cyanobacteria',
      'phytoplankton',
    ];

    const fuelCellKeywords = [
      'fuel cell',
      'microbial fuel cell',
      'MFC',
      'bioelectrochemical',
      'biofuel cell',
      'enzymatic fuel cell',
      'photosynthetic fuel cell',
      'bioelectricity',
      'power generation',
      'current density',
    ];

    const bioreactorKeywords = [
      'bioreactor',
      'photobioreactor',
      'cultivation',
      'microfluidic',
      'biofilm',
      'electrode',
      'anode',
      'cathode',
      'membrane',
    ];

    const text = `${paper.title} ${paper.abstract}`.toLowerCase();

    let relevanceScore = 0;

    // Check for algae keywords
    algaeKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        relevanceScore += 25;
      }
    });

    // Check for fuel cell keywords
    fuelCellKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        relevanceScore += 30;
      }
    });

    // Check for bioreactor keywords
    bioreactorKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        relevanceScore += 20;
      }
    });

    const isRelevant = relevanceScore >= this.config.algaeRelevanceThreshold;

    if (!isRelevant) {
      result.errors.push(
        `Paper relevance score (${relevanceScore}) is below threshold (${this.config.algaeRelevanceThreshold})`
      );
    }

    return isRelevant;
  }

  private async validateAuthors(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    const authors = paper.authors.split(',').map((a) => a.trim());

    // Check for suspicious author patterns
    if (authors.length < 1) {
      result.errors.push('No authors specified');
      return false;
    }

    if (authors.length > 20) {
      result.warnings.push('Unusually high number of authors');
    }

    // Check for author name patterns
    const suspiciousPatterns = [
      /^[A-Z]\.$/, // Single initials only
      /^\d+$/, // Numbers only
      /^[a-z]+$/, // All lowercase
      /^[A-Z]+$/, // All uppercase
    ];

    let suspiciousAuthors = 0;
    authors.forEach((author) => {
      suspiciousPatterns.forEach((pattern) => {
        if (pattern.test(author)) {
          suspiciousAuthors++;
        }
      });
    });

    if (suspiciousAuthors > authors.length * 0.3) {
      result.warnings.push('Authors contain suspicious patterns');
      if (this.config.strictMode) {
        return false;
      }
    }

    return true;
  }

  private async validateJournal(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    if (!paper.journal) {
      result.warnings.push('Journal information missing');
      return !this.config.strictMode;
    }

    const journalLower = paper.journal.toLowerCase();

    // Check if journal is blacklisted
    if (this.blacklistedSources.has(journalLower)) {
      result.errors.push(`Journal "${paper.journal}" is on the blacklist`);
      return false;
    }

    // Check if journal is trusted
    const isTrusted = Array.from(this.trustedJournals).some((trusted) =>
      journalLower.includes(trusted)
    );

    if (isTrusted) {
      result.warnings.push('Paper from trusted journal');
      return true;
    }

    // Check for predatory journal indicators
    const predatoryIndicators = [
      'international journal',
      'global journal',
      'world journal',
      'open access',
      'research journal',
    ];

    const hasIndicators = predatoryIndicators.some((indicator) => journalLower.includes(indicator));

    if (hasIndicators) {
      result.warnings.push('Journal name contains potential predatory indicators');
      if (this.config.strictMode) {
        return false;
      }
    }

    return true;
  }

  private async validateCitations(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    if (paper.citationCount === undefined) {
      result.warnings.push('Citation count not available');
      return true;
    }

    if (paper.citationCount < this.config.citationCountThreshold) {
      result.warnings.push(`Citation count (${paper.citationCount}) is below threshold`);
      if (this.config.strictMode) {
        return false;
      }
    }

    // Check for unrealistic citation counts
    const maxReasonableCitations = Math.max(100, (new Date().getFullYear() - paper.year) * 50);
    if (paper.citationCount > maxReasonableCitations) {
      result.warnings.push('Citation count seems unrealistically high');
      if (this.config.strictMode) {
        return false;
      }
    }

    return true;
  }

  private async validateContentQuality(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<boolean> {
    let qualityScore = 0;
    const maxScore = 100;

    // Title quality
    const titleWords = paper.title.split(' ');
    if (titleWords.length >= 5 && titleWords.length <= 20) {
      qualityScore += 20;
    }

    // Abstract quality
    if (paper.abstract && paper.abstract.length >= 150) {
      qualityScore += 30;
    }

    // Technical terms presence
    const technicalTerms = [
      'performance',
      'efficiency',
      'optimization',
      'analysis',
      'design',
      'system',
    ];
    const foundTerms = technicalTerms.filter((term) => paper.abstract.toLowerCase().includes(term));
    qualityScore += (foundTerms.length / technicalTerms.length) * 20;

    // Keywords quality
    if (paper.keywords && paper.keywords.length >= 3) {
      qualityScore += 15;
    }

    // Recency bonus
    const currentYear = new Date().getFullYear();
    if (paper.year >= currentYear - 3) {
      qualityScore += 15;
    }

    const isQualityValid = qualityScore >= this.config.minQualityScore;

    if (!isQualityValid) {
      result.errors.push(
        `Content quality score (${qualityScore}) is below threshold (${this.config.minQualityScore})`
      );
    }

    return isQualityValid;
  }

  private async validateWithAI(paper: PaperToValidate, result: ValidationResult): Promise<boolean> {
    try {
      const aiAssessment = await this.ollama.assessPaperQuality(
        paper.title,
        paper.abstract,
        paper.authors
      );

      if (aiAssessment.score < 60) {
        result.warnings.push(`AI quality assessment score is low (${aiAssessment.score})`);
        if (this.config.strictMode) {
          return false;
        }
      }

      return true;
    } catch (error) {
      result.warnings.push('AI validation failed');
      return !this.config.strictMode;
    }
  }

  private containsSuspiciousPatterns(paper: PaperToValidate): boolean {
    const suspiciousPatterns = [
      /lorem ipsum/i,
      /sample text/i,
      /placeholder/i,
      /todo/i,
      /\[insert\]/i,
      /xxx/i,
      /test test/i,
      /example example/i,
    ];

    const text = `${paper.title} ${paper.abstract}`;
    return suspiciousPatterns.some((pattern) => pattern.test(text));
  }

  private generatePaperKey(paper: PaperToValidate): string {
    return `${paper.title.toLowerCase().replace(/\s+/g, ' ')}-${paper.authors.toLowerCase()}`;
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(' ');
    const words2 = title2.toLowerCase().split(' ');
    const intersection = words1.filter((word) => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  private async calculateQualityScore(
    paper: PaperToValidate,
    result: ValidationResult
  ): Promise<number> {
    let score = 0;
    const weights = {
      metadataComplete: 15,
      externalValidation: 20,
      duplicateCheck: 10,
      algaeRelevance: 20,
      authorValidation: 5,
      journalValidation: 10,
      citationValidation: 5,
      contentQuality: 10,
      aiValidation: 5,
    };

    Object.entries(result.validationChecks).forEach(([check, passed]) => {
      if (passed) {
        score += weights[check as keyof typeof weights] || 0;
      }
    });

    return Math.min(100, score);
  }

  private calculateConfidence(result: ValidationResult): number {
    const passedChecks = Object.values(result.validationChecks).filter(Boolean).length;
    const totalChecks = Object.values(result.validationChecks).length;

    let confidence = (passedChecks / totalChecks) * 100;

    // Reduce confidence for warnings
    confidence -= result.warnings.length * 5;

    // Heavily reduce confidence for errors
    confidence -= result.errors.length * 20;

    return Math.max(0, Math.min(100, confidence));
  }

  private determineValidity(result: ValidationResult): boolean {
    // Must have no errors
    if (result.errors.length > 0) {
      return false;
    }

    // Must meet minimum quality score
    if (result.qualityScore < this.config.minQualityScore) {
      return false;
    }

    // Must meet minimum confidence
    if (result.confidence < 70) {
      return false;
    }

    // Critical checks must pass
    const criticalChecks = [
      'metadataComplete',
      'duplicateCheck',
      'algaeRelevance',
      'contentQuality',
    ];

    return criticalChecks.every(
      (check) => result.validationChecks[check as keyof typeof result.validationChecks]
    );
  }

  private generateRecommendations(paper: PaperToValidate, result: ValidationResult): string[] {
    const recommendations = [];

    if (!result.validationChecks.externalValidation) {
      recommendations.push('Verify paper exists in external databases');
    }

    if (result.warnings.length > 0) {
      recommendations.push('Review validation warnings before adding to database');
    }

    if (result.qualityScore < 80) {
      recommendations.push('Consider additional quality checks');
    }

    if (!paper.doi) {
      recommendations.push('Attempt to find DOI for better validation');
    }

    if (result.confidence < 80) {
      recommendations.push('Manual review recommended due to low confidence');
    }

    return recommendations;
  }

  async batchValidate(papers: PaperToValidate[]): Promise<ValidationResult[]> {
    const results = [];

    for (const paper of papers) {
      try {
        const result = await this.validatePaper(paper);
        results.push(result);
      } catch (error) {
        results.push({
          isValid: false,
          confidence: 0,
          qualityScore: 0,
          validationChecks: {
            metadataComplete: false,
            externalValidation: false,
            duplicateCheck: false,
            algaeRelevance: false,
            authorValidation: false,
            journalValidation: false,
            citationValidation: false,
            contentQuality: false,
            aiValidation: false,
          },
          warnings: [],
          errors: [
            `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
          recommendations: ['Manual review required'],
          processingTime: 0,
        });
      }
    }

    return results;
  }

  getValidationStats(): {
    totalValidated: number;
    validPapers: number;
    invalidPapers: number;
    averageQualityScore: number;
    averageConfidence: number;
  } {
    // This would be implemented with proper statistics tracking
    return {
      totalValidated: this.validatedPapers.size,
      validPapers: 0,
      invalidPapers: 0,
      averageQualityScore: 0,
      averageConfidence: 0,
    };
  }

  updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
