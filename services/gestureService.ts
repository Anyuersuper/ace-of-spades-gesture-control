import { FilesetResolver, HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HandGestureData } from "../types";

let handLandmarker: HandLandmarker | null = null;
let lastTimestamp = 0;
let lastX = 0;
let lastY = 0;

export const initializeHandLandmarker = async (): Promise<void> => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 1
  });
};

const processHandLandmarks = (landmarks: NormalizedLandmark[], timestamp: number): HandGestureData => {
  // 1. Position Logic
  const indexTip = landmarks[8];
  // Mirror X because video is mirrored
  const x = 1 - indexTip.x; 
  const y = indexTip.y;

  // 2. Velocity Logic
  const dt = timestamp - lastTimestamp;
  let vx = 0;
  let vy = 0;

  if (dt > 0 && dt < 100) { // Filter out large jumps or pauses
    // Simple pixel/frame velocity approximates
    // Scale up slightly to make numbers manageable (e.g., movement per second equivalent)
    const timeScale = 16.6 / dt; 
    vx = (x - lastX) * timeScale;
    vy = (y - lastY) * timeScale;
  }

  // Update history
  lastX = x;
  lastY = y;
  lastTimestamp = timestamp;

  // 3. Gesture Logic
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const handSize = Math.hypot(middleMCP.x - wrist.x, middleMCP.y - wrist.y);
  
  const tips = [12, 16, 20];
  let foldedFingersCount = 0;
  
  tips.forEach(idx => {
    const tip = landmarks[idx];
    const distToWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    if (distToWrist < handSize * 1.2) foldedFingersCount++;
  });

  const indexTipDist = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
  const indexIsExtended = indexTipDist > handSize * 1.5;

  const isPointing = indexIsExtended && foldedFingersCount >= 3;
  const isOpen = foldedFingersCount < 3;

  return {
    x,
    y,
    vx,
    vy,
    isOpen,
    isPointing,
    detected: true
  };
};

export const detectHandGesture = (video: HTMLVideoElement, timestamp: number): HandGestureData[] => {
  if (!handLandmarker) return [];

  const result = handLandmarker.detectForVideo(video, timestamp);
  const handsData: HandGestureData[] = [];

  if (result.landmarks && result.landmarks.length > 0) {
    handsData.push(processHandLandmarks(result.landmarks[0], timestamp));
  }

  return handsData;
};