'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@messai/ui';
import { getParameterById } from '../utils/parameter-detail-service';
import type { ParameterDetail } from '../../../types/parameters';
import ParameterDetailHeader from '../components/ParameterDetailHeader';
import ParameterProperties from '../components/ParameterProperties';
import ParameterContent from '../components/ParameterContent';
import CompatibilityMatrix from '../components/CompatibilityMatrix';
import PerformanceMetrics from '../components/PerformanceMetrics';
import RelatedParameters from '../components/RelatedParameters';

// Import all detail section components
import {
  DefinitionSection,
  TypicalValuesSection,
  MeasurementMethodsSection,
  AffectingFactorsSection,
  PerformanceImpactSection,
  CompatibleSystemsSection,
  LimitationsSection,
  ValidationRulesSection,
  ReferencesSection,
  CostAnalysisSection,
  CompositionStructureSection,
  ElectrochemicalPropertiesSection,
  AlternativeSystemsSection,
  PreparationMethodsSection,
  SpeciesConsiderationsSection,
  TransferMechanismsSection,
  MolecularBiologySection,
  FormulaSection,
  ApplicationNotesSection,
} from '../../../components/parameters/detail-sections';

export default function ParameterDetailPage() {
  const params = useParams();
  const id = params['id'] as string;
  const [parameter, setParameter] = useState<ParameterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParameter = async () => {
      try {
        setIsLoading(true);
        const data = await getParameterById(id);
        if (!data) {
          setError('Parameter not found');
        } else {
          setParameter(data);
        }
      } catch (err) {
        console.error('Error loading parameter:', err);
        setError('Failed to load parameter details');
      } finally {
        setIsLoading(false);
      }
    };

    loadParameter();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="border-b border-gray-200 pb-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-48"></Card>
          <Card className="h-48"></Card>
        </div>
      </div>
    );
  }

  if (error || !parameter) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Parameter not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The parameter with ID "{id}" could not be found or loaded.
          </p>
          <Link href="/parameters">
            <Button>Back to Parameters</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex text-sm text-gray-600">
        <Link href="/parameters" className="hover:text-primary-600">
          Parameters
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{parameter.name}</span>
      </nav>

      {/* Header Section */}
      <ParameterDetailHeader parameter={parameter} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Detail Sections */}
          {parameter.definition && <DefinitionSection definition={parameter.definition} />}

          {parameter.formula && <FormulaSection formula={parameter.formula} />}

          {parameter.typicalValues && (
            <TypicalValuesSection
              typicalValues={parameter.typicalValues}
              unit={parameter.unit || ''}
            />
          )}

          {/* Properties Card - Keep for basic properties */}
          <ParameterProperties parameter={parameter} />

          {/* Category-Specific Sections */}
          {parameter.compositionStructure && (
            <CompositionStructureSection composition={parameter.compositionStructure} />
          )}

          {parameter.electrochemicalProperties && (
            <ElectrochemicalPropertiesSection properties={parameter.electrochemicalProperties} />
          )}

          {/* Measurement & Methods */}
          {parameter.measurementMethods && parameter.measurementMethods.length > 0 && (
            <MeasurementMethodsSection methods={parameter.measurementMethods} />
          )}

          {parameter.preparationMethods && parameter.preparationMethods.length > 0 && (
            <PreparationMethodsSection methods={parameter.preparationMethods} />
          )}

          {/* Performance & Impact */}
          {parameter.performanceImpact && (
            <PerformanceImpactSection impact={parameter.performanceImpact} />
          )}

          {parameter.performanceMetrics && (
            <PerformanceMetrics metrics={parameter.performanceMetrics} />
          )}

          {/* Factors & Systems */}
          {parameter.affectingFactors && (
            <AffectingFactorsSection factors={parameter.affectingFactors} />
          )}

          {parameter.compatibleSystems && (
            <CompatibleSystemsSection systems={parameter.compatibleSystems} />
          )}

          {/* Biological Sections */}
          {parameter.speciesConsiderations && parameter.speciesConsiderations.length > 0 && (
            <SpeciesConsiderationsSection species={parameter.speciesConsiderations} />
          )}

          {parameter.transferMechanisms && parameter.transferMechanisms.length > 0 && (
            <TransferMechanismsSection mechanisms={parameter.transferMechanisms} />
          )}

          {parameter.molecularBiology && (
            <MolecularBiologySection biology={parameter.molecularBiology} />
          )}

          {/* Alternative Systems */}
          {parameter.alternativeSystems && parameter.alternativeSystems.length > 0 && (
            <AlternativeSystemsSection systems={parameter.alternativeSystems} />
          )}

          {/* Validation & Limitations */}
          {parameter.limitations && <LimitationsSection limitations={parameter.limitations} />}

          {parameter.detailValidationRules && (
            <ValidationRulesSection rules={parameter.detailValidationRules} />
          )}

          {/* Cost Analysis */}
          {parameter.costAnalysis && <CostAnalysisSection analysis={parameter.costAnalysis} />}

          {/* Application Notes */}
          {parameter.applicationNotes && parameter.applicationNotes.length > 0 && (
            <ApplicationNotesSection notes={parameter.applicationNotes} />
          )}

          {/* Legacy Markdown Content Sections */}
          {parameter.content && <ParameterContent content={parameter.content} />}

          {/* References */}
          {parameter.detailReferences && parameter.detailReferences.length > 0 && (
            <ReferencesSection references={parameter.detailReferences} />
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Compatibility Matrix */}
          {parameter.compatibility && (
            <CompatibilityMatrix compatibility={parameter.compatibility} />
          )}

          {/* Related Parameters */}
          {parameter.relatedParameters && parameter.relatedParameters.length > 0 && (
            <RelatedParameters parameters={parameter.relatedParameters} />
          )}

          {/* Actions Card */}
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Parameter
                </Button>
                <Button variant="outline" className="w-full">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Duplicate
                </Button>
                <Button variant="outline" className="w-full">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  Export
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
