'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AssetDetails() {
  const selectedBond = useAppStore((state) => state.selectedBond);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'AAA': return 'bg-emerald-500';
      case 'AA': return 'bg-blue-500';
      case 'BBB': return 'bg-yellow-500';
      case 'BB': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  if (!selectedBond) return null;

  return (
    <Card className="rounded-lg border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest">Selected Asset Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Asset Name', value: selectedBond.asset_name },
            { label: 'ISIN', value: selectedBond.isin },
            { label: 'Rating', value: <Badge className={getRatingColor(selectedBond.credit_rating)}>{selectedBond.credit_rating}</Badge> },
            { label: 'Bond Type', value: selectedBond.bond_type },
            { label: 'Coupon', value: `${selectedBond.coupon_rate}%` },
            { label: 'Asset ID', value: selectedBond.id },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase text-muted-foreground">{item.label}</p>
              <div className="font-medium text-sm">{item.value}</div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button size="sm" variant="outline">Analyze</Button>
          <Button size="sm" variant="outline">Underwrite</Button>
          <Button size="sm" variant="outline">Hedge</Button>
        </div>
      </CardContent>
    </Card>
  );
}