'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Layers, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export function AssetDetails() {
  const selectedBond = useAppStore((state) => state.selectedBond);

  // High-performance institutional grading tokens 
  const getRatingStyles = (rating: string) => {
    const r = rating.toUpperCase();
    if (r.startsWith('A')) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    if (r.startsWith('B') && r.length > 2) return 'text-blue-500 bg-blue-500/10 border-blue-500/20'; // BBB
    if (r.startsWith('B')) return 'text-amber-600 bg-amber-500/10 border-amber-500/20'; // BB, B
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  if (!selectedBond) {
    return (
      <Card className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md p-6 border-dashed text-center h-48 flex flex-col items-center justify-center">
        <Layers className="h-5 w-5 text-muted-foreground/40 mb-2 stroke-[1.5]" />
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">No Asset Target Target</p>
        <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">Select an active ledger row to map terminal parameters.</p>
      </Card>
    );
  }

  return (
    <motion.div
      key={selectedBond.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-md shadow-2xs overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Inspect Profile Token
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-b border-border/40 pb-4">
            {[
              { label: 'Asset Identifier', value: selectedBond.asset_name, isBold: true },
              { label: 'ISIN Vector', value: selectedBond.isin, isMono: true },
              { 
                label: 'Risk Rating', 
                value: (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRatingStyles(selectedBond.credit_rating)}`}>
                    {selectedBond.credit_rating}
                  </span>
                ) 
              },
              { label: 'Bond Instrument', value: selectedBond.bond_type },
              { label: 'Yield Coupon', value: `${selectedBond.coupon_rate}%`, isMono: true },
              { label: 'System GUID', value: selectedBond.id, isMono: true, isMuted: true },
            ].map((item, idx) => (
              <div key={idx} className={item.label === 'Asset Identifier' ? "col-span-2" : "col-span-1"}>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-mono font-semibold">{item.label}</p>
                <div className={`mt-0.5 text-xs truncate tracking-tight text-foreground ${item.isMono ? 'font-mono' : ''} ${item.isBold ? 'font-bold uppercase' : ''} ${item.isMuted ? 'text-muted-foreground/50 text-[10px]' : ''}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Node Operations Management Row */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1">
              <BarChart3 className="h-2.5 w-2.5" /> Core Functions Pipeline
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {['Analyze', 'Underwrite', 'Hedge'].map((action) => (
                <Button 
                  key={action}
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[10px] font-mono uppercase tracking-wider bg-background/50 hover:bg-accent border-border/60 text-foreground transition-all duration-150"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}