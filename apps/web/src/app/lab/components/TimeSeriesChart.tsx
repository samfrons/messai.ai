'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  unit?: string;
  yAxisMin?: number;
  yAxisMax?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export default function TimeSeriesChart({
  data,
  width = 280,
  height = 120,
  color = '#00bcd4',
  title = 'Performance',
  unit = '',
  yAxisMin,
  yAxisMax,
  showGrid = true,
  animated = true,
  className = '',
}: TimeSeriesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number } | null>(
    null
  );
  const animationRef = useRef<number | undefined>(undefined);

  // Calculate data bounds
  const dataBounds = React.useMemo(() => {
    if (data.length === 0) return { minY: 0, maxY: 1, minX: 0, maxX: 1 };

    const values = data.map((d) => d.value);
    const timestamps = data.map((d) => d.timestamp);

    return {
      minY: yAxisMin !== undefined ? yAxisMin : Math.min(...values),
      maxY: yAxisMax !== undefined ? yAxisMax : Math.max(...values),
      minX: Math.min(...timestamps),
      maxX: Math.max(...timestamps),
    };
  }, [data, yAxisMin, yAxisMax]);

  // Animation frame for smooth updates
  const drawChart = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart margins
    const margin = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Grid
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (i * chartHeight) / 5;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (i * chartWidth) / 5;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
      }
    }

    // Data line
    if (data.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x =
          margin.left +
          ((point.timestamp - dataBounds.minX) / (dataBounds.maxX - dataBounds.minX)) * chartWidth;
        const y =
          margin.top +
          chartHeight -
          ((point.value - dataBounds.minY) / (dataBounds.maxY - dataBounds.minY)) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Data points
      ctx.fillStyle = color;
      data.forEach((point) => {
        const x =
          margin.left +
          ((point.timestamp - dataBounds.minX) / (dataBounds.maxX - dataBounds.minX)) * chartWidth;
        const y =
          margin.top +
          chartHeight -
          ((point.value - dataBounds.minY) / (dataBounds.maxY - dataBounds.minY)) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Fill area under curve
      ctx.fillStyle = color + '20';
      ctx.beginPath();
      data.forEach((point, index) => {
        const x =
          margin.left +
          ((point.timestamp - dataBounds.minX) / (dataBounds.maxX - dataBounds.minX)) * chartWidth;
        const y =
          margin.top +
          chartHeight -
          ((point.value - dataBounds.minY) / (dataBounds.maxY - dataBounds.minY)) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, margin.top + chartHeight);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 5; i++) {
      const value = dataBounds.minY + (i * (dataBounds.maxY - dataBounds.minY)) / 5;
      const y = margin.top + chartHeight - (i * chartHeight) / 5;
      ctx.fillText(value.toFixed(1), margin.left - 5, y);
    }

    // X-axis labels (time)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= 2; i++) {
      const timestamp = dataBounds.minX + (i * (dataBounds.maxX - dataBounds.minX)) / 2;
      const x = margin.left + (i * chartWidth) / 2;
      const timeStr = new Date(timestamp).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      ctx.fillText(timeStr, x, margin.top + chartHeight + 5);
    }

    // Chart title
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${title} ${unit ? `(${unit})` : ''}`, margin.left, 5);

    // Latest value
    if (data.length > 0) {
      const latestValue = data[data.length - 1]?.value;
      if (latestValue !== undefined) {
        ctx.fillStyle = color;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(latestValue.toFixed(2), width - margin.right, 5);
      }
    }

    // Hovered point tooltip
    if (hoveredPoint) {
      const tooltipWidth = 80;
      const tooltipHeight = 40;
      const tooltipX = Math.min(hoveredPoint.x + 10, width - tooltipWidth);
      const tooltipY = Math.max(hoveredPoint.y - tooltipHeight - 10, 0);

      // Tooltip background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

      // Tooltip text
      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Value: ${hoveredPoint.value.toFixed(2)}${unit}`, tooltipX + 5, tooltipY + 5);
      ctx.fillText(
        `Time: ${new Date(data[0]?.timestamp || 0).toLocaleTimeString()}`,
        tooltipX + 5,
        tooltipY + 20
      );
    }
  }, [data, dataBounds, width, height, color, title, unit, showGrid, hoveredPoint]);

  // Draw chart when data changes
  useEffect(() => {
    if (animated) {
      const animate = () => {
        drawChart();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      drawChart();
    }

    // Return cleanup function (optional)
    return () => {};
  }, [drawChart, animated]);

  // Handle mouse events for interactivity
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest data point
    const margin = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let closestPoint = null;
    let minDistance = Infinity;

    data.forEach((point) => {
      const pointX =
        margin.left +
        ((point.timestamp - dataBounds.minX) / (dataBounds.maxX - dataBounds.minX)) * chartWidth;
      const pointY =
        margin.top +
        chartHeight -
        ((point.value - dataBounds.minY) / (dataBounds.maxY - dataBounds.minY)) * chartHeight;

      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));

      if (distance < minDistance && distance < 20) {
        minDistance = distance;
        closestPoint = { x: pointX, y: pointY, value: point.value };
      }
    });

    setHoveredPoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}
