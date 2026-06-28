/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import { CursorTrail } from "./components/CursorTrail";
import { AudioPlayer } from "./components/AudioPlayer";
import { HeroSection } from "./components/HeroSection";
import { GallerySection } from "./components/GallerySection";
import { MessageSection } from "./components/MessageSection";
import { CakeSection } from "./components/CakeSection";
import { GiftBoxesSection } from "./components/GiftBoxesSection";
import { TimelineSection } from "./components/TimelineSection";
import { LoveHubSection } from "./components/LoveHubSection";
import { FireworkFinale } from "./components/FireworkFinale";
import { Footer } from "./components/Footer";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden select-none bg-[#fff5f8]">
      {/* 1. Loading Preloader Sequencer */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full relative"
          >
            {/* 2. Interactive Cursor Trails & Sparkles */}
            <CursorTrail />

            {/* 3. Magical Web Audio API Chime Synthesizer Toggle */}
            <AudioPlayer />

            {/* 4. Scrollable Sections (Chronological Order) */}
            <main className="w-full relative z-10">
              
              {/* Section 1: Hero Scene */}
              <HeroSection />

              {/* Section 2: Polaroid Scrapbook */}
              <GallerySection />

              {/* Section 3: Frosted Letter note */}
              <MessageSection />

              {/* Section 4: Candle Blow Cake */}
              <CakeSection />

              {/* Section 5: Surprise Gifts Grid */}
              <GiftBoxesSection />

              {/* Section 6: Love timeline & Meter */}
              <TimelineSection />

              {/* Section 6.5: Love Hub Interactive Playground */}
              <LoveHubSection />

              {/* Section 7: Fireworks finale wishes board */}
              <FireworkFinale />

            </main>

            {/* 5. Footer and Back-To-Top fly Ballon */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

