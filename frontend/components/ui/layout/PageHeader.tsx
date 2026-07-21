'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="space-y-1.5 pb-2 w-full">
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
        <h1 className="text-lg font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 font-mono">
          {title}
        </h1>
        <p className="text-[10px] text-muted-foreground/80 tracking-widest uppercase font-mono font-medium">
          {subtitle}
        </p>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-border/80 via-border/40 to-transparent" />
    </div>
  );
}