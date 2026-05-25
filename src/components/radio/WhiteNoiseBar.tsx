'use client';

import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { whiteNoiseOptions } from '@/types';
import { useWhiteNoise } from '@/contexts/WhiteNoiseContext';

export function WhiteNoiseBar() {
  const { 
    currentSound, 
    isPlaying, 
    volume, 
    togglePlay, 
    setVolume, 
    stopSound 
  } = useWhiteNoise();

  if (!currentSound) return null;

  const soundData = whiteNoiseOptions.find(s => s.id === currentSound);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div className="max-w-lg mx-auto bg-card rounded-2xl p-4 soft-shadow border border-border animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{soundData?.icon}</span>
            <div>
              <p className="font-medium text-sm">{soundData?.name}</p>
              <p className="text-xs text-muted-foreground">背景音</p>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setVolume(Math.max(0, volume - 10))}
              disabled={volume === 0}
              className="h-8 w-8"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
            <Slider
              min={0}
              max={100}
              value={[volume]}
              onValueChange={([val]) => setVolume(val)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setVolume(Math.min(100, volume + 10))}
              disabled={volume === 100}
              className="h-8 w-8"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="icon"
            onClick={togglePlay}
            className="h-10 w-10 rounded-full bg-primary"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={stopSound}
            className="h-10 w-10 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
