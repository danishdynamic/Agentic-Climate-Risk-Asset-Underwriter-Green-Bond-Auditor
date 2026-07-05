'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Platform Configuration & System Information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>
              Current deployment information.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Platform</span>
              <Badge>Climate Risk Underwriter</Badge>
            </div>

            <div className="flex justify-between">
              <span>Version</span>
              <span>v1.0.0</span>
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

        <Card>
          <CardHeader>
            <CardTitle>Backend Services</CardTitle>
            <CardDescription>
              Connected enterprise services.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>API</span>
              <Badge variant="outline">Configured</Badge>
            </div>

            <div className="flex justify-between">
              <span>AI Model</span>
              <Badge variant="outline">Gemini</Badge>
            </div>

            <div className="flex justify-between">
              <span>Database</span>
              <Badge variant="outline">PostgreSQL</Badge>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground">
              System status updates are available from the Dashboard and
              Topbar health indicators.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}