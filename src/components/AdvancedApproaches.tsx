import React, { useState, useMemo } from 'react';
import AlgorithmView from './AlgorithmView';
import { gaussian, randomRestarts, stochasticHillClimbing, localBeamSearch, simulatedAnnealing, smoothNoise } from '../lib/algorithms';

const tabs = [
  { id: 'restarts', label: 'Random Restarts', color: '#c084fc' },
  { id: 'beam', label: 'Local Beam Search', color: '#4ade80' },
  { id: 'stochastic', label: 'Stochastic', color: '#fb923c' },
  { id: 'annealing', label: 'Simulated Annealing', color: '#f87171' },
];

const AdvancedApproaches: React.FC = () => {
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
        description: (
          <>
            If dropping a walker in one spot might lead to getting trapped at a local maximum, why not drop dozens of walkers randomly across the map and see which one ends up the highest? The more walkers, the more likely one will reach the global maximum. This is usually done in series, but for visualization purposes, will be shown in parallel.
            <br /><br />
            The Trade-off: It is computationally expensive. You are running the entire algorithm multiple times. This approach becomes unfeasible once millions of walkers are needed to find the global maximum.
          </>
        ),
        paths: randomRestarts(currentTerrain, 12)
      },
      beam: {
        title: 'Local Beam Search',
        description: (
          <>
            Instead of using multiple independent walkers, lets run them in parallel and have them work together. We'll start with N number of walkers, and at each step, all walkers look at their surroundings and the algorithm will pick the N best positions from all the walkers neighboring positons combined. So if one walker finds a great hill, the other walkers will abandon their worst positions and join it.
            <br /><br />
            The Trade-off: Walkers can suffer from groupthink. If they all clump together on a local maximum early on, they will all get stuck together, and ultimately fail to find the global maximum.
          </>
        ),
        paths: localBeamSearch(8, currentTerrain)
      },
      stochastic: {
        title: 'Stochastic Hill Climbing',
        description: (
          <>
            What if we inject a bit of randomness? Instead of always choosing the absolute steepest upward step, this algorithm picks a random neighboring positions. It has a higher probability of taking steeper steps, but occasionally it will pick only slight inclines. This can sometimes help it bypass minor bumps that would trap a strict greedy algorithm.
            <br /><br />
            The Trade-off: It's slower to converge. It takes a random path to the top rather than a straight line, which is often less efficient. It will also still suffer from getting stuck at local maximums if it reaches one by chance.
          </>
        ),
        paths: [stochasticHillClimbing(start, currentTerrain)]
      },
      annealing: {
        title: 'Simulated Annealing',
        description: (
          <>
            Now let's take the randomness of Stochastic Hill Climbing and make it even more chaotic. Inspired by the process of annealing, this algorithm starts out hot and will frequently accept downward steps, allowing it to escape local maximums. But over time, the algorithm cools down. As it cools, it accepts downward steps less often, slowly turning into a standard greedy climber once it is cold. This allows the walker to first explore the terrain and then begin to exploit it.
            <br /><br />
            The Trade-off: Requires careful tuning of the cooling schedule. Cool too fast, and it gets trapped, but cool too slow, and it takes forever to finish.
            <br />
            <span style={{ fontSize: '0.9rem', color: '#64748b', opacity: 0.8 }}>
            (The color on the chart represents the "temperature" of the walker at that step)
            </span>
          </>
        ),
        paths: [simulatedAnnealing(start, currentTerrain)]
      }
    };
    return info[activeTab];
  }, [activeTab, terrains, resetKey]);

  return (
    <AlgorithmView
        title={<>Escaping Local Maximums: <span style={{ color: '#6366f1' }}>Advanced Approaches</span></>}
        description={
          <>
            The terrain of real-world problems are rarely simple slopes with a single peak. Rather they are filled with tons of local peaks where the basic hill climbing algorithm will get trapped as previously shown.
            <br /><br />
            To remedy this, we can make modifications upon our basic algorithm, such as introducing multiple starting points, collaborative searching, or controlled randomness, allowing it to be capable of navigating much more complex landscapes to find the true global maximum.
            <br /><br />
            Use the tabs below to explore 4 common modifications to the basic hill climbing algorithm.
          </>
        }
      terrainFn={terrainFn}
      paths={results.paths}
      color={tabs.find(t => t.id === activeTab)!.color}
      onReset={() => setResetKey(prev => prev + 1)}
    >
      <div style={{ marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResetKey(0); }}
              style={{
                padding: '0.4rem 0.8rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: activeTab === tab.id ? tab.color : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === tab.id ? '#020617' : 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div key={activeTab} style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: tabs.find(t => t.id === activeTab)!.color }}>{results.title}</h3>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-secondary)', maxWidth: '60ch' }}>{results.description}</p>
      </div>
    </AlgorithmView>
  );
};

export default AdvancedApproaches;
