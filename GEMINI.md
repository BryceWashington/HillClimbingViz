# Hill Climbing Visualization: The Peak and The Valley

## Project Overview
This project is an educational web application designed to visualize complex optimization algorithms through interactive 3D terrains. The application, titled **"The Peak and The Valley"**, aims to explain how different hill-climbing variations navigate mathematical landscapes to find optimal solutions (Global Maxima) while avoiding common pitfalls like Local Maxima.

### Main Technologies (Recommended)
- **UI Framework:** React
- **3D Visualization:** Three.js / React Three Fiber
- **Data Visualization:** D3.js or Chart.js
- **Styling:** Clean, modern, sans-serif typography with high-contrast UI controls.

### Target Algorithms
1. **Standard Hill Climbing:** Greedy approach, immediate short-term gains.
2. **Random Restarts:** Brute force approach using multiple random starting points.
3. **Stochastic Hill Climbing:** Injects randomness to bypass minor traps.
4. **Local Beam Search:** Collaborative approach where multiple walkers share the best positions.
5. **Simulated Annealing:** Controlled chaos using a "cooling schedule" to escape local maxima.

---

## Directory Overview
The current directory serves as a specification and design foundation for the project. It contains the detailed roadmap and functional requirements needed to build the application.

### Key Files
- **`intructions.md`**: The primary specification document. It contains 8 sections of detailed instructions, including:
  - UI/Layout specs (split layouts, sidebars, tabbed interfaces).
  - Website copy for educational context.
  - Visualization specifications for 3D scenes, line graphs, and text logs.
  - Interaction designs (click-to-drop walkers, timeline scrubbing, algorithm toggles).
- **`HillClimbing.iml`**: IntelliJ IDEA project configuration file.
- **`.idea/`**: Workspace settings for IntelliJ IDEA.

---

## Usage
This directory is intended to be used as a reference for implementing the "Hill Climbing Visualization" application. 

### Development Roadmap
1. **Initialize Project:** Set up a React environment (e.g., using Vite) and install dependencies (Three.js, D3.js).
2. **Implement Terrain Engine:** Create the 3D topographical mesh logic as described in Section 1 of `intructions.md`.
3. **Build Algorithm Logic:** Implement the mathematical engines for each hill-climbing variant.
4. **Develop UI Sections:** Progressively build the 8 sections (Introduction, Standard, Trap, Arsenal, Synergy, Proving Ground, Sandbox, and Conclusion) following the layout and copy in the instructions.
5. **Validation:** Ensure visualizations (3D walker movements and line graphs) accurately reflect the logic of the selected algorithm.

---

## Development Conventions
- **Color Coding:** Use the established scheme for algorithms:
  - Standard: **Blue**
  - Random Restart: **Purple**
  - Stochastic: **Orange**
  - Beam Search: **Green**
  - Simulated Annealing: **Red/Cyan Gradient**
- **Interaction:** Prioritize smooth transitions and real-time updates between the 3D canvas and supporting charts/logs.
- **Tone:** The application should feel like an interactive educational essay—clear, professional, and visually engaging.
