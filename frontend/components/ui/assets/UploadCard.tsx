'use client';

import React, { useState } from 'react';
import { useIngestion } from '@/hooks/useIngestion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function UploadCard() {
  const { ingestAsset, isLoading } = useIngestion();
  const [file, setFile] = useState<File | null>(null);
  const [euTaxonomy, setEuTaxonomy] = useState<string>("true");
  const [bondType, setBondType] = useState<string>("CORPORATE");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please attach a document file.");
      return;
    }

    const formElement = e.currentTarget;

    const formData = new FormData(formElement);
    formData.set('bond_type', bondType);
    formData.set('eu_taxonomy_eligible', euTaxonomy);
    formData.append('file', file);

    // Debugging loop to inspect multipart form entries
    for (const [k, v] of formData.entries()) {
      console.log(k, v);
    }

    try {
      await ingestAsset(formData);
      toast.success("Asset ingested and vectorized successfully.");

      formElement.reset(); 
      
      setFile(null);
      setBondType("CORPORATE"); 
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to ingest asset.");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Asset Ingestion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase">Asset Document</Label>
            <Input 
              type="file" 
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            {file && (
              <p className="flex items-center text-xs text-muted-foreground">
                <FileText className="mr-1 h-3 w-3" /> Selected: {file.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1"><Label>ISIN</Label><Input name="isin" required /></div>
            <div className="space-y-1"><Label>Asset Name</Label><Input name="asset_name" required /></div>
            
            <div className="space-y-1">
              <Label>Bond Type</Label>
              <Select value={bondType} onValueChange={val => setBondType(val ? val : "")} >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CORPORATE">Corporate</SelectItem>
                  <SelectItem value="FINANCIAL">Financial</SelectItem>
                  <SelectItem value="SOVEREIGN">Sovereign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1"><Label>Credit Rating</Label><Input name="credit_rating" /></div>
            <div className="space-y-1"><Label>Coupon Rate</Label><Input name="coupon_rate" type="number" step="0.001" /></div>
            <div className="space-y-1"><Label>Face Value</Label><Input name="face_value" type="number" /></div>
            <div className="space-y-1"><Label>Industry</Label><Input name="industry" /></div>
            <div className="space-y-1"><Label>Sector</Label><Input name="sector" /></div>
            <div className="space-y-1"><Label>Flood Score</Label><Input name="flood_score" type="number" /></div>
            <div className="space-y-1"><Label>Wildfire Score</Label><Input name="wildfire_score" type="number" /></div>
            <div className="space-y-1"><Label>Heat Score</Label><Input name="heat_score" type="number" /></div>
            <div className="space-y-1"><Label>Drought Score</Label><Input name="drought_score" type="number" /></div>
            <div className="space-y-1"><Label>Carbon Intensity</Label><Input name="carbon_intensity" type="number" /></div>
            
            <div className="space-y-1"><Label>Country</Label><Input name="country" /></div>
            <div className="space-y-1"><Label>Duration</Label><Input name="duration" type="number" step="0.01" /></div>
            <div className="space-y-1"><Label>Yield Rate</Label><Input name="yield_rate" type="number" step="0.01" /></div>
            <div className="space-y-1"><Label>Spread</Label><Input name="spread" type="number" step="0.01" /></div>
            <div className="space-y-1"><Label>Volatility</Label><Input name="volatility" type="number" step="0.01" /></div>
            <div className="space-y-1"><Label>Liquidity Score</Label><Input name="liquidity_score" type="number" step="0.01" /></div>
            
            <div className="space-y-1">
              <Label>EU Taxonomy Eligible</Label>
              <Select value={euTaxonomy} onValueChange={(val) => setEuTaxonomy(val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Ingest Asset</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}