import React, { useState } from 'react';
import { Sliders, Sun, Moon, Cloud, ShieldAlert, Cpu, Play, CheckCircle2 } from 'lucide-react';
import { 
  ScenarioConfig, 
  TimeOfDay, 
  EnvironmentType, 
  WeatherCondition, 
  SensorCondition, 
  ThreatType, 
  Difficulty, 
  AssistanceLevel 
} from '../types';
import { generateProceduralScenario } from '../engine/scenarioEngine';
import { soundFx } from '../engine/soundEffectsEngine';

interface TrainConfigPageProps {
  onStartScenario: (scenario: ScenarioConfig) => void;
}

export const TrainConfigPage: React.FC<TrainConfigPageProps> = ({ onStartScenario }) => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [environment, setEnvironment] = useState<EnvironmentType>('urban');
  const [weather, setWeather] = useState<WeatherCondition>('clear');
  const [sensorCondition, setSensorCondition] = useState<SensorCondition>('normal');
  const [threatCount, setThreatCount] = useState<number>(3);
  const [threatType, setThreatType] = useState<ThreatType>('unknown');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [assistance, setAssistance] = useState<AssistanceLevel>('contextual');

  const liveConfig = generateProceduralScenario({
    timeOfDay,
    environment,
    weather,
    sensorCondition,
    threatCount,
    threatType,
    difficulty,
    assistance
  });

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950 border border-cyan-500 rounded-xl text-cyan-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">TRAIN ME — SCENARIO CONFIGURATOR</h1>
            <p className="text-xs text-slate-400">Configure environmental conditions, threat profiles, and AI assistance level.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Config Controls */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* 1. TIME OF DAY */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">1. TIME OF DAY</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'day', label: 'Afternoon / Day', icon: Sun },
                { id: 'evening', label: 'Evening', icon: Sun },
                { id: 'night', label: 'Night', icon: Moon }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { soundFx.playClick(); setTimeOfDay(item.id as TimeOfDay); }}
                  className={`p-3 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    timeOfDay === item.id 
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. ENVIRONMENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">2. OPERATIONAL ENVIRONMENT</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'urban', label: 'Urban' },
                { id: 'rural', label: 'Rural' },
                { id: 'mountain', label: 'Mountain' },
                { id: 'open', label: 'Open Terrain' },
                { id: 'critical_infra', label: 'Critical Infra' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { soundFx.playClick(); setEnvironment(item.id as EnvironmentType); }}
                  className={`p-2.5 rounded-lg border font-bold transition ${
                    environment === item.id 
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. WEATHER / VISIBILITY */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">3. WEATHER & VISIBILITY</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              {[
                { id: 'clear', label: 'Clear' },
                { id: 'sunlight', label: 'Sun Glare' },
                { id: 'rain', label: 'Rain' },
                { id: 'fog', label: 'Heavy Fog' },
                { id: 'low_vis', label: 'Low Vis' },
                { id: 'dust', label: 'Dust Storm' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { soundFx.playClick(); setWeather(item.id as WeatherCondition); }}
                  className={`p-2 rounded-lg border font-bold transition ${
                    weather === item.id 
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. SENSOR CONDITION */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">4. SENSOR DEGRADATION CONDITION</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'normal', label: 'Normal Sensors' },
                { id: 'slight_degradation', label: 'Slight Noise' },
                { id: 'moderate_degradation', label: 'Moderate Noise' },
                { id: 'severe_degradation', label: 'Severe Noise' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { soundFx.playClick(); setSensorCondition(item.id as SensorCondition); }}
                  className={`p-2.5 rounded-lg border font-bold transition ${
                    sensorCondition === item.id 
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. THREAT COUNT (1-10 Slider) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 uppercase tracking-wider">5. SIMULATED THREAT COUNT</label>
              <span className="bg-cyan-950 border border-cyan-700 text-cyan-400 font-bold px-2 py-0.5 rounded text-sm">
                {threatCount} TARGETS
              </span>
            </div>
            <input 
              type="range"
              min="1"
              max="10"
              value={threatCount}
              onChange={(e) => setThreatCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* 6. ASSISTANCE LEVEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">6. AI ASSISTANCE LEVEL</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'full', label: 'Full AI Guidance' },
                { id: 'contextual', label: 'Contextual Hints' },
                { id: 'minimal', label: 'Minimal Guidance' },
                { id: 'assessment', label: 'Assessment Mode' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { soundFx.playClick(); setAssistance(item.id as AssistanceLevel); }}
                  className={`p-2.5 rounded-lg border font-bold transition ${
                    assistance === item.id 
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: LIVE SCENARIO SUMMARY */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-6 shadow-2xl space-y-5 sticky top-6">
            
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-slate-100 text-sm tracking-wider uppercase">LIVE SCENARIO SUMMARY</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">TIME OF DAY:</span>
                <span className="font-bold text-cyan-300 uppercase">{timeOfDay}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">ENVIRONMENT:</span>
                <span className="font-bold text-cyan-300 uppercase">{environment.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">WEATHER:</span>
                <span className="font-bold text-cyan-300 uppercase">{weather}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">VISIBILITY:</span>
                <span className="font-bold text-amber-400">{liveConfig.visibility}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">SIMULATED THREATS:</span>
                <span className="font-bold text-red-400">{threatCount} OBJECTS</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">SENSOR CONDITION:</span>
                <span className="font-bold text-slate-200 uppercase">{sensorCondition.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">AI ASSISTANCE:</span>
                <span className="font-bold text-emerald-400 uppercase">{assistance}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playSuccess();
                onStartScenario(liveConfig);
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold py-4 rounded-xl text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START TRAINING</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
