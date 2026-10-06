import { 
  ScenarioConfig, 
  AerialThreat, 
  ThreatType, 
  GroundTruthClass, 
  ThreatBehavior, 
  EnvironmentType, 
  TimeOfDay, 
  WeatherCondition, 
  SensorCondition, 
  Difficulty, 
  AssistanceLevel 
} from '../types';

// Seeded random helper for reproducible procedural scenarios
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const THREAT_PRESETS: Array<{
  type: ThreatType;
  groundTruthClass: GroundTruthClass;
  isHostile: boolean;
  baseRCS: number;
  baseThermal: number;
  baseSpeed: number; // m/s
  baseAltitude: number; // m
  sizeMeters: number;
  colorHex: string;
}> = [
  {
    type: 'slow_multirotor',
    groundTruthClass: 'Micro Multirotor (Quad/Hex)',
    isHostile: true,
    baseRCS: 0.05,
    baseThermal: 35,
    baseSpeed: 12,
    baseAltitude: 60,
    sizeMeters: 0.8,
    colorHex: '#ef4444' // Red
  },
  {
    type: 'fast_aerial',
    groundTruthClass: 'Fast Strike Aerial Object',
    isHostile: true,
    baseRCS: 0.25,
    baseThermal: 85,
    baseSpeed: 45,
    baseAltitude: 180,
    sizeMeters: 1.8,
    colorHex: '#f97316' // Orange
  },
  {
    type: 'maneuvering',
    groundTruthClass: 'Fixed-Wing Recon UAV',
    isHostile: true,
    baseRCS: 0.15,
    baseThermal: 55,
    baseSpeed: 28,
    baseAltitude: 140,
    sizeMeters: 1.5,
    colorHex: '#eab308' // Yellow
  },
  {
    type: 'swarm',
    groundTruthClass: 'Swarm Element Drone',
    isHostile: true,
    baseRCS: 0.03,
    baseThermal: 30,
    baseSpeed: 18,
    baseAltitude: 90,
    sizeMeters: 0.6,
    colorHex: '#a855f7' // Purple
  },
  {
    type: 'decoy',
    groundTruthClass: 'Decoy / Wildlife / Non-Threat',
    isHostile: false,
    baseRCS: 0.08,
    baseThermal: 40,
    baseSpeed: 15,
    baseAltitude: 80,
    sizeMeters: 1.0,
    colorHex: '#3b82f6' // Blue
  },
  {
    type: 'unknown',
    groundTruthClass: 'Fixed-Wing Recon UAV',
    isHostile: true,
    baseRCS: 0.12,
    baseThermal: 50,
    baseSpeed: 22,
    baseAltitude: 120,
    sizeMeters: 1.2,
    colorHex: '#06b6d4' // Cyan
  }
];

export function generateTrajectory(
  startPos: [number, number, number],
  speed: number,
  headingDeg: number,
  behavior: ThreatBehavior,
  durationSec: number = 120
) {
  const points = [];
  let currX = startPos[0];
  let currY = startPos[1];
  let currZ = startPos[2];
  let currHeading = headingDeg;
  let currSpeed = speed;

  const step = 2; // record every 2s
  for (let t = 0; t <= durationSec; t += step) {
    // Modify heading & altitude based on behavior
    if (behavior === 'gradual_turn') {
      currHeading += 1.5 * step;
    } else if (behavior === 'altitude_change') {
      currZ += Math.sin(t * 0.1) * 2;
    } else if (behavior === 'variable_speed') {
      currSpeed = speed + Math.sin(t * 0.2) * (speed * 0.4);
    } else if (behavior === 'swarming') {
      currHeading += (Math.random() - 0.5) * 8;
      currZ += (Math.random() - 0.5) * 1.5;
    } else if (behavior === 'erratic') {
      currHeading += (Math.random() - 0.5) * 15;
      currSpeed += (Math.random() - 0.5) * 5;
    }

    const rad = (currHeading * Math.PI) / 180;
    currX += Math.cos(rad) * currSpeed * step;
    currY += Math.sin(rad) * currSpeed * step;
    currZ = Math.max(15, Math.min(400, currZ)); // clamp altitude

    points.push({
      time: t,
      x: currX,
      y: currY,
      z: currZ,
      speed: Math.round(currSpeed * 3.6), // convert m/s to km/h for UI display
      heading: Math.round((currHeading % 360 + 360) % 360)
    });
  }

  return points;
}

export function generateSingleThreat(
  idIndex: number,
  presetType?: ThreatType,
  seed?: number
): AerialThreat {
  const randFunc = seed !== undefined ? () => seededRandom(seed + idIndex * 17) : Math.random;
  
  const preset = presetType 
    ? (THREAT_PRESETS.find(p => p.type === presetType) || THREAT_PRESETS[0])
    : THREAT_PRESETS[Math.floor(randFunc() * THREAT_PRESETS.length)];

  const id = `T-0${idIndex + 1}`;
  
  // Random spawn angle & distance (within 1.5km to 4.5km radius)
  const spawnAngle = randFunc() * Math.PI * 2;
  const spawnDist = 1200 + randFunc() * 3000;
  
  const x = Math.cos(spawnAngle) * spawnDist;
  const y = Math.sin(spawnAngle) * spawnDist;
  const altitude = Math.round(preset.baseAltitude + (randFunc() - 0.5) * 40);

  // Velocity heading toward center (with slight offset)
  const centerHeadingDeg = ((Math.atan2(-y, -x) * 180) / Math.PI + 360) % 360;
  const offsetDeg = (randFunc() - 0.5) * 40;
  const headingDeg = (centerHeadingDeg + offsetDeg + 360) % 360;

  const behaviors: ThreatBehavior[] = [
    'straight', 'gradual_turn', 'altitude_change', 'variable_speed', 'swarming', 'erratic'
  ];
  const behavior = behaviors[Math.floor(randFunc() * behaviors.length)];

  const rad = (headingDeg * Math.PI) / 180;
  const speed = preset.baseSpeed + (randFunc() - 0.5) * 5;
  const vx = Math.cos(rad) * speed;
  const vy = Math.sin(rad) * speed;

  const trajectory = generateTrajectory([x, y, altitude], speed, headingDeg, behavior, 180);

  const rfFreqs = ['2.4 GHz ISM', '5.8 GHz ISM', '433 MHz Telemetry', 'Frequency Hopping Spread Spectrum', '915 MHz Long-Range'];

  return {
    id,
    type: preset.type,
    groundTruthClass: preset.groundTruthClass,
    position: [x, y, altitude],
    altitude,
    velocity: [vx, vy, 0],
    speed: Math.round(speed * 3.6),
    direction: Math.round(headingDeg),
    trajectory,
    visibility: 0.9,
    sensorSignature: {
      radarRCS: Number((preset.baseRCS * (0.8 + randFunc() * 0.4)).toFixed(3)),
      thermalSig: Math.round(preset.baseThermal + (randFunc() - 0.5) * 10),
      acousticSig: Math.round(30 + randFunc() * 50),
      rfFrequency: rfFreqs[Math.floor(randFunc() * rfFreqs.length)]
    },
    isHostile: preset.isHostile,
    threatState: preset.isHostile ? 'approaching' : 'loitering',
    confidence: Math.round(65 + randFunc() * 25),
    behavior,
    spawnTime: idIndex * 4, // staggered spawn
    status: 'undetected',
    sizeMeters: preset.sizeMeters,
    colorHex: preset.colorHex
  };
}

export function generateProceduralScenario(config: Partial<ScenarioConfig>): ScenarioConfig {
  const seed = config.seed ?? Math.floor(Math.random() * 999999);

  const timeOfDay = config.timeOfDay || 'day';
  const environment = config.environment || 'urban';
  const weather = config.weather || 'clear';
  const sensorCondition = config.sensorCondition || 'normal';
  const threatCount = config.threatCount || 3;
  const difficulty = config.difficulty || 'moderate';
  const assistance = config.assistance || 'contextual';
  const threatType = config.threatType || 'unknown';

  const threats: AerialThreat[] = [];
  for (let i = 0; i < threatCount; i++) {
    threats.push(generateSingleThreat(i, threatType !== 'unknown' ? threatType : undefined, seed + i * 31));
  }

  // Calculate overall visibility based on weather
  let visibility = 100;
  if (weather === 'fog') visibility = 35;
  else if (weather === 'low_vis') visibility = 25;
  else if (weather === 'rain') visibility = 50;
  else if (weather === 'dust') visibility = 40;
  else if (weather === 'sunlight') visibility = 80;

  return {
    id: `PROC-${seed.toString(16).toUpperCase()}`,
    title: `Procedural Op #${seed.toString().slice(-4)} (${environment.toUpperCase()})`,
    description: `Dynamic exercise in ${environment} terrain under ${weather} conditions with ${threatCount} aerial target(s).`,
    isProcedural: true,
    seed,
    timeOfDay,
    environment,
    weather,
    visibility,
    sensorCondition,
    threatCount,
    threatType,
    difficulty,
    assistance,
    durationSeconds: 180,
    threats
  };
}

export const SCRIPTED_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'SCRIPT-01',
    title: 'Perimeter Breach Alpha (Beginner)',
    description: 'Single low-speed quadcopter approaching critical military outpost. Clear weather, optimal sensors.',
    isProcedural: false,
    timeOfDay: 'day',
    environment: 'critical_infra',
    weather: 'clear',
    visibility: 95,
    sensorCondition: 'normal',
    threatCount: 1,
    threatType: 'slow_multirotor',
    difficulty: 'easy',
    assistance: 'full',
    durationSeconds: 120,
    threats: [
      generateSingleThreat(0, 'slow_multirotor', 101)
    ]
  },
  {
    id: 'SCRIPT-02',
    title: 'Urban Fog Incursion (Intermediate)',
    description: 'Multi-threat scenario with fast fixed-wing and multirotor target in heavy urban fog with degraded radar.',
    isProcedural: false,
    timeOfDay: 'evening',
    environment: 'urban',
    weather: 'fog',
    visibility: 40,
    sensorCondition: 'slight_degradation',
    threatCount: 3,
    threatType: 'maneuvering',
    difficulty: 'moderate',
    assistance: 'contextual',
    durationSeconds: 150,
    threats: [
      generateSingleThreat(0, 'slow_multirotor', 201),
      generateSingleThreat(1, 'maneuvering', 202),
      generateSingleThreat(2, 'decoy', 203)
    ]
  },
  {
    id: 'SCRIPT-03',
    title: 'Night Mountain Stealth Swarm (Professional)',
    description: 'High-altitude mountain terrain at midnight. 5 simultaneous maneuvering targets including decoys and severe sensor noise.',
    isProcedural: false,
    timeOfDay: 'night',
    environment: 'mountain',
    weather: 'low_vis',
    visibility: 20,
    sensorCondition: 'severe_degradation',
    threatCount: 5,
    threatType: 'swarm',
    difficulty: 'hard',
    assistance: 'minimal',
    durationSeconds: 180,
    threats: [
      generateSingleThreat(0, 'swarm', 301),
      generateSingleThreat(1, 'swarm', 302),
      generateSingleThreat(2, 'fast_aerial', 303),
      generateSingleThreat(3, 'decoy', 304),
      generateSingleThreat(4, 'maneuvering', 305)
    ]
  },
  {
    id: 'SCRIPT-04',
    title: 'Infrastructure Dust Storm Diversion',
    description: 'Critical power node under threat during heavy dust storm. Trainee must distinguish genuine strike drone from bird flock decoy.',
    isProcedural: false,
    timeOfDay: 'day',
    environment: 'critical_infra',
    weather: 'dust',
    visibility: 30,
    sensorCondition: 'moderate_degradation',
    threatCount: 4,
    threatType: 'fast_aerial',
    difficulty: 'hard',
    assistance: 'contextual',
    durationSeconds: 160,
    threats: [
      generateSingleThreat(0, 'decoy', 401),
      generateSingleThreat(1, 'fast_aerial', 402),
      generateSingleThreat(2, 'slow_multirotor', 403),
      generateSingleThreat(3, 'decoy', 404)
    ]
  }
];
