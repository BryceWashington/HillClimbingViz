import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../lib/SceneManager';
import type { TerrainFunction } from '../lib/algorithms';
import * as THREE from 'three';

interface TerrainVizProps {
  terrainFn: TerrainFunction;
  heatmapFn?: (x: number, y: number) => THREE.Color;
  walkers?: { id: string; x: number; y: number; z: number; color: string }[];
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
}

const TerrainViz: React.FC<TerrainVizProps> = ({ 
  terrainFn, 
  heatmapFn, 
  walkers = [], 
  className,
  autoRotate = false,
  interactive = true,
  showLabels = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (containerRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager(containerRef.current);
    }

    const observer = new ResizeObserver(() => {
      sceneManagerRef.current?.resize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      sceneManagerRef.current?.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneManagerRef.current?.setTerrain(terrainFn, heatmapFn);
  }, [terrainFn, heatmapFn]);

  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setAutoRotate(autoRotate);
      sceneManagerRef.current.setInteractive(interactive);
      if (showLabels) {
        sceneManagerRef.current.addAxisLabels();
      }
    }
  }, [autoRotate, interactive, showLabels]);

  const prevWalkers = useRef<string[]>([]);
  useEffect(() => {
    const currentIds = walkers.map(w => w.id);
    
    // Remove walkers no longer present
    prevWalkers.current.forEach(id => {
      if (!currentIds.includes(id)) {
        sceneManagerRef.current?.removeWalker(id);
      }
    });

    // Update/Add walkers
    walkers.forEach(w => {
      sceneManagerRef.current?.updateWalker(w.id, w.x, w.y, w.z, w.color);
    });

    prevWalkers.current = currentIds;
  }, [walkers]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default TerrainViz;
