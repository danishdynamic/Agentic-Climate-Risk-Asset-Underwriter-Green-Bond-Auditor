import React from 'react';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { AgentChat } from '@/components/ui/agent/AgentChat';
import { AgentInput } from '@/components/ui/agent/AgentInput';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function AgentPage() {
  // Bind directly to your updated type-safe Zustand slice action
  const setInputValue = useAppStore((state) => state.setAgentInputValue);

  // Synchronized prompt matrices matching your quantitative backend microservices
  const quickPrompts = [
    "Climate VaR Exposure",
    "Generate Hedge Strategy",
    "Summarize Bond Risks",
    "Explain ESG Score",
    "Transition Pathway Risks",
    "Physical Asset Exposure"
  ];

  return (
    <div className="space-y-8 flex flex-col h-[calc(100vh-80px)]">
      {/* SECTION: Page Title & Context */}
      <section aria-label="Page Header">
        <PageHeader
          title="AI Risk Agent"
          subtitle="Natural language climate intelligence and model interrogation"
        />
      </section>

      {/* SECTION: Conversational Terminal Workspace (70% Chat / 30% Input Split) */}
      <section 
        aria-label="Agent Interactive Interface" 
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start flex-1 min-h-0"
      >
        {/* Scrollable Conversation Streaming Ledger (70% Real Estate) */}
        <div className="xl:col-span-2 h-full min-h-125 flex flex-col">
          <AgentChat />
        </div>

        {/* Input Parameters & Terminal Controls (30% Real Estate) */}
        <div className="w-full sticky top-6">
          <AgentInput />
        </div>
      </section>

      {/* SECTION: Institutional Prompt Templates */}
      <section aria-label="Suggested Prompt Framework" className="space-y-3 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Suggested Inquiries</span>
        </div>
        
        <Card className="rounded-lg border border-border/40 bg-background/40 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2.5">
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