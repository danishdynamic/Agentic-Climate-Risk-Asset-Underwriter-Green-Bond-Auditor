'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, Variants } from 'framer-motion'; 

export default function SettingsPage() {
  
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100 
      } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-5xl mx-auto px-4 py-2"
    >
      <PageHeader
        title="Settings"
        subtitle="Platform Configuration & System Information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Animated Card 1 */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
          <Card className="h-full hover:shadow-md hover:border-primary/20 transition-shadow">
            <CardHeader>
              <CardTitle>Application</CardTitle>
              <CardDescription>Current deployment information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span>Platform</span>
                <Badge>Climate Risk Underwriter</Badge>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-mono text-xs">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Frontend</span>
                <span>Next.js 15</span>
              </div>
              <div className="flex justify-between">
                <span>UI Library</span>
                <span>shadcn/ui</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Animated Card 2 */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
          <Card className="h-full hover:shadow-md hover:border-primary/20 transition-shadow">
            <CardHeader>
              <CardTitle>Backend Services</CardTitle>
              <CardDescription>Connected enterprise services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span>API</span>
                <Badge variant="outline">Configured</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>AI Model</span>
                <Badge variant="outline">Gemini</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <Badge variant="outline">PostgreSQL</Badge>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                System status updates are available from the Dashboard and Topbar health indicators.
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}