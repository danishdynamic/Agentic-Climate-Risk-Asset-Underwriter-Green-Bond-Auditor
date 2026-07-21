'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { FileText, ShieldAlert, BarChart3, Globe, Activity } from 'lucide-react';

interface AssetAnalysisPreviewProps {
  rawData: string;
}

export function AssetAnalysisPreview({ rawData }: AssetAnalysisPreviewProps) {
  const isProfileFormat = rawData.includes('=====') || rawData.includes('Executive Summary');

  if (!isProfileFormat) {
    return (
      <p className="text-xs text-muted-foreground mb-3 italic bg-muted/20 p-3 rounded border-l-2 border-primary/50">
        {rawData}
      </p>
    );
  }

  // Regex Parsers for institutional data blocks
  const summaryMatch = rawData.match(/Executive Summary\s*[-]*\s*([\s\S]*?)(====|$)/);
  const summaryText = summaryMatch 
    ? summaryMatch[1].split('BOND INFORMATION')[0].trim() 
    : '';

  const extractValue = (key: string) => {
    const regex = new RegExp(`${key}:\\s*(.*)`, 'i');
    const match = rawData.match(regex);
    return match ? match[1].trim() : '';
  };

  const bondInfo = {
    issuer: extractValue('Issuer'),
    assetName: extractValue('Asset Name'),
    isin: extractValue('ISIN'),
    sector: extractValue('Sector'),
    industry: extractValue('Industry'),
    bondType: extractValue('Bond Type'),
    maturityDate: extractValue('Maturity Date'),
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-3 border border-border/60 rounded-xl overflow-hidden bg-background/40 shadow-xs space-y-4"
    >
      {/* Mini Profile Header Sub-Bar */}
      <div className="bg-linear-to-r from-emerald-500/10 via-background/10 to-transparent p-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 tracking-wider">
            {bondInfo.bondType || 'Parsed Sovereign/Corporate Profile'}
          </span>
        </div>
        {bondInfo.isin && (
          <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
            {bondInfo.isin}
          </span>
        )}
      </div>

      <div className="p-3.5 space-y-4">
        {/* Executive Summary Narrative */}
        {summaryText && (
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText size={12} className="text-primary" />
              Intelligence Brief
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/30">
              {summaryText}
            </p>
          </div>
        )}

        {/* Dynamic Matrix Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2.5 border border-border/40 rounded-lg bg-background/50 space-y-1.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Globe size={11} className="text-emerald-500" /> Compliance Protocols
            </span>
            <div className="flex flex-wrap gap-1">
              {rawData.includes('ICMA') && <Badge variant="outline" className="text-[9px] py-0 px-1 bg-emerald-500/5 text-emerald-600 border-emerald-500/20">ICMA</Badge>}
              {rawData.includes('Climate Bonds') && <Badge variant="outline" className="text-[9px] py-0 px-1 bg-sky-500/5 text-sky-600 border-sky-500/20">CBI</Badge>}
              {rawData.includes('EU Green Bond') && <Badge variant="outline" className="text-[9px] py-0 px-1 bg-indigo-500/5 text-indigo-600 border-indigo-500/20">EU GBS</Badge>}
            </div>
          </div>

          <div className="p-2.5 border border-border/40 rounded-lg bg-background/50 space-y-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert size={11} className="text-amber-500" /> Risk Vectors
            </span>
            <div className="text-[11px] flex items-center gap-3 text-muted-foreground">
              <div>Physical: <span className="font-medium text-foreground">Moderate</span></div>
              <div>Transition: <span className="font-medium text-emerald-500">Low</span></div>
            </div>
          </div>
        </div>

        {/* Core Metadata Specifications Table */}
        {bondInfo.issuer && (
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BarChart3 size={12} className="text-primary" />
              Structured Specifications
            </div>
            <div className="border border-border/40 rounded-lg overflow-hidden bg-background/25">
              <Table>
                <TableBody>
                  <TableRow className="hover:bg-transparent border-border/30">
                    <TableCell className="text-[11px] text-muted-foreground py-1.5 font-medium">Issuer</TableCell>
                    <TableCell className="text-[11px] text-right py-1.5 font-medium text-foreground">{bondInfo.issuer}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-border/30">
                    <TableCell className="text-[11px] text-muted-foreground py-1.5 font-medium">Sector / Industry</TableCell>
                    <TableCell className="text-[11px] text-right py-1.5 text-foreground">
                      {bondInfo.sector} {bondInfo.industry ? `• ${bondInfo.industry}` : ''}
                    </TableCell>
                  </TableRow>
                  {bondInfo.maturityDate && (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell className="text-[11px] text-muted-foreground py-1.5 font-medium">Maturity Target</TableCell>
                      <TableCell className="text-[11px] text-right py-1.5 font-mono font-medium text-foreground">{bondInfo.maturityDate}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}