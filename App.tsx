import React, { useState, Suspense } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { AnimationState } from './types';

export default function App() {
  const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.ASSEMBLED);
  const [hue, setHue] = useState<number>(200); // Default to a icy blue/purple hue

  const toggleAnimation = () => {
    setAnimationState(prev => 
      prev === AnimationState.ASSEMBLED ? AnimationState.SCATTERED : AnimationState.ASSEMBLED
    );
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden font-['Inter']">
      {/* Background Gradient Mesh (CSS Fallback/Base) */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"
        style={{
          background: `radial-gradient(circle at 50% 50%, #1a1a3a 0%, #000000 100%)`
        }}
      />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-white/50 tracking-widest uppercase text-xs">Initializing Arix Core...</div>}>
          <Scene animationState={animationState} hue={hue} />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <UIOverlay 
          animationState={animationState} 
          onToggleAnimation={toggleAnimation}
          hue={hue}
          setHue={setHue}
        />
      </div>
    </div>
  );
}