'use client';

import { useEffect, useState } from 'react';

interface StatisticsCounterProps {
  value: number;
  suffix?: string;
  label: string;
  isVisible: boolean;
}

export default function StatisticsCounter({
  value,
  suffix = '',
  label,
  isVisible,
}: StatisticsCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepValue = value / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(stepValue * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [isVisible, value, hasAnimated]);

  return (
    <div className="py-8">
      <div className="text-4xl font-serif font-light tracking-tight">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm opacity-60 mt-2">{label}</div>
    </div>
  );
}
