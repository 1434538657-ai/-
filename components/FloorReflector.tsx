import React from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

export const FloorReflector: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <circleGeometry args={[15, 64]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.5}
        mirror={0.5} // Mirror 0.5 for semi-glossy look
      />
    </mesh>
  );
};