import { PerformanceHistoryEntry, AdaptiveRecommendation, ScenarioConfig } from '../types';
import { generateProceduralScenario } from './scenarioEngine';

export function generateAdaptiveRecommendation(
  history: PerformanceHistoryEntry[]
): AdaptiveRecommendation {
  if (history.length === 0) {
    const defaultScenario = generateProceduralScenario({
      environment: 'urban',
      weather: 'clear',
      threatCount: 2,
      difficulty: 'easy',
      assistance: 'full'
    });
    return {
      focusArea: 'Baseline Drone Recognition & Tracking',
      reason: 'First-time trainee setup. Recommended starter scenario to establish target classification proficiency.',
      recommendedScenario: defaultScenario
    };
  }

  // Calculate average performance metrics across past sessions
  const avgDetection = history.reduce((acc, h) => acc + h.detectionScore, 0) / history.length;
  const avgClassification = history.reduce((acc, h) => acc + h.classificationScore, 0) / history.length;
  const avgDecision = history.reduce((acc, h) => acc + h.decisionScore, 0) / history.length;

  let focusArea = 'Multi-Threat Swarm Defense';
  let reason = 'High baseline performance. Scaling to multi-target swarm scenario in degraded environment.';
  let targetEnv: ScenarioConfig['environment'] = 'critical_infra';
  let targetWeather: ScenarioConfig['weather'] = 'fog';
  let targetSensor: ScenarioConfig['sensorCondition'] = 'moderate_degradation';
  let threatCount = 4;
  let difficulty: ScenarioConfig['difficulty'] = 'hard';

  // Find lowest capability area
  if (avgDecision <= avgClassification && avgDecision <= avgDetection) {
    focusArea = 'Engagement Decision & Counter-Measure Selection';
    reason = `Recent decision accuracy (${Math.round(avgDecision)}%) trails classification. Scenario focused on rapid threat assessment and non-threat decoy discrimination.`;
    targetWeather = 'sunlight';
    targetSensor = 'slight_degradation';
    threatCount = 3;
    difficulty = 'moderate';
  } else if (avgClassification <= avgDetection) {
    focusArea = 'Low-Visibility Target Classification';
    reason = `Target classification score (${Math.round(avgClassification)}%) decreased during degraded sensor conditions. Scenario focused on thermal optical discrimination in heavy fog.`;
    targetWeather = 'fog';
    targetSensor = 'severe_degradation';
    threatCount = 3;
    difficulty = 'hard';
  } else if (avgDetection < 75) {
    focusArea = 'Radar Track Detection & Scan Speed';
    reason = `Average detection speed score (${Math.round(avgDetection)}%) indicates track dropouts. Scenario focused on continuous radar sweep vigilance.`;
    targetWeather = 'dust';
    targetSensor = 'slight_degradation';
    threatCount = 2;
    difficulty = 'moderate';
  }

  const recommendedScenario = generateProceduralScenario({
    environment: targetEnv,
    weather: targetWeather,
    sensorCondition: targetSensor,
    threatCount,
    difficulty,
    assistance: 'contextual'
  });

  recommendedScenario.title = `ADAPTIVE OP: ${focusArea.toUpperCase()}`;
  recommendedScenario.description = `AI-generated scenario specifically customized based on your performance history (${history.length} completed sessions).`;

  return {
    focusArea,
    reason,
    recommendedScenario
  };
}
