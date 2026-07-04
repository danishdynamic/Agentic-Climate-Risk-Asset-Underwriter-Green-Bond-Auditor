'use client';

import { useAppStore } from '@/lib/store';
import { useAssets } from '@/hooks/useAssets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssetTable() {
  const { assets, isLoading } = useAssets();
  const { selectedBond, setSelectedBond } = useAppStore();

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!assets.length) return (
    <Card className="h-64 flex flex-col items-center justify-center border-dashed border-2">
      <Database className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm font-semibold">No assets have been ingested.</p>
      <p className="text-xs text-muted-foreground">Upload your first bond via the Dashboard.</p>
    </Card>
  );

  return (
    <Card className="rounded-lg border-0 shadow-sm overflow-hidden">
      <div className="max-h-[500px] overflow-auto">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0">
            <TableRow>
              <TableHead>ISIN</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow 
                key={asset.id} 
                className={cn(
                  "cursor-pointer transition-all hover:bg-muted/30 hover:shadow-sm",
                  selectedBond?.id === asset.id && "bg-primary/5 border-l-4 border-primary"
                )}
                onClick={() => setSelectedBond(asset)}
              >
                <TableCell className="font-mono text-xs">{asset.isin}</TableCell>
                <TableCell className="font-semibold">{asset.asset_name}</TableCell>
                <TableCell>{asset.credit_rating}</TableCell>
                <TableCell>{asset.coupon_rate}%</TableCell>
                <TableCell>{asset.bond_type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}