import React from 'react';
import { Target, BarChart2, ShieldAlert, Cpu, Award, Zap, ArrowRight, Play, Compass, CheckCircle } from 'lucide-react';
import { NavigationTab, TrainingLevel, PerformanceHistoryEntry } from '../types';
import { SCRIPTED_SCENARIOS } from '../engine/scenarioEngine';
import { soundFx } from '../engine/soundEffectsEngine';

interface HomePageProps {
  onNavigate: (tab: NavigationTab) => void;
  level: TrainingLevel;
  history: PerformanceHistoryEntry[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, level, history }) => {
  const latestScore = history.length > 0 ? history[history.length - 1].overallScore : 87;

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>DRISHTI COMMAND CENTER</span>
            <span>•</span>
            <span className="text-emerald-400">LEVEL: {level.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
            AI-POWERED DRONE THREAT TRAINER
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Unit-level simulation platform for target recognition, classification, situational awareness, and decision-tree counter-measure training.
          </p>
        </div>

        {/* Quick Launch Hero Buttons */}
        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => {
              soundFx.playSuccess();
              onNavigate('train-config');
            }}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-xs md:text-sm tracking-wider uppercase flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition transform hover:scale-105"
          >
            <Target className="w-4 h-4" />
            <span>TRAIN ME</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('battlefield');
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-xs md:text-sm tracking-wider uppercase flex items-center space-x-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition transform hover:scale-105 border border-red-400"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SIMULATED FIELD</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('performance');
            }}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-500 font-bold px-5 py-3.5 rounded-xl text-xs md:text-sm tracking-wider uppercase flex items-center space-x-2 transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>PERFORMANCE</span>
          </button>
        </div>

      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">SIMULATED READINESS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-cyan-400">{latestScore}%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              COMBAT READY
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${latestScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">AVG DETECTION SPEED</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400">8.4s</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">FAST</span>
          </div>
          <p className="text-[10px] text-slate-400">Target acquired within optimal 10s window</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">CLASSIFICATION PRECISION</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-purple-400">89%</span>
            <span className="text-[10px] text-purple-300">54 Drills</span>
          </div>
          <p className="text-[10px] text-slate-400">Multirotor & Fixed-wing discrimination</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">COMPLETED DRILLS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400">{history.length + 12}</span>
            <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded">ACTIVE</span>
          </div>
          <p className="text-[10px] text-slate-400">Total flight hours: 14.5 HRS</p>
        </div>

      </div>

      {/* Featured Scripted Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-wider">FEATURED TACTICAL SCENARIOS</h2>
          </div>
          <button 
            onClick={() => onNavigate('train-config')}
            className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-bold"
          >
            <span>CUSTOM CONFIGURATOR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCRIPTED_SCENARIOS.map((scen) => (
            <div 
              key={scen.id}
              onClick={() => {
                soundFx.playClick();
                onNavigate('simulation');
              }}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-bold uppercase">
                    {scen.environment}
                  </span>
                  <span className="text-slate-400">{scen.difficulty.toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-slate-200 text-sm group-hover:text-cyan-400 transition">{scen.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{scen.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Threats: {scen.threatCount}</span>
                <span className="flex items-center space-x-1 text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>LAUNCH</span>
                  <Play className="w-3 h-3 fill-cyan-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
