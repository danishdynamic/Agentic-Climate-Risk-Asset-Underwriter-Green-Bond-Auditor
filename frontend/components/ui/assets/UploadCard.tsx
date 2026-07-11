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
  const [bondType, setBondType] = useState<string>("CORPORATE");
  const [euTaxonomy, setEuTaxonomy] = useState<string>("true");
  const [investmentGrade, setInvestmentGrade] = useState<string>("true");
  const [greenBondCompliant, setGreenBondCompliant] = useState<string>("true");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please attach an asset document file.");
      return;
    }

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    // Explicitly append non-native controlled select variables
    formData.set('bond_type', bondType);
    formData.set('eu_taxonomy_eligible', euTaxonomy);
    formData.set('investment_grade', investmentGrade);
    formData.set('green_bond_compliant', greenBondCompliant);
    formData.append('file', file);

    try {
      await ingestAsset(formData);
      toast.success("Asset profiles and vectors ingested successfully.");
      
      // Reset forms and view states safely
      formElement.reset(); 
      setFile(null);
      setBondType("CORPORATE"); 
      setEuTaxonomy("true");
      setInvestmentGrade("true");
      setGreenBondCompliant("true");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to ingest asset.");
    }
  };

  return (
    <Card className="border-0 shadow-sm max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-widest">Asset Risk Ingestion Engine</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* File Upload Section */}
          <div className="space-y-2 p-4 bg-muted/40 rounded-lg border border-dashed">
            <Label className="text-xs font-bold uppercase tracking-wider">Asset Source Document</Label>
            <Input 
              type="file" 
              accept=".pdf,.txt"
              className="bg-background cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            {file && (
              <p className="flex items-center text-xs text-emerald-600 font-medium mt-1">
                <FileText className="mr-1 h-3 w-3" /> Target payload attached: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-6 text-xs">
            
            {/* 1. BOND INFORMATION */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Bond Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>ISIN</Label><Input name="isin" placeholder="e.g. US1234567890" required /></div>
                <div className="space-y-1"><Label>Asset Name</Label><Input name="asset_name" required /></div>
                <div className="space-y-1">
                  <Label>Bond Type</Label>
                  <Select value={bondType} onValueChange={val => setBondType(val || "CORPORATE")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="SOVEREIGN">Sovereign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Credit Rating</Label><Input name="credit_rating" placeholder="e.g. AA-" required /></div>
                <div className="space-y-1"><Label>Coupon Rate (%)</Label><Input name="coupon_rate" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label>Face Value</Label><Input name="face_value" type="number" step="0.01" required /></div>
              </div>
            </div>

            {/* 2. MARKET METRICS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Market Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1"><Label>Latest Price</Label><Input name="latest_price" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label>Recommended Strike</Label><Input name="recommended_strike" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label>Time to Maturity (Yrs)</Label><Input name="time_to_maturity" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Duration</Label><Input name="duration" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label>Yield Rate</Label><Input name="yield_rate" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label>Spread (bps)</Label><Input name="spread" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label>Volatility</Label><Input name="volatility" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label>Liquidity Score</Label><Input name="liquidity_score" type="number" step="0.01" /></div>
              </div>
            </div>

            {/* 3. CLIMATE METRICS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Climate Physical Risk Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Flood Score</Label><Input name="flood_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Wildfire Score</Label><Input name="wildfire_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Heat Score</Label><Input name="heat_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Drought Score</Label><Input name="drought_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Overall Physical Risk</Label><Input name="overall_physical_risk" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Physical Risk Level</Label><Input name="physical_risk_level" placeholder="High, Medium, Low" required /></div>
              </div>
            </div>

            {/* 4. TRANSITION METRICS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Transition Risk Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Country</Label><Input name="country" required /></div>
                <div className="space-y-1"><Label>Industry</Label><Input name="industry" required /></div>
                <div className="space-y-1"><Label>Sector</Label><Input name="sector" required /></div>
                <div className="space-y-1"><Label>Carbon Intensity</Label><Input name="carbon_intensity" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Transition Risk Score</Label><Input name="transition_risk_score" type="number" step="0.01" required /></div>
                <div className="space-y-1">
                  <Label>EU Taxonomy Eligible</Label>
                  <Select value={euTaxonomy} onValueChange={val => setEuTaxonomy(val || "true")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 5. CREDIT METRICS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Comprehensive Credit & Compliance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Probability of Default (PD)</Label><Input name="probability_of_default" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label>Loss Given Default (LGD)</Label><Input name="loss_given_default" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label>Climate VaR</Label><Input name="climate_var" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Expected Annual Loss</Label><Input name="expected_annual_loss" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label>Overall Risk Score</Label><Input name="overall_risk_score" type="number" step="0.01" required /></div>
                
                <div className="space-y-1">
                  <Label>Investment Grade</Label>
                  <Select value={investmentGrade} onValueChange={val => setInvestmentGrade(val || "true")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Green Bond Compliant</Label>
                  <Select value={greenBondCompliant} onValueChange={val => setGreenBondCompliant(val || "true")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          </div>

          {/* Submission CTA */}
          <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Execution Engineering Active...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Ingest Structured Core Asset</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}