'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';

export function AppProfileOverview() {
  // Kinetic word stagger configurations
  const terminalText = "CLIMATE_RISK_UNDERWRITER_V1 // INITIALIZED // ASSET_LOCK_READY";

  return (
    <Card className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden relative group p-6">
      {/* Animated Subtle Ambient Light Wave */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] via-indigo-500/[0.01] to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
        
        {/* Core Description Copy */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">
            <Terminal className="h-3.5 w-3.5 animate-pulse" />
            <motion.span>
              {terminalText.split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 4, delay: index * 0.03, ease: "linear" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-foreground uppercase font-mono">
            Automated Environmental Underwriting & Analytical Hedging Matrix
          </h2>

          <p className="text-xs text-muted-foreground/90 font-mono leading-relaxed max-w-3xl">
            An institutional-grade risk parsing node built to transform unstructured climate intelligence into actionable bond assessments. This engine processes real-world environmental exposures, validates municipal debt compliance structures, generates real-time value-at-risk calculations, and builds automated options-based hedging playbooks to insulate portfolio value against macro climate stress.
          </p>

          <div className="flex flex-wrap gap-4 text-[10px] font-mono pt-2">
            <div className="flex items-center gap-1.5 text-foreground/80 bg-muted/60 border border-border/60 rounded-md px-2.5 py-1">
              <Cpu className="h-3 w-3 text-emerald-500" />
              <span>UNDERWRITING ENGINE: PASS/FAIL EVALUATION</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground/80 bg-muted/60 border border-border/60 rounded-md px-2.5 py-1">
              <ShieldAlert className="h-3 w-3 text-amber-500" />
              <span>RISK PROTOCOLS: ACTIVE COCHRAN SIMULATION</span>
            </div>
          </div>
        </div>

        {/* 3D-Like Vector Wireframe Diagram Engine (Framer Driven SVG) */}
        <div className="lg:col-span-1 h-36 flex items-center justify-center bg-muted/20 rounded-lg border border-border/50 overflow-hidden relative">
          <motion.svg 
            viewBox="0 0 200 100" 
            className="w-full h-full max-w-[240px] text-emerald-500/20 dark:text-emerald-400/10 stroke-[0.75]"
            fill="none"
          >
            {/* Geometric Lattice Matrix */}
            {[0, 20, 40, 60, 80, 100].map((y, i) => (
              <motion.line 
                key={`h-${i}`} 
                x1="0" y1={y} x2="200" y2={y} 
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
            {[0, 40, 80, 120, 160, 200].map((x, i) => (
              <line key={`v-${i}`} x1={x} y1="0" x2={x} y2="100" />
            ))}

            {/* Simulated 3D Topographical Data Arc */}
            <motion.path
              d="M 10,80 Q 40,20 80,60 T 150,30 T 190,70"
              stroke="var(--color-emerald-500, oklch(0.60 0.16 150))"
              strokeWidth="1.5"
              className="text-emerald-600 dark:text-emerald-400"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
            />

            {/* Radar Sweep Scanning Line */}
            <motion.line
              x1="0" y1="0" x2="0" y2="100"
              stroke="var(--color-indigo-500, oklch(0.55 0.18 250))"
              strokeWidth="1"
              className="text-indigo-500"
              animate={{ x: [0, 200, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </motion.svg>
          <div className="absolute top-2 right-2 text-[8px] font-mono text-muted-foreground bg-background/80 border px-1 rounded uppercase tracking-widest select-none">
            Live Vector Mesh
          </div>
        </div>

      </div>
    </Card>
  );
}