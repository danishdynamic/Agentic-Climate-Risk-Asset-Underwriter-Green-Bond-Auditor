'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { AgentQueryInput, ChatMessage } from '@/lib/types';

export function useAgent() {
  const messages = useAppStore((state) => state.agentMessages);
  const threadId = useAppStore((state) => state.threadId);
  const isLoading = useAppStore((state) => state.loading.agent);
  const error = useAppStore((state) => state.errors.agent);

  const setAgentMessages = useAppStore((state) => state.setAgentMessages);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  const queryAgent = async (userQuery: string) => {
    try {
      setLoading('agent', true);
      setError('agent', undefined);

      // Construct and inject user's prompt frame instantaneously
      const userMessage: ChatMessage = { 
        role: 'user', 
        content: userQuery, 
        timestamp: new Date().toISOString() 
      };
      
      const currentMessages = useAppStore.getState().agentMessages;
      setAgentMessages([...currentMessages, userMessage]);

      const data: AgentQueryInput = {
        user_query: userQuery,
        thread_id: threadId || '',
      };

      const response = await api.queryRiskAgent(data);
      
      // Inject assistant stream payload into the chronological conversation tracking slice
      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = useAppStore.getState().agentMessages;
      setAgentMessages([...updatedMessages, assistantMessage]);
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Agent query failed';
      setError('agent', message);
      throw err;
    } finally {
      setLoading('agent', false);
    }
  };

  const injectContext = async (context: any) => {
    if (!threadId) {
      setError('agent', 'No active thread found.');
      return;
    }
    
    try {
      setLoading('agent', true);
      await api.injectContext({ thread_id: threadId, context });
      setError('agent', undefined);
    } catch {
      setError('agent', 'Failed to inject context');
    } finally {
      setLoading('agent', false);
    }
  };

  const clearMessages = () => setAgentMessages([]);

  return { 
    messages, 
    queryAgent, 
    injectContext, 
    clearMessages,
    isLoading, 
    error 
  };
}