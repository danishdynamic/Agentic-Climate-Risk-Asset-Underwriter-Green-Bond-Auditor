'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

export function GreeksTable() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);

  if (!hedgingResult) {
    return (
      <Card className="rounded-xl border-0 shadow-none bg-transparent h-full flex flex-col justify-center items-center py-24 text-center">
        <p className="text-xs text-muted-foreground font-mono">Awaiting quantitative stream parameters...</p>
      </Card>
    );
  }

  const hedge = hedgingResult.hedge_option;
  if (!hedge) return null;

  const parameters = [
    { label: "Delta", value: hedge.delta, description: "Directional sensitivity" },
    { label: "Gamma", value: hedge.gamma, description: "Acceleration of Delta" },
    { label: "Vega", value: hedge.vega, description: "Volatility sensitivity" },
    { label: "Theta", value: hedge.theta, description: "Time decay metric" },
    { label: "Rho", value: hedge.rho, description: "Interest rate sensitivity" },
    { label: "Option Style", value: hedge.option_style, description: "Execution boundary framework" },
  ];

  return (
    <Card className="rounded-xl border-0 shadow-none bg-transparent flex flex-col h-full min-h-0">
      <CardHeader className="border-b border-border/40 pb-3.5 shrink-0 bg-card/40">
        <CardTitle className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-foreground/80">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          Trade Parameters Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-y-auto min-h-0">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-xs z-10">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="text-[10px] font-mono uppercase tracking-wider h-10 px-4">Metric Sensitivity</TableHead>
              <TableHead className="text-[10px] font-mono uppercase tracking-wider h-10 px-4 hidden sm:table-cell">Context Profile</TableHead>
              <TableHead className="text-right text-[10px] font-mono uppercase tracking-wider h-10 px-4">Quant Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((p) => (
              <TableRow key={p.label} className="border-b border-border/30 hover:bg-blue-500/2 transition-colors duration-150">
                <TableCell className="font-mono text-xs font-semibold text-foreground/90 px-4 py-3">{p.label}</TableCell>
                <TableCell className="text-[11px] text-muted-foreground px-4 py-3 hidden sm:table-cell">{p.description}</TableCell>
                <TableCell className="text-right font-mono text-xs font-bold text-blue-600 dark:text-blue-400 px-4 py-3">
                  {typeof p.value === "number" 
                    ? p.value.toFixed(4) 
                    : p.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}