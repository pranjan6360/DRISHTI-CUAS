import { 
  AerialThreat, 
  GroundTruthClass, 
  DecisionLogEntry, 
  ScoreMetrics, 
  WorkflowPhase, 
  ScenarioConfig,
  AARData,
  ReplayFrame
} from '../types';

export function evaluateClassification(
  threat: AerialThreat,
  selectedClass: GroundTruthClass,
  elapsedSeconds: number
): { isCorrect: boolean; points: number; feedback: string } {
  const isCorrect = threat.groundTruthClass === selectedClass;
  let points = isCorrect ? 25 : -15;

  let feedback = '';
  if (isCorrect) {
    feedback = `ACCURATE CLASSIFICATION: Target ${threat.id} correctly identified as ${selectedClass}.`;
  } else {
    feedback = `MISCLASSIFICATION: Target ${threat.id} selected as "${selectedClass}", but ground truth sensor analysis indicates "${threat.groundTruthClass}".`;
  }

  return { isCorrect, points, feedback };
}

export function evaluateThreatAssessment(
  threat: AerialThreat,
  assessment: 'hostile' | 'suspicious' | 'friendly' | 'ambiguous',
  elapsedSeconds: number
): { isCorrect: boolean; points: number; feedback: string } {
  const isActuallyHostile = threat.isHostile;
  const isCorrect = (isActuallyHostile && assessment === 'hostile') || (!isActuallyHostile && assessment === 'friendly');

  let points = 0;
  let feedback = '';

  if (isActuallyHostile) {
    if (assessment === 'hostile') {
      points = 20;
      feedback = `CORRECT THREAT ASSESSMENT: Hostile track ${threat.id} correctly flagged for engagement protocol.`;
    } else {
      points = -20;
      feedback = `THREAT UNDERESTIMATION: Hostile track ${threat.id} marked as ${assessment.toUpperCase()}. Tactical vulnerability window opened!`;
    }
  } else {
    if (assessment === 'friendly' || assessment === 'ambiguous') {
      points = 20;
      feedback = `CORRECT ASSESSMENT: Non-threat track ${threat.id} correctly recognized. False alarm avoided.`;
    } else {
      points = -25;
      feedback = `FALSE POSITIVE ASSESSMENT: Civilian/Decoy track ${threat.id} incorrectly flagged as HOSTILE.`;
    }
  }

  return { isCorrect, points, feedback };
}

export function evaluateDecisionAction(
  threat: AerialThreat,
  decisionAction: string, // e.g. "Soft-Kill RF Jamming", "Kinetic Net Catch", "Track & Monitor", "Command Alert"
  elapsedSeconds: number
): { isCorrect: boolean; points: number; feedback: string } {
  const isHostile = threat.isHostile;
  let isCorrect = false;
  let points = 0;
  let feedback = '';

  if (isHostile) {
    if (['Soft-Kill Directional RF Jammer', 'Kinetic Catch Net System', 'Simulated Kinetic Interceptor'].includes(decisionAction)) {
      isCorrect = true;
      points = 30;
      feedback = `SUCCESSFUL SIMULATED ENGAGEMENT: Neutralized hostile ${threat.groundTruthClass} via ${decisionAction}.`;
    } else if (decisionAction === 'Track & Monitor') {
      isCorrect = false;
      points = -10;
      feedback = `TACTICAL HESITATION: Tracked hostile drone ${threat.id} without taking simulated containment action.`;
    } else {
      isCorrect = true;
      points = 15;
      feedback = `ALERT ISSUED: Command notified of hostile ${threat.id}.`;
    }
  } else {
    // Decoy / Wildlife
    if (decisionAction === 'Track & Monitor' || decisionAction === 'Command Alert') {
      isCorrect = true;
      points = 25;
      feedback = `PRUDENT DECISION: Non-hostile object ${threat.id} monitored without wasting counter-measures or causing collateral disruption.`;
    } else {
      isCorrect = false;
      points = -35;
      feedback = `FALSE ENGAGEMENT ERROR: Executed ${decisionAction} against non-threat track ${threat.id}! Resource wasted & civilian protocol violated.`;
    }
  }

  return { isCorrect, points, feedback };
}

export function calculateScoreMetrics(
  scenario: ScenarioConfig,
  decisionLogs: DecisionLogEntry[],
  totalTimeSec: number
): ScoreMetrics {
  const totalThreats = scenario.threats.length;
  
  // Filter classification logs
  const classLogs = decisionLogs.filter(l => l.phase === 4);
  const correctClasses = classLogs.filter(l => l.isCorrect).length;
  const classificationAccuracy = classLogs.length > 0 
    ? Math.round((correctClasses / classLogs.length) * 100)
    : 80;

  // Filter decision logs
  const decisionLogsFiltered = decisionLogs.filter(l => l.phase === 6);
  const correctDecisions = decisionLogsFiltered.filter(l => l.isCorrect).length;
  const decisionAccuracy = decisionLogsFiltered.length > 0 
    ? Math.round((correctDecisions / decisionLogsFiltered.length) * 100)
    : 85;

  // Detection speed (avg seconds to detect)
  const detectLogs = decisionLogs.filter(l => l.phase === 2);
  const avgDetectionTime = detectLogs.length > 0
    ? Number((detectLogs.reduce((acc, l) => acc + l.timestamp, 0) / detectLogs.length).toFixed(1))
    : 8.5;

  // False alarms
  const falseAlarms = decisionLogs.filter(l => l.nodeDescription.includes('FALSE')).length;
  const falseAlarmRate = Math.min(100, Math.round((falseAlarms / Math.max(1, totalThreats)) * 100));

  // Response time avg
  const avgResponseTime = Number((avgDetectionTime + 6.2).toFixed(1));

  // Track continuity
  const trackContinuity = Math.max(60, 100 - Math.round((scenario.visibility < 50 ? 25 : 5)));

  // Net raw score calculation
  const totalPoints = decisionLogs.reduce((acc, l) => acc + l.scoreImpact, 0);
  const maxPossiblePoints = totalThreats * 75;
  const rawScorePct = Math.max(0, Math.min(100, Math.round((totalPoints / Math.max(1, maxPossiblePoints)) * 100 + 40)));

  // Simulated Training Readiness score calculation
  const simulatedReadinessScore = Math.round(
    classificationAccuracy * 0.3 +
    decisionAccuracy * 0.35 +
    (100 - falseAlarmRate) * 0.15 +
    trackContinuity * 0.2
  );

  return {
    detectionTimeAvg: avgDetectionTime,
    classificationAccuracy,
    decisionAccuracy,
    falseAlarmRate,
    trackContinuity,
    responseTimeAvg: avgResponseTime,
    overallScore: rawScorePct,
    simulatedReadinessScore
  };
}

export function compileAARReport(
  scenario: ScenarioConfig,
  decisionLogs: DecisionLogEntry[],
  replayFrames: ReplayFrame[],
  totalTimeSec: number
): AARData {
  const metrics = calculateScoreMetrics(scenario, decisionLogs, totalTimeSec);

  const keyStrengths: string[] = [];
  const keyWeaknesses: string[] = [];

  if (metrics.detectionTimeAvg < 10) keyStrengths.push('Rapid Detection Speed under 10 seconds');
  if (metrics.classificationAccuracy >= 85) keyStrengths.push('High Target Classification Precision');
  if (metrics.decisionAccuracy >= 85) keyStrengths.push('Tactically Sound Engagement Decisions');
  if (metrics.falseAlarmRate === 0) keyStrengths.push('Zero False Positives / Decoy Discipline');

  if (metrics.classificationAccuracy < 75) keyWeaknesses.push('Target Classification ambiguity in degraded visibility');
  if (metrics.falseAlarmRate > 20) keyWeaknesses.push('Premature engagement of decoy tracks');
  if (metrics.decisionAccuracy < 70) keyWeaknesses.push('Hesitation or incorrect counter-measure selection');
  if (metrics.detectionTimeAvg > 12) keyWeaknesses.push('Delayed radar track acquisition');

  if (keyStrengths.length === 0) keyStrengths.push('Maintained situational awareness baseline');
  if (keyWeaknesses.length === 0) keyWeaknesses.push('Minor response latency during multi-threat split focus');

  let recommendedFocus = 'Maintain current tactical proficiency across all threat profiles.';
  if (metrics.classificationAccuracy < 80) {
    recommendedFocus = 'Practice EO/IR thermal inspection on multirotor vs fixed-wing signatures in heavy fog.';
  } else if (metrics.falseAlarmRate > 15) {
    recommendedFocus = 'Focus on decoy identification and non-threat track verification before initiating jamming.';
  } else if (metrics.decisionAccuracy < 80) {
    recommendedFocus = 'Review rules of engagement for soft-kill vs kinetic net capture protocols.';
  }

  const aiSummary = `Trainee completed scenario "${scenario.title}" in ${totalTimeSec} seconds with an overall readiness score of ${metrics.simulatedReadinessScore}%. Detection average was ${metrics.detectionTimeAvg}s. Target classification accuracy reached ${metrics.classificationAccuracy}%, while decision-making precision scored ${metrics.decisionAccuracy}%.`;

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    durationSeconds: totalTimeSec,
    threatCount: scenario.threatCount,
    environment: scenario.environment,
    weather: scenario.weather,
    sensorCondition: scenario.sensorCondition,
    difficulty: scenario.difficulty,
    level: scenario.assistance === 'full' ? 'beginner' : scenario.assistance === 'contextual' ? 'intermediate' : 'professional',
    metrics,
    decisionLogs,
    replayFrames,
    aiSummary,
    keyStrengths,
    keyWeaknesses,
    recommendedFocus
  };
}
