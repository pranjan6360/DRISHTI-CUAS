import React, { useState } from 'react';
import { Crosshair, ZoomIn, ZoomOut, Eye, Sun, Flame, Moon, Info, Shield, Radio, Target } from 'lucide-react';
import { AerialThreat, WeatherCondition, TimeOfDay } from '../../types';
import { soundFx } from '../../engine/soundEffectsEngine';

interface EOIRCameraViewProps {
  selectedThreat?: AerialThreat | null;
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
}

export type CameraFilter = 'day' | 'thermal_white' | 'thermal_black' | 'night_vision';

export const EOIRCameraView: React.FC<EOIRCameraViewProps> = ({
  selectedThreat,
  weather,
  timeOfDay
}) => {
  const [filter, setFilter] = useState<CameraFilter>(
    timeOfDay === 'night' ? 'night_vision' : 'thermal_white'
  );
  const [zoomLevel, setZoomLevel] = useState<number>(2);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  const cycleZoom = (direction: 'in' | 'out') => {
    soundFx.playClick();
    const zooms = [1, 2, 4, 8];
    const currIdx = zooms.indexOf(zoomLevel);
    if (direction === 'in' && currIdx < zooms.length - 1) {
      setZoomLevel(zooms[currIdx + 1]);
    } else if (direction === 'out' && currIdx > 0) {
      setZoomLevel(zooms[currIdx - 1]);
    }
  };

  // Weather & Thermal filter styling
  const getFilterContainerStyle = () => {
    switch (filter) {
      case 'thermal_white':
        return 'bg-neutral-950 text-neutral-100 contrast-200 brightness-110';
      case 'thermal_black':
        return 'bg-neutral-100 text-neutral-900 filter invert contrast-200';
      case 'night_vision':
        return 'bg-emerald-950 text-emerald-400 contrast-150 brightness-125';
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  // Range calculation
  const rangeMeters = selectedThreat 
    ? Math.round(Math.sqrt(selectedThreat.position[0]**2 + selectedThreat.position[1]**2 + selectedThreat.altitude**2))
    : 0;

  return (
    <div className={`relative w-full h-full border border-slate-700/80 rounded-xl overflow-hidden flex flex-col font-mono select-none ${getFilterContainerStyle()}`}>
      
      {/* Top Header Control Toolbar */}
      <div className="bg-slate-950/90 backdrop-blur px-3 py-2 flex items-center justify-between border-b border-slate-800 text-xs z-20">
        
        {/* Sensor Title */}
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">ELECTRO-OPTICAL / IR THERMAL SCOPE</span>
          <span className="bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
            {filter.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Filter Switcher Buttons */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => { soundFx.playClick(); setFilter('day'); }}
            className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${filter === 'day' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'}`}
            title="Day Optical RGB Mode"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DAY</span>
          </button>

          <button 
            onClick={() => { soundFx.playClick(); setFilter('thermal_white'); }}
            className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${filter === 'thermal_white' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'}`}
            title="Thermal FLIR White-Hot (Heat glows white)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">WHITE-HOT</span>
          </button>

          <button 
            onClick={() => { soundFx.playClick(); setFilter('thermal_black'); }}
            className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${filter === 'thermal_black' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'}`}
            title="Thermal FLIR Black-Hot (Heat glows black)"
          >
            <Flame className="w-3.5 h-3.5 text-slate-900" />
            <span className="hidden sm:inline">BLACK-HOT</span>
          </button>

          <button 
            onClick={() => { soundFx.playClick(); setFilter('night_vision'); }}
            className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${filter === 'night_vision' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'}`}
            title="Night Vision NVG Phosphor Green"
          >
            <Moon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">NVG GREEN</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded px-1 py-0.5">
            <button 
              onClick={() => cycleZoom('out')} 
              disabled={zoomLevel === 1}
              className="p-1 hover:text-cyan-400 disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-cyan-300 text-xs px-1">{zoomLevel}X</span>
            <button 
              onClick={() => cycleZoom('in')} 
              disabled={zoomLevel === 8}
              className="p-1 hover:text-cyan-400 disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Guide Toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 text-cyan-400 hover:bg-slate-800 rounded"
            title="Toggle Scope Usage Instructions"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scope Guide Banner */}
      {showGuide && (
        <div className="bg-slate-900/95 border-b border-cyan-500/60 p-2.5 text-xs text-cyan-200 flex items-start justify-between z-20 backdrop-blur">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>HOW TO USE THIS THERMAL SCOPE:</strong> Switch filters to White-Hot FLIR or NVG to inspect engine rotor heat. High thermal output ({selectedThreat?.sensorSignature.thermalSig || 45}/100) and low RCS ({selectedThreat?.sensorSignature.radarRCS || 0.05}m²) confirm Micro Multirotor Quadcopters before classifying!
            </p>
          </div>
          <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white text-[10px] uppercase font-bold ml-2">
            DISMISS
          </button>
        </div>
      )}

      {/* Main Scope Viewport Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Scanlines Overlay for FLIR / NVG aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-10" />

        {/* Dynamic Weather Blur Layers */}
        {weather === 'fog' && (
          <div className="absolute inset-0 bg-slate-400/30 backdrop-blur-[3px] z-10 pointer-events-none" />
        )}
        {weather === 'dust' && (
          <div className="absolute inset-0 bg-amber-800/30 pointer-events-none" />
        )}

        {/* Tactical Scope Reticle & Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Crosshair className={`w-36 h-36 stroke-[0.8] ${filter === 'night_vision' ? 'text-emerald-400' : 'text-cyan-400/80'}`} />
          <div className={`absolute w-56 h-56 border border-dashed rounded-full ${filter === 'night_vision' ? 'border-emerald-500/40' : 'border-cyan-500/40'}`} />
          {/* Angular Pitch Markers */}
          <div className="absolute text-[9px] top-6 font-bold text-cyan-400/60">+15° PITCH</div>
          <div className="absolute text-[9px] bottom-6 font-bold text-cyan-400/60">-15° PITCH</div>
        </div>

        {/* TARGET VISUAL SILHOUETTE & HUD DATA */}
        {selectedThreat ? (
          <div 
            className="relative z-10 flex flex-col items-center justify-center transition-transform duration-300"
            style={{ transform: `scale(${1 + (zoomLevel - 1) * 0.4})` }}
          >
            {/* Target Locking Bounding Box */}
            <div className={`relative border-2 ${filter === 'night_vision' ? 'border-emerald-400' : 'border-red-500'} p-6 rounded flex flex-col items-center justify-center animate-pulse`}>
              
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-red-500" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-red-500" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-red-500" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-red-500" />

              {/* Simulated Thermal Silhouette with Motor Heat Glow */}
              <div className={`w-14 h-10 rounded flex flex-col items-center justify-center shadow-2xl ${
                filter === 'thermal_white' ? 'bg-white shadow-white/80' : 
                filter === 'thermal_black' ? 'bg-black shadow-black' : 
                filter === 'night_vision' ? 'bg-emerald-300 shadow-emerald-400' :
                'bg-slate-800 border border-cyan-400'
              }`}>
                {/* Simulated Propellers / Fuselage */}
                <div className="w-10 h-1 bg-red-500 animate-spin" style={{ animationDuration: '0.3s' }} />
                <span className="text-[9px] font-extrabold text-slate-950 mt-1">{selectedThreat.id}</span>
              </div>

              {/* Scope Target Data Tag */}
              <div className="absolute -bottom-8 bg-slate-950/95 border border-cyan-500 px-2.5 py-1 rounded text-[10px] text-cyan-300 whitespace-nowrap shadow-xl">
                RNG: {rangeMeters}m | RCS: {selectedThreat.sensorSignature.radarRCS}m² | HEAT: {selectedThreat.sensorSignature.thermalSig}/100
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 text-xs z-10">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-2 animate-pulse" />
            <p className="font-semibold uppercase tracking-widest text-slate-400">NO TARGET LOCKED IN THERMAL SCOPE</p>
            <p className="text-[10px] mt-1">Select a target on the radar scope or Target Acquisition Strip to center optical camera</p>
          </div>
        )}
      </div>

      {/* Scope Footer Telemetry Line */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono z-20">
        <div>AZIMUTH: {selectedThreat ? `${selectedThreat.direction}°` : '000°'}</div>
        <div>FOV: {(45 / zoomLevel).toFixed(1)}°</div>
        <div className="text-cyan-400 font-bold">LASER LRF: {selectedThreat ? `${rangeMeters} M (LOCK OK)` : 'SEARCHING'}</div>
        <div>RF: {selectedThreat?.sensorSignature.rfFrequency || 'N/A'}</div>
      </div>
    </div>
  );
};
