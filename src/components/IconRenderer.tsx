import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export default function IconRenderer({ name, className = '', size = 20 }: IconRendererProps) {
  // Safe dynamic lookup of Lucide Icons
  const SelectedIcon = (LucideIcons as any)[name];

  if (!SelectedIcon) {
    // Elegant generic fallback if name isn't an exact match
    return <LucideIcons.Sparkles className={className} size={size} />;
  }

  return <SelectedIcon className={className} size={size} />;
}
