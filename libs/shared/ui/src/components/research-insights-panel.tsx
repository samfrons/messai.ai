import { Card } from './card';
import { Badge } from './badge';

interface ResearchInsight {
  id: string;
  type: 'trend' | 'gap' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'breakthrough';
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
  createdAt: Date;
  generatedBy: string;
}

interface ResearchInsightsPanelProps {
  insights: ResearchInsight[];
  onInsightSelect?: (insight: ResearchInsight) => void;
  className?: string;
}

const typeColors = {
  trend: 'bg-blue-100 text-blue-800',
  gap: 'bg-orange-100 text-orange-800',
  prediction: 'bg-purple-100 text-purple-800',
  recommendation: 'bg-green-100 text-green-800',
};

const typeIcons = {
  trend: '📈',
  gap: '🔍',
  prediction: '🔮',
  recommendation: '💡',
};

const significanceColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  breakthrough: 'bg-red-100 text-red-800',
};

export function ResearchInsightsPanel({
  insights,
  onInsightSelect,
  className = '',
}: ResearchInsightsPanelProps) {
  const groupedInsights = insights.reduce(
    (acc, insight) => {
      if (!acc[insight.type]) {
        acc[insight.type] = [];
      }
      acc[insight.type]!.push(insight);
      return acc;
    },
    {} as Record<string, ResearchInsight[]>
  );

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Research Insights</h2>
        <Badge variant="outline" className="text-sm">
          {insights.length} insights
        </Badge>
      </div>

      {Object.entries(groupedInsights).map(([type, typeInsights]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcons[type as keyof typeof typeIcons]}</span>
            <h3 className="text-lg font-medium text-gray-900 capitalize">
              {type}s ({typeInsights.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {typeInsights.map((insight) => (
              <Card
                key={insight.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  onInsightSelect ? 'hover:bg-gray-50' : ''
                }`}
                onClick={() => onInsightSelect?.(insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeColors[insight.type]}>{insight.type}</Badge>
                      <Badge className={significanceColors[insight.significance]}>
                        {insight.significance}
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs">
                          Actionable
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {truncateDescription(insight.description)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500 ml-4">
                    <div className="font-medium text-gray-900">
                      {formatConfidence(insight.confidence)}
                    </div>
                    <div>{formatDate(insight.createdAt)}</div>
                  </div>
                </div>

                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div className="border-t pt-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Key Recommendations:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {insight.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                      {insight.recommendations.length > 2 && (
                        <li className="text-gray-500 italic">
                          +{insight.recommendations.length - 2} more recommendations
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                  <span>Generated by {insight.generatedBy}</span>
                  <span>{formatDate(insight.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {insights.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
          <p className="text-gray-600">
            Run an analysis to generate research insights and recommendations.
          </p>
        </Card>
      )}
    </div>
  );
}
