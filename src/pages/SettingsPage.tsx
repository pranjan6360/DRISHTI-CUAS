import React, { useState } from 'react';
import { Settings, Volume2, Mic, Key, ShieldCheck, Check } from 'lucide-react';
import { soundFx } from '../engine/soundEffectsEngine';

export const SettingsPage: React.FC = () => {
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(soundFx.getIsMuted());
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const toggleSound = () => {
    const nextVal = !isSoundMuted;
    setIsSoundMuted(nextVal);
    soundFx.setMuted(nextVal);
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-cyan-950 border border-cyan-500 rounded-xl text-cyan-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">SYSTEM SETTINGS & API CONFIG</h1>
          <p className="text-xs text-slate-400">Audio, voice synthesis, and optional external LLM API configuration.</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        
        {/* Audio Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            AUDIO & TACTICAL SYNTHESIZER
          </h2>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-200">TACTICAL SOUND EFFECTS</span>
              <p className="text-slate-400 text-[11px]">Radar sweeps, lock-on alerts, button clicks</p>
            </div>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                !isSoundMuted ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {!isSoundMuted ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* External LLM API Plug */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-cyan-400">
            <Key className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              EXTERNAL LLM API PLUG (OPTIONAL)
            </h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The core DRISHTI simulation engine functions 100% offline out-of-the-box using local context rules. Optional external LLM API keys (e.g. Gemini API) can be connected below to enable cloud LLM synthesis.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase block">GEMINI API KEY</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <button
                onClick={saveApiKey}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <span>SAVE KEY</span>}
              </button>
            </div>
            {isSaved && <span className="text-[10px] text-emerald-400 font-bold">API Key saved to local storage!</span>}
          </div>
        </div>

      </div>

    </div>
  );
};
