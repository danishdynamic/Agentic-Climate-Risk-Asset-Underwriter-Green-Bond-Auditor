'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Activity, ListChecks } from 'lucide-react';
import { motion, Variants, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

function CountUpNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 60, damping: 15 });
  const displayValue = useTransform(springValue, (latest) => Math.floor(latest).toLocaleString());
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(0); 
    const controls = animate(motionValue, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [value, motionValue]);

  useEffect(() => {
    return displayValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = latest;
    });
  }, [displayValue]);

  return <span ref={ref}>0</span>;
}

export function DashboardStats() {
  const { stats, isLoading } = useDashboard();

  const metrics = useMemo(() => [
    { 
      label: 'Total Assets', 
      value: stats?.totalAssets || 0, 
      icon: FileText, 
      sub: 'Indexed Systems', 
      isNumeric: true,
      accent: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    { 
      label: 'System Health', 
      value: stats?.isSystemHealthy ? 'ONLINE' : 'DEGRADED', 
      icon: Activity, 
      sub: 'Core Gateway Network', 
      isNumeric: false,
      accent: stats?.isSystemHealthy ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    },
    { 
      label: 'Pending Tasks', 
      value: (stats as any)?.pendingTasks || 0, 
      icon: ListChecks, 
      sub: 'Queued Engine Jobs', 
      isNumeric: true,
      accent: 'text-amber-600 bg-amber-500/10 border-amber-500/20'
    },
  ], [stats]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5 rounded-md border border-border/60 bg-card/40">
            <Skeleton className="h-5 w-5 mb-3 rounded-md" />
            <Skeleton className="h-3 w-20 mb-2 rounded-sm" />
            <Skeleton className="h-7 w-16 rounded-sm" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {metrics.map(({ label, value, icon: Icon, sub, isNumeric, accent }) => (
        <motion.div
          key={label}
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="h-full"
        >
          <Card className="p-5 rounded-xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xs hover:border-border transition-all duration-200 h-full flex flex-col justify-between overflow-hidden relative group">
            
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className={`p-1.5 rounded-lg border text-xs font-mono font-bold ${accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Embedded High-Density Vector Sparkline Graphic */}
                {isNumeric && (
                  <svg className="w-16 h-6 text-muted-foreground/30 stroke-[1.25]" fill="none" viewBox="0 0 60 20">
                    <motion.path 
                      d="M0,15 L10,12 L20,18 L30,5 L40,14 L50,2 L60,10"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </svg>
                )}
              </div>

              <p className="text-[10px] uppercase text-muted-foreground/80 tracking-widest font-mono font-semibold">{label}</p>
              
              <div className="text-2xl font-mono font-bold mt-1 tracking-tight text-foreground flex items-center gap-2">
                {!isNumeric && !isLoading && (
                  <span className={`h-2 w-2 rounded-full animate-pulse ${value === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'}`} />
                )}
                {isNumeric && typeof value === 'number' ? (
                  <CountUpNumber value={value} />
                ) : (
                  <span className="tracking-wide text-sm font-extrabold">{value}</span>
                )}
              </div>
            </div>
            
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-4 border-t border-border/40 pt-2 font-mono font-bold">
               {sub}
            </p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}