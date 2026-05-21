import React from 'react';
import * as Icons from 'lucide-react';

interface TechIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const TechIcon: React.FC<TechIconProps> = ({ name, className = '', size = 24 }) => {
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    return <Icons.HelpCircle className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
};
