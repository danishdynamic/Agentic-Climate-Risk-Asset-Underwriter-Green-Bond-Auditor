'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, Inbox } from 'lucide-react';

export interface AppFeedbackProps {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  children: React.ReactNode;
}

export function AppFeedback({ isLoading, error, isEmpty = false, children }: AppFeedbackProps) {
  
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-xs uppercase tracking-widest font-medium">Loading Data...</span>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <Alert variant="destructive" className="rounded-none border-red-200 bg-red-50/50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold uppercase">System Error</AlertTitle>
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <Card className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-none border-dashed bg-muted/20 text-muted-foreground">
        <Inbox className="h-8 w-8 opacity-50" />
        <span className="text-sm font-medium uppercase tracking-wider">No Data Available</span>
      </Card>
    );
  }

  // 4. Default / Success State
  return <>{children}</>;
}