'use client';

import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react'; // Added loader asset icon

export function AgentChat() {
  const messages = useAppStore((state) => state.agentMessages);
  const isStreaming = useAppStore((state) => state.loading.agent);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ 
      behavior: isStreaming ? 'auto' : 'smooth' 
    });
  }, [messages, isStreaming]);

  return (
    // FIX: Swapped h-[500px] out for h-full to make it scale automatically with screen size
    <Card className="flex flex-col h-full border-0 shadow-sm min-h-0 bg-transparent">
      <CardHeader className="border-b py-3 shrink-0 bg-card/60 backdrop-blur-xs rounded-t-xl">
        <CardTitle className="text-sm uppercase tracking-widest">AI Risk Agent</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-card/20 min-h-0">
        <ScrollArea className="flex-1 p-4 min-h-0">
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

        {/* AGENT THINKING SIGN: Embedded directly at the bottom base of the conversation feed */}
        {isStreaming && (
          <div className="border-t bg-muted/40 px-4 py-3 flex items-center justify-between text-xs font-mono text-muted-foreground shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-150">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              <span>Risk Engine processing multi-variable pathways...</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}