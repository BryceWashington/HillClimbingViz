import React, { useState, useEffect, useMemo } from 'react';
import TerrainViz from './TerrainViz';
import LineChart from './LineChart';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { Step, TerrainFunction } from '../lib/algorithms';
import * as THREE from 'three';

interface AlgorithmViewProps {
  title: React.ReactNode;
  description: React.ReactNode;
  terrainFn: TerrainFunction;
  heatmapFn?: (x: number, y: number) => THREE.Color;
  paths: Step[][];
  color: string;
  multiColors?: string[];
  onReset: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const AlgorithmView: React.FC<AlgorithmViewProps> = ({ 
  title, 
  description, 
  terrainFn, 
  heatmapFn,
  paths, 
  color, 
  multiColors,
  onReset,
  children,
  footer
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [scrubIdx, setScrubIdx] = useState<number>(-1);

  const maxSteps = Math.max(...paths.map(p => p.length));
  const activeIdx = scrubIdx !== -1 ? scrubIdx : currentStepIdx;

  useEffect(() => {
    let timer: number;
    if (isPlaying && currentStepIdx < maxSteps - 1) {
      timer = window.setTimeout(() => {
        setCurrentStepIdx(prev => prev + 1);
      }, 80);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, maxSteps]);

  const getWalkerColor = (step: Step, baseColor: string) => {
    if (step.temperature !== undefined) {
      const t = Math.min(100, step.temperature) / 100;
      const c = new THREE.Color(0x22d3ee); // Cyan
      const hot = new THREE.Color(0xf87171); // Red
      return `#${hot.lerp(c, 1 - t).getHexString()}`;
    }
    return baseColor;
  };

  const currentWalkers = paths.map((path, i) => {
    const idx = Math.min(activeIdx, path.length - 1);
    const step = path[idx];
    const walkerColor = multiColors?.[i] ?? getWalkerColor(step, color);
    return { id: `w-${i}`, ...step.point, color: walkerColor };
  });

  const chartData = paths[0].map((s, i) => ({ x: i, y: s.altitude }));
  const multiChartData = useMemo(() => {
    if (paths.length <= 1) return undefined;
    return paths.map(path => {
      const mapped = path.map((s, i) => ({ x: i, y: s.altitude }));
      if (mapped.length < maxSteps) {
        const lastVal = mapped[mapped.length - 1].y;
        for (let i = mapped.length; i < maxSteps; i++) {
          mapped.push({ x: i, y: lastVal });
        }
      }
      return mapped;
    });
  }, [paths, maxSteps]);

  const activeStep = paths[0][Math.min(activeIdx, paths[0].length - 1)];
  const hasTemperature = useMemo(() => paths[0].some(s => s.temperature !== undefined), [paths]);

  return (
    <section className="section">
      <div className="container">
        <h2>{title}</h2>
        <div className="split-layout">
          <div className="content-half">
            <div className="section-description" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>{description}</div>
            
            {children}

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => { setIsPlaying(!isPlaying); setScrubIdx(-1); }}
                style={{ background: isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)', borderColor: isPlaying ? '#ef4444' : '#38bdf8', color: isPlaying ? '#ef4444' : '#38bdf8', minWidth: '140px' }}
              >
                {isPlaying ? <Pause size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> : <Play size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={() => { setCurrentStepIdx(0); setScrubIdx(-1); setIsPlaying(false); onReset(); }}>
                <RotateCcw size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Reset
              </button>
            </div>

            {footer}
          </div>
          
          <div className="viz-half">
            <div className="terrain-container">
              <TerrainViz terrainFn={terrainFn} heatmapFn={heatmapFn} walkers={currentWalkers} color={color} />
            </div>
            <div className="chart-container">
              <LineChart 
                data={chartData.slice(0, scrubIdx !== -1 ? chartData.length : currentStepIdx + 1)} 
                multiData={multiChartData?.map(p => p.slice(0, scrubIdx !== -1 ? p.length : currentStepIdx + 1))}
                multiLineColors={multiColors}
                color={color} 
                useGradient={hasTemperature}
                width={600}
                height={160}
                onScrub={(idx) => {
                  setIsPlaying(false);
                  setScrubIdx(idx);
                }}
              />
              
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#10b981', fontFamily: 'monospace', letterSpacing: '0.05em', textAlign: 'center' }}>
                {activeStep ? (
                  <>
                    <span style={{ color: 'var(--text-secondary)' }}>POS </span> 
                    X:{activeStep.point.x.toFixed(2)} Y:{activeStep.point.y.toFixed(2)} 
                    <span style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>ALT </span> 
                    {activeStep.altitude.toFixed(3)}
                    {activeStep.temperature !== undefined && (
                      <>
                        <span style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>TEMP </span> 
                        {activeStep.temperature.toFixed(1)}°
                      </>
                    )}
                  </>
                ) : 'INITIALIZING...'}
              </div>

              <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Drag to rotate • Scroll to zoom • Hover chart to scrub
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AlgorithmView;
