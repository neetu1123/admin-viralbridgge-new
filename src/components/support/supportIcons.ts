import React from 'react';
import {
  User, Briefcase, Users, Upload, CreditCard, MessageSquare, Settings, Flag, HelpCircle, Search, FileText, Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  User, Briefcase, Users, Upload, CreditCard, MessageSquare, Settings, Flag, HelpCircle, Search, FileText, Wallet,
};

export function getSupportIcon(name?: string): LucideIcon {
  return iconMap[name ?? 'HelpCircle'] ?? HelpCircle;
}
