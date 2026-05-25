'use client';

import { useState, useEffect } from 'react';
import { Timer } from '@/components/timer/Timer';
import { TimerStats } from '@/components/timer/TimerStats';
import { BottomNav } from '@/components/ui/BottomNav';
import { MoodCheckIn } from '@/components/mood/MoodCheckIn';
import { WhiteNoisePlayer } from '@/components/radio/WhiteNoisePlayer';
import { WhiteNoiseBar } from '@/components/radio/WhiteNoiseBar';
import { WhiteNoiseProvider } from '@/contexts/WhiteNoiseContext';
import { Heart, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface FocusRecord {
  id: string;
  duration: number;
  date: string;
  completed: boolean;
  mood: string;
  rating: number;
  goal: string;
}

function HomeContent() {
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayTomatoes, setTodayTomatoes] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const records = localStorage.getItem('focusRecords');
    if (records) {
      const focusRecords: FocusRecord[] = JSON.parse(records);
      const todayRecords = focusRecords.filter((r) => r.date === today && r.completed);
      setTodayMinutes(todayRecords.reduce((sum, r) => sum + r.duration, 0));
      setTodayTomatoes(todayRecords.length);
    }
  }, [today]);

  const handleComplete = (record: FocusRecord) => {
    const records = localStorage.getItem('focusRecords');
    const focusRecords: FocusRecord[] = records ? JSON.parse(records) : [];
    
    focusRecords.push(record);
    localStorage.setItem('focusRecords', JSON.stringify(focusRecords));
    
    setTodayMinutes((prev) => prev + record.duration);
    setTodayTomatoes((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Heart className="w-5 h-5 text-primary animate-pulse-soft" />
            <span className="text-lg font-bold text-primary">心伴</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">专注时光</h1>
          <p className="text-muted-foreground">陪伴你度过每一段专注时刻</p>
        </div>

        <div className="bg-card rounded-3xl p-6 soft-shadow mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Timer onComplete={handleComplete} defaultDuration={25} />
        </div>

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <WhiteNoisePlayer />
        </div>

        <TimerStats todayMinutes={todayMinutes} todayTomatoes={todayTomatoes} />
      </div>
      <WhiteNoiseBar />
      <MoodCheckIn />
      <BottomNav />
    </main>
  );
}

export default function Home() {
  return (
    <WhiteNoiseProvider>
      <HomeContent />
    </WhiteNoiseProvider>
  );
}