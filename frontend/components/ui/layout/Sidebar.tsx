'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useHealth } from '@/hooks/useHealth';
import { LayoutDashboard, FileUp, Search, FileText, BarChart3, ShieldCheck, Bot } from 'lucide-react';

export function Sidebar() {
  const { health } = useHealth();
  const isHealthy = health?.status === 'healthy';

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Asset Ingestion', href: '/assets', icon: FileUp },
    { name: 'Semantic Search', href: '/search', icon: Search },
    { name: 'Underwriting', href: '/underwriting', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Hedging', href: '/hedging', icon: ShieldCheck },
    { name: 'AI Agent', href: '/agent', icon: Bot },
  ];

  return (
    <aside className="w-64 border-r flex flex-col bg-background h-screen">
      <div className="p-4 font-bold text-sm tracking-tighter">CLIMATE RISK UNDERWRITER</div>
      <Separator />
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Button key={item.name} variant="ghost" className="w-full justify-start rounded-none" asChild>
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" /> {item.name}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t text-[10px] uppercase font-bold tracking-widest">
        Backend Status: <Badge variant="outline" className={isHealthy ? "text-emerald-600" : "text-red-600"}>
          {isHealthy ? "ONLINE" : "OFFLINE"}
        </Badge>
      </div>
    </aside>
  );
}