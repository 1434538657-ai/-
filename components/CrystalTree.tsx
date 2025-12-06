import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { AnimationState } from '../types';

interface CrystalTreeProps {
  animationState: AnimationState;
  hue: number;
}

// --- FOLIAGE SYSTEM (Particles) ---

const foliageVertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  
  attribute vec3 aTreePos;
  attribute vec3 aScatterPos;
  attribute float aRandom;
  attribute float aSize;
  
  varying float vRandom;
  varying vec3 vPos;
  varying float vAlpha;
  
  void main() {
    vRandom = aRandom;
    
    // Cubic ease-in-out for smoother transition
    float t = uProgress < 0.5 
      ? 4.0 * uProgress * uProgress * uProgress 
      : 1.0 - pow(-2.0 * uProgress + 2.0, 3.0) / 2.0;
      
    vec3 targetPos = mix(aScatterPos, aTreePos, t);
    
    // Breathing/Wind effect - reduced for metallic rigidity, but still alive
    float wind = sin(uTime * 1.5 + aRandom * 20.0) * (0.02 + (1.0 - uProgress) * 0.15);
    targetPos.y += wind;
    targetPos.x += cos(uTime * 1.0 + targetPos.y) * wind * 0.3;
    
    vPos = targetPos;
    
    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Scale size by depth and randomness
    // Smaller particles for finer detail
    gl_PointSize = aSize * uPixelRatio * (50.0 / -mvPosition.z);
    
    // Fade out slightly when scattered to avoid clutter
    vAlpha = 1.0; 
  }
`;

const foliageFragmentShader = `
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform float uTime;
  
  varying float vRandom;
  varying vec3 vPos;
  varying float vAlpha;
  
  void main() {
    // Sharp circular particle with soft edge
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if (r > 0.5) discard;
    
    // Metallic Sparkle Logic
    // Simulate light hitting different angles based on time and random seed
    float sparkle = sin(uTime * 4.0 + vRandom * 60.0);
    sparkle = smoothstep(0.7, 1.0, sparkle); // Sharp glints, easier to trigger
    
    // Core Gradient
    float strength = 1.0 - (r * 2.0);
    strength = pow(strength, 2.0); // Sharper falloff
    
    // Mix Deep Green with Gold Highlights
    // vRandom creates variation in base color
    vec3 baseColor = mix(uColorPrimary, uColorPrimary * 1.5, vRandom * 0.3);
    
    // Add Metallic Rim/Sparkle
    vec3 finalColor = mix(baseColor, uColorSecondary, strength * 0.3 + sparkle * 0.9);
    
    gl_FragColor = vec4(finalColor, strength * vAlpha);
  }
`;

const FoliageLayer: React.FC<{ animationState: AnimationState }> = ({ animationState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Increased count significantly for density and chaotic look
  const count = 28000;
  const progressRef = useRef(1);

  const { positions, treePositions, scatterPositions, randoms, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const scatterPos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    const sz = new Float32Array(count);

    const height = 12;
    const baseRadius = 5.0;

    for (let i = 0; i < count; i++) {
      // Tree Shape (Fibonacci Cone)
      const t = i / count;
      // Add randomness to angle for disorder
      const angle = i * 2.39996 * 12.0 + (Math.random() * 0.5); 
      const y = t * height;
      const r = (1 - t) * baseRadius;
      
      // Add volume to cone shell (distribution from center to edge)
      // More fuzziness for "unordered" look
      const rVol = r * Math.pow(Math.random(), 0.5) + (Math.random() * 0.6); 
      
      // Add jitter to final tree positions so it's not a perfect geometric shape
      treePos[i * 3] = Math.cos(angle) * rVol + (Math.random() - 0.5) * 0.4;
      treePos[i * 3 + 1] = y - height/2 + 1.5 + (Math.random() - 0.5) * 0.4; 
      treePos[i * 3 + 2] = Math.sin(angle) * rVol + (Math.random() - 0.5) * 0.4;

      // Scatter Shape (Wider Sphere Cloud)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 15 + Math.random() * 20; // Wider scatter range
      
      scatterPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      scatterPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      scatterPos[i * 3 + 2] = radius * Math.cos(phi);

      // Randoms & Sizes
      rand[i] = Math.random();
      // Smaller particles: 0.15 to 1.0 (Refined "dust/needle" look)
      sz[i] = 0.15 + Math.random() * 0.85; 
    }

    return { positions: treePos, treePositions: treePos, scatterPositions: scatterPos, randoms: rand, sizes: sz };
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const target = animationState === AnimationState.ASSEMBLED ? 1 : 0;
    progressRef.current += (target - progressRef.current) * 1.5 * delta;
    
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.uProgress.value = progressRef.current;
  });

  // Deep Green Base & Metallic Gold Highlight
  const colorPrimary = new THREE.Color("#022e20"); // Very dark emerald
  const colorSecondary = new THREE.Color("#ffeedd"); // Bright Champagne Gold/White

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTreePos" count={count} array={treePositions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPos" count={count} array={scatterPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={foliageVertexShader}
        fragmentShader={foliageFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 1 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uColorPrimary: { value: colorPrimary },
          uColorSecondary: { value: colorSecondary }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// --- ORNAMENT SYSTEM (Instances) ---

type OrnamentType = 'box' | 'sphere' | 'star';

interface OrnamentData {
  type: OrnamentType;
  treePos: THREE.Vector3;
  treeRot: THREE.Euler;
  scatterPos: THREE.Vector3;
  scatterRot: THREE.Euler;
  color: THREE.Color;
  scale: THREE.Vector3;
  weight: number; // Physics weight: 1.0 = heavy/slow, 2.0 = light/fast
}

const OrnamentLayer: React.FC<{ animationState: AnimationState, hue: number }> = ({ animationState, hue }) => {
  const count = 150;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Refs for InstancedMeshes
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const sphereRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.InstancedMesh>(null);
  
  // State tracking
  const progressRef = useRef(1); // 0 to 1
  
  // Generate Data
  const { boxes, spheres, stars } = useMemo(() => {
    const _boxes: OrnamentData[] = [];
    const _spheres: OrnamentData[] = [];
    const _stars: OrnamentData[] = [];
    
    const height = 11;
    const baseRadius = 4.8;

    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      // More spheres and stars, fewer boxes
      let type: OrnamentType = typeRand > 0.8 ? 'box' : (typeRand > 0.4 ? 'sphere' : 'star');
      
      // Tree Position
      const t = i / count;
      const angle = i * 2.39996 * 4.0;
      const y = t * height - (height/2) + 1.5;
      const r = (1 - t) * baseRadius * 1.05; // Slightly outside foliage
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );
      
      const treeRot = new THREE.Euler(Math.random(), angle, Math.random());

      // Scatter Position
      const scatterR = 15 + Math.random() * 10;
      const scatterPos = new THREE.Vector3(
        (Math.random() - 0.5) * scatterR * 2,
        (Math.random() - 0.5) * scatterR + 2,
        (Math.random() - 0.5) * scatterR * 2
      );
      
      const scatterRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      // Colors & Scale & Weight
      let scaleBase = 1;
      let color = new THREE.Color();
      let weight = 1;

      if (type === 'box') {
        // Heavy Gift Boxes
        scaleBase = 0.5;
        // Deep Saturated Colors (Red, Blue, Gold)
        const boxHue = Math.random() > 0.5 ? 350 : 220; // Red or Blue
        color.setHSL(boxHue / 360, 0.9, 0.4); 
        weight = 0.5; // Heavy, moves less
      } else if (type === 'sphere') {
        // Medium Glass Spheres
        scaleBase = 0.35;
        // Metallic/Glassy tints
        color.setHSL(hue / 360, 0.6, 0.7);
        weight = 1.0; // Normal
      } else {
        // Light Stars
        scaleBase = 0.2;
        // Warm White/Gold glow
        color.setHSL(0.12, 1.0, 0.8);
        weight = 1.5; // Light, moves more
      }

      const scale = new THREE.Vector3(scaleBase, scaleBase, scaleBase);
      const data: OrnamentData = { type, treePos, treeRot, scatterPos, scatterRot, color, scale, weight };
      
      if (type === 'box') _boxes.push(data);
      else if (type === 'sphere') _spheres.push(data);
      else _stars.push(data);
    }
    
    return { boxes: _boxes, spheres: _spheres, stars: _stars };
  }, [hue]);

  // Animation Loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const target = animationState === AnimationState.ASSEMBLED ? 1 : 0;
    
    // Smooth global transition
    progressRef.current += (target - progressRef.current) * 1.2 * delta;
    
    const updateMesh = (mesh: THREE.InstancedMesh | null, data: OrnamentData[]) => {
      if (!mesh) return;
      
      // Easing function
      const t = Math.max(0, Math.min(1, progressRef.current));
      const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // EaseInOutQuad
      
      data.forEach((item, i) => {
        // Lerp Position
        dummy.position.lerpVectors(item.scatterPos, item.treePos, easedT);
        
        // Physics: Floating effect
        // Amplitude depends on weight and state (scattered = more float)
        const baseAmp = animationState === AnimationState.ASSEMBLED ? 0.05 : 0.4;
        const floatAmp = baseAmp * item.weight; // Lighter items float more
        const floatSpeed = item.weight * 1.5;

        dummy.position.y += Math.sin(time * floatSpeed + item.treePos.x) * floatAmp;
        dummy.position.x += Math.cos(time * floatSpeed * 0.5 + item.treePos.z) * floatAmp * 0.3;
        
        // Lerp Rotation
        dummy.rotation.set(
            THREE.MathUtils.lerp(item.scatterRot.x, item.treeRot.x, easedT),
            THREE.MathUtils.lerp(item.scatterRot.y, item.treeRot.y, easedT) + time * 0.1 * item.weight,
            THREE.MathUtils.lerp(item.scatterRot.z, item.treeRot.z, easedT)
        );
        
        dummy.scale.copy(item.scale);
        
        // Star Twinkle
        if (item.type === 'star') {
            const pulse = 1 + Math.sin(time * 8 + i) * 0.3;
            dummy.scale.multiplyScalar(pulse);
        }

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, item.color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateMesh(boxRef.current, boxes);
    updateMesh(sphereRef.current, spheres);
    updateMesh(starRef.current, stars);
  });

  return (
    <group>
      {/* Gift Boxes - Heavy, Metal/Paper */}
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.6} />
      </instancedMesh>

      {/* Baubles - Glass/Reflective */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, spheres.length]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
            roughness={0.1} 
            metalness={0.8} 
            transmission={0.2} // Semi-transparent metal glass
            thickness={2}
            color={"#ffffff"} // Base tint, color comes from instanceColor
        />
      </instancedMesh>

      {/* Stars - Emissive Light */}
      <instancedMesh ref={starRef} args={[undefined, undefined, stars.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

export const CrystalTree: React.FC<CrystalTreeProps> = ({ animationState, hue }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Slow elegant spin when assembled, barely moving drift when scattered
      const targetSpeed = animationState === AnimationState.ASSEMBLED ? 0.15 : 0.01;
      groupRef.current.rotation.y += targetSpeed * 0.016; // Simple integration
    }
  });

  return (
    <group ref={groupRef}>
        <FoliageLayer animationState={animationState} />
        <OrnamentLayer animationState={animationState} hue={hue} />
        
        {/* Central Holographic Core */}
        <mesh position={[0, 6, 0]}>
             <cylinderGeometry args={[0.2, 0.8, 12, 16]} />
             <meshBasicMaterial color="#ccffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    </group>
  );
};