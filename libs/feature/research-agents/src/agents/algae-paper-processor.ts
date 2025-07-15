/**
 * Algae Paper Processor Sub-Agent
 * Specialized agent for processing algae fuel cell and bioreactor papers
 */

import { BaseResearchAgent } from '../core/base-agent';
import type { AgentTask, ValidationResult, AgentConfiguration } from '../types/agent.types';
import type {
  PaperAnalysisInput,
  PaperAnalysisResult,
  PerformanceMetrics,
} from '../types/research.types';

export interface AlgaePaperInput {
  filePath?: string;
  fileContent?: string;
  paperData?: {
    title?: string;
    authors?: string;
    abstract?: string;
    year?: number;
    journal?: string;
    doi?: string;
    url?: string;
  };
  processingOptions?: {
    extractMetrics?: boolean;
    validateSources?: boolean;
    generateTags?: boolean;
    analyzeBioreactor?: boolean;
  };
}

export interface AlgaePaperResult {
  paperId?: string;
  extractedData: {
    title: string;
    authors: string;
    abstract: string;
    year: number;
    journal?: string;
    doi?: string;
    url?: string;
  };
  algaeSpecificData: {
    algaeSpecies?: string[];
    bioreactorType?: string;
    fuelCellType?: string;
    performanceMetrics?: PerformanceMetrics;
    materials?: Array<{
      type: 'electrode' | 'membrane' | 'substrate' | 'catalyst';
      material: string;
      properties: Record<string, any>;
    }>;
    operatingConditions?: {
      temperature?: number;
      pH?: number;
      oxygenLevel?: number;
      lightIntensity?: number;
      nutrientComposition?: Record<string, any>;
    };
  };
  keyFindings: string[];
  tags: string[];
  qualityScore: number;
  confidence: number;
  processingTime: number;
}

export class AlgaePaperProcessor extends BaseResearchAgent {
  constructor(config: AgentConfiguration) {
    super(
      'algae-paper-processor',
      'Algae Paper Processor',
      'Specialized agent for processing algae fuel cell and bioreactor papers',
      ['paper_processing', 'data_enhancement', 'literature_analysis'],
      '1.0.0',
      config
    );
  }

  override validateInput(input: Record<string, any>): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const algaeInput = input as AlgaePaperInput;

    // Must have either file path, content, or paper data
    if (!algaeInput.filePath && !algaeInput.fileContent && !algaeInput.paperData) {
      errors.push({
        field: 'input',
        message: 'Must provide either filePath, fileContent, or paperData',
        code: 'MISSING_INPUT',
      });
    }

    // If paperData provided, validate required fields
    if (algaeInput.paperData) {
      if (!algaeInput.paperData.title) {
        errors.push({
          field: 'paperData.title',
          message: 'Title is required when providing paperData',
          code: 'MISSING_FIELD',
        });
      }
      if (!algaeInput.paperData.authors) {
        errors.push({
          field: 'paperData.authors',
          message: 'Authors are required when providing paperData',
          code: 'MISSING_FIELD',
        });
      }
      if (!algaeInput.paperData.year || algaeInput.paperData.year < 1990) {
        errors.push({
          field: 'paperData.year',
          message: 'Valid year (1990 or later) is required',
          code: 'INVALID_YEAR',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  override async executeTask(task: AgentTask): Promise<Record<string, any>> {
    const input = task.input as AlgaePaperInput;
    let paperData: AlgaePaperResult;

    if (input.filePath) {
      // Process PDF file
      paperData = await this.processPDFFile(input.filePath, input.processingOptions);
    } else if (input.fileContent) {
      // Process file content
      paperData = await this.processFileContent(input.fileContent, input.processingOptions);
    } else if (input.paperData) {
      // Process provided paper data
      paperData = await this.processPaperData(input.paperData, input.processingOptions);
    } else {
      throw new Error('No valid input provided');
    }

    // Validate paper is algae-related
    if (!this.isAlgaeRelated(paperData)) {
      throw new Error('Paper does not appear to be related to algae fuel cells or bioreactors');
    }

    return {
      paperData,
      processingType: input.filePath ? 'pdf' : input.fileContent ? 'content' : 'data',
      algaeRelevance: this.calculateAlgaeRelevance(paperData),
      recommendedActions: this.generateRecommendations(paperData),
    };
  }

  private async processPDFFile(
    filePath: string,
    options?: AlgaePaperInput['processingOptions']
  ): Promise<AlgaePaperResult> {
    const startTime = Date.now();

    // Mock PDF processing - in real implementation, use PDF parsing library
    const extractedText = await this.extractPDFText(filePath);
    const extractedData = await this.extractMetadataFromText(extractedText);
    const algaeSpecificData = await this.extractAlgaeSpecificData(extractedText);

    return {
      extractedData,
      algaeSpecificData,
      keyFindings: await this.extractKeyFindings(extractedText),
      tags: await this.generateTags(extractedText, algaeSpecificData),
      qualityScore: await this.calculateQualityScore(extractedData, extractedText),
      confidence: 0.85,
      processingTime: Date.now() - startTime,
    };
  }

  private async processFileContent(
    content: string,
    options?: AlgaePaperInput['processingOptions']
  ): Promise<AlgaePaperResult> {
    const startTime = Date.now();

    const extractedData = await this.extractMetadataFromText(content);
    const algaeSpecificData = await this.extractAlgaeSpecificData(content);

    return {
      extractedData,
      algaeSpecificData,
      keyFindings: await this.extractKeyFindings(content),
      tags: await this.generateTags(content, algaeSpecificData),
      qualityScore: await this.calculateQualityScore(extractedData, content),
      confidence: 0.9,
      processingTime: Date.now() - startTime,
    };
  }

  private async processPaperData(
    paperData: AlgaePaperInput['paperData'],
    options?: AlgaePaperInput['processingOptions']
  ): Promise<AlgaePaperResult> {
    const startTime = Date.now();

    // Use provided data as base
    const extractedData = {
      title: paperData!.title!,
      authors: paperData!.authors!,
      abstract: paperData!.abstract || '',
      year: paperData!.year!,
      journal: paperData!.journal,
      doi: paperData!.doi,
      url: paperData!.url,
    };

    // Generate algae-specific analysis from abstract and title
    const combinedText = `${extractedData.title} ${extractedData.abstract}`;
    const algaeSpecificData = await this.extractAlgaeSpecificData(combinedText);

    return {
      extractedData,
      algaeSpecificData,
      keyFindings: await this.extractKeyFindings(combinedText),
      tags: await this.generateTags(combinedText, algaeSpecificData),
      qualityScore: await this.calculateQualityScore(extractedData, combinedText),
      confidence: 0.75,
      processingTime: Date.now() - startTime,
    };
  }

  private async extractPDFText(filePath: string): Promise<string> {
    // Mock implementation - in real version, use pdf-parse or similar
    return `Mock extracted text from ${filePath}`;
  }

  private async extractMetadataFromText(text: string): Promise<AlgaePaperResult['extractedData']> {
    // Mock implementation - in real version, use AI/NLP to extract metadata
    return {
      title: 'Algae-Based Microbial Fuel Cell Performance',
      authors: 'Smith, J., Johnson, A., Brown, M.',
      abstract: 'This study investigates the performance of algae-based microbial fuel cells...',
      year: 2023,
      journal: 'Bioresource Technology',
      doi: '10.1016/j.biortech.2023.example',
    };
  }

  private async extractAlgaeSpecificData(
    text: string
  ): Promise<AlgaePaperResult['algaeSpecificData']> {
    // Mock implementation - in real version, use AI to extract specific data
    return {
      algaeSpecies: ['Chlorella vulgaris', 'Scenedesmus obliquus'],
      bioreactorType: 'microfluidic',
      fuelCellType: 'MFC',
      performanceMetrics: {
        powerDensity: { value: 150, unit: 'mW/m²', confidence: 0.85 },
        currentDensity: { value: 750, unit: 'mA/m²', confidence: 0.9 },
        efficiency: { value: 23, unit: '%', confidence: 0.8 },
        materials: [
          { type: 'anode', material: 'Carbon cloth', confidence: 0.95 },
          { type: 'cathode', material: 'Platinum mesh', confidence: 0.9 },
        ],
      },
      materials: [
        {
          type: 'electrode',
          material: 'Carbon cloth',
          properties: { conductivity: 'high', surface_area: 'large' },
        },
      ],
      operatingConditions: {
        temperature: 25,
        pH: 7.2,
        oxygenLevel: 2.5,
        lightIntensity: 100,
        nutrientComposition: { nitrogen: 'high', phosphorus: 'medium' },
      },
    };
  }

  private async extractKeyFindings(text: string): Promise<string[]> {
    // Mock implementation - in real version, use AI to extract key findings
    return [
      'Algae-based MFCs achieved 150 mW/m² power density',
      'Microfluidic design improved mass transfer efficiency by 35%',
      'Chlorella vulgaris showed superior electron transfer rates',
      'Optimal pH range for maximum power output is 7.0-7.5',
    ];
  }

  private async generateTags(
    text: string,
    algaeData: AlgaePaperResult['algaeSpecificData']
  ): Promise<string[]> {
    const tags = ['algae', 'fuel-cell', 'bioreactor'];

    // Add species-specific tags
    if (algaeData.algaeSpecies) {
      tags.push(
        ...algaeData.algaeSpecies.map((species) => species.toLowerCase().replace(' ', '-'))
      );
    }

    // Add system-specific tags
    if (algaeData.bioreactorType) {
      tags.push(algaeData.bioreactorType);
    }
    if (algaeData.fuelCellType) {
      tags.push(algaeData.fuelCellType.toLowerCase());
    }

    return tags;
  }

  private async calculateQualityScore(
    extractedData: AlgaePaperResult['extractedData'],
    text: string
  ): Promise<number> {
    let score = 0;

    // Year recency (0-25 points)
    const currentYear = new Date().getFullYear();
    const yearsOld = currentYear - extractedData.year;
    score += Math.max(0, 25 - yearsOld * 2);

    // Journal quality (0-20 points)
    if (extractedData.journal) {
      const highQualityJournals = ['Nature', 'Science', 'Cell', 'Bioresource Technology'];
      if (
        highQualityJournals.some((journal) =>
          extractedData.journal!.toLowerCase().includes(journal.toLowerCase())
        )
      ) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // DOI presence (0-10 points)
    if (extractedData.doi) {
      score += 10;
    }

    // Abstract quality (0-25 points)
    if (extractedData.abstract.length > 100) {
      score += 25;
    } else if (extractedData.abstract.length > 50) {
      score += 15;
    } else {
      score += 5;
    }

    // Technical content (0-20 points)
    const technicalTerms = ['power density', 'current density', 'efficiency', 'electrode'];
    const foundTerms = technicalTerms.filter((term) =>
      text.toLowerCase().includes(term.toLowerCase())
    );
    score += (foundTerms.length / technicalTerms.length) * 20;

    return Math.min(100, score);
  }

  private isAlgaeRelated(paperData: AlgaePaperResult): boolean {
    const algaeKeywords = [
      'algae',
      'microalgae',
      'chlorella',
      'scenedesmus',
      'bioreactor',
      'fuel cell',
    ];
    const text =
      `${paperData.extractedData.title} ${paperData.extractedData.abstract}`.toLowerCase();

    return algaeKeywords.some((keyword) => text.includes(keyword));
  }

  private calculateAlgaeRelevance(paperData: AlgaePaperResult): number {
    const algaeKeywords = ['algae', 'microalgae', 'bioreactor', 'fuel cell', 'bioelectrochemical'];
    const text =
      `${paperData.extractedData.title} ${paperData.extractedData.abstract}`.toLowerCase();

    const matchedKeywords = algaeKeywords.filter((keyword) => text.includes(keyword));
    return (matchedKeywords.length / algaeKeywords.length) * 100;
  }

  private generateRecommendations(paperData: AlgaePaperResult): string[] {
    const recommendations = [];

    if (paperData.qualityScore < 70) {
      recommendations.push('Consider additional validation due to lower quality score');
    }

    if (!paperData.extractedData.doi) {
      recommendations.push('Verify paper authenticity without DOI');
    }

    if (paperData.algaeSpecificData.performanceMetrics) {
      recommendations.push('Add performance metrics to knowledge graph');
    }

    if (paperData.algaeSpecificData.algaeSpecies) {
      recommendations.push('Create knowledge graph connections for algae species');
    }

    return recommendations;
  }
}
