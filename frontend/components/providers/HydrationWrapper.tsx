// components/providers/HydrationWrapper.tsx
// Wrapper to prevent hydration mismatch by waiting for client-side mounting

"use client";

import React, { useState, useEffect, ReactNode } from "react";

interface HydrationWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function HydrationWrapper({ children, fallback }: HydrationWrapperProps) {
  const [mounted, setMounted] = useState(() => false);

  useEffect(() => {
    // Use setTimeout to defer state update
    const timeoutId = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Return fallback or null during SSR and initial hydration
  if (!mounted) {
    return fallback || null;
  }

  // Return children after hydration is complete
  return <>{children}</>;
}
