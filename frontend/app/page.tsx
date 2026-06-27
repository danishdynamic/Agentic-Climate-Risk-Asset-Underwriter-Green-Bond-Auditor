'use client'

import React from 'react'
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="p-4">
      <h1>Welcome Page</h1>
      <Button onClick={() => console.log('Clicked!')}>
        Shadcn Button
      </Button>
    </div>
  )
}