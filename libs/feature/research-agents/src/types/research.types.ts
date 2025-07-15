/**
 * Research-specific types for the sub-agent system
 */

export interface PaperAnalysisInput {
  paperId?: string;
  paperIds?: string[];
  filters?: {
    yearRange?: { start: number; end: number };
    systemTypes?: string[];
    qualityThreshold?: number;
    verified?: boolean;
  };
  analysisType: 'summary' | 'trends' | 'gaps' | 'connections' | 'performance';
}

export interface PaperAnalysisResult {
  paperId?: string;
  insights: {
    summary?: string;
    keyFindings: string[];
    trends?: TrendAnalysis[];
    gaps?: ResearchGap[];
    connections?: PaperConnection[];
    performance?: PerformanceMetrics;
  };
  confidence: number;
  sources: string[];
}

export interface TrendAnalysis {
  category: 'material' | 'performance' | 'methodology' | 'application';
  trend: string;
  direction: 'increasing' | 'decreasing' | 'stable' | 'emerging';
  confidence: number;
  timeframe: {
    start: Date;
    end: Date;
  };
  evidence: Array<{
    paperId: string;
    title: string;
    relevance: number;
  }>;
}

export interface ResearchGap {
  id: string;
  description: string;
  category: 'material' | 'performance' | 'methodology' | 'application';
  priority: 'low' | 'medium' | 'high';
  evidence: {
    missingConnections: number;
    potentialImpact: number;
    researchVolume: number;
  };
  suggestedResearch: string[];
}

export interface PaperConnection {
  sourceId: string;
  targetId: string;
  connectionType:
    | 'cites'
    | 'similar_methods'
    | 'shared_materials'
    | 'complementary'
    | 'contradictory';
  strength: number;
  explanation: string;
}

export interface PerformanceMetrics {
  powerDensity?: {
    value: number;
    unit: string;
    confidence: number;
  };
  currentDensity?: {
    value: number;
    unit: string;
    confidence: number;
  };
  efficiency?: {
    value: number;
    unit: string;
    confidence: number;
  };
  materials: Array<{
    type: 'anode' | 'cathode' | 'membrane';
    material: string;
    confidence: number;
  }>;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'paper' | 'material' | 'organism' | 'concept' | 'metric';
  label: string;
  properties: Record<string, any>;
  connections: Array<{
    targetId: string;
    relationshipType: string;
    weight: number;
    confidence: number;
  }>;
}

export interface KnowledgeGraphUpdate {
  nodes: KnowledgeGraphNode[];
  edges: Array<{
    sourceId: string;
    targetId: string;
    relationshipType: string;
    weight: number;
    confidence: number;
    evidence: string[];
  }>;
  metadata: {
    updateType: 'add' | 'update' | 'remove';
    source: string;
    timestamp: Date;
  };
}

export interface DataEnhancementInput {
  paperId: string;
  enhancementType: 'extraction' | 'validation' | 'enrichment' | 'quality_scoring';
  options?: {
    reprocess?: boolean;
    useAdvancedNLP?: boolean;
    validateAgainstKnowledge?: boolean;
  };
}

export interface DataEnhancementResult {
  paperId: string;
  enhancements: {
    extractedData?: {
      performance?: PerformanceMetrics;
      materials?: Array<{
        type: string;
        name: string;
        properties: Record<string, any>;
        confidence: number;
      }>;
      conditions?: {
        temperature?: number;
        pH?: number;
        substrate?: string;
        confidence: number;
      };
    };
    qualityScore?: {
      overall: number;
      breakdown: {
        completeness: number;
        accuracy: number;
        relevance: number;
        recency: number;
      };
    };
    validationResults?: Array<{
      field: string;
      status: 'valid' | 'invalid' | 'uncertain';
      confidence: number;
      evidence?: string[];
    }>;
  };
  confidence: number;
  processingTime: number;
}

export interface ResearchInsight {
  id: string;
  type: 'trend' | 'gap' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'breakthrough';
  confidence: number;
  evidence: Array<{
    paperId: string;
    title: string;
    relevance: number;
  }>;
  actionable: boolean;
  recommendations?: string[];
  createdAt: Date;
  generatedBy: string;
}
