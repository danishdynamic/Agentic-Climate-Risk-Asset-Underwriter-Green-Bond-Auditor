'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, Inbox } from 'lucide-react';

export interface AppFeedbackProps {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function AppFeedback({ 
  isLoading, 
  error, 
  isEmpty = false, 
  emptyMessage = "No Data Available",
  emptyIcon = <Inbox className="h-8 w-8 opacity-50" />,
  children 
}: AppFeedbackProps) {
  
  if (isLoading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-xs uppercase tracking-widest font-medium">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-md border-red-200 bg-red-50/50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-xs font-bold uppercase">System Error</AlertTitle>
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Card className="flex h-64 w-full flex-col items-center justify-center gap-3 border-dashed bg-muted/20 text-muted-foreground p-6 text-center">
        {emptyIcon}
        <span className="text-sm font-medium uppercase tracking-wider">{emptyMessage}</span>
      </Card>
    );
  }

  return <>{children}</>;
}