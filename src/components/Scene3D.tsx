import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const MatteObject = ({ position, rotation, scale, geometry }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Float floatIntensity={2} speed={1.5} rotationIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        {geometry}
        <meshStandardMaterial
          color="#333333"
          roughness={0.8}
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const LightAccentObject = ({ position, rotation, scale, geometry }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
  
    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.rotation.x -= 0.001;
        meshRef.current.rotation.y -= 0.002;
      }
    });
  
    return (
      <Float floatIntensity={1} speed={2} rotationIntensity={0.8}>
        <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
          {geometry}
          <meshStandardMaterial
            color="#cccccc"
            roughness={0.5}
            metalness={0.5}
            envMapIntensity={1}
          />
        </mesh>
      </Float>
    );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#aaaaaa" />

      <PresentationControls
        global
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <group position={[0, 0, 0]}>
          {/* Central architectural block */}
          <MatteObject 
            position={[0, 0, 0]} 
            rotation={[Math.PI / 4, Math.PI / 4, 0]} 
            scale={1.5} 
            geometry={<boxGeometry args={[1, 1, 1]} />} 
          />
          
          {/* Orbiting abstract torus */}
          <LightAccentObject 
            position={[2, 1, -1]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            scale={0.5} 
            geometry={<torusGeometry args={[1, 0.2, 16, 32]} />} 
          />

          {/* Additional background shape */}
          <MatteObject 
            position={[-2.5, -1.5, -2]} 
            rotation={[0, Math.PI / 3, 0]} 
            scale={1} 
            geometry={<octahedronGeometry args={[1]} />} 
          />
        </group>
      </PresentationControls>

      <Environment preset="city" />
    </>
  );
};

export const Scene3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
