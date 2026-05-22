'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import {
  Clock,
  Target,
  MessageCircle,
  Flame,
  Calendar,
  User,
  Settings,
  ChevronRight,
  Music,
  Palette,
  Star,
  Heart,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { LineChart, Line, XAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, startOfWeek, addDays, parseISO, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BottomNav } from '@/components/ui/BottomNav';
import { MoodCheckIn } from '@/components/mood/MoodCheckIn';
import { UserSettings, FocusRecord, ChatMessage, MoodRecord, MainTask, SubTask, ThemeType, themeConfig } from '@/types';
import Link from 'next/link';

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];

export default function ProfilePage() {
  const [settings, setSettings] = useState<UserSettings>({
    nickname: '朋友',
    targetDate: '',
    targetName: '我的目标',
    theme: 'white',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [targetDateInput, setTargetDateInput] = useState('');
  const [targetNameInput, setTargetNameInput] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [todayStats, setTodayStats] = useState({
    focusMinutes: 0,
    tomatoes: 0,
    chatCount: 0,
  });
  const [streakDays, setStreakDays] = useState(0);
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNoise, setSelectedNoise] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      const savedSettings = JSON.parse(saved);
      setSettings(savedSettings);
      setNicknameInput(savedSettings.nickname);
      setTargetDateInput(savedSettings.targetDate);
      setTargetNameInput(savedSettings.targetName || '我的目标');
      if (savedSettings.theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${savedSettings.theme}`);
      }
    } else {
      setNicknameInput('朋友');
      setTargetNameInput('我的目标');
    }

    const moodData = localStorage.getItem('moodRecords');
    if (moodData) {
      setMoodRecords(JSON.parse(moodData));
    }

    const savedMainTasks = localStorage.getItem('mainTasks');
    const savedSubTasks = localStorage.getItem('subTasks');
    if (savedMainTasks) setMainTasks(JSON.parse(savedMainTasks));
    if (savedSubTasks) setSubTasks(JSON.parse(savedSubTasks));
  }, []);

  useEffect(() => {
    if (settings.targetDate) {
      const target = new Date(settings.targetDate);
      const now = new Date();
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, diff));
    }
  }, [settings.targetDate]);

  useEffect(() => {
    const records = localStorage.getItem('focusRecords');
    if (records) {
      const focusRecords: FocusRecord[] = JSON.parse(records);
      const todayRecords = focusRecords.filter((r) => r.date === today && r.completed);
      setTodayStats((prev) => ({
        ...prev,
        focusMinutes: todayRecords.reduce((sum, r) => sum + r.duration, 0),
        tomatoes: todayRecords.length,
      }));
    }

    const chatData = localStorage.getItem('chatMessages');
    if (chatData) {
      const messages: ChatMessage[] = JSON.parse(chatData);
      const todayChats = messages.filter(
        (m) => m.sender === 'user' && format(new Date(m.timestamp), 'yyyy-MM-dd') === today
      );
      setTodayStats((prev) => ({ ...prev, chatCount: todayChats.length }));
    }

    let streak = 0;
    const currentDate = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (moodRecords.find((r) => r.date === dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    setStreakDays(streak);

    const todayMood = moodRecords.find(r => r.date === today);
    setHasCheckedInToday(!!todayMood);
  }, [today, moodRecords]);

  const saveSettings = () => {
    const newSettings: UserSettings = {
      nickname: nicknameInput || '朋友',
      targetDate: targetDateInput,
      targetName: targetNameInput || '我的目标',
      theme: settings.theme,
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    setIsEditing(false);
  };

  const setTheme = (theme: ThemeType) => {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('userSettings', JSON.stringify({ ...settings, theme }));
  };

  const checkIn = () => {
    if (hasCheckedInToday) return;
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const weekDays = [];
  const weekMoodData = [];
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = moodRecords.find((r) => r.date === dateStr);
    weekDays.push({ date, dateStr, hasData: !!record, score: record?.score || null });
    weekMoodData.push({
      day: format(date, 'E', { locale: zhCN }),
      score: record?.score || 0,
      hasData: !!record,
    });
  }

  const milestones = [
    { target: 7, label: '初露锋芒', current: streakDays },
    { target: 30, label: '月打卡达人', current: streakDays },
    { target: 100, label: '百日坚持', current: streakDays },
  ];

  const renderConfetti = () => {
    const colors = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#fb923c'];
    const confetti = [];
    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      confetti.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${left}%`,
            bottom: '0',
            animationDelay: `${delay}s`,
            backgroundColor: color,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      );
    }
    return confetti;
  };

  return (
    <main className="min-h-screen pb-24 relative overflow-hidden">
      {showConfetti && renderConfetti()}
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 relative z-10">
        <Card className="soft-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-pink-100 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="mb-1"
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-lg font-bold">{settings.nickname}</h2>
                  )}
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">连续打卡 {streakDays} 天</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isEditing ? saveSettings() : setIsEditing(true)}
              >
                {isEditing ? '保存' : <Settings className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardContent className="p-4">
            <Button 
              className={`w-full ${hasCheckedInToday ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-primary to-pink-400'}`}
              onClick={checkIn}
              disabled={hasCheckedInToday}
            >
              <Heart className={`w-4 h-4 mr-1 ${!hasCheckedInToday ? 'animate-pulse-soft' : ''}`} />
              {hasCheckedInToday ? '今日已打卡 ✓' : '打卡签到'}
            </Button>
          </CardContent>
        </Card>

        <Card className="soft-shadow bg-gradient-to-br from-primary/5 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">本周心情</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/journal">
                  <span className="text-xs">查看详情</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="h-16 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekMoodData}>
                  <defs>
                    <linearGradient id="weekMoodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f472b6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#f472b6"
                    fill="url(#weekMoodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between">
              {weekDays.map((day) => (
                <div key={day.dateStr} className="text-center">
                  <span className="text-lg">{day.hasData ? moodEmojis[Math.min(Math.floor((day.score || 0) / 2), 4)] : '—'}</span>
                  <p className="text-xs text-muted-foreground mt-1">{format(day.date, 'd')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-amber-500">{streakDays}天</p>
                <p className="text-sm text-muted-foreground">连续打卡</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.target}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{milestone.label}</span>
                    <span>{Math.min(milestone.current, milestone.target)}/{milestone.target}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        milestone.current >= milestone.target ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((milestone.current / milestone.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {settings.targetDate && (
          <Card className="soft-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                {settings.targetName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary mb-1">{daysLeft}</p>
                <p className="text-sm text-muted-foreground">天</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">今日数据</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-xl hover-lift">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">专注时长</p>
                <p className="font-bold text-primary">{formatTime(todayStats.focusMinutes)}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl hover-lift">
                <Target className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">完成番茄</p>
                <p className="font-bold text-amber-500">{todayStats.tomatoes}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl hover-lift">
                <MessageCircle className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">聊天次数</p>
                <p className="font-bold text-blue-500">{todayStats.chatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">快捷入口</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link href="/tasks">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>任务规划</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link href="/journal">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>点滴日志</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link href="/rant">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>吐槽箱</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-between" onClick={() => setShowThemeDialog(true)}>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>主题设置</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="w-5 h-5" />
              治愈音乐
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {['雨声', '森林', '咖啡馆', '海浪', '篝火', '鸟鸣'].map((name, index) => {
                const id = ['rain', 'forest', 'cafe', 'waves', 'fire', 'birds'][index];
                return (
                  <Button
                    key={id}
                    variant={selectedNoise === id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (selectedNoise === id) {
                        setSelectedNoise(null);
                        setIsPlaying(false);
                      } else {
                        setSelectedNoise(id);
                        setIsPlaying(true);
                      }
                    }}
                    className="flex flex-col py-3"
                  >
                    <span className="text-xl">{['🌧️', '🌲', '☕', '🌊', '🔥', '🐦'][index]}</span>
                    <span className="text-xs mt-1">{name}</span>
                  </Button>
                );
              })}
            </div>
            {selectedNoise && (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>音量</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>主题设置</DialogTitle>
            <DialogDescription>
              选择你喜欢的主题风格
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(themeConfig) as [ThemeType, typeof themeConfig.white][]).map(([theme, config]) => (
              <button
                key={theme}
                onClick={() => setTheme(theme)}
                className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                  settings.theme === theme ? 'border-primary' : 'border-border'
                }`}
                style={{ background: config.colors.background }}
              >
                <p className="font-medium">{config.name}</p>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <MoodCheckIn />
      <BottomNav />
    </main>
  );
}