import React, { useEffect, useRef, useState } from 'react';
import { CardScene } from './components/CardScene';
import { initializeHandLandmarker, detectHandGesture } from './services/gestureService';
import { GameState, HandGestureData } from './types';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const requestRef = useRef<number | null>(null);
  
  const gestureDataRef = useRef<HandGestureData[]>([]);

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeHandLandmarker();
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, facingMode: 'user' } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            videoRef.current?.play();
            setGameState(GameState.READY);
            startDetectionLoop();
          };
        }
      } catch (err) {
        console.error("Initialization failed", err);
        setGameState(GameState.ERROR);
      }
    };

    setup();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startDetectionLoop = () => {
    const loop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = detectHandGesture(videoRef.current, performance.now());
        gestureDataRef.current = results;
      }
      requestRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex justify-center items-center">
      
      {/* Background Video Layer - Natural Look */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        playsInline
        muted
      />

      {/* 3D Scene Layer */}
      <div className="absolute top-0 left-0 w-full h-full z-10">
        {gameState === GameState.READY && (
          <CardScene gestureDataRef={gestureDataRef} />
        )}
      </div>

      {/* UI Overlay - Clean & Minimal */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-black/60 text-white p-4 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg max-w-sm">
          <h1 className="text-xl font-bold mb-2 tracking-wide text-white">
            Magic Ace
          </h1>
          
          {gameState === GameState.LOADING && (
            <div className="flex items-center space-x-2 text-gray-300">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading Vision AI...</span>
            </div>
          )}

          {gameState === GameState.READY && (
            <div className="space-y-1 text-sm text-gray-200">
              <p>🖐️ <b>Open Hand:</b> Make Card Bigger</p>
              <p>✊ <b>Fist:</b> Make Card Smaller</p>
              <p>☝️ <b>Point Up:</b> Spin Card (Hover Mode)</p>
              <div className="h-px bg-white/20 my-2"></div>
              <p>💨 <b>Swipe (Odd):</b> Throw Card Away</p>
              <p>↩️ <b>Swipe (Even):</b> Summon Card Back</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;