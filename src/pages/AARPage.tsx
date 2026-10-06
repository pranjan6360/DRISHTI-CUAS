import React, { useState, useEffect } from 'react';
import { Award, Play, Pause, RotateCcw, Clock, ShieldCheck, AlertTriangle, CheckCircle2, FileText, ArrowRight, Activity } from 'lucide-react';
import { AARData, ReplayFrame } from '../types';
import { soundFx } from '../engine/soundEffectsEngine';

interface AARPageProps {
  aarData: AARData | null;
  onNavigateHome: () => void;
  onStartNewScenario: () => void;
}

export const AARPage: React.FC<AARPageProps> = ({
  aarData,
  onNavigateHome,
  onStartNewScenario
}) => {
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const totalFrames = aarData?.replayFrames.length || 1;

  // Replay playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && totalFrames > 1) {
      interval = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, playbackSpeed]);

  if (!aarData) {
    return (
      <div className="w-full h-full bg-slate-950 text-slate-100 p-8 font-mono flex flex-col items-center justify-center space-y-4">
        <Award className="w-16 h-16 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-300">NO AAR SESSION REPORT LOADED</h2>
        <p className="text-xs text-slate-500">Complete a scenario drill to generate your after-action review analysis.</p>
        <button
          onClick={onStartNewScenario}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs"
        >
          START SCENARIO DRILL
        </button>
      </div>
    );
  }

  const currentFrame: ReplayFrame | undefined = aarData.replayFrames[replayIndex];

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 p-4 md:p-8 font-mono space-y-6 overflow-y-auto select-none">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <Award className="w-4 h-4" />
            <span>AFTER ACTION REVIEW (AAR) DASHBOARD</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
            {aarData.scenarioTitle}
          </h1>
          <p className="text-xs text-slate-400">Completed at {aarData.completedAt} | Duration: {aarData.durationSeconds}s</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onStartNewScenario}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase"
          >
            START ANOTHER DRILL
          </button>
        </div>
      </div>

      {/* Readiness & Capability Score Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-4 space-y-1 shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase">SIMULATED READINESS SCORE</span>
          <p className="text-4xl font-extrabold text-cyan-400">{aarData.metrics.simulatedReadinessScore}%</p>
          <p className="text-[10px] text-emerald-400 font-bold">Simulator Evaluation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">DETECTION SPEED</span>
          <p className="text-3xl font-bold text-emerald-400">{aarData.metrics.detectionTimeAvg}s</p>
          <p className="text-[10px] text-slate-400">Target track lock latency</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">CLASSIFICATION ACCURACY</span>
          <p className="text-3xl font-bold text-purple-400">{aarData.metrics.classificationAccuracy}%</p>
          <p className="text-[10px] text-slate-400">Profile discrimination</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">DECISION ACCURACY</span>
          <p className="text-3xl font-bold text-amber-400">{aarData.metrics.decisionAccuracy}%</p>
          <p className="text-[10px] text-slate-400">Counter-measure protocol</p>
        </div>

      </div>

      {/* Trajectory Replay Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-sm tracking-wider uppercase">SCENARIO TRAJECTORY REPLAY</h2>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-lg text-xs font-bold flex items-center space-x-1"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
            </button>

            <button
              onClick={() => { setReplayIndex(0); setIsPlaying(false); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg text-xs"
              title="Restart Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-cyan-400 rounded px-2 py-1.5 text-xs font-bold"
            >
              <option value={1}>1X SPEED</option>
              <option value={2}>2X SPEED</option>
              <option value={4}>4X SPEED</option>
            </select>
          </div>
        </div>

        {/* Replay Scrubber Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>TIMESTAMP: {currentFrame ? `${currentFrame.timestamp}s` : '0s'}</span>
            <span>TOTAL: {aarData.durationSeconds}s</span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalFrames - 1)}
            value={replayIndex}
            onChange={(e) => setReplayIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* 2D Trajectory Replay Visual Map */}
        <div className="relative w-full h-64 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
          <div className="absolute w-48 h-48 rounded-full border border-emerald-500/20" />
          <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 z-10" />

          {/* Render Replay Threat Positions */}
          {currentFrame?.threats.map((t) => {
            const [x, y] = t.position;
            const blipX = x / 40;
            const blipY = -y / 40;

            return (
              <div
                key={t.id}
                style={{ transform: `translate(${blipX}px, ${blipY}px)` }}
                className="absolute w-4 h-4 rounded-full bg-cyan-400 ring-4 ring-cyan-500/40 flex items-center justify-center transition-all duration-300"
              >
                <span className="text-[8px] font-bold text-slate-950">{t.id}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Decision Tree Timeline Audit */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-slate-100 text-sm tracking-wider uppercase">DECISION TREE EVENT TIMELINE</h2>
        </div>

        <div className="space-y-2 text-xs">
          {aarData.decisionLogs.length === 0 ? (
            <p className="text-slate-500 italic">No events logged during scenario.</p>
          ) : (
            aarData.decisionLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start justify-between space-x-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {log.timestamp}s
                    </span>
                    <span className="font-bold text-slate-200">{log.actionTaken}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.feedbackText}</p>
                </div>

                <span className={`font-bold px-2 py-1 rounded text-[10px] ${log.isCorrect ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-red-950 text-red-400 border border-red-700'}`}>
                  {log.scoreImpact > 0 ? `+${log.scoreImpact}` : log.scoreImpact} PTS
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
