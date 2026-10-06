import React, { useState, useEffect } from 'react';
import { Eye, Radar, Tag, AlertTriangle, ShieldCheck, CheckCircle2, Play, RefreshCw, Trophy, ArrowRight, Radio, Crosshair, AlertCircle, ChevronRight, HelpCircle, ChevronLeft, Volume2 } from 'lucide-react';
import { 
  ScenarioConfig, 
  AerialThreat, 
  WorkflowPhase, 
  DecisionLogEntry, 
  GroundTruthClass, 
  AARData,
  ReplayFrame
} from '../types';
import { SimulationCanvas } from '../components/simulation/SimulationCanvas';
import { EOIRCameraView } from '../components/simulation/EOIRCameraView';
import { RadarPanel } from '../components/simulation/RadarPanel';
import { WorkflowBar } from '../components/tactical/WorkflowBar';
import { ClassificationModal } from '../components/tactical/ClassificationModal';
import { DecisionActionModal } from '../components/tactical/DecisionActionModal';
import { evaluateClassification, evaluateThreatAssessment, evaluateDecisionAction, compileAARReport } from '../engine/decisionTreeEngine';
import { soundFx } from '../engine/soundEffectsEngine';
import { voiceAssistant } from '../engine/voiceAssistantEngine';

interface SimulationPageProps {
  scenario: ScenarioConfig;
  onFinishScenario: (aar: AARData) => void;
  highlightId?: string | null;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  scenario,
  onFinishScenario,
  highlightId: externalHighlightId
}) => {
  const [activePhase, setActivePhase] = useState<WorkflowPhase>(1);
  const [threats, setThreats] = useState<AerialThreat[]>(scenario.threats);
  const [selectedThreatId, setSelectedThreatId] = useState<string | undefined>(scenario.threats[0]?.id);
  const [viewMode, setViewMode] = useState<'3d' | 'eo_camera'>('3d');
  const [timeSec, setTimeSec] = useState<number>(0);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogEntry[]>([]);
  const [replayFrames, setReplayFrames] = useState<ReplayFrame[]>([]);
  const [scoreSoFar, setScoreSoFar] = useState<number>(100);
  const [internalHighlight, setInternalHighlight] = useState<string | null>(null);
  const [aiGuidanceBanner, setAiGuidanceBanner] = useState<string>('');

  const [isClassifyOpen, setIsClassifyOpen] = useState<boolean>(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState<boolean>(false);

  const selectedThreat = threats.find(t => t.id === selectedThreatId) || threats[0];
  const activeHighlight = externalHighlightId || internalHighlight;

  // RESET ALL SIMULATION STATE WHENEVER SCENARIO CHANGES
  useEffect(() => {
    setActivePhase(1);
    setThreats(scenario.threats);
    setSelectedThreatId(scenario.threats[0]?.id);
    setTimeSec(0);
    setDecisionLogs([]);
    setReplayFrames([]);
    setScoreSoFar(100);
    setInternalHighlight('radar-panel');
  }, [scenario.id, scenario.seed]);

  // Trigger step-by-step guidance
  const triggerGuidance = () => {
    soundFx.playClick();
    const res = voiceAssistant.generateResponse('what to do', {
      currentTab: 'simulation',
      traineeLevel: scenario.assistance === 'full' ? 'beginner' : 'intermediate',
      activeScenario: scenario,
      activePhase,
      selectedThreat
    });
    setAiGuidanceBanner(res.text);
    if (res.highlightId) {
      setInternalHighlight(res.highlightId);
      setTimeout(() => setInternalHighlight(null), 8000);
    }
    voiceAssistant.speak(res.text);
  };

  // AUTOMATIC BEGINNER MODE STEP-BY-STEP HAND-HOLDING INSTRUCTOR GUIDANCE
  useEffect(() => {
    const isBeginner = scenario.assistance === 'full';
    const isIntermediate = scenario.assistance === 'contextual';

    if (isBeginner) {
      switch (activePhase) {
        case 1:
        case 2:
          const text1 = `BEGINNER STEP 1: Look at the 360° Radar Scope highlighted in glowing cyan on the right. Click on track blip '${selectedThreat?.id || 'T-01'}' or click 'LOCK & TRACK TARGET' to lock telemetry.`;
          setAiGuidanceBanner(text1);
          setInternalHighlight('radar-panel');
          voiceAssistant.speak(text1);
          break;
        case 3:
          const text3 = `BEGINNER STEP 2: Telemetry acquired for ${selectedThreat?.id}! Observe speed (${selectedThreat?.speed} km/h) and switch to the EO/IR Thermal Scope on the left to inspect its visual shape.`;
          setAiGuidanceBanner(text3);
          setInternalHighlight('eo-camera-panel');
          voiceAssistant.speak(text3);
          break;
        case 4:
          const text4 = `BEGINNER STEP 3: Click the yellow 'CLASSIFY TARGET PROFILE' button. Look at the RCS (${selectedThreat?.sensorSignature.radarRCS}m²) hint matching ${selectedThreat?.groundTruthClass}.`;
          setAiGuidanceBanner(text4);
          setInternalHighlight('classify-btn');
          voiceAssistant.speak(text4);
          break;
        case 5:
          const text5 = `BEGINNER STEP 4: Assess threat intent. Click 'FLAG HOSTILE' if the drone is approaching your perimeter, or 'FLAG DECOY' if it is non-threat wildlife.`;
          setAiGuidanceBanner(text5);
          setInternalHighlight('assess-btn');
          voiceAssistant.speak(text5);
          break;
        case 6:
          const text6 = `BEGINNER STEP 5: Click the green 'EXECUTE COUNTER-MEASURE' button and select 'Soft-Kill Directional RF Jammer' to neutralize control frequencies.`;
          setAiGuidanceBanner(text6);
          setInternalHighlight('decision-btn');
          voiceAssistant.speak(text6);
          break;
        case 7:
          const nextUnengaged = threats.find(t => t.status !== 'engaged');
          if (nextUnengaged) {
            const text7 = `Target ${selectedThreat?.id} neutralized! Next threat detected: ${nextUnengaged.id}. Click on ${nextUnengaged.id} in the Target Selector strip to repeat defense protocol!`;
            setAiGuidanceBanner(text7);
            voiceAssistant.speak(text7);
          } else {
            const textDone = `All aerial threats neutralized! Click 'FINISH SCENARIO & GENERATE AAR' to inspect your After Action Review report.`;
            setAiGuidanceBanner(textDone);
            voiceAssistant.speak(textDone);
          }
          break;
      }
    } else if (isIntermediate) {
      if (selectedThreat && selectedThreat.sensorSignature.radarRCS < 0.05) {
        setAiGuidanceBanner(`INTERMEDIATE HINT: Target ${selectedThreat.id} displays low RCS (${selectedThreat.sensorSignature.radarRCS}m²). Cross-reference thermal signature before classification.`);
      } else {
        setAiGuidanceBanner(`INTERMEDIATE MODE: Multi-threat environment active. Monitor radar sweep continuously.`);
      }
    }
  }, [activePhase, selectedThreatId, scenario.assistance]);

  // Simulation timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSec(prev => {
        const nextTime = prev + 1;
        
        setReplayFrames(frames => [
          ...frames,
          {
            timestamp: nextTime,
            threats: threats.map(t => ({ id: t.id, position: t.position, status: t.status })),
            userSelectedThreatId: selectedThreatId,
            activePhase,
            scoreSoFar,
            logs: decisionLogs
          }
        ]);

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [threats, selectedThreatId, activePhase, scoreSoFar, decisionLogs]);

  const addLogEntry = (entry: DecisionLogEntry) => {
    setDecisionLogs(prev => [...prev, entry]);
    setScoreSoFar(prev => Math.max(0, prev + entry.scoreImpact));
  };

  // Phase Action Handlers
  const handleDetectTrack = () => {
    if (!selectedThreat) return;
    soundFx.playTargetLock();
    
    setThreats(prev => prev.map(t => t.id === selectedThreat.id ? { ...t, status: 'tracking', detectedAtTime: timeSec } : t));
    
    addLogEntry({
      id: Date.now().toString(),
      timestamp: timeSec,
      phase: 2,
      threatId: selectedThreat.id,
      actionTaken: 'RADAR TRACK LOCK',
      isCorrect: true,
      scoreImpact: 15,
      evidenceProvided: `Acquired radar track ${selectedThreat.id} at altitude ${selectedThreat.altitude}m`,
      nodeDescription: 'OBJECT DETECTED AND LOCKED',
      feedbackText: `Track ${selectedThreat.id} blip locked onto radar scope.`
    });

    setActivePhase(3);
  };

  const handleClassifyTarget = (selectedClass: GroundTruthClass) => {
    if (!selectedThreat) return;
    soundFx.playClick();

    const evalResult = evaluateClassification(selectedThreat, selectedClass, timeSec);
    if (evalResult.isCorrect) soundFx.playSuccess();
    else soundFx.playFailure();

    setThreats(prev => prev.map(t => t.id === selectedThreat.id ? { ...t, userClassification: selectedClass, classifiedAtTime: timeSec } : t));

    addLogEntry({
      id: Date.now().toString(),
      timestamp: timeSec,
      phase: 4,
      threatId: selectedThreat.id,
      actionTaken: `CLASSIFIED AS: ${selectedClass}`,
      isCorrect: evalResult.isCorrect,
      scoreImpact: evalResult.points,
      evidenceProvided: `RCS: ${selectedThreat.sensorSignature.radarRCS}m², Thermal: ${selectedThreat.sensorSignature.thermalSig}/100`,
      nodeDescription: evalResult.isCorrect ? 'ACCURATE CLASSIFICATION' : 'MISCLASSIFICATION ERROR',
      feedbackText: evalResult.feedback
    });

    setActivePhase(5);
  };

  const handleAssessThreat = (assessment: 'hostile' | 'suspicious' | 'friendly' | 'ambiguous') => {
    if (!selectedThreat) return;
    soundFx.playClick();

    const evalResult = evaluateThreatAssessment(selectedThreat, assessment, timeSec);
    if (evalResult.isCorrect) soundFx.playSuccess();
    else soundFx.playFailure();

    setThreats(prev => prev.map(t => t.id === selectedThreat.id ? { ...t, userThreatAssessment: assessment } : t));

    addLogEntry({
      id: Date.now().toString(),
      timestamp: timeSec,
      phase: 5,
      threatId: selectedThreat.id,
      actionTaken: `ASSESSED INTENT AS: ${assessment.toUpperCase()}`,
      isCorrect: evalResult.isCorrect,
      scoreImpact: evalResult.points,
      evidenceProvided: `Flight path heading: ${selectedThreat.direction}°, Speed: ${selectedThreat.speed}km/h`,
      nodeDescription: evalResult.isCorrect ? 'CORRECT INTENT ASSESSMENT' : 'ASSESSMENT ERROR',
      feedbackText: evalResult.feedback
    });

    setActivePhase(6);
  };

  const handleExecuteDecision = (actionName: string) => {
    if (!selectedThreat) return;
    soundFx.playClick();

    const evalResult = evaluateDecisionAction(selectedThreat, actionName, timeSec);
    if (evalResult.isCorrect) soundFx.playSuccess();
    else soundFx.playFailure();

    setThreats(prev => prev.map(t => t.id === selectedThreat.id ? { ...t, userDecision: actionName, decisionAtTime: timeSec, status: 'engaged' } : t));

    addLogEntry({
      id: Date.now().toString(),
      timestamp: timeSec,
      phase: 6,
      threatId: selectedThreat.id,
      actionTaken: `EXECUTED PROTOCOL: ${actionName}`,
      isCorrect: evalResult.isCorrect,
      scoreImpact: evalResult.points,
      evidenceProvided: `Counter-measure protocol deployed against target ${selectedThreat.id}`,
      nodeDescription: evalResult.isCorrect ? 'SUCCESSFUL ENGAGEMENT' : 'ENGAGEMENT FAILURE',
      feedbackText: evalResult.feedback
    });

    setActivePhase(7);

    // AUTO ADVANCE TO NEXT UNENGAGED THREAT IF IN SWARM
    const remainingUnengaged = threats.filter(t => t.id !== selectedThreat.id && t.status !== 'engaged');
    if (remainingUnengaged.length > 0) {
      setTimeout(() => {
        setSelectedThreatId(remainingUnengaged[0].id);
        setActivePhase(2);
      }, 1500);
    }
  };

  const handleCompleteScenario = () => {
    soundFx.playSuccess();
    const aar = compileAARReport(scenario, decisionLogs, replayFrames, timeSec);
    onFinishScenario(aar);
  };

  // Threat navigation helpers
  const handlePrevTarget = () => {
    soundFx.playClick();
    const currIdx = threats.findIndex(t => t.id === selectedThreatId);
    const prevIdx = (currIdx - 1 + threats.length) % threats.length;
    setSelectedThreatId(threats[prevIdx].id);
  };

  const handleNextTarget = () => {
    soundFx.playClick();
    const currIdx = threats.findIndex(t => t.id === selectedThreatId);
    const nextIdx = (currIdx + 1) % threats.length;
    setSelectedThreatId(threats[nextIdx].id);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-mono select-none overflow-hidden">
      
      {/* Top 8-Phase Step Workflow Bar */}
      <WorkflowBar activePhase={activePhase} onSelectPhase={setActivePhase} level={scenario.assistance === 'full' ? 'beginner' : 'intermediate'} />

      {/* AI STEP-BY-STEP HAND-HOLDING GUIDANCE BANNER + 1-CLICK ASSIST BUTTON */}
      {aiGuidanceBanner && (
        <div className="bg-cyan-950/95 border-b border-cyan-500/80 px-4 py-2 flex items-center justify-between text-xs text-cyan-200 shadow-lg animate-pulse z-20">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold leading-tight">{aiGuidanceBanner}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={triggerGuidance}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-3 py-1 rounded-lg text-xs tracking-wider uppercase flex items-center space-x-1 shadow-md transition transform hover:scale-105"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>💡 TELL ME WHAT TO DO NOW</span>
            </button>

            <span className="bg-slate-900 border border-slate-700 text-cyan-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              {scenario.assistance === 'full' ? 'BEGINNER HAND-HOLDING' : 'INTERMEDIATE HINT'}
            </span>
          </div>
        </div>
      )}

      {/* Main Split Workstation */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 p-2 overflow-hidden">
        
        {/* Left 2 Columns: 3D Viewport / EO IR Scope Tab Switcher */}
        <div className={`lg:col-span-2 relative flex flex-col bg-slate-900 border rounded-xl overflow-hidden shadow-2xl transition-all ${
          activeHighlight === 'eo-camera-panel' ? 'border-cyan-400 ring-4 ring-cyan-500/60 animate-pulse' : 'border-slate-800'
        }`}>
          
          {/* Top Switcher Bar */}
          <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-xs z-10">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 rounded font-bold transition flex items-center space-x-1.5 ${
                  viewMode === '3d' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D WORKSTATION VIEW</span>
              </button>
              <button
                onClick={() => setViewMode('eo_camera')}
                className={`px-3 py-1 rounded font-bold transition flex items-center space-x-1.5 ${
                  viewMode === 'eo_camera' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radar className="w-3.5 h-3.5" />
                <span>EO/IR THERMAL SCOPE</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <div>TIME: <span className="text-cyan-400 font-bold">{timeSec}s</span></div>
              <div>LIVE SCORE: <span className="text-emerald-400 font-bold">{scoreSoFar} PTS</span></div>
            </div>
          </div>

          {/* Viewport Content */}
          <div className="flex-1 relative">
            {viewMode === '3d' ? (
              <SimulationCanvas
                scenario={scenario}
                threats={threats}
                selectedThreatId={selectedThreatId}
                onSelectThreat={setSelectedThreatId}
                timeSec={timeSec}
                cameraMode="tactical"
              />
            ) : (
              <EOIRCameraView
                selectedThreat={selectedThreat}
                weather={scenario.weather}
                timeOfDay={scenario.timeOfDay}
              />
            )}
          </div>
        </div>

        {/* Right Column: Target Selector Strip, Radar Scope & Control Dashboard */}
        <div className="flex flex-col space-y-2 h-full overflow-y-auto">
          
          {/* TARGET SELECTION STRIP WITH MULTI-DRONE SWAPPING PREV/NEXT CONTROLS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>MULTIPLE TARGET SELECTION STRIP ({threats.length} DETECTED)</span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={handlePrevTarget} 
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[10px] font-bold flex items-center"
                  title="Previous Target"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>PREV</span>
                </button>
                <button 
                  onClick={handleNextTarget} 
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[10px] font-bold flex items-center"
                  title="Next Target"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {threats.map((t) => {
                const isSelected = t.id === selectedThreatId;
                const isEngaged = t.status === 'engaged';

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedThreatId(t.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400 scale-105 shadow-md'
                        : isEngaged
                        ? 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-cyan-500'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isEngaged ? 'bg-slate-600' : t.isHostile ? 'bg-red-500' : 'bg-blue-400'}`} />
                    <span>{t.id}</span>
                    {isSelected && <span className="text-[9px] font-extrabold uppercase bg-slate-950 text-cyan-300 px-1 rounded">LOCKED</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Tactical Radar Scope with Highlight Effect */}
          <div className={`h-64 rounded-xl transition-all ${
            activeHighlight === 'radar-panel' ? 'ring-4 ring-cyan-400 border-cyan-400 animate-pulse' : ''
          }`}>
            <RadarPanel
              threats={threats}
              selectedThreatId={selectedThreatId}
              onSelectThreat={setSelectedThreatId}
              sensorCondition={scenario.sensorCondition}
            />
          </div>

          {/* Tactical Workflow Action Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 shadow-lg flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">WORKFLOW CONTROL</span>
              <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                PHASE {activePhase} / 8
              </span>
            </div>

            {/* Action Buttons with Dynamic Highlight Animations */}
            <div className="space-y-2">
              
              {/* DETECT TRACK */}
              <button
                onClick={handleDetectTrack}
                disabled={!selectedThreat}
                className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-2 ${
                  activePhase === 2 || activeHighlight === 'detect-btn'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] ring-2 ring-cyan-300 animate-pulse' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Radar className="w-4 h-4" />
                <span>LOCK & TRACK TARGET ({selectedThreat?.id || 'N/A'})</span>
              </button>

              {/* CLASSIFY TARGET */}
              <button
                id="classify-btn"
                onClick={() => setIsClassifyOpen(true)}
                disabled={!selectedThreat}
                className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-2 ${
                  activePhase === 4 || activeHighlight === 'classify-btn'
                    ? 'bg-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.6)] ring-2 ring-yellow-300 animate-pulse' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>CLASSIFY TARGET PROFILE</span>
              </button>

              {/* ASSESS THREAT INTENT */}
              {activePhase >= 5 && (
                <div className={`grid grid-cols-2 gap-2 pt-1 ${activeHighlight === 'assess-btn' ? 'ring-2 ring-red-400 rounded p-1 animate-pulse' : ''}`}>
                  <button
                    id="assess-btn"
                    onClick={() => handleAssessThreat('hostile')}
                    className="p-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 font-bold text-xs rounded transition flex items-center justify-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>FLAG HOSTILE</span>
                  </button>
                  <button
                    onClick={() => handleAssessThreat('friendly')}
                    className="p-2 bg-blue-950 hover:bg-blue-900 border border-blue-700 text-blue-300 font-bold text-xs rounded transition flex items-center justify-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>FLAG DECOY/NON-THREAT</span>
                  </button>
                </div>
              )}

              {/* EXECUTE DECISION ACTION */}
              <button
                id="decision-btn"
                onClick={() => setIsDecisionOpen(true)}
                disabled={!selectedThreat}
                className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-2 ${
                  activePhase === 6 || activeHighlight === 'decision-btn'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-300 animate-pulse' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>EXECUTE COUNTER-MEASURE</span>
              </button>

              {/* COMPLETE SCENARIO & GENERATE AAR */}
              <button
                onClick={handleCompleteScenario}
                className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-extrabold py-3 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg transition"
              >
                <Trophy className="w-4 h-4" />
                <span>FINISH SCENARIO & GENERATE AAR</span>
              </button>

            </div>

            {/* Decision Logs Feed */}
            <div className="border-t border-slate-800 pt-2 space-y-1 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase">REAL-TIME DECISION AUDIT</span>
              {decisionLogs.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No decisions logged yet.</p>
              ) : (
                decisionLogs.map((log) => (
                  <div key={log.id} className="text-[10px] bg-slate-950 p-1.5 rounded border border-slate-800 space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span className={log.isCorrect ? 'text-emerald-400' : 'text-red-400'}>{log.nodeDescription}</span>
                      <span className="text-slate-400">{log.scoreImpact > 0 ? `+${log.scoreImpact}` : log.scoreImpact} PTS</span>
                    </div>
                    <p className="text-slate-300 leading-tight">{log.feedbackText}</p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      {selectedThreat && (
        <>
          <ClassificationModal
            threat={selectedThreat}
            isOpen={isClassifyOpen}
            onClose={() => setIsClassifyOpen(false)}
            onSelectClassification={handleClassifyTarget}
          />
          <DecisionActionModal
            threat={selectedThreat}
            isOpen={isDecisionOpen}
            onClose={() => setIsDecisionOpen(false)}
            onSelectAction={handleExecuteDecision}
          />
        </>
      )}

    </div>
  );
};
