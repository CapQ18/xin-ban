'use client';

import { useEffect, useState } from 'react';
import { Clock, Target, Calendar } from 'lucide-react';
import { FocusRecord } from '@/types';

interface TimerStatsProps {
  todayMinutes: number;
  todayTomatoes: number;
}

export function TimerStats({ todayMinutes, todayTomatoes }: TimerStatsProps) {
  const [history, setHistory] = useState<FocusRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('focusRecords');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const groupedHistory = history.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, FocusRecord[]>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">今日专注</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatTime(todayMinutes)}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">完成番茄</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{todayTomatoes} 个</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-medium">历史记录</span>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {sortedDates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">暂无记录</p>
          ) : (
            sortedDates.map((date) => {
              const records = groupedHistory[date];
              const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
              const completedCount = records.filter((r) => r.completed).length;
              return (
                <div key={date} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <span className="text-sm">{formatDate(date)}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">{formatTime(totalMinutes)}</span>
                    <span className="text-amber-500">{completedCount}个番茄</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}