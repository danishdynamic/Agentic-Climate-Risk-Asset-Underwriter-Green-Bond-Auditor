'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AgentChat } from '@/components/ui/agent/AgentChat';
import { AgentInput } from '@/components/ui/agent/AgentInput';
import { Terminal } from 'lucide-react'; 

export default function AgentPage() {
  const threadId = useAppStore((state) => state.threadId);

  return (
    // Outer Container Backdrop with soft gradient dynamics
    <div className="space-y-5 flex flex-col h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-hidden px-6 pb-6 bg-linear-to-tr from-emerald-500/2 via-transparent to-sky-500/3">
      
      {/* SECTION: Page Title & Context Header */}
      <section aria-label="Page Header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 border-b border-border/40 pb-3">
        <PageHeader
          title="AI Risk Agent"
          subtitle="Natural language climate intelligence and model interrogation workspace."
        />
        
        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[11px] bg-emerald-500/4 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg px-3 py-1.5 shadow-xs">
          <Terminal className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span className="text-foreground/60 font-semibold uppercase tracking-wider">Session:</span>
          <span className="tracking-tight font-medium select-all text-foreground/80">{threadId ?? 'Initializing...'}</span>
        </div>
      </section>

      {/* SECTION: Conversational Terminal Workspace */}
      <section 
        aria-label="Agent Interactive Interface" 
        className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch flex-1 min-h-0"
      >
        {/* Dynamic Chat Streaming Panel with subtle inner card tinting */}
        <div className="xl:col-span-3 h-full flex flex-col min-h-0 rounded-xl border border-border/50 bg-card/50 backdrop-blur-md shadow-xs overflow-hidden hover:border-emerald-500/20 transition-all duration-300">
          <AgentChat />
        </div>

        {/* Dynamic Control & Parameter Input Sidebar */}
        <div className="xl:col-span-1 w-full h-full min-h-0">
          <AgentInput />
        </div>
      </section>
    </div>
  );
}