import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AerialThreat, ScenarioConfig } from '../../types';
import { Drone3D } from './Drone3D';
import { Terrain3D } from './Terrain3D';
import { Atmosphere3D } from './Atmosphere3D';

interface SimulationCanvasProps {
  scenario: ScenarioConfig;
  threats: AerialThreat[];
  selectedThreatId?: string;
  onSelectThreat: (id: string) => void;
  timeSec: number;
  cameraMode: 'tactical' | 'drone_follow' | 'tower';
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  scenario,
  threats,
  selectedThreatId,
  onSelectThreat,
  timeSec,
  cameraMode
}) => {
  const selectedThreat = threats.find(t => t.id === selectedThreatId) || threats[0];

  // Compute camera target position based on selected drone
  let camTarget: [number, number, number] = [0, 5, 0];
  if (cameraMode === 'drone_follow' && selectedThreat) {
    const [x, y, z] = selectedThreat.position;
    camTarget = [x / 12, Math.max(5, selectedThreat.altitude / 8), z / 12];
  }

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <Canvas
        shadows
        camera={{
          position: cameraMode === 'tower' ? [0, 25, 5] : [60, 45, 90],
          fov: 50
        }}
        gl={{ antialias: true }}
      >
        <Atmosphere3D timeOfDay={scenario.timeOfDay} weather={scenario.weather} />
        <Terrain3D environment={scenario.environment} />

        {/* Render ALL 3D Aerial Threats simultaneously */}
        {threats.map(threat => (
          <Drone3D
            key={threat.id}
            threat={threat}
            isSelected={threat.id === selectedThreatId}
            onSelect={onSelectThreat}
            timeSec={timeSec}
          />
        ))}

        <OrbitControls 
          target={camTarget}
          maxPolarAngle={Math.PI / 2 - 0.05} // prevent camera going below ground
          minDistance={10}
          maxDistance={350}
          enablePan
          zoomSpeed={1.2}
        />
      </Canvas>

      {/* Viewport Header Indicator */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-xs text-slate-300 font-mono shadow-md backdrop-blur z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-slate-200">3D AIRSPACE VIEWPORT</span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-400 font-bold uppercase">{threats.length} THREATS IN AIRSPACE</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400 uppercase font-semibold">LOCKED: {selectedThreat?.id || 'NONE'}</span>
      </div>

      {/* Target Focus Helper Pill on 3D Viewport */}
      {selectedThreat && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-cyan-500/60 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono backdrop-blur flex items-center space-x-2 z-10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>FOCUSED TARGET: <strong>{selectedThreat.id}</strong> ({selectedThreat.groundTruthClass})</span>
        </div>
      )}
    </div>
  );
};
