import { Card } from '@messai/ui';
import type { PerformanceMetric } from '../../../types/parameters';

interface PerformanceMetricsProps {
  metrics: PerformanceMetric;
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const formatMetricName = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMetricColor = (key: string): string => {
    if (key.includes('power')) return 'text-orange-600 bg-orange-50';
    if (key.includes('current')) return 'text-blue-600 bg-blue-50';
    if (key.includes('voltage')) return 'text-purple-600 bg-purple-50';
    if (key.includes('efficiency')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div key={key} className={`p-4 rounded-lg ${getMetricColor(key).split(' ')[1]}`}>
              <div className="text-sm font-medium text-gray-700 mb-1">{formatMetricName(key)}</div>
              <div className={`text-lg font-semibold ${getMetricColor(key).split(' ')[0]}`}>
                {value.min === value.max
                  ? `${value.min} ${value.unit}`
                  : `${value.min} - ${value.max} ${value.unit}`}
              </div>
              {value.min !== value.max && (
                <div className="mt-2">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: '60%' }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          getMetricColor(key).split(' ')[0]?.replace('text-', 'bg-') ||
                          'bg-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{value.min}</span>
                    <span>Typical Range</span>
                    <span>{value.max}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
