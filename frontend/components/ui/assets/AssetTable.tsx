'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAssets } from '@/hooks/useAssets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AssetTable() {
  const { assets, isLoading } = useAssets();
  const { selectedBond, setSelectedBond } = useAppStore();

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin h-5 w-5 text-indigo-500" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Querying Ledger Matrix...</span>
      </div>
    );
  }

  if (!assets.length) {
    return (
      <Card className="h-64 flex flex-col items-center justify-center border-dashed border border-border/60 bg-muted/5 rounded-xl">
        <Database className="h-6 w-6 text-muted-foreground/40 mb-2 stroke-[1.5]" />
        <p className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground">Empty Database State</p>
        <p className="text-[10px] font-mono text-muted-foreground/50 mt-1">Upload unstructured core risk configurations to generate analytical arrays.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-0 bg-transparent overflow-hidden">
      <div className="max-h-[540px] overflow-auto">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/50 sticky top-0 z-20 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-b border-border/40">
              <TableHead className="h-9 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">ISIN Vector</TableHead>
              <TableHead className="h-9 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">Asset Label</TableHead>
              <TableHead className="h-9 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">Rating</TableHead>
              <TableHead className="h-9 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">Coupon</TableHead>
              <TableHead className="h-9 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 font-bold">Instrument Class</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset, index) => {
              const isSelected = selectedBond?.id === asset.id;
              return (
                <TableRow
                  key={asset.id}
                  className={cn(
                    "cursor-pointer border-b border-border/30 relative transition-colors duration-150",
                    isSelected ? "hover:bg-indigo-500/[0.08]" : "hover:bg-muted/40"
                  )}
                  onClick={() => setSelectedBond(asset)}
                >
                  <TableCell className="font-mono text-[11px] font-medium text-foreground/90 py-3 relative">
                    {isSelected && (
                      <motion.div 
                        layoutId="activeRowIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" 
                        transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      />
                    )}
                    {asset.isin}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-foreground uppercase tracking-tight py-3">
                    {asset.asset_name}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border",
                      asset.credit_rating.toUpperCase().startsWith('A') 
                        ? "text-emerald-600 bg-emerald-500/5 border-emerald-500/10"
                        : "text-amber-600 bg-amber-500/5 border-amber-500/10"
                    )}>
                      {asset.credit_rating}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground/80 py-3">{asset.coupon_rate}%</TableCell>
                  <TableCell className="font-mono text-[10px] uppercase text-muted-foreground/80 font-semibold py-3">{asset.bond_type}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}