// components/common/Icon.tsx
// Port dari src-vue-original/components/Icon.vue

"use client";

import React from "react";
import { getLucideComponent } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

// Pre-define component outside render to avoid recreation
const IconComponent = React.memo(({ name, className, size }: IconProps) => {
  const LucideComponent = getLucideComponent(name);
  
  if (!LucideComponent) {
    return null;
  }

  return React.createElement(LucideComponent, {
    className: cn("h-4 w-4", className),
    size: size
  });
});

IconComponent.displayName = 'IconComponent';

export function Icon(props: IconProps) {
  return <IconComponent {...props} />;
}
