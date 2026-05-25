'use client';

import { Radio, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { whiteNoiseOptions } from '@/types';
import { useWhiteNoise } from '@/contexts/WhiteNoiseContext';

const timerOptions = [
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '60分钟', value: 60 },
];

export function WhiteNoisePlayer() {
  const { 
    currentSound, 
    isPlaying, 
    volume, 
    timerDuration, 
    timerRemaining,
    playSound, 
    setVolume, 
    setTimer 
  } = useWhiteNoise();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card rounded-3xl p-6 soft-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Radio className="w-5 h-5 text-primary" />
        <h3 className="font-medium">治愈电台</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
          {whiteNoiseOptions.map((sound) => (
            <button
              key={sound.id}
              onClick={() => playSound(sound.id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${
                currentSound === sound.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary/50 hover:bg-secondary border border-input'
              }`}
            >
              <span className="text-3xl">{sound.icon}</span>
              <span className="text-sm font-medium">{sound.name}</span>
              {currentSound === sound.id && isPlaying && (
                <div className="flex gap-1 mt-1">
                  <div className="w-1 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </button>
          ))}
        </div>

      {currentSound && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>音量</span>
              <span>{volume}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              value={[volume]}
              onValueChange={([val]) => setVolume(val)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">定时关闭</span>
            </div>
            {timerRemaining !== null && (
              <div className="text-center text-lg font-medium text-primary mb-2">
                {formatTime(timerRemaining)}
              </div>
            )}
            <div className="flex gap-2">
              {timerOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timerDuration === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimer(timerDuration === option.value ? null : option.value)}
                  className="flex-1"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
