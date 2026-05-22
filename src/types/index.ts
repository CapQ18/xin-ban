export interface FocusRecord {
  id: string;
  duration: number;
  date: string;
  completed: boolean;
  mood: string;
  rating: number;
  goal: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  mood?: string;
}

export interface UserSettings {
  nickname: string;
  targetDate: string;
  targetName: string;
  theme: ThemeType;
  customBackground?: string;
}

export interface DailyStats {
  focusMinutes: number;
  tomatoes: number;
  chatCount: number;
  date: string;
}

export interface MoodRecord {
  id: string;
  date: string;
  score: number;
  tags: string[];
  note: string;
}

// 任务系统
export interface MainTask {
  id: string;
  title: string;
  deadline: string;
  progress: number;
  color: string;
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  parentId?: string;
  remindTime?: string;
}

// 点滴日志
export interface JournalEntry {
  id: string;
  timestamp: number;
  content: string;
  mood: string;
  images?: string[];
  linkedTaskId?: string;
}

// 主题系统
export type ThemeType = 'starry' | 'forest' | 'lake' | 'white';

export interface ThemeConfig {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  animation?: string;
}

// 吐槽箱
export interface RantEntry {
  id: string;
  content: string;
  timestamp: number;
  saved: boolean;
}

export const moodOptions = [
  { label: '开心', emoji: '😊', value: 'happy', score: 5 },
  { label: '平静', emoji: '😌', value: 'calm', score: 4 },
  { label: '疲惫', emoji: '😴', value: 'tired', score: 3 },
  { label: '焦虑', emoji: '😟', value: 'anxious', score: 2 },
  { label: '难过', emoji: '😢', value: 'sad', score: 1 },
  { label: '生气', emoji: '😤', value: 'angry', score: 2 },
];

export const whiteNoiseOptions = [
  { id: 'rain', name: '雨声', icon: '🌧️' },
  { id: 'forest', name: '森林', icon: '🌲' },
  { id: 'cafe', name: '咖啡馆', icon: '☕' },
  { id: 'waves', name: '海浪', icon: '🌊' },
  { id: 'fire', name: '篝火', icon: '🔥' },
  { id: 'birds', name: '鸟鸣', icon: '🐦' },
];

export const mainTaskColors = [
  '#f472b6', // 粉红
  '#fb923c', // 橙色
  '#a78bfa', // 紫色
  '#34d399', // 绿色
  '#60a5fa', // 蓝色
  '#fbbf24', // 黄色
];

export const themeConfig: Record<ThemeType, ThemeConfig> = {
  starry: {
    name: '星空',
    description: '深蓝星空，星星闪烁',
    colors: {
      primary: '#818cf8',
      secondary: '#1e1b4b',
      background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)',
    },
    animation: 'stars',
  },
  forest: {
    name: '森林',
    description: '绿色森林，树叶飘动',
    colors: {
      primary: '#22c55e',
      secondary: '#064e3b',
      background: 'linear-gradient(to bottom, #dcfce7, #86efac)',
    },
    animation: 'leaves',
  },
  lake: {
    name: '湖泊',
    description: '蓝绿水波，宁静致远',
    colors: {
      primary: '#06b6d4',
      secondary: '#0c4a6e',
      background: 'linear-gradient(to bottom, #cffafe, #67e8f9)',
    },
    animation: 'waves',
  },
  white: {
    name: '纯白',
    description: '简洁纯白，纯净自然',
    colors: {
      primary: '#f472b6',
      secondary: '#f3f4f6',
      background: 'linear-gradient(to bottom, #ffffff, #f3f4f6)',
    },
  },
};