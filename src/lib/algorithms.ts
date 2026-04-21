export type Point = { x: number; y: number; z: number };
export type Step = { point: Point; altitude: number; temperature?: number };

export type TerrainFunction = (x: number, y: number) => number;

export const gaussian = (x: number, y: number, peakX = 0, peakY = 0, amplitude = 5, sigma = 2): number => {
  return amplitude * Math.exp(-((Math.pow(x - peakX, 2) + Math.pow(y - peakY, 2)) / (2 * Math.pow(sigma, 2))));
};

export const smoothNoise = (x: number, y: number, seed = 0): number => {
  // Helper to rotate coordinates and sample sine/cosine product
  const octave = (px: number, py: number, freq: number, amp: number, angle: number) => {
    const rx = px * Math.cos(angle) - py * Math.sin(angle);
    const ry = px * Math.sin(angle) + py * Math.cos(angle);
    return Math.sin(rx * freq) * Math.cos(ry * freq) * amp;
  };

  // Summing octaves with different rotations, frequencies, and amplitudes
  const n1 = octave(x, y, 1.3, 1.0, seed + 0.0);
  const n2 = octave(x, y, 2.7, 0.5, seed + 0.8);
  const n3 = octave(x, y, 5.9, 0.25, seed + 1.6);
  const n4 = octave(x, y, 11.3, 0.125, seed + 2.4);
  
  return n1 + n2 + n3 + n4;
};

export const ruggedTerrain = (x: number, y: number, noiseIntensity = 0.5, amplitude = 5, peaks = 1, seed = 0): number => {
  let z = gaussian(x, y, 2, 2, amplitude, 2.5);
  if (peaks > 1) {
    z += gaussian(x, y, -2.5, -2.5, amplitude * 0.8, 2);
  }
  if (peaks > 2) {
    z += gaussian(x, y, 3, -3, amplitude * 0.6, 1.5);
  }
  
  const n = smoothNoise(x, y, seed) * noiseIntensity;
  return Math.max(0, z + n);
};

export const standardHillClimbing = (
  start: { x: number; y: number },
  terrain: TerrainFunction,
  stepSize = 0.1,
  maxSteps = 200
): Step[] => {
  const path: Step[] = [];
  let current = { x: start.x, y: start.y };
  
  for (let i = 0; i < maxSteps; i++) {
    const z = terrain(current.x, current.y);
    path.push({ point: { ...current, z }, altitude: z });
    
    // Evaluate neighbors
    const neighbors = [
      { x: current.x + stepSize, y: current.y },
      { x: current.x - stepSize, y: current.y },
      { x: current.x, y: current.y + stepSize },
      { x: current.x, y: current.y - stepSize },
    ];
    
    let bestNeighbor = current;
    let maxZ = z;
    
    for (const n of neighbors) {
      const nz = terrain(n.x, n.y);
      if (nz > maxZ) {
        maxZ = nz;
        bestNeighbor = n;
      }
    }
    
    if (bestNeighbor === current) break; // Reached peak
    current = bestNeighbor;
  }
  
  return path;
};

export const stochasticHillClimbing = (
  start: { x: number; y: number },
  terrain: TerrainFunction,
  stepSize = 0.2,
  maxSteps = 200
): Step[] => {
  const path: Step[] = [];
  let current = { x: start.x, y: start.y };
  
  for (let i = 0; i < maxSteps; i++) {
    const z = terrain(current.x, current.y);
    path.push({ point: { ...current, z }, altitude: z });
    
    const neighbors = [
      { x: current.x + stepSize, y: current.y },
      { x: current.x - stepSize, y: current.y },
      { x: current.x, y: current.y + stepSize },
      { x: current.x, y: current.y - stepSize },
      { x: current.x + stepSize, y: current.y + stepSize },
      { x: current.x - stepSize, y: current.y - stepSize },
    ];
    
    // Pick neighbors that are higher
    const betterNeighbors = neighbors.filter(n => terrain(n.x, n.y) > z);
    if (betterNeighbors.length === 0) break;
    
    // Randomly pick one of the better neighbors
    current = betterNeighbors[Math.floor(Math.random() * betterNeighbors.length)];
  }
  
  return path;
};

export const simulatedAnnealing = (
  start: { x: number; y: number },
  terrain: TerrainFunction,
  initialTemp = 100,
  coolingRate = 0.95,
  maxSteps = 200
): Step[] => {
  const path: Step[] = [];
  let current = { x: start.x, y: start.y };
  let temp = initialTemp;
  
  for (let i = 0; i < maxSteps; i++) {
    const z = terrain(current.x, current.y);
    path.push({ point: { ...current, z }, altitude: z, temperature: temp });
    
    const next = {
      x: current.x + (Math.random() - 0.5) * 0.5,
      y: current.y + (Math.random() - 0.5) * 0.5,
    };
    
    const nextZ = terrain(next.x, next.y);
    const deltaZ = nextZ - z;
    
    if (deltaZ > 0 || Math.random() < Math.exp(deltaZ / temp)) {
      current = next;
    }
    
    temp *= coolingRate;
    if (temp < 0.01) temp = 0;
  }
  
  return path;
};

export const randomRestarts = (
  terrain: TerrainFunction,
  numRestarts = 5,
  bounds = { min: -5, max: 5 }
): Step[][] => {
  const allPaths: Step[][] = [];
  for (let i = 0; i < numRestarts; i++) {
    const start = {
      x: Math.random() * (bounds.max - bounds.min) + bounds.min,
      y: Math.random() * (bounds.max - bounds.min) + bounds.min,
    };
    allPaths.push(standardHillClimbing(start, terrain));
  }
  return allPaths;
};

export const localBeamSearch = (
  numBeams = 3,
  terrain: TerrainFunction,
  bounds = { min: -5, max: 5 },
  maxSteps = 50
): Step[][] => {
  let beams = Array.from({ length: numBeams }, () => ({
    x: Math.random() * (bounds.max - bounds.min) + bounds.min,
    y: Math.random() * (bounds.max - bounds.min) + bounds.min,
  }));
  
  const allPaths: Step[][] = beams.map(() => []);
  
  for (let s = 0; s < maxSteps; s++) {
    const candidates: { x: number; y: number; z: number; beamIdx: number }[] = [];
    
    beams.forEach((b, idx) => {
      const z = terrain(b.x, b.y);
      allPaths[idx].push({ point: { ...b, z }, altitude: z });
      
      // Generate neighbors
      const step = 0.2;
      [
        { x: b.x + step, y: b.y },
        { x: b.x - step, y: b.y },
        { x: b.x, y: b.y + step },
        { x: b.x, y: b.y - step },
      ].forEach(n => {
        candidates.push({ ...n, z: terrain(n.x, n.y), beamIdx: idx });
      });
    });
    
    // Pick the top numBeams overall
    candidates.sort((a, b) => b.z - a.z);
    const nextBeams = candidates.slice(0, numBeams);
    
    // Check if we improved
    const currentMaxZ = Math.max(...beams.map(b => terrain(b.x, b.y)));
    if (nextBeams[0].z <= currentMaxZ) break;
    
    beams = nextBeams.map(nb => ({ x: nb.x, y: nb.y }));
  }
  
  return allPaths;
};
