'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TradeParametersTable() {
  const hedgingResult = useAppStore((state) => state.hedgingResult);

  if (!hedgingResult) return null;

  const parameters = [
    { label: 'Instrument', value: hedgingResult.instrument },
    { label: 'Hedge Ratio', value: hedgingResult.hedgeRatio.toString() },
    { label: 'Est. Cost', value: hedgingResult.costEstimate },
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
                <TableCell className="text-right font-mono font-bold">{p.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}