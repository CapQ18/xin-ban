'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, Save, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BottomNav } from '@/components/ui/BottomNav';
import { RantEntry } from '@/types';

const aiResponses = [
  '我理解你的感受，说出来会不会好一点？',
  '这种感觉真的很让人不舒服，抱抱你。',
  '一切都会过去的，你不是一个人在面对。',
  '谢谢你愿意分享，你的情绪很重要。',
  '把烦恼说出来，心情会好一些的。',
  '我在这里陪着你，想聊多久都可以。',
];

export default function RantPage() {
  const [entries, setEntries] = useState<RantEntry[]>([]);
  const [content, setContent] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isThrowing, setIsThrowing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rantEntries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntries = () => {
    localStorage.setItem('rantEntries', JSON.stringify(entries));
  };

  const throwRant = () => {
    if (!content.trim()) return;
    
    setIsThrowing(true);
    
    setTimeout(() => {
      const entry: RantEntry = {
        id: Date.now().toString(),
        content: content,
        timestamp: Date.now(),
        saved: false,
      };
      
      setEntries([entry, ...entries]);
      setContent('');
      setIsThrowing(false);
      
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setAiResponse(response);
      setShowAIResponse(true);
    }, 1000);
  };

  const toggleSave = (id: string) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, saved: !e.saved } : e
    ));
    saveEntries();
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    saveEntries();
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'MM月dd日 HH:mm', { locale: zhCN });
  };

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">吐槽箱</h1>
          <p className="text-muted-foreground">把烦恼丢出去，心情好起来！</p>
        </div>

        <Card className="soft-shadow">
          <CardContent className="p-4">
            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="有什么不开心的，尽管吐槽吧..."
                className="w-full h-40 p-4 rounded-md border resize-none"
              />
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-pink-400"
                  onClick={throwRant}
                  disabled={!content.trim() || isThrowing}
                >
                  <Send className={`w-4 h-4 mr-1 ${isThrowing ? 'throw-animation' : ''}`} />
                  {isThrowing ? '丢出去了！' : '丢出去'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showAIResponse && (
          <Card className="soft-shadow animate-fade-in-up">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">❤️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">心伴</p>
                  <p>{aiResponse}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAIResponse(false)}>
                  <span className="text-sm">好的</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">吐槽记录</h2>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <Card key={entry.id} className="soft-shadow animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{entry.content}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleSave(entry.id)}>
                          {entry.saved ? 
                            <Check className="w-4 h-4 text-green-500" /> : 
                            <Save className="w-4 h-4" />
                          }
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}