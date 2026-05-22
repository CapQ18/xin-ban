'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Calendar, Image as ImageIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BottomNav } from '@/components/ui/BottomNav';
import { JournalEntry, MainTask, SubTask, moodOptions } from '@/types';

const moodEmojis = ['😢', '😕', '😐', '🙂', '😄'];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    content: '',
    mood: '🙂',
    images: [] as string[],
    linkedTaskId: '',
  });
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(3);

  useEffect(() => {
    const saved = localStorage.getItem('journalEntries');
    if (saved) setEntries(JSON.parse(saved));
    
    const savedMainTasks = localStorage.getItem('mainTasks');
    const savedSubTasks = localStorage.getItem('subTasks');
    if (savedMainTasks) setMainTasks(JSON.parse(savedMainTasks));
    if (savedSubTasks) setSubTasks(JSON.parse(savedSubTasks));
  }, []);

  const saveEntries = () => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  };

  const createEntry = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: newEntry.content,
      mood: newEntry.mood,
      images: newEntry.images,
      linkedTaskId: newEntry.linkedTaskId,
    };
    setEntries([entry, ...entries]);
    saveEntries();
    setNewEntry({ content: '', mood: '🙂', images: [], linkedTaskId: '' });
    setShowCreateDialog(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    saveEntries();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setNewEntry(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewEntry(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateOverallProgress = () => {
    const allTasks = subTasks.filter(t => t.deadline === format(new Date(), 'yyyy-MM-dd'));
    if (allTasks.length === 0) return 0;
    const completed = allTasks.filter(t => t.completed).length;
    return Math.round((completed / allTasks.length) * 100);
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MM月dd日 EEEE', { locale: zhCN });
  };

  const getLinkedTask = (taskId: string) => {
    return subTasks.find(t => t.id === taskId) || mainTasks.find(t => t.id === taskId);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">点滴日志</h1>
            <p className="text-muted-foreground text-sm">记录每一天的小确幸</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-primary to-pink-400">
            <Plus className="w-4 h-4 mr-1" />
            写日志
          </Button>
        </div>

        <Card className="soft-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              今日进度
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-secondary"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - overallProgress / 100)}`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{overallProgress}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">各主线任务进度</p>
                <div className="space-y-2">
                  {mainTasks.map(task => {
                    const completed = subTasks.filter(t => t.parentId === task.id && t.completed).length;
                    const total = subTasks.filter(t => t.parentId === task.id).length;
                    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
                    return (
                      <div key={task.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{task.title}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: task.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-3">时间轴</h2>
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const linkedTask = getLinkedTask(entry.linkedTaskId || '');
              return (
                <Card key={entry.id} className="soft-shadow animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{entry.mood}</span>
                          <div>
                            <p className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</p>
                          </div>
                          {linkedTask && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                              {linkedTask.title}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{entry.content}</p>
                        {entry.images && entry.images.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {entry.images.map((img, i) => (
                              <img 
                                key={i} 
                                src={img} 
                                alt="日志图片" 
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {entries.length === 0 && (
              <Card className="soft-shadow">
                <CardContent className="p-8 text-center text-muted-foreground">
                  还没有日志，开始记录今天的点滴吧！
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>写点滴日志</DialogTitle>
            <DialogDescription>
              记录此刻的心情和发生的小事
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">今天心情如何？</p>
              <div className="flex justify-between">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMoodIndex(index);
                      setNewEntry(prev => ({ ...prev, mood: emoji }));
                    }}
                    className={`text-3xl transition-all hover:scale-125 ${
                      selectedMoodIndex === index ? 'scale-125 animate-bounce' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
              placeholder="今天发生了什么？记录一下吧..."
              className="w-full h-32 p-3 rounded-md border resize-none"
            />

            {newEntry.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {newEntry.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="预览" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => handleImageUpload(e as any);
                input.click();
              }}>
                <ImageIcon className="w-4 h-4 mr-1" />
                上传图片
              </Button>
            </div>

            {subTasks.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">关联任务（可选）</p>
                <select
                  className="w-full h-10 px-3 rounded-md border"
                  value={newEntry.linkedTaskId}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, linkedTaskId: e.target.value }))}
                >
                  <option value="">不关联</option>
                  {subTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-primary to-pink-400" onClick={createEntry}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </main>
  );
}