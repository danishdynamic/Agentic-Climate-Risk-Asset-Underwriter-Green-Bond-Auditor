'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertTriangle, ListChecks } from 'lucide-react';
import { motion, Variants, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

// --- SUB-COMPONENT: Rolling Number Counter for Metrics ---
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

// --- MAIN COMPONENT ---
export function DashboardStats() {
  const { stats, isLoading } = useDashboard();

  const metrics = useMemo(() => [
    { label: 'Total Assets', value: stats?.totalAssets || 0, icon: FileText, sub: 'Indexed', isNumeric: true },
    { label: 'System Health', value: stats?.isSystemHealthy ? '🟢 Good' : '🔴 Warning', icon: AlertTriangle, sub: 'Status', isNumeric: false },
    { label: 'Pending Tasks', value: (stats as any)?.pendingTasks || 0, icon: ListChecks, sub: 'In Queue', isNumeric: true },
  ], [stats]);

  // Framer motion layout grid staggered animation variations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  // Loading State with matching layout boundaries
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 rounded-lg border-0 bg-card/50">
            <Skeleton className="h-5 w-5 mb-3 rounded-md" />
            <Skeleton className="h-3 w-20 mb-2 rounded-sm" />
            <Skeleton className="h-8 w-16 rounded-sm" />
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
      {metrics.map(({ label, value, icon: Icon, sub, isNumeric }) => (
        <motion.div
          key={label}
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="h-full"
        >
          <Card className="p-6 rounded-lg transition-shadow hover:shadow-md cursor-pointer border bg-card/60 backdrop-blur-xs h-full flex flex-col justify-between">
            <div>
              <Icon className="h-5 w-5 text-primary mb-3" />
              <p className="text-[10px] uppercase text-muted-foreground tracking-widest font-mono">{label}</p>
              
              <div className="text-3xl font-mono font-bold mt-1 text-foreground">
                {isNumeric && typeof value === 'number' ? (
                  <CountUpNumber value={value} />
                ) : (
                  value
                )}
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground mt-3 border-t pt-2 font-mono">
               {sub}
            </p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}