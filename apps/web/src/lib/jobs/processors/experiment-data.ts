import { Job } from 'bullmq';
import { ExperimentDataJobData, JobResult } from '../types';
import { prisma } from '../../../db';

export async function processExperimentDataJob(
  job: Job<ExperimentDataJobData>
): Promise<JobResult> {
  const { experimentId, action, data, userId } = job.data;
  const startTime = Date.now();

  try {
    await job.updateProgress({ percentage: 0, message: 'Starting experiment data processing...' });

    switch (action) {
      case 'process_results':
        return await processExperimentResults(job, experimentId, data, userId);

      case 'generate_report':
        return await generateExperimentReport(job, experimentId, userId);

      case 'calculate_metrics':
        return await calculateExperimentMetrics(job, experimentId, userId);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Experiment data job failed:`, error);
    throw error;
  }
}

async function processExperimentResults(
  job: Job<ExperimentDataJobData>,
  experimentId: string,
  rawData: any,
  userId: string
): Promise<JobResult> {
  await job.updateProgress({ percentage: 10, message: 'Validating experiment data...' });

  // TODO: Fetch experiment from database
  // For now, we'll work with mock data
  const experiment = {
    id: experimentId,
    name: 'Mock Experiment',
    type: 'MFC',
    userId,
    parameters: {},
    status: 'running',
  };

  await job.updateProgress({ percentage: 30, message: 'Processing raw data...' });

  // Process raw experimental data
  const processedData = processRawData(rawData);

  await job.updateProgress({ percentage: 50, message: 'Calculating performance metrics...' });

  // Calculate key performance indicators
  const metrics = calculatePerformanceMetrics(processedData);

  await job.updateProgress({ percentage: 70, message: 'Detecting anomalies...' });

  // Detect anomalies in the data
  const anomalies = detectAnomalies(processedData);

  await job.updateProgress({ percentage: 90, message: 'Saving results...' });

  // Save processed results
  const results = {
    experimentId,
    processedAt: new Date(),
    rawDataPoints: processedData.length,
    metrics,
    anomalies,
    summary: generateSummary(metrics, anomalies),
  };

  // TODO: Save to database
  // await prisma.experimentResult.create({ data: results });

  await job.updateProgress({ percentage: 100, message: 'Processing complete!' });

  return {
    success: true,
    data: results,
    duration: Date.now() - startTime,
  };
}

async function generateExperimentReport(
  job: Job<ExperimentDataJobData>,
  experimentId: string,
  userId: string
): Promise<JobResult> {
  await job.updateProgress({ percentage: 10, message: 'Loading experiment data...' });

  // TODO: Load experiment and results from database
  const experiment = {
    id: experimentId,
    name: 'Mock Experiment',
    type: 'MFC',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    parameters: {
      temperature: 25,
      pH: 7.2,
      substrate: 'Acetate',
    },
  };

  await job.updateProgress({ percentage: 30, message: 'Analyzing results...' });

  // Generate analysis
  const analysis = {
    powerDensityTrend: 'increasing',
    coulombicEfficiency: 82.5,
    stabilityScore: 0.89,
    optimalConditions: {
      temperature: 27,
      pH: 7.0,
    },
  };

  await job.updateProgress({ percentage: 50, message: 'Creating visualizations...' });

  // Generate chart data
  const charts = {
    powerDensityOverTime: generateTimeSeriesData('power', 100),
    voltageProfile: generateTimeSeriesData('voltage', 100),
    efficiencyDistribution: generateDistributionData(),
  };

  await job.updateProgress({ percentage: 70, message: 'Generating recommendations...' });

  // AI-powered recommendations
  const recommendations = [
    'Consider increasing temperature to 27°C for optimal performance',
    'pH adjustment to 7.0 may improve coulombic efficiency',
    'Biofilm appears mature; consider harvesting in 2-3 days',
  ];

  await job.updateProgress({ percentage: 90, message: 'Compiling report...' });

  // Compile full report
  const report = {
    experimentId,
    generatedAt: new Date(),
    experiment,
    analysis,
    charts,
    recommendations,
    exportFormats: ['pdf', 'xlsx', 'json'],
  };

  await job.updateProgress({ percentage: 100, message: 'Report generated!' });

  return {
    success: true,
    data: report,
    duration: Date.now() - job.timestamp,
  };
}

async function calculateExperimentMetrics(
  job: Job<ExperimentDataJobData>,
  experimentId: string,
  userId: string
): Promise<JobResult> {
  await job.updateProgress({ percentage: 10, message: 'Loading experiment data...' });

  // Mock data loading
  const dataPoints = 1000;
  const data = generateMockExperimentData(dataPoints);

  await job.updateProgress({ percentage: 30, message: 'Calculating electrical metrics...' });

  const electricalMetrics = {
    avgPowerDensity: calculateAverage(data.powerDensity),
    maxPowerDensity: Math.max(...data.powerDensity),
    avgVoltage: calculateAverage(data.voltage),
    avgCurrent: calculateAverage(data.current),
    internalResistance: calculateInternalResistance(data.voltage, data.current),
    coulombicEfficiency: calculateCoulombicEfficiency(data),
  };

  await job.updateProgress({ percentage: 50, message: 'Calculating biological metrics...' });

  const biologicalMetrics = {
    biofilmGrowthRate: calculateGrowthRate(data.biofilmThickness),
    substrateConsumptionRate: calculateConsumptionRate(data.substrateConcentration),
    bacterialActivity: estimateBacterialActivity(data),
  };

  await job.updateProgress({ percentage: 70, message: 'Calculating efficiency metrics...' });

  const efficiencyMetrics = {
    energyEfficiency: calculateEnergyEfficiency(electricalMetrics, data),
    substrateUtilization: calculateSubstrateUtilization(data),
    overallSystemEfficiency: calculateOverallEfficiency(electricalMetrics, biologicalMetrics),
  };

  await job.updateProgress({ percentage: 90, message: 'Saving metrics...' });

  const metrics = {
    experimentId,
    calculatedAt: new Date(),
    dataPoints,
    electrical: electricalMetrics,
    biological: biologicalMetrics,
    efficiency: efficiencyMetrics,
    quality: assessDataQuality(data),
  };

  await job.updateProgress({ percentage: 100, message: 'Metrics calculated!' });

  return {
    success: true,
    data: metrics,
    duration: Date.now() - job.timestamp,
  };
}

// Helper functions
function processRawData(rawData: any): any[] {
  // Mock processing
  return Array.isArray(rawData) ? rawData : [];
}

function calculatePerformanceMetrics(data: any[]): Record<string, number> {
  return {
    avgPowerDensity: Math.random() * 1000,
    maxPowerDensity: Math.random() * 1500,
    coulombicEfficiency: Math.random() * 100,
    stability: Math.random(),
  };
}

function detectAnomalies(data: any[]): any[] {
  // Mock anomaly detection
  return [];
}

function generateSummary(metrics: any, anomalies: any[]): string {
  return `Experiment showed ${
    metrics.stability > 0.8 ? 'stable' : 'unstable'
  } performance with average power density of ${metrics.avgPowerDensity.toFixed(2)} mW/m². ${
    anomalies.length
  } anomalies detected.`;
}

function generateTimeSeriesData(type: string, points: number): any[] {
  return Array.from({ length: points }, (_, i) => ({
    timestamp: Date.now() - (points - i) * 60000,
    value: Math.random() * 100 + (type === 'power' ? 500 : 0.5),
  }));
}

function generateDistributionData(): any {
  return {
    bins: Array.from({ length: 10 }, (_, i) => i * 10),
    frequencies: Array.from({ length: 10 }, () => Math.floor(Math.random() * 50)),
  };
}

function generateMockExperimentData(points: number): any {
  return {
    powerDensity: Array.from({ length: points }, () => Math.random() * 1000),
    voltage: Array.from({ length: points }, () => Math.random() * 0.8),
    current: Array.from({ length: points }, () => Math.random() * 5),
    biofilmThickness: Array.from({ length: points }, (_, i) => i * 0.5 + Math.random() * 10),
    substrateConcentration: Array.from(
      { length: points },
      (_, i) => 100 - i * 0.05 + Math.random() * 5
    ),
  };
}

function calculateAverage(data: number[]): number {
  return data.reduce((a, b) => a + b, 0) / data.length;
}

function calculateInternalResistance(voltage: number[], current: number[]): number {
  // Simplified calculation
  const avgV = calculateAverage(voltage);
  const avgI = calculateAverage(current);
  return avgV / avgI;
}

function calculateCoulombicEfficiency(data: any): number {
  // Mock calculation
  return 75 + Math.random() * 20;
}

function calculateGrowthRate(thickness: number[]): number {
  // Simple linear regression slope
  const n = thickness.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = thickness.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * thickness[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

function calculateConsumptionRate(concentration: number[]): number {
  // Negative of growth rate (consumption decreases concentration)
  return -calculateGrowthRate(concentration);
}

function estimateBacterialActivity(data: any): number {
  // Mock estimation based on power output
  const avgPower = calculateAverage(data.powerDensity);
  return Math.min(avgPower / 1000, 1);
}

function calculateEnergyEfficiency(electrical: any, data: any): number {
  // Mock calculation
  return electrical.coulombicEfficiency * 0.8;
}

function calculateSubstrateUtilization(data: any): number {
  // Mock calculation
  return 70 + Math.random() * 25;
}

function calculateOverallEfficiency(electrical: any, biological: any): number {
  // Weighted average of different efficiency factors
  return (electrical.coulombicEfficiency * 0.4 + biological.bacterialActivity * 100 * 0.6) * 0.85;
}

function assessDataQuality(data: any): any {
  return {
    completeness: 0.95 + Math.random() * 0.05,
    accuracy: 0.9 + Math.random() * 0.1,
    consistency: 0.92 + Math.random() * 0.08,
  };
}
