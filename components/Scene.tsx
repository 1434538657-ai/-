import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { CrystalTree } from './CrystalTree';
import { FloorReflector } from './FloorReflector';
import { FloatingParticles } from './FloatingParticles';
import { AnimationState } from '../types';
import * as THREE from 'three';

interface SceneProps {
  animationState: AnimationState;
  hue: number;
}

const Lighting: React.FC<{ hue: number }> = ({ hue }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  const color1 = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
  const color2 = new THREE.Color().setHSL((hue + 180) % 360 / 360, 0.8, 0.6);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={color1} />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color={color2} />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        color="white"
      />
      <rectAreaLight 
        width={20} 
        height={20} 
        color={color1} 
        intensity={2} 
        position={[0, 0, -10]} 
        lookAt={() => new THREE.Vector3(0, 0, 0)} 
      />
    </group>
  );
};

export const Scene: React.FC<SceneProps> = ({ animationState, hue }) => {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
      <PerspectiveCamera makeDefault position={[0, 2, 14]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={25}
        autoRotate={animationState === AnimationState.ASSEMBLED}
        autoRotateSpeed={0.5}
      />

      {/* Environment & Lighting */}
      <Environment preset="city" blur={0.8} background={false} />
      <Lighting hue={hue} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Content */}
      <group position={[0, -2, 0]}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
          <CrystalTree animationState={animationState} hue={hue} />
        </Float>
        <FloatingParticles count={100} />
        <FloorReflector />
      </group>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.1} 
          mipmapBlur 
          intensity={0.8} 
          radius={0.6}
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(0.002, 0.002)} 
          radialModulation={true} 
          modulationOffset={0.5}
        />
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
};