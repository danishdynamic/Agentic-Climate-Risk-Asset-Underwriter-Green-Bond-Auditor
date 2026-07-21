'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion } from 'framer-motion';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background antialiased selection:bg-emerald-500/10 selection:text-emerald-600">
      
      {/* Structural Interactive Navigation Segment */}
      <Sidebar />
      
      {/* Primary Data Display Workspace Content Engine */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        
        {/* Workspace Dynamic Pipeline Header Control Node */}
        <Topbar />
        
        {/* Hardware-Accelerated Viewport Content Wrapper Container */}
        <motion.main 
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative bg-gradient-to-b from-muted/[0.03] via-transparent to-transparent"
        >
          {/* Subtle institutional ambient grid mesh pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-emerald-500)_0%,transparent_100%)] opacity-[0.015] pointer-events-none" />
          
          {/* Functional Component Slot */}
          <div className="relative z-10 h-full">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}