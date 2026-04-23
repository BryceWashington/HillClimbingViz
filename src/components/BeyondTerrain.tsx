import React from 'react';

const BeyondTerrain: React.FC = () => {
  return (
    <section className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '2rem', lineHeight: '1.1' }}>Beyond <br/><span style={{ color: '#6366f1' }}>3D Terrain</span></h2>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.7' }}>
            While the hikers in our examples only had to worry about climbing a three dimensional space, real optimization algorithms are often navigating spaces with hundreds, thousands, or even millions of dimensions. Although the human brain cannot physically visualize a 10,000-dimensional mountain range, the underlying logic remains exactly the same. By understanding how an algorithm conquers a simple 3D landscape, we can understand how strategies as simple as hill climbing scale up to solve some of the world's most incredibly complex problems.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BeyondTerrain;
