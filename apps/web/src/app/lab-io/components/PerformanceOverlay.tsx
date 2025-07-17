import { useState, useEffect } from 'react';

interface PerformanceOverlayProps {
  selectedModel: string;
  viewScale: string;
  visualizationMode: string;
}

interface PerformanceMetrics {
  powerOutput: number;
  efficiency: number;
  cost: number;
  voltage: number;
  current: number;
  temperature: number;
  ph: number;
}

export default function PerformanceOverlay({
  selectedModel,
  viewScale,
  visualizationMode,
}: PerformanceOverlayProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    powerOutput: 0,
    efficiency: 0,
    cost: 0,
    voltage: 0,
    current: 0,
    temperature: 25,
    ph: 7.0,
  });

  // Simulate real-time performance data
  useEffect(() => {
    const updateMetrics = () => {
      const baseMetrics = getBaseMetrics(selectedModel, viewScale);
      const noise = () => (Math.random() - 0.5) * 0.1;

      setMetrics({
        powerOutput: Math.max(0, baseMetrics.powerOutput * (1 + noise())),
        efficiency: Math.max(0, Math.min(100, baseMetrics.efficiency * (1 + noise()))),
        cost: Math.max(0, baseMetrics.cost * (1 + noise())),
        voltage: Math.max(0, baseMetrics.voltage * (1 + noise())),
        current: Math.max(0, baseMetrics.current * (1 + noise())),
        temperature: 25 + Math.sin(Date.now() / 10000) * 5 + noise() * 2,
        ph: 7.0 + Math.sin(Date.now() / 8000) * 0.5 + noise() * 0.2,
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [selectedModel, viewScale, visualizationMode]);

  // Get base metrics based on model and scale
  const getBaseMetrics = (model: string, scale: string) => {
    const scaleMultiplier = scale === 'molecular' ? 0.001 : scale === 'industrial' ? 1000 : 1;

    switch (model) {
      case 'microfluidic':
        return {
          powerOutput: 0.5 * scaleMultiplier,
          efficiency: 65,
          cost: 50 / scaleMultiplier,
          voltage: 0.8,
          current: 0.625 * scaleMultiplier,
        };
      case 'stacked':
        return {
          powerOutput: 5.0 * scaleMultiplier,
          efficiency: 75,
          cost: 200 / scaleMultiplier,
          voltage: 3.2,
          current: 1.56 * scaleMultiplier,
        };
      case 'benchtop':
        return {
          powerOutput: 15.0 * scaleMultiplier,
          efficiency: 68,
          cost: 1500 / scaleMultiplier,
          voltage: 2.1,
          current: 7.14 * scaleMultiplier,
        };
      case 'industrial':
        return {
          powerOutput: 250.0 * scaleMultiplier,
          efficiency: 58,
          cost: 50000 / scaleMultiplier,
          voltage: 12.0,
          current: 20.8 * scaleMultiplier,
        };
      default:
        return {
          powerOutput: 1.0 * scaleMultiplier,
          efficiency: 50,
          cost: 100 / scaleMultiplier,
          voltage: 1.0,
          current: 1.0 * scaleMultiplier,
        };
    }
  };

  const formatPower = (value: number) => {
    if (value < 0.001) return `${(value * 1000000).toFixed(1)} µW`;
    if (value < 1) return `${(value * 1000).toFixed(1)} mW`;
    if (value < 1000) return `${value.toFixed(1)} W`;
    return `${(value / 1000).toFixed(1)} kW`;
  };

  const formatCurrent = (value: number) => {
    if (value < 0.001) return `${(value * 1000000).toFixed(1)} µA`;
    if (value < 1) return `${(value * 1000).toFixed(1)} mA`;
    return `${value.toFixed(1)} A`;
  };

  const formatCost = (value: number) => {
    if (value < 1000) return `$${value.toFixed(0)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 70) return 'text-green-600';
    if (efficiency >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white text-sm rounded-lg p-4 min-w-[280px]">
      {/* Header */}
      <div className="border-b border-gray-600 pb-2 mb-3">
        <h3 className="font-semibold text-base">Performance Analytics</h3>
        <p className="text-xs text-gray-300">
          {selectedModel} • {viewScale} scale
        </p>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-400">Power Output</div>
          <div className="font-mono text-lg text-blue-400">{formatPower(metrics.powerOutput)}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">Efficiency</div>
          <div className={`font-mono text-lg ${getEfficiencyColor(metrics.efficiency)}`}>
            {metrics.efficiency.toFixed(1)}%
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400">Voltage</div>
          <div className="font-mono text-lg text-yellow-400">{metrics.voltage.toFixed(2)}V</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">Current</div>
          <div className="font-mono text-lg text-green-400">{formatCurrent(metrics.current)}</div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="border-t border-gray-600 pt-2 mb-3">
        <div className="text-xs text-gray-400 mb-2">Environmental</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-400">Temp: </span>
            <span className="font-mono text-sm text-orange-400">
              {metrics.temperature.toFixed(1)}°C
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400">pH: </span>
            <span className="font-mono text-sm text-purple-400">{metrics.ph.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="border-t border-gray-600 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Est. Cost:</span>
          <span className="font-mono text-sm text-red-400">{formatCost(metrics.cost)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">$/kWh:</span>
          <span className="font-mono text-sm text-gray-300">
            $
            {metrics.powerOutput > 0
              ? (metrics.cost / (metrics.powerOutput * 1000)).toFixed(2)
              : '0.00'}
          </span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-600">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-1 ${
              visualizationMode === 'static'
                ? 'bg-gray-500'
                : visualizationMode === 'biofilm'
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
          ></div>
          <span className="text-xs text-gray-400 capitalize">{visualizationMode}</span>
        </div>

        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
    </div>
  );
}
