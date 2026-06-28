import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Heart, Award, ArrowRight, Sparkles } from "lucide-react";
import { MEMORY_ITEMS } from "../data";
import { triggerSparkleSound } from "./AudioPlayer";

export const TimelineSection: React.FC = () => {
  const [loveValue, setLoveValue] = useState(50);
  const [loveMeterLabel, setLoveMeterLabel] = useState("Pretty Sweet 🥰");
  const [isInfinite, setIsInfinite] = useState(false);

  const handleLoveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setLoveValue(val);

    if (val < 20) {
      setLoveMeterLabel("Very sweet! 😊");
      setIsInfinite(false);
    } else if (val < 50) {
      setLoveMeterLabel("Adoration overloaded! 😍");
      setIsInfinite(false);
    } else if (val < 85) {
      setLoveMeterLabel("To the moon and back! 🚀💖");
      setIsInfinite(false);
    } else {
      // Force infinite and play sparkles
      setLoveMeterLabel("Infinite ❤️");
      setIsInfinite(true);
    }
  };

  const handleLoveRelease = () => {
    // Automatically force slide to maximum ("Infinite") on mouse/touch release
    triggerSparkleSound();
    setLoveValue(100);
    setLoveMeterLabel("ERROR: Love for Sweta exceeded computer limits! Infinite ❤️");
    setIsInfinite(true);
  };

  return (
    <section
      id="timeline"
      className="relative w-full py-28 px-6 md:px-12 bg-gradient-to-b from-[#fff5f8] via-[#ffdbe7] to-[#fff5f8] overflow-hidden"
    >
      {/* Abstract blurred glows */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-rose-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-200/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1 bg-pink-100 border border-pink-200 text-pink-600 rounded-full text-xs uppercase font-bold tracking-widest mb-4"
          >
            <Calendar className="w-3.5 h-3.5 text-pink-500" />
            <span>Memory Road</span>
          </motion.div>
          <h3 className="font-serif luxury-text text-4xl sm:text-6xl text-[#FF4D8D] mb-4">
            Our Journey Together
          </h3>
          <p className="font-sans text-sm sm:text-base text-pink-700/80 max-w-lg mx-auto">
            Swipe horizontally to scroll through a few beautiful moments along our timeline, connected by a glowing thread of love.
          </p>
        </div>

        {/* HORIZONTAL TIMELINE ROW */}
        <div className="relative w-full mb-24">
          
          {/* Glowing dashed connector line running behind */}
          <div className="absolute top-1/2 left-0 right-0 h-1 border-t-2 border-dashed border-pink-400/50 -translate-y-1/2 -z-10 pointer-events-none" />

          {/* Swipe indicator for mobile */}
          <div className="flex md:hidden items-center justify-end gap-1.5 text-xs text-pink-500 font-bold uppercase tracking-wider mb-3">
            <span>Swipe for more</span>
            <ArrowRight className="w-3 h-3 animate-pulse" />
          </div>

          {/* Timeline Cards Container */}
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-thin snap-x snap-mandatory">
            {MEMORY_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="min-w-[290px] sm:min-w-[340px] max-w-[340px] flex-shrink-0 snap-center"
              >
                {/* POLAROID-STYLE TIMELINE CARD */}
                <div className="glass-card p-4 pb-6 shadow-[0_10px_35px_rgba(255,77,141,0.1)] relative group flex flex-col items-center">
                  
                  {/* Decorative glowing date marker */}
                  <div className="absolute -top-4 bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider shadow-md border border-pink-400 z-10">
                    {item.date}
                  </div>

                  {/* Image container */}
                  <div className="overflow-hidden aspect-video w-full rounded-xl bg-pink-50 relative mt-3">
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content details */}
                  <div className="mt-4 text-center">
                    <h4 className="font-serif luxury-text text-xl text-[#E63950] mb-2 group-hover:text-pink-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="font-sans text-xs sm:text-sm text-pink-800 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* LOVE-O-METER SUBSECTION */}
        <div className="max-w-xl mx-auto glass-card p-8 shadow-[0_15px_45px_rgba(255,77,141,0.1)] text-center relative overflow-hidden">
          
          <div className="absolute top-2 left-2 text-pink-300">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-600 rounded-full text-[10px] uppercase font-bold tracking-widest mb-4"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Interactive Chemistry Test</span>
          </motion.div>

          <h4 className="font-serif luxury-text text-2xl text-[#FF4D8D] mb-2">
            The Sweta Love-O-Meter
          </h4>
          <p className="font-sans text-xs text-pink-600/80 mb-8 max-w-sm mx-auto">
            Drag the magical heart slider to calculate the absolute volume of love and adoration for Sweta!
          </p>

          {/* CUSTOM RANGE SLIDER DISPLAY */}
          <div className="relative flex flex-col items-center mb-6">
            
            {/* Value Bubble */}
            <div className={`mb-4 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest text-white shadow-md transition-all duration-300 ${
              isInfinite ? "bg-gradient-to-r from-pink-500 to-amber-500 animate-bounce scale-110" : "bg-pink-500"
            }`}>
              {isInfinite ? "Infinite ❤️" : `${loveValue}% Adoration`}
            </div>

            {/* Slider track wrapper */}
            <div className="w-full relative px-4 flex items-center h-10">
              <input
                type="range"
                min="0"
                max="100"
                value={loveValue}
                onChange={handleLoveChange}
                onMouseUp={handleLoveRelease}
                onTouchEnd={handleLoveRelease}
                className="w-full accent-pink-500 cursor-pointer h-2 bg-pink-100 rounded-full appearance-none outline-none hover:bg-pink-200 transition-colors"
                style={{
                  background: `linear-gradient(to right, #ff4d8d 0%, #ff4d8d ${loveValue}%, #ffe4ec ${loveValue}%, #ffe4ec 100%)`,
                }}
              />
            </div>
          </div>

          {/* LOVE METER DYNAMIC LABEL */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loveMeterLabel}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              className={`font-sans text-sm font-bold tracking-wide rounded-2xl py-3 px-4 ${
                isInfinite
                  ? "bg-amber-50 text-amber-700 border border-amber-200 animate-shake shadow-lg"
                  : "bg-pink-50 text-pink-700 border border-pink-100"
              }`}
            >
              {loveMeterLabel}
              {isInfinite && (
                <div className="text-[10px] uppercase font-mono tracking-wider text-amber-500/80 mt-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Calculations broken!
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
};
