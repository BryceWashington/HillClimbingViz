import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { TerrainFunction } from './algorithms';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private terrainMesh: THREE.Mesh | null = null;
  private walkers: Map<string, THREE.Mesh> = new Map();
  private labelsGroup: THREE.Group = new THREE.Group();
  private frameId: number | null = null;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // Match CSS --bg-primary
    
    // Add atmospheric fog for a floating effect
    this.scene.fog = new THREE.FogExp2(0x020617, 0.035);
    this.scene.add(this.labelsGroup);

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(12, 8, 0); // Requested default position
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotateSpeed = 2.0;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    // Dramatic Lighting for Clarity
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Brighter ambient
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(10, 20, 10);
    this.scene.add(mainLight);
    
    const pointLight = new THREE.PointLight(0x6366f1, 5, 50);
    pointLight.position.set(-10, 15, -10);
    this.scene.add(pointLight);

    this.animate();
  }

  public setTerrain(terrainFn: TerrainFunction, heatmapFn?: (x: number, y: number) => THREE.Color, color: string | number = 0x94a3b8, size = 15, segments = 128) {
    if (this.terrainMesh) {
      this.scene.remove(this.terrainMesh);
      this.terrainMesh.geometry.dispose();
      (this.terrainMesh.material as THREE.Material).dispose();
      this.terrainMesh.children.forEach(c => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          (c.material as THREE.Material).dispose();
        }
      });
    }

    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array;
    const colors: number[] = [];
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      vertices[i + 1] = terrainFn(x, z);
      if (heatmapFn) {
        const colorObj = heatmapFn(x, z);
        colors.push(colorObj.r, colorObj.g, colorObj.b);
      }
    }
    geometry.computeVertexNormals();

    if (heatmapFn) {
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

    // Dull algorithm-specific color logic
    const baseColor = new THREE.Color(color);
    const dullColor = baseColor.clone().multiplyScalar(0.6); // Mute the color less significantly

    const material = new THREE.MeshStandardMaterial({
      color: heatmapFn ? 0xffffff : dullColor,
      vertexColors: !!heatmapFn,
      metalness: 0.0,
      roughness: 1.0,
      flatShading: false,
      side: THREE.FrontSide,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    
    // Add a conformant Grid/Wireframe directly on the terrain
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: heatmapFn ? 0xffffff : dullColor.clone().multiplyScalar(1.5),
      vertexColors: !!heatmapFn, // Enable vertex colors for the grid
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    wireframe.position.y = 0.001; // Tiny offset to prevent flickering
    this.terrainMesh.add(wireframe);

    this.scene.add(this.terrainMesh);
  }

  public updateWalker(id: string, x: number, y: number, z: number, color: string | number) {
    let walker = this.walkers.get(id);
    if (!walker) {
      const geometry = new THREE.SphereGeometry(0.22, 32, 32);
      const material = new THREE.MeshStandardMaterial({ 
        color, 
        emissive: color,
        emissiveIntensity: 1.5, // Stronger glow
        roughness: 0.2,
        metalness: 0.9
      });
      walker = new THREE.Mesh(geometry, material);
      this.scene.add(walker);
      this.walkers.set(id, walker);
      
      // Add a tiny point light to each walker for extra pop
      const light = new THREE.PointLight(color, 1, 3);
      walker.add(light);
    } else {
      const mat = walker.material as THREE.MeshStandardMaterial;
      const c = new THREE.Color(color);
      mat.color.copy(c);
      mat.emissive.copy(c);
      const light = walker.children[0] as THREE.PointLight;
      if (light) light.color.copy(c);
    }
    walker.position.set(x, z + 0.2, y);
  }

  public removeWalker(id: string) {
    const walker = this.walkers.get(id);
    if (walker) {
      this.scene.remove(walker);
      walker.geometry.dispose();
      (walker.material as THREE.Material).dispose();
      this.walkers.delete(id);
    }
  }

  public setInteractive(enabled: boolean) {
    this.controls.enabled = enabled;
  }

  public setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
  }

  public addAxisLabels() {
    this.labelsGroup.clear();
    const createLabel = (text: string, pos: THREE.Vector3) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 512;
      canvas.height = 128;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'Bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, 256, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(pos);
      sprite.scale.set(6.5, 1.6, 1);
      return sprite;
    };

    // Adjusted label positions for the (12, 8, 0) camera distance
    this.labelsGroup.add(createLabel('X: Variables', new THREE.Vector3(8, 0.5, 0)));
    this.labelsGroup.add(createLabel('Y: Variables', new THREE.Vector3(0, 0.5, 8)));
    this.labelsGroup.add(createLabel('Z: Score', new THREE.Vector3(0, 8, 0)));
  }

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public resize() {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public setCameraPosition(x: number, y: number, z: number) {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
    this.controls.update();
  }

  public dispose() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.controls.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.walkers.forEach(w => {
      w.geometry.dispose();
      (w.material as THREE.Material).dispose();
    });
    if (this.terrainMesh) {
      this.terrainMesh.geometry.dispose();
      (this.terrainMesh.material as THREE.Material).dispose();
    }
  }
}
