import React from 'react';
import * as THREE from 'three';
import { EnvironmentType } from '../../types';

interface Terrain3DProps {
  environment: EnvironmentType;
}

export const Terrain3D: React.FC<Terrain3DProps> = ({ environment }) => {
  return (
    <group>
      {/* Base Tactical Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial 
          color={
            environment === 'urban' ? '#0b0f19' :
            environment === 'mountain' ? '#1c1917' :
            environment === 'critical_infra' ? '#020617' :
            environment === 'open' ? '#064e3b' :
            '#14532d'
          }
          roughness={0.7} 
          metalness={0.3} 
        />
      </mesh>

      {/* Cyber Tactical Grid Lines */}
      <gridHelper 
        args={[1200, 120, environment === 'urban' ? '#38bdf8' : environment === 'critical_infra' ? '#ef4444' : '#10b981', '#1e293b']} 
        position={[0, 0.05, 0]} 
      />

      {/* Radar Central Command Headquarters Compound */}
      <group position={[0, 0, 0]}>
        {/* Base Command Fortress */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[16, 8, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Radar Antenna Tower Mast */}
        <mesh position={[0, 15, 0]}>
          <cylinderGeometry args={[1, 2, 14, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Rotating Radar Dish Mesh */}
        <mesh position={[0, 23, 0]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[5, 5, 0.5, 32]} />
          <meshStandardMaterial color="#00ffcc" metalness={0.6} roughness={0.1} transparent opacity={0.8} />
        </mesh>
        {/* Glowing Defense Perimeter Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
          <ringGeometry args={[25, 26, 64]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 1. URBAN ENVIRONMENT: Skyscrapers, Street Grids, City Lights */}
      {environment === 'urban' && (
        <group>
          {Array.from({ length: 32 }).map((_, idx) => {
            const angle = (idx / 32) * Math.PI * 2;
            const dist = 70 + (idx % 4) * 40;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const height = 25 + (idx % 6) * 16;
            const width = 14 + (idx % 3) * 6;
            const depth = 14 + (idx % 2) * 6;

            return (
              <group key={idx} position={[x, height / 2, z]}>
                <mesh>
                  <boxGeometry args={[width, height, depth]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Glowing Window Lines */}
                <mesh position={[0, 0, depth / 2 + 0.05]}>
                  <planeGeometry args={[width * 0.8, height * 0.8]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} wireframe />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 2. CRITICAL INFRASTRUCTURE: Cooling Towers, Fuel Tanks, Substations */}
      {environment === 'critical_infra' && (
        <group>
          {/* Nuclear/Thermal Power Cooling Towers */}
          <mesh position={[-60, 20, -70]}>
            <cylinderGeometry args={[12, 18, 40, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[70, 20, -60]}>
            <cylinderGeometry args={[12, 18, 40, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          {/* Spherical Gas & Fuel Storage Tanks */}
          <mesh position={[-80, 12, 50]}>
            <sphereGeometry args={[14, 32, 32]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-50, 12, 65]}>
            <sphereGeometry args={[14, 32, 32]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Transformer Substation Pylons */}
          <mesh position={[80, 10, 70]}>
            <boxGeometry args={[40, 20, 30]} />
            <meshStandardMaterial color="#ef4444" wireframe />
          </mesh>
        </group>
      )}

      {/* 3. MOUNTAIN ENVIRONMENT: Jagged Peaks & Snow Caps */}
      {environment === 'mountain' && (
        <group>
          {Array.from({ length: 16 }).map((_, idx) => {
            const angle = (idx / 16) * Math.PI * 2;
            const dist = 100 + (idx % 3) * 50;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const height = 60 + (idx % 5) * 25;

            return (
              <group key={idx} position={[x, height / 2, z]}>
                {/* Mountain Body */}
                <mesh>
                  <coneGeometry args={[45 + (idx % 3) * 15, height, 8]} />
                  <meshStandardMaterial color="#292524" roughness={0.9} />
                </mesh>
                {/* Snow Cap Top */}
                <mesh position={[0, height / 4, 0]}>
                  <coneGeometry args={[18, height / 2, 8]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.3} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 4. RURAL / OPEN TERRAIN: Rolling Outposts & Watchtowers */}
      {(environment === 'rural' || environment === 'open') && (
        <group>
          {/* Watchtowers */}
          {[[-90, -80], [100, -90], [-80, 90], [90, 80]].map(([x, z], idx) => (
            <group key={idx} position={[x, 0, z]}>
              <mesh position={[0, 10, 0]}>
                <cylinderGeometry args={[1, 1.5, 20, 8]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
              <mesh position={[0, 20, 0]}>
                <boxGeometry args={[6, 4, 6]} />
                <meshStandardMaterial color="#451a03" />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
};
