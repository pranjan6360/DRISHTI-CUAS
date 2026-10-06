import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TimeOfDay, WeatherCondition } from '../../types';

interface Atmosphere3DProps {
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
}

export const Atmosphere3D: React.FC<Atmosphere3DProps> = ({ timeOfDay, weather }) => {
  const rainRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // Animate weather particles (Rain drops & Dust storm)
  useFrame((_, delta) => {
    if (rainRef.current && weather === 'rain') {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 120;
        if (positions[i] < 0) positions[i] = 160;
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (dustRef.current && weather === 'dust') {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += delta * 15; // horizontal sand wind
        positions[i + 1] -= delta * 10;
        if (positions[i] > 200) positions[i] = -200;
        if (positions[i + 1] < 0) positions[i + 1] = 100;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Lighting & Sky Dome Colors based on timeOfDay
  let skyColor = '#0f172a';
  let lightColor = '#ffffff';
  let lightIntensity = 1.6;

  if (timeOfDay === 'evening') {
    skyColor = '#3b0764'; // Deep Violet Sunset
    lightColor = '#f97316'; // Fiery Sunset Orange
    lightIntensity = 1.2;
  } else if (timeOfDay === 'night') {
    skyColor = '#020617'; // Cosmic Black
    lightColor = '#38bdf8'; // Blue Night Ambient
    lightIntensity = 0.35;
  }

  if (weather === 'sunlight') {
    lightIntensity = 2.4;
  }

  // Fog setup based on weather
  let fogDensity = 0.003;
  let fogColor = skyColor;

  if (weather === 'fog') {
    fogDensity = 0.018; // Heavy visual fog
    fogColor = timeOfDay === 'night' ? '#090d16' : '#64748b';
  } else if (weather === 'low_vis') {
    fogDensity = 0.025; // Dense tactical smoke
    fogColor = '#1e293b';
  } else if (weather === 'dust') {
    fogDensity = 0.016; // Desert sandstorm haze
    fogColor = '#78350f';
  }

  // Generate 800+ Rain Particles
  const rainCount = 800;
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount * 3; i += 3) {
    rainPositions[i] = (Math.random() - 0.5) * 350;
    rainPositions[i + 1] = Math.random() * 160;
    rainPositions[i + 2] = (Math.random() - 0.5) * 350;
  }

  // Generate 600+ Dust Sand Particles
  const dustCount = 600;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i += 3) {
    dustPositions[i] = (Math.random() - 0.5) * 350;
    dustPositions[i + 1] = Math.random() * 120;
    dustPositions[i + 2] = (Math.random() - 0.5) * 350;
  }

  return (
    <group>
      {/* Dynamic Background Sky Color */}
      <color attach="background" args={[skyColor]} />

      {/* Volumetric Fog Layer */}
      {(weather === 'fog' || weather === 'low_vis' || weather === 'dust') && (
        <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      )}

      {/* Ambient & Directional Sun/Moon Lighting */}
      <ambientLight color={lightColor} intensity={lightIntensity * 0.5} />
      <directionalLight 
        position={timeOfDay === 'evening' ? [150, 40, -100] : [100, 160, 80]} 
        color={lightColor} 
        intensity={lightIntensity} 
        castShadow 
      />

      {/* Intense Sunlight Solar Flare Sphere */}
      {weather === 'sunlight' && (
        <mesh position={[120, 150, 60]}>
          <sphereGeometry args={[16, 32, 32]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      )}

      {/* Animated Rain Drops */}
      {weather === 'rain' && (
        <points ref={rainRef}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            attach="material"
            size={0.8}
            color="#38bdf8"
            transparent
            opacity={0.85}
          />
        </points>
      )}

      {/* Animated Desert Dust Sand Storm */}
      {weather === 'dust' && (
        <points ref={dustRef}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[dustPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            attach="material"
            size={1.6}
            color="#f59e0b"
            transparent
            opacity={0.75}
          />
        </points>
      )}
    </group>
  );
};
