import React from "react";
import { motion } from "motion/react";
import { Heart, ArrowUp, Sparkles } from "lucide-react";
import { triggerSparkleSound } from "./AudioPlayer";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    triggerSparkleSound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full py-16 px-6 bg-gradient-to-b from-pink-950 to-[#170a0f] text-white overflow-hidden text-center select-none border-t border-pink-950">
      
      {/* Background ambient particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,77,141,0.08),transparent_60%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
        
        {/* Floating Heart & Sparkle */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-rose-500"
          >
            <Heart className="w-8 h-8 fill-current drop-shadow-[0_0_8px_rgba(230,57,80,0.6)]" />
          </motion.div>
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        </div>

        {/* Closing Headline */}
        <h4 className="font-serif luxury-text text-3xl text-pink-200 tracking-wide">
          Happy Birthday Sweta!
        </h4>

        {/* Credits */}
        <p className="font-sans text-xs tracking-widest text-pink-400/80 uppercase font-bold flex items-center gap-1.5">
          Made with
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-rose-500 fill-current"
          >
            ❤️
          </motion.span>
          for Sweta • June 2026
        </p>

        {/* Short poetic signoff */}
        <p className="font-sans text-xs text-pink-300/50 max-w-sm leading-relaxed italic">
          "May your days be painted with beautiful colors, your dreams be guided by the brightest stars, and your heart be filled with infinite joy."
        </p>

        {/* Back to Top Ballon Widget */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={scrollToTop}
          className="mt-8 flex flex-col items-center cursor-pointer group"
          title="Float back to the top!"
        >
          {/* Balloon shape */}
          <div className="w-10 h-12 rounded-full bg-gradient-to-b from-pink-500 to-rose-500 border border-pink-400 shadow-[0_4px_15px_rgba(255,77,141,0.3)] flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform duration-300">
            <ArrowUp className="w-5 h-5 text-white" />
          </div>
          {/* Balloon knot */}
          <div className="w-1.5 h-1 bg-pink-400" />
          {/* Balloon string */}
          <div className="w-[1px] h-8 bg-dashed bg-pink-300/40" />
          
          <span className="text-[9px] uppercase tracking-widest text-pink-400/60 font-bold mt-1 group-hover:text-pink-300 transition-colors">
            Fly to Top
          </span>
        </motion.div>

      </div>
    </footer>
  );
};
