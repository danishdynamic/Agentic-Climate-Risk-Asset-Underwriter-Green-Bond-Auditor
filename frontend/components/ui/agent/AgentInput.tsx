'use client';

import React from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

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
    // FIX: Enhanced container behavior to expand or stack fluidly inside parent sections
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm h-full justify-between">
      <div className="flex-1 flex flex-col gap-1.5 min-h-0">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Input Core Interrogation Query
        </label>
        <Textarea 
          placeholder="Ask a question about climate risk matrix anomalies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          className="flex-1 min-h-32 xl:min-h-0 resize-none bg-background font-mono text-xs p-3 focus-visible:ring-1"
          disabled={isLoading}
        />
      </div>
      
      <Button 
        onClick={handleSend} 
        disabled={!query.trim() || isLoading} 
        className="w-full font-mono text-xs uppercase tracking-wider font-bold rounded-md py-5 shrink-0"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Thinking...
          </>
        ) : (
          <>
            <Send size={12} className="mr-2" /> 
            Send Message
          </>
        )}
      </Button>
    </div>
  );
}