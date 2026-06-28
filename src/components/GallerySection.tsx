import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Play, Pause, Heart, Sparkles } from "lucide-react";
import { GALLERY_ITEMS } from "../data";
import { triggerSparkleSound } from "./AudioPlayer";

// Simple custom component to handle 3D tilt on individual polaroids
interface PolaroidCardProps {
  item: typeof GALLERY_ITEMS[0];
  index: number;
  onSelect: () => void;
}

const PolaroidCard: React.FC<PolaroidCardProps> = ({ item, index, onSelect }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 12; // Max 12 deg
    const rotateY = ((x - centerX) / centerX) * 12; // Max 12 deg

    setTilt({ rotateX, rotateY });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Staggered floating speed offsets
  const floatingDuration = 4 + (index % 3) * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
      animate={{
        y: [0, index % 2 === 0 ? -10 : -6, 0],
      }}
      style={{
        zIndex: 10 + index,
      }}
      // Float animation details
      className="p-1"
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => {
          triggerSparkleSound();
          onSelect();
        }}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformPerspective: 800,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="bg-white p-4 pb-6 rounded-sm shadow-[0_10px_30px_rgba(230,57,80,0.12)] border border-pink-100 relative group cursor-pointer hover:shadow-[0_20px_40px_rgba(255,77,141,0.25)] select-none"
      >
        {/* Heart Sticker on corner */}
        <div className="absolute -top-3 -right-2 z-10 drop-shadow-md transform group-hover:scale-125 transition-transform duration-300">
          <Heart className="w-8 h-8 text-rose-500 fill-current rotate-12" />
        </div>

        {/* Polaroid Image Container */}
        <div className="overflow-hidden bg-[#2d1b22] aspect-[4/5] relative rounded-xs">
          <img
            src={item.url}
            alt={item.caption}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale-15 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
          />
          {/* Sparkly zoom overlay */}
          <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          {/* Caption tag */}
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-pink-600/90 text-white text-[10px] uppercase font-bold tracking-widest rounded-full shadow-md">
            {item.category}
          </div>
        </div>

        {/* Polaroid Handwriting Description */}
        <div className="mt-4 text-center px-1">
          <p className="font-display text-lg sm:text-xl text-[#4d162c] tracking-wide leading-relaxed">
            {item.caption}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const GallerySection: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto slideshow handler
  useEffect(() => {
    if (isSlideshowActive && selectedIdx !== null) {
      slideshowIntervalRef.current = setInterval(() => {
        setSelectedIdx((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % GALLERY_ITEMS.length;
        });
      }, 3500); // Crossfade every 3.5 seconds
    } else {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    }

    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, [isSlideshowActive, selectedIdx]);

  const handlePrev = () => {
    triggerSparkleSound();
    setSelectedIdx((prev) => {
      if (prev === null) return GALLERY_ITEMS.length - 1;
      return prev === 0 ? GALLERY_ITEMS.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    triggerSparkleSound();
    setSelectedIdx((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % GALLERY_ITEMS.length;
    });
  };

  const toggleSlideshow = () => {
    triggerSparkleSound();
    setIsSlideshowActive(!isSlideshowActive);
  };

  return (
    <section
      id="gallery"
      className="relative w-full py-24 px-6 md:px-12 bg-[#fff5f8] overflow-hidden"
    >
      {/* Decorative floral/sparkly backgrounds */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-100 border border-pink-200 text-pink-600 rounded-full text-xs uppercase font-bold tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Memories Captured</span>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif luxury-text text-4xl sm:text-6xl text-[#FF4D8D] drop-shadow-sm mb-4"
          >
            Sweta's Visual Scrapbook
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sans text-sm sm:text-base text-pink-700/80 max-w-xl mx-auto"
          >
            A collection of warm, silly, gorgeous, and absolutely beautiful snaps. Hover to tilt them, click to open full-screen!
          </motion.p>
        </div>

        {/* Polaroid Collage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {GALLERY_ITEMS.map((item, index) => (
            <PolaroidCard
              key={item.id}
              item={item}
              index={index}
              onSelect={() => setSelectedIdx(index)}
            />
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL WITH ZOOM & SLIDESHOW */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none"
          >
            {/* Background close click */}
            <div className="absolute inset-0" onClick={() => setSelectedIdx(null)} />

            {/* Main Lightbox Content wrapper */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative max-w-3xl w-full flex flex-col items-center bg-transparent z-10"
            >
              {/* Image box */}
              <div className="relative bg-white p-4 pb-8 rounded-xs shadow-2xl max-h-[80vh] w-full flex flex-col items-center">
                
                {/* Heart decorative corner pin */}
                <div className="absolute -top-4 -right-3 z-10">
                  <Heart className="w-10 h-10 text-rose-500 fill-current rotate-12 drop-shadow-lg" />
                </div>

                <div className="overflow-hidden bg-pink-50 w-full relative aspect-[4/5] max-h-[55vh] flex justify-center items-center rounded-xs">
                  <motion.img
                    key={selectedIdx}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={GALLERY_ITEMS[selectedIdx].url}
                    alt={GALLERY_ITEMS[selectedIdx].caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Slideshow Progress Bar */}
                {isSlideshowActive && (
                  <motion.div
                    key={`bar-${selectedIdx}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.5, ease: "linear" }}
                    className="absolute top-4 left-4 h-1 bg-pink-500 z-10"
                  />
                )}

                {/* Caption text */}
                <div className="mt-4 text-center max-w-md">
                  <span className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-[10px] uppercase font-bold tracking-widest mb-1.5">
                    {GALLERY_ITEMS[selectedIdx].category}
                  </span>
                  <p className="font-serif luxury-text text-2xl text-[#E63950] tracking-wide">
                    {GALLERY_ITEMS[selectedIdx].caption}
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
                {/* Slideshow play/pause */}
                <button
                  onClick={toggleSlideshow}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border text-white backdrop-blur-md transition-all ${
                    isSlideshowActive
                      ? "bg-pink-600 border-pink-500 hover:bg-pink-700"
                      : "bg-white/10 border-white/20 hover:bg-white/25"
                  }`}
                  title={isSlideshowActive ? "Pause Slideshow" : "Start Auto Slideshow"}
                >
                  {isSlideshowActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedIdx(null)}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/25 hover:rotate-90 transition-all duration-300"
                  title="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-[-20px] md:left-[-70px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/25 hover:scale-115 transition-all z-20"
                title="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-[-20px] md:right-[-70px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/25 hover:scale-115 transition-all z-20"
                title="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Counter Indicator */}
              <div className="mt-4 px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold font-mono">
                {selectedIdx + 1} / {GALLERY_ITEMS.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
