import React from 'react';
import { ShieldAlert, Zap, Radio, Crosshair, Eye, Bell, X } from 'lucide-react';
import { AerialThreat } from '../../types';

interface DecisionActionModalProps {
  threat: AerialThreat;
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionName: string) => void;
}

const ACTION_OPTIONS = [
  {
    name: 'Soft-Kill Directional RF Jammer',
    type: 'Soft-Kill Protocol',
    description: 'Emits localized RF frequency jamming beam (2.4/5.8 GHz) to force failsafe land or return-to-base.',
    recommendedFor: 'Micro Multirotors & RF-controlled drones',
    icon: Radio,
    color: 'border-cyan-500 text-cyan-400 bg-cyan-950/30'
  },
  {
    name: 'Kinetic Catch Net System',
    type: 'Physical Capture Protocol',
    description: 'Deploys simulated net capture tether to entangle rotors without explosive kinetic damage.',
    recommendedFor: 'Low-altitude multirotors over populated urban zones',
    icon: Crosshair,
    color: 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
  },
  {
    name: 'Simulated Kinetic Interceptor',
    type: 'Hard-Kill Simulation',
    description: 'Abstract kinetic counter-measure protocol for high-speed autonomous strike objects.',
    recommendedFor: 'Fast Strike UAVs & armed threats',
    icon: Zap,
    color: 'border-red-500 text-red-400 bg-red-950/30'
  },
  {
    name: 'Track & Monitor',
    type: 'Passive Surveillance',
    description: 'Maintains continuous EO/IR and radar tracking without initiating counter-measures.',
    recommendedFor: 'Decoys, wildlife, or ambiguous non-hostile objects',
    icon: Eye,
    color: 'border-blue-500 text-blue-400 bg-blue-950/30'
  },
  {
    name: 'Command Alert',
    type: 'Tactical Escalation',
    description: 'Relays target coordinates and video feed to Sector Command for high-level engagement decision.',
    recommendedFor: 'Multi-threat swarm incursions',
    icon: Bell,
    color: 'border-purple-500 text-purple-400 bg-purple-950/30'
  }
];

export const DecisionActionModal: React.FC<DecisionActionModalProps> = ({
  threat,
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              SELECT COUNTER-MEASURE PROTOCOL: {threat.id}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {ACTION_OPTIONS.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectAction(opt.name);
                  onClose();
                }}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01] ${opt.color} space-y-1 group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <h4 className="font-bold text-slate-100 text-xs">{opt.name}</h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300">
                    {opt.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{opt.description}</p>
                <div className="text-[10px] text-slate-400 italic">Recommended: {opt.recommendedFor}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
