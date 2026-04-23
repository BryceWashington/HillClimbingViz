import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, standardHillClimbing } from '../lib/algorithms';
import * as THREE from 'three';

const TheFlaw: React.FC = () => {
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
      title={<>The Flaw: <span style={{ color: '#6366f1' }}>The Shortcoming of Greed</span></>}
      description={
        <>
          At first, the standard hill climbing algorithm seems great, but it has fatal flaw. It assumes that any upward slope will lead to the highest overall peak. This is true for cases like the previous example, but in reality this is rarely the case.
          <br /><br />
          This is where the concepts of local maximums and global maximum comes into play. A local maximum is a peak that is higher than its immediate surroundings, but still lower than the highest peak on the map, which is called the global maximum. If a simple greedy algorithm starts on the slope of a local maximum, it will climb to the top, look around, see that every step is downward, and terminate, completely unaware of the much higher peak just across the valley.
          <br /><br />
          As you can see on the left, all the area shown in red is where a simple greedy hill climber will always fail to reach the global maximum, as it will get stuck at the local peak. In contrast, the green area is where are our greedy walker will succeed at finding the global max, showing that a walkers success is completely determined by the walkers starting position.
        </>
      }
      terrainFn={terrainFn}
      heatmapFn={heatmapFn}
      paths={paths}
      color="#60a5fa"
      multiColors={['#22c55e', '#ef4444']}
      onReset={() => setResetKey(prev => prev + 1)}
      footer={
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={(e) => setShowHeatmap(e.target.checked)} 
            />
            Show Success/Failure Zones
          </label>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} /> Successful Walker
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} /> Failed Walker
            </div>
          </div>
        </div>
      }
    />
  );
};

export default TheFlaw;
