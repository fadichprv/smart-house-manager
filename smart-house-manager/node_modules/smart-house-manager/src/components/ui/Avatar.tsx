import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps { name?: string; src?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string; }

const Avatar: React.FC<AvatarProps> = ({ name = '?', src, size = 'md', className }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl' };
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={clsx('rounded-full object-cover', sizes[size], className)} />;
  return (
    <div className={clsx('rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0', sizes[size], className)}>
      {initials}
    </div>
  );
};

export default Avatar;
