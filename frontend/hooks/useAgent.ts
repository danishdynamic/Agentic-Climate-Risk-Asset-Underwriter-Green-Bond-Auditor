'use client';

import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { AgentQueryInput, ChatMessage } from '@/lib/types';

export function useAgent() {
  // Select only the specific slices needed
  const { messages, threadId, isLoading, error } = useAppStore((state) => ({
    messages: state.agentMessages,
    threadId: state.threadId,
    isLoading: state.loading.agent,
    error: state.errors.agent,
  }));

  const { setAgentMessages, setLoading, setError } = useAppStore();

  const queryAgent = async (userQuery: string) => {
    try {
      setLoading('agent', true);
      setError('agent', undefined);

      // Add user message to UI immediately
      const userMessage: ChatMessage = { role: 'user', content: userQuery };
      setAgentMessages([...messages, userMessage]);

      const data: AgentQueryInput = {
        user_query: userQuery,
        thread_id: threadId || '',
      };

      const response = await api.queryRiskAgent(data);
      
      // Add assistant response to UI
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setAgentMessages([...messages, userMessage, assistantMessage]);
      
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