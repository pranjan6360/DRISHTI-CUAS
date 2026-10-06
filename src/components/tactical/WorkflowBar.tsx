import React from 'react';
import { Eye, Radar, Target, Tag, AlertTriangle, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { WorkflowPhase, TrainingLevel } from '../../types';

interface WorkflowBarProps {
  activePhase: WorkflowPhase;
  onSelectPhase?: (phase: WorkflowPhase) => void;
  level: TrainingLevel;
}

const PHASES = [
  { id: 1, label: 'OBSERVE', icon: Eye, desc: 'Scan 3D environment & radar sweep' },
  { id: 2, label: 'DETECT', icon: Radar, desc: 'Acquire new track blip' },
  { id: 3, label: 'TRACK', icon: Target, desc: 'Lock telemetry & monitor trajectory' },
  { id: 4, label: 'CLASSIFY', icon: Tag, desc: 'Identify object class (Multirotor/Fixed-Wing/Decoy)' },
  { id: 5, label: 'ASSESS', icon: AlertTriangle, desc: 'Determine hostile vs non-threat intent' },
  { id: 6, label: 'DECISION', icon: ShieldCheck, desc: 'Execute abstract counter-measure protocol' },
  { id: 7, label: 'OUTCOME', icon: CheckCircle2, desc: 'Calculate tactical result' },
  { id: 8, label: 'FEEDBACK', icon: Award, desc: 'Inspect score breakdown & AI review' }
];

export const WorkflowBar: React.FC<WorkflowBarProps> = ({
  activePhase,
  onSelectPhase,
  level
}) => {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between font-mono select-none overflow-x-auto shadow-md">
      <div className="flex items-center space-x-1.5 min-w-[760px]">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const isActive = p.id === activePhase;
          const isCompleted = p.id < activePhase;

          return (
            <div 
              key={p.id}
              onClick={() => onSelectPhase && onSelectPhase(p.id as WorkflowPhase)}
              className={`flex-1 flex items-center space-x-1.5 px-2.5 py-1.5 rounded transition-all cursor-pointer border text-xs ${
                isActive 
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500 font-bold scale-105' 
                  : isCompleted 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-600 hover:text-slate-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-cyan-400 text-slate-950' : isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
              }`}>
                {p.id}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] leading-none uppercase tracking-wide">{p.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
