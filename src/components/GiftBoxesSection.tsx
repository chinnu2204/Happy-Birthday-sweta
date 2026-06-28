import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, CheckCircle, Sparkles, Heart } from "lucide-react";
import { GIFT_BOXES } from "../data";
import { triggerSparkleSound } from "./AudioPlayer";

export const GiftBoxesSection: React.FC = () => {
  const [openedBoxIds, setOpenedBoxIds] = useState<number[]>([]);
  const [activeGift, setActiveGift] = useState<typeof GIFT_BOXES[0] | null>(null);

  const handleOpenBox = (box: typeof GIFT_BOXES[0]) => {
    if (openedBoxIds.includes(box.id)) {
      // Box already opened, just show the wish again!
      triggerSparkleSound();
      setActiveGift(box);
      return;
    }

    // Open box sequence
    triggerSparkleSound();
    setOpenedBoxIds((prev) => [...prev, box.id]);
    setActiveGift(box);
  };

  return (
    <section
      id="gifts"
      className="relative w-full py-26 px-6 md:px-12 bg-[#fff5f8] overflow-hidden"
    >
      {/* Background floral decoration */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-rose-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 h-72 bg-amber-100 rounded-full blur-[90px] opacity-60 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1 bg-pink-100 border border-pink-200 text-pink-600 rounded-full text-xs uppercase font-bold tracking-widest mb-4"
          >
            <Gift className="w-3.5 h-3.5 text-pink-500" />
            <span>Surprise Packages</span>
          </motion.div>
          <h3 className="font-serif luxury-text text-4xl sm:text-6xl text-[#FF4D8D] mb-4">
            Unwrap Your Surprises!
          </h3>
          <p className="font-sans text-sm sm:text-base text-pink-700/80 max-w-lg mx-auto">
            Click on each of the wiggling gift boxes to unwrap a special birthday compliment, emoji, and personalized wish! Can you open them all?
          </p>
        </div>

        {/* GIFT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {GIFT_BOXES.map((box, index) => {
            const isOpened = openedBoxIds.includes(box.id);
            return (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                {/* GIFT BOX WRAPPER */}
                <div
                  onClick={() => handleOpenBox(box)}
                  className="relative cursor-pointer group flex flex-col items-center justify-center w-36 h-48 select-none"
                >
                  
                  {/* LID (Moves Up On Click or Hover) */}
                  <motion.div
                    animate={
                      isOpened
                        ? { y: -25, rotate: -15, opacity: 0.85 }
                        : {
                            rotate: [0, -4, 4, -4, 4, 0],
                            y: [0, -3, 0],
                          }
                    }
                    transition={
                      isOpened
                        ? { type: "spring", stiffness: 100, damping: 12 }
                        : {
                            rotate: {
                              repeat: Infinity,
                              duration: 2.2,
                              delay: index * 0.45,
                              ease: "easeInOut",
                            },
                            y: {
                              repeat: Infinity,
                              duration: 1.5,
                              delay: index * 0.3,
                              ease: "easeInOut",
                            },
                          }
                    }
                    className="z-20 relative w-24"
                  >
                    {/* Gift Lid Graphics */}
                    <div className={`h-6 w-24 bg-gradient-to-r ${box.color} rounded-md shadow-md border-b-2 border-black/10 relative`}>
                      {/* Ribbon bow on top */}
                      <div className={`absolute top-[-10px] left-1/2 -translate-x-1/2 w-8 h-4 ${box.ribbonColor} rounded-full opacity-90`} />
                      <div className={`absolute top-[-6px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white/20 rounded-full`} />
                      {/* Ribbon stripe */}
                      <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 ${box.ribbonColor}`} />
                    </div>
                  </motion.div>

                  {/* BODY */}
                  <div className="z-10 relative mt-[-2px]">
                    <div className={`h-20 w-22 bg-gradient-to-r ${box.color} rounded-b-md shadow-lg relative flex items-center justify-center border border-white/10 group-hover:brightness-105 transition-all`}>
                      
                      {/* Ribbon Stripe Horizontal & Vertical */}
                      <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 ${box.ribbonColor}`} />
                      <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 ${box.ribbonColor}`} />
                      
                      {/* Inner gold glow if unopened, or Checkmark if opened */}
                      {isOpened ? (
                        <CheckCircle className="absolute w-7 h-7 text-yellow-300 drop-shadow-md z-10" />
                      ) : (
                        <Sparkles className="absolute w-5 h-5 text-white/60 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* SHADOW */}
                  <div className="w-18 h-2 bg-black/10 rounded-full blur-[3px] mt-2 transition-transform group-hover:scale-110" />

                  {/* Indicator Box Label */}
                  <span className="font-sans text-[11px] font-bold text-pink-600/70 uppercase tracking-widest mt-2">
                    Gift #{box.id}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* POPUP REVEAL WIDGET */}
        <div className="mt-14 max-w-md mx-auto h-[220px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeGift ? (
              <motion.div
                key={activeGift.id}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="w-full glass-card p-6 shadow-xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[190px]"
              >
                {/* Floating sparkles */}
                <div className="absolute top-3 left-4 text-amber-400 animate-spin" style={{ animationDuration: "5s" }}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="absolute bottom-3 right-4 text-pink-500 animate-bounce">
                  <Heart className="w-5 h-5 fill-current" />
                </div>

                {/* Opened Emoji */}
                <span className="text-4xl mb-3 animate-bounce">{activeGift.emoji}</span>

                {/* Compliment */}
                <h4 className="font-serif luxury-text text-xl text-[#E63950] mb-2">
                  "{activeGift.compliment}"
                </h4>

                {/* Heartfelt Wish */}
                <p className="font-sans text-sm text-pink-900 leading-relaxed max-w-sm">
                  {activeGift.wish}
                </p>

                {/* Ribbon check indicator */}
                <div className="mt-4 text-[9px] uppercase tracking-widest font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 fill-current" />
                  Box Opened Successfully
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-pink-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-pink-400 font-medium text-sm w-full min-h-[180px]"
              >
                <Gift className="w-10 h-10 mb-2 text-pink-300 animate-bounce" />
                <span>Open a gift box to read your birthday wishes!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
