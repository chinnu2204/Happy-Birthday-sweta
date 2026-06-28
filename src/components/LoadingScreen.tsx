import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Elegant incremental loading simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
          }, 400); // Wait for progress bar to finish before fading out
          return 100;
        }
        // Speed up slightly as it goes
        const increment = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleAnimationComplete = () => {
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          id="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-pink-900 via-[#2d1b22] to-pink-950 text-white"
        >
          {/* Animated Stars & Sparkles Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,77,141,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="relative flex flex-col items-center max-w-md w-full px-6 text-center z-10">
            {/* Spinning glowing heart container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: 1,
                rotate: [0, 15, -15, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="relative w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-300 shadow-[0_0_40px_rgba(255,77,141,0.5)] border border-pink-400 mb-8"
            >
              <Heart className="w-14 h-14 text-white fill-current drop-shadow-md" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-6px] border-2 border-dashed border-amber-300/60 rounded-full"
              />
              <Sparkles className="absolute top-2 right-2 w-5 h-5 text-yellow-300 animate-pulse" />
            </motion.div>

            {/* Glowing Text */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-2xl md:text-3xl text-pink-200 drop-shadow-[0_2px_10px_rgba(255,77,141,0.3)] mb-2"
            >
              Sweta's Birthday Surprise
            </motion.h2>
            
            <p className="font-sans text-xs md:text-sm text-pink-300/80 tracking-wider uppercase font-medium mb-8">
              Preparing your magical gift...
            </p>

            {/* Progress Container */}
            <div className="w-full bg-pink-950/60 border border-pink-500/20 rounded-full p-1 h-6 relative backdrop-blur-sm overflow-hidden mb-3">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              />
            </div>
            
            {/* Percentage Display */}
            <div className="font-mono text-sm font-bold text-amber-300 flex items-center gap-1">
              <span className="text-xl animate-pulse">{progress}</span>%
            </div>
          </div>
          
          {/* Decorative ambient background particles */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 text-[10px] uppercase font-bold tracking-widest text-pink-500/60">
            <span>Love</span>
            <span>•</span>
            <span>Joy</span>
            <span>•</span>
            <span>Magic</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
