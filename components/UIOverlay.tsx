import React, { useState } from 'react';
import { AnimationState } from '../types';

interface UIOverlayProps {
  animationState: AnimationState;
  onToggleAnimation: () => void;
  hue: number;
  setHue: (h: number) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ animationState, onToggleAnimation, hue, setHue }) => {
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-12 pointer-events-none select-none overflow-hidden text-white">
      
      {/* Header - Top Left */}
      <header className="flex flex-col gap-2 pointer-events-auto items-start z-50">
        <h1 className="text-4xl md:text-6xl font-['Cinzel'] font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]">
          Sincerely Fan
        </h1>
        <div className="flex items-center gap-4 group cursor-default">
          <div className="h-[1px] w-16 bg-gradient-to-r from-amber-500 to-transparent group-hover:w-24 transition-all duration-500"></div>
          <span className="text-[10px] md:text-xs font-['Inter'] tracking-[0.4em] text-amber-200/80 uppercase font-semibold">
            Happy not just Christmas
          </span>
        </div>
      </header>
      
      {/* Top Right - Status Info */}
      <div className="absolute top-12 right-12 flex flex-col items-end gap-3 text-[10px] font-['Inter'] tracking-widest text-amber-100/40 mix-blend-plus-lighter z-40 hidden md:flex">
        <span className="border-b border-white/10 pb-1">SEQ. 8921-X</span>
        <span>LAT 59.91 N</span>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></div>
           <span className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">SYS.ONLINE</span>
        </div>
      </div>

      {/* Bottom Right - GOLDEN CONTROL CLUSTER */}
      <div className={`absolute bottom-10 right-10 md:bottom-16 md:right-16 flex flex-col items-end gap-10 transition-all duration-1000 transform ${isControlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'} pointer-events-auto z-50`}>
        
        {/* Hue Slider - Minimalist Golden Line */}
        <div className="group flex flex-col items-end gap-3 w-72">
           <div className="flex justify-between w-full text-[9px] text-amber-200/70 font-['Inter'] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span>Refraction Index</span>
              <span className="font-mono text-amber-400">{hue}°</span>
           </div>
           
           <div className="relative w-full h-6 flex items-center">
              <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={hue} 
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="relative z-10 w-full h-[2px] bg-transparent appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-100 [&::-webkit-slider-thumb]:rotate-45 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(251,191,36,0.8)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
              {/* Background Track */}
              <div className="absolute top-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform -translate-y-1/2"></div>
           </div>
        </div>

        {/* THE MAIN ACTION BUTTON */}
        <button 
          onClick={onToggleAnimation}
          className="relative group perspective-1000 outline-none"
          aria-label="Toggle Tree State"
        >
          {/* Ambient Glow Bloom */}
          <div className={`absolute -inset-8 bg-amber-500/20 rounded-full blur-3xl transition-all duration-1000 ${animationState === AnimationState.ASSEMBLED ? 'opacity-40 scale-125' : 'opacity-0 scale-75'}`}></div>
          <div className={`absolute -inset-1 bg-amber-400/50 blur-md transition-all duration-500 rounded-sm ${animationState === AnimationState.ASSEMBLED ? 'opacity-50' : 'opacity-0'}`}></div>

          {/* Button Body */}
          <div className={`
             relative px-14 py-6 
             bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700
             border-y border-amber-100
             shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.4),inset_0_1px_0_rgba(255,255,255,0.6)]
             flex flex-col items-center justify-center
             transition-all duration-500 transform
             group-hover:-translate-y-1 group-hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6),0_0_40px_rgba(251,191,36,0.6),inset_0_1px_0_rgba(255,255,255,0.8)]
             active:translate-y-[1px] active:shadow-[0_0_10px_rgba(251,191,36,0.2)]
             overflow-hidden
             clip-path-polygon
          `}>
             {/* Metallic Sheen Animation */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20 w-[200%]"></div>
             
             {/* Text Content */}
             <div className="relative z-10 flex flex-col items-center gap-1.5 mix-blend-multiply">
                <span className="text-amber-950 font-['Cinzel'] font-black text-xl md:text-2xl tracking-[0.25em] drop-shadow-sm whitespace-nowrap">
                  {animationState === AnimationState.ASSEMBLED ? 'ASSEMBLED' : 'SCATTERED'}
                </span>
             </div>
             
             {/* Tech lines decoration */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-900/40"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-900/40"></div>
          </div>
          
          {/* Status Text Below Button */}
          <div className="absolute -bottom-8 left-0 right-0 text-center transition-all duration-500">
              <span className="text-[9px] text-amber-400/80 font-['Inter'] tracking-[0.4em] uppercase font-semibold drop-shadow-lg">
                {animationState === AnimationState.ASSEMBLED ? '♦ Structure Locked ♦' : '• Awaiting Convergence •'}
              </span>
          </div>
        </button>

      </div>

      {/* Interface Toggle - Bottom Left */}
      <div className="absolute bottom-10 left-10 pointer-events-auto z-40">
         <button 
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            className="group flex items-center gap-3 px-4 py-2 rounded-full hover:bg-white/5 transition-colors"
         >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isControlsVisible ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-white/20'}`}></div>
            <span className="text-[10px] text-amber-100/50 group-hover:text-amber-100 tracking-[0.25em] uppercase transition-colors font-['Inter']">
               {isControlsVisible ? 'Hide Interface' : 'Show Interface'}
            </span>
         </button>
      </div>
      
      {/* Decorative Vignette/Frame lines */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-none m-4 md:m-8"></div>
      <div className="absolute bottom-8 left-8 w-px h-16 bg-gradient-to-t from-amber-500/30 to-transparent"></div>
      <div className="absolute top-8 right-8 w-px h-16 bg-gradient-to-b from-amber-500/30 to-transparent"></div>

    </div>
  );
};