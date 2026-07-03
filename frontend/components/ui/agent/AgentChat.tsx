'use client';

import React, { useState } from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { useAgent } from '@/hooks/useAgent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Send, Terminal, User, Bot } from 'lucide-react';

export function AgentChat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, error } = useAgent();

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-none bg-background">
      {/* 1. Chat Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AppFeedback isLoading={false} error={error} isEmpty={messages.length === 0}>
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'assistant' && <Bot className="h-5 w-5 mt-1 text-muted-foreground" />}
              <div className={cn(
                "max-w-[80%] p-4 text-sm font-mono border",
                msg.role === 'user' ? "bg-muted/30 border-muted" : "bg-background border-muted"
              )}>
                {msg.content}
              </div>
              {msg.role === 'user' && <User className="h-5 w-5 mt-1 text-muted-foreground" />}
            </div>
          ))}
        </AppFeedback>
      </div>

      {/* 2. Chat Input Console */}
      <div className="border-t p-4 bg-muted/10">
        <div className="flex gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your risk analysis command..." 
            className="rounded-none resize-none h-12 text-xs border-muted-foreground/30 focus-visible:ring-0"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading}
            className="rounded-none h-12 px-6 uppercase text-[10px] tracking-widest"
          >
            {isLoading ? <Terminal className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}