import React, { useRef } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, MathUtils, Mesh, Vector3 } from 'three';
import { HandGestureData } from '../types';

interface SceneProps {
  gestureDataRef: React.MutableRefObject<HandGestureData[]>;
}

// --- CLASSIC POKER TEXTURES ---

const encodeSvg = (svgString: string) => {
  return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgString)))}`;
};

// Classic Ace of Spades (Clean White)
const CLASSIC_FRONT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" style="background-color:white">
  <rect width="500" height="700" fill="white" rx="30" />
  <!-- Corner Top Left -->
  <text x="40" y="80" font-size="60" fill="black" font-family="Arial" font-weight="bold">A</text>
  <text x="40" y="140" font-size="60" fill="black" font-family="Arial">♠</text>
  
  <!-- Center Big Spade -->
  <text x="250" y="420" font-size="300" fill="black" font-family="Arial" text-anchor="middle">♠</text>
  
  <!-- Corner Bottom Right (Rotated) -->
  <g transform="rotate(180, 460, 620)">
    <text x="460" y="620" font-size="60" fill="black" font-family="Arial" font-weight="bold">A</text>
    <text x="460" y="680" font-size="60" fill="black" font-family="Arial">♠</text>
  </g>
</svg>`.trim();

// Classic Red Pattern Back
const CLASSIC_BACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="140" style="background-color:white">
  <defs>
    <pattern id="pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="5" height="10" fill="#b91c1c" />
    </pattern>
  </defs>
  <rect width="100" height="140" fill="white" rx="5" />
  <rect x="5" y="5" width="90" height="130" fill="url(#pattern)" rx="5" stroke="#b91c1c" stroke-width="2"/>
</svg>`.trim();

const FRONT_URL = encodeSvg(CLASSIC_FRONT_SVG);
const BACK_URL = encodeSvg(CLASSIC_BACK_SVG);

// Card State for Animations
type CardState = 'VISIBLE' | 'GONE_UP' | 'GONE_DOWN' | 'GONE_LEFT' | 'GONE_RIGHT';

const Card = ({ gestureDataRef }: { gestureDataRef: React.MutableRefObject<HandGestureData[]> }) => {
  const meshRef = useRef<Mesh>(null);
  const scaleRef = useRef(1.0);
  
  // State for Fly/Return logic
  const cardStateRef = useRef<CardState>('VISIBLE');
  const targetPosRef = useRef(new Vector3(0, 0, 0));
  
  // Debounce for swipe toggle
  const lastSwipeTimeRef = useRef(0);

  // State Transition Immunity
  // We track the previous gesture state to detect changes
  const lastIsPointingRef = useRef(false);
  const lastIsOpenRef = useRef(true);
  const gestureStableTimeRef = useRef(0);

  const [frontTexture, backTexture] = useLoader(TextureLoader, [FRONT_URL, BACK_URL]);
  const { viewport } = useThree();

  // Thresholds
  const SWIPE_THRESHOLD = 0.08; // Increased slightly to reduce false positives
  const FLY_DISTANCE = 15; // How far it flies off screen
  const SWIPE_COOLDOWN = 500; // ms
  const GESTURE_IMMUNITY_MS = 400; // Ignore swipes for 400ms after gesture change

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const data = gestureDataRef.current[0];
    const isHandDetected = data && data.detected;
    const now = performance.now();

    // --- GESTURE STABILITY CHECK ---
    if (isHandDetected) {
      const gestureChanged = (data.isPointing !== lastIsPointingRef.current) || (data.isOpen !== lastIsOpenRef.current);
      
      if (gestureChanged) {
        // Gesture just changed (e.g. Point -> Fist), reset stability timer
        gestureStableTimeRef.current = now;
        lastIsPointingRef.current = data.isPointing;
        lastIsOpenRef.current = data.isOpen;
      }
    }

    const isGestureStable = (now - gestureStableTimeRef.current) > GESTURE_IMMUNITY_MS;

    // --- TOGGLE LOGIC (ODD/EVEN SWIPES) ---
    
    if (isHandDetected && isGestureStable && (now - lastSwipeTimeRef.current > SWIPE_COOLDOWN)) {
      // Check magnitude of velocity to detect a "flick"
      const vMag = Math.hypot(data.vx, data.vy);
      
      if (vMag > SWIPE_THRESHOLD) {
        if (cardStateRef.current === 'VISIBLE') {
          // ODD SWIPE: Fly Away in direction of movement
          if (Math.abs(data.vy) > Math.abs(data.vx)) {
            // Vertical Swipe
            cardStateRef.current = data.vy < 0 ? 'GONE_UP' : 'GONE_DOWN';
          } else {
            // Horizontal Swipe
            cardStateRef.current = data.vx < 0 ? 'GONE_LEFT' : 'GONE_RIGHT';
          }
          lastSwipeTimeRef.current = now;
        } else {
          // EVEN SWIPE: Return to Center (regardless of direction, just "summon" it)
          cardStateRef.current = 'VISIBLE';
          lastSwipeTimeRef.current = now;
        }
      }
    }

    // --- TARGET POSITION CALCULATION ---

    if (cardStateRef.current === 'VISIBLE') {
      if (isHandDetected) {
        const handX = (data.x - 0.5) * viewport.width;
        const handY = -(data.y - 0.5) * viewport.height;

        if (data.isPointing) {
          // Pointing: Hover above finger (Reduced offset distance)
          const verticalOffset = 0.3 + (scaleRef.current * 0.3);
          targetPosRef.current.set(handX, handY + verticalOffset, 0.5);
        } else {
          // Normal: Follow finger directly
          targetPosRef.current.set(handX, handY, 0);
        }
      } else {
        // No hand: Center screen
        targetPosRef.current.set(0, 0, 0);
      }
    } else {
      // Fly Away Positions
      switch (cardStateRef.current) {
        case 'GONE_UP': targetPosRef.current.set(0, FLY_DISTANCE, 0); break;
        case 'GONE_DOWN': targetPosRef.current.set(0, -FLY_DISTANCE, 0); break;
        case 'GONE_LEFT': targetPosRef.current.set(-FLY_DISTANCE, 0, 0); break;
        case 'GONE_RIGHT': targetPosRef.current.set(FLY_DISTANCE, 0, 0); break;
      }
    }

    // --- APPLY MOVEMENT (LERP) ---

    // Move faster when flying away, smoother when following
    const speed = cardStateRef.current === 'VISIBLE' ? 0.1 : 0.08;
    meshRef.current.position.lerp(targetPosRef.current, speed);

    // --- SCALE & ROTATION ---

    if (cardStateRef.current === 'VISIBLE' && isHandDetected) {
      if (data.isPointing) {
        // Spin logic
        meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
        meshRef.current.rotation.y += delta * 6; // Fast spin
      } else {
        // Scale logic (Only update if not pointing)
        const targetScale = data.isOpen ? 2.5 : 0.5;
        scaleRef.current = MathUtils.lerp(scaleRef.current, targetScale, 0.1);
        
        // Tilt logic based on screen position
        const targetTiltX = (meshRef.current.position.y / viewport.height) * 0.5;
        const targetTiltY = (meshRef.current.position.x / viewport.width) * 0.5;
        meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, targetTiltX, 0.1);
        meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, targetTiltY, 0.1);
      }
    } else {
       // Idle or Gone rotation
       meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
       if (cardStateRef.current !== 'VISIBLE') {
         // Spin while flying away
         meshRef.current.rotation.y += delta * 15;
       } else {
         // Idle center rotation
         meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
       }
    }

    // Always apply current scale
    meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1.4, 0.01]} />
      {/* Sides (White) */}
      <meshStandardMaterial attach="material-0" color="white" />
      <meshStandardMaterial attach="material-1" color="white" />
      <meshStandardMaterial attach="material-2" color="white" />
      <meshStandardMaterial attach="material-3" color="white" />
      {/* Front (Ace) */}
      <meshStandardMaterial attach="material-4" map={frontTexture} color="white" roughness={0.4} />
      {/* Back (Pattern) */}
      <meshStandardMaterial attach="material-5" map={backTexture} color="white" roughness={0.4} />
    </mesh>
  );
};

export const CardScene: React.FC<SceneProps> = ({ gestureDataRef }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      {/* Realistic Lighting */}
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.0} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      
      <React.Suspense fallback={null}>
        <Card gestureDataRef={gestureDataRef} />
      </React.Suspense>
    </Canvas>
  );
};