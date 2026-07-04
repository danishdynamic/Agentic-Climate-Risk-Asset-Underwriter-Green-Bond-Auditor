'use client';

import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AgentChat() {
  const messages = useAppStore((state) => state.agentMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[500px] border-0 shadow-sm">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-sm uppercase tracking-widest">AI Risk Agent</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="text-xs text-muted-foreground space-y-4 pt-4">
              <p>🤖 <strong>Climate Risk Agent</strong></p>
              <p>You can ask me:</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Analyze bond US12345</li>
                <li>Explain Climate VaR</li>
                <li>Generate a hedging strategy</li>
                <li>Review ESG compliance</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>
                  )}
                  <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}