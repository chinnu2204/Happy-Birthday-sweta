import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

// Notes and their frequencies
const NOTES: { freq: number; duration: number }[] = [
  { freq: 261.63, duration: 0.75 }, // C4
  { freq: 261.63, duration: 0.25 }, // C4
  { freq: 293.66, duration: 1.0 },  // D4
  { freq: 261.63, duration: 1.0 },  // C4
  { freq: 349.23, duration: 1.0 },  // F4
  { freq: 329.63, duration: 2.0 },  // E4
  
  { freq: 261.63, duration: 0.75 }, // C4
  { freq: 261.63, duration: 0.25 }, // C4
  { freq: 293.66, duration: 1.0 },  // D4
  { freq: 261.63, duration: 1.0 },  // C4
  { freq: 392.00, duration: 1.0 },  // G4
  { freq: 349.23, duration: 2.0 },  // F4
  
  { freq: 261.63, duration: 0.75 }, // C4
  { freq: 261.63, duration: 0.25 }, // C4
  { freq: 523.25, duration: 1.0 },  // C5
  { freq: 440.00, duration: 1.0 },  // A4
  { freq: 349.23, duration: 1.0 },  // F4
  { freq: 329.63, duration: 1.0 },  // E4
  { freq: 293.66, duration: 2.0 },  // D4
  
  { freq: 466.16, duration: 0.75 }, // A#4
  { freq: 466.16, duration: 0.25 }, // A#4
  { freq: 440.00, duration: 1.0 },  // A4
  { freq: 349.23, duration: 1.0 },  // F4
  { freq: 392.00, duration: 1.0 },  // G4
  { freq: 349.23, duration: 2.5 },  // F4
];

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const isPlayingRef = useRef(false);
  const tempo = 110; // Beats per minute
  const beatDuration = 60 / tempo;
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AudioContext lazily
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playChime = (ctx: AudioContext, freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Create delay effect for romantic jewelry box feel
    const delay = ctx.createDelay();
    const delayGain = ctx.createGain();
    
    delay.delayTime.value = 0.35;
    delayGain.gain.value = 0.3; // volume of echo

    // Warm, shiny sound using sine + triangle wave combo
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);
    
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, startTime); // sub-harmonic shimmer
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

    // Envelope for a music box pluck
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02); // quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05); // long decay

    // Connect nodes
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    
    // Connect to echo delay
    gainNode.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(ctx.destination);
    
    // Connect original sound
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);

    activeNodesRef.current.push(osc, osc2, gainNode, filter, delay, delayGain);
  };

  const playMelody = (startIndex = 0) => {
    if (!isPlayingRef.current) return;
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    let currentScheduledTime = ctx.currentTime + 0.1;

    for (let i = 0; i < NOTES.length; i++) {
      const note = NOTES[i];
      const noteDur = note.duration * beatDuration;
      
      playChime(ctx, note.freq, currentScheduledTime, noteDur);
      currentScheduledTime += noteDur + 0.05; // tiny gap between notes
    }

    // Schedule the next loop of the song
    const totalMelodyDuration = NOTES.reduce((acc, note) => acc + (note.duration * beatDuration + 0.05), 0);
    
    timeoutIdRef.current = setTimeout(() => {
      if (isPlayingRef.current) {
        playMelody();
      }
    }, totalMelodyDuration * 1000);
  };

  const stopMelody = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    activeNodesRef.current.forEach(node => {
      try {
        if ("stop" in node) {
          (node as any).stop();
        }
      } catch (e) {
        // Already stopped
      }
    });
    activeNodesRef.current = [];
  };

  const togglePlayback = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    isPlayingRef.current = newState;

    if (newState) {
      playMelody();
    } else {
      stopMelody();
    }
  };

  // Sound effect triggers can also be triggered globally on click
  useEffect(() => {
    // Sound effect listener on window so other components can trigger quick sparkles!
    const playSparkleSound = () => {
      try {
        const ctx = getAudioContext();
        if (ctx.state === "suspended") ctx.resume();
        
        const now = ctx.currentTime;
        const rootFreq = 440 * (Math.random() * 0.5 + 0.75);
        
        // Play 3 rapid arpeggiating chimes
        [1, 1.25, 1.5].forEach((mult, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(rootFreq * mult, now + index * 0.06);
          
          gain.gain.setValueAtTime(0.15, now + index * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.3);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + index * 0.06);
          osc.stop(now + index * 0.06 + 0.35);
        });
      } catch (e) {
        // Audio not active
      }
    };

    const handleSparkleTrigger = () => {
      playSparkleSound();
    };

    // Auto-start music on first user interaction anywhere on the screen
    const handleFirstInteraction = () => {
      if (!isPlayingRef.current) {
        setIsPlaying(true);
        isPlayingRef.current = true;
        playMelody();
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction, { passive: true });
    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });

    window.addEventListener("play-sparkle-sound", handleSparkleTrigger);
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("play-sparkle-sound", handleSparkleTrigger);
      stopMelody();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Visual Equalizer Pill */}
      {isPlaying && (
        <div className="flex items-center gap-0.5 px-3 py-2 bg-pink-500/90 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-md animate-fade-in border border-pink-400">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          <span className="mr-1.5 text-[11px] uppercase tracking-wider font-bold">Sweta's Chime:</span>
          <div className="flex items-end gap-[2px] h-3">
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: "60%", animationDuration: "0.6s" }} />
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: "100%", animationDuration: "0.4s" }} />
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: "40%", animationDuration: "0.8s" }} />
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: "80%", animationDuration: "0.5s" }} />
          </div>
        </div>
      )}

      {/* Main audio circular toggle */}
      <button
        id="audio-toggle-button"
        onClick={togglePlayback}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
          isPlaying
            ? "bg-gradient-to-r from-rose-500 to-pink-600 border-yellow-300 text-white glow-pink animate-pulse"
            : "bg-white border-pink-200 text-pink-500"
        }`}
        title={isPlaying ? "Mute Background Music" : "Play Magical Birthday Music"}
      >
        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6 text-pink-400" />}
      </button>
    </div>
  );
};

// Global helper to trigger spark sound
export const triggerSparkleSound = () => {
  const event = new CustomEvent("play-sparkle-sound");
  window.dispatchEvent(event);
};
