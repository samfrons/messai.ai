'use client';

import React from 'react';
import { Input } from '@messai/ui';
import { cn } from '@messai/ui';

export interface ParameterControlProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'select' | 'range';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  description?: string;
  className?: string;
}

export default function ParameterControl({
  label,
  value,
  onChange,
  type = 'number',
  unit,
  min,
  max,
  step = 1,
  options = [],
  description,
  className,
}: ParameterControlProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue =
      type === 'number' || type === 'range' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const renderControl = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={handleChange}
            className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-black transition-colors focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value}
              onChange={handleChange}
              min={min}
              max={max}
              step={step}
              className="w-full h-1 bg-gray-300 rounded-none appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{min}</span>
              <span className="font-mono">
                {value}
                {unit && ` ${unit}`}
              </span>
              <span>{max}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative">
            <Input
              type={type}
              value={value}
              onChange={handleChange}
              min={min}
              max={max}
              step={step}
              className="pr-12"
              size="sm"
            />
            {unit && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                {unit}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-normal text-black">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      {renderControl()}
    </div>
  );
}

// Slider styles for range input
export const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: black;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: black;
    cursor: pointer;
    border: none;
  }
`;
