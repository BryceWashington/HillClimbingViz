import React, { useState, useEffect, useMemo } from 'react';
import TerrainViz from './TerrainViz';
import LineChart from './LineChart';
import { gaussian, standardHillClimbing, stochasticHillClimbing, simulatedAnnealing, randomRestarts, localBeamSearch, smoothNoise } from '../lib/algorithms';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { TerrainFunction } from '../lib/algorithms';

const ALGO_COLORS: { [key: string]: string } = {
  standard: '#38bdf8',
  stochastic: '#fb923c',
  annealing: '#f87171',
  restarts: '#c084fc',
  beam: '#4ade80'
};

const TheSandbox: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [scrubIdx, setScrubIdx] = useState<number>(-1);
  const [resetKey, setResetKey] = useState(0);

  const [noise, setNoise] = useState(0.1);
  const [peaks, setPeaks] = useState(3);

  const terrainConfig = useMemo(() => {
    const generatedPeaks: { x: number; y: number; amplitude: number }[] = [];
    const minDistance = 3.0;
    const maxAttempts = 50;

    for (let i = 0; i < peaks; i++) {
      let attempts = 0;
      while (attempts < maxAttempts) {
        const x = (Math.random() - 0.5) * 8;
        const y = (Math.random() - 0.5) * 8;
        const tooClose = generatedPeaks.some(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < minDistance);
        if (!tooClose) {
          generatedPeaks.push({ x, y, amplitude: 3 + Math.random() * 3 });
          break;
        }
        attempts++;
      }
    }

    return {
      peakPositions: generatedPeaks,
      noisePhases: Array.from({ length: 4 }, () => Math.random() * Math.PI * 2),
      startPos: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 }
    };
  }, [peaks, resetKey]);

  const terrainFn: TerrainFunction = useMemo(() => (x, y) => {
    let z = 0;
    terrainConfig.peakPositions.forEach(p => {
      z += gaussian(x, y, p.x, p.y, p.amplitude, 2);
    });
    const totalNoise = smoothNoise(x, y, terrainConfig.noisePhases[0]) * noise;
    return Math.max(0, z + totalNoise);
  }, [noise, terrainConfig]);

  const pathsMap = useMemo(() => {
    const { startPos } = terrainConfig;
    return {
      standard: [standardHillClimbing(startPos, terrainFn)],
      stochastic: [stochasticHillClimbing(startPos, terrainFn)],
      annealing: [simulatedAnnealing(startPos, terrainFn)],
      restarts: randomRestarts(terrainFn, 5),
      beam: localBeamSearch(3, terrainFn)
    };
  }, [terrainFn, terrainConfig]);

  const maxSteps = useMemo(() => {
    const allPaths = Object.values(pathsMap).flat();
    return Math.max(...allPaths.map(p => p.length));
  }, [pathsMap]);

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

  const currentWalkers = useMemo(() => {
    const walkers: any[] = [];
    Object.entries(pathsMap).forEach(([key, paths]) => {
      paths.forEach((path, i) => {
        const step = path[Math.min(activeIdx, path.length - 1)];
        walkers.push({ id: `${key}-${i}`, ...step.point, color: ALGO_COLORS[key] });
      });
    });
    return walkers;
  }, [pathsMap, activeIdx]);

  const multiChartData = useMemo(() => {
    const bestPaths = Object.values(pathsMap).map(paths => {
      return [...paths].sort((a, b) => b[b.length-1].altitude - a[a.length-1].altitude)[0];
    });
    const data = bestPaths.map(path => path.map((s, i) => ({ x: i, y: s.altitude })));
    return data.map(mapped => {
      if (mapped.length < maxSteps) {
        const lastVal = mapped[mapped.length - 1].y;
        for (let i = mapped.length; i < maxSteps; i++) {
          mapped.push({ x: i, y: lastVal });
        }
      }
      return mapped;
    });
  }, [pathsMap, maxSteps]);

  const multiColors = useMemo(() => Object.keys(pathsMap).map(key => ALGO_COLORS[key]), [pathsMap]);
  const primaryChartData = multiChartData[0].slice(0, scrubIdx !== -1 ? multiChartData[0].length : currentStepIdx + 1);

  return (
    <section className="section">
      <div className="container">
        <h2 style={{ fontSize: '3.5rem', marginBottom: '4rem' }}>The <span style={{ color: '#6366f1' }}>Sandbox</span></h2>
        <div className="split-layout">
          <div className="content-half">
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
              Now it is your turn to benchmark all algorithms against your own custom, procedurally generated terrain. Adjust the ruggedness and number of peaks to see how different strategies perform under various levels of difficulty.
            </p>
            
            <div style={{ display: 'grid', gap: '2rem', marginBottom: '4rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Noise Intensity ({noise.toFixed(2)})</label>
                <input type="range" min="0" max="0.5" step="0.01" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Number of Peaks ({peaks})</label>
                <input type="range" min="1" max="4" step="1" value={peaks} onChange={(e) => setPeaks(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
              <button 
                onClick={() => { setIsPlaying(!isPlaying); setScrubIdx(-1); }}
                style={{ background: isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', borderColor: isPlaying ? '#ef4444' : '#6366f1', color: isPlaying ? '#ef4444' : '#6366f1', minWidth: '160px' }}
              >
                {isPlaying ? <Pause size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> : <Play size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />}
                {isPlaying ? 'Pause' : 'Start Race'}
              </button>
              <button onClick={() => { setCurrentStepIdx(0); setScrubIdx(-1); setIsPlaying(false); setResetKey(prev => prev + 1); }}>
                <RotateCcw size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Randomize
              </button>
            </div>
          </div>
          
          <div className="viz-half">
            <div className="terrain-container">
              <TerrainViz terrainFn={terrainFn} walkers={currentWalkers} />
            </div>
            <div className="chart-container">
              <LineChart 
                data={primaryChartData}
                multiData={multiChartData.map(p => p.slice(0, scrubIdx !== -1 ? p.length : currentStepIdx + 1))}
                multiLineColors={multiColors}
                width={700}
                height={160}
                onScrub={(idx) => {
                  setIsPlaying(false);
                  setScrubIdx(idx);
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                {Object.entries(ALGO_COLORS).map(([name, color]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
                    {name}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Drag to rotate • Scroll to zoom • Hover chart to scrub
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheSandbox;
