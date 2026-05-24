'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Smile, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const durationOptions = [
  { label: '15', value: 15 },
  { label: '25', value: 25 },
  { label: '45', value: 45 },
  { label: '60', value: 60 },
];

const moodOptions = [
  { label: '开心', emoji: '😊', value: 'happy' },
  { label: '平静', emoji: '😌', value: 'calm' },
  { label: '疲惫', emoji: '😴', value: 'tired' },
  { label: '焦虑', emoji: '😟', value: 'anxious' },
  { label: '难过', emoji: '😢', value: 'sad' },
  { label: '生气', emoji: '😤', value: 'angry' },
];

interface TimerProps {
  onComplete: (record: FocusRecord) => void;
  defaultDuration: number;
}

export function Timer({ onComplete, defaultDuration }: TimerProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [goal, setGoal] = useState('');
  const [showMoodSelector, setShowMoodSelector] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [qualityScore, setQualityScore] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setIsBreak(false);
    setShowMoodSelector(true);
    setSelectedMood('');
    setGoal('');
  }, [duration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (!isBreak) {
        const randomQuality = Math.floor(Math.random() * 3) + 8;
        setQualityScore(randomQuality);
        setShowRatingModal(true);
        setIsRunning(false);
      } else {
        setIsBreak(false);
        setTimeLeft(duration * 60);
        setShowMoodSelector(true);
        setSelectedMood('');
        setGoal('');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, duration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const totalSeconds = isBreak ? 5 * 60 : duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const toggleTimer = () => {
    if (!isRunning && showMoodSelector && (!selectedMood || !goal.trim())) {
      return;
    }
    if (showMoodSelector && selectedMood && goal.trim()) {
      setShowMoodSelector(false);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(duration * 60);
    setShowMoodSelector(true);
    setSelectedMood('');
    setGoal('');
    setShowRatingModal(false);
    setRating(0);
  };

  const handleRatingSubmit = () => {
    const newRecord: FocusRecord = {
      id: Date.now().toString(),
      duration,
      date: today,
      completed: true,
      mood: selectedMood,
      rating,
      goal,
    };
    
    onComplete(newRecord);
    
    setIsBreak(true);
    setTimeLeft(5 * 60);
    setShowRatingModal(false);
    setRating(0);
  };

  const encouragementMessages = [
    '太棒了！专注完成！',
    '做得好！休息一下吧~',
    '专注的你真的很棒！',
    '继续保持这份专注！',
    '完成一个番茄，离目标更近一步！',
  ];

  const getRandomEncouragement = () => {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  };

  return (
    <div className="flex flex-col items-center">
      {showMoodSelector && !isBreak && (
        <div className="mb-6 animate-fade-in-up space-y-4 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">开始前，你的心情是？</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {moodOptions.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMood(mood.value)}
                className={`rounded-full px-4 py-2 transition-all hover-lift ${
                  selectedMood === mood.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="ml-1 text-sm">{mood.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-2 mt-4">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">今日小目标</span>
          </div>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="今天想完成什么？"
            className="w-full"
          />
        </div>
      )}

      <div className="relative w-72 h-72 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-primary/15"
          />
          <circle
            cx="144"
            cy="144"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isBreak ? 'text-amber-400' : 'text-primary'}`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-muted-foreground mb-2">
            {isBreak ? '休息时间' : '专注时间'}
          </span>
          <span className={`text-6xl font-bold ${isBreak ? 'text-amber-500' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </span>
          {selectedMood && !isBreak && !showMoodSelector && (
            <span className="text-xs mt-2 text-muted-foreground">
              {moodOptions.find(m => m.value === selectedMood)?.emoji} {goal}
            </span>
          )}
        </div>
      </div>

      {!showMoodSelector && !showRatingModal && (
        <div className="flex gap-3 mb-8">
          {durationOptions.map((option) => (
            <Button
              key={option.value}
              variant={duration === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => !isRunning && setDuration(option.value)}
              disabled={isRunning}
              className={`w-14 transition-all hover-lift ${duration === option.value ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {!showRatingModal && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            className="w-16 h-16 rounded-full p-0 transition-all hover-lift"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            onClick={toggleTimer}
            disabled={!isRunning && showMoodSelector && (!selectedMood || !goal.trim())}
            className={`w-20 h-20 rounded-full p-0 transition-all hover-lift ${
              isBreak ? 'bg-amber-400 hover:bg-amber-500' : ''
            } ${(!isRunning && showMoodSelector && (!selectedMood || !goal.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={(!isRunning && showMoodSelector && (!selectedMood || !goal.trim())) ? '请先选择心情并输入目标' : ''}
          >
            {isRunning ? (
              <Pause className="w-8 h-8" />
            ) : isBreak ? (
              <Coffee className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
        </div>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-card rounded-3xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <p className="text-2xl mb-2">{getRandomEncouragement()}</p>
              <p className="text-muted-foreground">本次专注质量评分：{qualityScore}分</p>
            </div>

            <div className="mb-6">
              <p className="text-center text-sm text-muted-foreground mb-4">你觉得这次专注怎么样？</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all ${
                      star <= rating ? 'scale-110' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetTimer}>
                跳过评价
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-pink-400" 
                onClick={handleRatingSubmit}
                disabled={rating === 0}
              >
                确认评价
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}