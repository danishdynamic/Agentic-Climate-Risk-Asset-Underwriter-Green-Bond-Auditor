'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="space-y-2 pb-2">
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground tracking-wider uppercase font-mono">
          {subtitle}
        </p>
      </div>
      <Separator className="opacity-40" />
    </div>
  );
}