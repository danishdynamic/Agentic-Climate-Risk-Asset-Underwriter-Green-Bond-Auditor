'use client';

import React from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, SlidersHorizontal, Activity } from 'lucide-react';

const ADVANCED_TOPICS = [
  "Transition Risks",
  "Physical Exposures"
];

export function AgentInput() {
  const query = useAppStore((state) => state.agentInputValue);
  const setQuery = useAppStore((state) => state.setAgentInputValue);
  const { queryAgent } = useAgent();
  const isLoading = useAppStore((state) => state.loading.agent);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    const currentQuery = query;
    setQuery('');
    try {
      await queryAgent(currentQuery);
    } catch (err) {
      setQuery(currentQuery);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-card/40 backdrop-blur-md rounded-xl border border-border/40 shadow-xs justify-between overflow-hidden">
      
      {/* Parameters Controls Stack */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        
        {/* Interrogation Window Section (Grown Larger) */}
        <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={12} className="text-primary" />
            Interrogation Window
          </label>
          <Textarea 
            placeholder="Ask a question about climate risk matrix anomalies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            className="w-full flex-1 min-h-[220px] resize-none bg-background/60 font-mono text-xs p-3 focus-visible:ring-1 border-border/50 rounded-lg"
            disabled={isLoading}
          />
        </div>

        {/* Advanced Directives Section (Made Smaller & High-Density) */}
        <div className="space-y-1.5 pt-2 border-t border-border/30 shrink-0">
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
            <Activity size={10} className="text-emerald-500" /> Advanced Directives
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ADVANCED_TOPICS.map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                onClick={() => setQuery(topic)}
                className="cursor-pointer font-mono text-[9px] rounded-md border-border bg-background/40 hover:bg-secondary/60 text-muted-foreground hover:text-foreground px-2 py-0.5 transition-all uppercase select-none active:scale-95"
              >
                {topic} <span className="text-primary ml-1 opacity-60">+</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Execution Button Action Sub-Bar */}
      <Button 
        onClick={handleSend} 
        disabled={!query.trim() || isLoading} 
        className="w-full font-mono text-xs uppercase tracking-wider font-semibold rounded-lg py-5 shadow-sm shrink-0 transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Thinking...
          </>
        ) : (
          <>
            <Send size={12} className="mr-2" /> 
            Execute Query
          </>
        )}
      </Button>
    </div>
  );
}