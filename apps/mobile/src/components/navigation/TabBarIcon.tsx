import React from 'react';
import { LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  icon: LucideIcon;
  color: string;
  size?: number;
}

export function TabBarIcon({ icon: Icon, color, size = 24 }: TabBarIconProps): JSX.Element {
  return (
    <Icon 
      color={color} 
      size={size} 
      strokeWidth={2}
    />
  );
} 