import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, randomRestarts, stochasticHillClimbing, localBeamSearch, simulatedAnnealing, smoothNoise } from '../lib/algorithms';

const tabs = [
  { id: 'restarts', label: 'Random Restarts', color: '#c084fc' },
  { id: 'beam', label: 'Local Beam Search', color: '#4ade80' },
  { id: 'stochastic', label: 'Stochastic', color: '#fb923c' },
  { id: 'annealing', label: 'Simulated Annealing', color: '#f87171' },
];

const TheArsenal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('restarts');
  const [resetKey, setResetKey] = useState(0);

  // Define terrains for each algorithm to showcase their features
  const terrains = useMemo(() => {
    const restartsTerrain = (x: number, y: number) => 
      gaussian(x, y, 3, 3, 5, 2) + gaussian(x, y, -3, -3, 4, 1.5) + gaussian(x, y, 3, -3, 3, 1);

    const stochasticTerrain = (x: number, y: number) => 
      gaussian(x, y, 0, 0, 5, 4) + (smoothNoise(x, y, 42) * 0.4);

    return {
      restarts: restartsTerrain,
      beam: restartsTerrain,
      stochastic: stochasticTerrain,
      annealing: stochasticTerrain
    };
  }, []);

  const terrainFn = terrains[activeTab as keyof typeof terrains];

  const results = useMemo(() => {
    const start = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
    const currentTerrain = terrains[activeTab as keyof typeof terrains];
    
    const info: any = {
      restarts: {
        title: 'Random Restarts',
        description: 'The Concept: Brute Force. If dropping a walker in one spot might lead to a trap, why not drop dozens of walkers randomly across the map and see which one ends up the highest? The Trade-off: It is computationally expensive. You are running the entire algorithm multiple times from scratch.',
        paths: randomRestarts(currentTerrain, 12)
      },
      beam: {
        title: 'Local Beam Search',
        description: 'The Concept: Teamwork. We drop N number of walkers. At each step, all walkers look at their neighbors. The algorithm then picks the N absolute best positions from all the neighbors combined, and teleports the walkers to those spots. If one walker finds a great hill, the other walkers will abandon their poor positions to join it. The Trade-off: Walkers can suffer from groupthink. If they all clump together on a local maximum early on, they will all get stuck together.',
        paths: localBeamSearch(8, currentTerrain)
      },
      stochastic: {
        title: 'Stochastic Hill Climbing',
        description: 'The Concept: Injecting Randomness. Instead of always choosing the absolute steepest upward step, this algorithm picks a random neighboring step. It has a higher probability of picking steeper steps, but occasionally it will pick a slight incline. This "wobble" can sometimes help it bypass minor bumps that would trap a strict greedy algorithm. The Trade-off: Slower to converge. It takes a meandering path to the top rather than a straight line.',
        paths: [stochasticHillClimbing(start, currentTerrain)]
      },
      annealing: {
        title: 'Simulated Annealing',
        description: 'The Concept: Controlled Chaos. Inspired by metallurgy (heating and cooling metals), this walker starts out "hot." When it is hot, it will frequently accept downward steps, allowing it to walk right out of a local maximum trap. Over time, the algorithm "cools" down. As it cools, it accepts fewer and fewer downward steps, eventually turning into a standard greedy climber once it is "cold" and homing in on the peak. The Trade-off: Requires careful tuning of the "cooling schedule." Cool too fast, and it gets trapped. Cool too slow, and it takes forever to finish.',
        paths: [simulatedAnnealing(start, currentTerrain)]
      }
    };
    return info[activeTab];
  }, [activeTab, terrains, resetKey]);

  return (
    <AlgorithmView
      title={`Escaping the Trap: ${results.title}`}
      description={results.description}
      terrainFn={terrainFn}
      paths={results.paths}
      color={tabs.find(t => t.id === activeTab)!.color}
      onReset={() => setResetKey(prev => prev + 1)}
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResetKey(0); }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              background: activeTab === tab.id ? tab.color : 'var(--bg-secondary)',
              color: activeTab === tab.id ? '#0f172a' : 'var(--text-primary)',
              fontSize: '0.8rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </AlgorithmView>
  );
};

export default TheArsenal;
