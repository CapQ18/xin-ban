'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Flame, Clock, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, startOfMonth, endOfMonth, addMonths, differenceInDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BottomNav } from '@/components/ui/BottomNav';
import { MoodCheckIn } from '@/components/mood/MoodCheckIn';

interface MoodRecord {
  date: string;
  score: number;
  tags: string[];
  note: string;
}

interface FocusRecord {
  id: string;
  date: string;
  duration: number;
  completed: boolean;
  mood: string;
}

interface ChatMessage {
  id: string;
  date: string;
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const getEmojiForScore = (score: number) => {
  if (score >= 8) return '😄';
  if (score >= 6) return '🙂';
  if (score >= 4) return '😐';
  if (score >= 2) return '😕';
  return '😢';
};

const getBgColorForScore = (score: number) => {
  if (score >= 7) return 'bg-green-100';
  if (score >= 4) return 'bg-yellow-100';
  return 'bg-red-100';
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);
  const [focusRecords, setFocusRecords] = useState<FocusRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<MoodRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const moodData = localStorage.getItem('mood_records');
    if (moodData) {
      setMoodRecords(JSON.parse(moodData));
    }

    const focusData = localStorage.getItem('focusRecords');
    if (focusData) {
      setFocusRecords(JSON.parse(focusData));
    }

    const chatData = localStorage.getItem('chatMessages');
    if (chatData) {
      setChatMessages(JSON.parse(chatData));
    }
  }, []);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = [];
    const startPadding = start.getDay();
    
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= differenceInDays(end, start) + 1; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    return days;
  };

  const getMoodForDate = (date: Date | null) => {
    if (!date) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return moodRecords.find((r) => r.date === dateStr);
  };

  const getFocusMinutesForDate = (dateStr: string) => {
    return focusRecords
      .filter((r) => r.date === dateStr && r.completed)
      .reduce((sum, r) => sum + r.duration, 0);
  };

  const getChatCountForDate = (dateStr: string) => {
    return chatMessages
      .filter((m) => {
        const msgDate = format(new Date(m.timestamp), 'yyyy-MM-dd');
        return msgDate === dateStr && m.sender === 'user';
      }).length;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = moodRecords.find((r) => r.date === dateStr);
    if (record) {
      setSelectedDate(record);
      setIsDrawerOpen(true);
    }
  };

  const prevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const currentMonthRecords = moodRecords.filter((r) => 
    isSameMonth(parseISO(r.date), currentDate)
  );

  const avgScore = currentMonthRecords.length > 0 
    ? Math.round(currentMonthRecords.reduce((sum, r) => sum + r.score, 0) / currentMonthRecords.length)
    : 0;

  const maxScore = currentMonthRecords.length > 0 
    ? Math.max(...currentMonthRecords.map((r) => r.score))
    : 0;

  const minScore = currentMonthRecords.length > 0 
    ? Math.min(...currentMonthRecords.map((r) => r.score))
    : 0;

  const getDateWithScore = (score: number) => {
    const record = currentMonthRecords.find((r) => r.score === score);
    return record ? format(parseISO(record.date), 'M月d日') : '-';
  };

  const getStreakDays = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (moodRecords.find((r) => r.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getLastMonthAvg = () => {
    const lastMonth = addMonths(currentDate, -1);
    const lastMonthRecords = moodRecords.filter((r) => 
      isSameMonth(parseISO(r.date), lastMonth)
    );
    if (lastMonthRecords.length === 0) return null;
    return Math.round(lastMonthRecords.reduce((sum, r) => sum + r.score, 0) / lastMonthRecords.length);
  };

  const lastMonthAvg = getLastMonthAvg();
  const trend = lastMonthAvg !== null ? avgScore - lastMonthAvg : null;

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = moodRecords.find((r) => r.date === dateStr);
    return {
      date: format(date, 'M/d'),
      score: record?.score || null,
      hasData: !!record,
    };
  }).filter((d) => d.date);

  const today = new Date();

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-primary">情绪日历</h1>
          <Calendar className="w-6 h-6 text-primary" />
        </div>

        <Card className="soft-shadow">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{avgScore}</p>
                <p className="text-xs text-muted-foreground">本月平均</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{maxScore}</p>
                <p className="text-xs text-muted-foreground">最高分</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{minScore}</p>
                <p className="text-xs text-muted-foreground">最低分</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-500">{getStreakDays()}</span>
                </div>
                <p className="text-xs text-muted-foreground">连续打卡</p>
              </div>
            </div>

            {trend !== null && (
              <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl ${
                trend >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {trend >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">
                  较上月{trend >= 0 ? '上升' : '下降'}{Math.abs(trend)}分
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {'<'}
              </button>
              <CardTitle className="text-lg">
                {format(currentDate, 'yyyy年M月', { locale: zhCN })}
              </CardTitle>
              <button
                onClick={nextMonth}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {'>'}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((date, index) => {
                if (!date) return <div key={index} className="h-9" />;
                
                const mood = getMoodForDate(date);
                const isToday = isSameDay(date, today);
                const isEmpty = !mood;

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={isEmpty}
                    className={`h-9 flex items-center justify-center text-sm rounded-lg transition-all ${
                      isToday ? 'ring-2 ring-primary ring-offset-1' : ''
                    } ${isEmpty ? 'text-muted-foreground/30 cursor-not-allowed' : getBgColorForScore(mood!.score)} ${
                      isEmpty ? '' : 'hover:scale-110 cursor-pointer'
                    }`}
                  >
                    {isEmpty ? date.getDate() : getEmojiForScore(mood!.score)}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>😢 1-3分</span>
              <span>😐 4-6分</span>
              <span>😄 7-10分</span>
            </div>
          </CardContent>
        </Card>

        {last30Days.filter((d) => d.hasData).length >= 7 ? (
          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="text-lg">情绪趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last30Days.filter((d) => d.hasData)}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f472b6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      domain={[1, 10]} 
                      tick={{ fontSize: 10 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}分`, '情绪分数']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#f472b6" 
                      fillOpacity={1}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="soft-shadow bg-gradient-to-br from-pink-50 to-orange-50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                记录7天情绪后，你会看到专属趋势图~
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedDate ? format(parseISO(selectedDate.date), 'M月d日 EEEE', { locale: zhCN }) : ''}
            </DrawerTitle>
            <DrawerDescription>
              {selectedDate && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl">{getEmojiForScore(selectedDate.score)}</span>
                  <span className="font-bold text-lg text-primary">{selectedDate.score}分</span>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          {selectedDate && (
            <div className="px-4 space-y-4">
              {selectedDate.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDate.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {selectedDate.note && (
                <p className="text-muted-foreground">{selectedDate.note}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">专注时长</span>
                  </div>
                  <p className="font-bold">
                    {getFocusMinutesForDate(selectedDate.date)}分钟
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">聊天次数</span>
                  </div>
                  <p className="font-bold">
                    {getChatCountForDate(selectedDate.date)}次
                  </p>
                </div>
              </div>
              <DrawerFooter>
                <Button 
                  className="w-full"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    window.location.href = '/chat';
                  }}
                >
                  查看树洞记录
                </Button>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <MoodCheckIn />
      <BottomNav />
    </main>
  );
}