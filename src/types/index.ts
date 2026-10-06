export type NavigationTab = 
  | 'intro'
  | 'level-select'
  | 'home' 
  | 'train-config' 
  | 'simulation' 
  | 'battlefield' 
  | 'performance' 
  | 'aar' 
  | 'profile' 
  | 'settings';

export type TrainingLevel = 'beginner' | 'intermediate' | 'professional';

export type TimeOfDay = 'day' | 'evening' | 'night';

export type EnvironmentType = 'rural' | 'urban' | 'mountain' | 'open' | 'critical_infra';

export type WeatherCondition = 'clear' | 'sunlight' | 'rain' | 'fog' | 'low_vis' | 'dust';

export type SensorCondition = 
  | 'normal' 
  | 'slight_degradation' 
  | 'moderate_degradation' 
  | 'severe_degradation';

export type ThreatType = 
  | 'slow_multirotor' 
  | 'fast_aerial' 
  | 'maneuvering' 
  | 'unknown' 
  | 'swarm' 
  | 'decoy';

export type GroundTruthClass = 
  | 'Micro Multirotor (Quad/Hex)' 
  | 'Fixed-Wing Recon UAV' 
  | 'Fast Strike Aerial Object' 
  | 'Swarm Element Drone' 
  | 'Decoy / Wildlife / Non-Threat';

export type ThreatBehavior = 
  | 'straight' 
  | 'gradual_turn' 
  | 'altitude_change' 
  | 'variable_speed' 
  | 'sensor_evasion' 
  | 'swarming' 
  | 'erratic';

export type ThreatStatus = 'undetected' | 'detected' | 'tracking' | 'classified' | 'engaged' | 'escaped';

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'adaptive';

export type AssistanceLevel = 'full' | 'contextual' | 'minimal' | 'assessment';

export type WorkflowPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface TraineeProfile {
  name: string;
  rank: string;
  serviceId: string;
  unit: string;
  branch: 'Indian Army' | 'Indian Air Force' | 'Indian Navy' | 'Indian Coast Guard' | 'Special Forces';
  baseLocation: string;
}

export interface TrajectoryPoint {
  time: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  heading: number;
}

export interface AerialThreat {
  id: string; // e.g. T-01
  type: ThreatType;
  groundTruthClass: GroundTruthClass;
  position: [number, number, number]; // [x, y, z] in simulation coords
  altitude: number; // meters
  velocity: [number, number, number];
  speed: number; // km/h or m/s
  direction: number; // heading in degrees 0-360
  trajectory: TrajectoryPoint[];
  visibility: number; // 0.0 to 1.0 based on weather/sensors
  sensorSignature: {
    radarRCS: number; // m^2 equivalent
    thermalSig: number; // 0-100
    acousticSig: number; // 0-100
    rfFrequency: string; // e.g. "2.4 GHz" or "5.8 GHz" or "Hopping"
  };
  classification?: GroundTruthClass;
  userClassification?: GroundTruthClass;
  isHostile: boolean;
  userThreatAssessment?: 'hostile' | 'suspicious' | 'friendly' | 'ambiguous';
  userDecision?: string; // abstract engagement choice
  threatState: 'approaching' | 'holding' | 'loitering' | 'attacking' | 'retreating';
  confidence: number; // 0 - 100% confidence calculated by sensor engine
  behavior: ThreatBehavior;
  spawnTime: number; // seconds into scenario
  status: ThreatStatus;
  detectedAtTime?: number; // timestamp in seconds
  classifiedAtTime?: number;
  decisionAtTime?: number;
  sizeMeters: number;
  colorHex: string;
}

export interface ScenarioConfig {
  id: string;
  title: string;
  description: string;
  isProcedural: boolean;
  seed?: number;
  timeOfDay: TimeOfDay;
  environment: EnvironmentType;
  weather: WeatherCondition;
  visibility: number; // 0 to 100
  sensorCondition: SensorCondition;
  threatCount: number; // 1 to 10
  threatType: ThreatType;
  difficulty: Difficulty;
  assistance: AssistanceLevel;
  durationSeconds: number;
  threats: AerialThreat[];
}

export interface DecisionLogEntry {
  id: string;
  timestamp: number; // scenario time seconds
  phase: WorkflowPhase;
  threatId: string;
  actionTaken: string;
  isCorrect: boolean;
  scoreImpact: number;
  evidenceProvided: string;
  nodeDescription: string;
  feedbackText: string;
}

export interface ScoreMetrics {
  detectionTimeAvg: number; // seconds
  classificationAccuracy: number; // 0-100%
  decisionAccuracy: number; // 0-100%
  falseAlarmRate: number; // 0-100%
  trackContinuity: number; // 0-100%
  responseTimeAvg: number; // seconds
  overallScore: number; // 0-100
  simulatedReadinessScore: number; // 0-100%
}

export interface ReplayFrame {
  timestamp: number;
  threats: Array<{
    id: string;
    position: [number, number, number];
    status: ThreatStatus;
  }>;
  userSelectedThreatId?: string;
  activePhase: WorkflowPhase;
  scoreSoFar: number;
  logs: DecisionLogEntry[];
}

export interface AARData {
  scenarioId: string;
  scenarioTitle: string;
  completedAt: string;
  durationSeconds: number;
  threatCount: number;
  environment: EnvironmentType;
  weather: WeatherCondition;
  sensorCondition: SensorCondition;
  difficulty: Difficulty;
  level: TrainingLevel;
  metrics: ScoreMetrics;
  decisionLogs: DecisionLogEntry[];
  replayFrames: ReplayFrame[];
  aiSummary: string;
  keyStrengths: string[];
  keyWeaknesses: string[];
  recommendedFocus: string;
}

export interface PerformanceHistoryEntry {
  id: string;
  date: string;
  scenarioTitle: string;
  level: TrainingLevel;
  overallScore: number;
  detectionScore: number;
  classificationScore: number;
  decisionScore: number;
  threatsCount: number;
  environment: EnvironmentType;
  weather: WeatherCondition;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: 'instruction' | 'hint' | 'feedback' | 'system';
  highlightElementId?: string;
}

export interface AdaptiveRecommendation {
  focusArea: string;
  reason: string;
  recommendedScenario: ScenarioConfig;
}
