import React, { useEffect, useState } from 'react';
import { Radar, ShieldAlert, Cpu, Radio, CheckCircle, FastForward } from 'lucide-react';
import { soundFx } from '../../engine/soundEffectsEngine';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    soundFx.playRadarSweep();
    const t1 = setTimeout(() => { setStep(2); soundFx.playRadarSweep(); }, 2500);
    const t2 = setTimeout(() => { setStep(3); soundFx.playTargetLock(); }, 5000);
    const t3 = setTimeout(() => { setStep(4); soundFx.playSuccess(); }, 7500);
    const t4 = setTimeout(() => { onComplete(); }, 9500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-mono select-none overflow-hidden">
      
      {/* Background Radar & Grid Animation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/40 border-dashed animate-spin" style={{ animationDuration: '20s' }} />
        <div className="w-[400px] h-[400px] rounded-full border border-cyan-500/60" />
        <div className="w-[200px] h-[200px] rounded-full border border-emerald-500/60" />
        <div className="absolute w-full h-[1px] bg-cyan-500/40" />
        <div className="absolute h-full w-[1px] bg-cyan-500/40" />
      </div>

      {/* Skip Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onComplete();
        }}
        className="absolute top-6 right-8 bg-slate-900/80 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition backdrop-blur z-30"
      >
        <span>SKIP INTRO</span>
        <FastForward className="w-4 h-4" />
      </button>

      {/* Main Center Content */}
      <div className="relative z-20 flex flex-col items-center text-center space-y-6 max-w-3xl px-6">
        
        {/* Top Operational Emblem */}
        <div className="flex items-center space-x-3 text-cyan-400">
          <Radar className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-bold tracking-[0.3em] uppercase">INDIAN ARMED FORCES SIMULATION TECH</span>
        </div>

        {/* Main Branding Title */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-emerald-400 tracking-tight drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]">
            DRISHTI
          </h1>
          <p className="text-sm md:text-lg text-slate-300 font-semibold tracking-wider">
            AI-Powered Drone Threat Simulation & Training Platform
          </p>
        </div>

        {/* Dynamic Visual Stage Indicators */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur space-y-4 max-w-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>SIMULATION KERNEL V4.2</span>
            </span>
            <span className="text-emerald-400 font-bold">STATUS: ONLINE</span>
          </div>

          <div className="space-y-2 text-left text-xs">
            {step >= 1 && (
              <div className="flex items-center justify-between text-cyan-300 animate-fade-in">
                <span className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Scanning airspace perimeter...</span>
                </span>
                <span className="font-bold">OK</span>
              </div>
            )}
            {step >= 2 && (
              <div className="flex items-center justify-between text-emerald-300 animate-fade-in">
                <span className="flex items-center space-x-2">
                  <Radar className="w-4 h-4 text-emerald-400" />
                  <span>Radar tracks T-01, T-02, T-03 acquired.</span>
                </span>
                <span className="font-bold text-emerald-400">3 TRACKS</span>
              </div>
            )}
            {step >= 3 && (
              <div className="flex items-center justify-between text-amber-300 animate-fade-in">
                <span className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>AI threat signature classification ready.</span>
                </span>
                <span className="font-bold text-amber-400">92% CONF</span>
              </div>
            )}
            {step >= 4 && (
              <div className="flex items-center justify-between text-cyan-200 animate-fade-in font-bold">
                <span className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Initializing operational training environment...</span>
                </span>
                <span className="text-cyan-400">READY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
