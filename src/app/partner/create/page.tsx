'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Moon, Zap, BookOpen, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { savePartnerProfile, addChatMessage } from '@/lib/partner';
import { PartnerProfile, PersonalityType, personalityOptions, avatarOptions, genderOptions } from '@/types';

const personalityIcons: Record<PersonalityType, typeof Moon> = {
  gentle: Moon,
  lively: Zap,
  rational: BookOpen,
  mysterious: Sparkles,
};

export default function CreatePartnerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [personality, setPersonality] = useState<PersonalityType>('gentle');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const [gender, setGender] = useState<string>('');
  
  const handleCreate = () => {
    if (!name.trim()) return;
    
    const profile: PartnerProfile = {
      name: name.trim(),
      personality,
      avatar,
      gender: gender || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      intimacy: 0,
    };
    
    savePartnerProfile(profile);
    
    const greetings: Record<PersonalityType, string> = {
      gentle: `你好呀~我是${name}，很高兴认识你！以后我会一直陪在你身边的~`,
      lively: `哈喽！我是${name}！从今往后我们就是好朋友啦！一起加油吧！`,
      rational: `你好，我是${name}。很高兴能成为你的伙伴，让我们一起进步。`,
      mysterious: `${name}...这个名字很有趣。我有预感，我们会成为很好的朋友。`,
    };
    
    addChatMessage(greetings[personality], 'partner');
    
    router.push('/partner');
  };
  
  const canProceed = step === 1 ? true : name.trim().length > 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-white pb-24">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-4 pt-6 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">创建伙伴</h1>
            <p className="text-sm text-muted-foreground">第 {step} / 2 步</p>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-2">💕</div>
                <h2 className="text-lg font-medium text-foreground mb-1">选择伙伴性格</h2>
                <p className="text-sm text-muted-foreground">每个性格都有独特的聊天风格</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {personalityOptions.map((option) => {
                  const Icon = personalityIcons[option.id];
                  return (
                    <button
                      key={option.id}
                      onClick={() => setPersonality(option.id)}
                      className={`p-4 rounded-2xl transition-all hover:scale-105 ${
                        personality === option.id
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-secondary/50 hover:bg-secondary border border-input'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {Icon && <Icon className="w-6 h-6" />}
                        <span className="font-medium">{option.name}</span>
                      </div>
                      <p className="text-sm opacity-80">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl mx-auto mb-2">
                  {avatar}
                </div>
                <h2 className="text-lg font-medium text-foreground mb-1">自定义伙伴信息</h2>
                <p className="text-sm text-muted-foreground">给你的伙伴起个名字吧~</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  伙伴名字 <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 8))}
                  placeholder="最多8个字"
                  maxLength={8}
                  className="text-center text-lg"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {name.length}/8
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">选择头像</label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setAvatar(option.emoji)}
                      className={`p-3 rounded-xl transition-all hover:scale-110 ${
                        avatar === option.emoji
                          ? 'bg-primary/20 ring-2 ring-primary'
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      <span className="text-3xl">{option.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">性别（可选）</label>
                <div className="flex gap-3">
                  {genderOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setGender(gender === option.id ? '' : option.id)}
                      className={`flex-1 py-3 rounded-xl transition-all ${
                        gender === option.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 hover:bg-secondary border border-input'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => {
              if (step === 1) {
                setStep(2);
              } else {
                handleCreate();
              }
            }}
            disabled={!canProceed}
            className="w-40 h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full shadow-lg"
          >
            {step === 1 ? '下一步' : '创建伙伴'}
          </Button>
        </div>
        
        {step === 2 && (
          <Button
            variant="ghost"
            onClick={() => setStep(1)}
            className="w-full mt-4 text-muted-foreground"
          >
            返回上一步
          </Button>
        )}
      </div>
    </div>
  );
}
