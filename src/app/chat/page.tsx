'use client';

import { ChatWindow } from '@/components/chat/ChatWindow';
import { BottomNav } from '@/components/ui/BottomNav';
import { MessageCircleHeart } from 'lucide-react';

export default function ChatPage() {
  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto">
        <div className="bg-card rounded-t-3xl border-b border-border px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <MessageCircleHeart className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">心伴树洞</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-1">倾诉你的心声，我在这里倾听</p>
        </div>
        
        <div className="bg-card/50 h-[calc(100vh-170px)]">
          <ChatWindow />
        </div>
      </div>
      <BottomNav />
    </main>
  );
}