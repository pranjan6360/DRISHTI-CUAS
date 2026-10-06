import React from 'react';
import { BookOpen, ShieldCheck, Zap, CheckCircle2, ArrowRight, LucideIcon } from 'lucide-react';
import { TrainingLevel } from '../../types';
import { soundFx } from '../../engine/soundEffectsEngine';

interface LevelSelectModalProps {
  currentLevel: TrainingLevel;
  onSelectLevel: (level: TrainingLevel) => void;
  onProceed: () => void;
}

interface LevelCardDef {
  id: TrainingLevel;
  title: string;
  badge: string;
  description: string;
  features: string[];
  gradientClass: string;
  borderClass: string;
  glowClass: string;
  icon: LucideIcon;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  onSelectLevel,
  onProceed
}) => {
  const LEVELS: LevelCardDef[] = [
    {
      id: 'beginner',
      title: 'BEGINNER',
      badge: 'GUIDED INSTRUCTION',
      description: 'Step-by-step interactive guidance with full AI instructor support. Recommended for initial target recognition.',
      features: [
        'Full AI voice & visual highlights',
        'Basic single-threat scenarios',
        'Clear weather & normal sensors',
        'Forgiving scoring calibration',
        'Learning & drill focused'
      ],
      gradientClass: 'from-emerald-950/80 to-slate-900 text-emerald-400',
      borderClass: 'border-emerald-500/80',
      glowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      icon: BookOpen
    },
    {
      id: 'intermediate',
      title: 'INTERMEDIATE',
      badge: 'TACTICAL PROFICIENCY',
      description: 'Reduced instructor assistance with multi-threat incursions and moderate sensor noise.',
      features: [
        'Contextual hints & tactical warnings',
        'Multiple simultaneous threat tracks',
        'Fog, rain & evening light conditions',
        'Slight sensor degradation',
        'Moderate time pressure'
      ],
      gradientClass: 'from-cyan-950/80 to-slate-900 text-cyan-400',
      borderClass: 'border-cyan-500/80',
      glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
      icon: ShieldCheck
    },
    {
      id: 'professional',
      title: 'PROFESSIONAL',
      badge: 'ASSESSMENT MODE',
      description: 'Strict evaluation mode with randomized procedural threats, severe sensor dropouts, and zero hints.',
      features: [
        'Zero guidance during active ops',
        'Swarms & stealth decoy targets',
        'Night vision & severe sensor noise',
        'Strict combat scoring penalties',
        'Performance-focused readiness audit'
      ],
      gradientClass: 'from-red-950/80 to-slate-900 text-red-400',
      borderClass: 'border-red-500/80',
      glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.25)]',
      icon: Zap
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 font-mono select-none overflow-y-auto">
      <div className="max-w-5xl w-full space-y-6 my-auto">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-cyan-400 tracking-[0.25em] uppercase">OPERATIONAL READINESS SETUP</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
            SELECT TRAINING LEVEL
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Choose your proficiency tier. Your selected level configures AI assistance density, scenario complexity, threat velocity, and sensor degradation.
          </p>
        </div>

        {/* 3 Large Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LEVELS.map((lvl) => {
            const CardIcon = lvl.icon;
            const isSelected = currentLevel === lvl.id;

            const cardClasses = [
              'relative rounded-xl border p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 bg-gradient-to-b',
              lvl.gradientClass,
              isSelected 
                ? `${lvl.borderClass} ${lvl.glowClass} ring-2 ring-cyan-400 scale-[1.03] z-10` 
                : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
            ].join(' ');

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectLevel(lvl.id);
                }}
                className={cardClasses}
              >
                {/* Selected Check Tag */}
                {isSelected && (
                  <div className="absolute -top-3 right-4 bg-cyan-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 shadow">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SELECTED</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-slate-900 border ${isSelected ? 'border-cyan-400' : 'border-slate-700'}`}>
                      <CardIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 tracking-wider">{lvl.title}</h3>
                      <span className="text-[9px] font-bold text-slate-400 tracking-widest">{lvl.badge}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{lvl.description}</p>

                  <div className="border-t border-slate-800/80 pt-3 space-y-1.5">
                    {lvl.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    className={[
                      'w-full py-2.5 rounded-lg font-bold text-xs transition uppercase tracking-wider flex items-center justify-center space-x-2',
                      isSelected 
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    ].join(' ')}
                  >
                    <span>{isSelected ? 'CONFIRM LEVEL' : 'SELECT LEVEL'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proceed Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              soundFx.playSuccess();
              onProceed();
            }}
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-sm tracking-wider uppercase flex items-center space-x-3 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition transform hover:scale-105"
          >
            <span>ENTER COMMAND DASHBOARD</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
