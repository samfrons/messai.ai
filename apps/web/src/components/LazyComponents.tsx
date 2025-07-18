'use client';

import { lazy } from 'react';

// Lazy load heavy chart components
export const TimeSeriesChart = lazy(() => import('../app/lab/components/TimeSeriesChart'));

// Lazy load prediction components
export const PredictionConfigurationForm = lazy(
  () => import('../components/predictions/PredictionConfigurationForm')
);

export const PredictionResultsVisualization = lazy(
  () => import('../components/predictions/PredictionResultsVisualization')
);

export const OptimizationVisualization = lazy(
  () => import('../components/predictions/OptimizationVisualization')
);

export const PredictionHistory = lazy(() => import('../components/predictions/PredictionHistory'));

// Lazy load research components
export const ResearchInsightsPanel = lazy(() =>
  import('@messai/ui').then((module) => ({
    default: module.ResearchInsightsPanel,
  }))
);

export const AgentStatusCard = lazy(() =>
  import('@messai/ui').then((module) => ({
    default: module.AgentStatusCard,
  }))
);

export const PaperCard = lazy(() =>
  import('@messai/ui').then((module) => ({
    default: module.PaperCard,
  }))
);

export const PaperDetailModal = lazy(() =>
  import('@messai/ui').then((module) => ({
    default: module.PaperDetailModal,
  }))
);
