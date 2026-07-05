'use client';

import React from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

export function AgentInput() {
  // Bind directly to global Zustand tracking state to support external prompt injection
  const query = useAppStore((state) => state.agentInputValue);
  const setQuery = useAppStore((state) => state.setAgentInputValue);

  const { queryAgent } = useAgent();
  const isLoading = useAppStore((state) => state.loading.agent);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    
    const currentQuery = query;
    // Evacuate input state instantly to block accidental double-submissions
    setQuery('');
    
    try {
      await queryAgent(currentQuery);
    } catch {
      // Rollback buffer value if your hook doesn't internally cache or fail-gracefully
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-card rounded-lg shadow-sm border border-border/40 bg-background/50 backdrop-blur-sm">
      <Textarea 
        placeholder="Ask a question about climate risk matrix anomalies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
        className="min-h-20 resize-none bg-background font-mono text-xs"
        disabled={isLoading}
      />
      
      <Button 
        onClick={handleSend} 
        disabled={!query.trim() || isLoading} 
        className="w-full font-mono text-xs uppercase tracking-wider font-bold rounded-md"
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