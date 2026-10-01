"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type RimStyle = "sport" | "classic";

/**
 * Procedural stylized car built from primitives — no external GLB needed.
 * In production you can replace this with a Draco-compressed GLTF via useGLTF
 * (see README "إضافة موديلات 3D").
 */
export default function CarModel({
  color,
  rimStyle,
  bodyType = "سيدان",
}: {
  color: string;
  rimStyle: RimStyle;
  bodyType?: string;
}) {
  const paintRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);

  // Smooth paint transition
  useFrame((_, dt) => {
    if (paintRef.current) {
      paintRef.current.color.lerp(target, Math.min(dt * 4, 1));
    }
  });

  const isSUV = bodyType.includes("SUV") || bodyType.includes("بيك");
  const s = isSUV ? 1.18 : 1; // scale up height for SUVs
  const wheelR = isSUV ? 0.42 : 0.36;

  const paint = (
    <meshPhysicalMaterial
      ref={paintRef}
      color={color}
      metalness={0.85}
      roughness={0.22}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={1.1}
    />
  );

  const glass = (
    <meshPhysicalMaterial
      color="#0a1420"
      metalness={0.4}
      roughness={0.05}
      transparent
      opacity={0.72}
      side={THREE.DoubleSide}
    />
  );

  const dark = <meshStandardMaterial color="#14171c" metalness={0.6} roughness={0.5} />;

  return (
    <group>
      {/* ── Body ─────────────────────────────────── */}
      <RoundedBox args={[4.5, 0.62 * s, 1.9]} radius={0.16} position={[0, 0.55 * s, 0]} castShadow>
        {paint}
      </RoundedBox>
      {/* Hood slope */}
      <RoundedBox args={[1.15, 0.3 * s, 1.78]} radius={0.1} position={[1.72, 0.72 * s, 0]} rotation={[0, 0, -0.09]} castShadow>
        {paint}
      </RoundedBox>
      {/* Trunk */}
      <RoundedBox args={[0.95, 0.32 * s, 1.78]} radius={0.1} position={[-1.75, 0.74 * s, 0]} rotation={[0, 0, 0.07]} castShadow>
        {paint}
      </RoundedBox>

      {/* ── Cabin glass ──────────────────────────── */}
      <RoundedBox args={[2.35, 0.62 * s, 1.68]} radius={0.22} position={[-0.15, 1.12 * s, 0]} castShadow>
        {glass}
      </RoundedBox>
      {/* Roof */}
      <RoundedBox args={[1.9, 0.09, 1.58]} radius={0.04} position={[-0.15, 1.44 * s, 0]} castShadow>
        {paint}
      </RoundedBox>
      {/* Sunroof */}
      <mesh position={[0.15, 1.49 * s, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 1.1]} />
        <meshPhysicalMaterial color="#05080d" metalness={0.5} roughness={0.05} />
      </mesh>

      {/* ── Interior (visible in cabin mode) ─────── */}
      <group position={[0, 0, 0]}>
        {/* Dashboard */}
        <RoundedBox args={[0.5, 0.28, 1.55]} radius={0.06} position={[0.85, 0.98 * s, 0]}>
          {dark}
        </RoundedBox>
        {/* Infotainment screen */}
        <mesh position={[0.62, 1.1 * s, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.65, 0.24]} />
          <meshStandardMaterial color="#0f2f4f" emissive="#1B4F8C" emissiveIntensity={1.6} />
        </mesh>
        {/* Steering wheel */}
        <mesh position={[0.62, 1.02 * s, 0.45]} rotation={[0.3, Math.PI / 2, 0]}>
          <torusGeometry args={[0.19, 0.028, 12, 32]} />
          <meshStandardMaterial color="#1a1d22" roughness={0.4} />
        </mesh>
        {/* Front seats */}
        {[0.45, -0.45].map((z) => (
          <group key={z} position={[-0.2, 0.78 * s, z]}>
            <RoundedBox args={[0.55, 0.16, 0.55]} radius={0.05}>
              <meshStandardMaterial color="#3d2f22" roughness={0.8} />
            </RoundedBox>
            <RoundedBox args={[0.16, 0.6, 0.55]} radius={0.05} position={[-0.28, 0.3, 0]}>
              <meshStandardMaterial color="#3d2f22" roughness={0.8} />
            </RoundedBox>
          </group>
        ))}
        {/* Rear bench */}
        <RoundedBox args={[0.6, 0.16, 1.4]} radius={0.05} position={[-1.05, 0.78 * s, 0]}>
          <meshStandardMaterial color="#3d2f22" roughness={0.8} />
        </RoundedBox>
        {/* Console glow strip */}
        <mesh position={[0.3, 0.92 * s, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.9, 0.08]} />
          <meshStandardMaterial color="#C9A227" emissive="#C9A227" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* ── Front details ────────────────────────── */}
      {/* Grille */}
      <RoundedBox args={[0.1, 0.3, 1.2]} radius={0.03} position={[2.28, 0.5 * s, 0]}>
        {dark}
      </RoundedBox>
      {/* Headlights */}
      {[0.62, -0.62].map((z) => (
        <mesh key={`h${z}`} position={[2.26, 0.68 * s, z]} rotation={[0, Math.PI / 2, 0]}>
          <capsuleGeometry args={[0.05, 0.28, 6, 12]} />
          <meshStandardMaterial color="#fff" emissive="#cfe8ff" emissiveIntensity={2.4} />
        </mesh>
      ))}
      {/* Taillights */}
      {[0.6, -0.6].map((z) => (
        <mesh key={`t${z}`} position={[-2.26, 0.72 * s, z]} rotation={[0, Math.PI / 2, 0]}>
          <capsuleGeometry args={[0.045, 0.34, 6, 12]} />
          <meshStandardMaterial color="#ff2a2a" emissive="#ff1a1a" emissiveIntensity={1.8} />
        </mesh>
      ))}
      {/* Bumpers */}
      <RoundedBox args={[0.35, 0.22, 1.86]} radius={0.08} position={[2.16, 0.32 * s, 0]}>
        {dark}
      </RoundedBox>
      <RoundedBox args={[0.35, 0.22, 1.86]} radius={0.08} position={[-2.16, 0.32 * s, 0]}>
        {dark}
      </RoundedBox>

      {/* ── Wheels ───────────────────────────────── */}
      {[
        [1.45, 0.9],
        [1.45, -0.9],
        [-1.45, 0.9],
        [-1.45, -0.9],
      ].map(([x, z], i) => (
        <Wheel key={i} position={[x, wheelR, z]} radius={wheelR} rimStyle={rimStyle} />
      ))}
    </group>
  );
}

function Wheel({
  position,
  radius,
  rimStyle,
}: {
  position: [number, number, number];
  radius: number;
  rimStyle: RimStyle;
}) {
  const spokes = rimStyle === "sport" ? 5 : 8;
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, 0.26, 32]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.9} />
      </mesh>
      {/* Rim face */}
      <mesh position={[0, position[2] > 0 ? 0.135 : -0.135, 0]}>
        <cylinderGeometry args={[radius * 0.62, radius * 0.62, 0.02, 24]} />
        <meshStandardMaterial
          color={rimStyle === "sport" ? "#2a2d33" : "#c8ccd4"}
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>
      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh
          key={i}
          position={[0, position[2] > 0 ? 0.14 : -0.14, 0]}
          rotation={[0, (i * Math.PI * 2) / spokes, 0]}
        >
          <boxGeometry args={[rimStyle === "sport" ? 0.07 : 0.045, 0.02, radius * 1.1]} />
          <meshStandardMaterial color="#d8dce2" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
      {/* Hub */}
      <mesh position={[0, position[2] > 0 ? 0.15 : -0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshStandardMaterial color="#C9A227" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}
