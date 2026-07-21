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
import { Loader2, Upload, FileText, Binary } from 'lucide-react';
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
    
    formData.set('bond_type', bondType);
    formData.set('eu_taxonomy_eligible', euTaxonomy);
    formData.set('investment_grade', investmentGrade);
    formData.set('green_bond_compliant', greenBondCompliant);
    formData.append('file', file);

    try {
      await ingestAsset(formData);
      toast.success("Asset profiles and vectors ingested successfully.");
      
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
    <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-xs max-w-4xl mx-auto rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3 bg-muted/20">
        <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/90 flex items-center gap-1.5">
          <Binary className="h-3.5 w-3.5 text-indigo-500" /> Asset Risk Ingestion Engine
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload Section */}
          <div className="space-y-2 p-4 bg-muted/40 rounded-lg border border-dashed border-border/80 group hover:border-border transition-colors">
            <Label className="text-[10px] font-bold uppercase tracking-wider font-mono text-muted-foreground">Asset Source Document payload</Label>
            <Input 
              type="file" 
              accept=".pdf,.txt"
              className="bg-background cursor-pointer text-xs font-mono h-9 border-border/60 file:bg-muted/80 file:text-foreground file:border-0 file:text-[10px] file:font-mono file:uppercase file:tracking-wider file:font-bold file:px-3 file:h-full file:mr-3 hover:file:bg-muted transition-all"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            {file && (
              <p className="flex items-center text-[10px] text-emerald-600 font-mono font-bold mt-1 uppercase tracking-wide">
                <FileText className="mr-1 h-3 w-3 animate-pulse" /> Target payload attached: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-6 text-xs font-mono">
            
            {/* 1. BOND INFORMATION */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 border-b border-border/40 pb-1">1. Instrument Topology</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">ISIN Matrix</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="isin" placeholder="e.g. US1234567890" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Asset Label</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="asset_name" required /></div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground/80">Bond Type</Label>
                  <Select value={bondType} onValueChange={val => setBondType(val || "CORPORATE")}>
                    <SelectTrigger className="h-8 text-xs font-mono bg-background/50 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-mono text-xs">
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="SOVEREIGN">Sovereign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Credit Rating</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="credit_rating" placeholder="e.g. AA-" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Coupon Rate (%)</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="coupon_rate" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Face Value</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="face_value" type="number" step="0.01" required /></div>
                <div className="space-y-1 sm:col-span-2 md:col-span-1"><Label className="text-[10px] text-muted-foreground/80">Maturity Date</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="maturity_date" type="date" required /></div>
              </div>
            </div>

            {/* 2. MARKET METRICS */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 border-b border-border/40 pb-1">2. Market Pricing Vectors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Latest Price</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="latest_price" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Recommended Strike</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="recommended_strike" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Maturity Horizon (Yrs)</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="time_to_maturity" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Duration</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="duration" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Yield Rate</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="yield_rate" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Spread (bps)</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="spread" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Volatility Matrix</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="volatility" type="number" step="0.01" /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Liquidity Index</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="liquidity_score" type="number" step="0.01" /></div>
              </div>
            </div>

            {/* 3. CLIMATE METRICS */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-border/40 pb-1">3. Environmental Exposure Arrays</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Flood Risk Index</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="flood_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Wildfire Density</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="wildfire_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Thermal Stress Level</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="heat_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Aridity/Drought Coefficient</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="drought_score" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Compound Physical Risk</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="overall_physical_risk" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Categorized Stress Risk Level</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="physical_risk_level" placeholder="High, Medium, Low" required /></div>
              </div>
            </div>

            {/* 4. TRANSITION METRICS */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-border/40 pb-1">4. Structural Transition Exposure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Sovereign Domain</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="country" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Industry Segment</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="industry" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Macro Sector</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="sector" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Carbon Volumetric Intensity</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="carbon_intensity" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Transition Boundary Value</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="transition_risk_score" type="number" step="0.01" required /></div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground/80">EU Taxonomy Protocol</Label>
                  <Select value={euTaxonomy} onValueChange={val => setEuTaxonomy(val || "true")}>
                    <SelectTrigger className="h-8 text-xs font-mono bg-background/50 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-mono text-xs">
                      <SelectItem value="true">Eligible Compliant</SelectItem>
                      <SelectItem value="false">Non-Compliant Exclusion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 5. CREDIT METRICS */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 border-b border-border/40 pb-1">5. Actuarial Compliance & Credit VaR Matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Probability of Default (PD)</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="probability_of_default" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Loss Given Default (LGD)</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="loss_given_default" type="number" step="0.0001" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Actuarial Climate VaR</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="climate_var" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Expected Annualized Loss</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="expected_annual_loss" type="number" step="0.01" required /></div>
                <div className="space-y-1"><Label className="text-[10px] text-muted-foreground/80">Integrated Risk Grade</Label><Input className="h-8 text-xs font-mono bg-background/50 border-border/60" name="overall_risk_score" type="number" step="0.01" required /></div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground/80">Investment Standing</Label>
                  <Select value={investmentGrade} onValueChange={val => setInvestmentGrade(val || "true")}>
                    <SelectTrigger className="h-8 text-xs font-mono bg-background/50 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-mono text-xs">
                      <SelectItem value="true">Investment Grade Status</SelectItem>
                      <SelectItem value="false">Speculative Non-Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <Label className="text-[10px] text-muted-foreground/80">Green Bond Verification</Label>
                  <Select value={greenBondCompliant} onValueChange={val => setGreenBondCompliant(val || "true")}>
                    <SelectTrigger className="h-8 text-xs font-mono bg-background/50 border-border/60"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-mono text-xs">
                      <SelectItem value="true">Verified Certified Green</SelectItem>
                      <SelectItem value="false">Standard Asset Protocol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

          </div>

          {/* Submission CTA Terminal Execution */}
          <Button type="submit" className="w-full h-9 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Execution Engineering Active...</>
            ) : (
              <><Upload className="mr-2 h-3.5 w-3.5" /> Commit Ingest Core Payload</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}