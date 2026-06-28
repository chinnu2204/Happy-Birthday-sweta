import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trash2, HelpCircle, Eye, Play, MousePointerClick, Heart } from "lucide-react";
import { triggerSparkleSound } from "./AudioPlayer";

interface SparklerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
  life: number;
}

export const SparklerCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeColor, setActiveColor] = useState<"gold" | "rose" | "cyan" | "emerald">("gold");
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Maintain active particles
  const particlesRef = useRef<SparklerParticle[]>([]);
  // Last position to interpolate lines and avoid gaps when dragging fast
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Sparkler configurations
  const colorConfigs = {
    gold: { hue: 38, shadow: "rgba(255, 170, 50, 0.6)", label: "Golden Embers 🔥" },
    rose: { hue: 342, shadow: "rgba(255, 100, 150, 0.6)", label: "Rose Pink Spark 💖" },
    cyan: { hue: 190, shadow: "rgba(50, 220, 255, 0.6)", label: "Electric Cyan ⚡" },
    emerald: { hue: 140, shadow: "rgba(80, 255, 120, 0.6)", label: "Emerald Magic 🌟" },
  };

  const getActiveHue = () => {
    return colorConfigs[activeColor].hue;
  };

  // Resize canvas to fill the dark container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initial setup: draw a subtle instructions text on the black canvas
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw semi-transparent black overlay to create glowing trailing effect (motion blur)
      ctx.fillStyle = "rgba(10, 8, 12, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Apply slight gravity & drift
        p.vy += 0.05; 
        p.vx += (Math.random() - 0.5) * 0.15;

        p.alpha -= p.decay;
        p.size *= 0.97; // shrink slightly

        if (p.alpha <= 0 || p.size < 0.2) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        
        // Add strong light bloom using shadow
        ctx.shadowBlur = p.size * 2.2;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        // Sparkler sparks are usually tiny hot diamonds or circles
        if (Math.random() > 0.4) {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else {
          // Diamond shape for sparklers
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeColor]);

  const addSparks = (startX: number, startY: number, endX: number, endY: number) => {
    const distance = Math.hypot(endX - startX, endY - startY);
    // Interpolate points to ensure solid trail lines when dragging fast
    const steps = Math.max(1, Math.floor(distance / 4));
    const hue = getActiveHue();

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      // Spawn multiple sparkling hot embers at each point
      const count = Math.random() > 0.7 ? 4 : 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.8 + 0.5;
        
        // Vary the hue slightly for realistic firework chemistry look
        const finalHue = (hue + (Math.random() - 0.5) * 15 + 360) % 360;
        const color = `hsla(${finalHue}, 100%, ${65 + Math.random() * 25}%, 1)`;

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4, // slight upward launch force
          alpha: 1.0,
          size: Math.random() * 3.5 + 1.2,
          color,
          decay: Math.random() * 0.025 + 0.015,
          life: 0,
        });
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setShowGuide(false);
    lastPosRef.current = { x, y };
    
    addSparks(x, y, x, y);
    triggerSparkleSound();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger subtle sparkles occasionally for tactile feedback
    if (Math.random() < 0.18) {
      triggerSparkleSound();
    }

    addSparks(lastPosRef.current.x, lastPosRef.current.y, x, y);
    lastPosRef.current = { x, y };
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleClear = () => {
    triggerSparkleSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current = [];
  };

  // Romantic automatic drawing demo
  const triggerAutoDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    handleClear();
    setShowGuide(false);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;
    const points: { x: number; y: number }[] = [];

    // Heart formula:
    // x = 16 * sin^3(t)
    // y = 13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t)
    const scale = Math.min(canvas.width, canvas.height) / 35;
    for (let t = 0; t <= Math.PI * 2; t += 0.08) {
      const hx = centerX + 16 * Math.pow(Math.sin(t), 3) * scale;
      const hy = centerY - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
      points.push({ x: hx, y: hy });
    }

    // Progressively draw the heart over time
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= points.length - 1) {
        clearInterval(interval);
        return;
      }
      const p1 = points[idx];
      const p2 = points[idx + 1];
      addSparks(p1.x, p1.y, p2.x, p2.y);
      if (idx % 3 === 0) {
        triggerSparkleSound();
      }
      idx++;
    }, 35);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-serif text-2xl text-pink-700 font-bold mb-1">✨ Glowing Sparkler Air-Writer</h3>
        <p className="font-sans text-xs sm:text-sm text-pink-600/70">
          Hold down your mouse or touch screen and drag on the blackboard to write romantic glowing messages in the air!
        </p>
      </div>

      {/* Main Sparkler Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-pink-100 shadow-xl bg-[#0a080c] select-none">
        
        {/* Sparkler Canvas Drawing Area */}
        <div 
          ref={containerRef}
          className="w-full h-[380px] sm:h-[440px] relative cursor-crosshair"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="absolute inset-0 w-full h-full block"
          />

          {/* Glowing guide overlay */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/10 animate-pulse">
                  <MousePointerClick className="w-6 h-6 text-yellow-400 animate-bounce" />
                </div>
                <h4 className="font-serif text-lg text-yellow-200 font-bold mb-1.5 drop-shadow">Press, Hold & Drag!</h4>
                <p className="font-sans text-xs text-pink-200/60 max-w-xs leading-relaxed">
                  Ignite the magical sparkler by holding down your finger or mouse and sketching sweet words or shapes in the sky.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM CONTROLS & COLOR PICKER */}
        <div className="bg-[#121016] border-t border-purple-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Sparkler Chemistry Color Selector */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-bold text-pink-200/50 uppercase tracking-wider mr-1">Chemistry:</span>
            <div className="flex gap-2">
              {Object.entries(colorConfigs).map(([key, config]) => {
                const isSelected = activeColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      triggerSparkleSound();
                      setActiveColor(key as any);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-sans text-[11px] font-bold tracking-wide transition-all ${
                      isSelected
                        ? "bg-purple-600/30 text-white border border-purple-500/50 shadow"
                        : "text-pink-300/60 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="inline-block mr-1">
                      {key === "gold" && "🔥"}
                      {key === "rose" && "💖"}
                      {key === "cyan" && "⚡"}
                      {key === "emerald" && "🌟"}
                    </span>
                    {config.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={triggerAutoDraw}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-white font-sans text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Auto-Draw Heart</span>
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2 bg-[#1b1722] hover:bg-[#25202f] border border-purple-900/60 text-pink-300 hover:text-white font-sans text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Sky</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
