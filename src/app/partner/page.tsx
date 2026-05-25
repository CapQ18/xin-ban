'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Heart, MessageCircle, Star, Moon, Zap, BookOpen, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPartnerProfile, getChatHistory, addChatMessage, generateResponse, addIntimacyPoints, getIntimacyLevel, analyzeMessage, addMemory, updateLastActiveDate, shouldShowCareMessage, getCareResponse } from '@/lib/partner';
import { PartnerProfile, PartnerChatMessage, personalityOptions, personalityGradients } from '@/types';

function PartnerGuide() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">💕</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">创建你的专属伙伴</h1>
        <p className="text-muted-foreground">有一个专属AI伙伴陪你聊天、学习、打卡~</p>
      </div>
      
      <Button
        onClick={() => router.push('/partner/create')}
        className="w-40 h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        立即创建
      </Button>
      
      <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">🌙</div>
          <p className="text-sm font-medium">温柔陪伴</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm font-medium">智能聊天</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">📈</div>
          <p className="text-sm font-medium">亲密度系统</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl mb-2">🎁</div>
          <p className="text-sm font-medium">解锁内容</p>
        </div>
      </div>
    </div>
  );
}

function PartnerHome() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [messages, setMessages] = useState<PartnerChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const personality = profile?.personality || 'gentle';
  const gradients = personalityGradients[personality];
  const intimacyInfo = profile ? getIntimacyLevel(profile.intimacy) : { name: '陌生', color: 'gray', progress: 0 };
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const savedProfile = getPartnerProfile();
    if (!savedProfile) return;
    setProfile(savedProfile);
    
    const history = getChatHistory();
    setMessages(history);
    
    updateLastActiveDate();
    
    const careMessage = shouldShowCareMessage();
    if (careMessage && savedProfile) {
      const response = getCareResponse(savedProfile.personality, careMessage.type);
      if (response) {
        addChatMessage(response, 'partner');
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: response,
          sender: 'partner',
          timestamp: Date.now(),
        }]);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!inputValue.trim() || !profile) return;
    
    const userMessage: PartnerChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    addChatMessage(inputValue.trim(), 'user');
    setInputValue('');
    
    addIntimacyPoints('chat', 10);
    setProfile(prev => prev ? { ...prev, intimacy: prev.intimacy + 10 } : null);
    
    const analysis = analyzeMessage(inputValue);
    if (analysis.type && analysis.extracted) {
      addMemory(analysis.extracted, analysis.type);
    }
    
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateResponse(profile.personality, inputValue);
      const partnerMessage: PartnerChatMessage = {
        id: Date.now().toString(),
        content: response,
        sender: 'partner',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, partnerMessage]);
      addChatMessage(response, 'partner');
      setIsTyping(false);
    }, 1500);
  };

  const getPersonalityIcon = (type: string) => {
    const icons: Record<string, typeof Moon> = {
      gentle: Moon,
      lively: Zap,
      rational: BookOpen,
      mysterious: Sparkles,
    };
    return icons[type] || Star;
  };

  const getIntimacyColor = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradients.bg} pb-32`}>
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center pt-8 pb-6">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center text-5xl animate-breathing">
              {profile?.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
              {getPersonalityIcon(personality) && (
                React.createElement(getPersonalityIcon(personality), { className: 'w-5 h-5 text-primary' })
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-1">{profile?.name}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              {personalityOptions.find(p => p.id === personality)?.name}
            </span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
            <span className="text-sm font-medium" style={{ color: intimacyInfo.color === 'pink' ? '#ec4899' : intimacyInfo.color === 'purple' ? '#a855f7' : intimacyInfo.color === 'blue' ? '#3b82f6' : intimacyInfo.color === 'green' ? '#22c55e' : '#6b7280' }}>
              {intimacyInfo.name}
            </span>
          </div>
          
          <div className="w-full max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>亲密度</span>
              <span>{profile?.intimacy || 0}分</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getIntimacyColor(intimacyInfo.color)} transition-all duration-500`}
                style={{ width: `${intimacyInfo.progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-white/80 backdrop-blur-sm text-foreground rounded-bl-md shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="和你的伙伴聊聊天吧~"
              className="flex-1 bg-white/90 backdrop-blur-sm shadow-lg"
            />
            <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerPage() {
  const profile = getPartnerProfile();
  
  if (!profile) {
    return <PartnerGuide />;
  }
  
  return <PartnerHome />;
}
