import React from 'react';

const Conclusion: React.FC = () => {
  return (
    <section className="section" style={{ padding: '6rem 0', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Beyond the Terrain</h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '2rem' }}>
          The 3D mountains and valleys we've explored here are just metaphors. In reality, these algorithms are operating in mathematically abstract spaces with hundreds, thousands, or even millions of dimensions.
        </p>
        
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Where is this used?</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '3rem' }}>
          <li style={{ marginBottom: '2rem', paddingLeft: '1.5rem', borderLeft: '4px solid #6366f1' }}>
            <strong>Machine Learning:</strong> Training a neural network is essentially navigating a massive landscape to find the lowest possible "error rate" (finding the deepest valley instead of the highest peak).
          </li>
          <li style={{ marginBottom: '2rem', paddingLeft: '1.5rem', borderLeft: '4px solid #6366f1' }}>
            <strong>Logistics:</strong> Routing software uses simulated annealing to find the most fuel-efficient path for thousands of delivery trucks.
          </li>
          <li style={{ marginBottom: '2rem', paddingLeft: '1.5rem', borderLeft: '4px solid #6366f1' }}>
            <strong>Finance:</strong> Algorithmic trading models use stochastic searches to optimize portfolio weights for maximum return against minimum risk.
          </li>
        </ul>

        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '3rem' }}>
          Optimization is the art of finding the best possible answer when perfection is impossible to calculate by hand.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Further Reading</h3>
        <ul style={{ fontSize: '1rem', lineHeight: '2' }}>
          <li><a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Introduction to Heuristic Algorithms</a></li>
          <li><a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Understanding Gradient Descent in Machine Learning</a></li>
          <li><a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>The Traveling Salesperson Problem</a></li>
        </ul>
      </div>
    </section>
  );
};

export default Conclusion;
