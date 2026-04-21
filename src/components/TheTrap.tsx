import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, standardHillClimbing } from '../lib/algorithms';
import * as THREE from 'three';

const TheTrap: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const terrainFn = useMemo(() => (x: number, y: number) => {
    const globalMax = gaussian(x, y, 2, 2, 5, 2);
    const localMax = gaussian(x, y, -2, -2, 3, 1.5);
    return globalMax + localMax;
  }, []);

  const heatmapFn = useMemo(() => (x: number, y: number) => {
    if (!showHeatmap) return new THREE.Color(0x334155); // Default terrain color
    
    // Better approximation of the basin of attraction
    const g = gaussian(x, y, 2, 2, 5, 2);
    const l = gaussian(x, y, -2, -2, 3, 1.5);
    
    // Muted Success (Greenish) and Muted Danger (Reddish)
    return g > l ? new THREE.Color(0x2d4a3e) : new THREE.Color(0x4a2d2d);
  }, [showHeatmap]);

  const paths = useMemo(() => {
    // Success zone start (roughly x+y > 0)
    const successStart = { 
      x: 0.5 + Math.random() * 3, 
      y: 0.5 + Math.random() * 3 
    };
    // Danger zone start (roughly x+y < 0)
    const dangerStart = { 
      x: -0.5 - Math.random() * 3, 
      y: -0.5 - Math.random() * 3 
    };
    return [
      standardHillClimbing(successStart, terrainFn),
      standardHillClimbing(dangerStart, terrainFn)
    ];
  }, [terrainFn, resetKey]);

  return (
    <AlgorithmView
      title="The Trap: The Shortcoming of Greed"
      description="The standard hill climber is efficient, but it has a fatal flaw: it has no foresight and no memory. It blindly assumes that the immediate upward slope will lead to the highest overall peak. This introduces the concept of the Local Maximum versus the Global Maximum. A Local Maximum is a peak that is higher than its immediate surroundings, but lower than the true highest peak on the map (the Global Maximum). If a greedy algorithm starts on the slope of a Local Maximum, it will climb to the top, look around, see that every step is downward, and declare victory—completely unaware of the massive mountain just across the valley."
      terrainFn={terrainFn}
      heatmapFn={heatmapFn}
      paths={paths}
      color="#60a5fa"
      multiColors={['#22c55e', '#ef4444']}
      onReset={() => setResetKey(prev => prev + 1)}
    >
      <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <input 
            type="checkbox" 
            checked={showHeatmap} 
            onChange={(e) => setShowHeatmap(e.target.checked)} 
          />
          Show Success/Danger Zones
        </label>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} /> Success Walker
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /> Trapped Walker
          </div>
        </div>
      </div>
    </AlgorithmView>
  );
};

export default TheTrap;
