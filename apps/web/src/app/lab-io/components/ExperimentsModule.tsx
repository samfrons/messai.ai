'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@messai/ui';

interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  duration: number;
  parameters: Record<string, any>;
  results?: {
    powerOutput: number;
    efficiency: number;
    voltage: number;
    current: number;
  };
}

export default function ExperimentsModule() {
  const [experiments, setExperiments] = useState<Experiment[]>([
    {
      id: '1',
      name: 'Microfluidic Performance Test',
      status: 'completed',
      createdAt: new Date('2025-01-14'),
      duration: 24,
      parameters: {
        temperature: 25,
        ph: 7.0,
        flowRate: 10,
        microbialSpecies: 'shewanella',
      },
      results: {
        powerOutput: 2.5,
        efficiency: 12.3,
        voltage: 0.6,
        current: 4.2,
      },
    },
    {
      id: '2',
      name: 'Stacked Cell Optimization',
      status: 'running',
      createdAt: new Date('2025-01-15'),
      duration: 48,
      parameters: {
        numberOfChambers: 3,
        connectionType: 'series',
        operatingVoltage: 1.5,
      },
    },
    {
      id: '3',
      name: 'Biofilm Growth Study',
      status: 'draft',
      createdAt: new Date('2025-01-15'),
      duration: 72,
      parameters: {
        biofilmThickness: 0.5,
        inoculumConcentration: 2.0,
        temperature: 30,
      },
    },
  ]);

  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Experiment['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'running':
        return '⏳';
      case 'draft':
        return '📝';
      case 'failed':
        return '❌';
      default:
        return '📊';
    }
  };

  const createNewExperiment = () => {
    const newExperiment: Experiment = {
      id: Date.now().toString(),
      name: 'New Experiment',
      status: 'draft',
      createdAt: new Date(),
      duration: 24,
      parameters: {},
    };
    setExperiments([...experiments, newExperiment]);
    setSelectedExperiment(newExperiment.id);
  };

  const runExperiment = (experimentId: string) => {
    setExperiments(
      experiments.map((exp) => (exp.id === experimentId ? { ...exp, status: 'running' } : exp))
    );
  };

  const stopExperiment = (experimentId: string) => {
    setExperiments(
      experiments.map((exp) => (exp.id === experimentId ? { ...exp, status: 'draft' } : exp))
    );
  };

  const deleteExperiment = (experimentId: string) => {
    setExperiments(experiments.filter((exp) => exp.id !== experimentId));
    if (selectedExperiment === experimentId) {
      setSelectedExperiment(null);
    }
  };

  const renderExperimentDetails = (experiment: Experiment) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{experiment.name}</h3>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(experiment.status)}>
            {getStatusIcon(experiment.status)} {experiment.status}
          </Badge>
          <div className="flex gap-1">
            {experiment.status === 'draft' && (
              <Button size="sm" onClick={() => runExperiment(experiment.id)}>
                Run
              </Button>
            )}
            {experiment.status === 'running' && (
              <Button size="sm" variant="outline" onClick={() => stopExperiment(experiment.id)}>
                Stop
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => deleteExperiment(experiment.id)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Created:</span> {experiment.createdAt.toLocaleDateString()}
        </div>
        <div>
          <span className="font-medium">Duration:</span> {experiment.duration} hours
        </div>
      </div>

      <Accordion type="single" className="w-full">
        <AccordionItem value="parameters">
          <AccordionTrigger>Parameters</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.entries(experiment.parameters).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {experiment.results && (
          <AccordionItem value="results">
            <AccordionTrigger>Results</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Power Output:</span>{' '}
                  {experiment.results.powerOutput} mW
                </div>
                <div>
                  <span className="font-medium">Efficiency:</span> {experiment.results.efficiency}%
                </div>
                <div>
                  <span className="font-medium">Voltage:</span> {experiment.results.voltage} V
                </div>
                <div>
                  <span className="font-medium">Current:</span> {experiment.results.current} mA
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );

  return (
    <div className="absolute top-20 right-4 z-10 w-80">
      <Card className="shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Experiments</h2>
            <Button size="sm" onClick={createNewExperiment}>
              <span className="mr-2">+</span>
              New
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedExperiment === experiment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() =>
                  setSelectedExperiment(selectedExperiment === experiment.id ? null : experiment.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{experiment.name}</h4>
                    <p className="text-xs text-gray-500">
                      {experiment.createdAt.toLocaleDateString()} • {experiment.duration}h
                    </p>
                  </div>
                  <Badge size="sm" className={getStatusColor(experiment.status)}>
                    {getStatusIcon(experiment.status)}
                  </Badge>
                </div>

                {selectedExperiment === experiment.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {renderExperimentDetails(experiment)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {experiments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No experiments yet</p>
              <Button size="sm" variant="outline" onClick={createNewExperiment} className="mt-2">
                Create your first experiment
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
