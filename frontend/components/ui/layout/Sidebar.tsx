'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useHealth } from '@/hooks/useHealth';
import { 
  LayoutDashboard, FileUp, Search, FileText, BarChart3, 
  ShieldCheck, Bot, Shield, Cpu, Database, Settings, ChevronLeft, Menu
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { health } = useHealth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isHealthy = health?.status === 'healthy';

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Asset Ingestion', href: '/assets', icon: FileUp },
    { name: 'Semantic Search', href: '/search', icon: Search },
    { name: 'Underwriting', href: '/underwriting', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Portfolio Hedging', href: '/hedging', icon: ShieldCheck },
    { name: 'AI Risk Agent', href: '/agent', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="border-r border-border/60 flex flex-col bg-card/70 backdrop-blur-md h-screen relative group select-none"
    >
      {/* Collapse Trigger Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center shadow-2xs hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-50 cursor-pointer"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo Area */}
      <div className="p-5 flex items-center gap-3 overflow-hidden h-[64px]">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shrink-0">
          <Shield className="h-4 w-4" />
        </div>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-mono whitespace-nowrap"
            >
              <h1 className="text-xs font-bold tracking-tight text-foreground/90 uppercase">Climate Risk</h1>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">Underwriter v1.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Separator className="bg-border/40" />
      
      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button 
              key={item.name} 
              variant="ghost"
              className={`w-full justify-start rounded-xl px-3 py-5 transition-all relative font-mono text-xs uppercase ${
                isActive 
                  ? 'bg-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400 font-bold' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`} 
              asChild
            >
              <Link href={item.href} className="flex items-center w-full">
                <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-muted-foreground/70 group-hover:text-foreground'
                } ${isCollapsed ? 'mr-0' : 'mr-3'}`} /> 
                
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate tracking-wider"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>
      
      {/* Dynamic Status Footer */}
      <div className="p-3 border-t border-border/40 space-y-2.5 bg-muted/20 overflow-hidden">
        <StatusItem 
          label="API" 
          icon={<Cpu className="h-3.5 w-3.5" />} 
          isHealthy={isHealthy} 
          isCollapsed={isCollapsed}
        />
        <StatusItem 
          label="Gemini" 
          icon={<Bot className="h-3.5 w-3.5" />} 
          isHealthy={isHealthy} 
          isCollapsed={isCollapsed}
        />
        <StatusItem 
          label="DB" 
          icon={<Database className="h-3.5 w-3.5" />} 
          isHealthy={isHealthy} 
          isCollapsed={isCollapsed}
        />
      </div>
    </motion.aside>
  );
}

interface StatusProps {
  label: string;
  icon: React.ReactNode;
  isHealthy: boolean;
  isCollapsed: boolean;
}

function StatusItem({ label, icon, isHealthy, isCollapsed }: StatusProps) {
  return (
    <div className="flex items-center justify-between text-[11px] font-mono min-h-[18px]">
      <div className="flex items-center gap-2 text-muted-foreground/80">
        {icon}
        {!isCollapsed && <span className="uppercase tracking-wider font-semibold text-[10px]">{label}</span>}
      </div>
      
      {isCollapsed ? (
        <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-emerald-500 shadow-[0_0_6px_rgba(16_185_129_0.5)]" : "bg-rose-500"}`} />
      ) : (
        <span className={`font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-md border ${
          isHealthy 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          {isHealthy ? "ON" : "OFF"}
        </span>
      )}
    </div>
  );
}