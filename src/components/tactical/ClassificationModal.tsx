import React from 'react';
import { Tag, ShieldAlert, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { GroundTruthClass, AerialThreat } from '../../types';

interface ClassificationModalProps {
  threat: AerialThreat;
  isOpen: boolean;
  onClose: () => void;
  onSelectClassification: (selectedClass: GroundTruthClass) => void;
}

const CLASSIFICATION_OPTIONS: Array<{
  className: GroundTruthClass;
  description: string;
  typicalRCS: string;
  typicalSpeed: string;
  iconColor: string;
}> = [
  {
    className: 'Micro Multirotor (Quad/Hex)',
    description: 'Commercial/tactical multirotor drone. Hover capability, low radar RCS (~0.05m²).',
    typicalRCS: '0.01 - 0.08 m²',
    typicalSpeed: '10 - 50 km/h',
    iconColor: 'border-cyan-500 text-cyan-400'
  },
  {
    className: 'Fixed-Wing Recon UAV',
    description: 'Surveillance drone with fixed wing assembly. Smooth glide, medium RCS (~0.15m²).',
    typicalRCS: '0.10 - 0.25 m²',
    typicalSpeed: '60 - 140 km/h',
    iconColor: 'border-yellow-500 text-yellow-400'
  },
  {
    className: 'Fast Strike Aerial Object',
    description: 'High-speed or jet-assisted kinetic aerial object. Intense thermal exhaust signature.',
    typicalRCS: '0.20 - 0.50 m²',
    typicalSpeed: '150 - 300+ km/h',
    iconColor: 'border-orange-500 text-orange-400'
  },
  {
    className: 'Swarm Element Drone',
    description: 'Autonomous swarm member operating in mesh network formation.',
    typicalRCS: '0.02 - 0.06 m²',
    typicalSpeed: '30 - 80 km/h',
    iconColor: 'border-purple-500 text-purple-400'
  },
  {
    className: 'Decoy / Wildlife / Non-Threat',
    description: 'Civilian balloon, bird flock, or passive electronic decoy signature.',
    typicalRCS: '0.05 - 0.20 m²',
    typicalSpeed: '15 - 40 km/h',
    iconColor: 'border-blue-500 text-blue-400'
  }
];

export const ClassificationModal: React.FC<ClassificationModalProps> = ({
  threat,
  isOpen,
  onClose,
  onSelectClassification
}) => {
  if (!isOpen) return null;

  // Compute recommended classification match for guidance
  const recommendedClass = threat.groundTruthClass;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              CLASSIFY TARGET TRACK: {threat.id}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Summary Pill */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-4 gap-2 text-xs text-slate-300">
          <div>RCS: <span className="text-cyan-400 font-bold">{threat.sensorSignature.radarRCS}m²</span></div>
          <div>SPEED: <span className="text-cyan-400 font-bold">{threat.speed}km/h</span></div>
          <div>ALTITUDE: <span className="text-cyan-400 font-bold">{threat.altitude}m</span></div>
          <div>THERMAL: <span className="text-cyan-400 font-bold">{threat.sensorSignature.thermalSig}/100</span></div>
        </div>

        {/* AI SIGNATURE MATCH GUIDANCE BANNER */}
        <div className="bg-cyan-950/90 border border-cyan-500/80 rounded-lg p-3 flex items-start space-x-2 text-xs text-cyan-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-bold text-cyan-300 uppercase">AI SIGNATURE ANALYZER MATCH:</span>
            <p className="text-[11px] leading-relaxed">
              Radar RCS ({threat.sensorSignature.radarRCS}m²) & Speed ({threat.speed} km/h) match <strong className="text-emerald-400">{recommendedClass}</strong> with {threat.confidence}% sensor confidence.
            </p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {CLASSIFICATION_OPTIONS.map((opt, idx) => {
            const isRecommended = opt.className === recommendedClass;

            return (
              <div 
                key={idx}
                onClick={() => {
                  onSelectClassification(opt.className);
                  onClose();
                }}
                className={`border rounded-lg p-3 cursor-pointer transition-all flex items-start space-x-3 group ${
                  isRecommended 
                    ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div className={`p-2 rounded border ${opt.iconColor} bg-slate-900 mt-0.5`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200 text-xs group-hover:text-cyan-300 flex items-center space-x-2">
                      <span>{opt.className}</span>
                      {isRecommended && (
                        <span className="bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                          RECOMMENDED MATCH
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400">RCS: {opt.typicalRCS}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{opt.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
