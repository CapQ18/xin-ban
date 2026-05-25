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
  { id: 'light-rain', name: '小雨声', icon: '🌧️', src: '/mixkit-light-rain-loop-2393.wav' },
  { id: 'water-flowing', name: '水流声', icon: '💧', src: '/mixkit-water-flowing-ambience-loop-3126.wav' },
  { id: 'morning-birds', name: '早晨鸟鸣', icon: '🐦', src: '/mixkit-morning-birds-2472.wav' },
  { id: 'birds-branch', name: '林间鸟鸣', icon: '🌳', src: '/mixkit-birds-and-snapping-branch-2421.wav' },
];

export const mainTaskColors = [
  '#f472b6', // 粉红
  '#fb923c', // 橙色
  '#a78bfa', // 紫色
  '#34d399', // 绿色
  '#60a5fa', // 蓝色
  '#fbbf24', // 黄色
];

export type PersonalityType = 'gentle' | 'lively' | 'rational' | 'mysterious';

export type MemoryType = 'exam' | 'person' | 'worry' | 'happy';

export interface PartnerProfile {
  name: string;
  personality: PersonalityType;
  avatar: string;
  gender?: string;
  createdAt: string;
  intimacy: number;
}

export interface PartnerMemory {
  content: string;
  type: MemoryType;
  date: string;
}

export interface PartnerChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'partner';
  timestamp: number;
}

export interface IntimacyLog {
  reason: string;
  points: number;
  date: string;
}

export const personalityOptions: { id: PersonalityType; name: string; icon: string; description: string }[] = [
  { id: 'gentle', name: '温柔型', icon: '🌙', description: '我会一直陪在你身边~' },
  { id: 'lively', name: '活泼型', icon: '⚡', description: '今天也要元气满满哦！' },
  { id: 'rational', name: '理性型', icon: '📚', description: '深呼吸，我们一步步来。' },
  { id: 'mysterious', name: '神秘型', icon: '🔮', description: '你猜我今天学到了什么？' },
];

export const avatarOptions = [
  { id: 'cat', emoji: '🐱', name: '小猫咪' },
  { id: 'dog', emoji: '🐶', name: '小狗勾' },
  { id: 'rabbit', emoji: '🐰', name: '小兔子' },
  { id: 'bear', emoji: '🐻', name: '小熊熊' },
  { id: 'fox', emoji: '🦊', name: '小狐狸' },
  { id: 'owl', emoji: '🦉', name: '猫头鹰' },
  { id: 'deer', emoji: '🦌', name: '小鹿鹿' },
  { id: 'unicorn', emoji: '🦄', name: '独角兽' },
];

export const genderOptions = [
  { id: 'male', label: '男生' },
  { id: 'female', label: '女生' },
  { id: 'other', label: '其他' },
];

export const intimacyLevels = [
  { min: 0, max: 99, name: '陌生', color: 'gray' },
  { min: 100, max: 299, name: '熟悉', color: 'green' },
  { min: 300, max: 599, name: '朋友', color: 'blue' },
  { min: 600, max: 999, name: '知己', color: 'purple' },
  { min: 1000, max: Infinity, name: '灵魂伴侣', color: 'pink' },
];

export const personalityGradients: Record<PersonalityType, { bg: string; text: string }> = {
  gentle: { bg: 'from-pink-200 via-purple-200 to-pink-100', text: 'text-purple-600' },
  lively: { bg: 'from-orange-200 via-yellow-200 to-orange-100', text: 'text-orange-600' },
  rational: { bg: 'from-blue-200 via-cyan-200 to-blue-100', text: 'text-blue-600' },
  mysterious: { bg: 'from-indigo-200 via-purple-200 to-indigo-100', text: 'text-indigo-600' },
};

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