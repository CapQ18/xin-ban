'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircleHeart } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MoodRecord {
  date: string;
  score: number;
  tags: string[];
  note: string;
}

const emojiOptions = [
  { emoji: '😢', label: '难过', score: 2 },
  { emoji: '😕', label: '低落', score: 4 },
  { emoji: '😐', label: '一般', score: 5 },
  { emoji: '🙂', label: '不错', score: 7 },
  { emoji: '😄', label: '开心', score: 9 },
];

const tagOptions = ['开心', '焦虑', '疲惫', '兴奋', '平静', '压力大'];

export function MoodCheckIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [score, setScore] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showSlider, setShowSlider] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const lastCheckInDate = localStorage.getItem('lastCheckInDate');
    if (lastCheckInDate !== today) {
      setIsOpen(true);
    }
  }, [today]);

  const getFeedback = () => {
    if (score >= 1 && score <= 3) {
      return { text: '抱抱你，想聊聊吗？', showButton: true };
    } else if (score >= 4 && score <= 6) {
      return { text: '平淡也是好的一天~', showButton: false };
    } else {
      return { text: '太棒了！继续保持！', showButton: false };
    }
  };

  const handleEmojiSelect = (emoji: string, defaultScore: number) => {
    setSelectedEmoji(emoji);
    setScore(defaultScore);
    setShowSlider(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const record: MoodRecord = {
      date: today,
      score,
      tags: selectedTags,
      note,
    };

    const existingRecords = localStorage.getItem('mood_records');
    const records = existingRecords ? JSON.parse(existingRecords) : [];
    
    const existingIndex = records.findIndex((r: MoodRecord) => r.date === today);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    localStorage.setItem('mood_records', JSON.stringify(records));
    localStorage.setItem('lastCheckInDate', today);
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('lastCheckInDate', today);
    setIsOpen(false);
  };

  const feedback = getFeedback();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-xl border-pink-100">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-2xl font-bold text-primary mb-2">
            今天感觉怎么样？
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
          </DialogDescription>
        </DialogHeader>

        {!showSlider ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">选择一个表情代表你的心情</p>
            <div className="flex justify-center gap-3">
              {emojiOptions.map(({ emoji, label, score: defaultScore }) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji, defaultScore)}
                  className={`flex flex-col items-center p-3 rounded-2xl transition-all hover-lift ${
                    selectedEmoji === emoji
                      ? 'bg-primary/20 scale-110'
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  <span className="text-4xl mb-1">{emoji}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSkip}>
                跳过
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-pink-400 hover:from-primary/90 hover:to-pink-400/90" 
                disabled={!selectedEmoji}
                onClick={handleSubmit}
              >
                记录今天
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="text-5xl">{selectedEmoji}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">情绪分数</span>
                <span className="font-bold text-primary text-lg">{score}分</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 很差</span>
                <span>5 一般</span>
                <span>10 极好</span>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-center font-medium">
                {feedback.text}
              </p>
              {feedback.showButton && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/chat';
                  }}
                >
                  <MessageCircleHeart className="w-4 h-4 mr-2" />
                  去树洞聊聊
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">选择标签（可多选）</p>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">一句话日记（选填）</p>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 100))}
                placeholder="今天发生了什么..."
                maxLength={100}
              />
              <span className="text-xs text-muted-foreground text-right">
                {note.length}/100
              </span>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowSlider(false);
                  setSelectedEmoji(null);
                }}
              >
                返回选择
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-pink-400 hover:from-primary/90 hover:to-pink-400/90" 
                onClick={handleSubmit}
              >
                记录今天
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}