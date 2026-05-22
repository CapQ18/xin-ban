'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '@/types';

const emotionTags = [
  { label: '压力大', emoji: '😰', mood: 'anxious' },
  { label: '焦虑', emoji: '😟', mood: 'anxious' },
  { label: '想放弃', emoji: '😔', mood: 'sad' },
  { label: '很开心', emoji: '😊', mood: 'happy' },
  { label: '疲惫', emoji: '😴', mood: 'tired' },
  { label: '生气', emoji: '😤', mood: 'angry' },
];

const responses: Record<string, { empathy: string[]; suggestions: string[] }> = {
  happy: {
    empathy: ['太棒了！看到你开心我也很开心', '真为你感到高兴', '继续保持这份好心情'],
    suggestions: ['可以记录下这份美好时刻', '和朋友分享你的快乐吧', '今天也要元气满满'],
  },
  calm: {
    empathy: ['平静的感觉真好', '内心的平静是很珍贵的', '享受这份宁静'],
    suggestions: ['可以做点喜欢的事情', '泡一杯茶放松一下', '冥想一会儿也不错'],
  },
  tired: {
    empathy: ['我懂这种疲惫的感觉', '累了就好好休息', '你的身体需要放松'],
    suggestions: ['放下手头的事休息一下', '睡个好觉很重要', '适当运动能缓解疲劳'],
  },
  anxious: {
    empathy: ['焦虑是很正常的情绪', '我理解你的感受', '你不是一个人在面对'],
    suggestions: ['试试深呼吸放松', '把大目标拆分成小任务', '和我聊聊会好一些'],
  },
  sad: {
    empathy: ['难过的时候哭出来也没关系', '我在这里陪着你', '一切都会好起来的'],
    suggestions: ['找朋友聊聊天', '做一些能让你开心的事', '给自己一点时间恢复'],
  },
  angry: {
    empathy: ['生气是正常的情绪反应', '我理解你的愤怒', '让情绪流动出来'],
    suggestions: ['先冷静下来再处理', '试试运动发泄一下', '深呼吸几次'],
  },
  default: {
    empathy: ['我能感受到你的心情', '我在这里倾听', '你的感受很重要'],
    suggestions: ['有什么想聊的都可以说', '我会一直在这里陪伴你', '我们一起面对'],
  },
};

const keywords: Record<string, string[]> = {
  happy: ['开心', '高兴', '快乐', '幸福', '太棒了', '太好了'],
  sad: ['难过', '伤心', '失望', '失落', '想哭', '孤单'],
  anxious: ['焦虑', '压力', '紧张', '担心', '害怕', '不安'],
  angry: ['生气', '愤怒', '烦躁', '恼火', '讨厌'],
  tired: ['累', '疲惫', '困', '想睡', '没精神'],
};

const detectMood = (content: string): string => {
  for (const [mood, words] of Object.entries(keywords)) {
    if (words.some((word) => content.includes(word))) {
      return mood;
    }
  }
  return 'default';
};

const generateAIResponse = (content: string) => {
  const detectedMood = detectMood(content);
  const responseSet = responses[detectedMood] || responses.default;
  const empathy = responseSet.empathy[Math.floor(Math.random() * responseSet.empathy.length)];
  const suggestion = responseSet.suggestions[Math.floor(Math.random() * responseSet.suggestions.length)];
  return `${empathy}...${suggestion}？`;
};

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const welcomeMessage: ChatMessage = {
        id: '1',
        content: '你好呀！我是心伴，你的专属情绪陪伴助手。有什么想聊的吗？',
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem('chatMessages', JSON.stringify(newMessages));
  };

  const sendMessage = (content: string, mood?: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: Date.now(),
      mood,
    };

    const newMessages = [...messages, userMessage];
    saveMessages(newMessages);
    setInputValue('');

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(content),
        sender: 'ai',
        timestamp: Date.now(),
      };
      saveMessages([...newMessages, aiMessage]);
    }, 800);
  };

  const handleEmotionClick = (emotion: string, mood: string) => {
    sendMessage(`我现在${emotion}`, mood);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <MessageBubble message={message} />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2 mb-3">
          {emotionTags.map((tag) => (
            <Button
              key={tag.label}
              variant="outline"
              size="sm"
              onClick={() => handleEmotionClick(tag.label, tag.mood)}
              className="rounded-full px-3 py-1 text-sm transition-all hover-lift"
            >
              <span>{tag.emoji}</span>
              <span className="ml-1">{tag.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
            placeholder="说说你的心情..."
            className="flex-1 transition-all"
          />
          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="transition-all hover-lift"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}