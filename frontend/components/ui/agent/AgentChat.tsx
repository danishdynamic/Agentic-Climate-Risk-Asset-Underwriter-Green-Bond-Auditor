'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Bot, User } from 'lucide-react';

const SUGGESTED_QUERIES = [
  "Climate VaR Exposure",
  "Generate Hedge Strategy",
  "Summarize Bond Risks",
  "Explain ESG Score",
];

export function AgentChat() {
  const messages = useAppStore((state) => state.agentMessages);
  const isStreaming = useAppStore((state) => state.loading.agent);
  const setInputValue = useAppStore((state) => state.setAgentInputValue);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ 
      behavior: isStreaming ? 'auto' : 'smooth' 
    });
  }, [messages, isStreaming]);

  return (
    <Card className="flex flex-col h-full border-0 shadow-none min-h-0 bg-transparent">
      <CardHeader className="border-b border-border/40 py-3.5 shrink-0 bg-card/80 backdrop-blur-md">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80">
          <Bot className="h-4 w-4 text-primary" />
          Interactive Response Feed
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-background/10 min-h-0">
        <ScrollArea className="flex-1 p-5 min-h-0">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              /* Upgraded Institutional Empty State Preview Workspace */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto space-y-6 pt-8 text-center"
              >
                <div className="inline-flex p-3 bg-primary/5 border border-primary/10 rounded-full text-primary shadow-xs">
                  <Bot size={24} className="animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-sm tracking-tight text-foreground">AI Climate Risk Co-Pilot</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Interrogate quantitative financial models, analyze physical exposures, and evaluate ESG metrics.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4">
                  <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Quick-Launch Analysis Templates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {SUGGESTED_QUERIES.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setInputValue(prompt)}
                        className="p-3 text-xs rounded-lg border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 active:scale-[0.98] text-muted-foreground hover:text-foreground transition-all duration-200 shadow-2xs font-medium text-left"
                      >
                        {prompt} →
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Scrollable Conversation Stream */
              <div className="space-y-5 max-w-4xl mx-auto">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'items-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="h-7 w-7 border border-emerald-500/20 bg-emerald-500/5 shrink-0 shadow-2xs mt-0.5">
                        <AvatarFallback className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">AI</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed shadow-2xs transition-colors duration-200 ${
                      msg.role === 'user' 
                        ? 'bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 text-sky-900 dark:text-sky-300 font-medium rounded-br-none' 
                        : 'bg-emerald-50/45 dark:bg-emerald-950/10 border border-emerald-500/15 text-foreground rounded-bl-none max-w-[85%]'
                    } whitespace-pre-wrap`}>
                      {msg.content}
                    </div>

                    {msg.role === 'user' && (
                      <Avatar className="h-7 w-7 border border-sky-500/20 bg-sky-500/5 shrink-0 shadow-2xs mt-0.5">
                        <AvatarFallback className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                          <User size={12} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Dynamic Thinking Matrix Indicator Bar */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0 backdrop-blur-xs"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                <span>Risk Engine processing multivariable pathways...</span>
              </div>
              <div className="flex gap-1 items-center">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}