import Introduction from './components/Introduction';
import StandardHillClimbing from './components/StandardHillClimbing';
import TheTrap from './components/TheTrap';
import TheArsenal from './components/TheArsenal';
import Synergy from './components/Synergy';
import ProvingGround from './components/ProvingGround';
import Conclusion from './components/Conclusion';
import './App.css';

function App() {
  return (
    <div className="App">
      <Introduction />
      <StandardHillClimbing />
      <TheTrap />
      <TheArsenal />
      <Synergy />
      <ProvingGround />
      <Conclusion />
      
      <footer style={{ padding: '4rem 0', background: '#111827', color: '#9ca3af', textAlign: 'center' }}>
        <div className="container">
          <p>© 2026 Hill Climbing Visualization - The Peak and The Valley</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
