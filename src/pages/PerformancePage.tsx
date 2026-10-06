import React from 'react';
import { BarChart2, TrendingUp, Cpu, Play, Award, Zap, Compass, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { PerformanceHistoryEntry, ScenarioConfig } from '../types';
import { generateAdaptiveRecommendation } from '../engine/adaptiveTrainingEngine';
import { soundFx } from '../engine/soundEffectsEngine';

interface PerformancePageProps {
  history: PerformanceHistoryEntry[];
  onStartScenario: (scenario: ScenarioConfig) => void;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({ history, onStartScenario }) => {
  const adaptiveRec = generateAdaptiveRecommendation(history);

  // Chart Data
  const lineChartData = history.length > 0 ? history.map((h, idx) => ({
    name: `Drill #${idx + 1}`,
    Score: h.overallScore,
    Detection: h.detectionScore,
    Classification: h.classificationScore,
    Decision: h.decisionScore
  })) : [
    { name: 'Drill #1', Score: 61, Detection: 70, Classification: 65, Decision: 55 },
    { name: 'Drill #2', Score: 69, Detection: 75, Classification: 70, Decision: 62 },
    { name: 'Drill #3', Score: 74, Detection: 80, Classification: 76, Decision: 68 },
    { name: 'Drill #4', Score: 81, Detection: 88, Classification: 82, Decision: 75 },
    { name: 'Drill #5', Score: 87, Detection: 91, Classification: 84, Decision: 86 }
  ];

  const radarData = [
    { subject: 'Detection Speed', A: 91, fullMark: 100 },
    { subject: 'Classification Accuracy', A: 84, fullMark: 100 },
    { subject: 'Decision-Making', A: 86, fullMark: 100 },
    { subject: 'Multi-threat Handling', A: 78, fullMark: 100 },
    { subject: 'Environmental Adaptability', A: 89, fullMark: 100 }
  ];

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950 border border-cyan-500 rounded-xl text-cyan-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">PERFORMANCE ANALYTICS & ADAPTIVE ENGINE</h1>
            <p className="text-xs text-slate-400">Track individual readiness trends and launch AI-recommended adaptive drills.</p>
          </div>
        </div>
      </div>

      {/* AI Adaptive Recommendation Generator */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>AI ADAPTIVE RECOMMENDATION ENGINE</span>
          </div>
          <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded text-[10px] font-bold">
            PERFORMANCE-DRIVEN
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">RECOMMENDED FOCUS: {adaptiveRec.focusArea.toUpperCase()}</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{adaptiveRec.reason}</p>
        </div>

        <button
          onClick={() => {
            soundFx.playSuccess();
            onStartScenario(adaptiveRec.recommendedScenario);
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition transform hover:scale-105"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>LAUNCH RECOMMENDED ADAPTIVE SCENARIO</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Session Progression Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">HISTORICAL SCORE PROGRESSION</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="Score" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Detection" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Classification" stroke="#a855f7" strokeWidth={2} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Decision" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Axis Capability Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">5-AXIS CAPABILITY READINESS</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Readiness" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
