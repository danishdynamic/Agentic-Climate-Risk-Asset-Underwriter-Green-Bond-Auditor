'use client';

import React, { useEffect, useRef } from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, Variants } from 'framer-motion';
import { Cpu, Network, Terminal, HelpCircle, ExternalLink, Activity } from 'lucide-react';

export default function SettingsPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-performance crisp Canvas options matrix simulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Fix haziness: Scale the coordinate space to match physical screen pixels
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale everything up visually so the drawing code units stay uniform
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      
      ctx.clearRect(0, 0, w, h);
      
      // Draw Grid System
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Live Pricing Volatility Curve (Implied Risk Surface)
      ctx.lineWidth = 1.5;
      
      // Secondary Baseline Risk Curve
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.beginPath();
      for (let i = 0; i < w; i++) {
        const x = i;
        const y = h * 0.65 + Math.sin(i * 0.015 + offset * 0.5) * 12 * Math.exp(-i * 0.002);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Primary Volatility Front Curve
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      for (let i = 0; i < w; i++) {
        const x = i;
        const base = h * 0.55 + Math.pow((i - w * 0.3) * 0.05, 2);
        const noise = Math.sin(i * 0.04 + offset) * 2;
        const y = Math.min(h - 10, Math.max(20, base + noise));
        
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Dynamic Node Tracker Crosshair
      const trackingX = w * 0.45;
      const trackingY = h * 0.55 + Math.pow((trackingX - w * 0.3) * 0.05, 2) + Math.sin(trackingX * 0.04 + offset) * 2;
      
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(trackingX, trackingY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp alphanumeric metrics overlay
      ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
      ctx.font = '9px monospace';
      ctx.fillText(`σ_RISK: ${(0.22 + Math.sin(offset) * 0.01).toFixed(4)}`, trackingX + 8, trackingY - 4);

      offset += 0.02;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 120, damping: 20 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto px-4 py-4"
    >
      <div className="border-b border-border/60 pb-4">
        <PageHeader
          title="System Topology & Infrastructure"
          subtitle="Core engine configurations and internal runtime telemetry blocks"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* CARD 1: PLATFORM RUNTIME SPEC */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full rounded-xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500/50" />
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-indigo-500" /> System Spec Matrix
              </CardTitle>
              <CardDescription className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/60">Core Cluster Variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs font-mono">
              {[
                { label: 'Platform Engine', value: 'Climate Risk Underwriter' },
                { label: 'Core Version Cluster', value: 'v1.0.0-PROD_ALPHA' },
                { label: 'Client Layer Framework', value: 'Next.js 15.x (App Router)' },
                { label: 'Interface Protocol', value: 'shadcn/ui // Tailwind CSS' },
                { label: 'State Orchestrator', value: 'Zustand State Architecture' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-border/20 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground/75 text-[11px]">{item.label}</span>
                  <span className="text-foreground font-bold tracking-tight text-[11px]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 2: BACKEND & DATA STREAM ARCHITECTURE */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full rounded-xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500/50" />
            <CardHeader className="pb-3">
              <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Network className="h-3.5 w-3.5 text-purple-500" /> Pipeline Ingestion Mesh
              </CardTitle>
              <CardDescription className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/60">Connected Network Vectors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs font-mono">
              {[
                { label: 'API Gateway Route', value: 'Configured Secure Upstream' },
                { label: 'Intelligence Core', value: 'Gemini Generative Engine' },
                { label: 'Relational Database', value: 'PostgreSQL Vector Cluster' },
                { label: 'Execution Runtime', value: 'Edge Compute Array' },
                { label: 'Ingestion Engine', value: 'Structured Data Matrix (PDF/TXT)' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-border/20 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground/75 text-[11px]">{item.label}</span>
                  <span className="text-foreground font-bold tracking-tight text-[11px]">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 3: REAL-TIME OPTION RISK SURFACE VISUALIZER */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-md overflow-hidden relative flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/50" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 animate-pulse" /> Live Volatility Skew Terminal</span>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold animate-pulse text-emerald-500">LIVE FEED</span>
              </CardTitle>
              <CardDescription className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/60">Active Simulated Underwriting Curve</CardDescription>
            </CardHeader>
            <div className="px-6 py-1 flex-1 min-h-[120px] relative">
              {/* Added standard layout sizing styles to let the relative parent size it smoothly */}
              <canvas ref={canvasRef} className="w-full h-full min-h-[120px] block rounded-lg border border-border/30 bg-background/40" />
            </div>
            <CardContent className="pt-2 pb-4">
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wide leading-relaxed">
                Dynamic option skew tracks implied volatility arrays against core underwritten assets down the pipeline stream.
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* CORE UTILITY PANEL: SYSTEM RESOURCES & DOCS LINKS */}
      <motion.div variants={itemVariants} className="w-full">
        <Card className="rounded-xl border border-border/40 bg-muted/10 overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-border/40 text-xs font-mono">
            
            <div className="space-y-1.5 pr-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" /> Dev Operational Shell
              </h4>
              <p className="text-[11px] text-muted-foreground/80 leading-normal">
                To check live operational pipelines or trace vector exceptions, reference the topbar system diagnostics badge telemetry array.
              </p>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 md:pl-6 pr-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /> Institutional Matrix Manuals
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <a href="#docs" className="text-indigo-500 hover:underline flex items-center gap-1">System Architecture <ExternalLink className="h-2.5 w-2.5" /></a>
                <a href="#models" className="text-indigo-500 hover:underline flex items-center gap-1">Risk Math Specs <ExternalLink className="h-2.5 w-2.5" /></a>
              </div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:pl-6 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              <div>CLUSTER_NODE // PROD-US-EAST-01</div>
              <div>METRIC_STATUS // STABLE_GREEN</div>
              <div>BUFFER_LOAD // 0.0423 ms</div>
            </div>

          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}