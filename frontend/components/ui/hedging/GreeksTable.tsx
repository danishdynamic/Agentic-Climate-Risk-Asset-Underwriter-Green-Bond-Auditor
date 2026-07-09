'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function GreeksTable() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);

  if (!hedgingResult) return null;

  // Handles both nested strategy schemas or direct assignments safely
  const hedge = hedgingResult.hedge_option;

  if (!hedge) return null;

  const parameters = [
    { label: "Delta", value: hedge.delta },
    { label: "Gamma", value: hedge.gamma },
    { label: "Vega", value: hedge.vega },
    { label: "Theta", value: hedge.theta },
    { label: "Rho", value: hedge.rho },
    { label: "Option Style", value: hedge.option_style },
  ];

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Trade Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((p) => (
              <TableRow key={p.label}>
                <TableCell className="font-medium">{p.label}</TableCell>
                <TableCell className="text-right font-mono">
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