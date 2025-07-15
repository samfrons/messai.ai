/**
 * Validation Service - Multi-model validation and quality assurance
 * Handles cross-validation using multiple models for improved accuracy
 */

import { EnhancedOllamaClient, ModelRequest, ModelResponse } from '../enhanced-ollama-client';

export interface ValidationTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  validationCriteria: string[];
  expectedOutput: 'boolean' | 'score' | 'structured';
  parameters: {
    temperature: number;
    max_tokens: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  score?: number;
  reasoning: string;
  criteria: Array<{
    criterion: string;
    passed: boolean;
    score?: number;
    details: string;
  }>;
  recommendations: string[];
  warnings: string[];
  validationTime: number;
}

export interface CrossValidationResult {
  consensus: boolean;
  consensusConfidence: number;
  modelResults: Array<{
    model: string;
    result: ValidationResult;
    weight: number;
  }>;
  finalScore: number;
  discrepancies: string[];
  recommendations: string[];
}

export class ValidationService {
  private client: EnhancedOllamaClient;
  private templates: Map<string, ValidationTemplate> = new Map();
  private modelWeights: Map<string, number> = new Map();

  constructor(client: EnhancedOllamaClient) {
    this.client = client;
    this.initializeTemplates();
    this.initializeModelWeights();
  }

  private initializeTemplates(): void {
    // Paper Authenticity Validation
    this.templates.set('authenticity_check', {
      id: 'authenticity_check',
      name: 'Paper Authenticity Validation',
      description: 'Validate if paper content appears authentic and not generated',
      prompt: `Evaluate if the following research paper content appears authentic and not artificially generated:

      Content: {input}

      Check for:
      1. Authentic scientific language and terminology
      2. Consistent methodology and results
      3. Proper citations and references
      4. Realistic experimental data
      5. Absence of obvious AI-generated patterns

      Rate from 0-100 and provide reasoning for your assessment.
      
      Response format:
      AUTHENTICITY_SCORE: [0-100]
      REASONING: [detailed explanation]
      CONCERNS: [any red flags or suspicious elements]
      CONFIDENCE: [0-100]`,
      validationCriteria: [
        'Scientific language authenticity',
        'Methodology consistency',
        'Data realism',
        'Citation patterns',
        'Writing style consistency',
      ],
      expectedOutput: 'structured',
      parameters: {
        temperature: 0.2,
        max_tokens: 400,
      },
    });

    // Research Quality Validation
    this.templates.set('quality_validation', {
      id: 'quality_validation',
      name: 'Research Quality Validation',
      description: 'Validate the scientific quality of research',
      prompt: `Evaluate the scientific quality of the following research paper:

      Paper: {input}

      Assess:
      1. Scientific rigor and methodology (0-100)
      2. Novelty and contribution (0-100)
      3. Data quality and completeness (0-100)
      4. Experimental design validity (0-100)
      5. Conclusions supported by data (0-100)

      For each criterion, provide:
      - Score (0-100)
      - Pass/Fail (pass if score >= 60)
      - Reasoning
      - Specific concerns or strengths

      Overall validation: PASS/FAIL (pass if average >= 60)`,
      validationCriteria: [
        'Scientific rigor',
        'Novelty',
        'Data quality',
        'Experimental design',
        'Conclusion validity',
      ],
      expectedOutput: 'structured',
      parameters: {
        temperature: 0.3,
        max_tokens: 500,
      },
    });

    // Algae Relevance Validation
    this.templates.set('algae_relevance', {
      id: 'algae_relevance',
      name: 'Algae Research Relevance',
      description: 'Validate relevance to algae fuel cell research',
      prompt: `Evaluate how relevant the following research is to algae fuel cell and bioelectrochemical systems:

      Research: {input}

      Check for:
      1. Algae species mentioned or studied
      2. Fuel cell or bioelectrochemical system components
      3. Performance metrics (power density, current density, etc.)
      4. Bioreactor or cultivation systems
      5. Energy generation or harvesting focus

      Rate relevance from 0-100 where:
      - 90-100: Directly about algae fuel cells
      - 70-89: Related bioelectrochemical systems
      - 50-69: General algae research applicable to fuel cells
      - 30-49: Tangentially related energy research
      - 0-29: Not relevant to algae fuel cells

      Provide specific evidence for your rating.`,
      validationCriteria: [
        'Algae species relevance',
        'Fuel cell components',
        'Performance metrics',
        'System design',
        'Energy focus',
      ],
      expectedOutput: 'score',
      parameters: {
        temperature: 0.2,
        max_tokens: 300,
      },
    });

    // Data Consistency Validation
    this.templates.set('data_consistency', {
      id: 'data_consistency',
      name: 'Data Consistency Validation',
      description: 'Validate consistency of data and results',
      prompt: `Evaluate the consistency of data and results in the following research:

      Research: {input}

      Check for:
      1. Consistency between methodology and results
      2. Units and measurements consistency
      3. Statistical analysis appropriateness
      4. Results alignment with conclusions
      5. Internal data consistency

      Identify any inconsistencies, errors, or suspicious patterns.
      Rate overall consistency from 0-100.`,
      validationCriteria: [
        'Methodology-results consistency',
        'Units consistency',
        'Statistical validity',
        'Results-conclusions alignment',
        'Internal consistency',
      ],
      expectedOutput: 'structured',
      parameters: {
        temperature: 0.2,
        max_tokens: 400,
      },
    });

    // Plagiarism Detection
    this.templates.set('plagiarism_check', {
      id: 'plagiarism_check',
      name: 'Plagiarism Detection',
      description: 'Detect potential plagiarism or duplication',
      prompt: `Analyze the following research content for potential plagiarism indicators:

      Content: {input}

      Look for:
      1. Unusual writing style changes
      2. Inconsistent terminology usage
      3. Repetitive or duplicated sections
      4. Suspicious phrasing patterns
      5. Lack of original contribution

      Rate plagiarism risk from 0-100 where:
      - 0-20: Low risk, appears original
      - 21-40: Minor concerns
      - 41-60: Moderate risk
      - 61-80: High risk
      - 81-100: Very high risk

      Provide specific examples of concerning passages.`,
      validationCriteria: [
        'Writing style consistency',
        'Terminology consistency',
        'Content originality',
        'Phrase uniqueness',
        'Contribution originality',
      ],
      expectedOutput: 'score',
      parameters: {
        temperature: 0.1,
        max_tokens: 350,
      },
    });
  }

  private initializeModelWeights(): void {
    // Set validation weights for different models
    this.modelWeights.set('phi3.5', 0.8);
    this.modelWeights.set('llama3.1:8b', 0.9);
    this.modelWeights.set('mistral-small3.2', 0.7);
    this.modelWeights.set('nuextract', 0.6); // Lower weight for validation tasks
  }

  /**
   * Validate content using a specific template
   */
  async validateWithTemplate(
    templateId: string,
    content: string,
    options: {
      model?: string;
      strictMode?: boolean;
    } = {}
  ): Promise<ValidationResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Validation template ${templateId} not found`);
    }

    const { model, strictMode = false } = options;
    const startTime = Date.now();

    try {
      const prompt = template.prompt.replace('{input}', content);

      const selectedModel = model || this.client.selectOptimalModel('validation');

      const response = await this.client.generateEnhancedCompletion({
        prompt,
        model: selectedModel,
        parameters: template.parameters,
      });

      const result = this.parseValidationResponse(
        response.response,
        template,
        response.confidence,
        strictMode
      );

      result.validationTime = Date.now() - startTime;
      return result;
    } catch (error) {
      console.error(`Validation failed for template ${templateId}:`, error);

      return {
        isValid: false,
        confidence: 0,
        reasoning: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        criteria: template.validationCriteria.map((criterion) => ({
          criterion,
          passed: false,
          details: 'Validation could not be completed',
        })),
        recommendations: ['Manual review required due to validation failure'],
        warnings: ['Automated validation failed'],
        validationTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Cross-validate using multiple models
   */
  async crossValidate(
    templateId: string,
    content: string,
    options: {
      models?: string[];
      consensusThreshold?: number;
      weightedVoting?: boolean;
    } = {}
  ): Promise<CrossValidationResult> {
    const {
      models = ['phi3.5', 'llama3.1:8b', 'mistral-small3.2'],
      consensusThreshold = 0.7,
      weightedVoting = true,
    } = options;

    const availableModels = this.client
      .getAvailableModels()
      .filter((model) => models.includes(model.id))
      .map((model) => model.id);

    if (availableModels.length === 0) {
      throw new Error('No available models for cross-validation');
    }

    const modelResults: Array<{
      model: string;
      result: ValidationResult;
      weight: number;
    }> = [];

    // Run validation with each model
    for (const modelId of availableModels) {
      try {
        const result = await this.validateWithTemplate(templateId, content, {
          model: modelId,
        });

        const weight = this.modelWeights.get(modelId) || 0.5;
        modelResults.push({ model: modelId, result, weight });
      } catch (error) {
        console.error(`Cross-validation failed for model ${modelId}:`, error);
        // Continue with other models
      }
    }

    if (modelResults.length === 0) {
      throw new Error('All models failed during cross-validation');
    }

    // Calculate consensus
    const consensus = this.calculateConsensus(modelResults, consensusThreshold, weightedVoting);

    return consensus;
  }

  /**
   * Validate paper authenticity
   */
  async validateAuthenticity(content: string): Promise<ValidationResult> {
    return this.validateWithTemplate('authenticity_check', content);
  }

  /**
   * Validate research quality
   */
  async validateQuality(content: string): Promise<ValidationResult> {
    return this.validateWithTemplate('quality_validation', content);
  }

  /**
   * Validate algae research relevance
   */
  async validateAlgaeRelevance(content: string): Promise<ValidationResult> {
    return this.validateWithTemplate('algae_relevance', content);
  }

  /**
   * Validate data consistency
   */
  async validateDataConsistency(content: string): Promise<ValidationResult> {
    return this.validateWithTemplate('data_consistency', content);
  }

  /**
   * Check for plagiarism
   */
  async checkPlagiarism(content: string): Promise<ValidationResult> {
    return this.validateWithTemplate('plagiarism_check', content);
  }

  /**
   * Run comprehensive validation
   */
  async comprehensiveValidation(
    content: string,
    options: {
      skipPlagiarism?: boolean;
      strictMode?: boolean;
    } = {}
  ): Promise<Record<string, ValidationResult>> {
    const { skipPlagiarism = false, strictMode = false } = options;

    const validationTasks = [
      'authenticity_check',
      'quality_validation',
      'algae_relevance',
      'data_consistency',
    ];

    if (!skipPlagiarism) {
      validationTasks.push('plagiarism_check');
    }

    const results: Record<string, ValidationResult> = {};

    // Run validations in parallel
    const promises = validationTasks.map(async (templateId) => {
      try {
        const result = await this.validateWithTemplate(templateId, content, { strictMode });
        return { templateId, result };
      } catch (error) {
        console.error(`Validation ${templateId} failed:`, error);
        return {
          templateId,
          result: {
            isValid: false,
            confidence: 0,
            reasoning: `Validation failed: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            criteria: [],
            recommendations: ['Manual review required'],
            warnings: ['Automated validation failed'],
            validationTime: 0,
          },
        };
      }
    });

    const completed = await Promise.all(promises);
    completed.forEach(({ templateId, result }) => {
      results[templateId] = result;
    });

    return results;
  }

  /**
   * Parse validation response
   */
  private parseValidationResponse(
    response: string,
    template: ValidationTemplate,
    confidence: number,
    strictMode: boolean
  ): ValidationResult {
    const criteria: Array<{
      criterion: string;
      passed: boolean;
      score?: number;
      details: string;
    }> = [];

    const recommendations: string[] = [];
    const warnings: string[] = [];
    let overallScore = 0;
    let isValid = false;

    // Parse based on expected output type
    if (template.expectedOutput === 'score') {
      const scoreMatch = response.match(/(\d+)/);
      overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      isValid = overallScore >= (strictMode ? 70 : 60);
    } else if (template.expectedOutput === 'structured') {
      // Parse structured response
      const lines = response.split('\n');
      const scores: number[] = [];

      for (const line of lines) {
        const scoreMatch = line.match(/(\d+)/);
        if (scoreMatch) {
          scores.push(parseInt(scoreMatch[1]));
        }

        if (line.toLowerCase().includes('pass')) {
          isValid = true;
        } else if (line.toLowerCase().includes('fail')) {
          isValid = false;
        }

        if (line.toLowerCase().includes('recommend')) {
          recommendations.push(line.trim());
        }

        if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('concern')) {
          warnings.push(line.trim());
        }
      }

      if (scores.length > 0) {
        overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    } else {
      // Boolean output
      isValid = response.toLowerCase().includes('true') || response.toLowerCase().includes('valid');
    }

    // Populate criteria results
    template.validationCriteria.forEach((criterion, index) => {
      criteria.push({
        criterion,
        passed: isValid, // Simplified - in production, this would be more sophisticated
        score: overallScore,
        details: `Criterion evaluated: ${criterion}`,
      });
    });

    return {
      isValid,
      confidence,
      score: overallScore,
      reasoning: response,
      criteria,
      recommendations,
      warnings,
      validationTime: 0, // Will be set by caller
    };
  }

  /**
   * Calculate consensus from multiple model results
   */
  private calculateConsensus(
    modelResults: Array<{
      model: string;
      result: ValidationResult;
      weight: number;
    }>,
    consensusThreshold: number,
    weightedVoting: boolean
  ): CrossValidationResult {
    const validResults = modelResults.filter((mr) => mr.result.isValid);
    const totalWeight = modelResults.reduce((sum, mr) => sum + mr.weight, 0);

    let consensusScore = 0;
    let finalScore = 0;

    if (weightedVoting) {
      consensusScore = validResults.reduce((sum, mr) => sum + mr.weight, 0) / totalWeight;
      finalScore =
        modelResults.reduce((sum, mr) => sum + (mr.result.score || 0) * mr.weight, 0) / totalWeight;
    } else {
      consensusScore = validResults.length / modelResults.length;
      finalScore =
        modelResults.reduce((sum, mr) => sum + (mr.result.score || 0), 0) / modelResults.length;
    }

    const consensus = consensusScore >= consensusThreshold;

    // Identify discrepancies
    const discrepancies: string[] = [];
    const validCount = validResults.length;
    const invalidCount = modelResults.length - validCount;

    if (validCount > 0 && invalidCount > 0) {
      discrepancies.push(`${validCount} models validated, ${invalidCount} models failed`);
    }

    // Aggregate recommendations
    const allRecommendations = modelResults.flatMap((mr) => mr.result.recommendations);
    const recommendations = [...new Set(allRecommendations)];

    return {
      consensus,
      consensusConfidence: consensusScore,
      modelResults,
      finalScore,
      discrepancies,
      recommendations,
    };
  }

  /**
   * Get available validation templates
   */
  getAvailableTemplates(): ValidationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add custom validation template
   */
  addTemplate(template: ValidationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Update model weights
   */
  updateModelWeights(weights: Record<string, number>): void {
    Object.entries(weights).forEach(([model, weight]) => {
      this.modelWeights.set(model, weight);
    });
  }
}
