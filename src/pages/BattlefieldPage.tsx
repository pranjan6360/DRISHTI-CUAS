import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Play, Dice5, Eye, Cloud, Radio, Cpu } from 'lucide-react';
import { ScenarioConfig } from '../types';
import { generateProceduralScenario } from '../engine/scenarioEngine';
import { soundFx } from '../engine/soundEffectsEngine';

interface BattlefieldPageProps {
  onStartScenario: (scenario: ScenarioConfig) => void;
}

export const BattlefieldPage: React.FC<BattlefieldPageProps> = ({ onStartScenario }) => {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 999999));

  // Generate procedural scenario with current seed
  const proceduralScenario = generateProceduralScenario({
    seed,
    difficulty: 'adaptive',
    assistance: 'assessment'
  });

  const handleReroll = () => {
    soundFx.playClick();
    const newSeed = Math.floor(Math.random() * 999999);
    setSeed(newSeed);
  };

  const handleLaunch = () => {
    soundFx.playSuccess();
    // Ensure fresh scenario object is generated on launch
    const freshScenario = generateProceduralScenario({
      seed,
      difficulty: 'adaptive',
      assistance: 'assessment'
    });
    onStartScenario(freshScenario);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/60 rounded-2xl p-6 md:p-8 shadow-2xl space-y-3">
        <div className="flex items-center space-x-2 text-red-400 text-xs font-bold tracking-widest uppercase">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>SIMULATED FIELD EXERCISE — BLIND ASSESSMENT MODE</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
          PROCEDURAL FIELD ASSESSMENT
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Unannounced tactical scenario. Environment terrain, weather visibility, sensor noise dropouts, and aerial threat parameters are dynamically generated to prevent rote learning.
        </p>
      </div>

      {/* Generated Blind Scenario Spec Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 max-w-3xl mx-auto border-t-2 border-t-red-500">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100 tracking-wider uppercase">{proceduralScenario.title}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">SEED: #{seed.toString(16).toUpperCase()}</p>
          </div>

          <button
            onClick={handleReroll}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>GENERATE NEW FIELD</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px]">ENVIRONMENT</span>
            <p className="font-bold text-cyan-300 uppercase">{proceduralScenario.environment.replace('_', ' ')}</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px]">WEATHER & VISIBILITY</span>
            <p className="font-bold text-amber-300 uppercase">{proceduralScenario.weather} ({proceduralScenario.visibility}%)</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px]">TIME OF DAY</span>
            <p className="font-bold text-slate-200 uppercase">{proceduralScenario.timeOfDay}</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px]">SIMULATED THREATS</span>
            <p className="font-bold text-red-400 font-extrabold">{proceduralScenario.threatCount} AERIAL OBJECTS</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px]">SENSOR NOISE</span>
            <p className="font-bold text-purple-300 uppercase">{proceduralScenario.sensorCondition.replace('_', ' ')}</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px]">ASSISTANCE MODE</span>
            <p className="font-bold text-emerald-400 uppercase">ZERO HINTS (ASSESSMENT)</p>
          </div>
        </div>

        <button
          onClick={handleLaunch}
          className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold py-4 rounded-xl text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(239,68,68,0.4)] transition transform hover:scale-105"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>ENTER SIMULATED FIELD</span>
        </button>

      </div>

    </div>
  );
};
