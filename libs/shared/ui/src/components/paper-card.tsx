'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';
import { Card } from './card';
import { Badge } from './badge';

/**
 * Research Paper data structure for display
 */
export interface PaperData {
  id: string;
  title: string;
  authors: Array<{ name: string; affiliation?: string; isCorresponding?: boolean }>;
  journal: { name: string; type: string };
  year: number;
  researchFocus: string[];
  abstract: string;
  performanceMetrics?: {
    maxPowerDensity?: number;
    coulombicEfficiency?: number;
    energyRecoveryEfficiency?: number;
  };
  citation: { citationCount: number };
  aiEnhanced: boolean;
  qualityScore: number;
  fullTextAvailable: boolean;

  // In Silico Model Integration (optional fields)
  inSilicoAvailable?: boolean;
  modelType?: string;
  modelParameters?: any; // JSON object
  performanceTargets?: any; // JSON object
  systemGeometry?: any; // JSON object
  materialSpecs?: any; // JSON object
  operatingSpecs?: any; // JSON object
  methodology?: string[]; // JSON array
  recreationDifficulty?: 'easy' | 'medium' | 'hard';
  parameterCompleteness?: number; // 0-1
  validationStatus?: 'validated' | 'pending' | 'failed';
  modelAccuracy?: number; // 0-1
}

export interface PaperCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Paper data to display */
  paper: PaperData;

  /** Whether the card should be interactive (clickable) */
  interactive?: boolean;

  /** Callback when paper is clicked */
  onPaperClick?: (paper: PaperData) => void;

  /** Whether to show detailed metrics */
  showMetrics?: boolean;

  /** Whether to truncate abstract */
  truncateAbstract?: boolean;

  /** Maximum lines for abstract when truncated */
  maxAbstractLines?: number;
}

/**
 * PaperCard - Component for displaying research paper information in search results
 *
 * Features:
 * - Paper title, authors, and journal information
 * - Research focus badges
 * - Performance metrics display
 * - AI enhancement indicators
 * - Quality score visualization
 * - Citation count
 * - Interactive click handling
 */
export const PaperCard = forwardRef<HTMLDivElement, PaperCardProps>(
  (
    {
      paper,
      interactive = true,
      onPaperClick,
      showMetrics = true,
      truncateAbstract = true,
      maxAbstractLines = 3,
      className,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (interactive && onPaperClick) {
        onPaperClick(paper);
      }
    };

    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
      return num.toString();
    };

    const getQualityColor = (score: number): string => {
      if (score >= 9) return 'text-green-600';
      if (score >= 7) return 'text-yellow-600';
      return 'text-gray-600';
    };

    const getCorrespondingAuthor = () => {
      return paper.authors.find((author) => author.isCorresponding) || paper.authors[0];
    };

    const correspondingAuthor = getCorrespondingAuthor();
    if (!correspondingAuthor) {
      return null; // Handle case where no authors exist
    }
    const additionalAuthorsCount = paper.authors.length - 1;

    return (
      <Card
        ref={ref}
        interactive={interactive}
        className={cn(
          'p-6 space-y-4 transition-all duration-200',
          interactive && 'hover:shadow-lg cursor-pointer',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Header Section */}
        <div className="space-y-2">
          {/* Title and AI Enhancement Indicator */}
          <div className="flex items-start gap-3">
            <h3 className="text-lg font-serif font-normal text-black leading-tight flex-1">
              {paper.title}
            </h3>
            <div className="flex items-center gap-2">
              {paper.aiEnhanced && (
                <div className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L17 7L15.74 9.91L22 11L15.74 12.09L17 15L13.09 13.74L12 20L10.91 13.74L7 15L8.26 12.09L2 11L8.26 9.91L7 7L10.91 8.26L12 2Z" />
                  </svg>
                  AI Enhanced
                </div>
              )}
              {paper.inSilicoAvailable && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5h2V3c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2h2c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zM7 3v2h10V3H7zm12 4H5v11h14V7z" />
                    <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  3D Model
                </div>
              )}
            </div>
          </div>

          {/* Authors and Journal Info */}
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{correspondingAuthor.name}</span>
              {additionalAuthorsCount > 0 && (
                <span className="text-gray-500">
                  {additionalAuthorsCount === 1
                    ? `+ 1 other`
                    : `+ ${additionalAuthorsCount} others`}
                </span>
              )}
              {correspondingAuthor.affiliation && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{correspondingAuthor.affiliation}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="font-medium">{paper.journal.name}</span>
              <span>•</span>
              <span>{paper.year}</span>
              <span>•</span>
              <span className="capitalize">{paper.journal.type}</span>
            </div>
          </div>
        </div>

        {/* Research Focus Badges */}
        <div className="flex flex-wrap gap-2">
          {paper.researchFocus.slice(0, 4).map((focus, index) => (
            <Badge key={index} variant={index === 0 ? 'primary' : 'secondary'} size="sm">
              {focus}
            </Badge>
          ))}
          {paper.researchFocus.length > 4 && (
            <Badge variant="gray" size="sm">
              +{paper.researchFocus.length - 4} more
            </Badge>
          )}
        </div>

        {/* Abstract */}
        <div className="text-sm text-gray-700 leading-relaxed">
          <p
            className={cn(
              truncateAbstract && [
                'line-clamp-3',
                maxAbstractLines === 2 && 'line-clamp-2',
                maxAbstractLines === 4 && 'line-clamp-4',
              ]
            )}
            style={{
              display: truncateAbstract ? '-webkit-box' : 'block',
              WebkitLineClamp: truncateAbstract ? maxAbstractLines : 'unset',
              WebkitBoxOrient: 'vertical' as const,
              overflow: truncateAbstract ? 'hidden' : 'visible',
            }}
          >
            {paper.abstract}
          </p>
        </div>

        {/* Performance Metrics */}
        {showMetrics && paper.performanceMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
            {paper.performanceMetrics.maxPowerDensity && (
              <div className="text-center">
                <div className="text-lg font-semibold text-primary-600">
                  {formatNumber(paper.performanceMetrics.maxPowerDensity)}
                </div>
                <div className="text-xs text-gray-500">mW/m² Power</div>
              </div>
            )}
            {paper.performanceMetrics.coulombicEfficiency && (
              <div className="text-center">
                <div className="text-lg font-semibold text-secondary-600">
                  {paper.performanceMetrics.coulombicEfficiency.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Coulombic Eff.</div>
              </div>
            )}
            {paper.performanceMetrics.energyRecoveryEfficiency && (
              <div className="text-center">
                <div className="text-lg font-semibold text-accent-600">
                  {paper.performanceMetrics.energyRecoveryEfficiency.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Energy Recovery</div>
              </div>
            )}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                />
              </svg>
              <span>{paper.citation.citationCount} citations</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className={cn('font-medium', getQualityColor(paper.qualityScore))}>
                {paper.qualityScore.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {paper.fullTextAvailable && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Full Text</span>
              </div>
            )}

            {interactive && (
              <div className="text-xs text-primary-600 font-medium">View Details →</div>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

PaperCard.displayName = 'PaperCard';

/**
 * PaperCardSkeleton - Loading state for PaperCard
 */
export const PaperCardSkeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('p-6 space-y-4', className)} {...props}>
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>

        {/* Badges skeleton */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-18"></div>
        </div>

        {/* Abstract skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>

        {/* Metrics skeleton */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </Card>
    );
  }
);

PaperCardSkeleton.displayName = 'PaperCardSkeleton';
