import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Heart, Sparkles, MessageCircle, RefreshCw } from "lucide-react";
import { INITIAL_WISHES } from "../data";
import { UserWish } from "../types";
import { triggerSparkleSound } from "./AudioPlayer";

interface Firework {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  distanceToTarget: number;
  distanceTraveled: number;
  coordinates: [number, number][];
  coordinateCount: number;
  angle: number;
  speed: number;
  acceleration: number;
  brightness: number;
}

interface Particle {
  x: number;
  y: number;
  coordinates: [number, number][];
  coordinateCount: number;
  angle: number;
  speed: number;
  friction: number;
  gravity: number;
  hue: number;
  brightness: number;
  alpha: number;
  decay: number;
}

export const FireworkFinale: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wishes, setWishes] = useState<UserWish[]>(() => {
    const saved = localStorage.getItem("sweta_birthday_wishes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_WISHES;
      }
    }
    return INITIAL_WISHES;
  });

  const [nameInput, setNameInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  // Fireworks engine arrays
  const fireworksRef = useRef<Firework[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const loopRef = useRef<number | null>(null);

  // Add random rocket trigger
  const triggerAutoFirework = (canvas: HTMLCanvasElement) => {
    const startX = Math.random() * canvas.width;
    const startY = canvas.height;
    const targetX = Math.random() * canvas.width;
    const targetY = Math.random() * (canvas.height * 0.5) + 50;

    fireworksRef.current.push(createFirework(startX, startY, targetX, targetY));
  };

  const createFirework = (sx: number, sy: number, tx: number, ty: number): Firework => {
    const angle = Math.atan2(ty - sy, tx - sx);
    const speed = 2.5;
    const acceleration = 1.05;
    const brightness = Math.random() * 50 + 50;

    const coordinates: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      coordinates.push([sx, sy]);
    }

    return {
      x: sx,
      y: sy,
      targetX: tx,
      targetY: ty,
      distanceToTarget: Math.hypot(tx - sx, ty - sy),
      distanceTraveled: 0,
      coordinates,
      coordinateCount: 3,
      angle,
      speed,
      acceleration,
      brightness,
    };
  };

  const createParticles = (x: number, y: number) => {
    const particleCount = 35;
    const hue = Math.random() * 360;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1;
      const friction = 0.95;
      const gravity = 0.98;
      const decay = Math.random() * 0.02 + 0.015;

      const coordinates: [number, number][] = [];
      for (let j = 0; j < 5; j++) {
        coordinates.push([x, y]);
      }

      particlesRef.current.push({
        x,
        y,
        coordinates,
        coordinateCount: 5,
        angle,
        speed,
        friction,
        gravity,
        hue,
        brightness: Math.random() * 60 + 40,
        alpha: 1,
        decay,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Main animation loop
    const tick = () => {
      // Create trailing fading backdrop
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      const fireworks = fireworksRef.current;
      const particles = particlesRef.current;

      // Update Fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.coordinates.pop();
        fw.coordinates.unshift([fw.x, fw.y]);

        fw.speed *= fw.acceleration;
        const vx = Math.cos(fw.angle) * fw.speed;
        const vy = Math.sin(fw.angle) * fw.speed;
        fw.distanceTraveled = Math.hypot(vx, vy);

        fw.x += vx;
        fw.y += vy;

        if (fw.distanceTraveled >= fw.distanceToTarget) {
          createParticles(fw.targetX, fw.targetY);
          fireworks.splice(i, 1);
          continue;
        }

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(fw.coordinates[fw.coordinates.length - 1][0], fw.coordinates[fw.coordinates.length - 1][1]);
        ctx.lineTo(fw.x, fw.y);
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, ${fw.brightness}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.coordinates.pop();
        p.coordinates.unshift([p.x, p.y]);

        p.speed *= p.friction;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed + p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(p.coordinates[p.coordinates.length - 1][0], p.coordinates[p.coordinates.length - 1][1]);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Random auto-fireworks
      if (Math.random() < 0.04) {
        triggerAutoFirework(canvas);
      }

      loopRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (loopRef.current) {
        cancelAnimationFrame(loopRef.current);
      }
    };
  }, []);

  // Handle send wish trigger
  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !textInput.trim()) return;

    triggerSparkleSound();
    setIsLaunching(true);

    const canvas = canvasRef.current;
    if (canvas) {
      // Shoot rocket from bottom middle to upper middle
      const startX = canvas.width / 2;
      const startY = canvas.height;
      const targetX = canvas.width / 2 + (Math.random() * 100 - 50);
      const targetY = canvas.height * 0.3 + (Math.random() * 60 - 30);

      fireworksRef.current.push(createFirework(startX, startY, targetX, targetY));
    }

    setTimeout(() => {
      const avatarColors = [
        "bg-pink-500", "bg-rose-500", "bg-purple-500", "bg-indigo-500", "bg-amber-500", "bg-cyan-500"
      ];
      const newWish: UserWish = {
        id: Date.now().toString(),
        name: nameInput,
        text: textInput,
        timestamp: "Just Now",
        avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)]
      };

      const updated = [newWish, ...wishes];
      setWishes(updated);
      localStorage.setItem("sweta_birthday_wishes", JSON.stringify(updated));

      // Reset
      setTextInput("");
      setNameInput("");
      setIsLaunching(false);
      triggerSparkleSound();
    }, 1500); // Wait for firework detonation
  };

  const handleClearWishes = () => {
    triggerSparkleSound();
    setWishes(INITIAL_WISHES);
    localStorage.removeItem("sweta_birthday_wishes");
  };

  return (
    <section
      id="finale"
      className="relative w-full py-28 bg-gradient-to-b from-[#fff5f8] via-[#2d1b22] to-pink-950 text-white overflow-hidden"
    >
      {/* 1. Full-Screen Canvas Firework Player */}
      <div className="absolute inset-0 z-0 h-[450px] bg-black/40">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1 bg-pink-500/20 border border-pink-400/30 text-pink-300 rounded-full text-xs uppercase font-bold tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Interactive Finale</span>
          </motion.div>
          <h3 className="font-serif luxury-text text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FFD700] mb-4 drop-shadow-[0_2px_15px_rgba(255,77,141,0.4)]">
            Firework Spark Celebration
          </h3>
          <p className="font-sans text-sm sm:text-base text-pink-100/80 max-w-lg mx-auto">
            Type out your gorgeous birthday wishes for Sweta, launch them into the sky, and see them burst into a galaxy of sparkling stars!
          </p>
        </div>

        {/* WISHLIST RELEASE FORM */}
        <div className="glass-panel-dark max-w-md mx-auto p-6 md:p-8 rounded-3xl border border-pink-500/30 shadow-2xl relative mb-20">
          <form onSubmit={handleSendWish} className="flex flex-col gap-4 relative z-10">
            <div>
              <label className="block text-xs uppercase font-bold text-pink-300 tracking-wider mb-2">
                Your Beautiful Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Priyanshu"
                disabled={isLaunching}
                className="w-full bg-[#1c0f14]/60 border border-pink-500/30 rounded-xl px-4 py-3 text-pink-100 placeholder-pink-500/50 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-sans text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-pink-300 tracking-wider mb-2">
                Birthday Wish / Compliment
              </label>
              <textarea
                required
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Write your magical heart-warming wish for Sweta here..."
                disabled={isLaunching}
                rows={3}
                className="w-full bg-[#1c0f14]/60 border border-pink-500/30 rounded-xl px-4 py-3 text-pink-100 placeholder-pink-500/50 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-sans text-sm transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLaunching || !nameInput.trim() || !textInput.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg border ${
                isLaunching
                  ? "bg-pink-600/50 border-pink-500/20 text-pink-300 animate-pulse cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white border-pink-400 hover:shadow-[0_0_20px_rgba(255,77,141,0.5)] active:scale-98"
              }`}
            >
              {isLaunching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Launching Wish Rocket...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Launch Wish Rocket 🚀
                </>
              )}
            </button>
          </form>
        </div>

        {/* THE WISHES WALL LIST */}
        <div className="mt-16 border-t border-pink-500/20 pt-16">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-400 animate-pulse" />
              <h4 className="font-serif luxury-text text-2xl text-pink-200">
                Sweta's Wishes Wall
              </h4>
            </div>
            
            {/* Reset wishes button */}
            <button
              onClick={handleClearWishes}
              className="px-3 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 transition-all font-sans text-[10px] uppercase font-bold tracking-widest cursor-pointer"
            >
              Reset Wall
            </button>
          </div>

          {/* Wishes List Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence initial={false}>
              {wishes.map((wish) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                  className="bg-[#2d1b22]/70 border border-pink-500/20 rounded-2xl p-5 flex gap-4 backdrop-blur-md relative overflow-hidden group hover:border-pink-500/50 hover:shadow-lg transition-all"
                >
                  {/* Miniature corner sticker decoration */}
                  <div className="absolute top-2 right-2 text-pink-500/20 group-hover:text-pink-500/50 transition-colors pointer-events-none">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>

                  {/* Custom Initial Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white uppercase text-sm ${wish.avatarColor} shadow-inner`}>
                    {wish.name.charAt(0)}
                  </div>

                  {/* Comment Bubble text */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-pink-100">{wish.name}</span>
                      <span className="text-[10px] font-semibold text-pink-400/80 uppercase font-mono">{wish.timestamp}</span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-pink-200/90 leading-relaxed font-medium">
                      {wish.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};
