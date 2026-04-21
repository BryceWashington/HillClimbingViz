import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, stochasticHillClimbing, smoothNoise } from '../lib/algorithms';
import type { TerrainFunction } from '../lib/algorithms';

const Synergy: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);

  const terrainFn: TerrainFunction = useMemo(() => (x, y) => {
    // A simplified rugged terrain: one clear global max with some distractive local ridges
    const globalMax = gaussian(x, y, 3, 3, 5, 3);
    const noise = smoothNoise(x, y, 123) * 0.4;
    return Math.max(0, globalMax + noise);
  }, []);

  const paths = useMemo(() => {
    // Hybrid: Random Restarts (multiple attempts) with Stochastic (randomized steps)
    const numRestarts = 10;
    const allPaths = [];
    for (let i = 0; i < numRestarts; i++) {
      const start = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      };
      allPaths.push(stochasticHillClimbing(start, terrainFn, 0.15, 200));
    }
    return allPaths;
  }, [terrainFn, resetKey]);

  return (
    <AlgorithmView
      title="Synergy: The Best of All Worlds"
      description="In the real world of computer science, these modifications aren't mutually exclusive. Engineers combine them to create robust optimization tools. By combining Stochastic Search (randomized steps) with Random Restarts (multiple attempts), you create a hybrid algorithm capable of navigating incredibly rugged, noisy datasets without getting trapped in microscopic dips and bumps."
      terrainFn={terrainFn}
      paths={paths}
      color="#c084fc"
      onReset={() => setResetKey(prev => prev + 1)}
    />
  );
};

export default Synergy;
