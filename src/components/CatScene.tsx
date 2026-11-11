import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Html, Sparkles } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

type CatSceneProps = {
  scrollProgress: MotionValue<number>;
  furColor: string;
  collarColor: string;
  sensorColor: string;
  onPet: () => void;
  soloCat: boolean;
  cameraAngle: number;
  cameraDistance: number;
};

const smoothStep = (a: number, b: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function Cat({ furColor, collarColor, sensorColor, progressRef, onPet, soloCat }: {
  furColor: string;
  collarColor: string;
  sensorColor: string;
  progressRef: React.MutableRefObject<number>;
  onPet: () => void;
  soloCat: boolean;
}) {
  const cat = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const charm = useRef<THREE.Group>(null);
  const frontPaws = useRef<Array<THREE.Group | null>>([]);
  const ears = useRef<Array<THREE.Group | null>>([]);
  const eyes = useRef<Array<THREE.Group | null>>([]);
  const irises = useRef<Array<THREE.Group | null>>([]);
  const petUntil = useRef(0);
  const { size } = useThree();
  const shell = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: furColor,
    roughness: 0.86,
    metalness: 0,
    clearcoat: 0.04,
    clearcoatRoughness: 0.8,
    sheen: 0.55,
    sheenColor: "#ffffff",
  }), [furColor]);
  const collar = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: collarColor,
    roughness: 0.4,
    metalness: 0.22,
    clearcoat: 0.55,
    sheen: 0.35,
  }), [collarColor]);
  const charmStone = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: sensorColor,
    emissive: sensorColor,
    emissiveIntensity: 0.32,
    roughness: 0.24,
    metalness: 0.12,
    clearcoat: 1,
  }), [sensorColor]);
  const charmGold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d8bd83",
    metalness: 0.82,
    roughness: 0.24,
  }), []);
  const inner = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#efb9b0",
    roughness: 0.82,
    sheen: 0.35,
  }), []);
  const muzzle = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#fff8ef",
    roughness: 0.88,
    sheen: 0.45,
  }), []);
  const eyeRim = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8d0c3", roughness: 0.72 }), []);
  const iris = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#82b77e",
    roughness: 0.35,
    clearcoat: 0.3,
  }), []);
  const pupil = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#26312a",
    roughness: 0.2,
    clearcoat: 0.7,
  }), []);
  const nose = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#e99b9c",
    roughness: 0.48,
    clearcoat: 0.25,
  }), []);
  const smile = useMemo(() => new THREE.MeshStandardMaterial({ color: "#89746b", roughness: 0.85 }), []);
  const blush = useMemo(() => new THREE.MeshBasicMaterial({ color: "#efb3ad", transparent: true, opacity: 0.34, depthWrite: false }), []);
  const smileGeometry = useMemo(() => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.075, 0.018, 0),
      new THREE.Vector3(-0.045, -0.018, 0.005),
      new THREE.Vector3(0, -0.025, 0.008),
      new THREE.Vector3(0.045, -0.018, 0.005),
      new THREE.Vector3(0.075, 0.018, 0),
    ]),
    20,
    0.006,
    6,
    false,
  ), []);
  const tailGeometry = useMemo(() => new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, 0.12, 0),
      new THREE.Vector3(0.32, 0.36, 0),
      new THREE.Vector3(0.28, 0.6, 0),
      new THREE.Vector3(0.12, 0.73, 0),
      new THREE.Vector3(-0.02, 0.67, 0),
    ]),
    36,
    0.085,
    12,
    false,
  ), []);
  useFrame(({ pointer, clock }, delta) => {
    const progress = progressRef.current;
    const roll = smoothStep(0.27, 0.43, progress) * (1 - smoothStep(0.47, 0.58, progress));
    const walk = smoothStep(0.55, 0.76, progress);
    const returnToCamera = smoothStep(0.76, 0.84, progress);
    const petting = performance.now() < petUntil.current;

    if (cat.current) {
      cat.current.position.x = THREE.MathUtils.damp(cat.current.position.x, soloCat ? -0.7 : size.width < 700 ? 0.55 : -1.05, 2.2, delta);
      cat.current.rotation.x = THREE.MathUtils.damp(cat.current.rotation.x, soloCat ? pointer.y * 0.035 : roll * -0.48, 3.2, delta);
      cat.current.rotation.y = THREE.MathUtils.damp(
        cat.current.rotation.y,
        soloCat ? pointer.x * 0.11 : Math.PI * walk + Math.PI * returnToCamera,
        2.4,
        delta,
      );
      cat.current.position.y = THREE.MathUtils.damp(
        cat.current.position.y,
        -0.28 + Math.sin(clock.elapsedTime * (petting ? 2.8 : 1.1)) * (petting ? 0.055 : 0.025),
        3.4,
        delta,
      );
      cat.current.position.z = THREE.MathUtils.damp(cat.current.position.z, soloCat ? 0 : -walk * 0.85 - returnToCamera * 1.8, 2.6, delta);
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * 0.3, 2.8, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * 0.16 - (petting ? 0.16 : 0), 2.8, delta);
      head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, -pointer.x * 0.045 + (petting ? 0.035 : 0), 2.8, delta);
    }
    ears.current.forEach((ear, index) => {
      if (!ear) return;
      const side = index === 0 ? -1 : 1;
      ear.rotation.z = THREE.MathUtils.damp(
        ear.rotation.z,
        -side * 0.12 + Math.sin(clock.elapsedTime * 1.8 + index) * (petting ? 0.12 : 0.025),
        petting ? 7 : 2,
        delta,
      );
    });
    const blinkPhase = clock.elapsedTime % 5.2;
    const blink = Math.max(0, 1 - Math.abs(blinkPhase - 0.1) / 0.1);
    eyes.current.forEach((eye, index) => {
      if (!eye) return;
      eye.scale.y = 1 - blink * 0.68;
      const gaze = irises.current[index];
      if (gaze) {
        gaze.position.x = THREE.MathUtils.damp(gaze.position.x, pointer.x * 0.018, 3.5, delta);
        gaze.position.y = THREE.MathUtils.damp(gaze.position.y, pointer.y * 0.012, 3.5, delta);
      }
    });
    if (tail.current) {
      tail.current.rotation.x = THREE.MathUtils.damp(tail.current.rotation.x, Math.sin(clock.elapsedTime * 2.2) * 0.12, 2, delta);
      tail.current.rotation.z = THREE.MathUtils.damp(
        tail.current.rotation.z,
        Math.sin(clock.elapsedTime * (petting ? 10 : 1.4)) * (petting ? 0.58 : 0.13),
        petting ? 8 : 2,
        delta,
      );
    }
    if (charm.current) {
      charm.current.rotation.z = Math.sin(clock.elapsedTime * (petting ? 8 : 1.5)) * (petting ? 0.12 : 0.035);
      charm.current.rotation.x = Math.sin(clock.elapsedTime * 1.2) * 0.025;
    }
    if (cat.current) {
      const breath = Math.sin(clock.elapsedTime * (petting ? 2.8 : 1.35)) * (petting ? 0.009 : 0.004);
      cat.current.scale.y = 1.12 * (1 + breath);
    }
    frontPaws.current.forEach((paw, index) => {
      if (!paw) return;
      const step = Math.sin(clock.elapsedTime * 5 + index * Math.PI) * walk * 0.11;
      paw.position.z = THREE.MathUtils.damp(paw.position.z, 0.08 + step, 6, delta);
      paw.rotation.x = THREE.MathUtils.damp(paw.rotation.x, step * 0.7, 6, delta);
    });
  });

  return (
    <group
      ref={cat}
      position={[0, -0.28, 0]}
      scale={1.12}
      onClick={(event) => {
        event.stopPropagation();
        petUntil.current = performance.now() + 1800;
        onPet();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <mesh position={[0, -0.04, -0.08]} scale={[0.7, 0.76, 0.57]} castShadow receiveShadow material={shell}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
      <mesh position={[0, 0.25, 0.4]} scale={[0.29, 0.3, 0.15]} material={muzzle}>
        <sphereGeometry args={[1, 36, 36]} />
      </mesh>
      {soloCat && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.47, 0.16]} material={collar} castShadow>
            <torusGeometry args={[0.37, 0.046, 16, 72]} />
          </mesh>
          <group ref={charm} position={[0, 0.25, 0.57]}>
            <mesh material={charmGold}>
              <torusGeometry args={[0.105, 0.018, 12, 40]} />
            </mesh>
            <mesh position={[0, 0, 0.01]} scale={[0.78, 0.78, 0.48]} material={charmStone}>
              <sphereGeometry args={[0.09, 32, 32]} />
            </mesh>
            <mesh position={[0, -0.105, -0.005]} material={charmGold}>
              <sphereGeometry args={[0.038, 20, 20]} />
            </mesh>
          </group>
        </>
      )}

      <group ref={head} position={[0, 0.92, 0.08]}>
        <mesh scale={[1.08, 1.02, 0.95]} castShadow receiveShadow material={shell}>
          <sphereGeometry args={[0.62, 56, 56]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={(node) => { ears.current[(side + 1) / 2] = node; }}
            position={[side * 0.39, 0.4, -0.005]}
          >
            <mesh position={[0, 0.035, 0]} rotation={[0, 0, -side * 0.12]} scale={[1, 1.12, 0.72]} castShadow material={shell}>
              <sphereGeometry args={[0.205, 32, 32]} />
            </mesh>
            <mesh position={[0, 0.035, 0.11]} rotation={[0, 0, -side * 0.12]} scale={[0.62, 0.76, 0.3]} material={inner}>
              <sphereGeometry args={[0.155, 28, 28]} />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={(node) => { eyes.current[(side + 1) / 2] = node; }}
            position={[side * 0.235, 0.035, 0.52]}
            scale={[1, 1, 1]}
          >
            <mesh scale={[1.03, 1.12, 0.62]} material={eyeRim}>
              <sphereGeometry args={[0.17, 36, 36]} />
            </mesh>
            <mesh position={[0, 0, 0.035]} scale={[0.9, 0.98, 0.55]} material={muzzle}>
              <sphereGeometry args={[0.15, 36, 36]} />
            </mesh>
            <group ref={(node) => { irises.current[(side + 1) / 2] = node; }} position={[0, 0, 0.105]}>
              <mesh scale={[0.72, 0.82, 0.55]} material={iris}>
                <sphereGeometry args={[0.108, 32, 32]} />
              </mesh>
              <mesh position={[0, -0.003, 0.035]} scale={[0.52, 0.78, 0.62]} material={pupil}>
                <sphereGeometry args={[0.075, 28, 28]} />
              </mesh>
              <mesh position={[-0.027, 0.039, 0.075]}>
                <sphereGeometry args={[0.024, 16, 16]} />
                <meshBasicMaterial color="#fffdf5" />
              </mesh>
              <mesh position={[0.027, -0.025, 0.073]}>
                <sphereGeometry args={[0.01, 12, 12]} />
                <meshBasicMaterial color="#fffdf5" />
              </mesh>
            </group>
          </group>
        ))}
        {[-1, 1].map((side) => (
          <group key={`cheek-${side}`}>
            <mesh position={[side * 0.38, -0.16, 0.37]} scale={[0.17, 0.12, 0.12]} material={shell}>
              <sphereGeometry args={[1, 32, 32]} />
            </mesh>
            <mesh position={[side * 0.105, -0.17, 0.51]} scale={[0.18, 0.125, 0.12]} material={muzzle}>
              <sphereGeometry args={[1, 28, 28]} />
            </mesh>
            <mesh position={[side * 0.31, -0.125, 0.486]} scale={[0.08, 0.045, 0.025]} material={blush}>
              <sphereGeometry args={[1, 24, 24]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.13, 0.638]} rotation={[0, 0, Math.PI]} material={nose}>
          <coneGeometry args={[0.052, 0.052, 3]} />
        </mesh>
        <mesh position={[0, -0.184, 0.623]} geometry={smileGeometry} material={smile} />
        {[-1, 1].map((side) => (
          <group key={`whiskers-${side}`} position={[side * 0.19, -0.18, 0.48]}>
            {[0, 1, 2].map((line) => (
              <mesh key={line} position={[side * 0.14, (line - 1) * 0.055, 0]} rotation={[0, 0, side * (0.18 + (line - 1) * 0.18)]}>
                <cylinderGeometry args={[0.0015, 0.0022, 0.23, 6]} />
                <meshBasicMaterial color="#d7ccbd" transparent opacity={0.78} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {[-1, 1].map((side) => (
        <group key={`front-${side}`} ref={(node) => { frontPaws.current[(side + 1) / 2] = node; }} position={[side * 0.36, -0.46, 0.16]}>
          <mesh position={[0, -0.13, 0]} scale={[0.18, 0.3, 0.2]} castShadow material={shell}>
            <sphereGeometry args={[1, 32, 32]} />
          </mesh>
          <mesh position={[0, -0.31, 0.07]} scale={[0.22, 0.105, 0.26]} castShadow material={shell}>
            <sphereGeometry args={[1, 28, 28]} />
          </mesh>
          <mesh position={[0, -0.32, 0.278]} scale={[0.065, 0.048, 0.018]} material={inner}>
            <sphereGeometry args={[1, 20, 20]} />
          </mesh>
          {[-1, 0, 1].map((toe) => (
            <mesh key={toe} position={[toe * 0.075, -0.285, 0.274]} scale={[0.027, 0.025, 0.012]} material={inner}>
              <sphereGeometry args={[1, 16, 16]} />
            </mesh>
          ))}
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={`back-${side}`} position={[side * 0.34, -0.42, -0.32]}>
          <mesh position={[0, -0.13, 0]} scale={[0.2, 0.27, 0.23]} castShadow material={shell}>
            <sphereGeometry args={[1, 32, 32]} />
          </mesh>
          <mesh position={[0, -0.29, 0.1]} scale={[0.23, 0.105, 0.27]} castShadow material={shell}>
            <sphereGeometry args={[1, 28, 28]} />
          </mesh>
        </group>
      ))}

      <group ref={tail} position={[0.45, -0.03, -0.34]}>
        <mesh geometry={tailGeometry} material={shell} castShadow />
        <mesh position={[-0.015, 0.67, 0]} scale={[0.09, 0.075, 0.085]} material={shell}>
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
      </group>
      {[-1, 0, 1].map((tuft) => (
        <mesh
          key={`tuft-${tuft}`}
          position={[tuft * 0.075, 0.53 - Math.abs(tuft) * 0.035, 0.425]}
          rotation={[0, 0, -tuft * 0.2]}
          scale={[0.075, 0.13, 0.06]}
          material={shell}
        >
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
      ))}
    </group>
  );
}

function Leader({
  position,
  children,
  align = "left",
  progressRef,
}: {
  position: [number, number, number];
  children: React.ReactNode;
  align?: "left" | "right";
  progressRef: React.MutableRefObject<number>;
}) {
  const label = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const reveal = smoothStep(0.255, 0.31, progressRef.current) * (1 - smoothStep(0.51, 0.565, progressRef.current));
    if (label.current) {
      label.current.style.opacity = String(reveal);
      label.current.style.transform = `translateY(${(1 - reveal) * 5}px)`;
    }
  });

  return (
    <group position={position}>
      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div ref={label} className={`hardware-tag hardware-tag-${align}`}>
          <span className="hardware-tag-dot" />
          <span>{children}</span>
        </div>
      </Html>
    </group>
  );
}

function Hardware({ progressRef, collarColor, sensorColor }: {
  progressRef: React.MutableRefObject<number>;
  collarColor: string;
  sensorColor: string;
}) {
  const assembly = useRef<THREE.Group>(null);
  const pieces = useRef<Array<THREE.Group | null>>([]);
  const collar = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: collarColor,
    metalness: 0.82,
    roughness: 0.24,
    clearcoat: 1,
  }), [collarColor]);
  const glow = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: sensorColor,
    emissive: sensorColor,
    emissiveIntensity: 2.8,
    metalness: 0.3,
    roughness: 0.2,
    toneMapped: false,
  }), [sensorColor]);
  const partTargets = useMemo(() => [
    new THREE.Vector3(-0.74, 0.4, 0.18),
    new THREE.Vector3(0.72, 0.38, 0.2),
    new THREE.Vector3(-0.64, -0.38, 0.12),
    new THREE.Vector3(0.68, -0.36, 0.08),
  ], []);
  const homePositions = useMemo(() => [
    new THREE.Vector3(0, 0.43, 0.16),
    new THREE.Vector3(0, 0.43, 0.16),
    new THREE.Vector3(0, 0.43, 0.16),
    new THREE.Vector3(0, 0.43, 0.16),
  ], []);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    const explode = smoothStep(0.25, 0.38, progress) * (1 - smoothStep(0.49, 0.57, progress));
    if (assembly.current) {
      assembly.current.scale.setScalar(1 - smoothStep(0.55, 0.62, progress) * 0.18);
      assembly.current.rotation.y = smoothStep(0.55, 0.78, progress) * Math.PI;
    }
    pieces.current.forEach((piece, index) => {
      if (!piece) return;
      const desired = homePositions[index].clone().lerp(partTargets[index], explode);
      piece.position.lerp(desired, 1 - Math.exp(-delta * 9));
      piece.rotation.z = explode * (index % 2 === 0 ? -0.16 : 0.16);
    });
  });

  return (
    <>
      <group ref={assembly} position={[0, 0.43, 0.12]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={collar}>
          <torusGeometry args={[0.47, 0.055, 14, 72]} />
        </mesh>
        <mesh position={[0, -0.095, 0.46]} material={glow}>
          <boxGeometry args={[0.23, 0.16, 0.13]} />
        </mesh>
        <mesh position={[0, -0.095, 0.54]}>
          <cylinderGeometry args={[0.043, 0.043, 0.03, 32]} />
          <meshBasicMaterial color="#d9fff0" toneMapped={false} />
        </mesh>
        <mesh position={[-0.33, -0.08, 0.37]} rotation={[0, 0, -0.25]} material={collar}>
          <boxGeometry args={[0.11, 0.045, 0.23]} />
        </mesh>
        <mesh position={[0.33, -0.08, 0.37]} rotation={[0, 0, 0.25]} material={collar}>
          <boxGeometry args={[0.11, 0.045, 0.23]} />
        </mesh>
      </group>

      <group ref={(node) => { pieces.current[0] = node; }} position={homePositions[0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={collar}>
          <torusGeometry args={[0.17, 0.052, 12, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.07]} material={glow}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 32]} />
        </mesh>
        <Leader position={[-0.34, 0.23, 0]} align="right" progressRef={progressRef}>4K MICRO GIMBAL</Leader>
      </group>

      <group ref={(node) => { pieces.current[1] = node; }} position={homePositions[1]}>
        <mesh material={collar}>
          <dodecahedronGeometry args={[0.14, 1]} />
        </mesh>
        <mesh material={glow}>
          <sphereGeometry args={[0.07, 24, 24]} />
        </mesh>
        <Leader position={[0.35, 0.2, 0]} align="left" progressRef={progressRef}>SUB-METER LIVE GPS</Leader>
      </group>

      <group ref={(node) => { pieces.current[2] = node; }} position={homePositions[2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={glow}>
          <torusGeometry args={[0.14, 0.034, 12, 40]} />
        </mesh>
        <mesh position={[0, 0, 0.05]} material={collar}>
          <cylinderGeometry args={[0.092, 0.092, 0.06, 32]} />
        </mesh>
        <Leader position={[-0.35, -0.2, 0]} align="right" progressRef={progressRef}>BIO-PULSE SENSOR</Leader>
      </group>

      <group ref={(node) => { pieces.current[3] = node; }} position={homePositions[3]}>
        <mesh material={collar}>
          <boxGeometry args={[0.24, 0.13, 0.13]} />
        </mesh>
        <mesh position={[0, 0, 0.075]} material={glow}>
          <boxGeometry args={[0.11, 0.05, 0.025]} />
        </mesh>
        <Leader position={[0.36, -0.18, 0]} align="left" progressRef={progressRef}>7-DAY SOLID STATE</Leader>
      </group>
    </>
  );
}

function Portal({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const frame = useRef<THREE.Group>(null);
  const portalGlow = useRef<THREE.Mesh>(null);
  const green = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#64D5A5",
    emissive: "#64D5A5",
    emissiveIntensity: 1.9,
    metalness: 0.52,
    roughness: 0.19,
    toneMapped: false,
  }), []);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#C4A575",
    emissive: "#89663a",
    emissiveIntensity: 0.48,
    metalness: 0.82,
    roughness: 0.2,
  }), []);

  useFrame(({ clock }) => {
    const progress = progressRef.current;
    const reveal = smoothStep(0.53, 0.7, progress);
    if (frame.current) {
      frame.current.position.y = -2.25 + reveal * 2.55;
      frame.current.scale.setScalar(0.55 + reveal * 0.45);
      frame.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.012;
    }
    if (portalGlow.current) {
      const material = portalGlow.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.12 + reveal * 0.72 + Math.sin(clock.elapsedTime * 1.4) * 0.035;
    }
  });

  return (
    <group ref={frame} position={[0, -2.25, -2.15]}>
      <mesh position={[0, 0.1, -0.08]} ref={portalGlow}>
        <planeGeometry args={[2.06, 3.24]} />
        <meshBasicMaterial color="#64D5A5" transparent opacity={0.12} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[-1.12, 0.1, 0]}>
        <boxGeometry args={[0.085, 3.48, 0.13]} />
        <primitive object={green} attach="material" />
      </mesh>
      <mesh position={[1.12, 0.1, 0]}>
        <boxGeometry args={[0.085, 3.48, 0.13]} />
        <primitive object={green} attach="material" />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <boxGeometry args={[2.32, 0.09, 0.13]} />
        <primitive object={gold} attach="material" />
      </mesh>
      <mesh position={[0, -1.62, 0]}>
        <boxGeometry args={[2.32, 0.09, 0.13]} />
        <primitive object={green} attach="material" />
      </mesh>
      <pointLight position={[0, 0.1, 0.4]} color="#64D5A5" intensity={3.5} distance={5} />
      <Sparkles count={45} position={[0, 0.1, 0.15]} scale={[2.2, 3.3, 0.4]} size={2.2} speed={0.3} color="#C4A575" />
    </group>
  );
}

function Garden({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const garden = useRef<THREE.Group>(null);
  const blades = useMemo(() => Array.from({ length: 44 }, (_, index) => ({
    x: ((index * 37) % 29 - 14) * 0.32,
    z: -7 - ((index * 19) % 21) * 0.36,
    height: 0.3 + ((index * 17) % 10) * 0.055,
    lean: ((index * 13) % 9 - 4) * 0.06,
  })), []);
  const grass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#365345",
    roughness: 0.83,
    side: THREE.DoubleSide,
  }), []);
  const leaf = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#52775a",
    roughness: 0.76,
    side: THREE.DoubleSide,
  }), []);

  useFrame((_, delta) => {
    if (!garden.current) return;
    const reveal = smoothStep(0.76, 0.91, progressRef.current);
    garden.current.position.z = THREE.MathUtils.damp(garden.current.position.z, 7 - reveal * 7, 3.3, delta);
    garden.current.scale.setScalar(0.72 + reveal * 0.28);
  });

  return (
    <group ref={garden} position={[0, -1.6, 7]}>
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[46, 24]} />
        <meshBasicMaterial color="#243b2c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, -8]}>
        <planeGeometry args={[60, 38]} />
        <meshStandardMaterial color="#17291e" roughness={0.92} />
      </mesh>
      {blades.map((blade, index) => (
        <mesh
          key={index}
          position={[blade.x, blade.height / 2 - 0.12, blade.z]}
          rotation={[0, 0, blade.lean]}
          material={index % 4 === 0 ? leaf : grass}
        >
          <coneGeometry args={[0.065, blade.height, 5]} />
        </mesh>
      ))}
      <Sparkles count={170} position={[0, 1.3, -9]} scale={[18, 8, 15]} size={2.6} speed={0.23} opacity={0.82} color="#B5E5A6" />
      <pointLight position={[0, 3.5, -6]} color="#c5dfa0" intensity={11} distance={18} />
    </group>
  );
}

function Scene({
  scrollProgress,
  furColor,
  collarColor,
  sensorColor,
  onPet,
  soloCat,
  cameraAngle,
  cameraDistance,
}: CatSceneProps) {
  const progressRef = useRef(0);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    progressRef.current = soloCat ? 0 : scrollProgress.get();
  });

  useFrame(({ camera: activeCamera }, delta) => {
    if (soloCat) {
      activeCamera.position.x = THREE.MathUtils.damp(activeCamera.position.x, Math.sin(cameraAngle) * cameraDistance, 3.2, delta);
      activeCamera.position.y = THREE.MathUtils.damp(activeCamera.position.y, 0.72, 3.2, delta);
      activeCamera.position.z = THREE.MathUtils.damp(activeCamera.position.z, Math.cos(cameraAngle) * cameraDistance, 3.2, delta);
      activeCamera.lookAt(cameraTarget.set(0, 0.42, 0));
      return;
    }

    const progress = progressRef.current;
    const neckZoom = smoothStep(0.23, 0.43, progress) * (1 - smoothStep(0.48, 0.57, progress));
    const portalWalk = smoothStep(0.55, 0.8, progress);
    const throughPortal = smoothStep(0.79, 0.94, progress);
    const portraitZ = THREE.MathUtils.lerp(5.2, 4.1, neckZoom);
    const walkZ = THREE.MathUtils.lerp(portraitZ, 3.35, portalWalk);
    const finalZ = THREE.MathUtils.lerp(walkZ, -2.2, throughPortal);
    const cameraY = THREE.MathUtils.lerp(0.55, 0.75, neckZoom) - throughPortal * 0.2;
    activeCamera.position.x = THREE.MathUtils.damp(activeCamera.position.x, Math.sin(progress * Math.PI * 2) * 0.12, 1.8, delta);
    activeCamera.position.y = THREE.MathUtils.damp(activeCamera.position.y, cameraY, 2, delta);
    activeCamera.position.z = THREE.MathUtils.damp(activeCamera.position.z, finalZ, 2, delta);
    cameraTarget.set(0, 0.42 - throughPortal * 0.35, -throughPortal * 4.5);
    activeCamera.lookAt(cameraTarget);
  });

  return (
    <>
      <color attach="background" args={[soloCat ? "#000000" : "#070A09"]} />
      {!soloCat && <fog attach="fog" args={["#070A09", 9, 23]} />}
      <ambientLight intensity={soloCat ? 0.52 : 0.38} />
      <directionalLight position={[4, 6, 5]} intensity={soloCat ? 3.1 : 2.1} color="#f1eadc" castShadow />
      <pointLight position={[0, 1.8, 4]} intensity={soloCat ? 10 : 10} color="#fffaf0" distance={12} />
      <pointLight position={[-3, 2, -2]} intensity={soloCat ? 7 : 12} color="#64D5A5" distance={10} />
      {soloCat && <pointLight position={[3, 2, -3]} intensity={6} color="#b4d7ff" distance={10} />}
      {!soloCat && <pointLight position={[3, -1, 2]} intensity={4} color="#C4A575" distance={8} />}
      <Float speed={1.05} rotationIntensity={0.035} floatIntensity={0.045}>
        <Cat
          furColor={furColor}
          collarColor={collarColor}
          sensorColor={sensorColor}
          progressRef={progressRef}
          onPet={onPet}
          soloCat={soloCat}
        />
      </Float>
      {!soloCat && (
        <>
          <Hardware progressRef={progressRef} collarColor={collarColor} sensorColor={sensorColor} />
          <Portal progressRef={progressRef} />
          <Garden progressRef={progressRef} />
          <Sparkles count={68} scale={[7, 5.2, 5]} size={1.8} speed={0.19} opacity={0.42} color="#C4A575" />
        </>
      )}
      <Environment preset="studio" />
    </>
  );
}

export default function CatScene(props: CatSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.72, 7.8], fov: 36 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      aria-label="Scroll-driven PAWSSION smart collar and companion scene"
    >
      <Suspense fallback={null}><Scene {...props} /></Suspense>
    </Canvas>
  );
}
