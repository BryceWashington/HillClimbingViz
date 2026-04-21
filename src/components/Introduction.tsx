import React from 'react';
import TerrainViz from './TerrainViz';
import { gaussian } from '../lib/algorithms';

const Introduction: React.FC = () => {
  const terrainFn = (x: number, y: number) => gaussian(x, y, 0, 0, 12, 4);

  return (
    <section className="section hero" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div className="content-half">
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '2rem' }}>The Peak and <br/><span style={{ color: '#6366f1' }}>The Valley</span></h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            What is an optimization algorithm? At its core, it is a mathematical engine designed with a single, ultimate goal: finding the absolute best solution among an infinite sea of possibilities. Whether it is routing delivery trucks efficiently, training an artificial intelligence, or designing aerodynamic airplane wings, optimization algorithms are the silent workers finding the best path forward.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            To understand how they work, we can visualize complex, multi-variable problems as a 3D terrain. Imagine you are trying to design the perfect sports car. You have two main choices to adjust: the weight of the car (X-axis) and the horsepower of the engine (Y-axis). The resulting top speed of the car is your score (Z-axis).
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Finding the optimal combination of weight and horsepower is exactly like trying to find the highest physical peak on a mountainous landscape. The higher you climb, the better your solution.
          </p>
        </div>
        <div className="viz-half" style={{ height: '600px', background: '#000', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <TerrainViz terrainFn={terrainFn} interactive={false} autoRotate={true} showLabels={false} />
        </div>
      </div>
    </section>
  );
};

export default Introduction;
