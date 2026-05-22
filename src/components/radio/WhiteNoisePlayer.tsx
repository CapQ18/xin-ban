'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Radio } from 'lucide-react';
import { whiteNoiseOptions } from '@/types';

export function WhiteNoisePlayer() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      stopNoise();
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const createWhiteNoise = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = selectedSound === 'rain' ? 800 : 
                                 selectedSound === 'forest' ? 1200 :
                                 selectedSound === 'waves' ? 600 :
                                 selectedSound === 'cafe' ? 2000 :
                                 selectedSound === 'fire' ? 400 : 1500;

    whiteNoise.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noiseNodeRef.current = whiteNoise;
    gainNodeRef.current = gainNode;

    return whiteNoise;
  };

  const startNoise = () => {
    if (!selectedSound) return;
    
    stopNoise();
    
    const whiteNoise = createWhiteNoise();
    whiteNoise.start();
    setIsPlaying(true);
  };

  const stopNoise = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopNoise();
    } else {
      startNoise();
    }
  };

  const selectSound = (soundId: string) => {
    if (selectedSound === soundId) {
      togglePlay();
    } else {
      setSelectedSound(soundId);
      if (isPlaying) {
        startNoise();
      }
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 soft-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-primary" />
        <h3 className="font-medium">治愈电台</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {whiteNoiseOptions.map((sound) => (
          <Button
            key={sound.id}
            variant={selectedSound === sound.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectSound(sound.id)}
            className={`flex flex-col items-center gap-1 py-3 transition-all hover-lift ${
              selectedSound === sound.id ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <span className="text-2xl">{sound.icon}</span>
            <span className="text-xs">{sound.name}</span>
          </Button>
        ))}
      </div>

      {selectedSound && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVolume(Math.max(0, volume - 0.1))}
              disabled={volume === 0}
            >
              <VolumeX className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full p-0 transition-all hover-lift"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVolume(Math.min(1, volume + 0.1))}
              disabled={volume === 1}
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>

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
            <span>静音</span>
            <span>{Math.round(volume * 100)}%</span>
            <span>最大</span>
          </div>
        </div>
      )}
    </div>
  );
}