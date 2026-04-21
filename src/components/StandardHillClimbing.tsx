import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, standardHillClimbing } from '../lib/algorithms';

const StandardHillClimbing: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);

  const terrainFn = useMemo(() => (x: number, y: number) => gaussian(x, y, 0, 0, 5, 3), []);
  
  const path = useMemo(() => {
    // Generate a random start within bounds [-4, 4]
    const start = { 
      x: (Math.random() - 0.5) * 8, 
      y: (Math.random() - 0.5) * 8 
    };
    return standardHillClimbing(start, terrainFn);
  }, [terrainFn, resetKey]);

  return (
    <AlgorithmView
      title="Standard Hill Climbing: The Greedy Approach"
      description="The most basic way to find the top of a mountain in the fog is to look at the ground directly around your feet, step in the direction that goes up the steepest, and repeat. This is Standard Hill Climbing. It is known as a 'Greedy' algorithm because it only cares about immediate, short-term gains. The rule is simple: look at your immediate neighbors, take a step toward the highest one, and stop completely when all neighbors are lower than your current position."
      terrainFn={terrainFn}
      paths={[path]}
      color="#60a5fa"
      onReset={() => setResetKey(prev => prev + 1)}
    />
  );
};

export default StandardHillClimbing;
