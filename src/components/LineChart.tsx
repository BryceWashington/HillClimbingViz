import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
  data: { x: number; y: number }[];
  multiData?: { x: number; y: number }[][];
  multiLineColors?: string[];
  color?: string;
  width?: number;
  height?: number;
  useGradient?: boolean;
  onScrub?: (index: number) => void;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  multiData, 
  multiLineColors, 
  color = '#60a5fa', 
  width = 300, 
  height = 150, 
  useGradient, 
  onScrub 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Define gradient if needed
    if (useGradient) {
      const gradientId = 'line-gradient';
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ef4444'); // Red (Hot)

      linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#06b6d4'); // Cyan (Cold)
    }

    const margin = { top: 15, right: 15, bottom: 25, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const allPaths = multiData || [data];
    const allPoints = allPaths.flatMap(p => p);
    const xMax = Math.max(10, d3.max(allPoints, d => d.x) || 0);
    
    // Dynamic Y domain with padding to avoid cut-off
    const yMin = d3.min(allPoints, d => d.y) ?? 0;
    const yMax = d3.max(allPoints, d => d.y) ?? 6;
    const yPadding = Math.max((yMax - yMin) * 0.1, 0.5);

    const x = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([innerHeight, 0]);

    // Axes with dark mode colors
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('color', '#94a3b8');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#94a3b8');

    const line = d3.line<{ x: number; y: number }>()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);

    // Render multi-paths
    if (multiData) {
      multiData.forEach((pathData, i) => {
        // Use multiLineColors if available, otherwise default with low opacity
        const strokeColor = multiLineColors ? multiLineColors[i] : color;
        const strokeOpacity = multiLineColors ? 1.0 : 0.4;
        const strokeWidth = multiLineColors ? 2.5 : 1.5;

        g.append('path')
          .datum(pathData)
          .attr('fill', 'none')
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth)
          .attr('stroke-opacity', strokeOpacity)
          .attr('d', line);
      });
    } else {
      // Single primary path
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', useGradient ? 'url(#line-gradient)' : color)
        .attr('stroke-width', 2.5)
        .attr('d', line);
    }

    // Scrubbing overlay
    if (onScrub && data.length > 0) {
      const overlay = g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair');

      const bisect = d3.bisector((d: any) => d.x).left;
      const focus = g.append('line')
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#f8fafc')
        .attr('stroke-dasharray', '3,3')
        .style('opacity', 0);

      overlay.on('mousemove', (event) => {
        const mouseX = d3.pointer(event)[0];
        const xValue = x.invert(mouseX);
        const index = Math.max(0, Math.min(data.length - 1, bisect(data, xValue)));
        const d = data[index];
        
        if (d) {
          focus.attr('x1', x(d.x)).attr('x2', x(d.x)).style('opacity', 1);
          onScrub(index);
        }
      });

      overlay.on('mouseleave', () => {
        focus.style('opacity', 0);
      });
    }
  }, [data, multiData, multiLineColors, color, width, height, useGradient, onScrub]);

  return <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible' }} />;
};

export default LineChart;
