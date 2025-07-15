/**
 * NuExtract Service - Specialized structured data extraction
 * Handles structured data extraction from research papers using NuExtract model
 */

import { EnhancedOllamaClient, ModelRequest, ModelResponse } from '../enhanced-ollama-client';

export interface ExtractionTemplate {
  id: string;
  name: string;
  description: string;
  schema: Record<string, any>;
  prompt: string;
  examples?: Array<{
    input: string;
    output: Record<string, any>;
  }>;
}

export interface ExtractionResult {
  data: Record<string, any>;
  confidence: number;
  completeness: number;
  validationErrors: string[];
  extractedFields: string[];
  missingFields: string[];
}

export class NuExtractService {
  private client: EnhancedOllamaClient;
  private templates: Map<string, ExtractionTemplate> = new Map();

  constructor(client: EnhancedOllamaClient) {
    this.client = client;
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Research Paper Metadata Template
    this.templates.set('paper_metadata', {
      id: 'paper_metadata',
      name: 'Paper Metadata Extraction',
      description: 'Extract basic metadata from research papers',
      schema: {
        title: { type: 'string', required: true },
        authors: { type: 'array', items: { type: 'string' }, required: true },
        abstract: { type: 'string', required: true },
        keywords: { type: 'array', items: { type: 'string' }, required: false },
        journal: { type: 'string', required: false },
        year: { type: 'number', required: true },
        doi: { type: 'string', required: false },
        citationCount: { type: 'number', required: false },
      },
      prompt: `Extract the following metadata from this research paper text:
      
      Required fields:
      - title: The paper title
      - authors: List of all authors
      - abstract: The paper abstract
      - year: Publication year
      
      Optional fields:
      - keywords: Research keywords
      - journal: Journal name
      - doi: DOI identifier
      - citationCount: Number of citations
      
      Text: {input}
      
      Return only valid JSON with the extracted data.`,
    });

    // Algae Fuel Cell Performance Template
    this.templates.set('algae_performance', {
      id: 'algae_performance',
      name: 'Algae Fuel Cell Performance Metrics',
      description: 'Extract performance metrics from algae fuel cell research',
      schema: {
        algaeSpecies: { type: 'string', required: false },
        systemType: { type: 'string', required: false },
        powerDensity: { type: 'number', unit: 'mW/m²', required: false },
        currentDensity: { type: 'number', unit: 'mA/m²', required: false },
        voltage: { type: 'number', unit: 'V', required: false },
        efficiency: { type: 'number', unit: '%', required: false },
        electrodeType: { type: 'string', required: false },
        temperature: { type: 'number', unit: '°C', required: false },
        ph: { type: 'number', required: false },
        duration: { type: 'number', unit: 'hours', required: false },
        improvements: { type: 'array', items: { type: 'string' }, required: false },
      },
      prompt: `Extract algae fuel cell performance metrics from this research paper text:
      
      Look for:
      - algaeSpecies: Type of algae used (e.g., Chlorella, Scenedesmus)
      - systemType: System configuration (e.g., MFC, photobioreactor)
      - powerDensity: Power output per unit area (mW/m²)
      - currentDensity: Current per unit area (mA/m²)
      - voltage: Operating voltage (V)
      - efficiency: System efficiency (%)
      - electrodeType: Electrode material/type
      - temperature: Operating temperature (°C)
      - ph: pH level
      - duration: Experiment duration (hours)
      - improvements: Performance improvements achieved
      
      Text: {input}
      
      Return only valid JSON with the extracted metrics. Use null for missing values.`,
    });

    // Experimental Conditions Template
    this.templates.set('experimental_conditions', {
      id: 'experimental_conditions',
      name: 'Experimental Conditions',
      description: 'Extract experimental setup and conditions',
      schema: {
        reactorVolume: { type: 'number', unit: 'mL', required: false },
        membraneType: { type: 'string', required: false },
        substrateType: { type: 'string', required: false },
        catalystType: { type: 'string', required: false },
        operatingMode: { type: 'string', required: false },
        flowRate: { type: 'number', unit: 'mL/min', required: false },
        lightIntensity: { type: 'number', unit: 'µmol/m²/s', required: false },
        carbonSource: { type: 'string', required: false },
        nitrogenSource: { type: 'string', required: false },
        cultivationTime: { type: 'number', unit: 'days', required: false },
      },
      prompt: `Extract experimental conditions and setup details from this research paper text:
      
      Look for:
      - reactorVolume: Reactor/chamber volume (mL)
      - membraneType: Membrane material/type
      - substrateType: Substrate used
      - catalystType: Catalyst material
      - operatingMode: Operating mode (batch, continuous, etc.)
      - flowRate: Flow rate (mL/min)
      - lightIntensity: Light intensity (µmol/m²/s)
      - carbonSource: Carbon source
      - nitrogenSource: Nitrogen source
      - cultivationTime: Cultivation time (days)
      
      Text: {input}
      
      Return only valid JSON with the extracted conditions. Use null for missing values.`,
    });

    // Research Contributions Template
    this.templates.set('research_contributions', {
      id: 'research_contributions',
      name: 'Research Contributions',
      description: 'Extract key research contributions and innovations',
      schema: {
        mainContributions: { type: 'array', items: { type: 'string' }, required: true },
        innovations: { type: 'array', items: { type: 'string' }, required: false },
        limitations: { type: 'array', items: { type: 'string' }, required: false },
        futureWork: { type: 'array', items: { type: 'string' }, required: false },
        methodology: { type: 'string', required: false },
        keyFindings: { type: 'array', items: { type: 'string' }, required: false },
      },
      prompt: `Extract research contributions and key findings from this research paper text:
      
      Look for:
      - mainContributions: Main research contributions
      - innovations: Novel innovations or approaches
      - limitations: Acknowledged limitations
      - futureWork: Suggested future research directions
      - methodology: Research methodology used
      - keyFindings: Key experimental findings
      
      Text: {input}
      
      Return only valid JSON with the extracted contributions.`,
    });
  }

  /**
   * Extract structured data using a specific template
   */
  async extractWithTemplate(
    templateId: string,
    inputText: string,
    options: {
      temperature?: number;
      validateOutput?: boolean;
      fillMissingWithNull?: boolean;
    } = {}
  ): Promise<ExtractionResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const { temperature = 0.1, validateOutput = true, fillMissingWithNull = true } = options;

    try {
      const prompt = template.prompt.replace('{input}', inputText);

      const response = await this.client.generateEnhancedCompletion({
        prompt,
        model: 'nuextract',
        parameters: {
          temperature,
          max_tokens: 1000,
          stop: ['</json>', '\n\n---'],
        },
      });

      // Parse JSON response
      let extractedData: Record<string, any>;
      try {
        extractedData = JSON.parse(response.response);
      } catch (parseError) {
        // Try to extract JSON from response if it's wrapped in text
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse JSON from NuExtract response');
        }
      }

      // Validate and complete the extraction
      const result = this.validateAndCompleteExtraction(
        extractedData,
        template,
        response.confidence,
        fillMissingWithNull
      );

      return result;
    } catch (error) {
      console.error(`NuExtract extraction failed for template ${templateId}:`, error);

      // Return empty result with error
      return {
        data: {},
        confidence: 0,
        completeness: 0,
        validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
        extractedFields: [],
        missingFields: Object.keys(template.schema),
      };
    }
  }

  /**
   * Extract multiple data types from a single text
   */
  async extractMultiple(
    inputText: string,
    templateIds: string[],
    options: {
      parallel?: boolean;
      failFast?: boolean;
    } = {}
  ): Promise<Record<string, ExtractionResult>> {
    const { parallel = true, failFast = false } = options;
    const results: Record<string, ExtractionResult> = {};

    if (parallel) {
      const promises = templateIds.map(async (templateId) => {
        try {
          const result = await this.extractWithTemplate(templateId, inputText);
          return { templateId, result };
        } catch (error) {
          if (failFast) throw error;
          return {
            templateId,
            result: {
              data: {},
              confidence: 0,
              completeness: 0,
              validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
              extractedFields: [],
              missingFields: [],
            },
          };
        }
      });

      const completed = await Promise.all(promises);
      completed.forEach(({ templateId, result }) => {
        results[templateId] = result;
      });
    } else {
      // Sequential processing
      for (const templateId of templateIds) {
        try {
          results[templateId] = await this.extractWithTemplate(templateId, inputText);
        } catch (error) {
          if (failFast) throw error;
          results[templateId] = {
            data: {},
            confidence: 0,
            completeness: 0,
            validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
            extractedFields: [],
            missingFields: [],
          };
        }
      }
    }

    return results;
  }

  /**
   * Validate and complete extraction results
   */
  private validateAndCompleteExtraction(
    extractedData: Record<string, any>,
    template: ExtractionTemplate,
    confidence: number,
    fillMissingWithNull: boolean
  ): ExtractionResult {
    const validationErrors: string[] = [];
    const extractedFields: string[] = [];
    const missingFields: string[] = [];

    // Validate against schema
    for (const [field, schema] of Object.entries(template.schema)) {
      const value = extractedData[field];
      const fieldSchema = schema as any;

      if (value !== undefined && value !== null) {
        extractedFields.push(field);

        // Type validation
        if (fieldSchema.type === 'number' && typeof value !== 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            validationErrors.push(`Field ${field} should be a number, got ${typeof value}`);
          } else {
            extractedData[field] = numValue;
          }
        } else if (fieldSchema.type === 'string' && typeof value !== 'string') {
          extractedData[field] = String(value);
        } else if (fieldSchema.type === 'array' && !Array.isArray(value)) {
          validationErrors.push(`Field ${field} should be an array, got ${typeof value}`);
        }
      } else {
        if (fieldSchema.required) {
          missingFields.push(field);
          validationErrors.push(`Required field ${field} is missing`);
        } else if (fillMissingWithNull) {
          extractedData[field] = null;
        }
      }
    }

    // Calculate completeness
    const totalFields = Object.keys(template.schema).length;
    const completeness = extractedFields.length / totalFields;

    return {
      data: extractedData,
      confidence: validationErrors.length > 0 ? confidence * 0.5 : confidence,
      completeness,
      validationErrors,
      extractedFields,
      missingFields,
    };
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): ExtractionTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ExtractionTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Add custom template
   */
  addTemplate(template: ExtractionTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove template
   */
  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Test extraction with example data
   */
  async testTemplate(
    templateId: string,
    testInput: string
  ): Promise<{ success: boolean; result?: ExtractionResult; error?: string }> {
    try {
      const result = await this.extractWithTemplate(templateId, testInput);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
