import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles, Gift, HelpCircle, Send, Award, Check, RefreshCw, Smartphone, MapPin } from "lucide-react";
import { triggerSparkleSound } from "./AudioPlayer";

interface Coupon {
  id: number;
  title: string;
  description: string;
  code: string;
  emoji: string;
  color: string;
}

const COUPONS: Coupon[] = [
  {
    id: 1,
    title: "Endless Voice Notes Pass",
    description: "Redeemable for a whole day where I reply to every single text with a sweet voice note just for you.",
    code: "VOICE-SWETA-SWEET",
    emoji: "🎵",
    color: "from-pink-400 to-rose-500"
  },
  {
    id: 2,
    title: "The 'Always Right' Pass",
    description: "Use this card to instantly win any minor debate or argument. No questions asked!",
    code: "QUEEN-ALWAYS-RIGHT",
    emoji: "👑",
    color: "from-purple-400 to-indigo-500"
  },
  {
    id: 3,
    title: "Midnight Call Marathon",
    description: "Entitles you to an uninterrupted late-night voice call session until you fall asleep.",
    code: "MIDNIGHT-TALK-LDR",
    emoji: "🌙",
    color: "from-blue-400 to-indigo-600"
  },
  {
    id: 4,
    title: "Virtual Movie Night Host",
    description: "I will host a virtual movie night, let you choose any film, and send you your favorite snacks.",
    code: "MOVIE-DATE-TREAT",
    emoji: "🍿",
    color: "from-amber-400 to-orange-500"
  },
  {
    id: 5,
    title: "Instant Mood Booster",
    description: "Send this coupon to receive an instant list of 10 customized reasons why you are the best.",
    code: "BOOST-HAPPY-SWETA",
    emoji: "💖",
    color: "from-emerald-400 to-teal-500"
  },
  {
    id: 6,
    title: "First Date Custom Wish",
    description: "Allows you to choose the exact location and activity for our very first official date in person.",
    code: "FIRST-DATE-DREAM",
    emoji: "✈️",
    color: "from-rose-400 to-pink-600"
  }
];

const REASONS = [
  "The beautiful, elegant grace you bring to every picture you share with me. 🌸",
  "How you make the distance feel like absolute nothing with your sweet, cute voice notes. 🎵",
  "Your amazing, pure-hearted kindness that instantly warms up my entire universe. ✨",
  "The way you remember the smallest, tinest details of our conversations. 🥰",
  "How you are my safe haven, my peace, and always the best part of my entire day. 🏡",
  "Your beautiful, radiant smile that completely lights up my world even miles away. ☀️",
  "How we can text and laugh about absolutely anything without ever getting bored. 💬",
  "Your stylish, stunning fashion sense (you look absolutely gorgeous in everything!). 💃",
  "The cute and loving emojis you send me when you want to pamper me. 🫶",
  "How deeply you care for me and support me through everything. 🤝",
  "Your incredible intelligence and how beautifully you explain your thoughts. 🧠",
  "Our synchronized minds where we end up typing the exact same text at the same time. 📱",
  "The soothing comfort your presence brings me whenever I feel overwhelmed. 🌿",
  "How you inspire me daily to grow and be the absolute best version of myself. 📈",
  "Simply because you are YOU—my favorite, most precious person in the whole wide world! ❤️"
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is our absolute favorite way to stay connected?",
    options: [
      "Endless text chats & sweet voice notes 📱",
      "Official professional emails 📧",
      "Telepathy & mind reading 🔮",
      "Through carrier pigeons 🐦"
    ],
    correctIndex: 0,
    explanation: "Our texts and voice notes keep us incredibly close every single day!"
  },
  {
    question: "If we could instantly unlock one superpower, which one would we choose?",
    options: [
      "Invisibility",
      "Instant teleportation to each other ✈️✨",
      "Super strength",
      "Reading minds"
    ],
    correctIndex: 1,
    explanation: "Because then we could instantly skip the distance and hug each other!"
  },
  {
    question: "What is our official distance relationship motto?",
    options: [
      "Out of sight, out of mind ❌",
      "Miles apart but connected by heart ❤️",
      "We'll see each other in 100 years",
      "No chats allowed"
    ],
    correctIndex: 1,
    explanation: "No matter the distance, our hearts are always connected together!"
  },
  {
    question: "When do our deepest and most beautiful conversations happen?",
    options: [
      "During early morning chores",
      "In the middle of a busy lunch break",
      "Late at night when the world is peaceful and asleep 🌙",
      "Only on Mondays"
    ],
    correctIndex: 2,
    explanation: "Midnight chats are when we share our sweetest dreams and deepest thoughts."
  }
];

// Global counter for heart IDs to avoid duplicate keys in React
let heartIdCounter = 0;

export const LoveHubSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"coupons" | "reasons" | "quiz" | "ldr">("coupons");
  
  // Coupons State
  const [revealedCoupons, setRevealedCoupons] = useState<number[]>([]);
  
  // Reasons State
  const [currentReasonIdx, setCurrentReasonIdx] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // LDR Hub State
  const [sendingHug, setSendingHug] = useState(false);
  const [sendingKiss, setSendingKiss] = useState(false);
  const [activeHearts, setActiveHearts] = useState<{ id: number; char: string; left: number; scale: number; duration: number }[]>([]);

  const handleRevealCoupon = (id: number) => {
    if (revealedCoupons.includes(id)) return;
    triggerSparkleSound();
    setRevealedCoupons((prev) => [...prev, id]);
  };

  const handleNextReason = () => {
    if (isSpinning) return;
    triggerSparkleSound();
    setIsSpinning(true);
    
    let counter = 0;
    const interval = setInterval(() => {
      setCurrentReasonIdx((prev) => (prev + 1) % REASONS.length);
      counter++;
      if (counter > 10) {
        clearInterval(interval);
        // Choose a random final one
        setCurrentReasonIdx(Math.floor(Math.random() * REASONS.length));
        setIsSpinning(false);
      }
    }, 80);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    triggerSparkleSound();
    
    if (optionIdx === QUIZ_QUESTIONS[quizStep].correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (quizStep + 1 < QUIZ_QUESTIONS.length) {
      setQuizStep((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Trigger a confetti or extra sound event
      for (let i = 0; i < 5; i++) {
        setTimeout(triggerSparkleSound, i * 150);
      }
    }
  };

  const handleResetQuiz = () => {
    setQuizStep(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
    triggerSparkleSound();
  };

  const spawnEmojiRain = (emoji: string) => {
    triggerSparkleSound();
    const count = 22;
    const currentItems: typeof activeHearts = [];
    for (let i = 0; i < count; i++) {
      heartIdCounter++;
      currentItems.push({
        id: heartIdCounter,
        char: emoji,
        left: Math.random() * 100,
        scale: 0.5 + Math.random() * 1.2,
        duration: 1.5 + Math.random() * 2.0
      });
    }

    setActiveHearts((prev) => [...prev, ...currentItems]);
    
    setTimeout(() => {
      const idsToRemove = new Set(currentItems.map(item => item.id));
      setActiveHearts((prev) => prev.filter((item) => !idsToRemove.has(item.id)));
    }, 3500);
  };

  const handleSendHug = () => {
    if (sendingHug) return;
    setSendingHug(true);
    spawnEmojiRain("🤗");
    spawnEmojiRain("💖");
    setTimeout(() => setSendingHug(false), 1200);
  };

  const handleSendKiss = () => {
    if (sendingKiss) return;
    setSendingKiss(true);
    spawnEmojiRain("💋");
    spawnEmojiRain("❤️");
    setTimeout(() => setSendingKiss(false), 1200);
  };

  return (
    <section
      id="love-hub"
      className="relative w-full py-28 px-6 md:px-12 bg-gradient-to-b from-[#fff5f8] to-[#ffdbe7] overflow-hidden"
    >
      {/* Absolute overlay of falling custom hearts/kisses if triggered */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {activeHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ y: "100vh", opacity: 0.8, x: `${heart.left}vw` }}
              animate={{ y: "-10vh", opacity: 0, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: heart.duration, ease: "easeOut" }}
              style={{
                position: "absolute",
                fontSize: `${24 * heart.scale}px`,
              }}
            >
              {heart.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative floral vector blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1 bg-rose-100 border border-rose-200 text-rose-600 rounded-full text-xs uppercase font-bold tracking-widest mb-4 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: "3s" }} />
            <span>Interactive Lovers' Hub</span>
          </motion.div>
          <h2 className="font-serif luxury-text text-4xl sm:text-6xl text-[#E63950] mb-4">
            Our Magical Space
          </h2>
          <p className="font-sans text-sm sm:text-base text-pink-700/80 max-w-xl mx-auto">
            A beautiful, custom space built with 10+ interactive features, digital claimable coupons, and romantic modules for Sweta. Click on any tab to explore!
          </p>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-pink-100/80 shadow-md">
          <button
            onClick={() => { triggerSparkleSound(); setActiveTab("coupons"); }}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wide transition-all ${
              activeTab === "coupons"
                ? "bg-pink-500 text-white shadow-md scale-102"
                : "text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            🎟️ Love Coupons
          </button>
          <button
            onClick={() => { triggerSparkleSound(); setActiveTab("reasons"); }}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wide transition-all ${
              activeTab === "reasons"
                ? "bg-pink-500 text-white shadow-md scale-102"
                : "text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            💌 Reasons Generator
          </button>
          <button
            onClick={() => { triggerSparkleSound(); setActiveTab("quiz"); }}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wide transition-all ${
              activeTab === "quiz"
                ? "bg-pink-500 text-white shadow-md scale-102"
                : "text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            ❓ Relationship Trivia
          </button>
          <button
            onClick={() => { triggerSparkleSound(); setActiveTab("ldr"); }}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wide transition-all ${
              activeTab === "ldr"
                ? "bg-pink-500 text-white shadow-md scale-102"
                : "text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            ✈️ LDR Love Sender
          </button>
        </div>

        {/* TAB CONTENT CARDS CONTAINER */}
        <div className="w-full min-h-[420px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: LOVE COUPONS */}
            {activeTab === "coupons" && (
              <motion.div
                key="tab-coupons"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl text-pink-700 font-bold mb-1">🎟️ Redeemable Digital Coupons</h3>
                  <p className="font-sans text-xs sm:text-sm text-pink-600/70">
                    Click each scratch-card coupon below to scratch and reveal your secret code. Take a screenshot to redeem in real life!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {COUPONS.map((coupon) => {
                    const isRevealed = revealedCoupons.includes(coupon.id);
                    return (
                      <motion.div
                        key={coupon.id}
                        whileHover={{ y: -6 }}
                        onClick={() => handleRevealCoupon(coupon.id)}
                        className={`relative h-44 rounded-2xl cursor-pointer overflow-hidden shadow-md select-none border border-pink-100 transition-all ${
                          isRevealed ? `bg-gradient-to-br ${coupon.color} text-white` : "bg-white"
                        }`}
                      >
                        {/* UNREVEALED COVER */}
                        <AnimatePresence>
                          {!isRevealed && (
                            <motion.div
                              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                              transition={{ duration: 0.5 }}
                              className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200 flex flex-col items-center justify-center p-4 z-10"
                            >
                              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-rose-500 shadow-sm border border-pink-200/50 mb-2 animate-bounce">
                                <Gift className="w-6 h-6" />
                              </div>
                              <span className="font-sans font-bold text-xs uppercase tracking-widest text-pink-600/80">Click to Scratch</span>
                              <span className="font-serif text-sm text-pink-700/60 font-bold mt-1">Special Love Token</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* REVEALED CONTENT */}
                        <div className="p-5 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/70">Claimable Coupon</span>
                              <h4 className="font-serif font-bold text-lg text-white leading-tight mt-0.5">{coupon.title}</h4>
                            </div>
                            <span className="text-3xl">{coupon.emoji}</span>
                          </div>
                          
                          <p className="font-sans text-xs text-white/95 leading-relaxed font-medium">
                            {coupon.description}
                          </p>

                          <div className="flex justify-between items-center pt-2 border-t border-white/20">
                            <span className="font-mono text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase tracking-widest text-yellow-200">
                              CODE: {coupon.code}
                            </span>
                            <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-white/65 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Claimed
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 2: REASONS GENERATOR */}
            {activeTab === "reasons" && (
              <motion.div
                key="tab-reasons"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl mx-auto text-center"
              >
                <div className="mb-6">
                  <h3 className="font-serif text-2xl text-pink-700 font-bold mb-1">💌 Reasons Why You Are Loved</h3>
                  <p className="font-sans text-xs sm:text-sm text-pink-600/70">
                    Click the button to roll the wheel of adoration and discover a customized reason why you are completely adored.
                  </p>
                </div>

                {/* BIG CARD CONTAINER */}
                <div className="glass-card p-8 min-h-[220px] shadow-lg border border-pink-100 flex flex-col items-center justify-center relative overflow-hidden mb-8">
                  <div className="absolute top-3 left-3 text-pink-300">
                    <Heart className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 right-3 text-rose-300">
                    <Heart className="w-4 h-4" />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentReasonIdx}
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-center"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-50 text-rose-500 rounded-full mb-4 border border-rose-100 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-2">Reason #{currentReasonIdx + 1}</span>
                      <p className="font-sans text-base sm:text-lg font-bold text-pink-800 leading-relaxed px-4">
                        "{REASONS[currentReasonIdx]}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextReason}
                  disabled={isSpinning}
                  className={`px-8 py-3.5 rounded-full font-sans text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mx-auto ${
                    isSpinning ? "bg-pink-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-105"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
                  <span>{isSpinning ? "Rolling Sweetness..." : "Discover a Reason 💖"}</span>
                </motion.button>
              </motion.div>
            )}

            {/* TAB 3: RELATIONSHIP TRIVIA */}
            {activeTab === "quiz" && (
              <motion.div
                key="tab-quiz"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl mx-auto"
              >
                <div className="text-center mb-6">
                  <h3 className="font-serif text-2xl text-pink-700 font-bold mb-1">❓ Our Little Secrets</h3>
                  <p className="font-sans text-xs sm:text-sm text-pink-600/70">
                    A short, cute chemistry trivia game about our favorite communication, distance, and moments. Can you get a perfect score?
                  </p>
                </div>

                {/* INTERACTIVE QUIZ WINDOW */}
                <div className="glass-card p-6 sm:p-8 shadow-xl border border-pink-100 min-h-[350px] flex flex-col justify-between">
                  {!quizFinished ? (
                    <div>
                      {/* Progress header */}
                      <div className="flex justify-between items-center mb-6 pb-3 border-b border-pink-100">
                        <span className="font-mono text-xs font-bold text-pink-500 uppercase tracking-widest">Question {quizStep + 1} of {QUIZ_QUESTIONS.length}</span>
                        <div className="flex gap-1">
                          {QUIZ_QUESTIONS.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-4 h-1.5 rounded-full transition-colors ${
                                idx <= quizStep ? "bg-pink-500" : "bg-pink-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Question */}
                      <h4 className="font-sans text-base sm:text-lg font-bold text-pink-800 mb-6 leading-snug">
                        {QUIZ_QUESTIONS[quizStep].question}
                      </h4>

                      {/* Options */}
                      <div className="flex flex-col gap-3">
                        {QUIZ_QUESTIONS[quizStep].options.map((option, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrect = idx === QUIZ_QUESTIONS[quizStep].correctIndex;
                          const showCorrectness = selectedOption !== null;

                          let optionClass = "bg-white text-pink-700 hover:bg-pink-50 border-pink-100";
                          if (showCorrectness) {
                            if (isCorrect) {
                              optionClass = "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm";
                            } else if (isSelected) {
                              optionClass = "bg-rose-50 text-rose-800 border-rose-300 shadow-sm";
                            } else {
                              optionClass = "bg-white text-pink-300 border-pink-50 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuizAnswer(idx)}
                              disabled={showCorrectness}
                              className={`w-full text-left p-3.5 rounded-xl border font-sans text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${optionClass}`}
                            >
                              <span>{option}</span>
                              {showCorrectness && isCorrect && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      <AnimatePresence>
                        {selectedOption !== null && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-6 p-4 bg-pink-50 rounded-xl border border-pink-100 text-center"
                          >
                            <p className="font-sans text-xs font-semibold text-pink-700 leading-relaxed">
                              {selectedOption === QUIZ_QUESTIONS[quizStep].correctIndex ? "🎉 Spot on! " : "❤️ That's okay! "}
                              {QUIZ_QUESTIONS[quizStep].explanation}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // QUIZ SCOREBOARD SCREEN
                    <div className="text-center py-6 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mb-4 shadow-sm animate-bounce">
                        <Award className="w-8 h-8" />
                      </div>
                      <h4 className="font-serif text-2xl text-pink-700 font-bold mb-2">Relationship Champion! 🏆</h4>
                      <p className="font-sans text-sm text-pink-600 max-w-sm mb-4">
                        You scored <strong className="text-pink-500">{quizScore} / {QUIZ_QUESTIONS.length}</strong>! You know our distance journey inside out, proving that distance is just a number.
                      </p>
                      
                      {quizScore === QUIZ_QUESTIONS.length && (
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-pink-50 rounded-2xl border border-pink-100 mb-6 font-sans text-xs font-bold text-pink-700">
                          🌟 PERFECT SCORE BONUS UNLOCKED 🌟
                          <p className="font-medium text-pink-600 mt-1">"You are absolute perfection, and my heart completely belongs to you!"</p>
                        </div>
                      )}

                      <button
                        onClick={handleResetQuiz}
                        className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-sans text-xs font-bold shadow-md hover:bg-pink-600 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Play Again</span>
                      </button>
                    </div>
                  )}

                  {/* Next Step Control */}
                  {selectedOption !== null && !quizFinished && (
                    <div className="mt-6 pt-3 border-t border-pink-100 flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-sans text-xs font-bold shadow-md hover:bg-pink-600 transition-all"
                      >
                        {quizStep + 1 === QUIZ_QUESTIONS.length ? "Finish Quiz 🏁" : "Next Question ➡️"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: LDR LOVE SENDER */}
            {activeTab === "ldr" && (
              <motion.div
                key="tab-ldr"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl text-pink-700 font-bold mb-1">✈️ Distance Relationship Love Sender</h3>
                  <p className="font-sans text-xs sm:text-sm text-pink-600/70">
                    Distance can't slow us down! Click below to send instant real-time hugs or sweet kisses flying straight across the space!
                  </p>
                </div>

                {/* GRAPHIC CONNECTOR MAP */}
                <div className="glass-card p-8 shadow-xl border border-pink-100 relative mb-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                  {/* Left node (Him) */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-pink-50 rounded-full border border-pink-200 flex items-center justify-center text-pink-500 shadow-sm relative group">
                      <MapPin className="w-6 h-6 animate-pulse" />
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
                      </span>
                    </div>
                    <span className="font-sans text-xs font-bold text-pink-700 uppercase tracking-wider mt-3">My Heart</span>
                    <span className="font-mono text-[10px] text-pink-400 mt-0.5">Online • Distance Host</span>
                  </div>

                  {/* Pulsing connection line */}
                  <div className="flex-1 w-full md:w-auto relative flex flex-col items-center">
                    <span className="font-sans text-[11px] font-bold text-pink-500 uppercase tracking-widest bg-pink-50 border border-pink-200 px-3 py-1 rounded-full mb-2 shadow-sm z-10 animate-bounce">
                      Connected via Love Thread
                    </span>
                    <div className="w-full h-2 relative flex items-center">
                      {/* Background connecting track */}
                      <div className="absolute inset-x-0 h-1 bg-pink-100 rounded-full border-b border-pink-200/50" />
                      {/* Active racing dashes */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 animate-pulse rounded-full" />
                      
                      {/* Flying heart icon on loop */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-[-10px] animate-pulse">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500 scale-102" />
                      </div>
                    </div>
                  </div>

                  {/* Right node (Sweta) */}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center shadow-md relative">
                      <Heart className="w-6 h-6 fill-white animate-pulse" />
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                      </span>
                    </div>
                    <span className="font-sans text-xs font-bold text-pink-700 uppercase tracking-wider mt-3">Sweta's Heart</span>
                    <span className="font-mono text-[10px] text-pink-400 mt-0.5">Active • Safe Zone 🏡</span>
                  </div>
                </div>

                {/* SENDER CONTROLS */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSendHug}
                    disabled={sendingHug}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-sans text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>🤗</span>
                    <span>{sendingHug ? "Sending Hug..." : "Send Virtual Hug!"}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSendKiss}
                    disabled={sendingKiss}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-sans text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>💋</span>
                    <span>{sendingKiss ? "Blowing Kiss..." : "Blow Virtual Kiss!"}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
