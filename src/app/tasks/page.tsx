'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Flame, Calendar, Check, X, Bell } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BottomNav } from '@/components/ui/BottomNav';
import { MainTask, SubTask, mainTaskColors } from '@/types';

export default function TasksPage() {
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskType, setTaskType] = useState<'main' | 'sub'>('main');
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    parentId: '',
    remindTime: '',
  });
  const [selectedColor, setSelectedColor] = useState(mainTaskColors[0]);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const savedMainTasks = localStorage.getItem('mainTasks');
    const savedSubTasks = localStorage.getItem('subTasks');
    if (savedMainTasks) setMainTasks(JSON.parse(savedMainTasks));
    if (savedSubTasks) setSubTasks(JSON.parse(savedSubTasks));
  }, []);

  const saveTasks = () => {
    localStorage.setItem('mainTasks', JSON.stringify(mainTasks));
    localStorage.setItem('subTasks', JSON.stringify(subTasks));
  };

  const createMainTask = () => {
    const task: MainTask = {
      id: Date.now().toString(),
      title: `主线：${newTask.title}`,
      deadline: newTask.deadline,
      progress: 0,
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };
    setMainTasks([...mainTasks, task]);
    saveTasks();
    setNewTask({ title: '', deadline: '', parentId: '', remindTime: '' });
    setShowCreateDialog(false);
  };

  const createSubTask = () => {
    const task: SubTask = {
      id: Date.now().toString(),
      title: `支线：${newTask.title}`,
      deadline: newTask.deadline,
      completed: false,
      parentId: newTask.parentId,
      remindTime: newTask.remindTime,
    };
    setSubTasks([...subTasks, task]);
    saveTasks();
    setNewTask({ title: '', deadline: '', parentId: '', remindTime: '' });
    setShowCreateDialog(false);
  };

  const toggleSubTask = (taskId: string) => {
    const updated = subTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setSubTasks(updated);
    saveTasks();
  };

  const deleteMainTask = (taskId: string) => {
    setMainTasks(mainTasks.filter(t => t.id !== taskId));
    setSubTasks(subTasks.filter(t => t.parentId !== taskId));
    saveTasks();
  };

  const deleteSubTask = (taskId: string) => {
    setSubTasks(subTasks.filter(t => t.id !== taskId));
    saveTasks();
  };

  const getTodayTasks = () => {
    return subTasks.filter(task => !task.completed && task.deadline === today);
  };

  const getDaysLeft = (deadline: string) => {
    const target = parseISO(deadline);
    const now = new Date();
    return differenceInDays(target, now);
  };

  const getCompletedSubTasksCount = (parentId: string) => {
    return subTasks.filter(t => t.parentId === parentId && t.completed).length;
  };

  const getTotalSubTasksCount = (parentId: string) => {
    return subTasks.filter(t => t.parentId === parentId).length;
  };

  const calculateProgress = (taskId: string) => {
    const total = getTotalSubTasksCount(taskId);
    const completed = getCompletedSubTasksCount(taskId);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  useEffect(() => {
    const checkReminders = () => {
      subTasks.forEach(task => {
        if (task.remindTime && !task.completed) {
          const [hours, minutes] = task.remindTime.split(':').map(Number);
          const now = new Date();
          if (now.getHours() === hours && now.getMinutes() === minutes) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('心伴提醒', {
                  body: `别忘了完成任务：${task.title}`,
                  icon: '❤️',
                });
              }
            });
          }
        }
      });
    };
    
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [subTasks]);

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">任务规划</h1>
            <p className="text-muted-foreground text-sm">征服主线，完成支线！</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-primary to-pink-400">
            <Plus className="w-4 h-4 mr-1" />
            新任务
          </Button>
        </div>

        {mainTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">主线任务</h2>
            <div className="space-y-3">
              {mainTasks.map(task => {
                const progress = calculateProgress(task.id);
                const daysLeft = getDaysLeft(task.deadline);
                return (
                  <Card key={task.id} className="soft-shadow hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.color }} />
                            <h3 className="font-medium">{task.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {daysLeft > 0 ? `剩余 ${daysLeft} 天` : '已到期'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteMainTask(task.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>进度</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${progress}%`, 
                              backgroundColor: task.color 
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3">
            今日支线
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({getTodayTasks().length} 个待完成)
            </span>
          </h2>
          <div className="space-y-2">
            {subTasks.filter(t => t.deadline === today).map(task => {
              const parentTask = mainTasks.find(mt => mt.id === task.parentId);
              return (
                <Card key={task.id} className={`soft-shadow transition-all ${task.completed ? 'opacity-60' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant={task.completed ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleSubTask(task.id)}
                          className="w-8 h-8 rounded-full p-0"
                          style={{
                            backgroundColor: task.completed && parentTask ? parentTask.color : undefined,
                          }}
                        >
                          {task.completed && <Check className="w-4 h-4" />}
                        </Button>
                        <div>
                          <p className={`${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </p>
                          {task.remindTime && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              {task.remindTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteSubTask(task.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {getTodayTasks().length === 0 && (
              <Card className="soft-shadow">
                <CardContent className="p-6 text-center text-muted-foreground">
                  今天没有支线任务，休息一下吧！
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建新任务</DialogTitle>
            <DialogDescription>
              选择任务类型，开启你的冒险！
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 mb-4">
            <Button
              variant={taskType === 'main' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTaskType('main')}
            >
              主线任务
            </Button>
            <Button
              variant={taskType === 'sub' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTaskType('sub')}
            >
              支线任务
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              placeholder={taskType === 'main' ? '主线任务名称（如：考研冲刺）' : '支线任务名称（如：背50个单词）'}
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="bg-background text-foreground"
            />
            
            <Input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            />

            {taskType === 'main' && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">选择主题颜色</p>
                <div className="flex gap-2">
                  {mainTaskColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {taskType === 'sub' && mainTasks.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">关联主线任务（可选）</p>
                <select
                  className="w-full h-10 px-3 rounded-md border"
                  value={newTask.parentId}
                  onChange={(e) => setNewTask({ ...newTask, parentId: e.target.value })}
                >
                  <option value="">不关联</option>
                  {mainTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>
            )}

            {taskType === 'sub' && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">设置提醒时间（可选）</p>
                <Input
                  type="time"
                  value={newTask.remindTime}
                  onChange={(e) => setNewTask({ ...newTask, remindTime: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-primary to-pink-400" onClick={taskType === 'main' ? createMainTask : createSubTask}>
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </main>
  );
}