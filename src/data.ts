import { GalleryItem, MemoryItem, GiftBoxItem, UserWish } from "./types";

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    url: "https://uploads.onecompiler.io/446vxgds2/1782653945819/243017.jpg",
    caption: "Your infectious laugh that shines through every photo you send ✨",
    category: "Smiles"
  },
  {
    id: 2,
    url: "https://uploads.onecompiler.io/446vxgds2/1782653929149/243008.jpg",
    caption: "Blowing out candles, making sweet distance wishes 🎂",
    category: "Celebration"
  },
  {
    id: 3,
    url: "https://uploads.onecompiler.io/446vxgds2/1782653916309/243002.jpg",
    caption: "Dreaming of the day we chase golden sunsets together 🌅",
    category: "Sunset Vibes"
  },
  {
    id: 4,
    url: "https://uploads.onecompiler.io/446vxgds2/1782653907366/242996.jpg",
    caption: "The elegant grace you bring to every single picture you share 🌸",
    category: "Elegant"
  },
  {
    id: 5,
    url: "https://uploads.onecompiler.io/446vxgds2/1782653897248/243020.jpg",
    caption: "Cozy virtual tea time chats and deep late-night texts ☕",
    category: "Virtual Dates"
  },
  {
    id: 6,
    url: "https://uploads.onecompiler.io/446vxgds2/44mve5kfs/129349.jpg",
    caption: "Sharing songs and endless sweet chat threads 📱🎵",
    category: "Screen Time"
  }
];

export const MEMORY_ITEMS: MemoryItem[] = [
  {
    id: 1,
    date: "Jan 12 • The First Hello",
    title: "Where it all began",
    description: "The stars aligned and a beautiful connection sparked across the distance. One text that quickly turned into infinite late-night laughs and voice notes.",
    url: "https://uploads.onecompiler.io/446vxgds2/1782653945819/243017.jpg"
  },
  {
    id: 2,
    date: "May 25 • Virtual Movie Night",
    title: "Synchronized Screens",
    description: "Watching our favorite movies miles apart, texting each other at the exact same moment, and sharing the exact same thoughts.",
    url: "https://uploads.onecompiler.io/446vxgds2/1782653916309/243002.jpg"
  },
  {
    id: 3,
    date: "Oct 08 • Midnight Harmony",
    title: "Distance Can't Stop Us",
    description: "Wrapped in our own blankets, sharing special playlists, and listening to each other's voice notes while dreaming of the day we finally meet.",
    url: "https://uploads.onecompiler.io/446vxgds2/44mve5kfs/129349.jpg"
  }
];

export const GIFT_BOXES: GiftBoxItem[] = [
  {
    id: 1,
    color: "from-pink-400 to-rose-500",
    ribbonColor: "bg-amber-300",
    emoji: "💖",
    compliment: "You are an absolute ray of sunshine!",
    wish: "May your day be as wonderfully radiant as your smile."
  },
  {
    id: 2,
    color: "from-purple-500 to-indigo-600",
    ribbonColor: "bg-yellow-300",
    emoji: "🦄",
    compliment: "Your kindness and empathy are superpowers.",
    wish: "Wishing you a year filled with magical surprises and endless joy."
  },
  {
    id: 3,
    color: "from-amber-400 to-orange-500",
    ribbonColor: "bg-rose-500",
    emoji: "👑",
    compliment: "You excel at everything you put your mind to!",
    wish: "May you conquer all your dreams with grace and determination."
  },
  {
    id: 4,
    color: "from-emerald-400 to-teal-500",
    ribbonColor: "bg-pink-300",
    emoji: "🌟",
    compliment: "You make the world infinitely warmer and sweeter.",
    wish: "I hope you are showered with all the love and pampering you deserve!"
  },
  {
    id: 5,
    color: "from-cyan-400 to-blue-500",
    ribbonColor: "bg-amber-400",
    emoji: "🔮",
    compliment: "Your creative energy is absolutely beautiful.",
    wish: "May this brand new chapter unlock stunning adventures and peace!"
  }
];

export const INITIAL_WISHES: UserWish[] = [
  {
    id: "1",
    name: "Aarav",
    text: "Happy Birthday Sweta! Keep shining bright like the star you are! 🌟 Have the most amazing year ahead!",
    timestamp: "Today, 10:00 AM",
    avatarColor: "bg-pink-500"
  },
  {
    id: "2",
    name: "Riya",
    text: "Happy birthday to my favorite human! 🎂 Thank you for always bringing so much joy and love into our lives. Let's party soon!",
    timestamp: "Today, 10:15 AM",
    avatarColor: "bg-purple-500"
  },
  {
    id: "3",
    name: "Kabir",
    text: "Sweta, wishing you a year full of crazy adventures, good food, and zero stress. You deserve the absolute best! 🥳🎉",
    timestamp: "Today, 11:30 AM",
    avatarColor: "bg-amber-500"
  }
];
