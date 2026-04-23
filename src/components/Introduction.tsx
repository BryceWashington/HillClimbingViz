import React from 'react';
import TerrainViz from './TerrainViz';
import { gaussian } from '../lib/algorithms';

const Introduction: React.FC = () => {
  const terrainFn = (x: number, y: number) => gaussian(x, y, 0, 0, 8, 4);

  return (
    <section className="section hero">
      <div className="container">
        <div className="layout-hero">
          <div className="content-half">
            <h1 style={{ fontSize: '5rem', lineHeight: '1.1', marginBottom: '4rem' }}>Intro to <br/><span style={{ color: '#6366f1' }}>Optimization Algorithms</span></h1>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  What are optimization algorithms? Simply put, they are algorithms designed to find the best solution to a problem out of a search space of millions of possibilities. These algorithms are the fundamental logic behind everyday tools, like navigation apps, as well as complex systems, like supply chain management or AI training.
                </p>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  To understand how they work, we can map real-world problems onto a physical landscape. Let’s say you are trying to bake the perfect batch of chocolate chip cookies. You can map the two main baking parameters to 3D coordinates: the oven temperature to the X-axis and the baking time to the Y-axis. The resulting "deliciousness" of the cookies will dictate the terrain's elevation (Z-axis). On this terrain, if the oven is too hot or the time is too long, the cookies burn. If the oven is too cool or the time is too short, you get raw dough. Both of these mistakes are represented by low valleys in the terrain. But there is a specific "sweet spot" in the middle where the cookies are perfectly cooked, represented by the peak of the terrain. Thus, finding this optimal recipe becomes like trying to find the highest peak on a mountain range, and that is the exact goal of optimization algorithms.
                </p>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                   Of course, real-world problems are much more complex than that, often having many more than just two parameters and far more rugged terrain, but the core logic stays the same. So, let's explore how specific methods actually navigate a 3D terrain to find its peak.
                </p>
          </div>
          <div className="viz-half" style={{ height: '700px', background: '#000', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <TerrainViz 
              terrainFn={terrainFn} 
              interactive={false} 
              autoRotate={true} 
              showLabels={false} 
              cameraPos={{ x: 16, y: 11, z: 0 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
