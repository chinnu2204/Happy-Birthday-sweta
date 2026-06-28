export interface GalleryItem {
  id: number;
  url: string;
  caption: string;
  category: string;
}

export interface MemoryItem {
  id: number;
  date: string;
  title: string;
  description: string;
  url: string;
}

export interface GiftBoxItem {
  id: number;
  color: string;
  ribbonColor: string;
  emoji: string;
  compliment: string;
  wish: string;
}

export interface UserWish {
  id: string;
  name: string;
  text: string;
  timestamp: string;
  avatarColor: string;
}
