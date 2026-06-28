import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, Heart } from "lucide-react";
import { triggerSparkleSound } from "./AudioPlayer";

export const MessageSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const [typedText, setTypedText] = useState("");
  const fullMessage = "Happy Birthday Sweta! Wishing you a day filled with love, laughter, and all your favorite things. May this year bring you endless happiness, gorgeous dreams, and beautiful memories. You are a absolute star! ✨";

  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullMessage.charAt(index));
      index++;
      if (index >= fullMessage.length) {
        clearInterval(interval);
      }
    }, 45); // Warm typed text speed

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section
      ref={containerRef}
      id="message"
      className="relative w-full py-28 px-6 md:px-12 bg-gradient-to-b from-[#fff5f8] via-[#ffe3ec] to-[#fff5f8] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-300/25 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Background Floating Tiny Hearts */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "-10%", opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear",
            }}
            style={{
              left: `${i * 15}%`,
              scale: 0.6 + (i % 3) * 0.2,
            }}
            className="absolute text-pink-400"
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl w-full relative z-10 flex flex-col items-center">
        
        {/* Glowing orbiting container */}
        <div className="relative w-full p-1 rounded-3xl">
          
          {/* ORBITING SPARKLE 1 */}
          <motion.div
            animate={{
              x: [0, 320, 320, 0, 0],
              y: [0, 0, 240, 240, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-3 -left-3 z-20 pointer-events-none"
          >
            <Sparkles className="w-7 h-7 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-spin" style={{ animationDuration: "3s" }} />
          </motion.div>

          {/* ORBITING SPARKLE 2 (Starting at opposite end) */}
          <motion.div
            animate={{
              x: [320, 0, 0, 320, 320],
              y: [240, 240, 0, 0, 240],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-3 -left-3 z-20 pointer-events-none"
          >
            <Heart className="w-6 h-6 text-pink-500 fill-current filter drop-shadow-[0_0_8px_rgba(255,77,141,0.8)] animate-pulse" />
          </motion.div>

          {/* GLASSMORPHISM CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            whileHover={{ scale: 1.01 }}
            className="glass-card relative p-8 md:p-12 shadow-[0_12px_40px_rgba(255,77,141,0.15)] flex flex-col items-center text-center overflow-hidden"
          >
            {/* Shimmer beam passing through */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            {/* Glowing Envelope/Letter Header */}
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 mb-6 relative shadow-inner">
              <Heart className="w-8 h-8 text-pink-500 fill-current animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-pink-950 shadow-md">
                1
              </div>
            </div>

            {/* Title */}
            <h3 className="font-serif luxury-text text-3xl sm:text-4xl text-[#FF4D8D] mb-6">
              A Little Note For You...
            </h3>

            {/* Message Area with Typed Text & Caret */}
            <div className="min-h-[140px] md:min-h-[120px] flex items-center justify-center">
              <p className="font-sans text-base sm:text-xl text-pink-900 leading-relaxed font-medium tracking-wide">
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[3px] h-5 bg-pink-500 ml-1 translate-y-0.5"
                />
              </p>
            </div>

            {/* Glowing signature sticker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5, type: "spring" }}
              className="mt-8 pt-6 border-t border-pink-200/50 w-full flex flex-col items-center"
            >
              <div className="flex items-center gap-1.5 text-pink-500 font-display text-2xl">
                <span>With Love,</span>
                <span className="text-rose-600 fill-current animate-bounce">❤️</span>
              </div>
              <p className="font-sans text-[11px] uppercase tracking-widest text-pink-600/70 font-bold mt-1">
                Your Biggest Fan
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
