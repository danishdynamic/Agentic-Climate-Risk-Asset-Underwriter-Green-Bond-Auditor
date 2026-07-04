'use client';

import React, { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

export function AgentInput() {
  const [query, setQuery] = useState('');
  const { queryAgent } = useAgent();
  const isLoading = useAppStore((state) => state.loading.agent);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    const q = query;
    setQuery('');
    await queryAgent(q);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-card rounded-lg shadow-sm border-0">
      <Textarea 
        placeholder="Ask a question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
        className="min-h-[80px] resize-none"
        disabled={isLoading}
      />
      <Button onClick={handleSend} disabled={isLoading} className="w-full">
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</>
        ) : (
          <><Send size={14} className="mr-2" /> Send Message</>
        )}
      </Button>
    </div>
  );
}