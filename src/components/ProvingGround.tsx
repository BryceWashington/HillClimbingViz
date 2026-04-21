import React, { useState, useEffect, useMemo } from 'react';
import TerrainViz from './TerrainViz';
import LineChart from './LineChart';
import { gaussian, standardHillClimbing, stochasticHillClimbing, simulatedAnnealing, randomRestarts, localBeamSearch, smoothNoise } from '../lib/algorithms';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { TerrainFunction } from '../lib/algorithms';

const ALGO_COLORS: { [key: string]: string } = {
  standard: '#60a5fa',
  stochastic: '#fb923c',
  annealing: '#f87171',
  restarts: '#c084fc',
  beam: '#4ade80'
};

const ProvingGround: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [scrubIdx, setScrubIdx] = useState<number>(-1);
  const [resetKey, setResetKey] = useState(0);

  // Sandbox State
  const [noise, setNoise] = useState(0.1);
  const [peaks, setPeaks] = useState(3);

  // Generate random peak positions and noise phases when resetKey changes
  const terrainConfig = useMemo(() => {
    const generatedPeaks: { x: number; y: number; amplitude: number }[] = [];
    const minDistance = 3.0;
    const maxAttempts = 50;

    for (let i = 0; i < peaks; i++) {
      let attempts = 0;
      while (attempts < maxAttempts) {
        const x = (Math.random() - 0.5) * 8;
        const y = (Math.random() - 0.5) * 8;
        
        const tooClose = generatedPeaks.some(p => 
          Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < minDistance
        );

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
      startPos: { 
        x: (Math.random() - 0.5) * 8, 
        y: (Math.random() - 0.5) * 8 
      }
    };
  }, [peaks, resetKey]);

  const terrainFn: TerrainFunction = useMemo(() => (x, y) => {
    let z = 0;
    terrainConfig.peakPositions.forEach(p => {
      z += gaussian(x, y, p.x, p.y, p.amplitude, 2);
    });
    
    // Multi-octave "pseudo-random" noise summation using smoothNoise
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
      }, 100);
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
    // For the race chart, we'll show the 'best' path for each algorithm type to keep it readable
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

  const multiColors = useMemo(() => {
    return Object.keys(pathsMap).map(key => ALGO_COLORS[key]);
  }, [pathsMap]);

  const primaryChartData = multiChartData[0].slice(0, scrubIdx !== -1 ? multiChartData[0].length : currentStepIdx + 1);

  return (
    <section className="section">
      <div className="container">
        <h2>The Grand Prix Sandbox</h2>
        <p>Benchmark all algorithms against a custom, procedurally generated terrain. Adjust the ruggedness and number of peaks to see how different strategies perform under various levels of difficulty.</p>
        
        {/* Sandbox Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '2rem 0', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Noise/Ruggedness ({noise.toFixed(2)})</label>
            <input 
              type="range" 
              min="0" 
              max="0.5" 
              step="0.01" 
              value={noise} 
              onChange={(e) => setNoise(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Number of Peaks ({peaks})</label>
            <input 
              type="range" 
              min="1" 
              max="4" 
              step="1" 
              value={peaks} 
              onChange={(e) => setPeaks(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: '500px' }}>
          <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <TerrainViz terrainFn={terrainFn} walkers={currentWalkers} />
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)', color: '#10b981', fontFamily: 'monospace' }}>
              {`Frame ${activeIdx} / ${maxSteps}`}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Race Trace (Hover to Scrub)</h3>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChart 
                  data={primaryChartData}
                  multiData={multiChartData.map(p => p.slice(0, scrubIdx !== -1 ? p.length : currentStepIdx + 1))}
                  multiLineColors={multiColors}
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
                  {isPlaying ? 'Pause' : 'Start Race'}
                </button>
                <button 
                  onClick={() => {
                    setCurrentStepIdx(0);
                    setScrubIdx(-1);
                    setIsPlaying(false);
                    setResetKey(prev => prev + 1);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <RotateCcw size={18} /> Reset (Randomize)
                </button>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.entries(ALGO_COLORS).map(([name, color]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ textTransform: 'capitalize' }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProvingGround;
