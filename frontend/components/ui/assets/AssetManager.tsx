'use client';

import React from 'react';
import { AppFeedback } from '@/components/common/AppFeedback';
import { useAssets } from '@/hooks/useAssets';
import { useIngestion } from '@/hooks/useIngestion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AssetManager() {
  const { assets, isLoading: assetsLoading, error: assetsError } = useAssets();
  const { ingestAsset, loading: isIngesting } = useIngestion();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await ingestAsset(formData);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Ingestion Control Section */}
      <section className="border p-4 bg-muted/10 rounded-none">
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Ingest New Asset</h3>
        <form onSubmit={handleUpload} className="flex gap-4 items-end">
          <div className="flex-1">
            <Input type="file" name="file" className="rounded-none h-9 text-xs" />
          </div>
          <Button type="submit" disabled={isIngesting} className="rounded-none h-9 px-6 uppercase text-[10px] tracking-widest">
            {isIngesting ? 'Processing...' : 'Upload & Parse'}
          </Button>
        </form>
      </section>

      {/* 2. Inventory Section */}
      <AppFeedback isLoading={assetsLoading} error={assetsError} isEmpty={assets.length === 0}>
        <div className="border rounded-none">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold">ISIN</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">Name</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-right">Coupon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{asset.isin}</TableCell>
                  <TableCell className="text-xs">{asset.asset_name}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{asset.coupon_rate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AppFeedback>
    </div>
  );
}