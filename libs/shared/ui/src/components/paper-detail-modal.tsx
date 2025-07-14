'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';
import { Modal, ModalHeader, ModalContent } from './modal';
import { Badge } from './badge';
import { Button } from './button';
import type { PaperData } from './paper-card';

export interface PaperDetailModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClose'> {
  /** Whether the modal is open */
  open: boolean;

  /** Function to call when the modal should close */
  onClose: () => void;

  /** Paper data to display */
  paper: PaperData | null;

  /** Callback for citation export */
  onExportCitation?: (paper: PaperData, format: 'bibtex' | 'ris' | 'apa') => void;

  /** Callback for full text access */
  onAccessFullText?: (paper: PaperData) => void;

  /** Whether to show export options */
  showExportOptions?: boolean;
}

/**
 * PaperDetailModal - Comprehensive modal for displaying detailed research paper information
 *
 * Features:
 * - Complete paper metadata display
 * - Author information with affiliations
 * - Performance metrics visualization
 * - Citation information and export options
 * - Full abstract and methodology display
 * - AI enhancement details
 * - External links and access options
 */
export const PaperDetailModal = forwardRef<HTMLDivElement, PaperDetailModalProps>(
  (
    {
      open,
      onClose,
      paper,
      onExportCitation,
      onAccessFullText,
      showExportOptions = true,
      className,
    },
    ref
  ) => {
    if (!paper) return null;

    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
      }
      return num.toString();
    };

    const getQualityColor = (score: number): string => {
      if (score >= 9) return 'text-green-600 bg-green-50';
      if (score >= 7) return 'text-yellow-600 bg-yellow-50';
      return 'text-gray-600 bg-gray-50';
    };

    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        size="xl"
        title={paper.title}
        className={className || ''}
      >
        <ModalHeader onClose={onClose}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">{paper.title}</h2>
            </div>
            {paper.aiEnhanced && (
              <div className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L17 7L15.74 9.91L22 11L15.74 12.09L17 15L13.09 13.74L12 20L10.91 13.74L7 15L8.26 12.09L2 11L8.26 9.91L7 7L10.91 8.26L12 2Z" />
                </svg>
                AI Enhanced
              </div>
            )}
          </div>
        </ModalHeader>

        <ModalContent className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Publication Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Authors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Authors</h3>
                <div className="space-y-2">
                  {paper.authors.map((author, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{author.name}</span>
                          {author.isCorresponding && (
                            <Badge variant="primary" size="sm">
                              Corresponding
                            </Badge>
                          )}
                        </div>
                        {author.affiliation && (
                          <p className="text-sm text-gray-600">{author.affiliation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
              </div>

              {/* Research Focus */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {paper.researchFocus.map((focus, index) => (
                    <Badge key={index} variant={index === 0 ? 'primary' : 'secondary'}>
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar with metrics and info */}
            <div className="space-y-6">
              {/* Publication Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Publication Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Journal:</span>
                    <div className="font-medium">{paper.journal.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div className="font-medium capitalize">{paper.journal.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Year:</span>
                    <div className="font-medium">{paper.year}</div>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quality Score</span>
                    <div
                      className={cn(
                        'px-2 py-1 rounded-full text-sm font-medium',
                        getQualityColor(paper.qualityScore)
                      )}
                    >
                      {paper.qualityScore.toFixed(1)}/10
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Citations</span>
                    <span className="font-medium">{paper.citation.citationCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Full Text</span>
                    <div className="flex items-center gap-1">
                      {paper.fullTextAvailable ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          <span className="text-sm">Available</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {paper.performanceMetrics && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                  <div className="space-y-3">
                    {paper.performanceMetrics.maxPowerDensity && (
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-lg font-semibold text-primary-600">
                          {formatNumber(paper.performanceMetrics.maxPowerDensity)}
                        </div>
                        <div className="text-xs text-gray-500">mW/m² Max Power Density</div>
                      </div>
                    )}
                    {paper.performanceMetrics.coulombicEfficiency && (
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-lg font-semibold text-secondary-600">
                          {paper.performanceMetrics.coulombicEfficiency.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Coulombic Efficiency</div>
                      </div>
                    )}
                    {paper.performanceMetrics.energyRecoveryEfficiency && (
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-lg font-semibold text-accent-600">
                          {paper.performanceMetrics.energyRecoveryEfficiency.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Energy Recovery</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {paper.fullTextAvailable && onAccessFullText && (
              <Button
                variant="primary"
                onClick={() => onAccessFullText(paper)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Access Full Text
              </Button>
            )}

            {showExportOptions && onExportCitation && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => onExportCitation(paper, 'bibtex')}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Export BibTeX
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => onExportCitation(paper, 'ris')}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export RIS
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => onExportCitation(paper, 'apa')}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Copy APA Citation
                </Button>
              </>
            )}

            <div className="flex-1"></div>

            <Button variant="outline" onClick={onClose} className="ml-auto">
              Close
            </Button>
          </div>
        </ModalContent>
      </Modal>
    );
  }
);

PaperDetailModal.displayName = 'PaperDetailModal';
