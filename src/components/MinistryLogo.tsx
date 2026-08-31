import React from 'react';
import { Music2 } from 'lucide-react';
import { Organization } from '../types';

interface MinistryLogoProps {
  org: Organization;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14 sm:h-16 sm:w-16',
};

const ICON = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export const MinistryLogo: React.FC<MinistryLogoProps> = ({ org, size = 'md', className = '' }) => {
  const box = `${SIZE[size]} shrink-0 overflow-hidden rounded-2xl ${className}`;

  if (org.logoUrl) {
    return (
      <img
        src={org.logoUrl}
        alt={org.name}
        className={`${box} object-cover ring-1 ring-black/5`}
      />
    );
  }

  return (
    <div className={`${box} flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/20`}>
      <Music2 className={`${ICON[size]} text-white`} />
    </div>
  );
};
