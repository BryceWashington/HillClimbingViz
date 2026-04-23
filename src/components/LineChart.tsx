import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineChartProps {
  data: { x: number; y: number }[];
  multiData?: { x: number; y: number }[][];
  multiLineColors?: string[];
  color?: string;
  width?: number; // Base width for aspect ratio
  height?: number; // Base height for aspect ratio
  useGradient?: boolean;
  onScrub?: (index: number) => void;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  multiData, 
  multiLineColors, 
  color = '#38bdf8', 
  width = 500, 
  height = 200, 
  useGradient, 
  onScrub 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Linear Gradient
    if (useGradient) {
      const linearGradient = defs.append('linearGradient')
        .attr('id', 'line-gradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%');
      linearGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f87171');
      linearGradient.append('stop').attr('offset', '100%').attr('stop-color', '#22d3ee');
    }

    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const allPaths = multiData || [data];
    const allPoints = allPaths.flatMap(p => p);
    const xMax = Math.max(10, d3.max(allPoints, d => d.x) || 0);
    const yMin = (d3.min(allPoints, d => d.y) ?? 0) - 0.5;
    const yMax = (d3.max(allPoints, d => d.y) ?? 6) + 0.5;

    const x = d3.scaleLinear().domain([0, xMax]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

    // Axis groups
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('color', 'rgba(255, 255, 255, 0.1)');

    const yAxis = g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', 'rgba(255, 255, 255, 0.1)');

    xAxis.select('.domain').attr('stroke-opacity', 0.2);
    yAxis.select('.domain').attr('stroke-opacity', 0.2);

    const line = d3.line<{ x: number; y: number }>()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);

    if (multiData) {
      multiData.forEach((pathData, i) => {
        const strokeColor = multiLineColors ? multiLineColors[i] : color;
        const strokeOpacity = multiLineColors ? 0.8 : 0.2;
        
        g.append('path')
          .datum(pathData)
          .attr('fill', 'none')
          .attr('stroke', strokeColor)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', strokeOpacity)
          .attr('style', multiLineColors ? 'filter: url(#glow)' : '')
          .attr('d', line);
      });
    } else {
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', useGradient ? 'url(#line-gradient)' : color)
        .attr('stroke-width', 3)
        .attr('style', 'filter: url(#glow)')
        .attr('d', line);
    }

    if (onScrub && data.length > 0) {
      const overlay = g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair');

      const bisect = d3.bisector((d: any) => d.x).left;
      const focus = g.append('line')
        .attr('y1', 0).attr('y2', innerHeight)
        .attr('stroke', 'rgba(255, 255, 255, 0.4)')
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0);

      overlay.on('mousemove', (event) => {
        const mouseX = d3.pointer(event)[0];
        const xValue = x.invert(mouseX);
        const index = Math.max(0, Math.min(data.length - 1, bisect(data, xValue)));
        if (data[index]) {
          focus.attr('x1', x(data[index].x)).attr('x2', x(data[index].x)).style('opacity', 1);
          xAxis.attr('color', 'rgba(255, 255, 255, 0.4)');
          yAxis.attr('color', 'rgba(255, 255, 255, 0.4)');
          onScrub(index);
        }
      });
      overlay.on('mouseleave', () => {
        focus.style('opacity', 0);
        xAxis.attr('color', 'rgba(255, 255, 255, 0.1)');
        yAxis.attr('color', 'rgba(255, 255, 255, 0.1)');
      });
    }
  }, [data, multiData, multiLineColors, color, width, height, useGradient, onScrub]);

  return <svg 
    ref={svgRef} 
    viewBox={`0 0 ${width} ${height}`} 
    preserveAspectRatio="xMidYMid meet" 
    style={{ width: '100%', height: 'auto', overflow: 'visible' }} 
  />;
};

export default LineChart;
