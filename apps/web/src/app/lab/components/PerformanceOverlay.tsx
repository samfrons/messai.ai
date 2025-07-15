import { useState, useEffect } from 'react';
import TimeSeriesChart from './TimeSeriesChart';

interface PerformanceOverlayProps {
  selectedModel: string;
  viewScale: string;
  visualizationMode: string;
  parameters?: {
    temperature?: number;
    ph?: number;
    flowRate?: number;
    operatingVoltage?: number;
    [key: string]: any;
  };
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

interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
}

interface HistoricalData {
  powerOutput: TimeSeriesDataPoint[];
  efficiency: TimeSeriesDataPoint[];
  voltage: TimeSeriesDataPoint[];
  current: TimeSeriesDataPoint[];
  temperature: TimeSeriesDataPoint[];
  ph: TimeSeriesDataPoint[];
}

export default function PerformanceOverlay({
  selectedModel,
  viewScale,
  visualizationMode,
  parameters = {},
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

  const [historicalData, setHistoricalData] = useState<HistoricalData>({
    powerOutput: [],
    efficiency: [],
    voltage: [],
    current: [],
    temperature: [],
    ph: [],
  });

  const [showCharts, setShowCharts] = useState(false);
  const [selectedChart, setSelectedChart] = useState<
    'power' | 'efficiency' | 'voltage' | 'current' | 'temperature' | 'ph'
  >('power');

  // Simulate real-time performance data with parameter influence
  useEffect(() => {
    const updateMetrics = () => {
      const baseMetrics = getBaseMetrics(selectedModel, viewScale, parameters);
      const noise = () => (Math.random() - 0.5) * 0.1;

      const newMetrics = {
        powerOutput: Math.max(0, baseMetrics.powerOutput * (1 + noise())),
        efficiency: Math.max(0, Math.min(100, baseMetrics.efficiency * (1 + noise()))),
        cost: Math.max(0, baseMetrics.cost * (1 + noise())),
        voltage: Math.max(0, baseMetrics.voltage * (1 + noise())),
        current: Math.max(0, baseMetrics.current * (1 + noise())),
        temperature:
          (parameters.temperature || 25) + Math.sin(Date.now() / 10000) * 2 + noise() * 1,
        ph: (parameters.ph || 7.0) + Math.sin(Date.now() / 8000) * 0.3 + noise() * 0.1,
      };

      setMetrics(newMetrics);

      // Update historical data
      const timestamp = Date.now();
      setHistoricalData((prev) => ({
        powerOutput: [...prev.powerOutput.slice(-49), { timestamp, value: newMetrics.powerOutput }],
        efficiency: [...prev.efficiency.slice(-49), { timestamp, value: newMetrics.efficiency }],
        voltage: [...prev.voltage.slice(-49), { timestamp, value: newMetrics.voltage }],
        current: [...prev.current.slice(-49), { timestamp, value: newMetrics.current }],
        temperature: [...prev.temperature.slice(-49), { timestamp, value: newMetrics.temperature }],
        ph: [...prev.ph.slice(-49), { timestamp, value: newMetrics.ph }],
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [selectedModel, viewScale, visualizationMode, parameters]);

  // Get base metrics based on model, scale, and parameters
  const getBaseMetrics = (model: string, scale: string, params: any) => {
    const scaleMultiplier = scale === 'molecular' ? 0.001 : scale === 'industrial' ? 1000 : 1;

    // Parameter influence factors
    const tempFactor = params.temperature
      ? Math.max(0.5, Math.min(1.5, (params.temperature - 15) / 25))
      : 1;
    const phFactor = params.ph
      ? Math.max(0.7, Math.min(1.3, 1 - Math.abs(params.ph - 7) * 0.1))
      : 1;
    const flowFactor = params.flowRate ? Math.max(0.8, Math.min(1.2, params.flowRate / 10)) : 1;
    const voltageFactor = params.operatingVoltage
      ? Math.max(0.5, Math.min(1.5, params.operatingVoltage / 0.5))
      : 1;

    const combinedFactor = tempFactor * phFactor * flowFactor * voltageFactor;

    switch (model) {
      case 'microfluidic':
        return {
          powerOutput: 0.5 * scaleMultiplier * combinedFactor,
          efficiency: 65 * Math.min(1.2, combinedFactor),
          cost: 50 / scaleMultiplier,
          voltage: 0.8 * voltageFactor,
          current: 0.625 * scaleMultiplier * combinedFactor,
        };
      case 'stacked':
        return {
          powerOutput: 5.0 * scaleMultiplier * combinedFactor,
          efficiency: 75 * Math.min(1.2, combinedFactor),
          cost: 200 / scaleMultiplier,
          voltage: 3.2 * voltageFactor,
          current: 1.56 * scaleMultiplier * combinedFactor,
        };
      case 'benchtop':
        return {
          powerOutput: 15.0 * scaleMultiplier * combinedFactor,
          efficiency: 68 * Math.min(1.2, combinedFactor),
          cost: 1500 / scaleMultiplier,
          voltage: 2.1 * voltageFactor,
          current: 7.14 * scaleMultiplier * combinedFactor,
        };
      case 'industrial':
        return {
          powerOutput: 250.0 * scaleMultiplier * combinedFactor,
          efficiency: 58 * Math.min(1.2, combinedFactor),
          cost: 50000 / scaleMultiplier,
          voltage: 12.0 * voltageFactor,
          current: 20.8 * scaleMultiplier * combinedFactor,
        };
      default:
        return {
          powerOutput: 1.0 * scaleMultiplier * combinedFactor,
          efficiency: 50 * Math.min(1.2, combinedFactor),
          cost: 100 / scaleMultiplier,
          voltage: 1.0 * voltageFactor,
          current: 1.0 * scaleMultiplier * combinedFactor,
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

  const chartConfigs = {
    power: { data: historicalData.powerOutput, color: '#00bcd4', title: 'Power Output', unit: 'W' },
    efficiency: {
      data: historicalData.efficiency,
      color: '#4caf50',
      title: 'Efficiency',
      unit: '%',
    },
    voltage: { data: historicalData.voltage, color: '#ff9800', title: 'Voltage', unit: 'V' },
    current: { data: historicalData.current, color: '#e91e63', title: 'Current', unit: 'A' },
    temperature: {
      data: historicalData.temperature,
      color: '#ff5722',
      title: 'Temperature',
      unit: '°C',
    },
    ph: { data: historicalData.ph, color: '#9c27b0', title: 'pH Level', unit: '' },
  };

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-90 text-white text-sm rounded-lg p-4 min-w-[280px] max-w-[400px]">
      {/* Header */}
      <div className="border-b border-gray-600 pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Performance Analytics</h3>
            <p className="text-xs text-gray-300">
              {selectedModel} • {viewScale} scale
            </p>
          </div>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
          >
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
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

      {/* Time Series Charts */}
      {showCharts && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          {/* Chart Selection */}
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(chartConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as any)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  selectedChart === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {config.title}
              </button>
            ))}
          </div>

          {/* Chart Display */}
          <div className="bg-gray-800 rounded p-2">
            <TimeSeriesChart
              data={chartConfigs[selectedChart].data}
              width={350}
              height={150}
              color={chartConfigs[selectedChart].color}
              title={chartConfigs[selectedChart].title}
              unit={chartConfigs[selectedChart].unit}
              showGrid={true}
              animated={true}
            />
          </div>

          {/* Chart Controls */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Last 50 data points</span>
            <span>Updated every 1s</span>
          </div>
        </div>
      )}
    </div>
  );
}
