'use client';

import React, { useState } from 'react';
import { useIngestion } from '@/hooks/useIngestion';
import { Button } from '@/components/ui/button';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { FileUp, Loader2, CheckCircle2 } from 'lucide-react';

const FIELDS = [
  { key: 'isin', label: 'ISIN', placeholder: 'e.g., US123456789' },
  { key: 'assetName', label: 'Asset Name', placeholder: 'e.g., Green Bond 2026' },
  { key: 'bondType', label: 'Bond Type', placeholder: 'e.g., Sovereign' },
  { key: 'creditRating', label: 'Credit Rating', placeholder: 'e.g., AAA' },
  { key: 'country', label: 'Country', placeholder: 'e.g., USA' },
];

export function UploadCard() {
  const [formData, setFormData] = useState({
    isin: '', assetName: '', bondType: '', creditRating: '', country: '', couponRate: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const { ingestAsset, isLoading } = useIngestion();

  const handleIngestion = async () => {
    // 1. Validation
    if (!formData.isin.trim() || !formData.assetName.trim()) {
      return toast.warning("ISIN and Asset Name are required.");
    }
    if (!file) return toast.warning("Please select a document.");
    if (file.size > 20 * 1024 * 1024) return toast.error("Maximum file size is 20 MB");

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    data.append('file', file);

    try {
      await ingestAsset(data);
      toast.success("Asset ingested successfully.");
      // 2. Reset Form
      setFormData({ isin: '', assetName: '', bondType: '', creditRating: '', country: '', couponRate: '' });
      setFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to ingest asset.");
    }
  };

  return (
    <Card className="rounded-lg shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Asset Ingestion</CardTitle>
        <CardDescription className="text-xs">
          Upload a bond prospectus and metadata for vector indexing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              disabled={isLoading}
              placeholder={field.placeholder}
              value={formData[field.key as keyof typeof formData]}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            />
          </div>
        ))}
        
        <div className="space-y-1.5">
          <Label htmlFor="couponRate">Coupon Rate (%)</Label>
          <Input
            id="couponRate"
            type="number"
            step="0.01"
            disabled={isLoading}
            placeholder="5.25"
            onChange={(e) => setFormData({ ...formData, couponRate: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Upload Prospectus</Label>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="relative" disabled={isLoading} asChild>
              <label>
                Choose File
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
              </label>
            </Button>
            {file && <span className="text-xs flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> {file.name}</span>}
          </div>
        </div>

        <Button onClick={handleIngestion} disabled={isLoading || !file} className="w-full rounded-md mt-4">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <><FileUp className="mr-2 h-4 w-4" size={18} /> Process Asset</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}