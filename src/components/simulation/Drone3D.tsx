import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AerialThreat } from '../../types';

interface Drone3DProps {
  threat: AerialThreat;
  isSelected: boolean;
  onSelect: (id: string) => void;
  timeSec: number;
}

export const Drone3D: React.FC<Drone3DProps> = ({ threat, isSelected, onSelect, timeSec }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rotor1Ref = useRef<THREE.Mesh>(null);
  const rotor2Ref = useRef<THREE.Mesh>(null);
  const rotor3Ref = useRef<THREE.Mesh>(null);
  const rotor4Ref = useRef<THREE.Mesh>(null);

  // Compute smooth position interpolated from trajectory or current position
  const [posX, posY] = threat.position;
  const worldX = posX / 12;
  const worldY = Math.max(8, threat.altitude / 8);
  const worldZ = posY / 12;

  useFrame((_, delta) => {
    // Spin rotors
    if (rotor1Ref.current) rotor1Ref.current.rotation.y += delta * 25;
    if (rotor2Ref.current) rotor2Ref.current.rotation.y += delta * 25;
    if (rotor3Ref.current) rotor3Ref.current.rotation.y += delta * 25;
    if (rotor4Ref.current) rotor4Ref.current.rotation.y += delta * 25;

    // Slight hovering wobble
    if (groupRef.current) {
      groupRef.current.position.y = worldY + Math.sin(timeSec * 3 + threat.spawnTime) * 0.4;
    }
  });

  const headingRad = (threat.direction * Math.PI) / 180;

  return (
    <group 
      ref={groupRef} 
      position={[worldX, worldY, worldZ]} 
      rotation={[0, -headingRad, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(threat.id);
      }}
    >
      {/* Target Status Ring / Bounding Box */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isSelected ? 2.5 : 1.5, isSelected ? 2.8 : 1.7, 32]} />
        <meshBasicMaterial 
          color={isSelected ? '#00ffcc' : threat.colorHex} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={isSelected ? 0.9 : 0.5} 
        />
      </mesh>

      {/* Altitude Guide Line to ground */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -worldY, 0)
        ])} />
        <lineDashedMaterial attach="material" color={isSelected ? '#00ffcc' : '#475569'} dashSize={0.5} gapSize={0.5} opacity={0.4} transparent />
      </line>

      {/* DRONE BODY MODELS BY THREAT TYPE */}
      {threat.type === 'slow_multirotor' && (
        <group scale={1.2}>
          {/* Main Central Hub */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 0.3, 1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Arms */}
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[2.4, 0.1, 0.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[2.4, 0.1, 0.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Rotors */}
          <mesh ref={rotor1Ref} position={[0.85, 0.2, 0.85]}>
            <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
            <meshStandardMaterial color="#00ffcc" transparent opacity={0.6} />
          </mesh>
          <mesh ref={rotor2Ref} position={[-0.85, 0.2, 0.85]}>
            <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
            <meshStandardMaterial color="#00ffcc" transparent opacity={0.6} />
          </mesh>
          <mesh ref={rotor3Ref} position={[0.85, 0.2, -0.85]}>
            <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
            <meshStandardMaterial color="#00ffcc" transparent opacity={0.6} />
          </mesh>
          <mesh ref={rotor4Ref} position={[-0.85, 0.2, -0.85]}>
            <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
            <meshStandardMaterial color="#00ffcc" transparent opacity={0.6} />
          </mesh>
          {/* Camera Payload Pod */}
          <mesh position={[0, -0.25, 0.4]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#0f172a" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {threat.type === 'fast_aerial' && (
        <group scale={1.5}>
          {/* Fuselage */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.5, 3, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Delta Wings */}
          <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[3.2, 0.08, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Jet Thruster Glow */}
          <mesh position={[0, 0, -1.4]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
        </group>
      )}

      {threat.type === 'maneuvering' && (
        <group scale={1.4}>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2.4, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.8, 0.06, 0.8]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}

      {(threat.type === 'swarm' || threat.type === 'unknown' || threat.type === 'decoy') && (
        <group scale={1.1}>
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color={threat.colorHex} 
              emissive={threat.colorHex} 
              emissiveIntensity={0.6} 
              wireframe={threat.type === 'decoy'} 
            />
          </mesh>
        </group>
      )}

      {/* Floating 3D HTML HUD Tag */}
      <Html position={[0, 2.8, 0]} center distanceFactor={25}>
        <div 
          className={`px-2 py-1 rounded text-xs font-mono select-none transition-all duration-200 cursor-pointer border shadow-lg backdrop-blur-md flex items-center space-x-1.5 whitespace-nowrap ${
            isSelected 
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/50 scale-110 z-50' 
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-cyan-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(threat.id);
          }}
        >
          <span className={`w-2 h-2 rounded-full animate-ping ${threat.isHostile ? 'bg-red-500' : 'bg-blue-400'}`} />
          <span className="font-bold tracking-wider">{threat.id}</span>
          <span className="text-[10px] text-slate-400">| {threat.altitude}m | {threat.speed}km/h</span>
          {isSelected && (
            <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1 rounded uppercase font-semibold">
              LOCKED
            </span>
          )}
        </div>
      </Html>
    </group>
  );
};
