'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useHealth } from '@/hooks/useHealth';
import { 
  LayoutDashboard, 
  FileUp, 
  Search, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Bot, 
  Shield, 
  Cpu, 
  Database 
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { health } = useHealth();
  const isHealthy = health?.status === 'healthy';

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Asset Ingestion', href: '/assets', icon: FileUp },
    { name: 'Semantic Search', href: '/search', icon: Search },
    { name: 'Underwriting', href: '/underwriting', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Portfolio Hedging', href: '/hedging', icon: ShieldCheck },
    { name: 'AI Risk Agent', href: '/agent', icon: Bot },
  ];

  return (
    <aside className="w-72 border-r flex flex-col bg-card h-screen">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-sm font-bold tracking-tight">Climate Risk</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Underwriter v1.0</p>
        </div>
      </div>
      
      <Separator />
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Button 
            key={item.name} 
            variant={pathname === item.href ? "secondary" : "ghost"}
            className="w-full justify-start rounded-md" 
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-4 w-4" /> 
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>
      
      {/* Dynamic Status Footer */}
      <div className="p-4 border-t space-y-4 bg-muted/20">
        <StatusItem 
          label="API" 
          icon={<Cpu className="h-3.5 w-3.5" />} 
          isHealthy={isHealthy} 
        />
        <StatusItem 
          label="Gemini" 
          icon={<Bot className="h-3.5 w-3.5" />} 
          isHealthy={isHealthy} 
        />
        <StatusItem 
          label="Database" 
          icon={<Database className="h-3.5 w-3.5" />} 
          isHealthy={isHealthy} 
        />
      </div>
    </aside>
  );
}

// Helper for status lines
function StatusItem({ label, icon, isHealthy }: { label: string, icon: React.ReactNode, isHealthy: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-medium ${isHealthy ? "text-emerald-600" : "text-red-500"}`}>
        ● {isHealthy ? "Online" : "Offline"}
      </span>
    </div>
  );
}