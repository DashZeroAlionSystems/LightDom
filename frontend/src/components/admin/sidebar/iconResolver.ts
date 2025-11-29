import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const resolveLucideIcon = (name: keyof typeof LucideIcons): LucideIcon => {
  const Icon = LucideIcons[name];
  if (Icon) {
    return Icon as LucideIcon;
  }

  return (LucideIcons.Circle ?? LucideIcons.HelpCircle) as LucideIcon;
};
