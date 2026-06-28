import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wind, Sparkles, Mic, MicOff, Heart, 
  Palette, Sliders, Check, Slice, RotateCcw, Flame
} from "lucide-react";
import { triggerSparkleSound } from "./AudioPlayer";

export const CakeSection: React.FC = () => {
  const CANDLE_WICKS = [
    { x: 79, y: 47 },
    { x: 100.2, y: 50 },
    { x: 121.7, y: 47 }
  ];

  const [candlesLit, setCandlesLit] = useState(true);
  const [wishPopped, setWishPopped] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);

  // New interactive features state
  const [cakeFlavor, setCakeFlavor] = useState<"strawberry" | "chocolate" | "blueberry">("strawberry");
  const [toppingType, setToppingType] = useState<"cherries" | "macarons" | "sprinkles">("cherries");
  const [cakeMessage, setCakeMessage] = useState("Sweta ✨");
  const [sparklersActive, setSparklersActive] = useState(false);
  const [isSliced, setIsSliced] = useState(false);

  const [smokeParticles, setSmokeParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    tx: number;
    ty: number;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  const spawnSmoke = () => {
    const particles = [];
    let id = 0;
    
    // Spawn 15 smoke particles per candle wick (total 45 particles)
    for (let c = 0; c < 3; c++) {
      const wick = CANDLE_WICKS[c];
      for (let p = 0; p < 15; p++) {
        const driftX = (Math.random() - 0.5) * 40; // Drift left/right
        const driftY = -50 - Math.random() * 80;   // Float upwards
        const size = 3 + Math.random() * 8;       // Puffy smoke sizes
        const delay = Math.random() * 0.8;         // Staggered puffing
        const duration = 1.2 + Math.random() * 1.5; // Staggered dissipation
        
        particles.push({
          id: id++,
          x: wick.x,
          y: wick.y,
          tx: wick.x + driftX,
          ty: wick.y + driftY,
          size,
          delay,
          duration
        });
      }
    }
    setSmokeParticles(particles);
  };

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle Blow candles event
  const blowCandles = () => {
    if (!candlesLit) return;
    
    // Play audio feedback
    triggerSparkleSound();
    
    // Soft premium warm flash effect (fixed glitchy mix-blend-difference)
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 500);

    // Toggle states
    setCandlesLit(false);
    setSparklersActive(false);
    
    // Trigger smoke trails
    spawnSmoke();
    
    // Stop mic stream
    stopMicrophone();

    // Trigger wish popping
    setTimeout(() => {
      setWishPopped(true);
      triggerSparkleSound();
    }, 600);
  };

  const resetCake = () => {
    setCandlesLit(true);
    setWishPopped(false);
    setIsSliced(false);
    setVolumeLevel(0);
    setSmokeParticles([]);
  };

  // Setup Microphone blow detection
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setMicActive(true);

      const checkVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        // Use time domain data to calculate signal amplitude, which is extremely robust for detecting air blows
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          // 128 is the neutral/silent level in 8-bit PCM data. Calculate deviation from center.
          sum += Math.abs(dataArrayRef.current[i] - 128);
        }
        const averageDeviation = sum / dataArrayRef.current.length;
        
        // averageDeviation ranges from 0 (silence) to 127 (maximum volume).
        // A direct puff or blow produces a very large average deviation (> 10-15).
        // Let's normalize it to a 0-100 range where 18+ average deviation is 100% volume.
        const normalized = Math.min(Math.round((averageDeviation / 18) * 100), 100);
        
        setVolumeLevel(normalized);

        // Blow out candles if volume exceeds threshold (35%)
        if (normalized > 35) {
          blowCandles();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };

      checkVolume();
    } catch (err) {
      console.warn("Microphone access denied or unsupported", err);
      setMicActive(false);
    }
  };

  const stopMicrophone = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (e) {
        console.warn("Error closing AudioContext:", e);
      }
      audioContextRef.current = null;
    }
    setMicActive(false);
    setVolumeLevel(0);
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  // Cutting the cake
  const handleCutCake = () => {
    setIsSliced(true);
    triggerSparkleSound();
  };

  // Flavor styling mappings
  const flavorGradients = {
    strawberry: {
      topLid: "url(#pink-lid-grad)",
      topBase: "url(#pink-base-grad)",
      midLid: "url(#rose-lid-grad)",
      midBase: "url(#rose-base-grad)",
      botLid: "url(#violet-lid-grad)",
      botBase: "url(#violet-base-grad)",
      creamColor: "#ffecf2",
      dripColor: "url(#strawberry-drip-grad)"
    },
    chocolate: {
      topLid: "url(#choc-top-lid)",
      topBase: "url(#choc-top-base)",
      midLid: "url(#choc-mid-lid)",
      midBase: "url(#choc-mid-base)",
      botLid: "url(#choc-bot-lid)",
      botBase: "url(#choc-bot-base)",
      creamColor: "#fffbeb",
      dripColor: "url(#chocolate-drip-grad)"
    },
    blueberry: {
      topLid: "url(#blue-top-lid)",
      topBase: "url(#blue-top-base)",
      midLid: "url(#blue-mid-lid)",
      midBase: "url(#blue-mid-base)",
      botLid: "url(#blue-bot-lid)",
      botBase: "url(#blue-bot-base)",
      creamColor: "#f3f0ff",
      dripColor: "url(#blueberry-drip-grad)"
    }
  };

  const currentStyles = flavorGradients[cakeFlavor];

  return (
    <section
      id="cake"
      className="relative w-full py-28 px-6 md:px-12 bg-gradient-to-b from-[#fff5f8] via-[#ffd6e4] to-[#fff5f8] flex flex-col items-center justify-center overflow-hidden"
    >
      <style>{`
        @keyframes flame-flicker-1 {
          0%, 100% { transform: scale(1) rotate(-0.8deg) skewX(-0.5deg); }
          15% { transform: scale(0.96, 1.04) rotate(0.4deg) skewX(0.4deg); }
          30% { transform: scale(1.04, 0.96) rotate(-1.2deg) skewX(-1deg); }
          45% { transform: scale(0.97, 1.03) rotate(0.6deg) skewX(0.5deg); }
          60% { transform: scale(1.03, 0.97) rotate(-0.5deg) skewX(-0.4deg); }
          75% { transform: scale(0.95, 1.05) rotate(1deg) skewX(0.8deg); }
          90% { transform: scale(1.05, 0.95) rotate(-0.8deg) skewX(-0.6deg); }
        }

        @keyframes flame-flicker-2 {
          0%, 100% { transform: scale(1) rotate(0.6deg) skewX(0.4deg); }
          20% { transform: scale(1.04, 0.96) rotate(-0.8deg) skewX(-0.6deg); }
          40% { transform: scale(0.96, 1.04) rotate(0.8deg) skewX(0.6deg); }
          60% { transform: scale(1.02, 0.98) rotate(-0.6deg) skewX(-0.4deg); }
          80% { transform: scale(0.98, 1.02) rotate(0.6deg) skewX(0.5deg); }
        }

        @keyframes flame-flicker-3 {
          0%, 100% { transform: scale(1) rotate(-0.3deg); }
          25% { transform: scale(1.06) rotate(0.5deg); }
          50% { transform: scale(0.94) rotate(-0.5deg); }
          75% { transform: scale(1.03) rotate(0.3deg); }
        }

        .animate-flame-1 {
          animation: flame-flicker-1 1.1s infinite ease-in-out;
        }
        .animate-flame-2 {
          animation: flame-flicker-2 0.85s infinite ease-in-out;
        }
        .animate-flame-3 {
          animation: flame-flicker-3 0.58s infinite ease-in-out;
        }
      `}</style>

      {/* PREMIUM SOFT CAMERA GLOW FLASH (replaces the scary mix-blend-difference glitch) */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 bg-white/95 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1 bg-pink-100 border border-pink-200 text-pink-600 rounded-full text-xs uppercase font-bold tracking-widest mb-4"
          >
            <Wind className="w-3.5 h-3.5 text-pink-500" />
            <span>Interactive Real-time Bakery</span>
          </motion.div>
          <h3 className="font-serif luxury-text text-4xl sm:text-6xl text-[#FF4D8D] mb-4">
            Blow Out Sweta's Candles! 🎂
          </h3>
          <p className="font-sans text-sm sm:text-base text-pink-700/80 max-w-lg mx-auto leading-relaxed">
            {micActive
              ? "Awesome! Make a wish for Sweta, then BLOW hard directly into your microphone to blow out the candles!"
              : "Make a birthday wish for Sweta, then blow out the candles! You can enable your microphone or blow them manually."}
          </p>
        </div>

        {/* INTERACTIVE CONTROLS WRAPPER (Centered & Refined) */}
        <div className="w-full flex flex-col items-center justify-center mb-12">

          {/* THE GRAPHICAL CAKE PORTAL (Centered beautifully) */}
          <div className="relative w-80 h-[340px] flex flex-col items-center justify-end select-none mb-8">
            
            {/* Real Candle smoke rise effect */}
            {!candlesLit && (
              <div className="absolute top-10 flex justify-center gap-10 w-full z-20">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 5, opacity: 0.8, scale: 0.6 }}
                    animate={{ y: -70, opacity: 0, scale: 1.8, x: [0, (i - 1) * 15, (i - 1) * -10] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
                    className="w-2.5 h-12 bg-zinc-400/25 rounded-full blur-md absolute"
                    style={{ left: `${32 + i * 14}%` }}
                  />
                ))}
              </div>
            )}

            {/* Sparklers Spark Particles */}
            {candlesLit && sparklersActive && (
              <div className="absolute top-4 w-full h-40 pointer-events-none z-30">
                {[...Array(14)].map((_, idx) => {
                  const randomX = Math.random() * 160 - 80;
                  const randomY = Math.random() * -60 - 10;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{ 
                        scale: [0, 1.2, 0], 
                        x: [0, randomX], 
                        y: [0, randomY], 
                        opacity: [1, 0.8, 0] 
                      }}
                      transition={{ 
                        duration: 0.8 + Math.random() * 0.6, 
                        repeat: Infinity, 
                        delay: Math.random() * 0.5 
                      }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 left-1/2 top-10 shadow-[0_0_8px_#fbbf24]"
                    />
                  );
                })}
              </div>
            )}

            {/* SVG HIGH-FIDELITY CAKE DESIGN */}
            <svg className="w-72 h-80 drop-shadow-[0_20px_45px_rgba(230,57,80,0.18)] overflow-visible" viewBox="0 0 200 240">
              
              {/* Definitions for Gradients */}
              <defs>
                {/* 1. STRAWBERRY FLAVOR GRADIENTS */}
                <linearGradient id="pink-lid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff1f2" />
                  <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>
                <linearGradient id="pink-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#db2777" />
                  <stop offset="30%" stopColor="#f472b6" />
                  <stop offset="70%" stopColor="#fbcfe8" />
                  <stop offset="100%" stopColor="#db2777" />
                </linearGradient>

                <linearGradient id="rose-lid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff1f2" />
                  <stop offset="100%" stopColor="#fecdd3" />
                </linearGradient>
                <linearGradient id="rose-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="35%" stopColor="#fb7185" />
                  <stop offset="65%" stopColor="#fecdd3" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>

                <linearGradient id="violet-lid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#faf5ff" />
                  <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
                <linearGradient id="violet-base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a21caf" />
                  <stop offset="30%" stopColor="#d946ef" />
                  <stop offset="70%" stopColor="#fdf4ff" />
                  <stop offset="100%" stopColor="#a21caf" />
                </linearGradient>

                {/* 2. CHOCOLATE FLAVOR GRADIENTS */}
                <linearGradient id="choc-top-lid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c27a51" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="choc-top-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="25%" stopColor="#78350f" />
                  <stop offset="75%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>

                <linearGradient id="choc-mid-lid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
                <linearGradient id="choc-mid-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b1601" />
                  <stop offset="35%" stopColor="#7c2d12" />
                  <stop offset="65%" stopColor="#9a3412" />
                  <stop offset="100%" stopColor="#3b1601" />
                </linearGradient>

                <linearGradient id="choc-bot-lid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#3b1601" />
                </linearGradient>
                <linearGradient id="choc-bot-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#271001" />
                  <stop offset="30%" stopColor="#542304" />
                  <stop offset="70%" stopColor="#853e0f" />
                  <stop offset="100%" stopColor="#271001" />
                </linearGradient>

                {/* 3. BLUEBERRY FLAVOR GRADIENTS */}
                <linearGradient id="blue-top-lid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e0e7ff" />
                  <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
                <linearGradient id="blue-top-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#312e81" />
                  <stop offset="30%" stopColor="#4f46e5" />
                  <stop offset="70%" stopColor="#c7d2fe" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>

                <linearGradient id="blue-mid-lid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eef2ff" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="blue-mid-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="35%" stopColor="#3730a3" />
                  <stop offset="65%" stopColor="#a5b4fc" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>

                <linearGradient id="blue-bot-lid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5f3ff" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
                <linearGradient id="blue-bot-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#120630" />
                  <stop offset="30%" stopColor="#311082" />
                  <stop offset="70%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#120630" />
                </linearGradient>

                {/* Common Chocolate, Strawberry, Blueberry drip definitions */}
                <linearGradient id="strawberry-drip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <linearGradient id="chocolate-drip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#1c0a00" />
                </linearGradient>
                <linearGradient id="blueberry-drip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>

                {/* Metallic Gold Plaque Gradient */}
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE066" />
                  <stop offset="30%" stopColor="#F5C71A" />
                  <stop offset="50%" stopColor="#FFF2B2" />
                  <stop offset="70%" stopColor="#B8860B" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>

                {/* Shiny Silver Stand Gradients */}
                <linearGradient id="silver-stand-lid" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="silver-stand-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="silver-stand-stem" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                {/* Candle Flames */}
                <radialGradient id="candle-flame-outer" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="30%" stopColor="#fef08a" />
                  <stop offset="70%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="candle-flame-inner" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>

                {/* Candles colors */}
                <linearGradient id="candle-pink" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#fbcfe8" />
                  <stop offset="100%" stopColor="#be185d" />
                </linearGradient>
                <linearGradient id="candle-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Cherry Red Glossy */}
                <radialGradient id="cherry-grad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="30%" stopColor="#ef4444" />
                  <stop offset="80%" stopColor="#991b1b" />
                  <stop offset="100%" stopColor="#450a0a" />
                </radialGradient>

                {/* Trailing Smoke Definitions */}
                <radialGradient id="smoke-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f4f4f5" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#d4d4d8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0" />
                </radialGradient>
                <filter id="smoke-blur">
                  <feGaussianBlur stdDeviation="3.5" />
                </filter>
              </defs>

              {/* Cake Stand (Shiny silver base plate) */}
              <g id="cake-stand" transform="translate(0, 5)">
                <path d="M 75 205 Q 90 222 68 232 L 132 232 Q 110 222 125 205 Z" fill="url(#silver-stand-stem)" />
                <ellipse cx="100" cy="232" rx="34" ry="6" fill="url(#silver-stand-base)" />
                <path d="M 10 205 L 10 212 A 90 14 0 0 0 190 212 L 190 205 A 90 14 0 0 1 10 205 Z" fill="url(#silver-stand-base)" />
                <ellipse cx="100" cy="205" rx="90" ry="14" fill="url(#silver-stand-lid)" />
              </g>

              {/* 1. Cake Base Tier */}
              <g id="base-tier">
                {/* Side Body */}
                <path d="M 28 165 L 28 205 A 72 14 0 0 0 172 205 L 172 165 A 72 14 0 0 1 28 165 Z" fill={currentStyles.botBase} />
                {/* Lid Surface */}
                <ellipse cx="100" cy="165" rx="72" ry="14" fill={currentStyles.botLid} />

                {/* Cream Dollops on rim */}
                <g id="bottom-creams">
                  {[42, 58, 74, 90, 106, 122, 138, 154].map((cx, idx) => {
                    const dx = (cx - 100) / 72;
                    const cy = 205 + 14 * Math.sqrt(1 - dx * dx) * 0.95;
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="6.5" fill={currentStyles.creamColor} filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.15))" />
                        <circle cx={cx - 1.5} cy={cy - 1.5} r="2.5" fill="#ffffff" opacity="0.9" />
                        <circle cx={cx} cy={cy - 1} r="2" fill="#ec4899" />
                      </g>
                    );
                  })}
                </g>
              </g>

              {/* 2. Cake Middle Tier */}
              <g id="middle-tier">
                {/* Side Body */}
                <path d="M 44 122 L 44 160 A 56 11 0 0 0 156 160 L 156 122 A 56 11 0 0 1 44 122 Z" fill={currentStyles.midBase} />
                {/* Lid Surface */}
                <ellipse cx="100" cy="122" rx="56" ry="11" fill={currentStyles.midLid} />

                {/* Elegant Cream Swirl lines along side */}
                <path d="M 44 127 Q 58 136 72 127 Q 86 136 100 127 Q 114 136 128 127 Q 142 136 156 127" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

                {/* Drips hanging down beautifully */}
                <path d="M 44 122 Q 52 135 58 126 Q 64 140 70 125 Q 78 134 84 125 Q 92 143 98 124 Q 106 138 112 125 Q 120 142 126 125 Q 134 135 140 125 Q 148 139 156 122 A 56 11 0 0 1 44 122 Z" fill={currentStyles.dripColor} />
              </g>

              {/* 3. Cake Top Tier */}
              <g id="top-tier">
                {/* Side Body */}
                <path d="M 60 82 L 60 117 A 40 8 0 0 0 140 117 L 140 82 A 40 8 0 0 1 60 82 Z" fill={currentStyles.topBase} />
                {/* Lid Surface */}
                <ellipse cx="100" cy="82" rx="40" ry="8" fill={currentStyles.topLid} />

                {/* Top Drips */}
                <path d="M 60 82 Q 68 93 72 85 Q 78 98 83 85 Q 90 94 95 85 Q 102 101 107 85 Q 114 93 118 85 Q 124 99 129 85 Q 134 92 140 82 A 40 8 0 0 1 60 82 Z" fill={currentStyles.dripColor} />
              </g>

              {/* DYNAMIC REAL-TIME TOPPING RENDERING */}
              {/* Topping A: Glossy Red Cherries */}
              {toppingType === "cherries" && (
                <g id="cherry-toppings">
                  {/* Bottom Tier Cherries */}
                  {[[38, 163], [70, 168], [130, 168], [162, 163]].map(([cx, cy], idx) => (
                    <g key={`bot-${idx}`}>
                      <path d={`M ${cx} ${cy} Q ${cx + 3} ${cy - 10} ${cx + 1} ${cy - 14}`} fill="none" stroke="#222" strokeWidth="0.8" />
                      <circle cx={cx} cy={cy} r="4.5" fill="url(#cherry-grad)" />
                      <circle cx={cx - 1.2} cy={cy - 1.2} r="1" fill="#fff" opacity="0.85" />
                    </g>
                  ))}
                  {/* Middle Tier Cherries */}
                  {[[54, 120], [100, 124], [146, 120]].map(([cx, cy], idx) => (
                    <g key={`mid-${idx}`}>
                      <path d={`M ${cx} ${cy} Q ${cx + 4} ${cy - 9} ${cx + 2} ${cy - 13}`} fill="none" stroke="#222" strokeWidth="0.8" />
                      <circle cx={cx} cy={cy} r="4" fill="url(#cherry-grad)" />
                      <circle cx={cx - 1} cy={cy - 1} r="0.9" fill="#fff" opacity="0.85" />
                    </g>
                  ))}
                </g>
              )}

              {/* Topping B: Colorful Macarons */}
              {toppingType === "macarons" && (
                <g id="macaron-toppings">
                  {/* Render little double layered oval discs with gold/white center */}
                  {[[42, 162, "#38bdf8"], [68, 167, "#fb7185"], [132, 167, "#34d399"], [158, 162, "#a78bfa"]].map(([cx, cy, clr], idx) => (
                    <g key={`mac-bot-${idx}`} transform={`translate(${cx}, ${cy})`}>
                      <rect x="-5" y="-3" width="10" height="6" rx="3" fill={clr as string} />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#fff" strokeWidth="1.5" />
                    </g>
                  ))}
                  {/* Middle Tier Macarons */}
                  {[[54, 120, "#fde047"], [100, 123, "#a78bfa"], [146, 120, "#fb7185"]].map(([cx, cy, clr], idx) => (
                    <g key={`mac-mid-${idx}`} transform={`translate(${cx}, ${cy})`}>
                      <rect x="-4.5" y="-2.5" width="9" height="5" rx="2.5" fill={clr as string} />
                      <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#fff" strokeWidth="1" />
                    </g>
                  ))}
                </g>
              )}

              {/* Topping C: Rainbow Sprinkles */}
              {toppingType === "sprinkles" && (
                <g id="sprinkle-toppings">
                  {/* Sprinkle ovals scatter */}
                  {[[35, 162, "#eab308", 20], [50, 165, "#f43f5e", -45], [75, 167, "#38bdf8", 30], [95, 166, "#a78bfa", 15], [120, 167, "#4ade80", -15], [140, 165, "#f43f5e", 60], [165, 161, "#38bdf8", -20]].map(([cx, cy, clr, rot], idx) => (
                    <rect key={`spr-bot-${idx}`} x={cx as number - 3} y={cy as number - 1} width="6" height="2" rx="1" fill={clr as string} transform={`rotate(${rot}, ${cx}, ${cy})`} />
                  ))}
                  {/* Middle Tier sprinkles */}
                  {[[50, 120, "#38bdf8", 45], [75, 122, "#eab308", -30], [100, 123, "#f43f5e", 15], [125, 122, "#4ade80", -60], [150, 120, "#a78bfa", 30]].map(([cx, cy, clr, rot], idx) => (
                    <rect key={`spr-mid-${idx}`} x={cx as number - 2.5} y={cy as number - 1} width="5" height="1.8" rx="0.9" fill={clr as string} transform={`rotate(${rot}, ${cx}, ${cy})`} />
                  ))}
                </g>
              )}

              {/* CUSTOM CHOCOLATE NAME PLAQUE ON THE FRONT (Bottom Tier) */}
              <g id="greeting-plaque" transform="translate(100, 184)">
                {/* Plaque chocolate base */}
                <rect x="-48" y="-12" width="96" height="24" rx="7" fill="#31150e" stroke="url(#gold-grad)" strokeWidth="1.8" filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.4))" />
                <rect x="-45" y="-9" width="90" height="18" rx="5" fill="#3e1b12" />
                {/* Real-time greeting input text */}
                <text x="0" y="3" fill="url(#gold-grad)" fontFamily="serif" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.4" fontStyle="italic">
                  {cakeMessage || "HAPPY BDAY"}
                </text>
                {/* Plaque tiny gold corner details */}
                <circle cx="-42" cy="0" r="1" fill="#facc15" />
                <circle cx="42" cy="0" r="1" fill="#facc15" />
              </g>

              {/* CANDLES AND FLAMES GROUP */}
              <g id="candles">
                {/* Candle 1 (Left side of top tier) */}
                <rect x="76" y="52" width="6.5" height="32" rx="1" fill="url(#candle-pink)" />
                <path d="M 76 77 L 82.5 74 M 76 70 L 82.5 67 M 76 63 L 82.5 60" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
                <line x1="79" y1="52" x2="79" y2="47" stroke="#37101d" strokeWidth="1.2" />

                {/* Candle 2 (Center - stays slightly back, coordinates layered beautifully) */}
                <rect x="97" y="55" width="6.5" height="30" rx="1" fill="url(#candle-gold)" />
                <path d="M 97 79 L 103.5 76 M 97 72 L 103.5 69 M 97 65 L 103.5 62" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
                <line x1="100.2" y1="55" x2="100.2" y2="50" stroke="#37101d" strokeWidth="1.2" />

                {/* Candle 3 (Right side) */}
                <rect x="118.5" y="52" width="6.5" height="32" rx="1" fill="url(#candle-pink)" />
                <path d="M 118.5 77 L 125 74 M 118.5 70 L 125 67 M 118.5 63 L 125 60" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" />
                <line x1="121.7" y1="52" x2="121.7" y2="47" stroke="#37101d" strokeWidth="1.2" />

                {/* HIGH-FIDELITY 3D-LIKE CSS FLAMES (using foreignObject for responsive rendering) */}
                {candlesLit && (
                  <>
                    {/* Flame 1 */}
                    <foreignObject x="64" y="2" width="30" height="48" overflow="visible">
                      <div className="relative w-full h-full flex flex-col items-center justify-end overflow-visible pointer-events-none select-none">
                        <div className="relative w-6 h-12 flex items-center justify-center overflow-visible">
                          <div className="absolute w-12 h-12 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
                          <div className="absolute w-8 h-8 rounded-full bg-amber-400/30 blur-lg animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="absolute bottom-1 w-5 h-10 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_12px_#f97316] animate-flame-1 origin-bottom filter blur-[0.5px]" />
                          <div className="absolute bottom-2.5 w-3 h-7 bg-gradient-to-t from-orange-400 via-yellow-200 to-white rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_8px_#fde047] animate-flame-2 origin-bottom opacity-95" />
                          <div className="absolute bottom-3 w-1.5 h-4 bg-white rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_4px_#ffffff] animate-flame-3 origin-bottom opacity-90" />
                          <div className="absolute bottom-0 w-4 h-2.5 bg-gradient-to-t from-indigo-600 via-blue-500 to-blue-400 rounded-full blur-[1px] opacity-90 mix-blend-screen" />
                        </div>
                      </div>
                    </foreignObject>

                    {/* Flame 2 */}
                    <foreignObject x="85.2" y="5" width="30" height="48" overflow="visible">
                      <div className="relative w-full h-full flex flex-col items-center justify-end overflow-visible pointer-events-none select-none">
                        <div className="relative w-6 h-12 flex items-center justify-center overflow-visible">
                          <div className="absolute w-12 h-12 rounded-full bg-orange-500/20 blur-xl animate-pulse" style={{ animationDelay: "0.1s" }} />
                          <div className="absolute w-8 h-8 rounded-full bg-amber-400/30 blur-lg animate-pulse" style={{ animationDelay: "0.3s" }} />
                          <div className="absolute bottom-1 w-5 h-10 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_12px_#f97316] animate-flame-2 origin-bottom filter blur-[0.5px]" />
                          <div className="absolute bottom-2.5 w-3 h-7 bg-gradient-to-t from-orange-400 via-yellow-200 to-white rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_8px_#fde047] animate-flame-3 origin-bottom opacity-95" />
                          <div className="absolute bottom-3 w-1.5 h-4 bg-white rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_4px_#ffffff] animate-flame-1 origin-bottom opacity-90" />
                          <div className="absolute bottom-0 w-4 h-2.5 bg-gradient-to-t from-indigo-600 via-blue-500 to-blue-400 rounded-full blur-[1px] opacity-90 mix-blend-screen" />
                        </div>
                      </div>
                    </foreignObject>

                    {/* Flame 3 */}
                    <foreignObject x="106.7" y="2" width="30" height="48" overflow="visible">
                      <div className="relative w-full h-full flex flex-col items-center justify-end overflow-visible pointer-events-none select-none">
                        <div className="relative w-6 h-12 flex items-center justify-center overflow-visible">
                          <div className="absolute w-12 h-12 rounded-full bg-orange-500/20 blur-xl animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="absolute w-8 h-8 rounded-full bg-amber-400/30 blur-lg animate-pulse" style={{ animationDelay: "0.4s" }} />
                          <div className="absolute bottom-1 w-5 h-10 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_12px_#f97316] animate-flame-3 origin-bottom filter blur-[0.5px]" />
                          <div className="absolute bottom-2.5 w-3 h-7 bg-gradient-to-t from-orange-400 via-yellow-200 to-white rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_8px_#fde047] animate-flame-1 origin-bottom opacity-95" />
                          <div className="absolute bottom-3 w-1.5 h-4 bg-white rounded-[50%_50%_20%_20%_/_80%_80%_20%_20%] shadow-[0_0_4px_#ffffff] animate-flame-2 origin-bottom opacity-90" />
                          <div className="absolute bottom-0 w-4 h-2.5 bg-gradient-to-t from-indigo-600 via-blue-500 to-blue-400 rounded-full blur-[1px] opacity-90 mix-blend-screen" />
                        </div>
                      </div>
                    </foreignObject>
                  </>
                )}

                {/* REALISTIC TRAILING SMOKE PARTICLE PLUME */}
                {!candlesLit && smokeParticles.length > 0 && (
                  <g id="dynamic-smoke-particles" opacity="0.85">
                    {smokeParticles.map((p) => (
                      <motion.circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r={p.size}
                        fill="url(#smoke-grad)"
                        filter="url(#smoke-blur)"
                        initial={{ cx: p.x, cy: p.y, r: p.size * 0.4, opacity: 0 }}
                        animate={{
                          cx: [p.x, p.x + (p.tx - p.x) * 0.4, p.tx],
                          cy: [p.y, p.y + (p.ty - p.y) * 0.5, p.ty],
                          r: [p.size * 0.4, p.size, p.size * 2.2],
                          opacity: [0, 0.75, 0.45, 0]
                        }}
                        transition={{
                          duration: p.duration,
                          delay: p.delay,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </g>
                )}
              </g>

              {/* BEAUTIFUL SHINY GOLD TOpper (Sweta cursive) above the cake */}
              <g id="gold-topper" transform="translate(0, 1)">
                <line x1="91" y1="82" x2="91" y2="48" stroke="url(#gold-grad)" strokeWidth="1.8" />
                <line x1="109" y1="82" x2="109" y2="48" stroke="url(#gold-grad)" strokeWidth="1.8" />
                
                {/* Topper background shadow glow */}
                <text x="100.5" y="44" fill="#5c1d24" fontFamily="Playfair Display, Georgia, serif" fontWeight="black" fontSize="13" textAnchor="middle" fontStyle="italic" opacity="0.35">
                  Sweta
                </text>
                {/* Topper text */}
                <text x="100" y="42.5" fill="url(#gold-grad)" fontFamily="Playfair Display, Georgia, serif" fontWeight="black" fontSize="13" textAnchor="middle" fontStyle="italic" filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.2))">
                  Sweta
                </text>
              </g>
            </svg>
          </div>

          {/* CENTERED INTERACTIVE CONTROLS PANEL */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg justify-center text-left">
            
            {/* 1. Mic & Blow controls */}
            <div className="glass-card p-5 shadow-sm border border-pink-100/60 flex-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-pink-700 uppercase tracking-wider mb-3">
                <Flame className="w-3.5 h-3.5 text-pink-500" />
                Blowing Controls
              </span>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={micActive ? stopMicrophone : startMicrophone}
                  disabled={!candlesLit}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border shadow-sm transition-all ${
                    !candlesLit
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : micActive
                      ? "bg-red-500 text-white border-red-400 glow-pink animate-pulse cursor-pointer"
                      : "bg-white text-pink-700 border-pink-200 hover:bg-pink-50 cursor-pointer"
                  }`}
                >
                  {micActive ? (
                    <>
                      <Mic className="w-4 h-4 text-white animate-bounce" />
                      Mic is Listening...
                    </>
                  ) : (
                    <>
                      <MicOff className="w-4 h-4 text-pink-500" />
                      Enable Mic Blow
                    </>
                  )}
                </button>

                <button
                  onClick={blowCandles}
                  disabled={!candlesLit}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all shadow-sm ${
                    !candlesLit
                      ? "bg-pink-50 text-pink-300 border-pink-100 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-pink-400 cursor-pointer shadow-pink-100 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  Blow Candles Manual
                </button>
              </div>

              {/* Mic feedback meter */}
              {micActive && candlesLit && (
                <div className="mt-3 flex flex-col w-full animate-fade-in bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                  <div className="flex justify-between items-center mb-1 text-[9px] font-bold text-pink-600 uppercase tracking-widest">
                    <span>Mic Level:</span>
                    <span>{volumeLevel}%</span>
                  </div>
                  <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-75"
                      style={{ width: `${volumeLevel}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-pink-500 mt-1 italic block text-center">
                    Blow hard! Reaching 35% triggers blow-out!
                  </span>
                </div>
              )}
            </div>

            {/* 2. Sparklers & Restart (combined for perfect balance) */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Extra Magical Sparks Card */}
              <div className="glass-card p-5 shadow-sm border border-pink-100/60 flex-1 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-bold text-pink-700 uppercase tracking-wider">
                    Sparkler Candles
                  </span>
                  <span className="text-[9px] text-pink-500/80 block italic mb-2">
                    Add sparkling fire crackles!
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (candlesLit) {
                      setSparklersActive(!sparklersActive);
                      triggerSparkleSound();
                    }
                  }}
                  disabled={!candlesLit}
                  className={`w-full py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    !candlesLit
                      ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                      : sparklersActive
                      ? "bg-amber-100 border-amber-300 text-amber-600 shadow-sm"
                      : "bg-white border-pink-200 text-pink-600 hover:bg-pink-50 shadow-sm"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {sparklersActive ? "Sparklers: ON" : "Turn Sparklers ON"}
                </button>
              </div>

              {/* Restart Button or small instructions card */}
              {!candlesLit ? (
                <button
                  onClick={resetCake}
                  className="w-full py-4 rounded-xl border border-pink-300 text-pink-600 bg-white text-xs uppercase tracking-wider font-bold hover:bg-pink-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Light Candles Again
                </button>
              ) : (
                <div className="glass-card p-4 border border-pink-100/40 flex items-center justify-center text-center bg-pink-50/20 h-full">
                  <span className="text-[11px] text-pink-700/80 italic leading-relaxed">
                    "A birthday is a beautiful new beginning..." ✨ Make a wish!
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* CUT THE CAKE SECTION (Only unlocked after blowing candles!) */}
        <AnimatePresence>
          {!candlesLit && !isSliced && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 mb-8"
            >
              <button
                onClick={handleCutCake}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all border border-pink-400 cursor-pointer animate-bounce"
              >
                <Slice className="w-4 h-4 animate-spin" style={{ animationDuration: "4s" }} />
                Cut Sweta's Birthday Cake! 🍰
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WISH COMPLETED MASSIVE POPUP / DELICIOUS SLICE REVELATION */}
        <AnimatePresence>
          {wishPopped && (
            <div className="flex flex-col md:flex-row gap-6 items-start justify-center max-w-3xl w-full mt-6">
              
              {/* Wish card */}
              <motion.div
                initial={{ scale: 0, opacity: 0, x: -30 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 15 }}
                className="glass-card p-6 shadow-2xl w-full max-w-sm relative overflow-hidden text-center md:text-left self-stretch flex flex-col justify-between"
              >
                <div>
                  <div className="absolute top-2 right-2 text-yellow-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-rose-500">
                    <Heart className="w-5 h-5 animate-pulse" />
                  </div>

                  <h4 className="font-serif luxury-text text-3xl text-[#E63950] drop-shadow-sm mb-2">
                    Wish Sent! 💖✨
                  </h4>
                  <p className="font-sans text-sm sm:text-base text-pink-900/90 font-medium leading-relaxed mb-4">
                    Your beautiful wish is now riding the stars directly into reality. May all your dreams come true, Sweta!
                  </p>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 rounded-full py-1.5 px-4 inline-block border border-amber-200">
                    "Made with absolute love for Sweta! ✨"
                  </div>
                </div>
              </motion.div>

              {/* Sliced Cake Piece Reveal */}
              {isSliced && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, x: 30 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 15 }}
                  className="glass-card p-6 shadow-2xl w-full max-w-sm relative overflow-hidden text-center self-stretch flex flex-col items-center justify-center border-2 border-pink-200 bg-white/95"
                >
                  <div className="text-pink-600 font-bold text-xs uppercase tracking-widest mb-3">
                    🍰 A Virtual Slice For Sweta!
                  </div>
                  
                  {/* High Quality Slice SVG drawing */}
                  <svg className="w-40 h-40 drop-shadow-md overflow-visible mb-3" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="slice-sponge" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff8fa" />
                        <stop offset="50%" stopColor="#fdf2f8" />
                        <stop offset="100%" stopColor="#fbcfe8" />
                      </linearGradient>
                      <linearGradient id="slice-filling" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#db2777" />
                        <stop offset="100%" stopColor="#9d174d" />
                      </linearGradient>
                    </defs>

                    {/* Plate */}
                    <ellipse cx="60" cy="100" rx="45" ry="10" fill="#fff" stroke="#fecdd3" strokeWidth="1.5" />
                    <ellipse cx="60" cy="100" rx="38" ry="7.5" fill="#fff" opacity="0.8" />

                    {/* Multi layer 3D slice of cake */}
                    <g transform="translate(10, 5)">
                      {/* Left Sponge wall */}
                      <path d="M 50 35 L 20 55 L 20 85 L 50 65 Z" fill="url(#slice-sponge)" />
                      {/* Right Sponge wall (Cut Surface showing layers) */}
                      <path d="M 50 35 L 80 55 L 80 85 L 50 65 Z" fill="#fff" stroke="#fbcfe8" strokeWidth="0.5" />
                      
                      {/* Delicious Jam Fillings (Layers) */}
                      <path d="M 20 65 L 50 48 L 80 65" fill="none" stroke="url(#slice-filling)" strokeWidth="3" />
                      <path d="M 20 75 L 50 58 L 80 75" fill="none" stroke="url(#slice-filling)" strokeWidth="3" strokeDasharray="3 2" />
                      
                      {/* Glazed Pink Top Frosting with cherry */}
                      <path d="M 50 35 Q 35 45 20 55 Q 50 37 80 55 Q 65 45 50 35 Z" fill="#db2777" />
                      <circle cx="50" cy="38" r="4.5" fill="url(#cherry-grad)" />
                      <circle cx="48.5" cy="36.5" r="1.2" fill="#fff" />
                    </g>
                  </svg>

                  <p className="font-sans text-xs text-pink-800 leading-relaxed max-w-xs font-semibold">
                    Grab a virtual bite, Sweta! Multi-layered vanilla sponge with sweet strawberry filling and topped with fresh glossy cherry!
                  </p>
                  
                  <div className="mt-4 text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-100 rounded-full px-3 py-1 animate-pulse">
                    "YUMMY! Happy Birthday! 🍰"
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
