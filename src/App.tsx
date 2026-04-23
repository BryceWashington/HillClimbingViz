import { useState, useEffect } from 'react';
import Introduction from './components/Introduction';
import TheGreedyApproach from './components/TheGreedyApproach';
import TheFlaw from './components/TheFlaw';
import AdvancedApproaches from './components/AdvancedApproaches';
import Synergy from './components/Synergy';
import TheSandbox from './components/TheSandbox';
import BeyondTerrain from './components/BeyondTerrain';
import './App.css';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'standard', label: 'The Greedy Approach' },
  { id: 'trap', label: 'The Flaw' },
  { id: 'arsenal', label: 'Advanced Approaches' },
  { id: 'synergy', label: 'Synergy' },
  { id: 'sandbox', label: 'The Sandbox' },
  { id: 'beyond', label: 'Beyond 3D Terrain' }
];

function App() {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      
      // Check if we are at the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        setActiveSectionIdx(sections.length - 1);
        return;
      }

      let currentIdx = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el && scrollPos >= el.offsetTop) {
          currentIdx = i;
        }
      }
      setActiveSectionIdx(currentIdx);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = id === 'intro' ? 0 : element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="App">
      {/* Popout Nav Bar */}
      <nav className="side-nav">
        <div className="nav-container">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              className={`nav-item ${activeSectionIdx === idx ? 'active' : ''}`}
              onClick={() => scrollToSection(section.id)}
            >
              <span className="nav-label">{section.label}</span>
              <div className="nav-dot"></div>
            </button>
          ))}
        </div>
      </nav>

      <div id="intro"><Introduction /></div>
      <div id="standard"><TheGreedyApproach /></div>
      <div id="trap"><TheFlaw /></div>
      <div id="arsenal"><AdvancedApproaches /></div>
      <div id="synergy"><Synergy /></div>
      <div id="sandbox"><TheSandbox /></div>
      <div id="beyond"><BeyondTerrain /></div>
      
      <footer style={{ padding: '8rem 0', background: '#020617' }}>
      </footer>
    </div>
  );
}

export default App;
