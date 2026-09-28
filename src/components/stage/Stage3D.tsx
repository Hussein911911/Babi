"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Html,
  useProgress,
  PerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import CarModel, { type RimStyle } from "./CarModel";

export type Hotspot = {
  id: string;
  position: [number, number, number];
  title: string;
  body: string;
  interior?: boolean;
};

export const EXTERIOR_HOTSPOTS: Hotspot[] = [
  { id: "engine", position: [1.8, 1.05, 0], title: "المحرك", body: "محركات مفحوصة بالكامل بأجهزة كمبيوتر حديثة مع تقرير أداء موثق." },
  { id: "lights", position: [2.35, 0.75, 0.65], title: "الإضاءة", body: "إضاءة LED كاملة أمامية وخلفية مع حساسات إضاءة تلقائية." },
  { id: "wheels", position: [1.45, 0.45, 1.05], title: "العجلات", body: "إطارات جديدة وجنوط أصلية — تفحص ميزانية وترصيص قبل التسليم." },
  { id: "trunk", position: [-2.3, 1.0, 0], title: "الصندوق", body: "سعة تخزين واسعة مع فتح كهربائي وحساس ركن خلفي." },
];

export const INTERIOR_HOTSPOTS: Hotspot[] = [
  { id: "screen", position: [0.55, 1.25, 0], title: "شاشة المعلومات", body: "شاشة لمس ذكية تدعم Apple CarPlay وAndroid Auto مع خرائط.", interior: true },
  { id: "seats", position: [-0.2, 1.1, 0.45], title: "المقاعد", body: "مقاعد جلد فاخرة مدفأة ومهوّاة مع ذاكرة أوضاع للسائق.", interior: true },
  { id: "audio", position: [0.3, 1.05, -0.4], title: "نظام الصوت", body: "نظام صوتي محيطي فاخر بمضخم صوت وتقنية إلغاء الضوضاء.", interior: true },
  { id: "sunroof", position: [0.15, 1.55, 0], title: "فتحة السقف", body: "فتحة سقف بانورامية كهربائية مع ستارة عازلة للشمس.", interior: true },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center" dir="rtl">
        <div className="h-14 w-14 mx-auto rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
        <p className="mt-3 text-sm font-bold text-gold-500 whitespace-nowrap">
          جارِ تحميل المسرح {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

/** Cinematic camera rig: smoothly moves between exterior and interior */
function CameraRig({
  interior,
  controls,
}: {
  interior: boolean;
  controls: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const animating = useRef(false);
  const prevMode = useRef(interior);

  if (prevMode.current !== interior) {
    prevMode.current = interior;
    animating.current = true;
  }

  useFrame((_, dt) => {
    if (!animating.current) return;
    if (interior) {
      targetPos.current.set(-0.25, 1.16, 0.12);
      targetLook.current.set(1.4, 1.05, 0);
    } else {
      targetPos.current.set(5.2, 2.4, 5.2);
      targetLook.current.set(0, 0.6, 0);
    }
    const k = Math.min(dt * 2.2, 1);
    camera.position.lerp(targetPos.current, k);
    if (controls.current) {
      controls.current.target.lerp(targetLook.current, k);
      controls.current.update();
    }
    if (camera.position.distanceTo(targetPos.current) < 0.02) {
      animating.current = false;
    }
  });

  return null;
}

function Platform() {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ring.current) ring.current.rotation.z = state.clock.elapsedTime * 0.1;
  });
  return (
    <group>
      {/* Base disc */}
      <mesh receiveShadow position={[0, -0.06, 0]}>
        <cylinderGeometry args={[3.4, 3.6, 0.12, 64]} />
        <meshStandardMaterial color="#12151b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Gold ring */}
      <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={ring}>
        <ringGeometry args={[3.1, 3.32, 96]} />
        <meshStandardMaterial
          color="#C9A227"
          emissive="#C9A227"
          emissiveIntensity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Babylonian engravings — radial ticks */}
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh
          key={i}
          position={[Math.cos((i / 24) * Math.PI * 2) * 2.85, 0.005, Math.sin((i / 24) * Math.PI * 2) * 2.85]}
          rotation={[-Math.PI / 2, 0, (i / 24) * Math.PI * 2]}
        >
          <planeGeometry args={[0.08, 0.3]} />
          <meshStandardMaterial color="#C9A227" emissive="#C9A227" emissiveIntensity={0.25} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

function HotspotMarker({
  spot,
  active,
  onClick,
}: {
  spot: Hotspot;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Html position={spot.position} center distanceFactor={8} zIndexRange={[20, 0]}>
      <div className="relative" dir="rtl">
        <button
          onClick={onClick}
          aria-label={spot.title}
          className={`h-6 w-6 rounded-full border-2 transition-all duration-300 ${
            active
              ? "bg-gold-500 border-gold-300 scale-125"
              : "bg-ishtar-600/80 border-gold-500/80 hover:scale-110 animate-pulse"
          }`}
        >
          <span className="sr-only">{spot.title}</span>
        </button>
        {active && (
          <div className="absolute top-8 right-1/2 translate-x-1/2 w-52 rounded-xl2 bg-charcoal/95 border border-gold-500/40 p-3 text-right shadow-card backdrop-blur">
            <p className="text-xs font-black text-gold-500 mb-1">{spot.title}</p>
            <p className="text-[11px] leading-5 text-sand/90">{spot.body}</p>
          </div>
        )}
      </div>
    </Html>
  );
}

export default function Stage3D({
  color,
  rimStyle,
  bodyType,
  interior,
  showHotspots,
}: {
  color: string;
  rimStyle: RimStyle;
  bodyType: string;
  interior: boolean;
  showHotspots: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [activeSpot, setActiveSpot] = useState<string | null>(null);
  const [dpr, setDpr] = useState(1.5);
  const spots = interior ? INTERIOR_HOTSPOTS : EXTERIOR_HOTSPOTS;

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [5.2, 2.4, 5.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => setActiveSpot(null)}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.75))}
      />
      <Suspense fallback={<Loader />}>
        {/* Studio lighting */}
        <ambientLight intensity={0.35} />
        <spotLight
          position={[6, 8, 4]}
          angle={0.45}
          penumbra={0.6}
          intensity={220}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#fff6e0"
        />
        <spotLight position={[-6, 6, -4]} angle={0.5} penumbra={0.8} intensity={120} color="#bcd6ff" />
        <pointLight position={[0, 5, 0]} intensity={40} color="#C9A227" />
        <hemisphereLight intensity={0.3} color="#dfe8ff" groundColor="#1a1408" />

        <group position={[0, 0.06, 0]}>
          <CarModel color={color} rimStyle={rimStyle} bodyType={bodyType} />
          {showHotspots &&
            spots.map((s) => (
              <HotspotMarker
                key={s.id}
                spot={s}
                active={activeSpot === s.id}
                onClick={() => setActiveSpot(activeSpot === s.id ? null : s.id)}
              />
            ))}
        </group>

        <Platform />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.65} scale={12} blur={2.2} far={3} />

        <CameraRig interior={interior} controls={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          autoRotate={!interior}
          autoRotateSpeed={0.9}
          minDistance={interior ? 0.05 : 4}
          maxDistance={interior ? 0.3 : 11}
          minPolarAngle={interior ? 0.5 : 0.2}
          maxPolarAngle={interior ? 2.2 : Math.PI / 2.05}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}
