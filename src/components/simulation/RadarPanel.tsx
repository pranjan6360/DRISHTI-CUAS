import React, { useEffect, useState } from 'react';
import { Radar, Radio, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AerialThreat, SensorCondition } from '../../types';

interface RadarPanelProps {
  threats: AerialThreat[];
  selectedThreatId?: string;
  onSelectThreat: (id: string) => void;
  sensorCondition: SensorCondition;
}

export const RadarPanel: React.FC<RadarPanelProps> = ({
  threats,
  selectedThreatId,
  onSelectThreat,
  sensorCondition
}) => {
  const [sweepAngle, setSweepAngle] = useState<number>(0);

  // Rotate sweep angle smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const maxRadiusMeters = 5000; // 5km radar radius

  return (
    <div 
      id="radar-panel"
      className="relative w-full h-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 flex flex-col font-mono select-none overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Radar className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-bold text-slate-200 text-xs tracking-wider">P-80 TACTICAL RADAR SCOPE</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-slate-400">SENSOR:</span>
          <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
            sensorCondition === 'normal' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' :
            sensorCondition === 'slight_degradation' ? 'bg-amber-950 text-amber-400 border border-amber-700' :
            'bg-red-950 text-red-400 border border-red-700'
          }`}>
            {sensorCondition.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Circular Radar Scope Display */}
      <div className="relative flex-1 flex items-center justify-center min-h-[220px]">
        {/* Outer Circular Rim */}
        <div className="relative w-64 h-64 rounded-full border-2 border-emerald-500/40 bg-slate-900/60 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.15)] overflow-hidden">
          
          {/* Concentric Range Rings */}
          <div className="absolute w-48 h-48 rounded-full border border-emerald-500/25 border-dashed flex items-center justify-center">
            <span className="absolute -top-3 text-[9px] text-emerald-500/60 font-semibold">2.5 KM</span>
          </div>
          <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30 flex items-center justify-center">
            <span className="absolute -top-3 text-[9px] text-emerald-500/60 font-semibold">1.5 KM</span>
          </div>
          <div className="absolute w-16 h-16 rounded-full border border-emerald-500/40 flex items-center justify-center">
            <span className="absolute -top-3 text-[9px] text-emerald-500/60 font-semibold">0.5 KM</span>
          </div>

          {/* Crosshairs & Angle Lines */}
          <div className="absolute w-full h-[1px] bg-emerald-500/20" />
          <div className="absolute h-full w-[1px] bg-emerald-500/20" />

          {/* Sweeping Radar Line */}
          <div 
            className="absolute top-1/2 left-1/2 w-32 h-32 origin-top-left pointer-events-none"
            style={{
              transform: `rotate(${sweepAngle}deg)`,
              background: 'conic-gradient(from 0deg at 0% 0%, rgba(16,185,129,0.4) 0deg, rgba(16,185,129,0) 45deg)'
            }}
          />

          {/* Center Radar Base Dish Icon */}
          <div className="w-3 h-3 rounded-full bg-emerald-400 z-10 ring-4 ring-emerald-500/30" />

          {/* DYNAMIC THREAT TRACK BLIPS */}
          {threats.map(threat => {
            const [x, y] = threat.position;
            const dist = Math.sqrt(x * x + y * y);
            const scaleFactor = 120 / maxRadiusMeters; // map meters to radar px
            const blipX = (x * scaleFactor);
            const blipY = (-y * scaleFactor); // invert Y for screen coords

            const isSelected = threat.id === selectedThreatId;

            return (
              <div
                key={threat.id}
                onClick={() => onSelectThreat(threat.id)}
                style={{
                  transform: `translate(${blipX}px, ${blipY}px)`
                }}
                className={`absolute z-20 cursor-pointer group transition-all duration-300 flex items-center justify-center`}
              >
                {/* Blip Circle */}
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-cyan-400 ring-4 ring-cyan-500/50 scale-125 z-30' 
                    : threat.isHostile 
                    ? 'bg-red-500 ring-2 ring-red-500/40' 
                    : 'bg-blue-400 ring-2 ring-blue-500/40'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Track ID Label */}
                <span className={`absolute -bottom-4 text-[9px] font-bold px-1 rounded backdrop-blur ${
                  isSelected 
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' 
                    : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                }`}>
                  {threat.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Track Telemetry Data Card */}
      {selectedThreatId ? (
        (() => {
          const t = threats.find(item => item.id === selectedThreatId);
          if (!t) return null;

          return (
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded p-2 text-xs text-slate-300 space-y-1 mt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-cyan-400">
                <div className="flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TRACK {t.id} DETAILS</span>
                </div>
                <span className="text-[10px] bg-cyan-950 border border-cyan-700 text-cyan-300 px-1.5 rounded">
                  CONFIDENCE: {t.confidence}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-[11px] pt-1">
                <div>ALTITUDE: <span className="text-slate-100 font-bold">{t.altitude}m</span></div>
                <div>SPEED: <span className="text-slate-100 font-bold">{t.speed} km/h</span></div>
                <div>RCS: <span className="text-slate-100 font-bold">{t.sensorSignature.radarRCS} m²</span></div>
                <div>RF FREQ: <span className="text-slate-100 font-bold">{t.sensorSignature.rfFrequency}</span></div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded p-2 text-[11px] text-slate-400 text-center mt-2">
          Click any track blip on radar scope to inspect signature
        </div>
      )}
    </div>
  );
};
