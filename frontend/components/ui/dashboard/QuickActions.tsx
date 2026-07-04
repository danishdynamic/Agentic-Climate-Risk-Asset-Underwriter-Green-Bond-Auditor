'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUp, Search, ShieldCheck, Bot, BarChart3 } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { label: 'Upload Asset', icon: FileUp, href: '/assets' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'Audit', icon: ShieldCheck, href: '/underwriting' },
    { label: 'Agent', icon: Bot, href: '/agent' },
    { label: 'Hedge', icon: BarChart3, href: '/hedging' },
  ];

  return (
    <Card className="p-6 rounded-lg border-0">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <Button key={a.label} variant="secondary" className="gap-2 rounded-md" asChild>
            <a href={a.href}>
              <a.icon className="h-4 w-4" /> {a.label}
            </a>
          </Button>
        ))}
      </div>
    </Card>
  );
}