'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AgentChat } from '@/components/ui/agent/AgentChat';
import { AgentInput } from '@/components/ui/agent/AgentInput';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Terminal } from 'lucide-react'; 

export default function AgentPage() {
  const threadId = useAppStore((state) => state.threadId);
  const setInputValue = useAppStore((state) => state.setAgentInputValue);

  const quickPrompts = [
    "Climate VaR Exposure",
    "Generate Hedge Strategy",
    "Summarize Bond Risks",
    "Explain ESG Score",
    "Transition Pathway Risks",
    "Physical Asset Exposure"
  ];

  return (
    // FIX: Changed space-y-8 to space-y-6, and added overflow-hidden to prevent body scrolling
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-hidden px-4">
      {/* SECTION: Page Title & Context */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <PageHeader
          title="AI Risk Agent"
          subtitle="Natural language climate intelligence and model interrogation"
        />
        
        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[11px] bg-muted/50 border border-border/60 rounded-md px-3 py-1.5 text-muted-foreground shadow-sm">
          <Terminal className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-foreground/70 font-semibold uppercase tracking-wider">Session:</span>
          <span className="tracking-tight select-all">{threadId ?? 'Initializing...'}</span>
        </div>
      </section>

      {/* SECTION: Conversational Terminal Workspace */}
      {/* FIX: Changed items-start to items-stretch so both columns are identical heights */}
      <section 
        aria-label="Agent Interactive Interface" 
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch flex-1 min-h-0"
      >
        {/* Scrollable Conversation Streaming Ledger */}
        {/* FIX: Added border and background layout rules so the chat fills nicely */}
        <div className="xl:col-span-2 h-full flex flex-col min-h-0 rounded-xl border bg-card/30 overflow-hidden shadow-xs">
          <AgentChat />
        </div>

        {/* Input Parameters & Terminal Controls */}
        {/* FIX: Removed sticky layouts, forced h-full to bind cleanly with AgentChat */}
        <div className="w-full xl:h-full">
          <AgentInput />
        </div>
      </section>

      {/* SECTION: Institutional Prompt Templates */}
      {/* FIX: Added shrink-0 so text generation never squeezes this control block out of sight */}
      <section aria-label="Suggested Prompt Framework" className="space-y-2 pb-2 shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Suggested Inquiries</span>
        </div>
        
        <Card className="rounded-lg border border-border/40 bg-background/40 backdrop-blur-sm shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <Badge
                  key={prompt}
                  variant="outline"
                  onClick={() => setInputValue(prompt)}
                  className="cursor-pointer font-mono text-[11px] rounded-sm border-muted-foreground/20 bg-background/50 hover:bg-muted hover:text-foreground text-muted-foreground px-2.5 py-1 transition-all uppercase tracking-wider select-none active:scale-95"
                >
                  ○ {prompt}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}