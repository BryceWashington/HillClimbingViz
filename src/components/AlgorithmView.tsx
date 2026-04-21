import React, { useState, useEffect, useMemo } from 'react';
import TerrainViz from './TerrainViz';
import LineChart from './LineChart';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { TerrainFunction, Step } from '../lib/algorithms';
import * as THREE from 'three';

interface AlgorithmViewProps {
  title: string;
  description: string;
  terrainFn: TerrainFunction;
  heatmapFn?: (x: number, y: number) => THREE.Color;
  paths: Step[][]; // Supports multiple walkers
  color: string;
  multiColors?: string[];
  onReset: () => void;
  children?: React.ReactNode;
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
  children 
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
      }, 100);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, maxSteps]);

  const getWalkerColor = (step: Step, baseColor: string) => {
    if (step.temperature !== undefined) {
      // Temperature blending: Red (hot) -> Cyan (cold)
      // temp typically starts at 100 and cools to 0
      const t = Math.min(100, step.temperature) / 100;
      const c = new THREE.Color(0x06b6d4); // Cyan
      const hot = new THREE.Color(0xef4444); // Red
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
      // Pad with last value up to maxSteps
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
        <div style={{ marginBottom: '2rem' }}>
          <h2>{title}</h2>
          <p>{description}</p>
          {children}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: '500px' }}>
          <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <TerrainViz terrainFn={terrainFn} heatmapFn={heatmapFn} walkers={currentWalkers} />
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)', color: '#10b981', fontFamily: 'monospace' }}>
              {activeStep ? (
                <>
                  {`Step ${activeIdx}: X=${activeStep.point.x.toFixed(2)} Y=${activeStep.point.y.toFixed(2)} Alt=${activeStep.altitude.toFixed(2)}`}
                  {activeStep.temperature !== undefined && ` | Temp=${activeStep.temperature.toFixed(1)}`}
                </>
              ) : 'Waiting...'}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Altitude Trace (Hover to Scrub)</h3>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart 
                  data={chartData.slice(0, scrubIdx !== -1 ? chartData.length : currentStepIdx + 1)} 
                  multiData={multiChartData?.map(p => p.slice(0, scrubIdx !== -1 ? p.length : currentStepIdx + 1))}
                  multiLineColors={multiColors}
                  color={color} 
                  useGradient={hasTemperature}
                  width={500}
                  height={250}
                  onScrub={(idx) => {
                    setIsPlaying(false);
                    setScrubIdx(idx);
                  }}
                />
              </div>
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => { setIsPlaying(!isPlaying); setScrubIdx(-1); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: isPlaying ? '#ef4444' : '#6366f1', color: '#fff' }}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button 
                  onClick={() => {
                    setCurrentStepIdx(0);
                    setScrubIdx(-1);
                    setIsPlaying(false);
                    onReset();
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <RotateCcw size={18} /> Reset (Random)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlgorithmView;
