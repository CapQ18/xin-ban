'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { whiteNoiseOptions } from '@/types';

interface WhiteNoiseContextType {
  currentSound: string | null;
  isPlaying: boolean;
  volume: number;
  timerDuration: number | null;
  timerRemaining: number | null;
  playSound: (soundId: string) => void;
  pauseSound: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setTimer: (minutes: number | null) => void;
  stopSound: () => void;
}

const WhiteNoiseContext = createContext<WhiteNoiseContextType | undefined>(undefined);

export function WhiteNoiseProvider({ children }: { children: React.ReactNode }) {
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalVolumeRef = useRef(50);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playSound = (soundId: string) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      setVolume(originalVolumeRef.current);
    }

    if (currentSound === soundId && audioRef.current) {
      if (isPlaying) {
        pauseSound();
      } else {
        audioRef.current.play().catch(err => console.error('Play failed:', err));
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const soundData = whiteNoiseOptions.find(s => s.id === soundId);
    if (!soundData) return;

    const audio = new Audio(soundData.src);
    audio.loop = true;
    audio.volume = volume / 100;
    
    audio.play().catch(err => console.error('Play failed:', err));
    
    audioRef.current = audio;
    setCurrentSound(soundId);
    setIsPlaying(true);
  };

  const pauseSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentSound) return;
    if (isPlaying) {
      pauseSound();
    } else if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Play failed:', err));
      setIsPlaying(true);
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentSound(null);
    setIsPlaying(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    setTimerDuration(null);
    setTimerRemaining(null);
  };

  const setTimer = (minutes: number | null) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
      setVolume(originalVolumeRef.current);
    }

    if (minutes === null) {
      setTimerDuration(null);
      setTimerRemaining(null);
      return;
    }

    setTimerDuration(minutes);
    setTimerRemaining(minutes * 60);

    timerIntervalRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          startFadeOut();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startFadeOut = () => {
    originalVolumeRef.current = volume;
    let currentVolume = volume;

    fadeIntervalRef.current = setInterval(() => {
      currentVolume = Math.max(0, currentVolume - originalVolumeRef.current * 0.1);
      setVolume(currentVolume);

      if (currentVolume <= 0) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        stopSound();
      }
    }, 1000);
  };

  return (
    <WhiteNoiseContext.Provider
      value={{
        currentSound,
        isPlaying,
        volume,
        timerDuration,
        timerRemaining,
        playSound,
        pauseSound,
        togglePlay,
        setVolume,
        setTimer,
        stopSound,
      }}
    >
      {children}
    </WhiteNoiseContext.Provider>
  );
}

export function useWhiteNoise() {
  const context = useContext(WhiteNoiseContext);
  if (context === undefined) {
    throw new Error('useWhiteNoise must be used within a WhiteNoiseProvider');
  }
  return context;
}
