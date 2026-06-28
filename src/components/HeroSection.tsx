import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Heart, ChevronDown, Sparkles } from "lucide-react";
import { ConfettiCanvas } from "./ConfettiCanvas";
import { triggerSparkleSound } from "./AudioPlayer";

export const HeroSection: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Parallax tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      // Normalize values between -1 and 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && heroRef.current) {
        const touch = e.touches[0];
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePos({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Continuous floating balloons
  const [balloons, setBalloons] = useState<{ id: number; left: number; delay: number; scale: number; color: string }[]>([]);
  useEffect(() => {
    const colors = [
      "from-pink-400 to-pink-600 shadow-pink-500/30",
      "from-rose-500 to-red-600 shadow-rose-500/30",
      "from-amber-400 to-yellow-500 border-amber-300 shadow-yellow-500/30",
      "from-fuchsia-400 to-purple-600 shadow-purple-500/30"
    ];

    const generatedBalloons = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5, // Percent from left
      delay: Math.random() * 8, // Staggered delay
      scale: Math.random() * 0.4 + 0.8, // Size multiplier
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setBalloons(generatedBalloons);
  }, []);

  // Title Letter Array for staggered animation
  const titleLetters = "Happy Birthday".split("");

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2d1b22] via-[#4d162c] to-pink-950 text-white"
    >
      {/* 1. Confetti Background Layer */}
      <ConfettiCanvas />

      {/* 2. Parallax Drifting Sparkles & Ambient Glows */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out z-0 opacity-40"
        style={{
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-amber-400/15 rounded-full blur-[120px]" />
      </div>

      {/* 3. Floating Balloons (Rising up) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {balloons.map((balloon) => (
          <motion.div
            key={balloon.id}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{
              y: "-20vh",
              opacity: [0, 1, 1, 0],
              x: ["0px", `${Math.sin(balloon.id) * 40}px`, `${Math.cos(balloon.id) * 30}px`, "0px"]
            }}
            transition={{
              duration: 10 + balloon.id * 0.8,
              repeat: Infinity,
              delay: balloon.delay,
              ease: "linear",
            }}
            style={{
              left: `${balloon.left}%`,
              scale: balloon.scale,
            }}
            className="absolute flex flex-col items-center"
          >
            {/* Balloon Body */}
            <div className={`w-14 h-18 rounded-full bg-gradient-to-b ${balloon.color} shadow-lg relative border border-white/20`}>
              {/* Highlight shine */}
              <div className="absolute top-2 left-3 w-3 h-5 bg-white/40 rounded-full" />
            </div>
            {/* Balloon Knot */}
            <div className="w-2 h-1.5 bg-pink-400/60 rounded-sm -mt-0.5" />
            {/* Balloon String */}
            <div className="w-[1.5px] h-20 bg-white/20 border-dashed" />
          </motion.div>
        ))}
      </div>

      {/* 4. Main Hero Card (Parallax shifting slightly with cursor) */}
      <div
        className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl select-none"
        style={{
          transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Floating Crown / Heart Accent */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }}
          className="mb-4 bg-gradient-to-r from-amber-300 to-yellow-500 p-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] border border-yellow-200"
        >
          <Sparkles className="w-8 h-8 text-pink-950 animate-pulse" />
        </motion.div>

        {/* Staggered Bounce Letter Title */}
        <h1 className="font-sans font-bold text-4xl sm:text-6xl md:text-8xl tracking-tight uppercase flex flex-wrap justify-center gap-x-4 mb-2">
          {titleLetters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: 50, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 8,
                delay: index * 0.05,
              }}
              whileHover={{ 
                scale: 1.25, 
                color: "#FFD700",
                transition: { duration: 0.2 } 
              }}
              onHoverStart={triggerSparkleSound}
              className="inline-block cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-pink-200"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        {/* Sweta's Name with pulsating glow and infinite color shifting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1, type: "spring" }}
          className="relative px-6 py-2"
        >
          {/* Glowing back aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-amber-400 blur-2xl opacity-60 animate-pulse rounded-full" />
          
          <h2 className="relative font-serif luxury-text text-8xl sm:text-9xl md:text-[10rem] leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FFD700] drop-shadow-[0_4px_15px_rgba(255,77,141,0.5)] animate-text-shimmer">
            Sweta
          </h2>
        </motion.div>

        {/* Short sweet caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-6 text-sm sm:text-lg text-pink-200/90 tracking-wide font-medium max-w-md uppercase"
        >
          Welcome to your magical wonderland of joy, smiles, and sweet surprises! ✨
        </motion.p>

        {/* Dynamic button with sparkle sound */}
        <motion.button
          onClick={() => {
            triggerSparkleSound();
            document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white rounded-full font-bold text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(255,77,141,0.4)] border border-pink-400 hover:border-yellow-200 hover:shadow-[0_4px_30px_rgba(255,215,0,0.5)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Heart className="w-4 h-4 fill-current animate-pulse text-white" />
          Enter Wonderland
        </motion.button>
      </div>

      {/* 5. Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-pink-300/60 mb-2">Scroll to explore</span>
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-md backdrop-blur-sm cursor-pointer"
          onClick={() => {
            document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <ChevronDown className="w-5 h-5 text-pink-400" />
        </motion.div>
      </div>
    </section>
  );
};
