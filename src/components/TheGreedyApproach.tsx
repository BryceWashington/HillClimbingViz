import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, standardHillClimbing } from '../lib/algorithms';

const TheGreedyApproach: React.FC = () => {
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
      title={<>The Greedy Approach: <span style={{ color: '#6366f1' }}>Standard Hill Climbing</span></>}
      description={
        <>
          If you are climbing a mountain, the simplest way to walk to the peak to look at the ground directly around your feet, step in the direction that goes up the steepest, and repeat. This is exactly what the standard Hill Climbing algorithm does.
          <br /><br />
          It is known as a "greedy" algorithm because it only cares about immediate, short-term gains. The logic is simple: look at your immediate surroundings, take a step towards the neighboring position that's the highest, and stop completely when all neighboring positions lower than your current position.
          <br /><br />
          This simple, yet effective algorithm works amazingly on smooth predicatable terrain as shown in the visualization to the left. Use the play button to watch as the walker easily climbs up to the peak of the hill.
          <br /><br />
          <span style={{ fontSize: '0.9rem', color: '#64748b', opacity: 0.8 }}>
            (Hint: For this and all following visualizations, use the restart button to respawn the walkers in random starting location and use your mouse to interact with the 3D terrain or scrub the line chart.)
          </span>
        </>
      }
      terrainFn={terrainFn}
      paths={[path]}
      color="#60a5fa"
      onReset={() => setResetKey(prev => prev + 1)}
    />
  );
};

export default TheGreedyApproach;
